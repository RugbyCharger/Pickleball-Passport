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

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-12-15.clover'
})

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
          bookingReference,
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
          referredBy: referredByPartnerId || null, // Store partner ID, not code
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

        // Check capacity for both guests
        const requiredCapacity = 2
        if (trip.currentBookings + requiredCapacity > trip.capacity) {
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

      // 10. GET USER INFO
      const user = ctx.user!
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

        console.error('Error creating companion payment intent:', error)
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

      // 5. Check trip capacity
      if (trip.currentBookings >= trip.capacity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This trip is fully booked',
        })
      }

      // 6. Check if trip is in the future
      if (new Date(trip.startDate) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This trip has already started',
        })
      }

      // 7. Assign trip to booking and increment trip bookings
      const [updatedBooking] = await ctx.db.$transaction([
        ctx.db.booking.update({
          where: { id: bookingId },
          data: { tripId },
        }),
        ctx.db.trip.update({
          where: { id: tripId },
          data: {
            currentBookings: {
              increment: 1,
            },
          },
        }),
      ])

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
      bookingId: z.string().cuid()
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

      // 4. Calculate refund amount (server-side - NEVER trust client calculation)
      const daysUntilTrip = Math.floor(
        (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      let refundAmount = 0
      let refundPercentage = 0
      const PROCESSING_FEE = 50000 // $500 in cents

      if (daysUntilTrip > 60) {
        refundAmount = booking.totalPrice - PROCESSING_FEE
        refundPercentage = 100
      } else if (daysUntilTrip >= 30) {
        refundAmount = Math.floor(booking.totalPrice * 0.5)
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
          const refund = await stripe.refunds.create({
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
        } catch (error: any) {
          console.error('Stripe refund error:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Refund processing failed: ${error.message || 'Unknown error'}`
          })
        }
      }

      // 6. Update booking status and create refund payment record (atomic transaction)
      const updatedBooking = await ctx.db.$transaction(async (tx) => {
        // Update booking status
        const updated = await tx.booking.update({
          where: { id: input.bookingId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        })

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
        if (booking.tripId) {
          await tx.trip.update({
            where: { id: booking.tripId },
            data: {
              currentBookings: {
                decrement: 1
              }
            }
          })
        }

        return updated
      })

      // 7. Send cancellation email (non-blocking)
      // TODO: Implement email sending in Task 4
      // sendCancellationEmail(booking, refundAmount).catch(console.error)

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
        newTripId: z.string().cuid()
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

      if (newTrip.currentBookings >= newTrip.capacity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Selected trip is full. Please choose another trip.'
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
          const paymentIntent = await stripe.paymentIntents.create({
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
        } catch (error: any) {
          console.error('Stripe payment intent error:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Payment processing failed: ${error.message || 'Unknown error'}`
          })
        }
      } else if (priceDifference < 0) {
        // Price decrease: issue refund
        const payment = booking.payments[0]
        if (payment?.stripePaymentIntentId) {
          try {
            const refund = await stripe.refunds.create({
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
          } catch (error: any) {
            console.error('Stripe refund error:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Refund processing failed: ${error.message || 'Unknown error'}`
            })
          }
        }
      }

      // 8. Update booking and trip capacities atomically
      const updatedBooking = await ctx.db.$transaction(async (tx) => {
        // Decrement old trip capacity
        if (booking.tripId) {
          await tx.trip.update({
            where: { id: booking.tripId },
            data: {
              currentBookings: {
                decrement: 1
              }
            }
          })
        }

        // Increment new trip capacity
        await tx.trip.update({
          where: { id: input.newTripId },
          data: {
            currentBookings: {
              increment: 1
            }
          }
        })

        // Update booking
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
      // sendRescheduleEmail(booking, updatedBooking.trip!).catch(console.error)

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
          const paymentIntent = await stripe.paymentIntents.create({
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
        } catch (error: any) {
          console.error('Stripe payment intent error:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Payment processing failed: ${error.message || 'Unknown error'}`
          })
        }
      } else if (priceDifference < 0) {
        // Price decreased - issue refund
        const payment = booking.payments[0]
        if (payment?.stripePaymentIntentId) {
          try {
            const refund = await stripe.refunds.create({
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
          } catch (error: any) {
            console.error('Stripe refund error:', error)
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Refund processing failed: ${error.message || 'Unknown error'}`
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
        console.error('Failed to send modification confirmation email:', emailError)
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
    })
})
