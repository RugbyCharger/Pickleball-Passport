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
// BOOKING FUNNEL STAGE DEFINITIONS (E13-S2)
// ============================================================================

const FUNNEL_STAGES = [
  'HOMEPAGE',
  'PACKAGE_VIEW',
  'CONFIGURATOR',
  'REVIEW',
  'PAYMENT',
  'CONFIRMATION',
] as const;

type FunnelStage = (typeof FUNNEL_STAGES)[number];

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// ============================================================================
// TYPES
// ============================================================================

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
  // BOOKING FUNNEL ANALYTICS (E13-S2)
  // ============================================================================

  bookingFunnel: router({
    /**
     * Get complete booking funnel data with drop-off rates
     * Tracks: Homepage → Package View → Configurator → Review → Payment → Confirmation
     */
    getFunnelData: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            packageId: z.string().optional(),
            utmSource: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Build date filter for analytics events
        const eventWhere = {
          eventType: 'FUNNEL_STEP' as AnalyticsEventType,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          ...(input?.utmSource && { utmSource: input.utmSource }),
        };

        // Get all funnel step events
        const funnelEvents = await ctx.db.analyticsEvent.findMany({
          where: eventWhere,
          select: {
            id: true,
            sessionId: true,
            properties: true,
            createdAt: true,
            utmSource: true,
          },
        });

        // Also count page views to homepage and package pages
        const pageViewEvents = await ctx.db.analyticsEvent.findMany({
          where: {
            eventType: 'PAGE_VIEW' as AnalyticsEventType,
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            ...(input?.utmSource && { utmSource: input.utmSource }),
          },
          select: {
            id: true,
            sessionId: true,
            properties: true,
            createdAt: true,
            pageUrl: true,
          },
        });

        // Count sessions at each funnel stage
        const stageCounts: Record<FunnelStage, Set<string>> = {
          HOMEPAGE: new Set(),
          PACKAGE_VIEW: new Set(),
          CONFIGURATOR: new Set(),
          REVIEW: new Set(),
          PAYMENT: new Set(),
          CONFIRMATION: new Set(),
        };

        // Process page views for HOMEPAGE and PACKAGE_VIEW stages
        pageViewEvents.forEach((event) => {
          const props = event.properties as { path?: string } | null;
          const url = event.pageUrl || props?.path || '';

          // Homepage
          if (url === '/' || url.includes('/home') || url === '') {
            stageCounts.HOMEPAGE.add(event.sessionId);
          }

          // Package view (when viewing specific package pages)
          if (url.includes('/packages/') && !url.includes('/configurator')) {
            const packageFromUrl = url.match(/\/packages\/([^/]+)/)?.[1];
            if (!input?.packageId || packageFromUrl === input.packageId) {
              stageCounts.PACKAGE_VIEW.add(event.sessionId);
            }
          }
        });

        // Process funnel step events for remaining stages
        funnelEvents.forEach((event) => {
          const props = event.properties as { step?: string; packageId?: string } | null;
          const step = props?.step?.toUpperCase();
          const eventPackageId = props?.packageId;

          // Filter by package if specified
          if (input?.packageId && eventPackageId && eventPackageId !== input.packageId) {
            return;
          }

          if (step && step in stageCounts) {
            stageCounts[step as FunnelStage].add(event.sessionId);
          }
        });

        // Also count conversions as CONFIRMATION stage
        const conversionEvents = await ctx.db.analyticsEvent.findMany({
          where: {
            eventType: 'CONVERSION' as AnalyticsEventType,
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            ...(input?.utmSource && { utmSource: input.utmSource }),
          },
          select: {
            sessionId: true,
            properties: true,
          },
        });

        conversionEvents.forEach((event) => {
          const props = event.properties as { type?: string; packageId?: string } | null;
          if (
            props?.type === 'BOOKING_COMPLETED' ||
            props?.type === 'PAYMENT_COMPLETED'
          ) {
            if (!input?.packageId || props?.packageId === input.packageId) {
              stageCounts.CONFIRMATION.add(event.sessionId);
            }
          }
        });

        // Calculate funnel data with conversion rates
        const funnelData = FUNNEL_STAGES.map((stage, index) => {
          const count = stageCounts[stage].size;
          const previousStageCount =
            index > 0 ? stageCounts[FUNNEL_STAGES[index - 1]].size : count;
          const dropOffRate =
            previousStageCount > 0
              ? (((previousStageCount - count) / previousStageCount) * 100).toFixed(1)
              : '0.0';
          const conversionRate =
            previousStageCount > 0
              ? ((count / previousStageCount) * 100).toFixed(1)
              : '100.0';
          const overallConversionRate =
            stageCounts.HOMEPAGE.size > 0
              ? ((count / stageCounts.HOMEPAGE.size) * 100).toFixed(1)
              : '0.0';

          return {
            stage,
            stageLabel: stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            count,
            dropOffRate,
            conversionRate,
            overallConversionRate,
          };
        });

        return {
          funnelData,
          totalSessions: stageCounts.HOMEPAGE.size,
          finalConversions: stageCounts.CONFIRMATION.size,
          overallConversionRate:
            stageCounts.HOMEPAGE.size > 0
              ? (
                  (stageCounts.CONFIRMATION.size / stageCounts.HOMEPAGE.size) *
                  100
                ).toFixed(2)
              : '0.00',
        };
      }),

    /**
     * Get average time spent at each funnel stage
     */
    getTimeAtStages: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            packageId: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get funnel events with timestamps
        const funnelEvents = await ctx.db.analyticsEvent.findMany({
          where: {
            eventType: 'FUNNEL_STEP' as AnalyticsEventType,
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          },
          select: {
            sessionId: true,
            properties: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Also get page views for homepage and package view times
        const pageViewEvents = await ctx.db.analyticsEvent.findMany({
          where: {
            eventType: 'PAGE_VIEW' as AnalyticsEventType,
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          },
          select: {
            sessionId: true,
            pageUrl: true,
            properties: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group events by session
        const sessionEvents: Record<
          string,
          Array<{ stage: FunnelStage; timestamp: Date }>
        > = {};

        // Process page views
        pageViewEvents.forEach((event) => {
          const props = event.properties as { path?: string } | null;
          const url = event.pageUrl || props?.path || '';

          if (!sessionEvents[event.sessionId]) {
            sessionEvents[event.sessionId] = [];
          }

          if (url === '/' || url.includes('/home')) {
            sessionEvents[event.sessionId].push({
              stage: 'HOMEPAGE',
              timestamp: event.createdAt,
            });
          } else if (url.includes('/packages/') && !url.includes('/configurator')) {
            sessionEvents[event.sessionId].push({
              stage: 'PACKAGE_VIEW',
              timestamp: event.createdAt,
            });
          }
        });

        // Process funnel events
        funnelEvents.forEach((event) => {
          const props = event.properties as { step?: string; packageId?: string } | null;
          const step = props?.step?.toUpperCase() as FunnelStage;

          if (!sessionEvents[event.sessionId]) {
            sessionEvents[event.sessionId] = [];
          }

          if (step && FUNNEL_STAGES.includes(step)) {
            if (!input?.packageId || props?.packageId === input.packageId) {
              sessionEvents[event.sessionId].push({
                stage: step,
                timestamp: event.createdAt,
              });
            }
          }
        });

        // Calculate average time at each stage
        const stageTimes: Record<FunnelStage, number[]> = {
          HOMEPAGE: [],
          PACKAGE_VIEW: [],
          CONFIGURATOR: [],
          REVIEW: [],
          PAYMENT: [],
          CONFIRMATION: [],
        };

        Object.values(sessionEvents).forEach((events) => {
          // Sort events by timestamp
          events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          // Calculate time between consecutive stages
          for (let i = 0; i < events.length - 1; i++) {
            const currentStage = events[i].stage;
            const timeDiff =
              (events[i + 1].timestamp.getTime() - events[i].timestamp.getTime()) /
              1000; // seconds

            // Only count reasonable times (less than 1 hour)
            if (timeDiff > 0 && timeDiff < 3600) {
              stageTimes[currentStage].push(timeDiff);
            }
          }
        });

        // Calculate averages
        return FUNNEL_STAGES.map((stage) => {
          const times = stageTimes[stage];
          const avgSeconds =
            times.length > 0
              ? times.reduce((sum, t) => sum + t, 0) / times.length
              : 0;

          return {
            stage,
            stageLabel: stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            averageTimeSeconds: Math.round(avgSeconds),
            averageTimeFormatted: formatDuration(avgSeconds),
            sampleCount: times.length,
          };
        });
      }),

    /**
     * Get funnel data grouped by time period for trend analysis
     */
    getFunnelTrends: adminProcedure
      .input(
        z.object({
          period: z.enum(['day', 'week', 'month']),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { period, startDate, endDate } = input;

        // Get all relevant events
        const events = await ctx.db.analyticsEvent.findMany({
          where: {
            eventType: { in: ['FUNNEL_STEP', 'PAGE_VIEW', 'CONVERSION'] },
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } }),
          },
          select: {
            eventType: true,
            sessionId: true,
            properties: true,
            pageUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group events by time period
        const groupedData: Record<
          string,
          Record<FunnelStage, Set<string>>
        > = {};

        events.forEach((event) => {
          let periodKey: string;
          const date = event.createdAt;

          switch (period) {
            case 'day':
              periodKey = date.toISOString().slice(0, 10);
              break;
            case 'week':
              const d = new Date(date);
              d.setDate(d.getDate() - d.getDay());
              periodKey = d.toISOString().slice(0, 10);
              break;
            case 'month':
              periodKey = date.toISOString().slice(0, 7);
              break;
          }

          if (!groupedData[periodKey]) {
            groupedData[periodKey] = {
              HOMEPAGE: new Set(),
              PACKAGE_VIEW: new Set(),
              CONFIGURATOR: new Set(),
              REVIEW: new Set(),
              PAYMENT: new Set(),
              CONFIRMATION: new Set(),
            };
          }

          const props = event.properties as {
            step?: string;
            path?: string;
            type?: string;
          } | null;

          if (event.eventType === 'PAGE_VIEW') {
            const url = event.pageUrl || props?.path || '';
            if (url === '/' || url.includes('/home')) {
              groupedData[periodKey].HOMEPAGE.add(event.sessionId);
            } else if (url.includes('/packages/') && !url.includes('/configurator')) {
              groupedData[periodKey].PACKAGE_VIEW.add(event.sessionId);
            }
          } else if (event.eventType === 'FUNNEL_STEP') {
            const step = props?.step?.toUpperCase() as FunnelStage;
            if (step && FUNNEL_STAGES.includes(step)) {
              groupedData[periodKey][step].add(event.sessionId);
            }
          } else if (event.eventType === 'CONVERSION') {
            if (
              props?.type === 'BOOKING_COMPLETED' ||
              props?.type === 'PAYMENT_COMPLETED'
            ) {
              groupedData[periodKey].CONFIRMATION.add(event.sessionId);
            }
          }
        });

        // Convert to array format
        return Object.entries(groupedData)
          .map(([periodKey, stages]) => ({
            period: periodKey,
            homepage: stages.HOMEPAGE.size,
            packageView: stages.PACKAGE_VIEW.size,
            configurator: stages.CONFIGURATOR.size,
            review: stages.REVIEW.size,
            payment: stages.PAYMENT.size,
            confirmation: stages.CONFIRMATION.size,
            overallConversionRate:
              stages.HOMEPAGE.size > 0
                ? ((stages.CONFIRMATION.size / stages.HOMEPAGE.size) * 100).toFixed(1)
                : '0.0',
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
      }),

    /**
     * Get available filter options (packages, utm sources)
     */
    getFilterOptions: adminProcedure.query(async ({ ctx }) => {
      // Get all packages
      const packages = await ctx.db.package.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      // Get unique UTM sources from events
      const utmSources = await ctx.db.analyticsEvent.groupBy({
        by: ['utmSource'],
        where: {
          utmSource: { not: null },
        },
      });

      return {
        packages: packages.map((p) => ({ id: p.id, name: p.name })),
        utmSources: utmSources
          .filter((s) => s.utmSource)
          .map((s) => s.utmSource as string),
      };
    }),
  }),

  // ============================================================================
  // CONVERSION TRACKING (E13-S3)
  // ============================================================================

  conversionTracking: router({
    /**
     * Get conversion events by type (Application Submitted, Booking Completed, Payment Made)
     */
    getConversionsByType: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const eventWhere = {
          eventType: 'CONVERSION' as AnalyticsEventType,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all conversion events
        const conversionEvents = await ctx.db.analyticsEvent.findMany({
          where: eventWhere,
          select: {
            id: true,
            properties: true,
            utmSource: true,
            utmMedium: true,
            utmCampaign: true,
            createdAt: true,
          },
        });

        // Count conversions by type
        const conversionsByType: Record<string, number> = {
          APPLICATION_SUBMITTED: 0,
          BOOKING_COMPLETED: 0,
          PAYMENT_MADE: 0,
        };

        conversionEvents.forEach((event) => {
          const props = event.properties as { type?: string } | null;
          const type = props?.type || 'UNKNOWN';
          if (type in conversionsByType) {
            conversionsByType[type]++;
          }
        });

        // Also count from actual database records for accuracy
        const [applicationsCount, bookingsCount, paymentsCount] = await Promise.all([
          ctx.db.application.count({
            where: {
              ...(input?.startDate && { createdAt: { gte: input.startDate } }),
              ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            },
          }),
          ctx.db.booking.count({
            where: {
              status: 'CONFIRMED',
              ...(input?.startDate && { createdAt: { gte: input.startDate } }),
              ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            },
          }),
          ctx.db.payment.count({
            where: {
              status: 'SUCCEEDED',
              ...(input?.startDate && { createdAt: { gte: input.startDate } }),
              ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            },
          }),
        ]);

        return {
          eventBased: conversionsByType,
          databaseBased: {
            applications: applicationsCount,
            confirmedBookings: bookingsCount,
            successfulPayments: paymentsCount,
          },
          totalConversionEvents: conversionEvents.length,
        };
      }),

    /**
     * Get conversion rates by traffic source (utm_source, utm_medium, utm_campaign)
     */
    getByTrafficSource: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            groupBy: z.enum(['source', 'medium', 'campaign']).default('source'),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const sessionWhere = {
          ...(input?.startDate && { startedAt: { gte: input.startDate } }),
          ...(input?.endDate && { startedAt: { lte: input.endDate } }),
        };

        // Get sessions with UTM data
        const sessions = await ctx.db.analyticsSession.findMany({
          where: sessionWhere,
          select: {
            id: true,
            utmSource: true,
            utmMedium: true,
            utmCampaign: true,
            hasConverted: true,
            conversionType: true,
          },
        });

        // Group by the selected attribute
        const groupKey = input?.groupBy || 'source';
        const getGroupValue = (session: {
          utmSource: string | null;
          utmMedium: string | null;
          utmCampaign: string | null;
        }) => {
          switch (groupKey) {
            case 'source':
              return session.utmSource || 'Direct';
            case 'medium':
              return session.utmMedium || 'None';
            case 'campaign':
              return session.utmCampaign || 'None';
          }
        };

        const grouped: Record<
          string,
          { totalSessions: number; convertedSessions: number }
        > = {};

        sessions.forEach((session) => {
          const key = getGroupValue(session);
          if (!grouped[key]) {
            grouped[key] = { totalSessions: 0, convertedSessions: 0 };
          }
          grouped[key].totalSessions++;
          if (session.hasConverted) {
            grouped[key].convertedSessions++;
          }
        });

        // Convert to array and calculate rates
        const results = Object.entries(grouped)
          .map(([name, data]) => ({
            name,
            totalSessions: data.totalSessions,
            conversions: data.convertedSessions,
            conversionRate:
              data.totalSessions > 0
                ? ((data.convertedSessions / data.totalSessions) * 100).toFixed(2)
                : '0.00',
          }))
          .sort((a, b) => b.conversions - a.conversions);

        return {
          groupBy: groupKey,
          results,
          totalSessions: sessions.length,
          totalConversions: sessions.filter((s) => s.hasConverted).length,
        };
      }),

    /**
     * Get conversion trends over time (daily/weekly/monthly)
     */
    getConversionTrends: adminProcedure
      .input(
        z.object({
          period: z.enum(['day', 'week', 'month']),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          conversionType: z
            .enum(['APPLICATION_SUBMITTED', 'BOOKING_COMPLETED', 'PAYMENT_MADE', 'ALL'])
            .default('ALL'),
        })
      )
      .query(async ({ ctx, input }) => {
        const { period, startDate, endDate, conversionType } = input;

        // Get conversion events
        const eventWhere = {
          eventType: 'CONVERSION' as AnalyticsEventType,
          ...(startDate && { createdAt: { gte: startDate } }),
          ...(endDate && { createdAt: { lte: endDate } }),
        };

        const events = await ctx.db.analyticsEvent.findMany({
          where: eventWhere,
          select: {
            properties: true,
            createdAt: true,
            utmSource: true,
          },
        });

        // Group by time period
        const grouped: Record<
          string,
          { total: number; byType: Record<string, number>; bySources: Record<string, number> }
        > = {};

        events.forEach((event) => {
          const props = event.properties as { type?: string } | null;
          const type = props?.type || 'UNKNOWN';

          // Filter by conversion type if specified
          if (conversionType !== 'ALL' && type !== conversionType) {
            return;
          }

          let periodKey: string;
          const date = event.createdAt;

          switch (period) {
            case 'day':
              periodKey = date.toISOString().slice(0, 10);
              break;
            case 'week':
              const d = new Date(date);
              d.setDate(d.getDate() - d.getDay());
              periodKey = d.toISOString().slice(0, 10);
              break;
            case 'month':
              periodKey = date.toISOString().slice(0, 7);
              break;
          }

          if (!grouped[periodKey]) {
            grouped[periodKey] = { total: 0, byType: {}, bySources: {} };
          }

          grouped[periodKey].total++;
          grouped[periodKey].byType[type] = (grouped[periodKey].byType[type] || 0) + 1;

          const source = event.utmSource || 'Direct';
          grouped[periodKey].bySources[source] =
            (grouped[periodKey].bySources[source] || 0) + 1;
        });

        // Convert to array and sort by date
        const trends = Object.entries(grouped)
          .map(([periodKey, data]) => ({
            period: periodKey,
            total: data.total,
            applications: data.byType['APPLICATION_SUBMITTED'] || 0,
            bookings: data.byType['BOOKING_COMPLETED'] || 0,
            payments: data.byType['PAYMENT_MADE'] || 0,
            topSources: Object.entries(data.bySources)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([name, count]) => ({ name, count })),
          }))
          .sort((a, b) => a.period.localeCompare(b.period));

        return {
          period,
          conversionType,
          trends,
          totalConversions: events.length,
        };
      }),

    /**
     * Get top converting sources and campaigns
     */
    getTopConverters: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(50).default(10),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const eventWhere = {
          eventType: 'CONVERSION' as AnalyticsEventType,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all conversion events
        const events = await ctx.db.analyticsEvent.findMany({
          where: eventWhere,
          select: {
            utmSource: true,
            utmMedium: true,
            utmCampaign: true,
            properties: true,
          },
        });

        // Group by source
        const sourceStats: Record<string, { conversions: number; types: Record<string, number> }> =
          {};
        const campaignStats: Record<
          string,
          { conversions: number; types: Record<string, number> }
        > = {};

        events.forEach((event) => {
          const props = event.properties as { type?: string } | null;
          const type = props?.type || 'UNKNOWN';
          const source = event.utmSource || 'Direct';
          const campaign = event.utmCampaign || 'None';

          // Track sources
          if (!sourceStats[source]) {
            sourceStats[source] = { conversions: 0, types: {} };
          }
          sourceStats[source].conversions++;
          sourceStats[source].types[type] = (sourceStats[source].types[type] || 0) + 1;

          // Track campaigns (only if there's a campaign)
          if (event.utmCampaign) {
            if (!campaignStats[campaign]) {
              campaignStats[campaign] = { conversions: 0, types: {} };
            }
            campaignStats[campaign].conversions++;
            campaignStats[campaign].types[type] =
              (campaignStats[campaign].types[type] || 0) + 1;
          }
        });

        // Get session counts for conversion rate calculation
        const sessionsBySource = await ctx.db.analyticsSession.groupBy({
          by: ['utmSource'],
          where: {
            ...(input?.startDate && { startedAt: { gte: input.startDate } }),
            ...(input?.endDate && { startedAt: { lte: input.endDate } }),
          },
          _count: { id: true },
        });

        const sessionsBySourceMap = new Map(
          sessionsBySource.map((s) => [s.utmSource || 'Direct', s._count.id])
        );

        // Format top sources
        const topSources = Object.entries(sourceStats)
          .map(([name, data]) => {
            const totalSessions = sessionsBySourceMap.get(name) || data.conversions;
            return {
              name,
              conversions: data.conversions,
              totalSessions,
              conversionRate:
                totalSessions > 0
                  ? ((data.conversions / totalSessions) * 100).toFixed(2)
                  : '0.00',
              breakdown: data.types,
            };
          })
          .sort((a, b) => b.conversions - a.conversions)
          .slice(0, input?.limit || 10);

        // Format top campaigns
        const topCampaigns = Object.entries(campaignStats)
          .map(([name, data]) => ({
            name,
            conversions: data.conversions,
            breakdown: data.types,
          }))
          .sort((a, b) => b.conversions - a.conversions)
          .slice(0, input?.limit || 10);

        return {
          topSources,
          topCampaigns,
          totalConversions: events.length,
        };
      }),

    /**
     * Get A/B test variant performance (optional feature)
     */
    getVariantPerformance: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            experimentId: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const eventWhere = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all events with variant information
        const events = await ctx.db.analyticsEvent.findMany({
          where: eventWhere,
          select: {
            eventType: true,
            properties: true,
            sessionId: true,
          },
        });

        // Track variants from events with experiment data
        const variantStats: Record<
          string,
          {
            experimentId: string;
            variant: string;
            sessions: Set<string>;
            conversions: number;
          }
        > = {};

        events.forEach((event) => {
          const props = event.properties as {
            experimentId?: string;
            variant?: string;
            type?: string;
          } | null;

          if (props?.experimentId && props?.variant) {
            // Filter by experimentId if specified
            if (input?.experimentId && props.experimentId !== input.experimentId) {
              return;
            }

            const key = `${props.experimentId}:${props.variant}`;

            if (!variantStats[key]) {
              variantStats[key] = {
                experimentId: props.experimentId,
                variant: props.variant,
                sessions: new Set(),
                conversions: 0,
              };
            }

            variantStats[key].sessions.add(event.sessionId);

            if (event.eventType === 'CONVERSION') {
              variantStats[key].conversions++;
            }
          }
        });

        // Group by experiment
        const experiments: Record<
          string,
          Array<{
            variant: string;
            sessions: number;
            conversions: number;
            conversionRate: string;
          }>
        > = {};

        Object.values(variantStats).forEach((stat) => {
          if (!experiments[stat.experimentId]) {
            experiments[stat.experimentId] = [];
          }

          const sessionCount = stat.sessions.size;
          experiments[stat.experimentId].push({
            variant: stat.variant,
            sessions: sessionCount,
            conversions: stat.conversions,
            conversionRate:
              sessionCount > 0
                ? ((stat.conversions / sessionCount) * 100).toFixed(2)
                : '0.00',
          });
        });

        // Sort variants by conversion rate within each experiment
        Object.keys(experiments).forEach((expId) => {
          experiments[expId].sort(
            (a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
          );
        });

        return {
          experiments,
          hasData: Object.keys(experiments).length > 0,
        };
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

    /**
     * Get revenue trends by period (daily/weekly/monthly/yearly)
     * E13-S4: Revenue Reports
     */
    getRevenueTrends: adminProcedure
      .input(
        z.object({
          period: z.enum(['day', 'week', 'month', 'year']),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { period, startDate, endDate } = input;

        const where = {
          status: 'SUCCEEDED' as PaymentStatus,
          ...(startDate && { createdAt: { gte: startDate } }),
          ...(endDate && { createdAt: { lte: endDate } }),
        };

        const payments = await ctx.db.payment.findMany({
          where,
          select: {
            amount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        // Group by period
        const groupedData = payments.reduce(
          (acc, payment) => {
            let key: string;
            const date = payment.createdAt;

            switch (period) {
              case 'day':
                key = date.toISOString().substring(0, 10); // YYYY-MM-DD
                break;
              case 'week': {
                // Get the Monday of the week
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                d.setDate(diff);
                key = d.toISOString().substring(0, 10);
                break;
              }
              case 'month':
                key = date.toISOString().substring(0, 7); // YYYY-MM
                break;
              case 'year':
                key = date.toISOString().substring(0, 4); // YYYY
                break;
            }

            if (!acc[key]) {
              acc[key] = { revenue: 0, count: 0 };
            }
            acc[key].revenue += payment.amount;
            acc[key].count += 1;
            return acc;
          },
          {} as Record<string, { revenue: number; count: number }>
        );

        const trends = Object.entries(groupedData)
          .map(([periodKey, data]) => ({
            period: periodKey,
            revenue: data.revenue,
            paymentCount: data.count,
            averagePayment: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));

        return {
          trends,
          totalRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
          totalPayments: trends.reduce((sum, t) => sum + t.paymentCount, 0),
        };
      }),

    /**
     * Compare revenue between two time periods
     * E13-S4: Revenue Reports
     */
    getRevenueComparison: adminProcedure
      .input(
        z.object({
          currentPeriodStart: z.date(),
          currentPeriodEnd: z.date(),
          previousPeriodStart: z.date(),
          previousPeriodEnd: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd } = input;

        // Current period metrics
        const currentPayments = await ctx.db.payment.aggregate({
          where: {
            status: 'SUCCEEDED',
            createdAt: {
              gte: currentPeriodStart,
              lte: currentPeriodEnd,
            },
          },
          _sum: { amount: true },
          _count: { id: true },
        });

        // Previous period metrics
        const previousPayments = await ctx.db.payment.aggregate({
          where: {
            status: 'SUCCEEDED',
            createdAt: {
              gte: previousPeriodStart,
              lte: previousPeriodEnd,
            },
          },
          _sum: { amount: true },
          _count: { id: true },
        });

        // Current period bookings
        const currentBookings = await ctx.db.booking.count({
          where: {
            status: 'CONFIRMED',
            createdAt: {
              gte: currentPeriodStart,
              lte: currentPeriodEnd,
            },
          },
        });

        // Previous period bookings
        const previousBookings = await ctx.db.booking.count({
          where: {
            status: 'CONFIRMED',
            createdAt: {
              gte: previousPeriodStart,
              lte: previousPeriodEnd,
            },
          },
        });

        const currentRevenue = currentPayments._sum.amount || 0;
        const previousRevenue = previousPayments._sum.amount || 0;
        const revenueChange = previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
          : currentRevenue > 0 ? '100.0' : '0.0';

        const bookingChange = previousBookings > 0
          ? ((currentBookings - previousBookings) / previousBookings * 100).toFixed(1)
          : currentBookings > 0 ? '100.0' : '0.0';

        const currentAverage = currentPayments._count.id > 0
          ? Math.round(currentRevenue / currentPayments._count.id)
          : 0;
        const previousAverage = previousPayments._count.id > 0
          ? Math.round(previousRevenue / previousPayments._count.id)
          : 0;
        const averageChange = previousAverage > 0
          ? ((currentAverage - previousAverage) / previousAverage * 100).toFixed(1)
          : currentAverage > 0 ? '100.0' : '0.0';

        return {
          current: {
            revenue: currentRevenue,
            payments: currentPayments._count.id,
            bookings: currentBookings,
            averagePayment: currentAverage,
          },
          previous: {
            revenue: previousRevenue,
            payments: previousPayments._count.id,
            bookings: previousBookings,
            averagePayment: previousAverage,
          },
          changes: {
            revenue: parseFloat(revenueChange),
            bookings: parseFloat(bookingChange),
            averagePayment: parseFloat(averageChange),
          },
        };
      }),

    /**
     * Get projected revenue based on pending/upcoming bookings
     * E13-S4: Revenue Reports
     */
    getProjectedRevenue: adminProcedure.query(async ({ ctx }) => {
      // Get all pending and confirmed bookings that haven't been fully paid
      // Valid BookingStatus values: DRAFT, PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED
      const pendingBookings = await ctx.db.booking.findMany({
        where: {
          status: {
            in: ['PENDING_PAYMENT', 'CONFIRMED'] as BookingStatus[],
          },
        },
        include: {
          payments: {
            where: {
              status: 'SUCCEEDED',
            },
            select: {
              amount: true,
            },
          },
          trip: {
            select: {
              startDate: true,
            },
          },
        },
      });

      // Calculate outstanding revenue
      let projectedRevenue = 0;
      let upcomingTripsRevenue = 0;
      let pendingPaymentsRevenue = 0;
      const now = new Date();

      for (const booking of pendingBookings) {
        const paidAmount = booking.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
        const outstanding = booking.totalPrice - paidAmount;

        if (outstanding > 0) {
          projectedRevenue += outstanding;

          // Check if trip is upcoming (within next 90 days)
          if (booking.trip?.startDate) {
            const tripDate = new Date(booking.trip.startDate);
            const daysUntilTrip = Math.ceil((tripDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilTrip > 0 && daysUntilTrip <= 90) {
              upcomingTripsRevenue += outstanding;
            }
          }

          if (booking.status === 'PENDING_PAYMENT') {
            pendingPaymentsRevenue += outstanding;
          }
        }
      }

      // Get MRR (Monthly Recurring Revenue estimate based on last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentRevenue = await ctx.db.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: threeMonthsAgo },
        },
        _sum: { amount: true },
      });

      const mrr = Math.round((recentRevenue._sum.amount || 0) / 3);

      // Get booking pipeline (bookings by status)
      const bookingPipeline = await ctx.db.booking.groupBy({
        by: ['status'],
        where: {
          status: {
            in: ['PENDING_PAYMENT', 'CONFIRMED'] as BookingStatus[],
          },
        },
        _count: true,
        _sum: { totalPrice: true },
      });

      return {
        projectedRevenue,
        upcomingTripsRevenue,
        pendingPaymentsRevenue,
        mrr,
        annualizedRevenue: mrr * 12,
        bookingPipeline: bookingPipeline.map((b) => ({
          status: b.status,
          count: b._count,
          totalValue: b._sum?.totalPrice || 0,
        })),
        totalPendingBookings: pendingBookings.length,
      };
    }),

    /**
     * Get comprehensive revenue overview including MRR
     * E13-S4: Enhanced Overview
     */
    getComprehensiveOverview: adminProcedure
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
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all successful payments
        const payments = await ctx.db.payment.aggregate({
          where,
          _sum: { amount: true },
          _count: { id: true },
        });

        // Get confirmed bookings total value
        const bookingsWhere = {
          status: 'CONFIRMED' as BookingStatus,
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const bookings = await ctx.db.booking.aggregate({
          where: bookingsWhere,
          _sum: { totalPrice: true },
          _count: { id: true },
        });

        // Calculate MRR from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastMonthPayments = await ctx.db.payment.aggregate({
          where: {
            status: 'SUCCEEDED',
            createdAt: { gte: thirtyDaysAgo },
          },
          _sum: { amount: true },
        });

        const mrr = lastMonthPayments._sum.amount || 0;

        // Get add-ons revenue
        const addOnsWhere = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const addOns = await ctx.db.bookingAddOn.findMany({
          where: addOnsWhere,
          select: {
            price: true,
            quantity: true,
          },
        });

        const addOnsRevenue = addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);

        return {
          totalRevenue: payments._sum.amount || 0,
          totalPayments: payments._count.id,
          averagePayment: payments._count.id > 0
            ? Math.round((payments._sum.amount || 0) / payments._count.id)
            : 0,
          mrr,
          arr: mrr * 12, // Annualized
          totalBookingsValue: bookings._sum.totalPrice || 0,
          totalBookings: bookings._count.id,
          averageBookingValue: bookings._count.id > 0
            ? Math.round((bookings._sum.totalPrice || 0) / bookings._count.id)
            : 0,
          addOnsRevenue,
        };
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

    // ============================================================================
    // E13-S5: ENHANCED GUEST DEMOGRAPHICS
    // ============================================================================

    /**
     * Get guest age distribution
     */
    getAgeDistribution: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get guests with bookings in date range
        const guestProfiles = await ctx.db.guestProfile.findMany({
          where: {
            age: { not: null },
            user: {
              bookings: {
                some: {
                  status: { not: 'DRAFT' as BookingStatus },
                  ...(input?.startDate && { createdAt: { gte: input.startDate } }),
                  ...(input?.endDate && { createdAt: { lte: input.endDate } }),
                },
              },
            },
          },
          select: {
            age: true,
          },
        });

        // Group by age brackets
        const ageBrackets: Record<string, number> = {
          '18-30': 0,
          '31-40': 0,
          '41-50': 0,
          '51-60': 0,
          '61-70': 0,
          '71+': 0,
        };

        guestProfiles.forEach((profile) => {
          const age = profile.age;
          if (age !== null) {
            if (age >= 18 && age <= 30) ageBrackets['18-30']++;
            else if (age >= 31 && age <= 40) ageBrackets['31-40']++;
            else if (age >= 41 && age <= 50) ageBrackets['41-50']++;
            else if (age >= 51 && age <= 60) ageBrackets['51-60']++;
            else if (age >= 61 && age <= 70) ageBrackets['61-70']++;
            else if (age > 70) ageBrackets['71+']++;
          }
        });

        const totalWithAge = guestProfiles.length;

        return {
          distribution: Object.entries(ageBrackets).map(([bracket, count]) => ({
            bracket,
            count,
            percentage: totalWithAge > 0 ? ((count / totalWithAge) * 100).toFixed(1) : '0.0',
          })),
          totalWithAge,
          averageAge:
            totalWithAge > 0
              ? Math.round(
                  guestProfiles.reduce((sum, p) => sum + (p.age || 0), 0) / totalWithAge
                )
              : 0,
        };
      }),

    /**
     * Get guest location distribution (geographic)
     */
    getLocationDistribution: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(50).default(20),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get guests with bookings in date range
        const guestProfiles = await ctx.db.guestProfile.findMany({
          where: {
            location: { not: null },
            user: {
              bookings: {
                some: {
                  status: { not: 'DRAFT' as BookingStatus },
                  ...(input?.startDate && { createdAt: { gte: input.startDate } }),
                  ...(input?.endDate && { createdAt: { lte: input.endDate } }),
                },
              },
            },
          },
          select: {
            location: true,
          },
        });

        // Count by location
        const locationCounts: Record<string, number> = {};
        guestProfiles.forEach((profile) => {
          if (profile.location) {
            // Normalize location (trim and capitalize)
            const normalizedLocation = profile.location.trim();
            locationCounts[normalizedLocation] = (locationCounts[normalizedLocation] || 0) + 1;
          }
        });

        const totalWithLocation = guestProfiles.length;

        // Sort by count descending and take top N
        const sortedLocations = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, input?.limit || 20)
          .map(([location, count]) => ({
            location,
            count,
            percentage: totalWithLocation > 0 ? ((count / totalWithLocation) * 100).toFixed(1) : '0.0',
          }));

        return {
          locations: sortedLocations,
          totalWithLocation,
          totalLocations: Object.keys(locationCounts).length,
        };
      }),

    /**
     * Get most popular packages by demographic (age group)
     */
    getPackagesByDemographic: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            ageGroup: z.enum(['18-30', '31-40', '41-50', '51-60', '61-70', '71+']).optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get bookings with guest profile info
        const bookings = await ctx.db.booking.findMany({
          where: {
            status: { not: 'DRAFT' as BookingStatus },
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            user: {
              guestProfile: {
                age: { not: null },
              },
            },
          },
          select: {
            packageId: true,
            package: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                guestProfile: {
                  select: {
                    age: true,
                  },
                },
              },
            },
          },
        });

        // Helper to determine age bracket
        const getAgeBracket = (age: number): string => {
          if (age >= 18 && age <= 30) return '18-30';
          if (age >= 31 && age <= 40) return '31-40';
          if (age >= 41 && age <= 50) return '41-50';
          if (age >= 51 && age <= 60) return '51-60';
          if (age >= 61 && age <= 70) return '61-70';
          return '71+';
        };

        // Group by age bracket and package
        const packagesByAge: Record<string, Record<string, { count: number; packageName: string }>> = {};
        const allAgeBrackets = ['18-30', '31-40', '41-50', '51-60', '61-70', '71+'];
        allAgeBrackets.forEach((bracket) => {
          packagesByAge[bracket] = {};
        });

        bookings.forEach((booking) => {
          const age = booking.user.guestProfile?.age;
          if (age !== null && age !== undefined) {
            const bracket = getAgeBracket(age);

            // Filter by age group if specified
            if (input?.ageGroup && bracket !== input.ageGroup) return;

            if (!packagesByAge[bracket][booking.packageId]) {
              packagesByAge[bracket][booking.packageId] = {
                count: 0,
                packageName: booking.package.name,
              };
            }
            packagesByAge[bracket][booking.packageId].count++;
          }
        });

        // Convert to result format
        const result = Object.entries(packagesByAge).map(([ageGroup, packages]) => ({
          ageGroup,
          packages: Object.entries(packages)
            .map(([packageId, data]) => ({
              packageId,
              packageName: data.packageName,
              count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5), // Top 5 packages per age group
        }));

        return result;
      }),

    /**
     * Get guest acquisition source breakdown
     */
    getAcquisitionSources: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get applications with referral source info
        const applications = await ctx.db.application.findMany({
          where: {
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          },
          select: {
            referralSource: true,
            utmSource: true,
            utmMedium: true,
            utmCampaign: true,
          },
        });

        // Count by referral source
        const sourceCounts: Record<string, number> = {};
        applications.forEach((app) => {
          const source = app.referralSource || 'Unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        // Count by UTM source
        const utmSourceCounts: Record<string, number> = {};
        applications.forEach((app) => {
          if (app.utmSource) {
            utmSourceCounts[app.utmSource] = (utmSourceCounts[app.utmSource] || 0) + 1;
          }
        });

        // Count by UTM medium
        const utmMediumCounts: Record<string, number> = {};
        applications.forEach((app) => {
          if (app.utmMedium) {
            utmMediumCounts[app.utmMedium] = (utmMediumCounts[app.utmMedium] || 0) + 1;
          }
        });

        const total = applications.length;

        return {
          byReferralSource: Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({
              source,
              count,
              percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
            })),
          byUtmSource: Object.entries(utmSourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([source, count]) => ({
              source,
              count,
              percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
            })),
          byUtmMedium: Object.entries(utmMediumCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([medium, count]) => ({
              medium,
              count,
              percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
            })),
          totalApplications: total,
        };
      }),

    /**
     * Get medical procedures popularity by demographic (age group)
     */
    getMedicalProceduresByDemographic: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get booking add-ons with guest age info (medical add-ons only)
        const bookingAddOns = await ctx.db.bookingAddOn.findMany({
          where: {
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
            addOn: {
              category: {
                in: ['DENTAL', 'FACIAL_COSMETIC', 'BODY', 'HEALTH_SCREENING'],
              },
            },
            booking: {
              status: { not: 'DRAFT' as BookingStatus },
              user: {
                guestProfile: {
                  age: { not: null },
                },
              },
            },
          },
          select: {
            quantity: true,
            addOn: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
            booking: {
              select: {
                user: {
                  select: {
                    guestProfile: {
                      select: {
                        age: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Helper to determine age bracket
        const getAgeBracket = (age: number): string => {
          if (age >= 18 && age <= 30) return '18-30';
          if (age >= 31 && age <= 40) return '31-40';
          if (age >= 41 && age <= 50) return '41-50';
          if (age >= 51 && age <= 60) return '51-60';
          if (age >= 61 && age <= 70) return '61-70';
          return '71+';
        };

        // Group by age bracket and procedure category
        const proceduresByAge: Record<
          string,
          Record<string, { count: number; procedures: Record<string, number> }>
        > = {};

        const allAgeBrackets = ['18-30', '31-40', '41-50', '51-60', '61-70', '71+'];
        allAgeBrackets.forEach((bracket) => {
          proceduresByAge[bracket] = {
            DENTAL: { count: 0, procedures: {} },
            FACIAL_COSMETIC: { count: 0, procedures: {} },
            BODY: { count: 0, procedures: {} },
            HEALTH_SCREENING: { count: 0, procedures: {} },
          };
        });

        bookingAddOns.forEach((item) => {
          const age = item.booking.user.guestProfile?.age;
          if (age !== null && age !== undefined) {
            const bracket = getAgeBracket(age);
            const category = item.addOn.category;

            if (proceduresByAge[bracket][category]) {
              proceduresByAge[bracket][category].count += item.quantity;
              const procName = item.addOn.name;
              proceduresByAge[bracket][category].procedures[procName] =
                (proceduresByAge[bracket][category].procedures[procName] || 0) + item.quantity;
            }
          }
        });

        // Convert to result format
        return Object.entries(proceduresByAge).map(([ageGroup, categories]) => ({
          ageGroup,
          categories: Object.entries(categories).map(([category, data]) => ({
            category,
            totalCount: data.count,
            topProcedures: Object.entries(data.procedures)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, count]) => ({ name, count })),
          })),
        }));
      }),

    /**
     * Get comprehensive guest demographics overview
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
        const bookingWhere = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get total guests with bookings
        const totalGuests = await ctx.db.user.count({
          where: {
            role: 'GUEST',
            bookings: {
              some: bookingWhere,
            },
          },
        });

        // Get guests with complete profiles
        const guestsWithProfile = await ctx.db.guestProfile.count({
          where: {
            profileCompleted: true,
            user: {
              bookings: {
                some: bookingWhere,
              },
            },
          },
        });

        // Get repeat guest count
        const guestsWithMultipleBookings = await ctx.db.user.findMany({
          where: {
            role: 'GUEST',
            bookings: {
              some: bookingWhere,
            },
          },
          select: {
            _count: {
              select: {
                bookings: {
                  where: bookingWhere,
                },
              },
            },
          },
        });

        const repeatGuestCount = guestsWithMultipleBookings.filter(
          (g) => g._count.bookings > 1
        ).length;

        // Get average age
        const profiles = await ctx.db.guestProfile.aggregate({
          where: {
            age: { not: null },
            user: {
              bookings: {
                some: bookingWhere,
              },
            },
          },
          _avg: { age: true },
        });

        // Get top locations
        const locationData = await ctx.db.guestProfile.groupBy({
          by: ['location'],
          where: {
            location: { not: null },
            user: {
              bookings: {
                some: bookingWhere,
              },
            },
          },
          _count: true,
          orderBy: { _count: { location: 'desc' } },
          take: 5,
        });

        // Get skill level distribution
        const skillLevels = await ctx.db.guestProfile.groupBy({
          by: ['pickleballSkillLevel'],
          where: {
            pickleballSkillLevel: { not: null },
            user: {
              bookings: {
                some: bookingWhere,
              },
            },
          },
          _count: true,
        });

        return {
          totalGuests,
          guestsWithProfile,
          profileCompletionRate:
            totalGuests > 0
              ? ((guestsWithProfile / totalGuests) * 100).toFixed(1)
              : '0.0',
          repeatGuestCount,
          repeatGuestRate:
            totalGuests > 0
              ? ((repeatGuestCount / totalGuests) * 100).toFixed(1)
              : '0.0',
          averageAge: profiles._avg.age ? Math.round(profiles._avg.age) : null,
          topLocations: locationData.map((l) => ({
            location: l.location || 'Unknown',
            count: l._count,
          })),
          skillLevelDistribution: skillLevels.map((s) => ({
            level: s.pickleballSkillLevel || 'Unknown',
            count: s._count,
          })),
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
  // PARTNER PERFORMANCE ANALYTICS (E13-S7)
  // ============================================================================

  partnerPerformance: router({
    /**
     * Get top partners by referrals, conversions, and revenue
     */
    getTopPartners: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(100).default(20),
            sortBy: z.enum(['referrals', 'conversions', 'revenue']).default('revenue'),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const dateFilter = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all partners with their referrals, bookings, and payouts
        const partners = await ctx.db.partnerProfile.findMany({
          include: {
            user: {
              select: {
                email: true,
              },
            },
            referrals: {
              where: dateFilter,
              include: {
                booking: {
                  select: {
                    id: true,
                    status: true,
                    totalPrice: true,
                  },
                },
              },
            },
            payouts: {
              where: {
                status: 'COMPLETED',
                ...dateFilter,
              },
              select: {
                amountInCents: true,
              },
            },
          },
        });

        // Calculate metrics for each partner
        const partnerStats = partners.map((partner) => {
          const totalReferrals = partner.referrals.length;
          const conversions = partner.referrals.filter(
            (r) => r.booking.status === 'CONFIRMED' || r.booking.status === 'COMPLETED'
          ).length;
          const totalRevenue = partner.referrals.reduce((sum, r) => sum + r.booking.totalPrice, 0);
          const totalCommissions = partner.payouts.reduce((sum, p) => sum + p.amountInCents, 0);
          const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0;
          const avgBookingValue = conversions > 0 ? totalRevenue / conversions : 0;

          return {
            partnerId: partner.id,
            clubName: partner.clubName,
            clubLocation: partner.clubLocation,
            partnerName: partner.clubName,
            email: partner.user.email,
            tier: partner.tier,
            totalReferrals,
            conversions,
            conversionRate: Number(conversionRate.toFixed(1)),
            totalRevenue,
            avgBookingValue: Math.round(avgBookingValue),
            totalCommissions,
            currentPoints: partner.passportPoints,
            referralCodeClicks: partner.referralCodeClickCount,
          };
        });

        // Sort by specified metric
        const sortKey = input?.sortBy || 'revenue';
        partnerStats.sort((a, b) => {
          switch (sortKey) {
            case 'referrals':
              return b.totalReferrals - a.totalReferrals;
            case 'conversions':
              return b.conversions - a.conversions;
            case 'revenue':
            default:
              return b.totalRevenue - a.totalRevenue;
          }
        });

        return partnerStats.slice(0, input?.limit || 20);
      }),

    /**
     * Get partner tier distribution
     */
    getTierDistribution: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx }) => {
        // Count partners by tier
        const tierCounts = await ctx.db.partnerProfile.groupBy({
          by: ['tier'],
          _count: true,
        });

        // Get total referrals and revenue by tier
        const tierStats = await Promise.all(
          tierCounts.map(async (tierCount) => {
            const partnersInTier = await ctx.db.partnerProfile.findMany({
              where: { tier: tierCount.tier },
              select: { id: true },
            });
            const partnerIds = partnersInTier.map((p) => p.id);

            const referrals = await ctx.db.partnerReferral.findMany({
              where: { partnerId: { in: partnerIds } },
              include: {
                booking: {
                  select: { totalPrice: true },
                },
              },
            });

            const totalReferrals = referrals.length;
            const totalRevenue = referrals.reduce((sum, r) => sum + r.booking.totalPrice, 0);
            const avgReferralsPerPartner = tierCount._count > 0 ? totalReferrals / tierCount._count : 0;
            const avgRevenuePerPartner = tierCount._count > 0 ? totalRevenue / tierCount._count : 0;

            return {
              tier: tierCount.tier,
              partnerCount: tierCount._count,
              totalReferrals,
              totalRevenue,
              avgReferralsPerPartner: Number(avgReferralsPerPartner.toFixed(1)),
              avgRevenuePerPartner: Math.round(avgRevenuePerPartner),
            };
          })
        );

        // Sort by tier hierarchy
        const tierOrder = ['DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
        tierStats.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

        return tierStats;
      }),

    /**
     * Get referral-to-booking conversion rates by partner
     */
    getConversionRatesByPartner: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            minReferrals: z.number().default(1),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const dateFilter = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const partners = await ctx.db.partnerProfile.findMany({
          include: {
            user: {
              select: { email: true },
            },
            referrals: {
              where: dateFilter,
              include: {
                booking: {
                  select: { status: true },
                },
              },
            },
          },
        });

        return partners
          .map((partner) => {
            const totalReferrals = partner.referrals.length;
            const converted = partner.referrals.filter(
              (r) => r.booking.status === 'CONFIRMED' || r.booking.status === 'COMPLETED'
            ).length;
            const pending = partner.referrals.filter(
              (r) => r.booking.status === 'PENDING_PAYMENT'
            ).length;
            const cancelled = partner.referrals.filter(
              (r) => r.booking.status === 'CANCELLED'
            ).length;

            return {
              partnerId: partner.id,
              clubName: partner.clubName,
              tier: partner.tier,
              referralCodeClicks: partner.referralCodeClickCount,
              totalReferrals,
              converted,
              pending,
              cancelled,
              conversionRate: totalReferrals > 0 ? Number(((converted / totalReferrals) * 100).toFixed(1)) : 0,
              clickToReferralRate: partner.referralCodeClickCount > 0
                ? Number(((totalReferrals / partner.referralCodeClickCount) * 100).toFixed(1))
                : 0,
            };
          })
          .filter((p) => p.totalReferrals >= (input?.minReferrals || 1))
          .sort((a, b) => b.conversionRate - a.conversionRate);
      }),

    /**
     * Get partner growth trends over time
     */
    getGrowthTrends: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const now = new Date();
        const defaultStart = new Date(now);
        defaultStart.setMonth(defaultStart.getMonth() - 12);

        const startDate = input?.startDate || defaultStart;
        const endDate = input?.endDate || now;

        // Get new partners over time
        const newPartners = await ctx.db.partnerProfile.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            createdAt: true,
            tier: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        // Get referrals over time
        const referrals = await ctx.db.partnerReferral.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            booking: {
              select: { totalPrice: true, status: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        // Group by period
        const period = input?.period || 'monthly';
        const periodMap = new Map<string, {
          newPartners: number;
          referrals: number;
          conversions: number;
          revenue: number;
        }>();

        const formatPeriodKey = (date: Date): string => {
          switch (period) {
            case 'daily':
              return date.toISOString().split('T')[0];
            case 'weekly':
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              return weekStart.toISOString().split('T')[0];
            case 'monthly':
            default:
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          }
        };

        // Initialize periods
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
          const key = formatPeriodKey(cursor);
          if (!periodMap.has(key)) {
            periodMap.set(key, { newPartners: 0, referrals: 0, conversions: 0, revenue: 0 });
          }
          if (period === 'daily') cursor.setDate(cursor.getDate() + 1);
          else if (period === 'weekly') cursor.setDate(cursor.getDate() + 7);
          else cursor.setMonth(cursor.getMonth() + 1);
        }

        // Count new partners
        newPartners.forEach((p) => {
          const key = formatPeriodKey(p.createdAt);
          const entry = periodMap.get(key);
          if (entry) entry.newPartners++;
        });

        // Count referrals
        referrals.forEach((r) => {
          const key = formatPeriodKey(r.createdAt);
          const entry = periodMap.get(key);
          if (entry) {
            entry.referrals++;
            if (r.booking.status === 'CONFIRMED' || r.booking.status === 'COMPLETED') {
              entry.conversions++;
              entry.revenue += r.booking.totalPrice;
            }
          }
        });

        return Array.from(periodMap.entries())
          .map(([periodKey, data]) => ({
            period: periodKey,
            ...data,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
      }),

    /**
     * Get commission payouts summary
     */
    getCommissionSummary: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const dateFilter = {
          ...(input?.startDate && { requestedAt: { gte: input.startDate } }),
          ...(input?.endDate && { requestedAt: { lte: input.endDate } }),
        };

        // Get all payouts in date range
        const payouts = await ctx.db.partnerPayout.findMany({
          where: dateFilter,
          include: {
            partner: {
              select: {
                clubName: true,
                tier: true,
              },
            },
          },
          orderBy: { requestedAt: 'desc' },
        });

        // Calculate totals by status
        const statusTotals = {
          PENDING: { count: 0, amount: 0 },
          PROCESSING: { count: 0, amount: 0 },
          COMPLETED: { count: 0, amount: 0 },
          FAILED: { count: 0, amount: 0 },
        };

        payouts.forEach((p) => {
          const status = p.status as keyof typeof statusTotals;
          if (statusTotals[status]) {
            statusTotals[status].count++;
            statusTotals[status].amount += p.amountInCents;
          }
        });

        // Get top partners by payouts
        const partnerPayouts = payouts.reduce((acc, p) => {
          const key = p.partnerId;
          if (!acc[key]) {
            acc[key] = {
              partnerId: p.partnerId,
              clubName: p.partner.clubName,
              tier: p.partner.tier,
              totalPayouts: 0,
              totalAmount: 0,
            };
          }
          if (p.status === 'COMPLETED') {
            acc[key].totalPayouts++;
            acc[key].totalAmount += p.amountInCents;
          }
          return acc;
        }, {} as Record<string, { partnerId: string; clubName: string; tier: string; totalPayouts: number; totalAmount: number }>);

        const topPartnersByPayouts = Object.values(partnerPayouts)
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 10);

        // Get recent payouts
        const recentPayouts = payouts.slice(0, 10).map((p) => ({
          id: p.id,
          clubName: p.partner.clubName,
          tier: p.partner.tier,
          pointsRedeemed: p.pointsRedeemed,
          amountInCents: p.amountInCents,
          status: p.status,
          payoutMethod: p.payoutMethod,
          requestedAt: p.requestedAt,
          processedAt: p.processedAt,
        }));

        return {
          statusTotals,
          totalPaid: statusTotals.COMPLETED.amount,
          totalPending: statusTotals.PENDING.amount + statusTotals.PROCESSING.amount,
          topPartnersByPayouts,
          recentPayouts,
        };
      }),

    /**
     * Identify high-potential partners for outreach
     */
    getHighPotentialPartners: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const dateFilter = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const partners = await ctx.db.partnerProfile.findMany({
          include: {
            user: {
              select: { email: true },
            },
            referrals: {
              where: dateFilter,
              include: {
                booking: {
                  select: { status: true, totalPrice: true },
                },
              },
            },
          },
        });

        // Calculate potential scores
        const partnerPotential = partners.map((partner) => {
          const totalReferrals = partner.referrals.length;
          const conversions = partner.referrals.filter(
            (r) => r.booking.status === 'CONFIRMED' || r.booking.status === 'COMPLETED'
          ).length;
          const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0;
          const totalRevenue = partner.referrals.reduce((sum, r) => sum + r.booking.totalPrice, 0);
          const avgBookingValue = conversions > 0 ? totalRevenue / conversions : 0;

          // Calculate click-to-referral ratio (high clicks but low referrals = potential)
          const clickToReferralRatio = partner.referralCodeClickCount > 0
            ? totalReferrals / partner.referralCodeClickCount
            : 0;

          // High potential criteria:
          // 1. High conversion rate (> 50%) but low referrals (< 5)
          // 2. High clicks but low referral conversion (< 10% click-to-referral)
          // 3. Not at highest tier yet (BRONZE, SILVER, GOLD)
          // 4. Recent activity (onboarding completed or recent referral)

          const signals: string[] = [];
          let potentialScore = 0;

          // High converter but low volume
          if (conversionRate > 50 && totalReferrals < 5 && totalReferrals > 0) {
            signals.push('High converter, low volume');
            potentialScore += 30;
          }

          // High engagement (clicks) but low conversion
          if (partner.referralCodeClickCount > 10 && clickToReferralRatio < 0.1) {
            signals.push('High engagement, low conversion');
            potentialScore += 25;
          }

          // Not at highest tier with activity
          if (['BRONZE', 'SILVER'].includes(partner.tier) && totalReferrals > 0) {
            signals.push('Room to grow tier');
            potentialScore += 15;
          }

          // Recently onboarded
          const daysSinceCreated = Math.floor(
            (Date.now() - partner.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceCreated < 90 && partner.onboardingCompleted) {
            signals.push('Recently onboarded');
            potentialScore += 20;
          }

          // Has referrals but none recently (re-engage)
          const hasOldReferrals = partner.referrals.length > 0;
          const hasRecentReferrals = partner.referrals.some((r) => {
            const daysSince = Math.floor(
              (Date.now() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSince < 30;
          });
          if (hasOldReferrals && !hasRecentReferrals) {
            signals.push('Inactive, re-engage');
            potentialScore += 10;
          }

          return {
            partnerId: partner.id,
            clubName: partner.clubName,
            partnerName: partner.clubName,
            email: partner.user.email,
            tier: partner.tier,
            totalReferrals,
            conversions,
            conversionRate: Number(conversionRate.toFixed(1)),
            totalRevenue,
            avgBookingValue: Math.round(avgBookingValue),
            referralCodeClicks: partner.referralCodeClickCount,
            clickToReferralRatio: Number((clickToReferralRatio * 100).toFixed(1)),
            potentialScore,
            signals,
            daysSinceCreated,
            onboardingCompleted: partner.onboardingCompleted,
          };
        });

        // Filter only high-potential partners (score > 0)
        return partnerPotential
          .filter((p) => p.potentialScore > 0)
          .sort((a, b) => b.potentialScore - a.potentialScore)
          .slice(0, 20);
      }),

    /**
     * Get overall partner performance overview
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
        const dateFilter = {
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const [
          totalPartners,
          activePartners,
          totalReferrals,
          referralsInPeriod,
          payoutsCompleted,
        ] = await Promise.all([
          // Total partners
          ctx.db.partnerProfile.count(),

          // Active partners (at least one referral in period)
          ctx.db.partnerProfile.count({
            where: {
              referrals: {
                some: dateFilter,
              },
            },
          }),

          // Total referrals ever
          ctx.db.partnerReferral.count(),

          // Referrals in period with booking info
          ctx.db.partnerReferral.findMany({
            where: dateFilter,
            include: {
              booking: {
                select: { status: true, totalPrice: true },
              },
            },
          }),

          // Completed payouts
          ctx.db.partnerPayout.aggregate({
            where: {
              status: 'COMPLETED',
              ...(input?.startDate && { processedAt: { gte: input.startDate } }),
              ...(input?.endDate && { processedAt: { lte: input.endDate } }),
            },
            _sum: { amountInCents: true },
            _count: true,
          }),
        ]);

        const conversions = referralsInPeriod.filter(
          (r) => r.booking.status === 'CONFIRMED' || r.booking.status === 'COMPLETED'
        ).length;
        const totalRevenue = referralsInPeriod.reduce((sum, r) => sum + r.booking.totalPrice, 0);
        const conversionRate = referralsInPeriod.length > 0
          ? (conversions / referralsInPeriod.length) * 100
          : 0;

        return {
          totalPartners,
          activePartners,
          totalReferrals,
          referralsInPeriod: referralsInPeriod.length,
          conversions,
          conversionRate: Number(conversionRate.toFixed(1)),
          totalRevenue,
          avgRevenuePerReferral: conversions > 0 ? Math.round(totalRevenue / conversions) : 0,
          totalPaidOut: payoutsCompleted._sum.amountInCents || 0,
          payoutsCount: payoutsCompleted._count,
        };
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
  // PACKAGE PERFORMANCE (E13-S6)
  // ============================================================================

  packagePerformance: router({
    /**
     * Get overview of all packages with key performance metrics
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
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all packages with their bookings
        const packages = await ctx.db.package.findMany({
          where: { isActive: true },
          include: {
            bookings: {
              where,
              select: {
                id: true,
                totalPrice: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        });

        return packages.map((pkg) => {
          const totalBookings = pkg.bookings.length;
          const completedBookings = pkg.bookings.filter((b) => b.status === 'COMPLETED').length;
          const totalRevenue = pkg.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
          const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

          return {
            id: pkg.id,
            name: pkg.name,
            slug: pkg.slug,
            totalBookings,
            completedBookings,
            totalRevenue,
            avgBookingValue,
            conversionRate: totalBookings > 0
              ? ((completedBookings / totalBookings) * 100).toFixed(1)
              : '0.0',
          };
        });
      }),

    /**
     * Get add-on attach rates for each package
     */
    getAddOnAttachRates: adminProcedure
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
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all add-ons with their booking counts
        const addOns = await ctx.db.addOn.findMany({
          where: { isActive: true },
          include: {
            bookingAddOns: {
              where: {
                booking: where,
              },
              select: {
                quantity: true,
                price: true,
                booking: {
                  select: {
                    packageId: true,
                  },
                },
              },
            },
          },
        });

        // Get total bookings for attach rate calculation
        const totalBookings = await ctx.db.booking.count({ where });

        return addOns
          .map((addOn) => {
            const bookingCount = addOn.bookingAddOns.length;
            const totalQuantity = addOn.bookingAddOns.reduce((sum, ba) => sum + ba.quantity, 0);
            const totalRevenue = addOn.bookingAddOns.reduce((sum, ba) => sum + ba.price * ba.quantity, 0);

            return {
              id: addOn.id,
              name: addOn.name,
              category: addOn.category,
              bookingCount,
              totalQuantity,
              totalRevenue,
              attachRate: totalBookings > 0
                ? ((bookingCount / totalBookings) * 100).toFixed(1)
                : '0.0',
            };
          })
          .sort((a, b) => Number(b.attachRate) - Number(a.attachRate));
      }),

    /**
     * Get package comparison data (bookings, revenue, ratings)
     */
    getPackageComparison: adminProcedure
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
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get packages with bookings and testimonials
        const packages = await ctx.db.package.findMany({
          where: { isActive: true },
          include: {
            bookings: {
              where,
              select: {
                id: true,
                totalPrice: true,
                status: true,
              },
            },
          },
        });

        // Get testimonials by package type
        const testimonials = await ctx.db.testimonial.findMany({
          where: { isApproved: true },
          select: {
            packageType: true,
          },
        });

        // Get guest testimonials with ratings (if they have ratings)
        const guestTestimonials = await ctx.db.guestTestimonial.findMany({
          where: { status: 'PUBLISHED' },
          select: {
            packageType: true,
          },
        });

        // Count testimonials per package
        const testimonialCounts = new Map<string, number>();
        testimonials.forEach((t) => {
          const count = testimonialCounts.get(t.packageType) || 0;
          testimonialCounts.set(t.packageType, count + 1);
        });
        guestTestimonials.forEach((t) => {
          if (t.packageType) {
            const count = testimonialCounts.get(t.packageType) || 0;
            testimonialCounts.set(t.packageType, count + 1);
          }
        });

        return packages.map((pkg) => {
          const totalBookings = pkg.bookings.length;
          const totalRevenue = pkg.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
          const completedBookings = pkg.bookings.filter((b) => b.status === 'COMPLETED').length;
          const testimonialCount = testimonialCounts.get(pkg.name) || 0;

          return {
            id: pkg.id,
            name: pkg.name,
            totalBookings,
            totalRevenue,
            completedBookings,
            testimonialCount,
            satisfactionScore: testimonialCount > 0 ? 'Positive' : 'N/A',
          };
        });
      }),

    /**
     * Get seasonal trends for packages
     */
    getSeasonalTrends: adminProcedure
      .input(
        z
          .object({
            year: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const year = input?.year || new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        // Get all bookings for the year grouped by package and month
        const bookings = await ctx.db.booking.findMany({
          where: {
            status: { not: 'DRAFT' as BookingStatus },
            createdAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
          select: {
            id: true,
            createdAt: true,
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Group by month and package
        const monthlyData: Record<string, Record<string, number>> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        months.forEach((month) => {
          monthlyData[month] = {};
        });

        bookings.forEach((booking) => {
          const month = months[booking.createdAt.getMonth()];
          const packageName = booking.package.name;

          if (!monthlyData[month][packageName]) {
            monthlyData[month][packageName] = 0;
          }
          monthlyData[month][packageName]++;
        });

        // Get unique package names
        const packageNames = [...new Set(bookings.map((b) => b.package.name))];

        return {
          months: months.map((month) => ({
            month,
            ...monthlyData[month],
          })),
          packageNames,
          year,
        };
      }),

    /**
     * Get underperforming packages based on various metrics
     */
    getUnderperformingPackages: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            threshold: z.number().min(0).max(100).default(20),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        // Get all packages with their performance metrics
        const packages = await ctx.db.package.findMany({
          where: { isActive: true },
          include: {
            bookings: {
              where,
              select: {
                id: true,
                totalPrice: true,
                status: true,
                createdAt: true,
              },
            },
          },
        });

        if (packages.length === 0) {
          return [];
        }

        // Calculate metrics for each package
        const packageMetrics = packages.map((pkg) => {
          const totalBookings = pkg.bookings.length;
          const totalRevenue = pkg.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
          const completedBookings = pkg.bookings.filter((b) => b.status === 'COMPLETED').length;
          const conversionRate = totalBookings > 0
            ? (completedBookings / totalBookings) * 100
            : 0;

          return {
            id: pkg.id,
            name: pkg.name,
            totalBookings,
            totalRevenue,
            conversionRate,
          };
        });

        // Calculate averages
        const avgBookings = packageMetrics.reduce((sum, p) => sum + p.totalBookings, 0) / packages.length;
        const avgRevenue = packageMetrics.reduce((sum, p) => sum + p.totalRevenue, 0) / packages.length;

        // Identify underperforming packages (below threshold of average)
        const threshold = (input?.threshold ?? 20) / 100;

        return packageMetrics
          .filter((pkg) => {
            const bookingRatio = avgBookings > 0 ? pkg.totalBookings / avgBookings : 0;
            const revenueRatio = avgRevenue > 0 ? pkg.totalRevenue / avgRevenue : 0;

            // Consider underperforming if significantly below average
            return bookingRatio < (1 - threshold) || revenueRatio < (1 - threshold);
          })
          .map((pkg) => ({
            ...pkg,
            bookingsVsAvg: avgBookings > 0
              ? (((pkg.totalBookings - avgBookings) / avgBookings) * 100).toFixed(1)
              : '0.0',
            revenueVsAvg: avgRevenue > 0
              ? (((pkg.totalRevenue - avgRevenue) / avgRevenue) * 100).toFixed(1)
              : '0.0',
            issues: [
              ...(pkg.totalBookings < avgBookings * (1 - threshold) ? ['Low bookings'] : []),
              ...(pkg.totalRevenue < avgRevenue * (1 - threshold) ? ['Low revenue'] : []),
              ...(pkg.conversionRate < 50 ? ['Low conversion'] : []),
            ],
          }));
      }),

    /**
     * Get top performing add-ons with attach rates
     */
    getTopAddOns: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(50).default(10),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: { not: 'DRAFT' as BookingStatus },
          ...(input?.startDate && { createdAt: { gte: input.startDate } }),
          ...(input?.endDate && { createdAt: { lte: input.endDate } }),
        };

        const totalBookings = await ctx.db.booking.count({ where });

        const addOnStats = await ctx.db.bookingAddOn.groupBy({
          by: ['addOnId'],
          where: {
            booking: where,
          },
          _count: { id: true },
          _sum: { quantity: true, price: true },
        });

        // Get add-on details
        const addOnIds = addOnStats.map((stat) => stat.addOnId);
        const addOns = await ctx.db.addOn.findMany({
          where: { id: { in: addOnIds } },
          select: { id: true, name: true, category: true },
        });

        const addOnMap = new Map(addOns.map((a) => [a.id, a]));

        return addOnStats
          .map((stat) => {
            const addOn = addOnMap.get(stat.addOnId);
            return {
              id: stat.addOnId,
              name: addOn?.name || 'Unknown',
              category: addOn?.category || 'UNKNOWN',
              bookingCount: stat._count.id,
              totalQuantity: stat._sum.quantity || 0,
              totalRevenue: stat._sum.price || 0,
              attachRate: totalBookings > 0
                ? ((stat._count.id / totalBookings) * 100).toFixed(1)
                : '0.0',
            };
          })
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, input?.limit ?? 10);
      }),

    /**
     * Get average rating per package from testimonials
     */
    getPackageRatings: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get approved testimonials
        const testimonials = await ctx.db.testimonial.findMany({
          where: {
            isApproved: true,
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          },
          select: {
            packageType: true,
            viewCount: true,
          },
        });

        // Get published guest testimonials
        const guestTestimonials = await ctx.db.guestTestimonial.findMany({
          where: {
            status: 'PUBLISHED',
            ...(input?.startDate && { createdAt: { gte: input.startDate } }),
            ...(input?.endDate && { createdAt: { lte: input.endDate } }),
          },
          select: {
            packageType: true,
          },
        });

        // Aggregate by package
        const packageStats: Record<string, { count: number; viewCount: number }> = {};

        testimonials.forEach((t) => {
          if (!packageStats[t.packageType]) {
            packageStats[t.packageType] = { count: 0, viewCount: 0 };
          }
          packageStats[t.packageType].count++;
          packageStats[t.packageType].viewCount += t.viewCount;
        });

        guestTestimonials.forEach((t) => {
          if (t.packageType) {
            if (!packageStats[t.packageType]) {
              packageStats[t.packageType] = { count: 0, viewCount: 0 };
            }
            packageStats[t.packageType].count++;
          }
        });

        return Object.entries(packageStats)
          .map(([packageName, stats]) => ({
            packageName,
            testimonialCount: stats.count,
            totalViewCount: stats.viewCount,
            // Since there's no explicit rating field, use testimonial count as a proxy for satisfaction
            satisfactionIndicator: stats.count >= 5 ? 'High' : stats.count >= 2 ? 'Medium' : 'Low',
          }))
          .sort((a, b) => b.testimonialCount - a.testimonialCount);
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

  // ============================================================================
  // EMAIL CAMPAIGN ANALYTICS (E13-S8)
  // ============================================================================

  emailCampaigns: router({
    /**
     * Get email campaign overview metrics
     * Returns send volume, open rates, click rates
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
          ...(input?.startDate && { sentAt: { gte: input.startDate } }),
          ...(input?.endDate && { sentAt: { lte: input.endDate } }),
        };

        // Get overall email send metrics
        const [
          totalSends,
          delivered,
          opened,
          clicked,
          bounced,
          unsubscribed,
        ] = await Promise.all([
          ctx.db.emailSend.count({ where: { ...where, sentAt: { not: null } } }),
          ctx.db.emailSend.count({ where: { ...where, deliveredAt: { not: null } } }),
          ctx.db.emailSend.count({ where: { ...where, openedAt: { not: null } } }),
          ctx.db.emailSend.count({ where: { ...where, clickedAt: { not: null } } }),
          ctx.db.emailSend.count({ where: { ...where, bouncedAt: { not: null } } }),
          ctx.db.emailSend.count({ where: { ...where, unsubscribedAt: { not: null } } }),
        ]);

        // Calculate rates
        const openRate = totalSends > 0 ? (opened / totalSends) * 100 : 0;
        const clickRate = totalSends > 0 ? (clicked / totalSends) * 100 : 0;
        const deliveryRate = totalSends > 0 ? (delivered / totalSends) * 100 : 0;
        const bounceRate = totalSends > 0 ? (bounced / totalSends) * 100 : 0;
        const unsubscribeRate = totalSends > 0 ? (unsubscribed / totalSends) * 100 : 0;
        const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0;

        // Get total campaigns
        const totalCampaigns = await ctx.db.emailCampaign.count({
          where: {
            status: 'SENT',
            ...(input?.startDate && { sentAt: { gte: input.startDate } }),
            ...(input?.endDate && { sentAt: { lte: input.endDate } }),
          },
        });

        return {
          totalSends,
          delivered,
          opened,
          clicked,
          bounced,
          unsubscribed,
          openRate: Number(openRate.toFixed(2)),
          clickRate: Number(clickRate.toFixed(2)),
          deliveryRate: Number(deliveryRate.toFixed(2)),
          bounceRate: Number(bounceRate.toFixed(2)),
          unsubscribeRate: Number(unsubscribeRate.toFixed(2)),
          clickToOpenRate: Number(clickToOpenRate.toFixed(2)),
          totalCampaigns,
        };
      }),

    /**
     * Get campaign list with performance metrics
     */
    getCampaigns: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(100).default(20),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          status: 'SENT' as const,
          ...(input?.startDate && { sentAt: { gte: input.startDate } }),
          ...(input?.endDate && { sentAt: { lte: input.endDate } }),
        };

        const campaigns = await ctx.db.emailCampaign.findMany({
          where,
          include: {
            template: {
              select: { name: true, slug: true },
            },
            sends: {
              select: {
                id: true,
                status: true,
                openedAt: true,
                clickedAt: true,
                bouncedAt: true,
                unsubscribedAt: true,
                openCount: true,
                clickCount: true,
              },
            },
          },
          orderBy: { sentAt: 'desc' },
          take: input?.limit || 20,
        });

        return campaigns.map((campaign) => {
          const totalSends = campaign.sends.length;
          const opened = campaign.sends.filter((s) => s.openedAt).length;
          const clicked = campaign.sends.filter((s) => s.clickedAt).length;
          const bounced = campaign.sends.filter((s) => s.bouncedAt).length;
          const unsubscribed = campaign.sends.filter((s) => s.unsubscribedAt).length;
          const totalOpens = campaign.sends.reduce((sum, s) => sum + s.openCount, 0);
          const totalClicks = campaign.sends.reduce((sum, s) => sum + s.clickCount, 0);

          return {
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            templateName: campaign.template?.name || null,
            templateSlug: campaign.template?.slug || null,
            sentAt: campaign.sentAt,
            recipientCount: campaign.recipientCount,
            totalSends,
            opened,
            clicked,
            bounced,
            unsubscribed,
            totalOpens,
            totalClicks,
            openRate: totalSends > 0 ? Number(((opened / totalSends) * 100).toFixed(2)) : 0,
            clickRate: totalSends > 0 ? Number(((clicked / totalSends) * 100).toFixed(2)) : 0,
            bounceRate: totalSends > 0 ? Number(((bounced / totalSends) * 100).toFixed(2)) : 0,
            unsubscribeRate: totalSends > 0 ? Number(((unsubscribed / totalSends) * 100).toFixed(2)) : 0,
            isAbTest: campaign.isAbTest,
            abTestVariant: campaign.abTestVariant,
          };
        });
      }),

    /**
     * Get A/B test campaign comparison
     */
    getAbTestComparison: adminProcedure
      .input(
        z.object({
          parentCampaignId: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        // Get all A/B test campaigns
        const whereBase = {
          isAbTest: true,
          status: 'SENT' as const,
          ...(input?.startDate && { sentAt: { gte: input.startDate } }),
          ...(input?.endDate && { sentAt: { lte: input.endDate } }),
        };

        // If a specific parent is requested, get its variants
        if (input.parentCampaignId) {
          const variants = await ctx.db.emailCampaign.findMany({
            where: {
              OR: [
                { id: input.parentCampaignId },
                { abTestParentId: input.parentCampaignId },
              ],
              status: 'SENT',
            },
            include: {
              sends: {
                select: {
                  openedAt: true,
                  clickedAt: true,
                  bouncedAt: true,
                  unsubscribedAt: true,
                },
              },
            },
            orderBy: { abTestVariant: 'asc' },
          });

          return variants.map((v) => {
            const totalSends = v.sends.length;
            const opened = v.sends.filter((s) => s.openedAt).length;
            const clicked = v.sends.filter((s) => s.clickedAt).length;

            return {
              campaignId: v.id,
              name: v.name,
              subject: v.subject,
              variant: v.abTestVariant,
              totalSends,
              openRate: totalSends > 0 ? Number(((opened / totalSends) * 100).toFixed(2)) : 0,
              clickRate: totalSends > 0 ? Number(((clicked / totalSends) * 100).toFixed(2)) : 0,
              isWinner: false, // Will be calculated
            };
          });
        }

        // Get all parent campaigns with A/B tests
        const parentCampaigns = await ctx.db.emailCampaign.findMany({
          where: {
            ...whereBase,
            abTestParentId: null,
          },
          include: {
            abTestVariants: {
              where: { status: 'SENT' },
              include: {
                sends: {
                  select: {
                    openedAt: true,
                    clickedAt: true,
                  },
                },
              },
            },
            sends: {
              select: {
                openedAt: true,
                clickedAt: true,
              },
            },
          },
          orderBy: { sentAt: 'desc' },
          take: 10,
        });

        return parentCampaigns.map((parent) => {
          const allVariants = [parent, ...parent.abTestVariants];
          const variantStats = allVariants.map((v) => {
            const totalSends = v.sends.length;
            const opened = v.sends.filter((s) => s.openedAt).length;
            const clicked = v.sends.filter((s) => s.clickedAt).length;
            const openRate = totalSends > 0 ? (opened / totalSends) * 100 : 0;
            const clickRate = totalSends > 0 ? (clicked / totalSends) * 100 : 0;

            return {
              variant: v.abTestVariant || 'A',
              subject: v.subject,
              totalSends,
              openRate: Number(openRate.toFixed(2)),
              clickRate: Number(clickRate.toFixed(2)),
            };
          });

          // Determine winner based on click rate
          const winner = variantStats.reduce((best, current) =>
            current.clickRate > best.clickRate ? current : best
          );

          return {
            campaignId: parent.id,
            name: parent.name,
            sentAt: parent.sentAt,
            variants: variantStats.map((v) => ({
              ...v,
              isWinner: v.variant === winner.variant,
            })),
            winningVariant: winner.variant,
          };
        });
      }),

    /**
     * Get best performing email templates
     */
    getTopTemplates: adminProcedure
      .input(
        z
          .object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            limit: z.number().min(1).max(50).default(10),
            sortBy: z.enum(['openRate', 'clickRate', 'sends']).default('clickRate'),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const where = {
          sentAt: {
            ...(input?.startDate && { gte: input.startDate }),
            ...(input?.endDate && { lte: input.endDate }),
          },
          templateId: { not: null },
        };

        // Get all sends grouped by template
        const sends = await ctx.db.emailSend.findMany({
          where: {
            ...(input?.startDate && { sentAt: { gte: input.startDate } }),
            ...(input?.endDate && { sentAt: { lte: input.endDate } }),
            templateId: { not: null },
          },
          select: {
            templateId: true,
            openedAt: true,
            clickedAt: true,
            bouncedAt: true,
          },
        });

        // Group by template
        const templateStats = sends.reduce(
          (acc, send) => {
            const templateId = send.templateId!;
            if (!acc[templateId]) {
              acc[templateId] = { sends: 0, opens: 0, clicks: 0, bounces: 0 };
            }
            acc[templateId].sends++;
            if (send.openedAt) acc[templateId].opens++;
            if (send.clickedAt) acc[templateId].clicks++;
            if (send.bouncedAt) acc[templateId].bounces++;
            return acc;
          },
          {} as Record<string, { sends: number; opens: number; clicks: number; bounces: number }>
        );

        // Get template details
        const templateIds = Object.keys(templateStats);
        const templates = await ctx.db.emailTemplate.findMany({
          where: { id: { in: templateIds } },
          select: { id: true, name: true, slug: true, category: true },
        });

        const templateMap = new Map(templates.map((t) => [t.id, t]));

        // Calculate rates and sort
        const results = Object.entries(templateStats).map(([templateId, stats]) => {
          const template = templateMap.get(templateId);
          const openRate = stats.sends > 0 ? (stats.opens / stats.sends) * 100 : 0;
          const clickRate = stats.sends > 0 ? (stats.clicks / stats.sends) * 100 : 0;
          const bounceRate = stats.sends > 0 ? (stats.bounces / stats.sends) * 100 : 0;

          return {
            templateId,
            templateName: template?.name || 'Unknown',
            templateSlug: template?.slug || null,
            category: template?.category || 'UNKNOWN',
            totalSends: stats.sends,
            opens: stats.opens,
            clicks: stats.clicks,
            bounces: stats.bounces,
            openRate: Number(openRate.toFixed(2)),
            clickRate: Number(clickRate.toFixed(2)),
            bounceRate: Number(bounceRate.toFixed(2)),
          };
        });

        // Sort by the specified metric
        const sortBy = input?.sortBy || 'clickRate';
        results.sort((a, b) => {
          if (sortBy === 'sends') return b.totalSends - a.totalSends;
          if (sortBy === 'openRate') return b.openRate - a.openRate;
          return b.clickRate - a.clickRate;
        });

        return results.slice(0, input?.limit || 10);
      }),

    /**
     * Get email engagement trends over time
     */
    getEngagementTrends: adminProcedure
      .input(
        z.object({
          period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const where = {
          sentAt: { not: null },
          ...(input.startDate && { sentAt: { gte: input.startDate } }),
          ...(input.endDate && { sentAt: { lte: input.endDate } }),
        };

        const sends = await ctx.db.emailSend.findMany({
          where,
          select: {
            sentAt: true,
            openedAt: true,
            clickedAt: true,
            bouncedAt: true,
            unsubscribedAt: true,
          },
          orderBy: { sentAt: 'asc' },
        });

        // Group by period
        const grouped = sends.reduce(
          (acc, send) => {
            if (!send.sentAt) return acc;

            let key: string;
            const date = send.sentAt;

            switch (input.period) {
              case 'daily':
                key = date.toISOString().slice(0, 10);
                break;
              case 'weekly':
                const d = new Date(date);
                d.setDate(d.getDate() - d.getDay());
                key = d.toISOString().slice(0, 10);
                break;
              case 'monthly':
                key = date.toISOString().slice(0, 7);
                break;
            }

            if (!acc[key]) {
              acc[key] = { sends: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 };
            }
            acc[key].sends++;
            if (send.openedAt) acc[key].opens++;
            if (send.clickedAt) acc[key].clicks++;
            if (send.bouncedAt) acc[key].bounces++;
            if (send.unsubscribedAt) acc[key].unsubscribes++;
            return acc;
          },
          {} as Record<string, { sends: number; opens: number; clicks: number; bounces: number; unsubscribes: number }>
        );

        return Object.entries(grouped)
          .map(([period, stats]) => ({
            period,
            sends: stats.sends,
            opens: stats.opens,
            clicks: stats.clicks,
            bounces: stats.bounces,
            unsubscribes: stats.unsubscribes,
            openRate: stats.sends > 0 ? Number(((stats.opens / stats.sends) * 100).toFixed(2)) : 0,
            clickRate: stats.sends > 0 ? Number(((stats.clicks / stats.sends) * 100).toFixed(2)) : 0,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
      }),

    /**
     * Get unsubscribe tracking and trends
     */
    getUnsubscribeMetrics: adminProcedure
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
          unsubscribedAt: { not: null },
          ...(input?.startDate && { unsubscribedAt: { gte: input.startDate } }),
          ...(input?.endDate && { unsubscribedAt: { lte: input.endDate } }),
        };

        // Get unsubscribe details
        const unsubscribes = await ctx.db.emailSend.findMany({
          where,
          include: {
            campaign: {
              select: { id: true, name: true },
            },
          },
          orderBy: { unsubscribedAt: 'desc' },
        });

        // Group by campaign
        const byCampaign = unsubscribes.reduce(
          (acc, u) => {
            const campaignName = u.campaign?.name || 'No Campaign';
            if (!acc[campaignName]) {
              acc[campaignName] = 0;
            }
            acc[campaignName]++;
            return acc;
          },
          {} as Record<string, number>
        );

        // Get total sends for calculating rates
        const totalSends = await ctx.db.emailSend.count({
          where: {
            sentAt: { not: null },
            ...(input?.startDate && { sentAt: { gte: input.startDate } }),
            ...(input?.endDate && { sentAt: { lte: input.endDate } }),
          },
        });

        return {
          totalUnsubscribes: unsubscribes.length,
          unsubscribeRate: totalSends > 0 ? Number(((unsubscribes.length / totalSends) * 100).toFixed(3)) : 0,
          byCampaign: Object.entries(byCampaign)
            .map(([name, count]) => ({ campaignName: name, count }))
            .sort((a, b) => b.count - a.count),
          recentUnsubscribes: unsubscribes.slice(0, 20).map((u) => ({
            email: u.recipientEmail,
            campaign: u.campaign?.name || 'N/A',
            unsubscribedAt: u.unsubscribedAt,
          })),
        };
      }),

    /**
     * Get link click breakdown/heatmap data
     */
    getLinkClickBreakdown: adminProcedure
      .input(
        z.object({
          campaignId: z.string().optional(),
          templateId: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const sendWhere = {
          ...(input.campaignId && { campaignId: input.campaignId }),
          ...(input.templateId && { templateId: input.templateId }),
          ...(input.startDate && { sentAt: { gte: input.startDate } }),
          ...(input.endDate && { sentAt: { lte: input.endDate } }),
        };

        // Get link clicks
        const clicks = await ctx.db.emailLinkClick.findMany({
          where: {
            send: sendWhere,
            ...(input.startDate && { clickedAt: { gte: input.startDate } }),
            ...(input.endDate && { clickedAt: { lte: input.endDate } }),
          },
          select: {
            linkUrl: true,
            linkText: true,
            linkPosition: true,
          },
        });

        // Group by URL
        const byUrl = clicks.reduce(
          (acc, click) => {
            const key = click.linkUrl;
            if (!acc[key]) {
              acc[key] = {
                url: click.linkUrl,
                text: click.linkText || 'Unknown',
                position: click.linkPosition || 'Unknown',
                clicks: 0,
              };
            }
            acc[key].clicks++;
            return acc;
          },
          {} as Record<string, { url: string; text: string; position: string; clicks: number }>
        );

        // Group by position for heatmap data
        const byPosition = clicks.reduce(
          (acc, click) => {
            const position = click.linkPosition || 'unknown';
            if (!acc[position]) {
              acc[position] = 0;
            }
            acc[position]++;
            return acc;
          },
          {} as Record<string, number>
        );

        // Group by CTA text
        const byText = clicks.reduce(
          (acc, click) => {
            const text = click.linkText || 'Unknown';
            if (!acc[text]) {
              acc[text] = 0;
            }
            acc[text]++;
            return acc;
          },
          {} as Record<string, number>
        );

        const totalClicks = clicks.length;

        return {
          totalClicks,
          topLinks: Object.values(byUrl)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, input.limit)
            .map((link) => ({
              ...link,
              percentage: totalClicks > 0 ? Number(((link.clicks / totalClicks) * 100).toFixed(1)) : 0,
            })),
          byPosition: Object.entries(byPosition)
            .map(([position, count]) => ({
              position,
              clicks: count,
              percentage: totalClicks > 0 ? Number(((count / totalClicks) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.clicks - a.clicks),
          byCTA: Object.entries(byText)
            .map(([text, count]) => ({
              text,
              clicks: count,
              percentage: totalClicks > 0 ? Number(((count / totalClicks) * 100).toFixed(1)) : 0,
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10),
        };
      }),

    /**
     * Get email template analytics summary (using existing EmailTemplateAnalytics model)
     */
    getTemplateAnalyticsSummary: adminProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(50).default(10),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        // Get template analytics from the existing model
        const templateAnalytics = await ctx.db.emailTemplateAnalytics.findMany({
          include: {
            template: {
              select: { id: true, name: true, slug: true, category: true, status: true },
            },
          },
          orderBy: { sentCount: 'desc' },
          take: input?.limit || 10,
        });

        return templateAnalytics.map((ta) => ({
          templateId: ta.templateId,
          templateName: ta.template.name,
          templateSlug: ta.template.slug,
          category: ta.template.category,
          status: ta.template.status,
          sentCount: ta.sentCount,
          openCount: ta.openCount,
          clickCount: ta.clickCount,
          bounceCount: ta.bounceCount,
          unsubscribeCount: ta.unsubscribeCount,
          openRate: ta.openRate || 0,
          clickRate: ta.clickRate || 0,
          bounceRate: ta.bounceRate || 0,
          unsubscribeRate: ta.unsubscribeRate || 0,
          lastUpdatedAt: ta.lastUpdatedAt,
        }));
      }),
  }),
});
