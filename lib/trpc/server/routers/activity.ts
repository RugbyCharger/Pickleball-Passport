/**
 * Activity Router
 *
 * tRPC procedures for activity check-in management:
 * - Check in to an activity
 * - Get check-ins for a booking
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const activityRouter = router({
  /**
   * Check in to an activity
   *
   * Marks guest as checked in to a scheduled activity.
   * Verifies booking ownership before creating check-in.
   */
  checkIn: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        activityId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { userId: true },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to check in for this booking',
        })
      }

      // Check if already checked in
      const existingCheckIn = await ctx.db.activityCheckIn.findUnique({
        where: {
          bookingId_activityId: {
            bookingId: input.bookingId,
            activityId: input.activityId,
          },
        },
      })

      if (existingCheckIn) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Already checked in to this activity',
        })
      }

      // Create check-in
      const checkIn = await ctx.db.activityCheckIn.create({
        data: {
          bookingId: input.bookingId,
          activityId: input.activityId,
        },
      })

      return checkIn
    }),

  /**
   * Get check-ins for a booking
   *
   * Returns list of activity IDs that guest has checked into.
   */
  getCheckIns: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { userId: true },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this booking',
        })
      }

      // Get all check-ins
      const checkIns = await ctx.db.activityCheckIn.findMany({
        where: { bookingId: input.bookingId },
        orderBy: { checkedInAt: 'desc' },
      })

      return checkIns
    }),
})
