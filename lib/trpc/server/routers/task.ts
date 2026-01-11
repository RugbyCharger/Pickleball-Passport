/**
 * Task Router
 *
 * tRPC procedures for task CRUD operations
 * Tasks are linked to bookings and can have priorities
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Schema for task priority and status matching Prisma enums
const TaskPrioritySchema = z.enum(['URGENT', 'IMPORTANT', 'NORMAL']);
const TaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const taskRouter = router({
  /**
   * Create a new task (admin only)
   * Title required, priority defaults to NORMAL
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required').max(200),
        description: z.string().max(2000).optional(),
        priority: TaskPrioritySchema.default('NORMAL'),
        status: TaskStatusSchema.default('PENDING'),
        dueDate: z.string().datetime().optional(),
        bookingId: z.string().optional(),
        assignedToUserId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify booking exists if provided
      if (input.bookingId) {
        const booking = await ctx.db.booking.findUnique({
          where: { id: input.bookingId },
        });
        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }
      }

      // Verify assigned user exists if provided
      if (input.assignedToUserId) {
        const user = await ctx.db.user.findUnique({
          where: { id: input.assignedToUserId },
        });
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assigned user not found',
          });
        }
      }

      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          bookingId: input.bookingId,
          assignedToUserId: input.assignedToUserId,
          createdByUserId: ctx.user.id,
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
            },
          },
        },
      });

      return task;
    }),

  /**
   * Get tasks with filters
   * Supports filtering by bookingId, status, priority, assignedTo
   */
  getTasks: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().optional(),
        status: TaskStatusSchema.optional(),
        priority: TaskPrioritySchema.optional(),
        assignedToUserId: z.string().optional(),
        createdByUserId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      const isAdmin = dbUser?.role === 'ADMIN';

      // Build where clause
      const where: {
        bookingId?: string;
        status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
        priority?: 'URGENT' | 'IMPORTANT' | 'NORMAL';
        assignedToUserId?: string;
        createdByUserId?: string;
      } = {};

      if (input?.bookingId) where.bookingId = input.bookingId;
      if (input?.status) where.status = input.status;
      if (input?.priority) where.priority = input.priority;
      if (input?.createdByUserId) where.createdByUserId = input.createdByUserId;

      // Non-admins can only see tasks assigned to them
      if (!isAdmin) {
        where.assignedToUserId = ctx.user.id;
      } else if (input?.assignedToUserId) {
        where.assignedToUserId = input.assignedToUserId;
      }

      const [tasks, total] = await Promise.all([
        ctx.db.task.findMany({
          where,
          orderBy: [
            // Sort by priority (URGENT first) then by dueDate
            { priority: 'asc' }, // URGENT=0, IMPORTANT=1, NORMAL=2 in enum order
            { dueDate: 'asc' },
            { createdAt: 'desc' },
          ],
          include: {
            booking: {
              select: {
                id: true,
                bookingReference: true,
                user: {
                  select: {
                    email: true,
                    guestProfile: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          take: input?.limit || 50,
          skip: input?.offset || 0,
        }),
        ctx.db.task.count({ where }),
      ]);

      return {
        tasks,
        total,
        hasMore: (input?.offset || 0) + tasks.length < total,
      };
    }),

  /**
   * Get a single task by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  guestProfile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Check authorization - user must be admin, creator, or assigned user
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      const isAdmin = dbUser?.role === 'ADMIN';
      const isAssigned = task.assignedToUserId === ctx.user.id;
      const isCreator = task.createdByUserId === ctx.user.id;

      if (!isAdmin && !isAssigned && !isCreator) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this task',
        });
      }

      return task;
    }),

  /**
   * Update task (status, priority, details)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(2000).optional().nullable(),
        priority: TaskPrioritySchema.optional(),
        status: TaskStatusSchema.optional(),
        dueDate: z.string().datetime().optional().nullable(),
        assignedToUserId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing task
      const existingTask = await ctx.db.task.findUnique({
        where: { id: input.id },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Check authorization
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      const isAdmin = dbUser?.role === 'ADMIN';
      const isAssigned = existingTask.assignedToUserId === ctx.user.id;

      // Non-admins can only update status on tasks assigned to them
      if (!isAdmin) {
        if (!isAssigned) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this task',
          });
        }

        // Non-admins can only update status
        if (
          input.title !== undefined ||
          input.description !== undefined ||
          input.priority !== undefined ||
          input.dueDate !== undefined ||
          input.assignedToUserId !== undefined
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update the status of tasks assigned to you',
          });
        }
      }

      // Verify new assigned user exists if provided
      if (input.assignedToUserId) {
        const user = await ctx.db.user.findUnique({
          where: { id: input.assignedToUserId },
        });
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Assigned user not found',
          });
        }
      }

      // Build update data
      const updateData: {
        title?: string;
        description?: string | null;
        priority?: 'URGENT' | 'IMPORTANT' | 'NORMAL';
        status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
        dueDate?: Date | null;
        assignedToUserId?: string | null;
      } = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.dueDate !== undefined) {
        updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
      }
      if (input.assignedToUserId !== undefined) {
        updateData.assignedToUserId = input.assignedToUserId;
      }

      const task = await ctx.db.task.update({
        where: { id: input.id },
        data: updateData,
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
            },
          },
        },
      });

      return task;
    }),

  /**
   * Delete task (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify task exists
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
      });

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      await ctx.db.task.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get task counts by status
   * For dashboard metrics
   */
  getCounts: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().optional(),
        assignedToUserId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      const isAdmin = dbUser?.role === 'ADMIN';

      // Build base where clause
      const baseWhere: {
        bookingId?: string;
        assignedToUserId?: string;
      } = {};

      if (input?.bookingId) baseWhere.bookingId = input.bookingId;

      // Non-admins can only see their own task counts
      if (!isAdmin) {
        baseWhere.assignedToUserId = ctx.user.id;
      } else if (input?.assignedToUserId) {
        baseWhere.assignedToUserId = input.assignedToUserId;
      }

      const [total, pending, inProgress, completed, urgent, important] =
        await Promise.all([
          ctx.db.task.count({ where: baseWhere }),
          ctx.db.task.count({ where: { ...baseWhere, status: 'PENDING' } }),
          ctx.db.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
          ctx.db.task.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
          ctx.db.task.count({ where: { ...baseWhere, priority: 'URGENT' } }),
          ctx.db.task.count({ where: { ...baseWhere, priority: 'IMPORTANT' } }),
        ]);

      return {
        total,
        pending,
        inProgress,
        completed,
        urgent,
        important,
      };
    }),

  /**
   * Get tasks for current user (assigned tasks)
   * Simplified version for guest dashboard
   */
  getMyTasks: protectedProcedure
    .input(
      z.object({
        bookingId: z.string().optional(),
        status: TaskStatusSchema.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: {
        assignedToUserId: string;
        bookingId?: string;
        status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      } = {
        assignedToUserId: ctx.user.id,
      };

      if (input?.bookingId) where.bookingId = input.bookingId;
      if (input?.status) where.status = input.status;

      const tasks = await ctx.db.task.findMany({
        where,
        orderBy: [
          { priority: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
            },
          },
        },
      });

      return tasks;
    }),

  /**
   * Mark task as complete (shortcut for status update)
   */
  markComplete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get existing task
      const existingTask = await ctx.db.task.findUnique({
        where: { id: input.id },
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        });
      }

      // Check authorization - must be admin or assigned user
      const dbUser = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { role: true },
      });

      const isAdmin = dbUser?.role === 'ADMIN';
      const isAssigned = existingTask.assignedToUserId === ctx.user.id;

      if (!isAdmin && !isAssigned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to complete this task',
        });
      }

      const task = await ctx.db.task.update({
        where: { id: input.id },
        data: { status: 'COMPLETED' },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
            },
          },
        },
      });

      return task;
    }),
});
