/**
 * Analytics Router
 *
 * tRPC procedures for admin analytics dashboard:
 * - Event tracking and analytics (E13-S1)
 * - Booking conversion metrics
 * - Revenue analytics
 * - Guest demographics
 * - Add-on popularity
 * - Trip capacity utilization
 * - Partner referral analytics
 */

import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { BookingStatus, PaymentStatus, AnalyticsEventType } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// ANALYTICS ROUTER
// ============================================================================

export const analyticsRouter = router({
  // ============================================================================
  // EVENT TRACKING (E13-S1)
  // ============================================================================

  events: router({
    /**
     * Track an analytics event (public - can be called from client)
     */
    track: publicProcedure
      .input(
        z.object({
          eventType: z.enum([
            'PAGE_VIEW',
            'BUTTON_CLICK',
            'FUNNEL_STEP',
            'FORM_SUBMIT',
            'CONVERSION',
            'SEARCH',
            'FILTER',
            'ERROR',
          ]),
          sessionId: z.string(),
          properties: z.any().optional().default({}),
          pageUrl: z.string().optional(),
          userAgent: z.string().optional(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || null;

        // Create the analytics event
        const event = await ctx.db.analyticsEvent.create({
          data: {
            eventType: input.eventType as AnalyticsEventType,
            userId,
            sessionId: input.sessionId,
            properties: input.properties,
            pageUrl: input.pageUrl,
            userAgent: input.userAgent,
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
          },
        });

        // Update session metrics if session exists
        await ctx.db.analyticsSession.updateMany({
          where: { sessionId: input.sessionId },
          data: {
            lastActivityAt: new Date(),
            eventCount: { increment: 1 },
            ...(input.eventType === 'PAGE_VIEW' && { pageViews: { increment: 1 } }),
            ...(input.eventType === 'CONVERSION' && {
              hasConverted: true,
              conversionType: (input.properties as { type?: string })?.type || 'UNKNOWN',
            }),
          },
        });

        return { success: true, eventId: event.id };
      }),

    /**
     * Get summary metrics (admin only)
     */
    getSummary: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const [totalEvents, uniqueUsers, eventsByType] = await Promise.all([
          // Total events
          ctx.db.analyticsEvent.count({ where }),

          // Unique users (non-null userId)
          ctx.db.analyticsEvent.groupBy({
            by: ['userId'],
            where: {
              ...where,
              userId: { not: null },
            },
          }),

          // Events by type
          ctx.db.analyticsEvent.groupBy({
            by: ['eventType'],
            where,
            _count: { id: true },
          }),
        ]);

        // Get unique sessions count
        const uniqueSessions = await ctx.db.analyticsEvent.groupBy({
          by: ['sessionId'],
          where,
        });

        return {
          totalEvents,
          uniqueUsers: uniqueUsers.length,
          uniqueSessions: uniqueSessions.length,
          eventsByType: eventsByType.map((e) => ({
            eventType: e.eventType,
            count: e._count.id,
          })),
        };
      }),

    /**
     * Get recent events (admin only)
     */
    getRecent: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).default(50),
            eventType: z
              .enum([
                'PAGE_VIEW',
                'BUTTON_CLICK',
                'FUNNEL_STEP',
                'FORM_SUBMIT',
                'CONVERSION',
                'SEARCH',
                'FILTER',
                'ERROR',
              ])
              .optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const events = await ctx.db.analyticsEvent.findMany({
          where: {
            ...(input?.eventType && { eventType: input.eventType }),
          },
          orderBy: { createdAt: 'desc' },
          take: input?.limit || 50,
        });

        return events;
      }),

    /**
     * Get events by time period (admin only)
     */
    getByTimePeriod: adminProcedure
      .input(
        z.object({
          period: z.enum(['hour', 'day', 'week', 'month']),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input.startDate && { createdAt: { gte: input.startDate } }),
          ...(input.endDate && { createdAt: { lte: input.endDate } }),
        };

        const events = await ctx.db.analyticsEvent.findMany({
          where,
          select: { createdAt: true, eventType: true },
          orderBy: { createdAt: 'asc' },
        });

        // Group events by time period
        const grouped = events.reduce(
          (acc, event) => {
            let key: string;
            const date = event.createdAt;

            switch (input.period) {
              case 'hour':
                key = `${date.toISOString().slice(0, 13)}:00`;
                break;
              case 'day':
                key = date.toISOString().slice(0, 10);
                break;
              case 'week':
                // Get the Monday of the week
                const d = new Date(date);
                d.setDate(d.getDate() - d.getDay() + 1);
                key = d.toISOString().slice(0, 10);
                break;
              case 'month':
                key = date.toISOString().slice(0, 7);
                break;
            }

            if (!acc[key]) {
              acc[key] = { total: 0, byType: {} as Record<string, number> };
            }
            acc[key].total++;
            acc[key].byType[event.eventType] = (acc[key].byType[event.eventType] || 0) + 1;
            return acc;
          },
          {} as Record<string, { total: number; byType: Record<string, number> }>
        );

        return Object.entries(grouped).map(([period, data]) => ({
          period,
          total: data.total,
          byType: data.byType,
        }));
      }),
  }),

  // ============================================================================
  // SESSION TRACKING (E13-S1)
  // ============================================================================

  sessions: router({
    /**
     * Start or update a session (public - called from client)
     */
    upsert: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          deviceType: z.string().optional(),
          browser: z.string().optional(),
          os: z.string().optional(),
          screenResolution: z.string().optional(),
          landingPage: z.string().optional(),
          referrer: z.string().optional(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || null;

        // Upsert session - create if doesn't exist, update if it does
        const session = await ctx.db.analyticsSession.upsert({
          where: { sessionId: input.sessionId },
          create: {
            sessionId: input.sessionId,
            userId,
            deviceType: input.deviceType,
            browser: input.browser,
            os: input.os,
            screenResolution: input.screenResolution,
            landingPage: input.landingPage,
            referrer: input.referrer,
            utmSource: input.utmSource,
            utmMedium: input.utmMedium,
            utmCampaign: input.utmCampaign,
          },
          update: {
            lastActivityAt: new Date(),
            // Update userId if user logged in during session
            ...(userId && { userId }),
          },
        });

        return { success: true, sessionId: session.sessionId };
      }),

    /**
     * Get session summary (admin only)
     */
    getSummary: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { startedAt: { gte: input.startDate } }),
          ...(input?.endDate && { startedAt: { lte: input.endDate } }),
        };

        const [totalSessions, convertedSessions, avgPageViews, avgEventCount, sessionsByDevice] =
          await Promise.all([
            ctx.db.analyticsSession.count({ where }),
            ctx.db.analyticsSession.count({ where: { ...where, hasConverted: true } }),
            ctx.db.analyticsSession.aggregate({
              where,
              _avg: { pageViews: true },
            }),
            ctx.db.analyticsSession.aggregate({
              where,
              _avg: { eventCount: true },
            }),
            ctx.db.analyticsSession.groupBy({
              by: ['deviceType'],
              where,
              _count: { id: true },
            }),
          ]);

        const conversionRate =
          totalSessions > 0 ? ((convertedSessions / totalSessions) * 100).toFixed(2) : '0.00';

        return {
          totalSessions,
          convertedSessions,
          conversionRate,
          averagePageViews: avgPageViews._avg.pageViews?.toFixed(1) || '0.0',
          averageEventCount: avgEventCount._avg.eventCount?.toFixed(1) || '0.0',
          sessionsByDevice: sessionsByDevice.map((d) => ({
            deviceType: d.deviceType || 'unknown',
            count: d._count.id,
          })),
        };
      }),

    /**
     * Get recent sessions (admin only)
     */
    getRecent: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).default(50),
            hasConverted: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const sessions = await ctx.db.analyticsSession.findMany({
          where: {
            ...(input?.hasConverted !== undefined && { hasConverted: input.hasConverted }),
          },
          orderBy: { lastActivityAt: 'desc' },
          take: input?.limit || 50,
        });

        return sessions;
      }),
  }),

  // ============================================================================
  // BOOKING CONVERSION METRICS
  // ============================================================================

  conversion: router({
    /**
     * Get conversion funnel: Applications → Bookings → Confirmed
     */
    getFunnel: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const [totalApplications, approvedApplications, totalBookings, confirmedBookings] =
          await Promise.all([
            ctx.db.application.count({ where }),
            ctx.db.application.count({
              where: { ...where, status: 'APPROVED' },
            }),
            ctx.db.booking.count({ where }),
            ctx.db.booking.count({
              where: { ...where, status: 'CONFIRMED' },
            }),
          ]);

        const applicationToBookingRate =
          totalApplications > 0
            ? ((totalBookings / totalApplications) * 100).toFixed(1)
            : '0.0';

        const bookingToConfirmedRate =
          totalBookings > 0
            ? ((confirmedBookings / totalBookings) * 100).toFixed(1)
            : '0.0';

        const overallConversionRate =
          totalApplications > 0
            ? ((confirmedBookings / totalApplications) * 100).toFixed(1)
            : '0.0';

        return {
          totalApplications,
          approvedApplications,
          totalBookings,
          confirmedBookings,
          rates: {
            applicationToBooking: applicationToBookingRate,
            bookingToConfirmed: bookingToConfirmedRate,
            overall: overallConversionRate,
          },
        };
      }),

    /**
     * Get booking status breakdown
     */
    getStatusBreakdown: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const statuses = await ctx.db.booking.groupBy({
          by: ['status'],
          where,
          _count: {
            id: true,
          },
        });

        const breakdown = statuses.map((item) => ({
          status: item.status,
          count: item._count.id,
        }));

        const total = breakdown.reduce((sum, item) => sum + item.count, 0);

        return {
          breakdown,
          total,
        };
      }),

    /**
     * Get average time to conversion (application to confirmed booking)
     */
    getTimeToConversion: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get confirmed bookings with user applications
        const confirmedBookings = await ctx.db.booking.findMany({
          where: {
            status: 'CONFIRMED',
          },
          include: {
            user: {
              select: {
                applications: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                  take: 1,
                },
              },
            },
          },
          take: input?.limit || 50,
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Calculate time differences
        const conversions = confirmedBookings
          .filter((booking) => booking.user.applications.length > 0)
          .map((booking) => {
            const applicationDate = booking.user.applications[0].createdAt;
            const confirmedDate = booking.updatedAt;
            const daysDiff = Math.floor(
              (confirmedDate.getTime() - applicationDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              bookingReference: booking.bookingReference,
              applicationDate,
              confirmedDate,
              daysToConvert: daysDiff,
            };
          });

        const avgDays =
          conversions.length > 0
            ? (
                conversions.reduce((sum, c) => sum + c.daysToConvert, 0) / conversions.length
              ).toFixed(1)
            : '0.0';

        return {
          conversions,
          averageDays: avgDays,
        };
      }),
  }),

  // ============================================================================
  // REVENUE ANALYTICS
  // ============================================================================

  revenue: router({
    /**
     * Get total revenue and breakdown
     */
    getOverview: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: 'SUCCEEDED' as PaymentStatus,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        // Get all successful payments
        const payments = await ctx.db.payment.aggregate({
          where,
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        });

        // Get revenue by month
        const revenueByMonth = await ctx.db.payment.groupBy({
          by: ['createdAt'],
          where,
          _sum: {
            amount: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        // Format monthly data
        const monthlyRevenue = revenueByMonth.reduce(
          (acc, payment) => {
            const monthKey = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
            if (!acc[monthKey]) {
              acc[monthKey] = 0;
            }
            acc[monthKey] += payment._sum.amount || 0;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          totalRevenue: payments._sum.amount || 0,
          totalPayments: payments._count.id,
          averagePayment:
            payments._count.id > 0
              ? Math.round((payments._sum.amount || 0) / payments._count.id)
              : 0,
          monthlyRevenue,
        };
      }),

    /**
     * Get revenue by package
     */
    getByPackage: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: 'CONFIRMED' as BookingStatus,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const bookingsByPackage = await ctx.db.booking.groupBy({
          by: ['packageId'],
          where,
          _sum: {
            totalPrice: true,
          },
          _count: {
            id: true,
          },
        });

        // Get package details
        const packageIds = bookingsByPackage.map((b) => b.packageId);
        const packages = await ctx.db.package.findMany({
          where: {
            id: { in: packageIds },
          },
          select: {
            id: true,
            name: true,
          },
        });

        const packageMap = new Map(packages.map((p) => [p.id, p.name]));

        return bookingsByPackage
          .map((item) => ({
            packageId: item.packageId,
            packageName: packageMap.get(item.packageId) || 'Unknown',
            totalRevenue: item._sum.totalPrice || 0,
            bookingCount: item._count.id,
            averageBookingValue:
              item._count.id > 0
                ? Math.round((item._sum.totalPrice || 0) / item._count.id)
                : 0,
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue);
      }),

    /**
     * Get revenue by add-on category
     */
    getByAddOnCategory: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        // Get all booking add-ons
        const bookingAddOns = await ctx.db.bookingAddOn.findMany({
          where,
          include: {
            addOn: {
              select: {
                category: true,
              },
            },
          },
        });

        // Group by category
        const categoryRevenue = bookingAddOns.reduce(
          (acc, item) => {
            const category = item.addOn.category;
            if (!acc[category]) {
              acc[category] = {
                revenue: 0,
                count: 0,
              };
            }
            acc[category].revenue += item.price * item.quantity;
            acc[category].count += item.quantity;
            return acc;
          },
          {} as Record<string, { revenue: number; count: number }>
        );

        return Object.entries(categoryRevenue)
          .map(([category, data]) => ({
            category,
            totalRevenue: data.revenue,
            totalCount: data.count,
            averagePrice: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue);
      }),

    /**
     * Get average booking value trends
     */
    getBookingValueTrends: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const bookings = await ctx.db.booking.findMany({
          where,
          select: {
            totalPrice: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        // Group by month
        const monthlyData = bookings.reduce(
          (acc, booking) => {
            const monthKey = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
            if (!acc[monthKey]) {
              acc[monthKey] = {
                total: 0,
                count: 0,
              };
            }
            acc[monthKey].total += booking.totalPrice;
            acc[monthKey].count += 1;
            return acc;
          },
          {} as Record<string, { total: number; count: number }>
        );

        const trends = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          averageValue: data.count > 0 ? Math.round(data.total / data.count) : 0,
          bookingCount: data.count,
          totalRevenue: data.total,
        }));

        return trends;
      }),
  }),

  // ============================================================================
  // GUEST DEMOGRAPHICS
  // ============================================================================

  demographics: router({
    /**
     * Get guest counts by role
     */
    getByRole: adminProcedure.query(async ({ ctx }) => {
      const roleBreakdown = await ctx.db.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      });

      return roleBreakdown.map((item) => ({
        role: item.role,
        count: item._count.id,
      }));
    }),

    /**
     * Get accommodation tier distribution
     */
    getAccommodationTiers: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const tierBreakdown = await ctx.db.booking.groupBy({
          by: ['accommodationTier'],
          where,
          _count: {
            id: true,
          },
        });

        return tierBreakdown.map((item) => ({
          tier: item.accommodationTier,
          count: item._count.id,
        }));
      }),

    /**
     * Get package duration preferences
     */
    getDurationPreferences: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const durationBreakdown = await ctx.db.booking.groupBy({
          by: ['duration'],
          where,
          _count: {
            id: true,
          },
          orderBy: {
            duration: 'asc',
          },
        });

        return durationBreakdown.map((item) => ({
          duration: item.duration,
          count: item._count.id,
        }));
      }),

    /**
     * Get booking patterns and trends
     */
    getBookingPatterns: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        // Get total unique guests who have booked
        const uniqueGuests = await ctx.db.user.count({
          where: {
            bookings: {
              some: {
                ...where,
                status: { not: 'DRAFT' },
              },
            },
          },
        });

        // Get total bookings
        const totalBookings = await ctx.db.booking.count({
          where: {
            ...where,
            status: { not: 'DRAFT' },
          },
        });

        // Get repeat booking rate
        const guestsWithMultipleBookings = await ctx.db.user.findMany({
          where: {
            bookings: {
              some: {
                ...where,
                status: { not: 'DRAFT' },
              },
            },
          },
          select: {
            _count: {
              select: {
                bookings: {
                  where: {
                    ...where,
                    status: { not: 'DRAFT' },
                  },
                },
              },
            },
          },
        });

        const repeatGuests = guestsWithMultipleBookings.filter(
          (guest) => guest._count.bookings > 1
        ).length;

        const repeatRate =
          uniqueGuests > 0 ? ((repeatGuests / uniqueGuests) * 100).toFixed(1) : '0.0';

        return {
          uniqueGuests,
          totalBookings,
          repeatGuests,
          repeatRate,
          averageBookingsPerGuest:
            uniqueGuests > 0 ? (totalBookings / uniqueGuests).toFixed(1) : '0.0',
        };
      }),
  }),

  // ============================================================================
  // ADD-ON POPULARITY
  // ============================================================================

  addOns: router({
    /**
     * Get top add-ons by booking count
     */
    getTopAddOns: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(50).default(10),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const addOnStats = await ctx.db.bookingAddOn.groupBy({
          by: ['addOnId'],
          where,
          _sum: {
            quantity: true,
            price: true,
          },
          _count: {
            id: true,
          },
        });

        // Get add-on details
        const addOnIds = addOnStats.map((item) => item.addOnId);
        const addOns = await ctx.db.addOn.findMany({
          where: {
            id: { in: addOnIds },
          },
          select: {
            id: true,
            name: true,
            category: true,
          },
        });

        const addOnMap = new Map(addOns.map((a) => [a.id, a]));

        return addOnStats
          .map((item) => {
            const addOn = addOnMap.get(item.addOnId);
            return {
              addOnId: item.addOnId,
              name: addOn?.name || 'Unknown',
              category: addOn?.category || 'DENTAL',
              bookingCount: item._count.id,
              totalQuantity: item._sum.quantity || 0,
              totalRevenue: item._sum.price || 0,
            };
          })
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, input?.limit || 10);
      }),

    /**
     * Get add-on category performance
     */
    getCategoryPerformance: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const bookingAddOns = await ctx.db.bookingAddOn.findMany({
          where,
          include: {
            addOn: {
              select: {
                category: true,
              },
            },
          },
        });

        const categoryStats = bookingAddOns.reduce(
          (acc, item) => {
            const category = item.addOn.category;
            if (!acc[category]) {
              acc[category] = {
                bookingCount: 0,
                totalQuantity: 0,
                totalRevenue: 0,
              };
            }
            acc[category].bookingCount += 1;
            acc[category].totalQuantity += item.quantity;
            acc[category].totalRevenue += item.price * item.quantity;
            return acc;
          },
          {} as Record<
            string,
            { bookingCount: number; totalQuantity: number; totalRevenue: number }
          >
        );

        return Object.entries(categoryStats)
          .map(([category, stats]) => ({
            category,
            bookingCount: stats.bookingCount,
            totalQuantity: stats.totalQuantity,
            totalRevenue: stats.totalRevenue,
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue);
      }),
  }),

  // ============================================================================
  // TRIP CAPACITY UTILIZATION
  // ============================================================================

  tripUtilization: router({
    /**
     * Get capacity utilization for all trips
     */
    getAll: adminProcedure
      .input(
        z
          .object({
            isActive: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.isActive !== undefined && { isActive: input.isActive }),
        };

        const trips = await ctx.db.trip.findMany({
          where,
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    status: { in: ['CONFIRMED', 'COMPLETED'] },
                  },
                },
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
          take: input?.limit || 50,
        });

        return trips.map((trip) => ({
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          capacity: trip.capacity,
          currentBookings: trip._count.bookings,
          utilizationPercentage: ((trip._count.bookings / trip.capacity) * 100).toFixed(1),
          availableSpots: trip.capacity - trip._count.bookings,
          isActive: trip.isActive,
        }));
      }),

    /**
     * Get trip fill rate trends over time
     */
    getFillRateTrends: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { startDate: { gte: input.startDate } }),
          ...(input?.endDate && { endDate: { lte: input.endDate } }),
        };

        const trips = await ctx.db.trip.findMany({
          where,
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    status: { in: ['CONFIRMED', 'COMPLETED'] },
                  },
                },
              },
            },
          },
          orderBy: {
            startDate: 'asc',
          },
        });

        return trips.map((trip) => ({
          tripName: trip.name,
          startDate: trip.startDate,
          capacity: trip.capacity,
          bookings: trip._count.bookings,
          fillRate: ((trip._count.bookings / trip.capacity) * 100).toFixed(1),
        }));
      }),

    /**
     * Get upcoming trip forecasts
     */
    getUpcomingForecasts: adminProcedure.query(async ({ ctx }) => {
      const now = new Date();

      const upcomingTrips = await ctx.db.trip.findMany({
        where: {
          isActive: true,
          startDate: { gte: now },
        },
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
                },
              },
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        take: 10,
      });

      return upcomingTrips.map((trip) => {
        const daysUntilTrip = Math.floor(
          (trip.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          daysUntilTrip,
          capacity: trip.capacity,
          currentBookings: trip._count.bookings,
          utilizationPercentage: ((trip._count.bookings / trip.capacity) * 100).toFixed(1),
          spotsRemaining: trip.capacity - trip._count.bookings,
        };
      });
    }),
  }),

  // ============================================================================
  // PARTNER REFERRAL ANALYTICS
  // ============================================================================

  partnerReferrals: router({
    /**
     * Get total referrals by partner
     */
    getByPartner: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(100).default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const referralStats = await ctx.db.partnerReferral.groupBy({
          by: ['partnerId'],
          where,
          _sum: {
            pointsEarned: true,
          },
          _count: {
            id: true,
          },
        });

        // Get partner details
        const partnerIds = referralStats.map((item) => item.partnerId);
        const partners = await ctx.db.partnerProfile.findMany({
          where: {
            id: { in: partnerIds },
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        });

        const partnerMap = new Map(partners.map((p) => [p.id, p]));

        return referralStats
          .map((item) => {
            const partner = partnerMap.get(item.partnerId);
            return {
              partnerId: item.partnerId,
              clubName: partner?.clubName || 'Unknown',
              email: partner?.user.email || 'Unknown',
              tier: partner?.tier || 'BRONZE',
              totalReferrals: item._count.id,
              totalPointsEarned: item._sum.pointsEarned || 0,
              currentPoints: partner?.passportPoints || 0,
            };
          })
          .sort((a, b) => b.totalReferrals - a.totalReferrals)
          .slice(0, input?.limit || 50);
      }),

    /**
     * Get referral conversion rates
     */
    getConversionRates: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get all bookings with referral codes in date range
        const where = {
          referredBy: { not: null },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const totalReferredBookings = await ctx.db.booking.count({ where });

        const confirmedReferredBookings = await ctx.db.booking.count({
          where: {
            ...where,
            status: 'CONFIRMED',
          },
        });

        const conversionRate =
          totalReferredBookings > 0
            ? ((confirmedReferredBookings / totalReferredBookings) * 100).toFixed(1)
            : '0.0';

        return {
          totalReferredBookings,
          confirmedReferredBookings,
          conversionRate,
        };
      }),

    /**
     * Get partner tier performance
     */
    getTierPerformance: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        // Get all referrals
        const referrals = await ctx.db.partnerReferral.findMany({
          where,
          include: {
            partner: {
              select: {
                tier: true,
              },
            },
          },
        });

        const tierStats = referrals.reduce(
          (acc, referral) => {
            const tier = referral.partner.tier;
            if (!acc[tier]) {
              acc[tier] = {
                count: 0,
                totalPoints: 0,
              };
            }
            acc[tier].count += 1;
            acc[tier].totalPoints += referral.pointsEarned;
            return acc;
          },
          {} as Record<string, { count: number; totalPoints: number }>
        );

        return Object.entries(tierStats).map(([tier, stats]) => ({
          tier,
          referralCount: stats.count,
          totalPoints: stats.totalPoints,
          averagePointsPerReferral:
            stats.count > 0 ? Math.round(stats.totalPoints / stats.count) : 0,
        }));
      }),

    /**
     * Get points earned tracking
     */
    getPointsTracking: adminProcedure
      .input(
        z
          .object({
            partnerId: z.string().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input?.partnerId && { partnerId: input.partnerId }),
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && {
            createdAt: { lte: input.endDate },
          }),
        };

        const pointsHistory = await ctx.db.partnerReferral.findMany({
          where,
          include: {
            partner: {
              select: {
                clubName: true,
                tier: true,
              },
            },
            booking: {
              select: {
                bookingReference: true,
                totalPrice: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return pointsHistory.map((item) => ({
          id: item.id,
          clubName: item.partner.clubName,
          tier: item.partner.tier,
          bookingReference: item.booking.bookingReference,
          bookingValue: item.booking.totalPrice,
          pointsEarned: item.pointsEarned,
          isRedeemed: item.isRedeemed,
          earnedDate: item.createdAt,
        }));
      }),
  }),

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  export: router({
    /**
     * Generate CSV export data for analytics
     */
    generateCSV: adminProcedure
      .input(
        z.object({
          reportType: z.enum([
            'bookings',
            'revenue',
            'addons',
            'trips',
            'referrals',
          ]),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { reportType, startDate, endDate } = input;

        const where = {
          ...(startDate && { createdAt: { gte: startDate } }),
          ...(endDate && { createdAt: { lte: endDate } }),
        };

        switch (reportType) {
          case 'bookings': {
            const bookings = await ctx.db.booking.findMany({
              where,
              include: {
                user: {
                  select: {
                    email: true,
                    guestProfile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
                package: {
                  select: {
                    name: true,
                  },
                },
                trip: {
                  select: {
                    name: true,
                    startDate: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            return {
              headers: [
                'Booking Reference',
                'Guest Name',
                'Email',
                'Package',
                'Trip',
                'Status',
                'Duration',
                'Accommodation',
                'Total Price',
                'Created At',
              ],
              rows: bookings.map((b) => [
                b.bookingReference,
                b.user.guestProfile
                  ? `${b.user.guestProfile.firstName} ${b.user.guestProfile.lastName}`
                  : 'N/A',
                b.user.email,
                b.package.name,
                b.trip?.name || 'N/A',
                b.status,
                `${b.duration} days`,
                b.accommodationTier,
                `$${(b.totalPrice / 100).toFixed(2)}`,
                b.createdAt.toISOString(),
              ]),
            };
          }

          case 'revenue': {
            const payments = await ctx.db.payment.findMany({
              where: {
                ...where,
                status: 'SUCCEEDED',
              },
              include: {
                booking: {
                  select: {
                    bookingReference: true,
                    user: {
                      select: {
                        email: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            return {
              headers: [
                'Payment ID',
                'Booking Reference',
                'Guest Email',
                'Amount',
                'Status',
                'Is Installment',
                'Created At',
              ],
              rows: payments.map((p) => [
                p.id,
                p.booking.bookingReference,
                p.booking.user.email,
                `$${(p.amount / 100).toFixed(2)}`,
                p.status,
                p.isInstallment ? 'Yes' : 'No',
                p.createdAt.toISOString(),
              ]),
            };
          }

          case 'addons': {
            const addOns = await ctx.db.bookingAddOn.findMany({
              where,
              include: {
                booking: {
                  select: {
                    bookingReference: true,
                  },
                },
                addOn: {
                  select: {
                    name: true,
                    category: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            return {
              headers: [
                'Booking Reference',
                'Add-On Name',
                'Category',
                'Quantity',
                'Price',
                'Total',
                'Created At',
              ],
              rows: addOns.map((a) => [
                a.booking.bookingReference,
                a.addOn.name,
                a.addOn.category,
                a.quantity.toString(),
                `$${(a.price / 100).toFixed(2)}`,
                `$${((a.price * a.quantity) / 100).toFixed(2)}`,
                a.createdAt.toISOString(),
              ]),
            };
          }

          case 'trips': {
            const trips = await ctx.db.trip.findMany({
              where: {
                ...(startDate && { startDate: { gte: startDate } }),
                ...(endDate && { endDate: { lte: endDate } }),
              },
              include: {
                _count: {
                  select: {
                    bookings: true,
                  },
                },
              },
              orderBy: {
                startDate: 'desc',
              },
            });

            return {
              headers: [
                'Trip Name',
                'Destination',
                'Start Date',
                'End Date',
                'Capacity',
                'Current Bookings',
                'Utilization %',
                'Is Active',
              ],
              rows: trips.map((t) => [
                t.name,
                t.destination,
                t.startDate.toISOString().split('T')[0],
                t.endDate.toISOString().split('T')[0],
                t.capacity.toString(),
                t._count.bookings.toString(),
                `${((t._count.bookings / t.capacity) * 100).toFixed(1)}%`,
                t.isActive ? 'Yes' : 'No',
              ]),
            };
          }

          case 'referrals': {
            const referrals = await ctx.db.partnerReferral.findMany({
              where,
              include: {
                partner: {
                  select: {
                    clubName: true,
                    tier: true,
                    user: {
                      select: {
                        email: true,
                      },
                    },
                  },
                },
                booking: {
                  select: {
                    bookingReference: true,
                    totalPrice: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            return {
              headers: [
                'Club Name',
                'Partner Email',
                'Tier',
                'Booking Reference',
                'Booking Value',
                'Points Earned',
                'Is Redeemed',
                'Created At',
              ],
              rows: referrals.map((r) => [
                r.partner.clubName,
                r.partner.user.email,
                r.partner.tier,
                r.booking.bookingReference,
                `$${(r.booking.totalPrice / 100).toFixed(2)}`,
                r.pointsEarned.toString(),
                r.isRedeemed ? 'Yes' : 'No',
                r.createdAt.toISOString(),
              ]),
            };
          }

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid report type',
            });
        }
      }),
  }),
});
