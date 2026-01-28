/**
 * Packing Router
 *
 * tRPC procedures for packing list management:
 * - Get packing list for a booking (auto-creates from templates if needed)
 * - Toggle item packed status
 * - Add custom items
 * - Delete custom items
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const packingRouter = router({
  /**
   * Get packing list for a booking
   *
   * If no guest items exist, auto-creates from package's packing templates.
   * Returns combined list: template-based items + custom items
   * Sorted by category, then sortOrder
   */
  getPackingList: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: {
          userId: true,
          packageId: true,
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

      // Check if guest already has packing items
      const existingItems = await ctx.db.guestPackingItem.findMany({
        where: { bookingId: input.bookingId },
        orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
      })

      // If no items exist, auto-create from package templates
      if (existingItems.length === 0) {
        // Get package-specific templates (or default templates if packageId is null)
        const templates = await ctx.db.packingListTemplate.findMany({
          where: {
            OR: [
              { packageId: booking.packageId },
              { packageId: null, isDefault: true },
            ],
          },
          orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        })

        // Create guest items from templates
        if (templates.length > 0) {
          const itemsToCreate = templates.map((template) => ({
            bookingId: input.bookingId,
            templateId: template.id,
            item: template.item,
            category: template.category,
            isPacked: false,
            isCustom: false,
          }))

          await ctx.db.guestPackingItem.createMany({
            data: itemsToCreate,
          })

          // Fetch the newly created items
          const newItems = await ctx.db.guestPackingItem.findMany({
            where: { bookingId: input.bookingId },
            orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
          })

          return newItems
        }
      }

      return existingItems
    }),

  /**
   * Toggle item packed status
   */
  toggleItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        isPacked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get item and verify ownership through booking
      const item = await ctx.db.guestPackingItem.findUnique({
        where: { id: input.itemId },
        include: {
          booking: {
            select: { userId: true },
          },
        },
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Packing item not found',
        })
      }

      if (item.booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this item',
        })
      }

      // Update packed status
      const updatedItem = await ctx.db.guestPackingItem.update({
        where: { id: input.itemId },
        data: { isPacked: input.isPacked },
      })

      return updatedItem
    }),

  /**
   * Add custom item to packing list
   */
  addCustomItem: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        item: z.string().min(1).max(200),
        category: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { userId: true },
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
          message: 'You do not have permission to add items to this booking',
        })
      }

      // Create custom item
      const newItem = await ctx.db.guestPackingItem.create({
        data: {
          bookingId: input.bookingId,
          item: input.item,
          category: input.category,
          isPacked: false,
          isCustom: true,
        },
      })

      return newItem
    }),

  /**
   * Delete custom item from packing list
   *
   * Only custom items can be deleted. Template-based items cannot be deleted.
   */
  deleteCustomItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get item and verify ownership through booking
      const item = await ctx.db.guestPackingItem.findUnique({
        where: { id: input.itemId },
        include: {
          booking: {
            select: { userId: true },
          },
        },
      })

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Packing item not found',
        })
      }

      if (item.booking.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this item',
        })
      }

      // Only allow deleting custom items
      if (!item.isCustom) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete template-based items. You can only unpack them.',
        })
      }

      // Delete the item
      await ctx.db.guestPackingItem.delete({
        where: { id: input.itemId },
      })

      return { success: true }
    }),

  /**
   * Get packing progress for a booking
   *
   * Returns counts of packed vs total items by category
   */
  getProgress: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user owns booking
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        select: { userId: true },
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

      // Get all items and their packed status
      const items = await ctx.db.guestPackingItem.findMany({
        where: { bookingId: input.bookingId },
        select: {
          category: true,
          isPacked: true,
        },
      })

      // Calculate progress by category
      const progressByCategory = items.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = { total: 0, packed: 0 }
          }
          acc[item.category].total += 1
          if (item.isPacked) {
            acc[item.category].packed += 1
          }
          return acc
        },
        {} as Record<string, { total: number; packed: number }>
      )

      // Calculate overall progress
      const totalItems = items.length
      const packedItems = items.filter((i) => i.isPacked).length

      return {
        total: totalItems,
        packed: packedItems,
        percentage: totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0,
        byCategory: progressByCategory,
      }
    }),
})
