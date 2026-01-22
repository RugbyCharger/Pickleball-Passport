/**
 * Booking Router
 *
 * tRPC procedures for booking-related operations including:
 * - Payment intent creation
 * - Booking management
 * - Referral code validation
 */

import { z } from 'zod'
import { router, guestProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createPaymentIntent as createStripePaymentIntent } from '@/lib/stripe/stripe-service'
import Stripe from 'stripe'
import {
  calculateInstallments,
  calculateFullPaymentDiscount,
  calculateInstallmentDates,
} from '@/lib/utils/installment-calculator'
import { createStripeCustomerWithRetry } from '@/lib/stripe/create-customer'
import { createBookingWithPayments } from '@/lib/db/transactions'
import { differenceInDays } from 'date-fns'
import { bookingLogger, logError, logStripeError, emailLogger, giftLogger } from '@/lib/logger'
import {
  ACCOMMODATION_TIER_PRICING,
  PARTNER_TIER_DISCOUNTS,
  CANCELLATION_PROCESSING_FEE,
  REFUND_POLICY,
  INSTALLMENT_CONFIG,
  PARTNER_POINTS_CONFIG,
  calculateGuestReferralPoints,
} from '@/lib/config/business-constants'
import { ReferralEventType, GuestReferralStatus } from '@prisma/client'
import { sendEmail } from '@/lib/email/sendgrid'
import { generateGuestReferralBookingEmail } from '@/lib/email/templates/guest-referral-booking'

const REFERRAL_COOKIE_NAME = 'referral_code'

// Lazy-initialize Stripe client to avoid build-time errors
let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeClient) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      timeout: 10000, // E4-S6: 10 second timeout for Stripe API calls
    })
  }
  return stripeClient
}

/**
 * Input schema for creating a payment intent
 */
const createPaymentIntentInput = z.object({
  packageId: z.string().cuid(),
  duration: z.number().refine((d) => [7, 10, 14, 21].includes(d), {
    message: 'Duration must be 7, 10, 14, or 21 days',
  }),
  accommodationTier: z.enum(['LUXURY', 'ULTRA_LUXURY', 'VILLA']),
  addOnIds: z.array(z.string().cuid()).optional().default([]),
  tripId: z.string().cuid().optional(),
  referralCode: z.string().optional(),
  paymentPlan: z.enum(['FULL', 'INSTALLMENT_4', 'FINANCING']).optional().default('FULL'),
  // E4-S13: Multi-currency support
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional().default('USD'),
})

// Accommodation tier pricing imported from @/lib/config/business-constants

/**
 * Generate a unique booking reference
 * Format: PBP-{YEAR}-{6-DIGIT-RANDOM}
 */
function generateBookingReference(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000) // 6-digit random
  return `PBP-${year}-${random}`
}

export const bookingRouter = router({
  /**
   * Create Payment Intent
   *
   * Creates a booking record and Stripe payment intent for the selected configuration.
   * This endpoint:
   * 1. Validates the package and selections
   * 2. Calculates the total price
   * 3. Validates and applies referral code (if provided)
   * 4. Creates a booking record in the database (status: PENDING_PAYMENT)
   * 5. Creates a Stripe payment intent
   * 6. Returns the client secret for frontend payment
   */
  createPaymentIntent: guestProcedure
    .input(createPaymentIntentInput)
    .mutation(async ({ ctx, input }) => {
      const { packageId, duration, accommodationTier, addOnIds, tripId, referralCode, paymentPlan, currency } = input

      // 1. Validate package exists and is active
      const pkg = await ctx.db.package.findFirst({
        where: { id: packageId, isActive: true },
        select: {
          id: true,
          name: true,
          basePrice: true,
          durationOptions: true,
        },
      })

      if (!pkg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found or is no longer available',
        })
      }

      // Validate duration is supported by package
      if (!pkg.durationOptions.includes(duration)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This package does not support ${duration}-day duration`,
        })
      }

      // 2. Validate trip if specified
      if (tripId) {
        const trip = await ctx.db.trip.findFirst({
          where: { id: tripId, isActive: true },
          select: {
            id: true,
            capacity: true,
            currentBookings: true,
            isActive: true,
          },
        })

        if (!trip || !trip.isActive) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found or is no longer available',
          })
        }

        // P1-004: Count both confirmed and recent pending bookings to prevent race conditions
        // Pending bookings older than 30 minutes are considered abandoned
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        const activeReservations = await ctx.db.booking.count({
          where: {
            tripId,
            OR: [
              { status: 'CONFIRMED' },
              {
                status: 'PENDING_PAYMENT',
                createdAt: { gt: thirtyMinutesAgo },
              },
            ],
          },
        })

        if (activeReservations >= trip.capacity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This trip is fully booked',
          })
        }
      }

      // 3. Calculate base price (adjusted for duration)
      // 14 days is the baseline - scale proportionally
      const basePrice = Math.round(pkg.basePrice * (duration / 14))

      // 4. Calculate accommodation tier pricing
      const accommodationPrice = ACCOMMODATION_TIER_PRICING[accommodationTier] || 0

      // 5. Fetch and calculate add-ons total
      let addOnsTotal = 0
      if (addOnIds.length > 0) {
        const addOns = await ctx.db.addOn.findMany({
          where: {
            id: { in: addOnIds },
            isActive: true,
          },
          select: {
            id: true,
            thPrice: true,
          },
        })

        if (addOns.length !== addOnIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some add-ons are not available',
          })
        }

        addOnsTotal = addOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
      }

      // 6. Calculate subtotal (before discount)
      const subtotal = basePrice + accommodationPrice + addOnsTotal

      // 7. Epic 10 - US-003: Validate referral code and calculate discount
      // Support both partner and guest referral codes
      // Manual code takes precedence over cookie
      let discount = 0
      let referredByPartnerId: string | undefined
      let guestReferralCode: string | undefined
      let guestReferrerUserId: string | undefined

      // Epic 10 - US-007: Extract UTM params from cookies
      let utmSource: string | null = null
      let utmMedium: string | null = null
      let utmCampaign: string | null = null

      // Get referral code from cookie if no manual code provided
      // Manual code takes precedence over cookie
      let effectiveReferralCode: string | undefined
      if (referralCode) {
        effectiveReferralCode = referralCode.toUpperCase()
      } else {
        const cookieHeader = ctx.headers.get('cookie')
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').map(c => c.trim())
          for (const cookie of cookies) {
            const [name, value] = cookie.split('=')
            if (name === REFERRAL_COOKIE_NAME && value) {
              effectiveReferralCode = decodeURIComponent(value).toUpperCase()
            }
            // Extract UTM params from cookies
            if (name === 'utm_source' && value) {
              utmSource = decodeURIComponent(value)
            }
            if (name === 'utm_medium' && value) {
              utmMedium = decodeURIComponent(value)
            }
            if (name === 'utm_campaign' && value) {
              utmCampaign = decodeURIComponent(value)
            }
          }
        }
      }

      // Also parse cookies for UTM params even if we have a manual referral code
      if (referralCode) {
        const cookieHeader = ctx.headers.get('cookie')
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').map(c => c.trim())
          for (const cookie of cookies) {
            const [name, value] = cookie.split('=')
            if (name === 'utm_source' && value) {
              utmSource = decodeURIComponent(value)
            }
            if (name === 'utm_medium' && value) {
              utmMedium = decodeURIComponent(value)
            }
            if (name === 'utm_campaign' && value) {
              utmCampaign = decodeURIComponent(value)
            }
          }
        }
      }

      if (effectiveReferralCode) {
        // Check both partner and guest referral codes in parallel
        const [partner, guestUser] = await Promise.all([
          ctx.db.partnerProfile.findUnique({
            where: { referralCode: effectiveReferralCode },
            select: {
              id: true,
              tier: true,
              userId: true,
            },
          }),
          ctx.db.user.findUnique({
            where: { referralCode: effectiveReferralCode },
            select: {
              id: true,
              email: true,
            },
          }),
        ])

        if (partner) {
          // Partner referral - apply discount based on tier
          const discountRate = PARTNER_TIER_DISCOUNTS[partner.tier as keyof typeof PARTNER_TIER_DISCOUNTS] || 0
          discount = Math.round(subtotal * discountRate)
          referredByPartnerId = partner.id
        } else if (guestUser) {
          // Guest referral - no discount, just attribution
          guestReferralCode = effectiveReferralCode
          guestReferrerUserId = guestUser.id
        }
        // Note: If neither partner nor guest code is valid, we silently ignore
        // This matches the expected behavior from the acceptance criteria
      }

      // 8. E4-S6: Validate 70-day requirement for installment plans
      if (paymentPlan === 'INSTALLMENT_4') {
        if (!tripId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Installment plans require a trip to be selected',
          })
        }

        const trip = await ctx.db.trip.findUnique({
          where: { id: tripId },
          select: { startDate: true },
        })

        if (trip) {
          const daysUntilTrip = differenceInDays(trip.startDate, new Date())
          if (daysUntilTrip < INSTALLMENT_CONFIG.MIN_DAYS_BEFORE_TRIP) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Installment plans require trips starting at least ${INSTALLMENT_CONFIG.MIN_DAYS_BEFORE_TRIP} days from today`,
            })
          }
        }
      }

      // 9. Calculate final total and apply payment plan discount (if applicable)
      let totalPrice = subtotal - discount

      // Apply 2% discount for full payment
      if (paymentPlan === 'FULL') {
        const discountCalc = calculateFullPaymentDiscount(totalPrice)
        totalPrice = discountCalc.finalAmount
      }

      // Calculate first installment amount for installment plan (for payment intent)
      const paymentAmount = paymentPlan === 'INSTALLMENT_4'
        ? calculateInstallments(totalPrice).first // 50% for first installment
        : totalPrice

      // 10. Get user info from Clerk
      const user = ctx.user!
      const guestEmail = user.emailAddresses[0]?.emailAddress || ''
      const guestName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest'

      // 11. E4-S6: Create Stripe customer if installment plan (with retry logic)
      let stripeCustomerId: string | null = null
      if (paymentPlan === 'INSTALLMENT_4') {
        const customer = await createStripeCustomerWithRetry({
          email: guestEmail,
          name: guestName,
          userId: user.id,
          bookingId: 'pending', // Will be updated after booking is created
        }, 3) // Max 3 retries with exponential backoff

        if (!customer) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unable to create customer for installment plan. Please try again or select "Pay in Full".',
          })
        }

        stripeCustomerId = customer.id
      }

      // 12. Generate booking reference
      const bookingReference = generateBookingReference()

      // 13. E4-S6: For installment plans, calculate payment records BEFORE creating booking
      let paymentRecordsData: Array<{
        amountCents: number
        dueDate: Date
        percentage: number
        installmentNumber: number
        status: 'PENDING' | 'PAID' | 'FAILED'
      }> = []

      if (paymentPlan === 'INSTALLMENT_4' && tripId) {
        // Get trip to calculate installment dates
        const trip = await ctx.db.trip.findUnique({
          where: { id: tripId },
          select: { startDate: true },
        })

        if (trip) {
          const installmentAmounts = calculateInstallments(totalPrice)
          const installmentDates = calculateInstallmentDates(trip.startDate)

          paymentRecordsData = [
            {
              amountCents: installmentAmounts.first,
              dueDate: installmentDates.first,
              percentage: 50,
              installmentNumber: 1,
              status: 'PENDING' as const, // Will be updated to COMPLETED after first payment succeeds
            },
            {
              amountCents: installmentAmounts.second,
              dueDate: installmentDates.second,
              percentage: 25,
              installmentNumber: 2,
              status: 'PENDING' as const,
            },
            {
              amountCents: installmentAmounts.third,
              dueDate: installmentDates.third,
              percentage: 15,
              installmentNumber: 3,
              status: 'PENDING' as const,
            },
            {
              amountCents: installmentAmounts.fourth,
              dueDate: installmentDates.fourth,
              percentage: 10,
              installmentNumber: 4,
              status: 'PENDING' as const,
            },
          ]
        }
      }

      // 14. Create booking record (with payment records if installment plan)
      const bookingData = {
        bookingReference,
        userId: user.id,
        packageId,
        tripId,
        status: 'PENDING_PAYMENT' as const,
        duration,
        accommodationTier,
        basePrice,
        accommodationPrice,
        addOnsTotal,
        totalPrice,
        currency, // E4-S13: Store currency for booking
        referredBy: referredByPartnerId || null,
        paymentPlan,
        stripeCustomerId,
        // Epic 10 - US-007: Store UTM params
        utmSource,
        utmMedium,
        utmCampaign,
      }

      // E4-S6: Use transaction wrapper for installment plans to ensure atomicity
      const booking = paymentPlan === 'INSTALLMENT_4' && paymentRecordsData.length > 0
        ? (await createBookingWithPayments(bookingData, paymentRecordsData)).booking
        : await ctx.db.booking.create({ data: bookingData })

      // 15. Create booking add-on records
      if (addOnIds.length > 0) {
        const addOns = await ctx.db.addOn.findMany({
          where: { id: { in: addOnIds } },
          select: { id: true, thPrice: true },
        })

        await ctx.db.bookingAddOn.createMany({
          data: addOns.map((addOn) => ({
            bookingId: booking.id,
            addOnId: addOn.id,
            quantity: 1,
            price: addOn.thPrice,
          })),
        })
      }

      // 16. Create Stripe payment intent (first installment or full amount)
      try {
        // E4-S11: For financing, use Affirm payment method with card as fallback
        // Affirm requirements: USD/CAD currency, minimum $50 USD, US/Canada only
        const paymentMethodTypes = paymentPlan === 'FINANCING' ? ['affirm', 'card'] : undefined

        const paymentIntent = await createStripePaymentIntent({
          amount: paymentAmount, // E4-S6: First installment or full amount
          bookingId: booking.id,
          guestEmail,
          guestName,
          currency: currency.toLowerCase(), // E4-S13: Pass currency to Stripe
          // E4-S11: Use explicit payment method types for financing
          ...(paymentMethodTypes && { paymentMethodTypes }),
          // E4-S6: For installment plans, attach customer and save payment method
          ...(paymentPlan === 'INSTALLMENT_4' && stripeCustomerId && {
            customerId: stripeCustomerId,
            setupFutureUsage: 'off_session' as const,
          }),
          metadata: {
            bookingReference,
            packageId,
            userId: user.id,
            duration: duration.toString(),
            accommodationTier,
            referralCode: referralCode || '',
            paymentPlan, // E4-S6: Store payment plan in metadata
            totalPrice: totalPrice.toString(), // E4-S6: Store total for reference
            currency, // E4-S13: Store currency in metadata
            ...(paymentPlan === 'INSTALLMENT_4' && {
              installmentNumber: '1',
              installmentOf: '4',
              stripeCustomerId: stripeCustomerId || '',
            }),
          },
        })

        // 17. Create payment record (first installment or full amount)
        await ctx.db.payment.create({
          data: {
            bookingId: booking.id,
            amount: paymentAmount, // E4-S6: First installment or full amount
            currency, // E4-S13: Store currency for payment
            status: 'PENDING',
            stripePaymentIntentId: paymentIntent.paymentIntentId,
            stripeCustomerId, // E4-S6: Store customer ID for installment plans
          },
        })

        // 18. Create partner referral record if applicable
        if (referredByPartnerId) {
          // Calculate points earned: 100 points per $1,000
          // Min: 500 points, Max: 2,000 points
          const basePoints = Math.floor(totalPrice / 100000) * 100 // $1,000 = 100k cents
          const pointsEarned = Math.min(Math.max(basePoints, 500), 2000)

          await ctx.db.partnerReferral.create({
            data: {
              partnerId: referredByPartnerId,
              bookingId: booking.id,
              pointsEarned,
            },
          })

          // Update partner points
          await ctx.db.partnerProfile.update({
            where: { id: referredByPartnerId },
            data: {
              passportPoints: {
                increment: pointsEarned,
              },
            },
          })
        }

        // 19. Epic 10 - US-003: Create guest referral record if applicable
        if (guestReferrerUserId && guestReferralCode) {
          try {
            // Calculate points: 1000 pts for < $15K, 1500 pts for >= $15K
            const pointsEarned = calculateGuestReferralPoints(totalPrice)

            // Create ReferralEvent with type BOOKING
            await ctx.db.referralEvent.create({
              data: {
                referralCode: guestReferralCode,
                eventType: ReferralEventType.BOOKING,
                userId: user.id, // The booking guest's user ID
              },
            })

            // Create GuestReferral record with status BOOKED
            await ctx.db.guestReferral.create({
              data: {
                referrerUserId: guestReferrerUserId,
                referredUserId: user.id,
                referralCode: guestReferralCode,
                status: GuestReferralStatus.BOOKED,
                pointsEarned,
              },
            })

            // Update referrer's points balance
            const updatedReferrer = await ctx.db.user.update({
              where: { id: guestReferrerUserId },
              data: {
                referralPointsBalance: { increment: pointsEarned },
              },
              select: {
                email: true,
                referralPointsBalance: true,
              },
            })

            // Update booking with the referral code
            await ctx.db.booking.update({
              where: { id: booking.id },
              data: { referredBy: guestReferralCode },
            })

            // Get trip dates for email
            let tripStartDate: string | undefined
            let tripEndDate: string | undefined
            if (tripId) {
              const trip = await ctx.db.trip.findUnique({
                where: { id: tripId },
                select: { startDate: true, endDate: true },
              })
              if (trip) {
                tripStartDate = trip.startDate.toISOString()
                tripEndDate = trip.endDate.toISOString()
              }
            }

            // Send notification email to referrer (non-blocking)
            if (updatedReferrer.email) {
              try {
                const referrerFirstName = updatedReferrer.email.split('@')[0] || 'Friend'
                const emailContent = generateGuestReferralBookingEmail({
                  referrerName: referrerFirstName,
                  referrerEmail: updatedReferrer.email,
                  guestName: guestName,
                  guestInitials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || undefined,
                  bookingReference,
                  packageName: pkg.name,
                  tripDates: {
                    start: tripStartDate || new Date().toISOString(),
                    end: tripEndDate || new Date().toISOString(),
                  },
                  totalValue: totalPrice,
                  pointsEarned,
                  newPointsBalance: updatedReferrer.referralPointsBalance,
                })

                await sendEmail({
                  to: updatedReferrer.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                  text: emailContent.text,
                })

                bookingLogger.info(
                  `[Guest Referral] Email sent to referrer: ${updatedReferrer.email}, ` +
                  `code=${guestReferralCode}, points=${pointsEarned}`
                )
              } catch (emailError) {
                // Log but don't fail the booking for email errors
                logError(emailLogger, emailError, 'Failed to send guest referral booking email')
              }
            }

            bookingLogger.info(
              `[Guest Referral] Booking attribution: code=${guestReferralCode}, ` +
              `referrerId=${guestReferrerUserId}, bookerId=${user.id}, ` +
              `points=${pointsEarned}, totalPrice=${totalPrice}`
            )
          } catch (referralError) {
            // Log but don't fail the booking for referral errors
            logError(bookingLogger, referralError, 'Error processing guest referral at booking')
          }
        }

        // 20. Return client secret and booking info
        return {
          clientSecret: paymentIntent.clientSecret,
          bookingId: booking.id,
          bookingReference,
          totalPrice, // E4-S6: Full booking total
          paymentAmount, // E4-S6: Amount being charged now (first installment or full)
          discount,
          paymentPlan, // E4-S6: Payment plan selected
          stripeCustomerId, // E4-S6: Customer ID for installment plans
          currency, // E4-S13: Currency used for payment
          // Epic 10: Flag to indicate referral was attributed (cookie should be cleared)
          referralAttributed: !!(referredByPartnerId || guestReferrerUserId),
        }
      } catch (error) {
        // If Stripe payment intent creation fails, delete the booking
        await ctx.db.booking.delete({
          where: { id: booking.id },
        })

        logError(bookingLogger, error, 'Error creating payment intent')
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent. Please try again.',
        })
      }
    }),

  /**
   * Create Companion Booking
   *
   * Creates linked bookings for primary guest + companion in a single transaction.
   * This endpoint:
   * 1. Validates both primary and companion packages/selections
   * 2. Calculates combined pricing (handles shared accommodation)
   * 3. Creates a single Stripe payment intent for both bookings
   * 4. Creates both booking records atomically with proper linkage
   * 5. Returns client secret for payment
   */
  createCompanion: guestProcedure
    .input(
      z.object({
        // Primary guest data
        primary: z.object({
          packageId: z.string().cuid(),
          duration: z.number().refine((d) => [7, 10, 14, 21].includes(d)),
          accommodationTier: z.enum(['LUXURY', 'ULTRA_LUXURY', 'VILLA']),
          addOnIds: z.array(z.string().cuid()).default([]),
          tripId: z.string().cuid().optional(),
        }),
        // Companion guest data
        companion: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
          passportNumber: z.string().optional(),
          dietaryNotes: z.string().optional(),
          packageId: z.string().cuid(),
          duration: z.number().refine((d) => [7, 10, 14, 21].includes(d)),
          accommodationTier: z.enum(['LUXURY', 'ULTRA_LUXURY', 'VILLA']),
          addOnIds: z.array(z.string().cuid()).default([]),
          shared: z.boolean(), // Shared accommodation flag
          tripId: z.string().cuid().optional(),
        }),
        referralCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { primary, companion, referralCode } = input

      // 1. VALIDATION - Primary package
      const primaryPackage = await ctx.db.package.findUnique({
        where: { id: primary.packageId, isActive: true },
        select: { id: true, name: true, basePrice: true, durationOptions: true },
      })

      if (!primaryPackage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Primary guest package not found',
        })
      }

      if (!primaryPackage.durationOptions.includes(primary.duration)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Primary package does not support ${primary.duration}-day duration`,
        })
      }

      // 2. VALIDATION - Companion package
      const companionPackage = await ctx.db.package.findUnique({
        where: { id: companion.packageId, isActive: true },
        select: { id: true, name: true, basePrice: true, durationOptions: true },
      })

      if (!companionPackage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Companion package not found',
        })
      }

      if (!companionPackage.durationOptions.includes(companion.duration)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Companion package does not support ${companion.duration}-day duration`,
        })
      }

      // 3. VALIDATION - Shared accommodation rules
      if (companion.shared) {
        if (primary.accommodationTier !== companion.accommodationTier) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Shared accommodation requires same tier for both guests',
          })
        }
        if (primary.duration !== companion.duration) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Shared accommodation requires same duration for both guests',
          })
        }
        if (primary.tripId !== companion.tripId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Shared accommodation requires same trip for both guests',
          })
        }
      }

      // 4. VALIDATION - Companion email uniqueness
      // Check if companion email matches primary guest email
      const user = ctx.user!
      const primaryGuestEmail = user.emailAddresses[0]?.emailAddress || ''

      if (companion.email.toLowerCase() === primaryGuestEmail.toLowerCase()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Companion email cannot be the same as primary guest email',
        })
      }

      const existingUserWithEmail = await ctx.db.user.findUnique({
        where: { email: companion.email },
      })

      if (existingUserWithEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Companion email already has an account',
        })
      }

      // 5. VALIDATION - Trip capacity (if specified)
      if (primary.tripId) {
        const trip = await ctx.db.trip.findUnique({
          where: { id: primary.tripId },
          select: { id: true, capacity: true, currentBookings: true, isActive: true },
        })

        if (!trip || !trip.isActive) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found or unavailable',
          })
        }

        // P1-004: Check capacity for both guests using active reservations count
        // Count confirmed + recent pending bookings to prevent race conditions
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        const activeReservations = await ctx.db.booking.count({
          where: {
            tripId: primary.tripId,
            OR: [
              { status: 'CONFIRMED' },
              {
                status: 'PENDING_PAYMENT',
                createdAt: { gt: thirtyMinutesAgo },
              },
            ],
          },
        })

        const requiredCapacity = 2
        if (activeReservations + requiredCapacity > trip.capacity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Trip does not have capacity for 2 guests',
          })
        }
      }

      // 6. CALCULATE PRICING - Primary guest
      const primaryBasePrice = Math.round(primaryPackage.basePrice * (primary.duration / 14))
      const primaryAccommodationPrice = ACCOMMODATION_TIER_PRICING[primary.accommodationTier] || 0

      let primaryAddOnsTotal = 0
      if (primary.addOnIds.length > 0) {
        const primaryAddOns = await ctx.db.addOn.findMany({
          where: { id: { in: primary.addOnIds }, isActive: true },
          select: { id: true, thPrice: true },
        })

        if (primaryAddOns.length !== primary.addOnIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some primary guest add-ons are not available',
          })
        }

        primaryAddOnsTotal = primaryAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
      }

      const primarySubtotal = primaryBasePrice + primaryAccommodationPrice + primaryAddOnsTotal

      // 7. CALCULATE PRICING - Companion guest
      const companionBasePrice = Math.round(companionPackage.basePrice * (companion.duration / 14))
      const companionAccommodationPrice = companion.shared
        ? 0 // FREE if sharing
        : (ACCOMMODATION_TIER_PRICING[companion.accommodationTier] || 0)

      let companionAddOnsTotal = 0
      if (companion.addOnIds.length > 0) {
        const companionAddOns = await ctx.db.addOn.findMany({
          where: { id: { in: companion.addOnIds }, isActive: true },
          select: { id: true, thPrice: true },
        })

        if (companionAddOns.length !== companion.addOnIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some companion add-ons are not available',
          })
        }

        companionAddOnsTotal = companionAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
      }

      const companionSubtotal = companionBasePrice + companionAccommodationPrice + companionAddOnsTotal

      // 8. CALCULATE COMBINED TOTAL
      const combinedSubtotal = primarySubtotal + companionSubtotal

      // 9. APPLY REFERRAL DISCOUNT (if provided)
      let discount = 0
      let referredByPartnerId: string | undefined

      if (referralCode) {
        const partner = await ctx.db.partnerProfile.findUnique({
          where: { referralCode },
          select: { id: true, tier: true },
        })

        if (!partner) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid referral code',
          })
        }

        const discountPercentages: Record<string, number> = {
          BRONZE: 0.05,
          SILVER: 0.075,
          GOLD: 0.10,
          PLATINUM: 0.15,
        }

        const discountRate = discountPercentages[partner.tier] || 0
        discount = Math.round(combinedSubtotal * discountRate)
        referredByPartnerId = partner.id
      }

      const grandTotal = combinedSubtotal - discount

      // 10. GET USER INFO (already retrieved earlier for email validation)
      const guestEmail = user.emailAddresses[0]?.emailAddress || ''
      const guestName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest'

      // 11. CREATE BOTH BOOKINGS IN TRANSACTION
      const result = await ctx.db.$transaction(async (tx) => {
        // Generate booking references
        const primaryReference = generateBookingReference()
        const companionReference = generateBookingReference()

        // Create primary booking
        const primaryBooking = await tx.booking.create({
          data: {
            bookingReference: primaryReference,
            userId: user.id,
            packageId: primary.packageId,
            tripId: primary.tripId,
            status: 'PENDING_PAYMENT',
            duration: primary.duration,
            accommodationTier: primary.accommodationTier,
            basePrice: primaryBasePrice,
            accommodationPrice: primaryAccommodationPrice,
            addOnsTotal: primaryAddOnsTotal,
            totalPrice: primarySubtotal,
            referredBy: referredByPartnerId || null,
          },
        })

        // Create companion booking (linked to primary)
        const companionBooking = await tx.booking.create({
          data: {
            bookingReference: companionReference,
            userId: user.id, // Same user owns both
            packageId: companion.packageId,
            tripId: companion.tripId || primary.tripId,
            status: 'PENDING_PAYMENT',
            duration: companion.duration,
            accommodationTier: companion.accommodationTier,
            basePrice: companionBasePrice,
            accommodationPrice: companionAccommodationPrice,
            addOnsTotal: companionAddOnsTotal,
            totalPrice: companionSubtotal,
            referredBy: referredByPartnerId || null,
            isCompanionBooking: true,
            primaryBookingId: primaryBooking.id,
            accommodationShared: companion.shared,
            guestFirstName: companion.firstName,
            guestLastName: companion.lastName,
            guestEmail: companion.email,
            guestPhone: companion.phone,
            guestDateOfBirth: companion.dateOfBirth,
            guestPassportNumber: companion.passportNumber,
            guestDietaryNotes: companion.dietaryNotes,
          },
        })

        // Create primary booking add-ons
        if (primary.addOnIds.length > 0) {
          const primaryAddOns = await tx.addOn.findMany({
            where: { id: { in: primary.addOnIds } },
            select: { id: true, thPrice: true },
          })

          await tx.bookingAddOn.createMany({
            data: primaryAddOns.map((addOn) => ({
              bookingId: primaryBooking.id,
              addOnId: addOn.id,
              quantity: 1,
              price: addOn.thPrice,
            })),
          })
        }

        // Create companion booking add-ons
        if (companion.addOnIds.length > 0) {
          const companionAddOns = await tx.addOn.findMany({
            where: { id: { in: companion.addOnIds } },
            select: { id: true, thPrice: true },
          })

          await tx.bookingAddOn.createMany({
            data: companionAddOns.map((addOn) => ({
              bookingId: companionBooking.id,
              addOnId: addOn.id,
              quantity: 1,
              price: addOn.thPrice,
            })),
          })
        }

        return { primaryBooking, companionBooking }
      })

      // 12. CREATE STRIPE PAYMENT INTENT
      try {
        const paymentIntent = await createStripePaymentIntent({
          amount: grandTotal,
          bookingId: result.primaryBooking.id,
          guestEmail,
          guestName,
          metadata: {
            type: 'companion_booking',
            primaryBookingReference: result.primaryBooking.bookingReference,
            companionBookingReference: result.companionBooking.bookingReference,
            primaryBookingId: result.primaryBooking.id,
            companionBookingId: result.companionBooking.id,
            userId: user.id,
            companionEmail: companion.email,
            companionName: `${companion.firstName} ${companion.lastName}`,
          },
        })

        // 13. CREATE PAYMENT RECORDS FOR BOTH BOOKINGS
        await ctx.db.payment.createMany({
          data: [
            {
              bookingId: result.primaryBooking.id,
              amount: primarySubtotal,
              status: 'PENDING',
              stripePaymentIntentId: paymentIntent.paymentIntentId,
            },
            {
              bookingId: result.companionBooking.id,
              amount: companionSubtotal,
              status: 'PENDING',
              stripePaymentIntentId: paymentIntent.paymentIntentId,
            },
          ],
        })

        // 14. CREATE PARTNER REFERRAL RECORD (if applicable)
        if (referredByPartnerId) {
          const basePoints = Math.floor(grandTotal / 100000) * 100
          const pointsEarned = Math.min(Math.max(basePoints, 500), 2000)

          await ctx.db.partnerReferral.create({
            data: {
              partnerId: referredByPartnerId,
              bookingId: result.primaryBooking.id,
              pointsEarned,
            },
          })

          await ctx.db.partnerProfile.update({
            where: { id: referredByPartnerId },
            data: {
              passportPoints: { increment: pointsEarned },
            },
          })
        }

        // 15. RETURN CLIENT SECRET AND BOOKING INFO
        return {
          clientSecret: paymentIntent.clientSecret,
          primaryBookingId: result.primaryBooking.id,
          companionBookingId: result.companionBooking.id,
          primaryBookingReference: result.primaryBooking.bookingReference,
          companionBookingReference: result.companionBooking.bookingReference,
          primarySubtotal,
          companionSubtotal,
          grandTotal,
          discount,
        }
      } catch (error) {
        // If Stripe payment intent creation fails, delete both bookings
        await ctx.db.booking.deleteMany({
          where: {
            id: {
              in: [result.primaryBooking.id, result.companionBooking.id],
            },
          },
        })

        logError(bookingLogger, error, 'Error creating companion payment intent')
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent. Please try again.',
        })
      }
    }),

  /**
   * Get Booking by Reference
   *
   * Fetches complete booking details by booking reference for display on confirmation page.
   * Includes package, add-ons, trip details, and payment status.
   */
  getBookingByReference: guestProcedure
    .input(z.object({ bookingReference: z.string() }))
    .query(async ({ ctx, input }) => {
      const { bookingReference } = input

      // Find the booking by reference number
      const booking = await ctx.db.booking.findUnique({
        where: {
          bookingReference,
        },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          trip: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              destination: true,
            },
          },
          bookingAddOns: {
            include: {
              addOn: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      // Verify ownership
      const user = ctx.user!
      if (booking.userId !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        })
      }

      return {
        id: booking.id,
        bookingReference,
        status: booking.status,
        package: booking.package,
        trip: booking.trip,
        duration: booking.duration,
        accommodationTier: booking.accommodationTier,
        basePrice: booking.basePrice,
        accommodationPrice: booking.accommodationPrice,
        addOnsTotal: booking.addOnsTotal,
        totalPrice: booking.totalPrice,
        referredBy: booking.referredBy,
        createdAt: booking.createdAt,
        addOns: booking.bookingAddOns.map((ba) => ({
          id: ba.addOnId,
          name: ba.addOn.name,
          category: ba.addOn.category,
          quantity: ba.quantity,
          price: ba.price,
        })),
        payment: booking.payments[0] || null,
      }
    }),

  /**
   * Get Available Trips
   *
   * Returns all available trips that the guest can select.
   * Filters by:
   * - Active trips only
   * - Future trips only
   * - Trips with available capacity
   */
  getAvailableTrips: guestProcedure
    .input(z.object({
      packageId: z.string().cuid().optional(),
    }))
    .query(async ({ ctx }) => {
      // Get all active future trips with available capacity
      const now = new Date()
      const trips = await ctx.db.trip.findMany({
        where: {
          isActive: true,
          startDate: {
            gte: now,
          },
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          destination: true,
          capacity: true,
          currentBookings: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      })

      // Filter trips with available capacity and format response
      return trips
        .filter((trip) => trip.currentBookings < trip.capacity)
        .map((trip) => ({
          id: trip.id,
          startDate: trip.startDate,
          endDate: trip.endDate,
          destination: trip.destination,
          capacity: trip.capacity,
          currentBookings: trip.currentBookings,
          spotsRemaining: trip.capacity - trip.currentBookings,
        }))
    }),

  /**
   * Assign Trip to Booking
   *
   * Assigns a selected trip to an existing booking.
   * Validates:
   * - Booking ownership
   * - Trip availability and capacity
   * - Booking status (must be CONFIRMED or PENDING_PAYMENT)
   */
  assignTrip: guestProcedure
    .input(z.object({
      bookingId: z.string().cuid(),
      tripId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { bookingId, tripId } = input
      const user = ctx.user!

      // 1. Verify booking exists and belongs to user
      const booking = await ctx.db.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          userId: true,
          packageId: true,
          tripId: true,
          status: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.userId !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        })
      }

      // 2. Check if booking already has a trip assigned
      if (booking.tripId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This booking already has a trip assigned',
        })
      }

      // 3. Validate booking status
      if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING_PAYMENT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Trip can only be assigned to confirmed or pending bookings',
        })
      }

      // 4. Verify trip exists, is active, and has capacity
      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          startDate: true,
          capacity: true,
          currentBookings: true,
          isActive: true,
        },
      })

      if (!trip || !trip.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found or is no longer available',
        })
      }

      // 5. Check if trip is in the future
      if (new Date(trip.startDate) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This trip has already started',
        })
      }

      // 6. P1-004: Atomically check capacity and increment in single operation
      // This prevents race conditions where two bookings could exceed capacity
      const [updatedBooking] = await ctx.db.$transaction(async (tx) => {
        // Atomic: only increment if currentBookings < capacity
        const incrementResult = await tx.$executeRaw`
          UPDATE "Trip"
          SET "currentBookings" = "currentBookings" + 1
          WHERE id = ${tripId}
          AND "currentBookings" < capacity
        `

        if (incrementResult === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This trip is fully booked',
          })
        }

        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: { tripId },
        })

        return [booking]
      })

      return {
        success: true,
        booking: {
          id: updatedBooking.id,
          tripId: updatedBooking.tripId,
        },
      }
    }),

  /**
   * List all bookings for current user
   */
  list: guestProcedure.query(async ({ ctx }) => {
    const user = ctx.user!

    const bookings = await ctx.db.booking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        package: {
          select: {
            name: true,
            slug: true,
          },
        },
        trip: {
          select: {
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return bookings
  }),

  /**
   * Get Booking By ID (E3-S16)
   *
   * Fetches a single booking with all related data for modification.
   * Used by modification loader to initialize modification mode.
   */
  getById: guestProcedure
    .input(z.object({
      bookingId: z.string().cuid()
    }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user!

      // Fetch booking with all relations needed for modification
      const booking = await ctx.db.booking.findUnique({
        where: {
          id: input.bookingId,
        },
        include: {
          package: {
            select: {
              id: true,
              slug: true,
              name: true,
              tagline: true,
              basePrice: true,
              heroImageUrl: true,
            },
          },
          trip: {
            select: {
              id: true,
              name: true,
              destination: true,
              startDate: true,
              endDate: true,
            },
          },
          bookingAddOns: {
            include: {
              addOn: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      // Authorization: Verify user owns booking
      if (booking.userId !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to access this booking',
        })
      }

      return booking
    }),

  /**
   * Cancel Booking
   *
   * Cancels an existing booking and processes refund according to cancellation policy:
   * - More than 60 days before trip: 100% refund minus $500 processing fee
   * - 30-60 days before trip: 50% refund
   * - Less than 30 days before trip: Non-refundable
   *
   * This mutation:
   * 1. Validates booking ownership and cancellability
   * 2. Calculates refund amount based on time until trip
   * 3. Processes Stripe refund (if applicable)
   * 4. Updates booking status to CANCELLED
   * 5. Creates payment record for refund
   */
  cancel: guestProcedure
    .input(z.object({
      bookingId: z.string().cuid(),
      cancelBothBookings: z.boolean().optional().default(false),
      companionBookingId: z.string().cuid().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user!

      // 1. Authorization: Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          trip: true,
          package: {
            select: {
              name: true
            }
          },
          payments: {
            where: { status: 'SUCCEEDED' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found'
        })
      }

      if (booking.userId !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this booking'
        })
      }

      // 2. Validate booking is cancellable
      if (booking.status === 'CANCELLED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking is already cancelled'
        })
      }

      if (booking.status === 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel a completed trip'
        })
      }

      // 3. Check if trip has been assigned and hasn't started
      if (!booking.trip) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel booking without assigned trip. Please contact support.'
        })
      }

      const tripStartDate = new Date(booking.trip.startDate)
      const now = new Date()

      if (tripStartDate <= now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel - trip has already started'
        })
      }

      // 3.5. Fetch companion booking if canceling both
      let companionBooking = null
      if (input.cancelBothBookings && input.companionBookingId) {
        companionBooking = await ctx.db.booking.findUnique({
          where: { id: input.companionBookingId },
          include: {
            trip: true,
            package: {
              select: {
                name: true
              }
            },
            payments: {
              where: { status: 'SUCCEEDED' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        })

        if (!companionBooking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Companion booking not found'
          })
        }

        // Verify companion booking is linked to primary booking
        if (companionBooking.primaryBookingId !== booking.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Companion booking is not linked to this booking'
          })
        }

        // Verify companion booking is cancellable
        if (companionBooking.status === 'CANCELLED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Companion booking is already cancelled'
          })
        }

        if (companionBooking.status === 'COMPLETED') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel a completed companion booking'
          })
        }
      }

      // 4. Calculate refund amount (server-side - NEVER trust client calculation)
      const daysUntilTrip = Math.floor(
        (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Calculate combined total if canceling both bookings
      const totalPriceForRefund = companionBooking
        ? booking.totalPrice + companionBooking.totalPrice
        : booking.totalPrice

      let refundAmount = 0
      let refundPercentage = 0

      if (daysUntilTrip > REFUND_POLICY.FULL_REFUND_MIN_DAYS) {
        refundAmount = totalPriceForRefund - CANCELLATION_PROCESSING_FEE
        refundPercentage = 100
      } else if (daysUntilTrip >= REFUND_POLICY.PARTIAL_REFUND_MIN_DAYS) {
        refundAmount = Math.floor(totalPriceForRefund * REFUND_POLICY.PARTIAL_REFUND_PERCENTAGE)
        refundPercentage = 50
      } else {
        refundAmount = 0
        refundPercentage = 0
      }

      // Ensure refund amount is not negative
      if (refundAmount < 0) {
        refundAmount = 0
      }

      // 5. Process refund if amount > 0
      let stripeRefundId: string | null = null

      if (refundAmount > 0 && booking.payments.length > 0) {
        const payment = booking.payments[0]

        if (!payment.stripePaymentIntentId) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Payment intent ID not found'
          })
        }

        try {
          const refund = await getStripe().refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              refundPolicy: daysUntilTrip > 60 ? '100%-fee' : '50%',
              daysUntilTrip: daysUntilTrip.toString()
            }
          })

          stripeRefundId = refund.id
        } catch (error: unknown) {
          logStripeError(error, 'Stripe refund error', { bookingId: booking.id })
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }

      // 6. Update booking status and create refund payment record (atomic transaction)
      const updatedBooking = await ctx.db.$transaction(async (tx) => {
        // Update primary booking status
        const updated = await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        })

        // Update companion booking status if canceling both
        if (companionBooking) {
          await tx.booking.update({
            where: { id: companionBooking.id },
            data: {
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          })
        }

        // Create refund payment record if refund was processed
        if (refundAmount > 0 && stripeRefundId) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: -refundAmount, // Negative for refund
              status: 'REFUNDED',
              stripePaymentIntentId: stripeRefundId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        }

        // Decrement trip currentBookings count if trip was assigned
        // Decrement by 2 if canceling both bookings, otherwise by 1
        if (booking.tripId) {
          const decrementAmount = companionBooking ? 2 : 1
          await tx.trip.update({
            where: { id: booking.tripId },
            data: {
              currentBookings: {
                decrement: decrementAmount
              }
            }
          })
        }

        return updated
      })

      // 7. Send cancellation email (non-blocking)
      // TODO: Implement email sending in Task 4
      // sendCancellationEmail(booking, refundAmount).catch(err => logError(emailLogger, err, 'Failed to send cancellation email'))

      // Story 11-8: Send admin cancellation alert (non-blocking)
      const { sendBookingCancellationAlert, isAdminAlertsConfigured } = await import('@/lib/email/admin-alerts')
      if (isAdminAlertsConfigured()) {
        sendBookingCancellationAlert({
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          customerEmail: user.emailAddresses?.[0]?.emailAddress || '',
          bookingReference: booking.bookingReference,
          bookingId: booking.id,
          cancellationReason: undefined, // Add input field if needed
          packageName: booking.package.name,
          tripName: booking.trip?.name || '',
          tripStartDate: booking.trip?.startDate?.toISOString() || '',
          totalBookingValue: totalPriceForRefund,
          refundAmount: refundAmount,
          refundStatus: 'pending',
          daysUntilTrip: daysUntilTrip,
          bookingAdminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`
        }).catch(err => logError(emailLogger, err, 'Failed to send cancellation admin alert'))
      }

      return {
        success: true,
        refundAmount,
        refundPercentage,
        daysUntilTrip,
        bookingReference: booking.bookingReference
      }
    }),

  /**
   * Reschedule Booking
   *
   * Allows guests to move their booking to a different trip.
   * Authorization: User must own the booking
   * Eligibility:
   * - Booking must be CONFIRMED or PENDING_PAYMENT
   * - Trip must not have started yet
   * - <30 days before trip (non-refundable period)
   * - Maximum 1 reschedule per booking
   *
   * Process:
   * 1. Validate authorization and eligibility
   * 2. Validate new trip availability
   * 3. Calculate price adjustment (if any)
   * 4. Process payment/refund for price difference
   * 5. Update booking record atomically:
   *    - Update tripId, totalPrice, rescheduleCount
   *    - Decrement old trip capacity
   *    - Increment new trip capacity
   * 6. Create payment records for adjustments
   * 7. Send confirmation email (non-blocking)
   */
  reschedule: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        newTripId: z.string().cuid(),
        rescheduleBothBookings: z.boolean().optional(),
        companionBookingId: z.string().cuid().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Authorization: Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          trip: true,
          package: true,
          payments: {
            where: { status: 'SUCCEEDED' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      if (!booking || !ctx.user || booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to reschedule this booking'
        })
      }

      // 2. Validate booking is reschedulable
      if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING_PAYMENT') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only confirmed bookings can be rescheduled'
        })
      }

      // 3. Check reschedule limit (max 1 reschedule)
      if ((booking.rescheduleCount || 0) >= 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reschedule limit reached. Each booking can only be rescheduled once.'
        })
      }

      // 4. Check eligibility: <30 days before trip
      if (!booking.trip) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking does not have an assigned trip'
        })
      }

      const tripStartDate = new Date(booking.trip.startDate)
      const now = new Date()
      const daysUntilTrip = Math.floor(
        (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilTrip >= 30) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Rescheduling is only available less than 30 days before trip. Consider canceling for a refund instead.'
        })
      }

      if (tripStartDate <= now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reschedule - trip has already started'
        })
      }

      // 4.5 Validate companion booking if rescheduling both
      let companionBooking = null
      if (input.rescheduleBothBookings && input.companionBookingId) {
        companionBooking = await ctx.db.booking.findUnique({
          where: { id: input.companionBookingId },
          include: {
            trip: true,
            package: true
          }
        })

        if (!companionBooking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Companion booking not found'
          })
        }

        // Verify companion is linked to primary booking
        if (companionBooking.primaryBookingId !== booking.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Companion booking is not linked to this primary booking'
          })
        }

        // Verify companion booking is reschedulable
        if (companionBooking.status !== 'CONFIRMED' && companionBooking.status !== 'PENDING_PAYMENT') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Companion booking cannot be rescheduled in its current status'
          })
        }

        // Check companion reschedule limit
        if ((companionBooking.rescheduleCount || 0) >= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Companion booking has reached its reschedule limit'
          })
        }
      }

      // 5. Validate new trip
      const newTrip = await ctx.db.trip.findUnique({
        where: { id: input.newTripId }
      })

      if (!newTrip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Selected trip not found'
        })
      }

      // Check capacity: 2 spots if rescheduling both, 1 spot otherwise
      const requiredSpots = companionBooking ? 2 : 1
      const availableSpots = newTrip.capacity - newTrip.currentBookings

      if (availableSpots < requiredSpots) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: companionBooking
            ? `Selected trip does not have capacity for both guests. ${availableSpots} ${availableSpots === 1 ? 'spot' : 'spots'} available, but ${requiredSpots} spots needed.`
            : 'Selected trip is full. Please choose another trip.'
        })
      }

      if (new Date(newTrip.startDate) <= now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reschedule to a trip that has already started'
        })
      }

      // 6. Calculate price adjustment
      // Note: For MVP, assume same pricing. Future: calculate based on trip pricing
      const priceDifference = 0 // TODO: Implement dynamic pricing per trip
      let stripePaymentIntentId: string | null = null
      let stripeRefundId: string | null = null

      // 7. Process payment if price differs
      if (priceDifference > 0) {
        // Price increase: charge difference
        try {
          const paymentIntent = await getStripe().paymentIntents.create({
            amount: priceDifference,
            currency: 'usd',
            customer: booking.payments[0]?.stripeCustomerId || undefined,
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              type: 'reschedule_price_adjustment',
              originalTripId: booking.tripId!,
              newTripId: input.newTripId
            }
          })
          stripePaymentIntentId = paymentIntent.id
        } catch (error: unknown) {
          logStripeError(error, 'Stripe payment intent error', { bookingId: booking.id })
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      } else if (priceDifference < 0) {
        // Price decrease: issue refund
        const payment = booking.payments[0]
        if (payment?.stripePaymentIntentId) {
          try {
            const refund = await getStripe().refunds.create({
              payment_intent: payment.stripePaymentIntentId,
              amount: Math.abs(priceDifference),
              reason: 'requested_by_customer',
              metadata: {
                bookingId: booking.id,
                bookingReference: booking.bookingReference,
                type: 'reschedule_price_adjustment'
              }
            })
            stripeRefundId = refund.id
          } catch (error: unknown) {
            logStripeError(error, 'Stripe refund error', { bookingId: booking.id })
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
      }

      // 8. Update booking and trip capacities atomically
      const updatedBooking = await ctx.db.$transaction(async (tx) => {
        // Decrement old trip capacity (1 or 2 guests)
        if (booking.tripId) {
          await tx.trip.update({
            where: { id: booking.tripId },
            data: {
              currentBookings: {
                decrement: requiredSpots
              }
            }
          })
        }

        // Increment new trip capacity (1 or 2 guests)
        await tx.trip.update({
          where: { id: input.newTripId },
          data: {
            currentBookings: {
              increment: requiredSpots
            }
          }
        })

        // Update primary booking
        const updated = await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            tripId: input.newTripId,
            totalPrice: booking.totalPrice + priceDifference,
            rescheduleCount: (booking.rescheduleCount || 0) + 1,
            rescheduledAt: new Date(),
            originalTripId: booking.tripId,
            updatedAt: new Date()
          },
          include: {
            trip: true
          }
        })

        // Update companion booking if rescheduling both
        if (companionBooking) {
          await tx.booking.update({
            where: { id: companionBooking.id },
            data: {
              tripId: input.newTripId,
              totalPrice: companionBooking.totalPrice, // No price adjustment for companion
              rescheduleCount: (companionBooking.rescheduleCount || 0) + 1,
              rescheduledAt: new Date(),
              originalTripId: companionBooking.tripId,
              updatedAt: new Date()
            }
          })
        }

        // If rescheduling only primary (not both), unlink companion
        if (!input.rescheduleBothBookings && booking.primaryBookingId === null) {
          // This is a primary booking being rescheduled alone
          // Find and unlink the companion booking if it exists
          const linkedCompanion = await tx.booking.findFirst({
            where: {
              primaryBookingId: booking.id,
              status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
            }
          })

          if (linkedCompanion) {
            await tx.booking.update({
              where: { id: linkedCompanion.id },
              data: {
                primaryBookingId: null
              }
            })
          }
        }

        // If this is a companion booking being rescheduled, unlink it
        if (booking.primaryBookingId !== null) {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              primaryBookingId: null
            }
          })
        }

        // Create payment records if price changed
        if (priceDifference > 0 && stripePaymentIntentId) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: priceDifference,
              status: 'SUCCEEDED',
              stripePaymentIntentId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        } else if (priceDifference < 0 && stripeRefundId) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: priceDifference, // Negative amount
              status: 'REFUNDED',
              stripePaymentIntentId: stripeRefundId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        }

        return updated
      })

      // 9. Send reschedule confirmation email (non-blocking)
      // TODO: Implement email sending
      // sendRescheduleEmail(booking, updatedBooking.trip!).catch(err => logError(emailLogger, err, 'Failed to send reschedule email'))

      return {
        success: true,
        newTrip: updatedBooking.trip,
        priceDifference,
        bookingReference: booking.bookingReference
      }
    }),

  /**
   * Modify Booking Add-Ons (E3-S16)
   *
   * Allows guests to change add-ons (not base package) if >60 days before trip.
   * Follows same pattern as reschedule mutation for price adjustments.
   *
   * Authorization: User must own the booking
   * Eligibility:
   * - Booking must be CONFIRMED
   * - Trip must be assigned
   * - >60 days before trip start
   * - Trip must not have started yet
   *
   * Process:
   * 1. Validate authorization and eligibility
   * 2. Calculate price difference (server-side only)
   * 3. Process payment/refund for price difference
   * 4. Update booking record atomically:
   *    - Delete old BookingAddOn records
   *    - Create new BookingAddOn records
   *    - Update addOnsTotal and totalPrice
   *    - Create payment records for adjustments
   * 5. Send confirmation email (non-blocking)
   */
  modify: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        addOnIds: z.array(z.string().cuid())
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. AUTHORIZATION & VALIDATION
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          bookingAddOns: { include: { addOn: true } },
          payments: {
            where: { status: 'SUCCEEDED' },
            orderBy: { createdAt: 'desc' }
          },
          trip: true,
          package: true,
          user: { include: { guestProfile: true } }
        }
      })

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
      }

      // Verify user owns booking
      if (!ctx.user || booking.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      // Verify booking status
      if (booking.status !== 'CONFIRMED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only confirmed bookings can be modified'
        })
      }

      // Verify trip assigned
      if (!booking.trip) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No trip assigned to this booking'
        })
      }

      // Calculate days until trip
      const tripStartDate = new Date(booking.trip.startDate)
      const now = new Date()
      const daysUntilTrip = Math.floor(
        (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Verify >60 days before trip
      if (daysUntilTrip <= 60) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Modifications are only allowed more than 60 days before trip. Please contact support for assistance.'
        })
      }

      // Verify trip not started
      if (tripStartDate <= now) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot modify - trip has already started'
        })
      }

      // 2. CALCULATE PRICE DIFFERENCE (Server-side only!)
      const originalAddOnsTotal = booking.bookingAddOns.reduce(
        (sum, ba) => sum + ba.price,
        0
      )

      // Fetch new add-ons from database
      const newAddOns = await ctx.db.addOn.findMany({
        where: { id: { in: input.addOnIds } }
      })

      if (newAddOns.length !== input.addOnIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some add-ons not found'
        })
      }

      // Calculate new add-ons total
      const newAddOnsTotal = newAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)

      // Calculate price difference
      const priceDifference = newAddOnsTotal - originalAddOnsTotal

      // 3. PROCESS PAYMENT ADJUSTMENT
      let stripePaymentIntentId: string | null = null
      let stripeRefundId: string | null = null

      if (priceDifference > 0) {
        // Price increased - charge difference
        try {
          const paymentIntent = await getStripe().paymentIntents.create({
            amount: priceDifference,
            currency: 'usd',
            customer: booking.payments[0]?.stripeCustomerId || undefined,
            automatic_payment_methods: { enabled: true },
            metadata: {
              bookingId: booking.id,
              bookingReference: booking.bookingReference,
              type: 'modification_price_adjustment',
              adjustmentReason: 'addons_modification'
            }
          })

          stripePaymentIntentId = paymentIntent.id

          // Return client secret for payment confirmation on frontend
          return {
            requiresPayment: true,
            clientSecret: paymentIntent.client_secret,
            amount: priceDifference
          }
        } catch (error: unknown) {
          logStripeError(error, 'Stripe payment intent error', { bookingId: booking.id })
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      } else if (priceDifference < 0) {
        // Price decreased - issue refund
        const payment = booking.payments[0]
        if (payment?.stripePaymentIntentId) {
          try {
            const refund = await getStripe().refunds.create({
              payment_intent: payment.stripePaymentIntentId,
              amount: Math.abs(priceDifference),
              reason: 'requested_by_customer',
              metadata: {
                bookingId: booking.id,
                bookingReference: booking.bookingReference,
                type: 'modification_price_adjustment',
                adjustmentReason: 'addons_removed'
              }
            })
            stripeRefundId = refund.id
          } catch (error: unknown) {
            logStripeError(error, 'Stripe refund error', { bookingId: booking.id })
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
      }

      // 4. UPDATE DATABASE (Atomic transaction)
      const updatedBooking = await ctx.db.$transaction(async (tx) => {
        // Delete existing add-ons
        await tx.bookingAddOn.deleteMany({
          where: { bookingId: input.bookingId }
        })

        // Create new add-ons
        await tx.bookingAddOn.createMany({
          data: newAddOns.map((addOn) => ({
            bookingId: input.bookingId,
            addOnId: addOn.id,
            quantity: 1,
            price: addOn.thPrice
          }))
        })

        // Update booking totals
        const updatedBooking = await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            addOnsTotal: newAddOnsTotal,
            totalPrice: booking.basePrice + booking.accommodationPrice + newAddOnsTotal,
            updatedAt: new Date()
          },
          include: {
            bookingAddOns: { include: { addOn: true } },
            trip: true,
            package: true
          }
        })

        // Create payment record if adjustment made
        if (stripePaymentIntentId || stripeRefundId) {
          await tx.payment.create({
            data: {
              bookingId: input.bookingId,
              amount: priceDifference,
              status: priceDifference > 0 ? 'SUCCEEDED' : 'REFUNDED',
              stripePaymentIntentId: stripePaymentIntentId || stripeRefundId,
              stripeCustomerId: booking.payments[0]?.stripeCustomerId
            }
          })
        }

        return updatedBooking
      })

      // 5. SEND CONFIRMATION EMAIL (Non-blocking)
      const guestFirstName = booking.user.guestProfile?.firstName || booking.user.email.split('@')[0]

      // Calculate added/removed add-ons for email
      const originalAddOnIds = booking.bookingAddOns.map((ba) => ba.addOnId)
      const newAddOnIds = input.addOnIds

      const addedAddOnIds = newAddOnIds.filter((id) => !originalAddOnIds.includes(id))
      const removedAddOnIds = originalAddOnIds.filter((id) => !newAddOnIds.includes(id))

      const addedAddOns = newAddOns.filter((addOn) => addedAddOnIds.includes(addOn.id))
      const removedAddOns = booking.bookingAddOns
        .filter((ba) => removedAddOnIds.includes(ba.addOnId))
        .map((ba) => ba.addOn)

      try {
        const { sendBookingModification } = await import('@/lib/email/sendgrid')

        await sendBookingModification(booking.user.email, {
          firstName: guestFirstName,
          email: booking.user.email,
          bookingReference: booking.bookingReference,
          packageName: booking.package.name,
          addedAddOns: addedAddOns.map((a) => ({ name: a.name, price: a.thPrice })),
          removedAddOns: removedAddOns.map((a) => ({ name: a.name, price: a.thPrice })),
          originalTotal: booking.basePrice + booking.accommodationPrice + originalAddOnsTotal,
          newTotal: updatedBooking.totalPrice,
          priceDifference,
          adjustmentType: priceDifference > 0 ? 'charge' : priceDifference < 0 ? 'refund' : 'none',
          tripStartDate: booking.trip.startDate.toISOString(),
          tripEndDate: booking.trip.endDate.toISOString(),
          destination: booking.trip.destination
        })
      } catch (emailError) {
        // Log but don't fail mutation
        logError(emailLogger, emailError, 'Failed to send modification confirmation email')
      }

      // 6. RETURN SUCCESS RESPONSE
      return {
        success: true,
        requiresPayment: false,
        priceDifference,
        adjustmentType: priceDifference > 0 ? 'charge' : priceDifference < 0 ? 'refund' : 'none',
        newAddOnsTotal,
        newTotalPrice: updatedBooking.totalPrice,
        bookingReference: booking.bookingReference
      }
    }),

  /**
   * Create Gift Booking (E3-S18)
   *
   * Creates a gift booking where the purchaser pays for a trip as a gift for someone else.
   * The booking is initially assigned to the purchaser, then transferred to the recipient upon acceptance.
   */
  createGift: guestProcedure
    .input(
      z.object({
        // Standard booking data
        packageId: z.string().cuid(),
        tripId: z.string().cuid().optional(),
        duration: z.number().refine((d) => [7, 10, 14, 21].includes(d)),
        accommodationTier: z.enum(['LUXURY', 'ULTRA_LUXURY', 'VILLA']),
        addOnIds: z.array(z.string().cuid()).default([]),
        referralCode: z.string().optional(),

        // Gift recipient data
        giftRecipient: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          dateOfBirth: z.string().optional(),
        }),

        // Gift message and delivery
        giftMessage: z.string().max(500).optional(),
        giftDeliveryDate: z.string().datetime().optional(), // ISO string, null = immediate
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { packageId, tripId, duration, accommodationTier, addOnIds, giftRecipient, giftMessage, giftDeliveryDate, referralCode } = input

      // 1. VALIDATION - Package
      const pkg = await ctx.db.package.findFirst({
        where: { id: packageId, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          durationOptions: true,
        },
      })

      if (!pkg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found or is no longer available',
        })
      }

      if (!pkg.durationOptions.includes(duration)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `This package does not support ${duration}-day duration`,
        })
      }

      // 2. VALIDATION - Recipient email != Purchaser email
      const user = ctx.user!
      const purchaserEmail = user.emailAddresses[0]?.emailAddress || ''

      if (giftRecipient.email.toLowerCase() === purchaserEmail.toLowerCase()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot purchase a gift for yourself',
        })
      }

      // 3. VALIDATION - Trip if specified
      if (tripId) {
        const trip = await ctx.db.trip.findFirst({
          where: { id: tripId, isActive: true },
          select: {
            id: true,
            capacity: true,
            currentBookings: true,
            isActive: true,
          },
        })

        if (!trip || !trip.isActive) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Trip not found or is no longer available',
          })
        }

        // P1-004: Count both confirmed and recent pending bookings to prevent race conditions
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        const activeReservations = await ctx.db.booking.count({
          where: {
            tripId,
            OR: [
              { status: 'CONFIRMED' },
              {
                status: 'PENDING_PAYMENT',
                createdAt: { gt: thirtyMinutesAgo },
              },
            ],
          },
        })

        if (activeReservations >= trip.capacity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This trip is fully booked',
          })
        }
      }

      // 4. VALIDATION - Delivery date if scheduled
      if (giftDeliveryDate) {
        const deliveryDate = new Date(giftDeliveryDate)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)

        if (deliveryDate < tomorrow) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Delivery date must be at least tomorrow',
          })
        }

        const oneYearFromNow = new Date()
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

        if (deliveryDate > oneYearFromNow) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Delivery date must be within one year',
          })
        }
      }

      // 5. CALCULATE PRICING (standard booking flow)
      const basePrice = Math.round(pkg.basePrice * (duration / 14))
      const accommodationPrice = ACCOMMODATION_TIER_PRICING[accommodationTier] || 0

      let addOnsTotal = 0
      const addOnRecords = []
      if (addOnIds.length > 0) {
        const addOns = await ctx.db.addOn.findMany({
          where: {
            id: { in: addOnIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            thPrice: true,
          },
        })

        addOnsTotal = addOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
        addOnRecords.push(...addOns)
      }

      let referralDiscount = 0
      let referredBy: string | null = null

      if (referralCode) {
        const partner = await ctx.db.partnerProfile.findUnique({
          where: { referralCode: referralCode.toUpperCase() },
          select: {
            id: true,
            referralCode: true,
            tier: true,
          },
        })

        if (partner) {
          referralDiscount = Math.round((basePrice + accommodationPrice + addOnsTotal) * 0.1)
          referredBy = partner.referralCode
        }
      }

      const totalPrice = basePrice + accommodationPrice + addOnsTotal - referralDiscount

      // 6. GENERATE GIFT ACCEPTANCE TOKEN
      const { randomUUID } = await import('crypto')
      const giftAcceptanceToken = randomUUID()

      // 7. GENERATE BOOKING REFERENCE
      const bookingReference = generateBookingReference()

      // 8. CREATE STRIPE PAYMENT INTENT
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: totalPrice,
        currency: 'usd',
        metadata: {
          type: 'gift_booking',
          bookingReference,
          purchaserEmail,
          purchaserName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          recipientEmail: giftRecipient.email,
          recipientName: `${giftRecipient.firstName} ${giftRecipient.lastName}`,
          packageName: pkg.name,
          duration: duration.toString(),
        },
      })

      // 9. CREATE BOOKING (initially assigned to purchaser)
      const booking = await ctx.db.booking.create({
        data: {
          bookingReference,
          userId: user.id, // Purchaser
          packageId,
          tripId: tripId || null,
          status: 'PENDING_PAYMENT',
          duration,
          accommodationTier,
          basePrice,
          accommodationPrice,
          addOnsTotal,
          totalPrice,
          referredBy,
          // Gift booking fields
          isGift: true,
          giftPurchaserId: user.id,
          giftRecipientEmail: giftRecipient.email,
          giftRecipientName: `${giftRecipient.firstName} ${giftRecipient.lastName}`,
          giftRecipientPhone: giftRecipient.phone || null,
          giftMessage: giftMessage || null,
          giftDeliveryDate: giftDeliveryDate ? new Date(giftDeliveryDate) : null,
          giftStatus: 'PENDING', // Will be SENT after email is sent
          giftAcceptanceToken,
          // Add-ons
          bookingAddOns: {
            create: addOnRecords.map((addOn) => ({
              addOnId: addOn.id,
              quantity: 1,
              price: addOn.thPrice,
            })),
          },
        },
        include: {
          package: {
            select: {
              name: true,
              slug: true,
              description: true,
            },
          },
          trip: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              destination: true,
            },
          },
          bookingAddOns: {
            include: {
              addOn: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
      })

      // 10. INCREMENT TRIP CAPACITY (if trip selected)
      if (tripId) {
        await ctx.db.trip.update({
          where: { id: tripId },
          data: { currentBookings: { increment: 1 } },
        })
      }

      // 11. CREATE PAYMENT RECORD
      await ctx.db.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: null,
        },
      })

      // 12. SEND EMAILS
      // Import email functions at top of file if not already imported
      const { sendEmail } = await import('@/lib/email/sendgrid')
      const {
        generateGiftConfirmationPurchaserEmail,
      } = await import('@/lib/email/templates/gift-confirmation-purchaser')
      const {
        generateGiftNotificationRecipientEmail,
      } = await import('@/lib/email/templates/gift-notification-recipient')

      const purchaserFirstName = user.firstName || 'Valued Customer'
      const purchaserEmailAddress = user.emailAddresses[0]?.emailAddress || ''

      // Send confirmation to purchaser
      try {
        const purchaserConfirmationData = {
          purchaserFirstName,
          purchaserEmail: purchaserEmailAddress,
          recipientFirstName: giftRecipient.firstName,
          recipientLastName: giftRecipient.lastName,
          recipientEmail: giftRecipient.email,
          bookingReference: booking.bookingReference,
          packageName: pkg.name,
          duration,
          accommodationTier,
          tripStartDate: booking.trip?.startDate?.toISOString(),
          tripEndDate: booking.trip?.endDate?.toISOString(),
          destination: booking.trip?.destination || 'Chiang Mai, Thailand',
          totalPrice,
          addOns: addOnRecords.map((addOn) => ({
            name: addOn.name,
            quantity: 1,
            price: addOn.thPrice,
          })),
          giftMessage: giftMessage || undefined,
          deliveryDate: giftDeliveryDate,
          isScheduled: !!giftDeliveryDate,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`,
        }

        const purchaserEmailTemplate = generateGiftConfirmationPurchaserEmail(purchaserConfirmationData)

        await sendEmail({
          to: purchaserEmailAddress,
          subject: purchaserEmailTemplate.subject,
          html: purchaserEmailTemplate.html,
          text: purchaserEmailTemplate.text,
        })
      } catch (emailError) {
        logError(giftLogger, emailError, 'Failed to send gift confirmation to purchaser')
        // Don't throw - booking already created
      }

      // If immediate delivery, send gift notification to recipient and update status to SENT
      if (!giftDeliveryDate) {
        try {
          const acceptanceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/gift/accept?token=${giftAcceptanceToken}`
          const packageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages/${pkg.slug || ''}`

          const recipientNotificationData = {
            recipientFirstName: giftRecipient.firstName,
            recipientEmail: giftRecipient.email,
            purchaserFirstName: user.firstName || '',
            purchaserLastName: user.lastName || '',
            bookingReference: booking.bookingReference,
            packageName: pkg.name,
            packageDescription: pkg.description,
            duration,
            accommodationTier,
            tripStartDate: booking.trip?.startDate?.toISOString(),
            tripEndDate: booking.trip?.endDate?.toISOString(),
            destination: booking.trip?.destination || 'Chiang Mai, Thailand',
            totalValue: totalPrice,
            addOns: addOnRecords.map((addOn) => ({
              name: addOn.name,
              quantity: 1,
            })),
            giftMessage: giftMessage || undefined,
            acceptanceUrl,
            packageUrl,
          }

          const recipientEmailTemplate = generateGiftNotificationRecipientEmail(recipientNotificationData)

          await sendEmail({
            to: giftRecipient.email,
            subject: recipientEmailTemplate.subject,
            html: recipientEmailTemplate.html,
            text: recipientEmailTemplate.text,
          })

          // Update status to SENT
          await ctx.db.booking.update({
            where: { id: booking.id },
            data: { giftStatus: 'SENT' },
          })
        } catch (emailError) {
          logError(giftLogger, emailError, 'Failed to send gift notification to recipient')
          // Don't throw - booking already created, gift will remain in PENDING status
        }
      }
      // If scheduled, leave status as PENDING for cron job to handle

      // 13. RETURN PAYMENT CLIENT SECRET
      return {
        requiresPayment: true,
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        total: totalPrice,
        giftAcceptanceToken, // For testing purposes
      }
    })
})
