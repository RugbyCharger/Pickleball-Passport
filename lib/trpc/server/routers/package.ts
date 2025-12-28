/**
 * Package Router
 *
 * tRPC procedures for package-related operations:
 * - Public read operations for guests
 * - Admin CRUD operations for package management
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const packageRouter = router({
  /**
   * Get all active packages
   * Public endpoint for marketing website
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const packages = await ctx.db.package.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        basePrice: 'asc', // Show most affordable first
      },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        basePrice: true,
        durationOptions: true,
        heroImageUrl: true,
        imageUrls: true,
        metaTitle: true,
        metaDescription: true,
      },
    })

    return packages
  }),

  /**
   * Get package by slug
   * Public endpoint for package detail pages
   */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: {
          slug: input.slug,
          isActive: true,
        },
        include: {
          itineraries: {
            orderBy: {
              duration: 'asc',
            },
          },
        },
      })

      return packageData
    }),

  /**
   * Get package highlights for homepage
   * Returns simplified data optimized for the package explorer grid
   */
  getHighlights: publicProcedure.query(async ({ ctx }) => {
    const packages = await ctx.db.package.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        basePrice: 'asc',
      },
      select: {
        slug: true,
        name: true,
        tagline: true,
        basePrice: true,
        durationOptions: true,
        heroImageUrl: true,
      },
      take: 4, // Limit to featured packages on homepage
    })

    return packages
  }),

  // ============================================================================
  // ADMIN OPERATIONS
  // ============================================================================

  /**
   * Get all packages (admin view - includes inactive)
   * Admin endpoint for package management
   */
  adminGetAll: adminProcedure.query(async ({ ctx }) => {
    const packages = await ctx.db.package.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        basePrice: true,
        durationOptions: true,
        heroImageUrl: true,
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

    return packages
  }),

  /**
   * Get package by ID (admin view - full details)
   * Admin endpoint for editing packages
   */
  adminGetById: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: {
          id: input.id,
        },
        include: {
          itineraries: {
            orderBy: {
              duration: 'asc',
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return packageData
    }),

  /**
   * Create a new package
   * Admin endpoint for adding new packages
   */
  adminCreate: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
        name: z.string().min(1).max(200),
        tagline: z.string().max(200).optional(),
        description: z.string().min(1),
        basePrice: z.number().int().min(0),
        durationOptions: z.array(z.number().int()).min(1),
        heroImageUrl: z.string().url().optional(),
        imageUrls: z.array(z.string().url()).optional().default([]),
        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(300).optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existing = await ctx.db.package.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A package with this slug already exists',
        })
      }

      const packageData = await ctx.db.package.create({
        data: input,
      })

      return packageData
    }),

  /**
   * Update an existing package
   * Admin endpoint for editing packages
   */
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
        name: z.string().min(1).max(200).optional(),
        tagline: z.string().max(200).optional().nullable(),
        description: z.string().min(1).optional(),
        basePrice: z.number().int().min(0).optional(),
        durationOptions: z.array(z.number().int()).min(1).optional(),
        heroImageUrl: z.string().url().optional().nullable(),
        imageUrls: z.array(z.string().url()).optional(),
        metaTitle: z.string().max(200).optional().nullable(),
        metaDescription: z.string().max(300).optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if package exists
      const existing = await ctx.db.package.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      // If updating slug, check for conflicts
      if (input.slug && input.slug !== existing.slug) {
        const slugConflict = await ctx.db.package.findUnique({
          where: { slug: input.slug },
        })

        if (slugConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A package with this slug already exists',
          })
        }
      }

      const packageData = await ctx.db.package.update({
        where: { id },
        data: updateData,
      })

      return packageData
    }),

  /**
   * Toggle package active status
   * Admin endpoint for activating/deactivating packages
   */
  adminToggleActive: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })

      return packageData
    }),

  /**
   * Delete a package
   * Admin endpoint for removing packages
   * Note: Cannot delete if package has bookings
   */
  adminDelete: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if package has bookings
      const packageWithBookings = await ctx.db.package.findUnique({
        where: { id: input.id },
        select: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      })

      if (!packageWithBookings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      if (packageWithBookings._count.bookings > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete package with existing bookings. Set it to inactive instead.',
        })
      }

      await ctx.db.package.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
