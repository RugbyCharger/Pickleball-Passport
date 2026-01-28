/**
 * Checklist Router
 *
 * tRPC procedures for pre-trip checklist management:
 * - Get checklist status for a booking
 * - Toggle checklist item completion
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Default checklist items that every guest should complete
const DEFAULT_CHECKLIST_ITEMS = [
  { key: 'passport', label: 'Verify passport is valid (6+ months from travel date)' },
  { key: 'visa', label: 'Check visa requirements for Thailand' },
  { key: 'travel_insurance', label: 'Purchase travel insurance' },
  { key: 'medical_forms', label: 'Complete medical questionnaire' },
  { key: 'itinerary_reviewed', label: 'Review trip itinerary' },
  { key: 'packing_complete', label: 'Complete packing' },
  { key: 'emergency_contact', label: 'Update emergency contact information' },
  { key: 'flight_booked', label: 'Book flights' },
  { key: 'airport_transfer', label: 'Arrange airport transfer' },
] as const

export const checklistRouter = router({
  /**
   * Get checklist status for a booking
   *
   * Returns all checklist items with their completion status.
   * Creates default items if they don't exist yet.
   */
  getChecklistStatus: protectedProcedure
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

      // Get existing checklist items
      const existingItems = await ctx.db.preTripChecklistItem.findMany({
        where: { bookingId: input.bookingId },
      })

      // Create a map of existing items by key
      const existingMap = new Map(existingItems.map((item) => [item.itemKey, item]))

      // Merge with defaults to ensure all items are present
      const items = DEFAULT_CHECKLIST_ITEMS.map((defaultItem) => {
        const existing = existingMap.get(defaultItem.key)
        return {
          key: defaultItem.key,
          label: defaultItem.label,
          isComplete: existing?.isComplete ?? false,
          completedAt: existing?.completedAt ?? null,
          id: existing?.id ?? null,
        }
      })

      // Calculate progress
      const completedCount = items.filter((item) => item.isComplete).length
      const totalCount = items.length

      return {
        items,
        progress: {
          completed: completedCount,
          total: totalCount,
          percentage: Math.round((completedCount / totalCount) * 100),
        },
      }
    }),

  /**
   * Toggle checklist item completion
   *
   * Upserts the checklist item (creates if not exists, updates if exists).
   * Sets completedAt to now() when isComplete=true, null when false.
   */
  toggleChecklistItem: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().cuid(),
        itemKey: z.string().min(1).max(100),
        isComplete: z.boolean(),
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
          message: 'You do not have permission to update this booking',
        })
      }

      // Validate itemKey is a known checklist item
      const validKeys = DEFAULT_CHECKLIST_ITEMS.map((item) => item.key)
      if (!validKeys.includes(input.itemKey as typeof validKeys[number])) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid checklist item key',
        })
      }

      // Upsert the checklist item
      const item = await ctx.db.preTripChecklistItem.upsert({
        where: {
          bookingId_itemKey: {
            bookingId: input.bookingId,
            itemKey: input.itemKey,
          },
        },
        create: {
          bookingId: input.bookingId,
          itemKey: input.itemKey,
          isComplete: input.isComplete,
          completedAt: input.isComplete ? new Date() : null,
        },
        update: {
          isComplete: input.isComplete,
          completedAt: input.isComplete ? new Date() : null,
        },
      })

      return item
    }),

  /**
   * Get checklist item keys
   *
   * Returns the list of default checklist items.
   * Useful for client-side validation and display.
   */
  getChecklistItems: protectedProcedure.query(() => {
    return DEFAULT_CHECKLIST_ITEMS
  }),
})
