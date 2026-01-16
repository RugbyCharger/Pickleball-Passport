/**
 * Booking Queries Sub-Router
 * 
 * Read-only operations for booking data:
 * - list: Get all bookings for the current user
 * - getById: Get booking by ID
 * - getBookingByReference: Get booking by reference number
 */

import { z } from 'zod'
import { router, guestProcedure } from '../../trpc'
import { TRPCError } from '@trpc/server'

export const bookingQueriesRouter = router({
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
   * List All Bookings
   *
   * Returns all bookings for the currently authenticated user.
   * Includes package names and trip dates for dashboard display.
   */
  list: guestProcedure.query(async ({ ctx }) => {
    const userId = ctx.user!.id

    const bookings = await ctx.db.booking.findMany({
      where: {
        userId,
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
                thPrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      status: booking.status,
      package: booking.package,
      trip: booking.trip,
      duration: booking.duration,
      accommodationTier: booking.accommodationTier,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      paymentPlan: booking.paymentPlan,
      addOns: booking.bookingAddOns.map((ba) => ({
        id: ba.addOnId,
        name: ba.addOn.name,
        category: ba.addOn.category,
        quantity: ba.quantity,
        price: ba.price,
      })),
    }))
  }),

  /**
   * Get Booking by ID
   *
   * Fetches complete booking details including:
   * - Package information
   * - Trip details
   * - Add-ons
   * - Payment records
   * - Companion booking (if exists)
   */
  getById: guestProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              heroImageUrl: true,
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
                  thPrice: true,
                },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
          // Get companion booking if this is a primary booking
          companionBookings: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              guestName: true,
              guestEmail: true,
            },
          },
          // Get payment records for installment plans
          paymentRecords: {
            orderBy: { dueDate: 'asc' },
            select: {
              id: true,
              amountCents: true,
              dueDate: true,
              status: true,
              paidDate: true,
              installmentNumber: true,
              percentage: true,
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
        bookingReference: booking.bookingReference,
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
        paymentPlan: booking.paymentPlan,
        stripeCustomerId: booking.stripeCustomerId,
        addOns: booking.bookingAddOns.map((ba) => ({
          id: ba.addOnId,
          name: ba.addOn.name,
          category: ba.addOn.category,
          quantity: ba.quantity,
          price: ba.price,
        })),
        payments: booking.payments,
        companionBookings: booking.companionBookings,
        paymentRecords: booking.paymentRecords,
        // Gift booking info
        isGift: booking.isGift,
        giftRecipientEmail: booking.giftRecipientEmail,
        giftRecipientName: booking.giftRecipientName,
        giftStatus: booking.giftStatus,
      }
    }),
})
