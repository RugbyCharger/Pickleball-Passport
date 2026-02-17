/**
 * Notification Router
 *
 * tRPC procedures for notification management
 * Handles notification preferences, history, and mark as read
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { sendEmail } from '@/lib/email/sendgrid';
import { baseEmailTemplate } from '@/lib/email/templates/base';

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

  // ============================================================================
  // ADMIN BULK OPERATIONS
  // ============================================================================

  /**
   * Get user count by filter criteria
   * Helps admin preview how many users will receive notification
   */
  adminGetUserCount: adminProcedure
    .input(
      z.object({
        targetAudience: z.enum(['ALL', 'ROLE', 'BOOKING_STATUS', 'UPCOMING_TRIP', 'CUSTOM']),
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']).optional(),
        bookingStatus: z.enum(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
        daysUntilTrip: z.number().int().min(0).max(365).optional(),
        userIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let userCount = 0;

      switch (input.targetAudience) {
        case 'ALL':
          userCount = await ctx.db.user.count();
          break;

        case 'ROLE':
          if (!input.role) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Role is required when targetAudience is ROLE',
            });
          }
          userCount = await ctx.db.user.count({
            where: { role: input.role },
          });
          break;

        case 'BOOKING_STATUS':
          if (!input.bookingStatus) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Booking status is required when targetAudience is BOOKING_STATUS',
            });
          }
          // Count distinct users with bookings matching status
          const usersWithStatus = await ctx.db.booking.findMany({
            where: { status: input.bookingStatus },
            select: { userId: true },
            distinct: ['userId'],
          });
          userCount = usersWithStatus.length;
          break;

        case 'UPCOMING_TRIP':
          if (input.daysUntilTrip === undefined) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'daysUntilTrip is required when targetAudience is UPCOMING_TRIP',
            });
          }
          const now = new Date();
          const targetDate = new Date();
          targetDate.setDate(now.getDate() + input.daysUntilTrip);

          const usersWithTrips = await ctx.db.booking.findMany({
            where: {
              status: 'CONFIRMED',
              trip: {
                startDate: {
                  gte: now,
                  lte: targetDate,
                },
              },
            },
            select: { userId: true },
            distinct: ['userId'],
          });
          userCount = usersWithTrips.length;
          break;

        case 'CUSTOM':
          if (!input.userIds || input.userIds.length === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'userIds is required when targetAudience is CUSTOM',
            });
          }
          userCount = input.userIds.length;
          break;
      }

      return { count: userCount };
    }),

  /**
   * Send bulk notification
   * Creates in-app notifications and optionally sends emails
   */
  adminSendBulk: adminProcedure
    .input(
      z.object({
        targetAudience: z.enum(['ALL', 'ROLE', 'BOOKING_STATUS', 'UPCOMING_TRIP', 'CUSTOM']),
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']).optional(),
        bookingStatus: z.enum(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
        daysUntilTrip: z.number().int().min(0).max(365).optional(),
        userIds: z.array(z.string()).optional(),

        // Notification content
        type: z.enum(['BOOKING_CONFIRMATION', 'PAYMENT_RECEIPT', 'TRIP_REMINDER', 'GENERAL']),
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(2000),
        linkUrl: z.string().url().optional(),
        linkText: z.string().max(100).optional(),

        // Email option
        sendEmail: z.boolean().default(false),
        emailSubject: z.string().min(1).max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get target users based on criteria
      let targetUserIds: string[] = [];

      switch (input.targetAudience) {
        case 'ALL':
          const allUsers = await ctx.db.user.findMany({
            select: { id: true },
          });
          targetUserIds = allUsers.map(u => u.id);
          break;

        case 'ROLE':
          if (!input.role) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Role is required when targetAudience is ROLE',
            });
          }
          const roleUsers = await ctx.db.user.findMany({
            where: { role: input.role },
            select: { id: true },
          });
          targetUserIds = roleUsers.map(u => u.id);
          break;

        case 'BOOKING_STATUS':
          if (!input.bookingStatus) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Booking status is required when targetAudience is BOOKING_STATUS',
            });
          }
          const bookingUsers = await ctx.db.booking.findMany({
            where: { status: input.bookingStatus },
            select: { userId: true },
            distinct: ['userId'],
          });
          targetUserIds = bookingUsers.map(b => b.userId);
          break;

        case 'UPCOMING_TRIP':
          if (input.daysUntilTrip === undefined) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'daysUntilTrip is required when targetAudience is UPCOMING_TRIP',
            });
          }
          const now = new Date();
          const targetDate = new Date();
          targetDate.setDate(now.getDate() + input.daysUntilTrip);

          const tripUsers = await ctx.db.booking.findMany({
            where: {
              status: 'CONFIRMED',
              trip: {
                startDate: {
                  gte: now,
                  lte: targetDate,
                },
              },
            },
            select: { userId: true },
            distinct: ['userId'],
          });
          targetUserIds = tripUsers.map(b => b.userId);
          break;

        case 'CUSTOM':
          if (!input.userIds || input.userIds.length === 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'userIds is required when targetAudience is CUSTOM',
            });
          }
          targetUserIds = input.userIds;
          break;
      }

      if (targetUserIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No users match the specified criteria',
        });
      }

      // Create in-app notifications for all target users
      const notifications = await ctx.db.notification.createMany({
        data: targetUserIds.map(userId => ({
          userId,
          type: input.type,
          title: input.title,
          content: input.content,
          linkUrl: input.linkUrl,
          linkText: input.linkText,
        })),
      });

      // Optionally send emails
      let emailsSent = 0;
      let emailsFailed = 0;

      if (input.sendEmail) {
        if (!input.emailSubject) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'emailSubject is required when sendEmail is true',
          });
        }

        // Fetch user emails
        const users = await ctx.db.user.findMany({
          where: {
            id: { in: targetUserIds },
          },
          select: {
            id: true,
            email: true,
            guestProfile: {
              select: {
                firstName: true,
              },
            },
          },
        });

        // Send emails in parallel with error handling
        const emailResults = await Promise.allSettled(
          users.map(async (user) => {
            const html = baseEmailTemplate({
              title: input.title,
              content: `
                <p>Hi ${user.guestProfile?.firstName || 'there'},</p>
                <p>${input.content.replace(/\n/g, '</p><p>')}</p>
                ${input.linkUrl ? `
                  <p style="text-align: center; margin: 32px 0;">
                    <a href="${input.linkUrl}" class="button">
                      ${input.linkText || 'View Details'}
                    </a>
                  </p>
                ` : ''}
              `,
              preheader: input.title,
              footerText: 'This is a notification from The Pickleball Passport.',
            });

            await sendEmail({
              to: user.email,
              subject: input.emailSubject!,
              html,
              text: input.content,
            });
          })
        );

        // Count successes and failures
        emailResults.forEach(result => {
          if (result.status === 'fulfilled') {
            emailsSent++;
          } else {
            emailsFailed++;
          }
        });
      }

      return {
        success: true,
        notificationsSent: notifications.count,
        emailsSent,
        emailsFailed,
        targetUserCount: targetUserIds.length,
      };
    }),

  /**
   * Get list of users for custom selection
   * Returns users with basic info for admin to select
   */
  adminGetUsersList: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['GUEST', 'PARTNER', 'ADMIN']).optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: {
          ...(input.role && { role: input.role }),
          ...(input.search && {
            OR: [
              { email: { contains: input.search, mode: 'insensitive' } },
              {
                guestProfile: {
                  OR: [
                    { firstName: { contains: input.search, mode: 'insensitive' } },
                    { lastName: { contains: input.search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }),
        },
        select: {
          id: true,
          email: true,
          role: true,
          guestProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          partnerProfile: {
            select: {
              clubName: true,
            },
          },
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users;
    }),
});
