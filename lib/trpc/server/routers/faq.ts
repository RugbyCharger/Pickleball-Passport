/**
 * FAQ Router
 *
 * tRPC procedures for FAQ management (Story 12-4)
 * Supports CRUD operations for FAQs and FAQ categories
 * with drag-and-drop reordering and rich text answers.
 */

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

/**
 * Extract plain text from TipTap JSON content for search indexing
 */
function extractPlainText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> }
  if (!doc.content) return ''

  const texts: string[] = []

  const extractText = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: string; content?: unknown[] }
    if (n.text) texts.push(n.text)
    if (n.content && Array.isArray(n.content)) {
      n.content.forEach(extractText)
    }
  }

  doc.content.forEach(extractText)
  return texts.join(' ').trim()
}

export const faqRouter = router({
  // ============================================================================
  // FAQ CATEGORIES
  // ============================================================================

  /**
   * Get all FAQ categories
   */
  getCategories: adminProcedure
    .input(
      z.object({
        includeCount: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { includeCount = false } = input || {}

      return ctx.db.fAQCategory.findMany({
        include: includeCount ? { _count: { select: { faqs: true } } } : undefined,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
    }),

  /**
   * Get all FAQ categories (public - for FAQ page)
   */
  getPublicCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.fAQCategory.findMany({
      where: {
        faqs: {
          some: {
            isPublished: true,
          },
        },
      },
      include: {
        _count: {
          select: {
            faqs: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
  }),

  /**
   * Get single FAQ category by ID
   */
  getCategoryById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.fAQCategory.findUnique({
        where: { id: input.id },
        include: {
          faqs: {
            orderBy: { sortOrder: 'asc' },
          },
          _count: { select: { faqs: true } },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ category not found',
        })
      }

      return category
    }),

  /**
   * Create FAQ category
   */
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
        description: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.fAQCategory.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A FAQ category with this slug already exists',
        })
      }

      return ctx.db.fAQCategory.create({
        data: input,
      })
    }),

  /**
   * Update FAQ category
   */
  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        description: z.string().nullish(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify category exists
      const existing = await ctx.db.fAQCategory.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ category not found',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await ctx.db.fAQCategory.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A FAQ category with this slug already exists',
          })
        }
      }

      return ctx.db.fAQCategory.update({
        where: { id },
        data,
      })
    }),

  /**
   * Delete FAQ category
   */
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.fAQCategory.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { faqs: true } },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ category not found',
        })
      }

      // Prevent deletion if has FAQs
      if (category._count.faqs > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with associated FAQs. Please move or delete the FAQs first.',
        })
      }

      await ctx.db.fAQCategory.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Reorder FAQ categories
   */
  reorderCategories: adminProcedure
    .input(
      z.object({
        categoryIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update sortOrder for each category based on position in array
      await ctx.db.$transaction(
        input.categoryIds.map((id, index) =>
          ctx.db.fAQCategory.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      )

      return { success: true }
    }),

  // ============================================================================
  // FAQs
  // ============================================================================

  /**
   * Get all FAQs with filtering (admin)
   */
  getFAQs: adminProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        isPublished: z.boolean().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['question', 'updatedAt', 'sortOrder']).default('sortOrder'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        categoryId,
        isPublished,
        search,
        sortBy = 'sortOrder',
        sortOrder = 'asc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.FAQWhereInput = {
        ...(categoryId && { categoryId }),
        ...(isPublished !== undefined && { isPublished }),
        ...(search && {
          OR: [
            { question: { contains: search, mode: 'insensitive' } },
            { answerPlain: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [faqs, total] = await Promise.all([
        ctx.db.fAQ.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.fAQ.count({ where }),
      ])

      return { faqs, total }
    }),

  /**
   * Get all published FAQs (public)
   */
  getPublicFAQs: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, search } = input || {}

      const where: Prisma.FAQWhereInput = {
        isPublished: true,
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { question: { contains: search, mode: 'insensitive' } },
            { answerPlain: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      return ctx.db.fAQ.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { sortOrder: 'asc' },
        ],
      })
    }),

  /**
   * Get single FAQ by ID
   */
  getFAQById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const faq = await ctx.db.fAQ.findUnique({
        where: { id: input.id },
        include: {
          category: true,
        },
      })

      if (!faq) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      return faq
    }),

  /**
   * Create FAQ
   */
  createFAQ: adminProcedure
    .input(
      z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.unknown(), // TipTap JSON content
        categoryId: z.string().optional(),
        isPublished: z.boolean().default(false),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const answerPlain = extractPlainText(input.answer)

      // If sortOrder not provided, place at end of category
      let sortOrder = input.sortOrder
      if (sortOrder === undefined) {
        const lastFaq = await ctx.db.fAQ.findFirst({
          where: { categoryId: input.categoryId || null },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        })
        sortOrder = (lastFaq?.sortOrder ?? -1) + 1
      }

      return ctx.db.fAQ.create({
        data: {
          question: input.question,
          answer: input.answer as Prisma.InputJsonValue,
          answerPlain,
          categoryId: input.categoryId,
          isPublished: input.isPublished,
          sortOrder,
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Update FAQ
   */
  updateFAQ: adminProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string().min(1).optional(),
        answer: z.unknown().optional(),
        categoryId: z.string().nullish(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify FAQ exists
      const existing = await ctx.db.fAQ.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      const answerPlain = data.answer ? extractPlainText(data.answer) : undefined

      // Build update data
      const updateData: Prisma.FAQUpdateInput = {
        updatedBy: ctx.user.id,
      }

      if (data.question) updateData.question = data.question
      if (data.answer) updateData.answer = data.answer as Prisma.InputJsonValue
      if (answerPlain !== undefined) updateData.answerPlain = answerPlain
      if (data.isPublished !== undefined) updateData.isPublished = data.isPublished
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder
      if (data.categoryId !== undefined) {
        updateData.category = data.categoryId
          ? { connect: { id: data.categoryId } }
          : { disconnect: true }
      }

      return ctx.db.fAQ.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Publish FAQ
   */
  publishFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const faq = await ctx.db.fAQ.findUnique({
        where: { id: input.id },
      })

      if (!faq) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      return ctx.db.fAQ.update({
        where: { id: input.id },
        data: {
          isPublished: true,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Unpublish FAQ
   */
  unpublishFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const faq = await ctx.db.fAQ.findUnique({
        where: { id: input.id },
      })

      if (!faq) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      return ctx.db.fAQ.update({
        where: { id: input.id },
        data: {
          isPublished: false,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Delete FAQ
   */
  deleteFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const faq = await ctx.db.fAQ.findUnique({
        where: { id: input.id },
      })

      if (!faq) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      await ctx.db.fAQ.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Reorder FAQs within a category
   */
  reorderFAQs: adminProcedure
    .input(
      z.object({
        faqIds: z.array(z.string()),
        categoryId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update sortOrder for each FAQ based on position in array
      await ctx.db.$transaction(
        input.faqIds.map((id, index) =>
          ctx.db.fAQ.update({
            where: { id },
            data: {
              sortOrder: index,
              categoryId: input.categoryId,
              updatedBy: ctx.user.id,
            },
          })
        )
      )

      return { success: true }
    }),

  /**
   * Duplicate FAQ
   */
  duplicateFAQ: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.fAQ.findUnique({
        where: { id: input.id },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'FAQ not found',
        })
      }

      // Get next sortOrder in category
      const lastFaq = await ctx.db.fAQ.findFirst({
        where: { categoryId: original.categoryId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      })
      const nextSortOrder = (lastFaq?.sortOrder ?? -1) + 1

      return ctx.db.fAQ.create({
        data: {
          question: `${original.question} (Copy)`,
          answer: original.answer as Prisma.InputJsonValue,
          answerPlain: original.answerPlain,
          categoryId: original.categoryId,
          sortOrder: nextSortOrder,
          isPublished: false, // Always create as draft
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Bulk publish/unpublish FAQs
   */
  bulkUpdatePublishStatus: adminProcedure
    .input(
      z.object({
        faqIds: z.array(z.string()),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.fAQ.updateMany({
        where: { id: { in: input.faqIds } },
        data: { isPublished: input.isPublished },
      })

      return { success: true, count: input.faqIds.length }
    }),

  /**
   * Get FAQ statistics for dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalFAQs, publishedFAQs, draftFAQs, totalCategories] = await Promise.all([
      ctx.db.fAQ.count(),
      ctx.db.fAQ.count({ where: { isPublished: true } }),
      ctx.db.fAQ.count({ where: { isPublished: false } }),
      ctx.db.fAQCategory.count(),
    ])

    return {
      faqs: {
        total: totalFAQs,
        published: publishedFAQs,
        draft: draftFAQs,
      },
      categories: totalCategories,
    }
  }),
})
