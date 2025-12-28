/**
 * Notification Router
 *
 * tRPC procedures for notification management
 * Handles notification preferences, history, and mark as read
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const notificationRouter = router({
  /**
   * Get all notifications for current user
   * Sorted by most recent first
   */
  list: protectedProcedure
    .input(
      z
        .object({
          unreadOnly: z.boolean().optional(),
          type: z
            .enum([
              'BOOKING_CONFIRMATION',
              'PAYMENT_RECEIPT',
              'TRIP_REMINDER',
              'GENERAL',
            ])
            .optional(),
          limit: z.number().int().positive().max(100).optional().default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.unreadOnly && { readAt: null }),
          ...(input?.type && { type: input.type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input?.limit || 50,
      });

      return notifications;
    }),

  /**
   * Get notification counts
   */
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, unread] = await Promise.all([
      ctx.db.notification.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.notification.count({
        where: { userId: ctx.user.id, readAt: null },
      }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
    };
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify notification belongs to user
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        });
      }

      if (notification.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this notification',
        });
      }

      const updated = await ctx.db.notification.update({
        where: { id: input.id },
        data: { readAt: new Date() },
      });

      return updated;
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        userId: ctx.user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { success: true };
  }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify notification belongs to user
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        });
      }

      if (notification.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this notification',
        });
      }

      await ctx.db.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
