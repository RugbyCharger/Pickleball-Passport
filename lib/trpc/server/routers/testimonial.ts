/**
 * Testimonial Router
 *
 * Handles video testimonial CRUD operations and Mux integration.
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import {
  createUploadUrl,
  getVideoAsset,
  deleteVideoAsset,
  getThumbnailUrl,
} from '@/lib/mux/mux-service';
import { TRPCError } from '@trpc/server';

export const testimonialRouter = router({
  /**
   * Get all approved testimonials for public display
   */
  list: publicProcedure
    .input(
      z.object({
        packageType: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        sortBy: z.enum(['recent', 'popular']).default('recent'),
      })
    )
    .query(async ({ input, ctx }) => {
      const { packageType, limit, sortBy } = input;

      const testimonials = await ctx.db.testimonial.findMany({
        where: {
          isApproved: true,
          ...(packageType && { packageType }),
        },
        orderBy:
          sortBy === 'popular'
            ? { viewCount: 'desc' }
            : { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          guestName: true,
          guestAge: true,
          guestLocation: true,
          packageType: true,
          tripDate: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          quote: true,
          isFeatured: true,
          viewCount: true,
          createdAt: true,
        },
      });

      return testimonials;
    }),

  /**
   * Get a single testimonial by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const testimonial = await ctx.db.testimonial.findUnique({
        where: { id: input.id, isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        });
      }

      // Increment view count
      await ctx.db.testimonial.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return testimonial;
    }),

  /**
   * Get all testimonials (admin only)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        includeUnapproved: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const testimonials = await ctx.db.testimonial.findMany({
        where: input.includeUnapproved ? {} : { isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      return testimonials;
    }),

  /**
   * Create a direct upload URL for video upload
   */
  createUploadUrl: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }

    const result = await createUploadUrl();
    return result;
  }),

  /**
   * Create a new testimonial
   */
  create: protectedProcedure
    .input(
      z.object({
        guestName: z.string().min(1, 'Guest name is required'),
        guestAge: z.number().min(1).max(120).optional(),
        guestLocation: z.string().optional(),
        packageType: z.string().min(1, 'Package type is required'),
        tripDate: z.string().optional(),
        muxAssetId: z.string().min(1, 'Video asset ID is required'),
        quote: z.string().optional(),
        isFeatured: z.boolean().default(false),
        isApproved: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      // Get video details from Mux
      const videoAsset = await getVideoAsset(input.muxAssetId);

      if (!videoAsset) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Video asset not found or not ready',
        });
      }

      if (videoAsset.status !== 'ready') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Video is still processing. Please try again in a few minutes.',
        });
      }

      // Create testimonial
      const testimonial = await ctx.db.testimonial.create({
        data: {
          userId: ctx.user.id,
          guestName: input.guestName,
          guestAge: input.guestAge,
          guestLocation: input.guestLocation,
          packageType: input.packageType,
          tripDate: input.tripDate ? new Date(input.tripDate) : null,
          muxAssetId: input.muxAssetId,
          muxPlaybackId: videoAsset.playbackId,
          thumbnailUrl: videoAsset.thumbnailUrl,
          quote: input.quote,
          isFeatured: input.isFeatured,
          isApproved: input.isApproved,
        },
      });

      return testimonial;
    }),

  /**
   * Update a testimonial
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        guestName: z.string().optional(),
        guestAge: z.number().min(1).max(120).optional(),
        guestLocation: z.string().optional(),
        packageType: z.string().optional(),
        tripDate: z.string().optional(),
        quote: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isApproved: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const { id, tripDate, ...updateData } = input;

      const testimonial = await ctx.db.testimonial.update({
        where: { id },
        data: {
          ...updateData,
          ...(tripDate && { tripDate: new Date(tripDate) }),
        },
      });

      return testimonial;
    }),

  /**
   * Delete a testimonial
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      // Get testimonial to retrieve Mux asset ID
      const testimonial = await ctx.db.testimonial.findUnique({
        where: { id: input.id },
      });

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        });
      }

      // Delete from database
      await ctx.db.testimonial.delete({
        where: { id: input.id },
      });

      // Delete video from Mux
      if (testimonial.muxAssetId) {
        await deleteVideoAsset(testimonial.muxAssetId);
      }

      return { success: true };
    }),

  /**
   * Get featured testimonials for homepage
   */
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const testimonials = await ctx.db.testimonial.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      orderBy: { viewCount: 'desc' },
      take: 6,
      select: {
        id: true,
        guestName: true,
        guestLocation: true,
        packageType: true,
        muxPlaybackId: true,
        thumbnailUrl: true,
        quote: true,
      },
    });

    return testimonials;
  }),
});
