/**
 * Support Router
 *
 * tRPC procedures for support ticket management
 * Handles ticket creation, listing, and status tracking
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const supportRouter = router({
  /**
   * Create a new support ticket
   */
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5, 'Subject must be at least 5 characters'),
        message: z.string().min(20, 'Message must be at least 20 characters'),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.create({
        data: {
          userId: ctx.user.id,
          subject: input.subject,
          message: input.message,
          priority: input.priority,
          status: 'OPEN',
        },
      });

      // TODO: Send email notification to admin
      // TODO: Send confirmation email to user

      return ticket;
    }),

  /**
   * Get all support tickets for current user
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.db.supportTicket.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.status && { status: input.status }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return tickets;
    }),

  /**
   * Get single support ticket by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.supportTicket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Support ticket not found',
        });
      }

      // Ensure user owns this ticket
      if (ticket.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this ticket',
        });
      }

      return ticket;
    }),

  /**
   * Get ticket counts by status
   */
  getCounts: protectedProcedure.query(async ({ ctx }) => {
    const [total, open, inProgress, resolved] = await Promise.all([
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'OPEN' },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'IN_PROGRESS' },
      }),
      ctx.db.supportTicket.count({
        where: { userId: ctx.user.id, status: 'RESOLVED' },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }),
});
