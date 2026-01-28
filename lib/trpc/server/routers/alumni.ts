/**
 * Alumni Router (Phase 13)
 *
 * tRPC procedures for alumni engagement features:
 * - Get alumni status for current user
 * - Searchable alumni directory (opt-in)
 * - Update alumni profile visibility
 * - Get transformation journey summary
 */

import { z } from 'zod'
import { router, guestProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const alumniRouter = router({
  /**
   * Get alumni status for current user
   *
   * Returns whether user is alumni (has completed trips),
   * when they became alumni, total trips, and completed bookings.
   */
  getStatus: guestProcedure.query(async ({ ctx }) => {
    const completedBookings = await ctx.db.booking.findMany({
      where: {
        userId: ctx.user.id,
        status: 'COMPLETED',
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    const isAlumni = completedBookings.length > 0
    const alumniSince = isAlumni ? completedBookings[0].createdAt : null

    return {
      isAlumni,
      alumniSince,
      totalTrips: completedBookings.length,
      completedBookings,
    }
  }),

  /**
   * Searchable alumni directory
   *
   * Query users who have opted into the directory and have completed trips.
   * Can filter by search term (name/email) or tripId.
   */
  directory: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tripId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, tripId, limit, offset } = input

      // Base condition: user has opted into alumni directory
      const baseWhere = {
        showInAlumniDirectory: true,
        // Must have at least one completed booking
        bookings: {
          some: {
            status: 'COMPLETED' as const,
            deletedAt: null,
          },
        },
      }

      // Build search conditions
      const searchWhere = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              {
                guestProfile: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                  ],
                },
              },
            ],
          }
        : {}

      // Build trip filter condition
      const tripWhere = tripId
        ? {
            bookings: {
              some: {
                tripId,
                status: 'COMPLETED' as const,
                deletedAt: null,
              },
            },
          }
        : {}

      const where = {
        ...baseWhere,
        ...searchWhere,
        ...tripWhere,
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          take: limit,
          skip: offset,
          select: {
            id: true,
            email: true,
            alumniProfileBio: true,
            guestProfile: {
              select: {
                firstName: true,
                lastName: true,
                location: true,
              },
            },
            _count: {
              select: {
                bookings: {
                  where: {
                    status: 'COMPLETED',
                    deletedAt: null,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.user.count({ where }),
      ])

      // Transform response to include completedTripsCount
      const items = users.map((user) => ({
        id: user.id,
        email: user.email,
        guestProfile: user.guestProfile,
        alumniProfileBio: user.alumniProfileBio,
        completedTripsCount: user._count.bookings,
      }))

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      }
    }),

  /**
   * Update alumni profile visibility
   *
   * Allow guests to opt-in/out of the alumni directory
   * and update their profile bio.
   */
  updateProfile: guestProcedure
    .input(
      z.object({
        showInAlumniDirectory: z.boolean(),
        alumniProfileBio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          showInAlumniDirectory: input.showInAlumniDirectory,
          alumniProfileBio: input.alumniProfileBio,
        },
        select: {
          id: true,
          email: true,
          showInAlumniDirectory: true,
          alumniProfileBio: true,
        },
      })

      return updatedUser
    }),

  /**
   * Get transformation journey summary
   *
   * Returns detailed journey data for a completed booking including
   * trip photos, activity check-ins, and calculated metrics.
   */
  getJourneySummary: guestProcedure
    .input(
      z.object({
        bookingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch booking and verify ownership
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          trip: true,
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          activityCheckIns: true,
        },
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

      if (booking.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Journey summary is only available for completed trips',
        })
      }

      // Fetch trip photos uploaded by this user
      const photos = booking.tripId
        ? await ctx.db.tripPhoto.findMany({
            where: {
              tripId: booking.tripId,
              uploadedBy: ctx.user.id,
            },
            orderBy: { uploadedAt: 'desc' },
          })
        : []

      // Calculate metrics
      const daysOnTrip = booking.trip
        ? Math.ceil(
            (booking.trip.endDate.getTime() - booking.trip.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : booking.duration

      // Get activity details for check-ins to count pickleball sessions
      const checkInActivityIds = booking.activityCheckIns.map((c) => c.activityId)
      const activities = checkInActivityIds.length
        ? await ctx.db.itineraryActivity.findMany({
            where: {
              id: { in: checkInActivityIds },
            },
            select: {
              id: true,
              type: true,
              title: true,
            },
          })
        : []

      const pickleballSessions = activities.filter(
        (a) => a.type === 'PICKLEBALL'
      ).length

      const metrics = {
        totalActivities: booking.activityCheckIns.length,
        photosUploaded: photos.length,
        daysOnTrip,
        pickleballSessions,
      }

      return {
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          duration: booking.duration,
          createdAt: booking.createdAt,
        },
        trip: booking.trip,
        package: booking.package,
        photos,
        checkIns: booking.activityCheckIns.map((c) => ({
          ...c,
          activity: activities.find((a) => a.id === c.activityId),
        })),
        metrics,
      }
    }),
})
