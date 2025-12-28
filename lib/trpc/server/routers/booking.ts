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
})
