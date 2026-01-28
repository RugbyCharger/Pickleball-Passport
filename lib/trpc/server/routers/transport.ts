/**
 * Transport Router
 *
 * tRPC procedures for transportation request management:
 * - Create transport request
 * - List user's transport requests for a trip
 * - Cancel a pending transport request
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const transportRouter = router({
  /**
   * Create transport request
   *
   * Verifies user has a booking for the trip before creating.
   */
  create: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
        date: z.string().datetime(), // ISO date string
        pickupTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
        pickupLocation: z.string().min(1).max(200),
        destination: z.string().min(1).max(200),
        passengers: z.number().int().min(1).max(20),
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
          message: 'You must have a confirmed booking for this trip to request transport',
        })
      }

      // Create transport request
      const transportRequest = await ctx.db.transportRequest.create({
        data: {
          tripId: input.tripId,
          requestedBy: ctx.user.id,
          date: new Date(input.date),
          pickupTime: input.pickupTime,
          pickupLocation: input.pickupLocation,
          destination: input.destination,
          passengers: input.passengers,
          notes: input.notes,
          status: 'PENDING',
        },
      })

      return transportRequest
    }),

  /**
   * List user's transport requests for a trip
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

      // Get all transport requests for this user on this trip
      const transportRequests = await ctx.db.transportRequest.findMany({
        where: {
          tripId: input.tripId,
          requestedBy: ctx.user.id,
        },
        orderBy: [{ date: 'asc' }, { pickupTime: 'asc' }],
      })

      return transportRequests
    }),

  /**
   * Cancel a pending transport request
   */
  cancel: protectedProcedure
    .input(
      z.object({
        transportRequestId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the transport request
      const transportRequest = await ctx.db.transportRequest.findUnique({
        where: { id: input.transportRequestId },
      })

      if (!transportRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transport request not found',
        })
      }

      // Verify ownership
      if (transportRequest.requestedBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this request',
        })
      }

      // Only pending requests can be cancelled
      if (transportRequest.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending requests can be cancelled',
        })
      }

      // Update status to cancelled
      const updatedRequest = await ctx.db.transportRequest.update({
        where: { id: input.transportRequestId },
        data: { status: 'CANCELLED' },
      })

      return updatedRequest
    }),
})
