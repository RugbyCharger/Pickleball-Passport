/**
 * Forum Router
 *
 * tRPC procedures for forum operations:
 * - Thread management
 * - Reply management
 * - Like/unlike
 * - Search
 */

import { z } from 'zod'
import { router, partnerProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { ForumCategory } from '@prisma/client'

export const forumRouter = router({
  /**
   * Get all forum threads with filtering and sorting
   */
  getThreads: partnerProcedure
    .input(
      z
        .object({
          category: z.nativeEnum(ForumCategory).optional(),
          search: z.string().optional(),
          sortBy: z.enum(['recent', 'popular', 'most_replies']).default('recent'),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {}
      
      if (input?.category) {
        where.category = input.category
      }
      
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' as const } },
          { content: { contains: input.search, mode: 'insensitive' as const } },
        ]
      }

      // Build orderBy
      let orderBy: Record<string, unknown> = { createdAt: 'desc' }
      if (input?.sortBy === 'popular') {
        orderBy = { likeCount: 'desc' }
      } else if (input?.sortBy === 'most_replies') {
        orderBy = { replyCount: 'desc' }
      }

      // Get pinned threads first
      const pinnedWhere = { ...where, isPinned: true }
      const pinnedThreads = await ctx.db.forumThread.findMany({
        where: pinnedWhere,
        include: {
          partner: {
            select: {
              clubName: true,
              id: true,
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Get regular threads
      const regularWhere = { ...where, isPinned: false }
      const totalCount = await ctx.db.forumThread.count({
        where: regularWhere,
      })

      const threads = await ctx.db.forumThread.findMany({
        where: regularWhere,
        include: {
          partner: {
            select: {
              clubName: true,
              id: true,
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
        orderBy,
        take: input?.limit || 20,
        skip: input?.offset || 0,
      })

      return {
        pinnedThreads: pinnedThreads.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          content: t.content.substring(0, 200), // Preview
          authorName: t.partner.clubName,
          authorId: t.partner.id,
          replyCount: t._count.replies,
          likeCount: t._count.likes,
          isPinned: t.isPinned,
          isAnnouncement: t.isAnnouncement,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        threads: threads.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          content: t.content.substring(0, 200), // Preview
          authorName: t.partner.clubName,
          authorId: t.partner.id,
          replyCount: t._count.replies,
          likeCount: t._count.likes,
          isPinned: t.isPinned,
          isAnnouncement: t.isAnnouncement,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        pagination: {
          total: totalCount,
          limit: input?.limit || 20,
          offset: input?.offset || 0,
          hasMore: (input?.offset || 0) + (input?.limit || 20) < totalCount,
        },
      }
    }),

  /**
   * Get single thread with replies
   */
  getThread: partnerProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      const thread = await ctx.db.forumThread.findUnique({
        where: { id: input.id },
        include: {
          partner: {
            select: {
              clubName: true,
              id: true,
            },
          },
          replies: {
            include: {
              partner: {
                select: {
                  clubName: true,
                  id: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      // Check if current user liked the thread
      const userLike = await ctx.db.forumLike.findUnique({
        where: {
          threadId_partnerId: {
            threadId: thread.id,
            partnerId: profile.id,
          },
        },
      })

      return {
        id: thread.id,
        title: thread.title,
        category: thread.category,
        content: thread.content,
        authorName: thread.partner.clubName,
        authorId: thread.partner.id,
        replyCount: thread._count.replies,
        likeCount: thread._count.likes,
        isLiked: !!userLike,
        isPinned: thread.isPinned,
        isAnnouncement: thread.isAnnouncement,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        replies: thread.replies.map((r) => ({
          id: r.id,
          content: r.content,
          authorName: r.partner.clubName,
          authorId: r.partner.id,
          likeCount: r._count.likes,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      }
    }),

  /**
   * Create new thread
   */
  createThread: partnerProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        category: z.nativeEnum(ForumCategory),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      const thread = await ctx.db.forumThread.create({
        data: {
          partnerId: profile.id,
          title: input.title,
          category: input.category,
          content: input.content,
        },
        include: {
          partner: {
            select: {
              clubName: true,
              id: true,
            },
          },
        },
      })

      return {
        id: thread.id,
        title: thread.title,
        category: thread.category,
        authorName: thread.partner.clubName,
        createdAt: thread.createdAt,
      }
    }),

  /**
   * Reply to thread
   */
  replyToThread: partnerProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      // Verify thread exists
      const thread = await ctx.db.forumThread.findUnique({
        where: { id: input.threadId },
      })

      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        })
      }

      // Create reply and update thread reply count
      const result = await ctx.db.$transaction(async (tx) => {
        const reply = await tx.forumReply.create({
          data: {
            threadId: input.threadId,
            partnerId: profile.id,
            content: input.content,
          },
          include: {
            partner: {
              select: {
                clubName: true,
                id: true,
              },
            },
          },
        })

        await tx.forumThread.update({
          where: { id: input.threadId },
          data: {
            replyCount: {
              increment: 1,
            },
          },
        })

        return reply
      })

      return {
        id: result.id,
        content: result.content,
        authorName: result.partner.clubName,
        authorId: result.partner.id,
        createdAt: result.createdAt,
      }
    }),

  /**
   * Like/unlike thread
   */
  toggleThreadLike: partnerProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      // Check if already liked
      const existingLike = await ctx.db.forumLike.findUnique({
        where: {
          threadId_partnerId: {
            threadId: input.threadId,
            partnerId: profile.id,
          },
        },
      })

      if (existingLike) {
        // Unlike
        await ctx.db.$transaction(async (tx) => {
          await tx.forumLike.delete({
            where: { id: existingLike.id },
          })
          await tx.forumThread.update({
            where: { id: input.threadId },
            data: {
              likeCount: {
                decrement: 1,
              },
            },
          })
        })
        return { liked: false }
      } else {
        // Like
        await ctx.db.$transaction(async (tx) => {
          await tx.forumLike.create({
            data: {
              threadId: input.threadId,
              partnerId: profile.id,
            },
          })
          await tx.forumThread.update({
            where: { id: input.threadId },
            data: {
              likeCount: {
                increment: 1,
              },
            },
          })
        })
        return { liked: true }
      }
    }),
})
