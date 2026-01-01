/**
 * Trip Router
 *
 * tRPC procedures for trip management:
 * - Public read operations for booking flow
 * - Admin CRUD operations for trip management
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const tripRouter = router({
  // ============================================================================
  // PUBLIC OPERATIONS
  // ============================================================================

  /**
   * Get all available trips
   * Public endpoint for booking flow (E3-S8)
   *
   * Filters:
   * - Only active trips (isActive = true)
   * - Only future trips (startDate >= now)
   * - Only trips with available capacity (currentBookings < capacity)
   *
   * Sorted by start date (ascending)
   */
  getAvailable: publicProcedure.query(async ({ ctx }) => {
    const now = new Date()

    // Fetch all active, future trips and filter in-memory
    // Note: Prisma doesn't support field-to-field comparisons in where clauses
    const allTrips = await ctx.db.trip.findMany({
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
        name: true,
        destination: true,
        startDate: true,
        endDate: true,
        capacity: true,
        currentBookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    // Filter to only trips with available capacity
    const trips = allTrips.filter((trip) => trip.currentBookings < trip.capacity)

    return trips
  }),

  /**
   * Get trip by ID
   * Public endpoint for trip details
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const trip = await ctx.db.trip.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          destination: true,
          startDate: true,
          endDate: true,
          capacity: true,
          currentBookings: true,
          isActive: true,
        },
      })

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        })
      }

      return trip
    }),

  /**
   * Get available trips for rescheduling
   * Protected endpoint - requires authentication
   * Returns future trips with availability for rescheduling a specific booking
   */
  getAvailableForReschedule: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get booking to verify ownership and check package
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: {
          packageId: true,
          userId: true,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      // Verify user owns the booking
      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this booking',
        })
      }

      const now = new Date()

      // Fetch all active, future trips and filter in-memory for availability
      const allTrips = await ctx.db.trip.findMany({
        where: {
          isActive: true,
          startDate: {
            gt: now, // Future trips only
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        select: {
          id: true,
          name: true,
          destination: true,
          startDate: true,
          endDate: true,
          capacity: true,
          currentBookings: true,
        },
      })

      // Filter to only trips with available capacity
      const trips = allTrips.filter((trip) => trip.currentBookings < trip.capacity)

      // Return trips with additional computed fields
      return trips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        location: trip.destination,
        currentBookings: trip.currentBookings,
        maxCapacity: trip.capacity,
        spotsAvailable: trip.capacity - trip.currentBookings,
      }))
    }),

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  /**
   * Get all trips (admin view - includes inactive and past trips)
   * Admin endpoint for trip management
   */
  adminGetAll: adminProcedure.query(async ({ ctx }) => {
    const trips = await ctx.db.trip.findMany({
      orderBy: {
        startDate: 'desc',
      },
      select: {
        id: true,
        name: true,
        destination: true,
        startDate: true,
        endDate: true,
        capacity: true,
        currentBookings: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    return trips
  }),

  /**
   * Get trip by ID (admin view)
   * Admin endpoint for editing trips
   */
  adminGetById: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const trip = await ctx.db.trip.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      })

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        })
      }

      return trip
    }),

  /**
   * Create a new trip
   * Admin endpoint for adding new trips
   */
  adminCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        destination: z.string().min(1).max(200),
        startDate: z.date(),
        endDate: z.date(),
        capacity: z.number().int().min(1).max(100).default(12),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate that end date is after start date
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        })
      }

      const trip = await ctx.db.trip.create({
        data: {
          ...input,
          currentBookings: 0,
        },
      })

      return trip
    }),

  /**
   * Update an existing trip
   * Admin endpoint for editing trips
   */
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(200).optional(),
        destination: z.string().min(1).max(200).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        capacity: z.number().int().min(1).max(100).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if trip exists
      const existing = await ctx.db.trip.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        })
      }

      // Validate dates - check final state, not just what's being updated
      const finalStartDate = updateData.startDate ?? existing.startDate
      const finalEndDate = updateData.endDate ?? existing.endDate

      if (finalEndDate <= finalStartDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be after start date',
        })
      }

      // Cannot reduce capacity below current bookings
      if (updateData.capacity !== undefined && updateData.capacity < existing.currentBookings) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot reduce capacity below current bookings (${existing.currentBookings})`,
        })
      }

      const trip = await ctx.db.trip.update({
        where: { id },
        data: updateData,
      })

      return trip
    }),

  /**
   * Toggle trip active status
   * Admin endpoint for activating/deactivating trips
   */
  adminToggleActive: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const trip = await ctx.db.trip.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })

      return trip
    }),

  /**
   * Delete a trip
   * Admin endpoint for removing trips
   * Note: Cannot delete if trip has any bookings
   */
  adminDelete: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if trip has bookings
      const tripWithBookings = await ctx.db.trip.findUnique({
        where: { id: input.id },
        select: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      })

      if (!tripWithBookings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        })
      }

      if (tripWithBookings._count.bookings > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete trip that has existing bookings. Set it to inactive instead.',
        })
      }

      await ctx.db.trip.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
