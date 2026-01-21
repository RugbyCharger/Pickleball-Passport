/**
 * Itinerary Router
 *
 * tRPC procedures for itinerary template management (Story 12-7)
 * Supports CRUD operations for templates, days, and activities
 * with drag-and-drop reordering and package linking.
 */

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Schema for activity types
const activityTypeSchema = z.enum([
  'PICKLEBALL',
  'MEDICAL',
  'WELLNESS',
  'CULTURAL',
  'MEAL',
  'FREE_TIME',
])

// Activity type labels for display
export const ACTIVITY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  PICKLEBALL: { label: 'Pickleball', color: 'bg-green-100 text-green-700' },
  MEDICAL: { label: 'Medical', color: 'bg-red-100 text-red-700' },
  WELLNESS: { label: 'Wellness', color: 'bg-purple-100 text-purple-700' },
  CULTURAL: { label: 'Cultural', color: 'bg-amber-100 text-amber-700' },
  MEAL: { label: 'Meal', color: 'bg-orange-100 text-orange-700' },
  FREE_TIME: { label: 'Free Time', color: 'bg-blue-100 text-blue-700' },
}

export const itineraryRouter = router({
  // ============================================================================
  // ITINERARY TEMPLATES
  // ============================================================================

  /**
   * Get all itinerary templates with filtering
   */
  getTemplates: adminProcedure
    .input(
      z.object({
        packageId: z.string().optional(),
        duration: z.number().int().optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['name', 'duration', 'updatedAt', 'createdAt']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        packageId,
        duration,
        isActive,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.ItineraryTemplateWhereInput = {
        ...(packageId && { packageId }),
        ...(duration && { duration }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [templates, total] = await Promise.all([
        ctx.db.itineraryTemplate.findMany({
          where,
          include: {
            package: { select: { id: true, name: true, slug: true } },
            _count: { select: { days: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.itineraryTemplate.count({ where }),
      ])

      return { templates, total }
    }),

  /**
   * Get single template by ID with full details
   */
  getTemplateById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.itineraryTemplate.findUnique({
        where: { id: input.id },
        include: {
          package: { select: { id: true, name: true, slug: true } },
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              itineraryActivities: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary template not found',
        })
      }

      return template
    }),

  /**
   * Get template by package ID for public display
   */
  getTemplateByPackage: publicProcedure
    .input(z.object({
      packageId: z.string().optional(),
      packageSlug: z.string().optional(),
      duration: z.number().int().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { packageId, packageSlug, duration } = input

      if (!packageId && !packageSlug) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either packageId or packageSlug is required',
        })
      }

      // If slug provided, get package ID first
      let resolvedPackageId = packageId
      if (packageSlug && !packageId) {
        const pkg = await ctx.db.package.findUnique({
          where: { slug: packageSlug },
          select: { id: true },
        })
        if (!pkg) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Package not found',
          })
        }
        resolvedPackageId = pkg.id
      }

      const template = await ctx.db.itineraryTemplate.findFirst({
        where: {
          packageId: resolvedPackageId,
          isActive: true,
          ...(duration && { duration }),
        },
        include: {
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              itineraryActivities: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      })

      return template
    }),

  /**
   * Create a new itinerary template
   */
  createTemplate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        packageId: z.string().optional(),
        duration: z.number().int().min(1, 'Duration must be at least 1 day'),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.itineraryTemplate.create({
        data: {
          name: input.name,
          packageId: input.packageId,
          duration: input.duration,
          description: input.description,
          isActive: input.isActive,
        },
        include: {
          package: { select: { id: true, name: true } },
        },
      })

      // Create empty days for the template
      const daysData = Array.from({ length: input.duration }, (_, i) => ({
        templateId: template.id,
        dayNumber: i + 1,
        title: `Day ${i + 1}`,
      }))

      await ctx.db.itineraryDay.createMany({ data: daysData })

      return template
    }),

  /**
   * Update an itinerary template
   */
  updateTemplate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        packageId: z.string().nullish(),
        duration: z.number().int().min(1).optional(),
        description: z.string().nullish(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.itineraryTemplate.findUnique({
        where: { id },
        include: { _count: { select: { days: true } } },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary template not found',
        })
      }

      // Handle duration change - add or remove days as needed
      if (data.duration && data.duration !== existing.duration) {
        const currentDays = existing._count.days

        if (data.duration > currentDays) {
          // Add new days
          const newDays = Array.from(
            { length: data.duration - currentDays },
            (_, i) => ({
              templateId: id,
              dayNumber: currentDays + i + 1,
              title: `Day ${currentDays + i + 1}`,
            })
          )
          await ctx.db.itineraryDay.createMany({ data: newDays })
        } else if (data.duration < currentDays) {
          // Remove excess days (and their activities via cascade)
          await ctx.db.itineraryDay.deleteMany({
            where: {
              templateId: id,
              dayNumber: { gt: data.duration },
            },
          })
        }
      }

      return ctx.db.itineraryTemplate.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.packageId !== undefined && { packageId: data.packageId }),
          ...(data.duration && { duration: data.duration }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          package: { select: { id: true, name: true } },
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              itineraryActivities: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      })
    }),

  /**
   * Delete an itinerary template
   */
  deleteTemplate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.itineraryTemplate.findUnique({
        where: { id: input.id },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary template not found',
        })
      }

      // Cascade delete handles days and activities
      await ctx.db.itineraryTemplate.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Duplicate an itinerary template
   */
  duplicateTemplate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.itineraryTemplate.findUnique({
        where: { id: input.id },
        include: {
          days: {
            include: {
              itineraryActivities: true,
            },
          },
        },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary template not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Create new template
        const newTemplate = await tx.itineraryTemplate.create({
          data: {
            name: `${original.name} (Copy)`,
            packageId: original.packageId,
            duration: original.duration,
            description: original.description,
            isActive: false, // Start as inactive
          },
        })

        // Duplicate days and activities
        for (const day of original.days) {
          const newDay = await tx.itineraryDay.create({
            data: {
              templateId: newTemplate.id,
              dayNumber: day.dayNumber,
              title: day.title,
            },
          })

          // Duplicate activities
          if (day.itineraryActivities.length > 0) {
            await tx.itineraryActivity.createMany({
              data: day.itineraryActivities.map((activity) => ({
                dayId: newDay.id,
                time: activity.time,
                title: activity.title,
                description: activity.description,
                location: activity.location,
                type: activity.type,
                sortOrder: activity.sortOrder,
              })),
            })
          }
        }

        return tx.itineraryTemplate.findUnique({
          where: { id: newTemplate.id },
          include: {
            package: { select: { id: true, name: true } },
            _count: { select: { days: true } },
          },
        })
      })
    }),

  // ============================================================================
  // ITINERARY DAYS
  // ============================================================================

  /**
   * Update a day's title
   */
  updateDay: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Title is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.db.itineraryDay.findUnique({
        where: { id: input.id },
      })

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary day not found',
        })
      }

      return ctx.db.itineraryDay.update({
        where: { id: input.id },
        data: { title: input.title },
        include: {
          itineraryActivities: { orderBy: { sortOrder: 'asc' } },
        },
      })
    }),

  /**
   * Reorder days within a template
   */
  reorderDays: adminProcedure
    .input(
      z.object({
        templateId: z.string(),
        dayIds: z.array(z.string()), // Ordered list of day IDs
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { templateId, dayIds } = input

      // Verify template exists
      const template = await ctx.db.itineraryTemplate.findUnique({
        where: { id: templateId },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary template not found',
        })
      }

      // Update day numbers based on new order
      await ctx.db.$transaction(
        dayIds.map((dayId, index) =>
          ctx.db.itineraryDay.update({
            where: { id: dayId },
            data: { dayNumber: index + 1 },
          })
        )
      )

      return { success: true }
    }),

  // ============================================================================
  // ITINERARY ACTIVITIES
  // ============================================================================

  /**
   * Create a new activity
   */
  createActivity: adminProcedure
    .input(
      z.object({
        dayId: z.string(),
        time: z.string().optional(),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        location: z.string().optional(),
        type: activityTypeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify day exists
      const day = await ctx.db.itineraryDay.findUnique({
        where: { id: input.dayId },
        include: { _count: { select: { itineraryActivities: true } } },
      })

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary day not found',
        })
      }

      return ctx.db.itineraryActivity.create({
        data: {
          dayId: input.dayId,
          time: input.time,
          title: input.title,
          description: input.description,
          location: input.location,
          type: input.type,
          sortOrder: day._count.itineraryActivities, // Add at end
        },
      })
    }),

  /**
   * Update an activity
   */
  updateActivity: adminProcedure
    .input(
      z.object({
        id: z.string(),
        time: z.string().nullish(),
        title: z.string().min(1).optional(),
        description: z.string().nullish(),
        location: z.string().nullish(),
        type: activityTypeSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const activity = await ctx.db.itineraryActivity.findUnique({
        where: { id },
      })

      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        })
      }

      return ctx.db.itineraryActivity.update({
        where: { id },
        data: {
          ...(data.time !== undefined && { time: data.time }),
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.type && { type: data.type }),
        },
      })
    }),

  /**
   * Delete an activity
   */
  deleteActivity: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const activity = await ctx.db.itineraryActivity.findUnique({
        where: { id: input.id },
      })

      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        })
      }

      await ctx.db.itineraryActivity.delete({
        where: { id: input.id },
      })

      // Reorder remaining activities
      const remainingActivities = await ctx.db.itineraryActivity.findMany({
        where: { dayId: activity.dayId },
        orderBy: { sortOrder: 'asc' },
      })

      await ctx.db.$transaction(
        remainingActivities.map((act, index) =>
          ctx.db.itineraryActivity.update({
            where: { id: act.id },
            data: { sortOrder: index },
          })
        )
      )

      return { success: true }
    }),

  /**
   * Reorder activities within a day
   */
  reorderActivities: adminProcedure
    .input(
      z.object({
        dayId: z.string(),
        activityIds: z.array(z.string()), // Ordered list of activity IDs
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dayId, activityIds } = input

      // Verify day exists
      const day = await ctx.db.itineraryDay.findUnique({
        where: { id: dayId },
      })

      if (!day) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Itinerary day not found',
        })
      }

      // Update sort orders
      await ctx.db.$transaction(
        activityIds.map((activityId, index) =>
          ctx.db.itineraryActivity.update({
            where: { id: activityId },
            data: { sortOrder: index },
          })
        )
      )

      return { success: true }
    }),

  /**
   * Move activity to a different day
   */
  moveActivityToDay: adminProcedure
    .input(
      z.object({
        activityId: z.string(),
        targetDayId: z.string(),
        targetSortOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { activityId, targetDayId, targetSortOrder } = input

      const activity = await ctx.db.itineraryActivity.findUnique({
        where: { id: activityId },
      })

      if (!activity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Activity not found',
        })
      }

      const targetDay = await ctx.db.itineraryDay.findUnique({
        where: { id: targetDayId },
      })

      if (!targetDay) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target day not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Move activity to new day
        await tx.itineraryActivity.update({
          where: { id: activityId },
          data: {
            dayId: targetDayId,
            sortOrder: targetSortOrder,
          },
        })

        // Reorder activities in the source day
        const sourceActivities = await tx.itineraryActivity.findMany({
          where: { dayId: activity.dayId, id: { not: activityId } },
          orderBy: { sortOrder: 'asc' },
        })

        await Promise.all(
          sourceActivities.map((act, index) =>
            tx.itineraryActivity.update({
              where: { id: act.id },
              data: { sortOrder: index },
            })
          )
        )

        // Reorder activities in the target day
        const targetActivities = await tx.itineraryActivity.findMany({
          where: { dayId: targetDayId },
          orderBy: { sortOrder: 'asc' },
        })

        await Promise.all(
          targetActivities.map((act, index) =>
            tx.itineraryActivity.update({
              where: { id: act.id },
              data: { sortOrder: index },
            })
          )
        )

        return { success: true }
      })
    }),

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get itinerary statistics for admin dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalTemplates,
      activeTemplates,
      linkedToPackages,
      totalActivities,
    ] = await Promise.all([
      ctx.db.itineraryTemplate.count(),
      ctx.db.itineraryTemplate.count({ where: { isActive: true } }),
      ctx.db.itineraryTemplate.count({ where: { packageId: { not: null } } }),
      ctx.db.itineraryActivity.count(),
    ])

    return {
      totalTemplates,
      activeTemplates,
      linkedToPackages,
      totalActivities,
    }
  }),

  /**
   * Get packages for dropdown selection
   */
  getPackagesForSelect: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.package.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        durationOptions: true,
      },
      orderBy: { name: 'asc' },
    })
  }),
})
