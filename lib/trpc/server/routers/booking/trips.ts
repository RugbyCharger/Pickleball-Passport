/**
 * Booking Trips Sub-Router
 * 
 * Trip-related operations for bookings:
 * - getAvailableTrips: Get available trips for booking
 * - assignTrip: Assign a trip to a booking
 */

import { z } from 'zod'
import { router, guestProcedure } from '../../trpc'
import { TRPCError } from '@trpc/server'

export const bookingTripsRouter = router({
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
        orderBy: {
          startDate: 'asc',
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          destination: true,
          capacity: true,
          currentBookings: true,
        },
      })

      // Filter trips with available capacity and add availability info
      return trips
        .filter((trip) => trip.currentBookings < trip.capacity)
        .map((trip) => ({
          id: trip.id,
          startDate: trip.startDate,
          endDate: trip.endDate,
          destination: trip.destination,
          capacity: trip.capacity,
          currentBookings: trip.currentBookings,
          availableSpots: trip.capacity - trip.currentBookings,
          isAlmostFull: trip.capacity - trip.currentBookings <= 3,
        }))
    }),

  /**
   * Assign Trip
   *
   * Assigns a trip to an existing booking that doesn't have a trip yet.
   * This is for:
   * - Gift bookings where recipient chooses dates
   * - Bookings created without trip selection
   */
  assignTrip: guestProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        tripId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, tripId } = input

      // 1. Verify booking exists and user owns it
      const booking = await ctx.db.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          userId: true,
          tripId: true,
          status: true,
          bookingReference: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      const user = ctx.user!
      if (booking.userId !== user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        })
      }

      // 2. Check if booking already has a trip
      if (booking.tripId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking already has a trip assigned. Use reschedule to change trips.',
        })
      }

      // 3. Verify trip exists and has capacity
      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          destination: true,
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
          message: 'This trip is fully booked. Please select another trip.',
        })
      }

      // 4. Verify trip is in the future
      if (new Date(trip.startDate) <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot assign a trip that has already started',
        })
      }

      // 5. Assign trip and increment booking count (atomic transaction)
      const [updatedBooking] = await ctx.db.$transaction([
        ctx.db.booking.update({
          where: { id: bookingId },
          data: {
            tripId,
            updatedAt: new Date(),
          },
          include: {
            trip: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                destination: true,
              },
            },
          },
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
        bookingReference: booking.bookingReference,
        trip: updatedBooking.trip,
      }
    }),
})
