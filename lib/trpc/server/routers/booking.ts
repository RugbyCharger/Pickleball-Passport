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
})

/**
 * Accommodation tier pricing
 */
const ACCOMMODATION_TIER_PRICING: Record<string, number> = {
  LUXURY: 0,           // Four Seasons - baseline (included in package)
  ULTRA_LUXURY: 300000, // Aman - +$3,000
  VILLA: 500000,       // Private Villa - +$5,000
}

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
      const { packageId, duration, accommodationTier, addOnIds, tripId, referralCode } = input

      // 1. Validate package exists and is active
      const pkg = await ctx.db.package.findUnique({
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
        const trip = await ctx.db.trip.findUnique({
          where: { id: tripId },
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

        if (trip.currentBookings >= trip.capacity) {
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

      // 7. Validate referral code and calculate discount
      let discount = 0
      let referredByPartnerId: string | undefined

      if (referralCode) {
        const partner = await ctx.db.partnerProfile.findUnique({
          where: { referralCode },
          select: {
            id: true,
            tier: true,
          },
        })

        if (!partner) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid referral code',
          })
        }

        // Calculate discount based on partner tier
        // Bronze: 5%, Silver: 7.5%, Gold: 10%, Platinum: 15%
        const discountPercentages: Record<string, number> = {
          BRONZE: 0.05,
          SILVER: 0.075,
          GOLD: 0.10,
          PLATINUM: 0.15,
        }

        const discountRate = discountPercentages[partner.tier] || 0
        discount = Math.round(subtotal * discountRate)
        referredByPartnerId = partner.id
      }

      // 8. Calculate final total
      const totalPrice = subtotal - discount

      // 9. Get user info from Clerk
      const user = ctx.user!
      const guestEmail = user.emailAddresses[0]?.emailAddress || ''
      const guestName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest'

      // 10. Generate booking reference
      const bookingReference = generateBookingReference()

      // 11. Create booking record in database (status: PENDING_PAYMENT)
      const booking = await ctx.db.booking.create({
        data: {
          userId: user.id,
          packageId,
          tripId,
          status: 'PENDING_PAYMENT',
          duration,
          accommodationTier,
          basePrice,
          accommodationPrice,
          addOnsTotal,
          totalPrice,
          referredBy: referralCode,
        },
      })

      // 12. Create booking add-on records
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

      // 13. Create Stripe payment intent
      try {
        const paymentIntent = await createStripePaymentIntent({
          amount: totalPrice,
          bookingId: booking.id,
          guestEmail,
          guestName,
          metadata: {
            bookingReference,
            packageId,
            userId: user.id,
            duration: duration.toString(),
            accommodationTier,
            referralCode: referralCode || '',
          },
        })

        // 14. Create payment record
        await ctx.db.payment.create({
          data: {
            bookingId: booking.id,
            amount: totalPrice,
            status: 'PENDING',
            stripePaymentIntentId: paymentIntent.paymentIntentId,
          },
        })

        // 15. Create partner referral record if applicable
        if (referredByPartnerId) {
          // Calculate points earned (1 point per $100)
          const pointsEarned = Math.floor(totalPrice / 10000) // $100 = 10000 cents

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

        // 16. Return client secret and booking info
        return {
          clientSecret: paymentIntent.clientSecret,
          bookingId: booking.id,
          bookingReference,
          totalPrice,
          discount,
        }
      } catch (error) {
        // If Stripe payment intent creation fails, delete the booking
        await ctx.db.booking.delete({
          where: { id: booking.id },
        })

        console.error('Error creating payment intent:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent. Please try again.',
        })
      }
    }),
})
