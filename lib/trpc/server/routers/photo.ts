/**
 * Photo Router
 *
 * tRPC procedures for trip photo management:
 * - Upload photo record (file URL from Supabase Storage)
 * - List all photos for a trip (group gallery)
 * - List user's photos for a trip (personal journal)
 * - Delete a photo (owner only)
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const photoRouter = router({
  /**
   * Upload photo record
   *
   * Creates a TripPhoto record after file has been uploaded to Supabase Storage.
   * Verifies user has a booking for the trip before creating.
   */
  upload: protectedProcedure
    .input(
      z.object({
        tripId: z.string().cuid(),
        fileUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        caption: z.string().max(500).optional(),
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
          message: 'You must have a confirmed booking for this trip to upload photos',
        })
      }

      // Create photo record
      const photo = await ctx.db.tripPhoto.create({
        data: {
          tripId: input.tripId,
          uploadedBy: ctx.user.id,
          fileUrl: input.fileUrl,
          thumbnailUrl: input.thumbnailUrl,
          caption: input.caption,
        },
      })

      return photo
    }),

  /**
   * List all photos for a trip
   *
   * Returns all photos uploaded by any guest on this trip (group gallery).
   * Verifies user has a booking for the trip.
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

      // Get all photos for this trip
      const photos = await ctx.db.tripPhoto.findMany({
        where: { tripId: input.tripId },
        orderBy: { uploadedAt: 'desc' },
      })

      return photos
    }),

  /**
   * List user's photos for a trip
   *
   * Returns only photos uploaded by the current user (personal journal).
   */
  listMine: protectedProcedure
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

      // Get only user's photos
      const photos = await ctx.db.tripPhoto.findMany({
        where: {
          tripId: input.tripId,
          uploadedBy: ctx.user.id,
        },
        orderBy: { uploadedAt: 'desc' },
      })

      return photos
    }),

  /**
   * Delete a photo
   *
   * Only the user who uploaded the photo can delete it.
   * Note: This only removes the database record. Supabase Storage cleanup
   * should be handled separately (e.g., via a cron job or trigger).
   */
  delete: protectedProcedure
    .input(
      z.object({
        photoId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the photo
      const photo = await ctx.db.tripPhoto.findUnique({
        where: { id: input.photoId },
      })

      if (!photo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Photo not found',
        })
      }

      // Verify ownership
      if (photo.uploadedBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own photos',
        })
      }

      // Delete the photo record
      await ctx.db.tripPhoto.delete({
        where: { id: input.photoId },
      })

      return { success: true }
    }),
})
