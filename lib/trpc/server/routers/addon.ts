/**
 * AddOn Router
 *
 * tRPC procedures for add-on management:
 * - Public read operations for booking flow
 * - Admin CRUD operations for add-on management
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { AddOnCategory } from '@prisma/client'

export const addOnRouter = router({
  // ============================================================================
  // PUBLIC OPERATIONS
  // ============================================================================

  /**
   * Get all active add-ons
   * Public endpoint for booking flow
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const addOns = await ctx.db.addOn.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          category: 'asc',
        },
        {
          thPrice: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        thPrice: true,
        usPrice: true,
        imageUrl: true,
      },
    })

    return addOns
  }),

  /**
   * Get add-ons by category
   * Public endpoint for filtered add-on selection
   */
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(AddOnCategory),
      })
    )
    .query(async ({ ctx, input }) => {
      const addOns = await ctx.db.addOn.findMany({
        where: {
          category: input.category,
          isActive: true,
        },
        orderBy: {
          thPrice: 'asc',
        },
      })

      return addOns
    }),

  /**
   * Get add-ons by multiple categories
   * Public endpoint for medical add-ons step (E3-S4) and wellness add-ons step (E3-S5)
   */
  getByCategories: publicProcedure
    .input(
      z.object({
        categories: z.array(z.nativeEnum(AddOnCategory)).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const addOns = await ctx.db.addOn.findMany({
        where: {
          isActive: true,
          ...(input.categories && input.categories.length > 0
            ? { category: { in: input.categories } }
            : {}),
        },
        orderBy: [
          {
            category: 'asc',
          },
          {
            name: 'asc',
          },
        ],
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          thPrice: true,
          usPrice: true,
          imageUrl: true,
        },
      })

      return addOns
    }),

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  /**
   * Get all add-ons (admin view - includes inactive)
   * Admin endpoint for add-on management
   */
  adminGetAll: adminProcedure.query(async ({ ctx }) => {
    const addOns = await ctx.db.addOn.findMany({
      orderBy: [
        {
          category: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        thPrice: true,
        usPrice: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookingAddOns: true,
          },
        },
      },
    })

    return addOns
  }),

  /**
   * Get add-on by ID (admin view)
   * Admin endpoint for editing add-ons
   */
  adminGetById: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const addOn = await ctx.db.addOn.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              bookingAddOns: true,
            },
          },
        },
      })

      if (!addOn) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Add-on not found',
        })
      }

      return addOn
    }),

  /**
   * Create a new add-on
   * Admin endpoint for adding new add-ons
   */
  adminCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        category: z.nativeEnum(AddOnCategory),
        thPrice: z.number().int().min(0),
        usPrice: z.number().int().min(0),
        imageUrl: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const addOn = await ctx.db.addOn.create({
        data: input,
      })

      return addOn
    }),

  /**
   * Update an existing add-on
   * Admin endpoint for editing add-ons
   */
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(500).optional().nullable(),
        category: z.nativeEnum(AddOnCategory).optional(),
        thPrice: z.number().int().min(0).optional(),
        usPrice: z.number().int().min(0).optional(),
        imageUrl: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if add-on exists
      const existing = await ctx.db.addOn.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Add-on not found',
        })
      }

      const addOn = await ctx.db.addOn.update({
        where: { id },
        data: updateData,
      })

      return addOn
    }),

  /**
   * Toggle add-on active status
   * Admin endpoint for activating/deactivating add-ons
   */
  adminToggleActive: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const addOn = await ctx.db.addOn.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })

      return addOn
    }),

  /**
   * Delete an add-on
   * Admin endpoint for removing add-ons
   * Note: Cannot delete if add-on is in any bookings
   */
  adminDelete: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if add-on is in any bookings
      const addOnWithBookings = await ctx.db.addOn.findUnique({
        where: { id: input.id },
        select: {
          _count: {
            select: {
              bookingAddOns: true,
            },
          },
        },
      })

      if (!addOnWithBookings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Add-on not found',
        })
      }

      if (addOnWithBookings._count.bookingAddOns > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete add-on that is in existing bookings. Set it to inactive instead.',
        })
      }

      await ctx.db.addOn.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
