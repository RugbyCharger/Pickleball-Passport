/**
 * Court Booking Router
 *
 * tRPC procedures for pickleball court booking management:
 * - Create court booking request
 * - List user's court bookings for a trip
 * - Cancel a pending court booking
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const courtRouter = router({
  /**
   * Create court booking request
   *
   * Verifies user has a booking for the trip before creating.
   */
  create: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
        date: z.string().datetime(), // ISO date string
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
        duration: z.number().int().min(30).max(180), // 30-180 minutes
        players: z.number().int().min(1).max(8),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has a booking for this trip
      const userBooking = await ctx.db.booking.findFirst({
        where: {
          tripId: input.tripId,
          userId: ctx.user.id,
          status: 'CONFIRMED',
        },
      })

      if (!userBooking) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must have a confirmed booking for this trip to request a court',
        })
      }

      // Create court booking request
      const courtBooking = await ctx.db.courtBooking.create({
        data: {
          tripId: input.tripId,
          requestedBy: ctx.user.id,
          date: new Date(input.date),
          startTime: input.startTime,
          duration: input.duration,
          players: input.players,
          notes: input.notes,
          status: 'PENDING',
        },
      })

      return courtBooking
    }),

  /**
   * List user's court bookings for a trip
   */
  list: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user has a booking for this trip
      const userBooking = await ctx.db.booking.findFirst({
        where: {
          tripId: input.tripId,
          userId: ctx.user.id,
          status: 'CONFIRMED',
        },
      })

      if (!userBooking) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must have a confirmed booking for this trip',
        })
      }

      // Get all court bookings for this user on this trip
      const courtBookings = await ctx.db.courtBooking.findMany({
        where: {
          tripId: input.tripId,
          requestedBy: ctx.user.id,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      })

      return courtBookings
    }),

  /**
   * Cancel a pending court booking
   */
  cancel: protectedProcedure
    .input(
      z.object({
        courtBookingId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the court booking
      const courtBooking = await ctx.db.courtBooking.findUnique({
        where: { id: input.courtBookingId },
      })

      if (!courtBooking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Court booking not found',
        })
      }

      // Verify ownership
      if (courtBooking.requestedBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this booking',
        })
      }

      // Only pending bookings can be cancelled
      if (courtBooking.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending bookings can be cancelled',
        })
      }

      // Update status to cancelled
      const updatedBooking = await ctx.db.courtBooking.update({
        where: { id: input.courtBookingId },
        data: { status: 'CANCELLED' },
      })

      return updatedBooking
    }),
})
