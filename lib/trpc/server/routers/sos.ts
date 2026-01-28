/**
 * SOS Alert Router
 *
 * tRPC procedures for emergency SOS alert management:
 * - Trigger SOS alert with optional GPS coordinates
 * - Get active SOS alert for a trip
 * - Admin-only: resolve an SOS alert
 */

import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const sosRouter = router({
  /**
   * Trigger SOS alert
   *
   * Creates an emergency SOS alert for the current user.
   * GPS coordinates are optional to allow SOS even if location is unavailable.
   * Verifies user has a booking for the trip.
   */
  trigger: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
        message: z.string().max(500).optional(),
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
          message: 'You must have a confirmed booking for this trip to trigger SOS',
        })
      }

      // Check if user already has an active alert for this trip
      const existingAlert = await ctx.db.sOSAlert.findFirst({
        where: {
          tripId: input.tripId,
          userId: ctx.user.id,
          status: 'ACTIVE',
        },
      })

      if (existingAlert) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have an active SOS alert. Please wait for it to be resolved.',
        })
      }

      // Create SOS alert
      const alert = await ctx.db.sOSAlert.create({
        data: {
          tripId: input.tripId,
          userId: ctx.user.id,
          latitude: input.latitude,
          longitude: input.longitude,
          message: input.message,
          status: 'ACTIVE',
        },
      })

      // TODO: In production, this should trigger immediate notifications:
      // - Push notification to admin devices
      // - Email to emergency contact list
      // - SMS to on-site staff

      return alert
    }),

  /**
   * Get active SOS alert for a trip
   *
   * Returns the user's active SOS alert if one exists.
   * Used to show alert status in the UI.
   */
  getActive: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user's active alert for this trip
      const alert = await ctx.db.sOSAlert.findFirst({
        where: {
          tripId: input.tripId,
          userId: ctx.user.id,
          status: 'ACTIVE',
        },
      })

      return alert
    }),

  /**
   * Resolve SOS alert (Admin only)
   *
   * Marks an SOS alert as resolved.
   * Records which admin resolved it and when.
   */
  resolve: adminProcedure
    .input(
      z.object({
        alertId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the alert
      const alert = await ctx.db.sOSAlert.findUnique({
        where: { id: input.alertId },
      })

      if (!alert) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'SOS alert not found',
        })
      }

      if (alert.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This alert has already been resolved',
        })
      }

      // Resolve the alert
      const resolvedAlert = await ctx.db.sOSAlert.update({
        where: { id: input.alertId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: ctx.user.id,
        },
      })

      return resolvedAlert
    }),

  /**
   * List all active SOS alerts (Admin only)
   *
   * Returns all active SOS alerts across all trips.
   * Used in admin dashboard for emergency monitoring.
   */
  listActive: adminProcedure.query(async ({ ctx }) => {
    const alerts = await ctx.db.sOSAlert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return alerts
  }),
})
