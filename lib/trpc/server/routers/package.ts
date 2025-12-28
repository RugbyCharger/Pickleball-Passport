/**
 * Package Router
 *
 * tRPC procedures for package-related operations
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

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
})
