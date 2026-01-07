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
})
