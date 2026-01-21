/**
 * CMS Router
 *
 * tRPC procedures for content management system (Story 12-1)
 * Supports CRUD operations for content blocks, pages, and categories
 * with versioning, draft/publish workflow, and preview functionality.
 */

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Schema for content status
const contentStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

// Schema for content block type
const contentBlockTypeSchema = z.enum([
  'TEXT',
  'HERO',
  'FEATURE',
  'TESTIMONIAL',
  'CTA',
  'FAQ',
  'GALLERY',
  'VIDEO',
  'CUSTOM',
])

// Maximum number of versions to keep
const MAX_VERSIONS = 5

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

/**
 * Clean up old versions, keeping only the most recent MAX_VERSIONS
 */
async function cleanupOldVersions(
  db: Prisma.TransactionClient,
  type: 'block' | 'page',
  entityId: string
): Promise<void> {
  if (type === 'block') {
    const versions = await db.contentBlockVersion.findMany({
      where: { blockId: entityId },
      orderBy: { versionNumber: 'desc' },
      select: { id: true, versionNumber: true },
    })

    if (versions.length > MAX_VERSIONS) {
      const idsToDelete = versions.slice(MAX_VERSIONS).map(v => v.id)
      await db.contentBlockVersion.deleteMany({
        where: { id: { in: idsToDelete } },
      })
    }
  } else {
    const versions = await db.contentPageVersion.findMany({
      where: { pageId: entityId },
      orderBy: { versionNumber: 'desc' },
      select: { id: true, versionNumber: true },
    })

    if (versions.length > MAX_VERSIONS) {
      const idsToDelete = versions.slice(MAX_VERSIONS).map(v => v.id)
      await db.contentPageVersion.deleteMany({
        where: { id: { in: idsToDelete } },
      })
    }
  }
}

export const cmsRouter = router({
  // ============================================================================
  // CONTENT CATEGORIES
  // ============================================================================

  /**
   * Get all categories
   */
  getCategories: adminProcedure
    .input(
      z.object({
        parentId: z.string().nullish(),
        includeChildren: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { parentId, includeChildren } = input || {}

      return ctx.db.contentCategory.findMany({
        where: parentId !== undefined ? { parentId } : undefined,
        include: includeChildren ? { children: true, parent: true } : undefined,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
    }),

  /**
   * Get single category by ID
   */
  getCategoryById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.contentCategory.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: true,
          pages: { select: { id: true, title: true, status: true } },
          blocks: { select: { id: true, name: true, status: true } },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      return category
    }),

  /**
   * Create category
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
        parentId: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.contentCategory.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A category with this slug already exists',
        })
      }

      return ctx.db.contentCategory.create({
        data: input,
      })
    }),

  /**
   * Update category
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
        parentId: z.string().nullish(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Verify category exists
      const existing = await ctx.db.contentCategory.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await ctx.db.contentCategory.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this slug already exists',
          })
        }
      }

      // Prevent circular parent reference
      if (data.parentId === id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category cannot be its own parent',
        })
      }

      return ctx.db.contentCategory.update({
        where: { id },
        data,
      })
    }),

  /**
   * Delete category
   */
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.contentCategory.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { pages: true, blocks: true, children: true } },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found',
        })
      }

      // Prevent deletion if has children or content
      if (category._count.children > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with child categories',
        })
      }

      if (category._count.pages > 0 || category._count.blocks > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with associated content',
        })
      }

      await ctx.db.contentCategory.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================================================
  // CONTENT BLOCKS
  // ============================================================================

  /**
   * Get all content blocks with filtering
   */
  getBlocks: adminProcedure
    .input(
      z.object({
        status: contentStatusSchema.optional(),
        type: contentBlockTypeSchema.optional(),
        categoryId: z.string().optional(),
        pageId: z.string().optional(),
        search: z.string().optional(),
        includeDeleted: z.boolean().default(false),
        sortBy: z.enum(['name', 'updatedAt', 'sortOrder']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        status,
        type,
        categoryId,
        pageId,
        search,
        includeDeleted = false,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.ContentBlockWhereInput = {
        ...(status && { status }),
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(pageId && { pageId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { plainText: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(!includeDeleted && { deletedAt: null }),
      }

      const [blocks, total] = await Promise.all([
        ctx.db.contentBlock.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            page: { select: { id: true, title: true, slug: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.contentBlock.count({ where }),
      ])

      return { blocks, total }
    }),

  /**
   * Get single content block by ID
   */
  getBlockById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          page: { select: { id: true, title: true, slug: true } },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: MAX_VERSIONS,
          },
        },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return block
    }),

  /**
   * Get content block by slug (for public consumption)
   */
  getBlockBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findFirst({
        where: {
          slug: input.slug,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          content: true,
          settings: true,
        },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return block
    }),

  /**
   * Create content block
   */
  createBlock: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
        type: contentBlockTypeSchema.default('TEXT'),
        content: z.unknown(), // TipTap JSON content
        settings: z.unknown().optional(),
        categoryId: z.string().optional(),
        pageId: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.contentBlock.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A content block with this slug already exists',
        })
      }

      const plainText = extractPlainText(input.content)

      const block = await ctx.db.contentBlock.create({
        data: {
          name: input.name,
          slug: input.slug,
          type: input.type,
          content: input.content as Prisma.InputJsonValue,
          plainText,
          settings: input.settings as Prisma.InputJsonValue | undefined,
          categoryId: input.categoryId,
          pageId: input.pageId,
          sortOrder: input.sortOrder,
          status: 'DRAFT',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true } },
          page: { select: { id: true, title: true } },
        },
      })

      return block
    }),

  /**
   * Update content block
   */
  updateBlock: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        type: contentBlockTypeSchema.optional(),
        content: z.unknown().optional(),
        settings: z.unknown().optional(),
        categoryId: z.string().nullish(),
        pageId: z.string().nullish(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Fetch current block
      const current = await ctx.db.contentBlock.findUnique({
        where: { id },
        include: {
          versions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      })

      if (!current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      if (current.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update deleted content block',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== current.slug) {
        const slugExists = await ctx.db.contentBlock.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A content block with this slug already exists',
          })
        }
      }

      // Create version if content changed
      const contentChanged = data.content !== undefined

      return ctx.db.$transaction(async (tx) => {
        if (contentChanged) {
          const nextVersion = (current.versions[0]?.versionNumber || 0) + 1

          await tx.contentBlockVersion.create({
            data: {
              blockId: id,
              versionNumber: nextVersion,
              content: current.content as Prisma.InputJsonValue,
              settings: current.settings as Prisma.InputJsonValue | undefined,
              changesSummary: 'Auto-saved before update',
              createdBy: ctx.user.id,
            },
          })

          // Clean up old versions
          await cleanupOldVersions(tx, 'block', id)
        }

        const plainText = data.content ? extractPlainText(data.content) : undefined

        // Build update data object to avoid TypeScript spread issues
        const updateData: Prisma.ContentBlockUpdateInput = {
          updatedBy: ctx.user.id,
        }
        if (data.name) updateData.name = data.name
        if (data.slug) updateData.slug = data.slug
        if (data.type) updateData.type = data.type
        if (data.content) updateData.content = data.content as Prisma.InputJsonValue
        if (plainText !== undefined) updateData.plainText = plainText
        if (data.settings !== undefined) updateData.settings = data.settings === null ? Prisma.JsonNull : data.settings as Prisma.InputJsonValue
        if (data.categoryId !== undefined) {
          updateData.category = data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true }
        }
        if (data.pageId !== undefined) {
          updateData.page = data.pageId ? { connect: { id: data.pageId } } : { disconnect: true }
        }
        if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder

        const updated = await tx.contentBlock.update({
          where: { id },
          data: updateData,
          include: {
            category: { select: { id: true, name: true } },
            page: { select: { id: true, title: true } },
          },
        })

        return updated
      })
    }),

  /**
   * Publish content block
   */
  publishBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      if (block.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot publish deleted content block',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Unpublish content block (set to draft)
   */
  unpublishBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Archive content block
   */
  archiveBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: {
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Soft delete content block
   */
  deleteBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Restore soft-deleted content block
   */
  restoreBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      if (!block.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Content block is not deleted',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.id },
        data: {
          deletedAt: null,
          status: 'DRAFT',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Permanently delete content block
   */
  permanentlyDeleteBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      // Only allow permanent deletion of soft-deleted blocks
      if (!block.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Block must be soft-deleted first',
        })
      }

      await ctx.db.contentBlock.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Restore block to a specific version
   */
  restoreBlockVersion: adminProcedure
    .input(
      z.object({
        blockId: z.string(),
        versionNumber: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.contentBlockVersion.findUnique({
        where: {
          blockId_versionNumber: {
            blockId: input.blockId,
            versionNumber: input.versionNumber,
          },
        },
      })

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version not found',
        })
      }

      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.blockId },
        include: {
          versions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Save current state as new version
        const nextVersion = (block.versions[0]?.versionNumber || 0) + 1

        await tx.contentBlockVersion.create({
          data: {
            blockId: input.blockId,
            versionNumber: nextVersion,
            content: block.content as Prisma.InputJsonValue,
            settings: block.settings as Prisma.InputJsonValue | undefined,
            changesSummary: `Before restoring to version ${input.versionNumber}`,
            createdBy: ctx.user.id,
          },
        })

        // Restore version content
        const updated = await tx.contentBlock.update({
          where: { id: input.blockId },
          data: {
            content: version.content as Prisma.InputJsonValue,
            settings: version.settings as Prisma.InputJsonValue | undefined,
            plainText: extractPlainText(version.content),
            updatedBy: ctx.user.id,
          },
        })

        // Clean up old versions
        await cleanupOldVersions(tx, 'block', input.blockId)

        return updated
      })
    }),

  /**
   * Duplicate content block
   */
  duplicateBlock: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.contentBlock.findUnique({
        where: { id: input.id },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      const timestamp = Date.now()
      const newSlug = `${original.slug}-copy-${timestamp}`

      return ctx.db.contentBlock.create({
        data: {
          name: `${original.name} (Copy)`,
          slug: newSlug,
          type: original.type,
          content: original.content as Prisma.InputJsonValue,
          plainText: original.plainText,
          settings: original.settings as Prisma.InputJsonValue | undefined,
          categoryId: original.categoryId,
          pageId: original.pageId,
          sortOrder: original.sortOrder,
          status: 'DRAFT',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
      })
    }),

  // ============================================================================
  // CONTENT PAGES
  // ============================================================================

  /**
   * Get all content pages with filtering
   */
  getPages: adminProcedure
    .input(
      z.object({
        status: contentStatusSchema.optional(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        includeDeleted: z.boolean().default(false),
        sortBy: z.enum(['title', 'updatedAt', 'publishedAt']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        status,
        categoryId,
        search,
        includeDeleted = false,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.ContentPageWhereInput = {
        ...(status && { status }),
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(!includeDeleted && { deletedAt: null }),
      }

      const [pages, total] = await Promise.all([
        ctx.db.contentPage.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { blocks: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.contentPage.count({ where }),
      ])

      return { pages, total }
    }),

  /**
   * Get single content page by ID
   */
  getPageById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          blocks: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: MAX_VERSIONS,
          },
        },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      return page
    }),

  /**
   * Get content page by slug (for public consumption)
   */
  getPageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findFirst({
        where: {
          slug: input.slug,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        include: {
          blocks: {
            where: {
              status: 'PUBLISHED',
              deletedAt: null,
            },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              content: true,
              settings: true,
            },
          },
        },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      return page
    }),

  /**
   * Create content page
   */
  createPage: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .regex(/^[a-z0-9-/]+$/, 'Slug must be lowercase with hyphens and slashes only'),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImage: z.string().url().optional(),
        template: z.string().optional(),
        isHomepage: z.boolean().default(false),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.contentPage.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A page with this slug already exists',
        })
      }

      // If setting as homepage, unset existing homepage
      if (input.isHomepage) {
        await ctx.db.contentPage.updateMany({
          where: { isHomepage: true },
          data: { isHomepage: false },
        })
      }

      return ctx.db.contentPage.create({
        data: {
          ...input,
          status: 'DRAFT',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        },
        include: {
          category: { select: { id: true, name: true } },
        },
      })
    }),

  /**
   * Update content page
   */
  updatePage: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z
          .string()
          .regex(/^[a-z0-9-/]+$/, 'Slug must be lowercase with hyphens and slashes only')
          .optional(),
        description: z.string().nullish(),
        metaTitle: z.string().nullish(),
        metaDescription: z.string().nullish(),
        ogImage: z.string().url().nullish(),
        template: z.string().nullish(),
        isHomepage: z.boolean().optional(),
        categoryId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Fetch current page
      const current = await ctx.db.contentPage.findUnique({
        where: { id },
        include: {
          versions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
          blocks: { select: { id: true } },
        },
      })

      if (!current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      if (current.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update deleted page',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== current.slug) {
        const slugExists = await ctx.db.contentPage.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A page with this slug already exists',
          })
        }
      }

      return ctx.db.$transaction(async (tx) => {
        // Create version snapshot
        const nextVersion = (current.versions[0]?.versionNumber || 0) + 1

        await tx.contentPageVersion.create({
          data: {
            pageId: id,
            versionNumber: nextVersion,
            content: {
              title: current.title,
              slug: current.slug,
              description: current.description,
              metaTitle: current.metaTitle,
              metaDescription: current.metaDescription,
              ogImage: current.ogImage,
              template: current.template,
              isHomepage: current.isHomepage,
              categoryId: current.categoryId,
              blockIds: current.blocks.map(b => b.id),
            },
            changesSummary: 'Auto-saved before update',
            createdBy: ctx.user.id,
          },
        })

        // Clean up old versions
        await cleanupOldVersions(tx, 'page', id)

        // If setting as homepage, unset existing homepage
        if (data.isHomepage) {
          await tx.contentPage.updateMany({
            where: { isHomepage: true, id: { not: id } },
            data: { isHomepage: false },
          })
        }

        const updated = await tx.contentPage.update({
          where: { id },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.slug && { slug: data.slug }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
            ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
            ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
            ...(data.template !== undefined && { template: data.template }),
            ...(data.isHomepage !== undefined && { isHomepage: data.isHomepage }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            updatedBy: ctx.user.id,
          },
          include: {
            category: { select: { id: true, name: true } },
          },
        })

        return updated
      })
    }),

  /**
   * Publish content page
   */
  publishPage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      if (page.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot publish deleted page',
        })
      }

      return ctx.db.contentPage.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Unpublish content page (set to draft)
   */
  unpublishPage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      return ctx.db.contentPage.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Archive content page
   */
  archivePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      return ctx.db.contentPage.update({
        where: { id: input.id },
        data: {
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Soft delete content page
   */
  deletePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      return ctx.db.contentPage.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Restore soft-deleted content page
   */
  restorePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      if (!page.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Page is not deleted',
        })
      }

      return ctx.db.contentPage.update({
        where: { id: input.id },
        data: {
          deletedAt: null,
          status: 'DRAFT',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Permanently delete content page
   */
  permanentlyDeletePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
      })

      if (!page) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      if (!page.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Page must be soft-deleted first',
        })
      }

      await ctx.db.contentPage.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Duplicate content page
   */
  duplicatePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.contentPage.findUnique({
        where: { id: input.id },
        include: {
          blocks: { where: { deletedAt: null } },
        },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content page not found',
        })
      }

      const timestamp = Date.now()
      const newSlug = `${original.slug}-copy-${timestamp}`

      return ctx.db.$transaction(async (tx) => {
        // Create page copy
        const newPage = await tx.contentPage.create({
          data: {
            title: `${original.title} (Copy)`,
            slug: newSlug,
            description: original.description,
            metaTitle: original.metaTitle,
            metaDescription: original.metaDescription,
            ogImage: original.ogImage,
            template: original.template,
            isHomepage: false, // Never duplicate as homepage
            categoryId: original.categoryId,
            status: 'DRAFT',
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          },
        })

        // Duplicate blocks if any
        if (original.blocks.length > 0) {
          for (const block of original.blocks) {
            await tx.contentBlock.create({
              data: {
                name: block.name,
                slug: `${block.slug}-${timestamp}`,
                type: block.type,
                content: block.content as Prisma.InputJsonValue,
                plainText: block.plainText,
                settings: block.settings as Prisma.InputJsonValue | undefined,
                sortOrder: block.sortOrder,
                pageId: newPage.id,
                categoryId: block.categoryId,
                status: 'DRAFT',
                createdBy: ctx.user.id,
                updatedBy: ctx.user.id,
              },
            })
          }
        }

        return tx.contentPage.findUnique({
          where: { id: newPage.id },
          include: {
            category: { select: { id: true, name: true } },
            _count: { select: { blocks: true } },
          },
        })
      })
    }),

  // ============================================================================
  // CONTENT STATISTICS
  // ============================================================================

  /**
   * Get CMS statistics for dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalBlocks,
      publishedBlocks,
      draftBlocks,
      totalPages,
      publishedPages,
      draftPages,
      totalCategories,
    ] = await Promise.all([
      ctx.db.contentBlock.count({ where: { deletedAt: null } }),
      ctx.db.contentBlock.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      ctx.db.contentBlock.count({ where: { status: 'DRAFT', deletedAt: null } }),
      ctx.db.contentPage.count({ where: { deletedAt: null } }),
      ctx.db.contentPage.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      ctx.db.contentPage.count({ where: { status: 'DRAFT', deletedAt: null } }),
      ctx.db.contentCategory.count(),
    ])

    return {
      blocks: {
        total: totalBlocks,
        published: publishedBlocks,
        draft: draftBlocks,
        archived: totalBlocks - publishedBlocks - draftBlocks,
      },
      pages: {
        total: totalPages,
        published: publishedPages,
        draft: draftPages,
        archived: totalPages - publishedPages - draftPages,
      },
      categories: totalCategories,
    }
  }),

  /**
   * Get recent content activity
   */
  getRecentActivity: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10

      const [recentBlocks, recentPages] = await Promise.all([
        ctx.db.contentBlock.findMany({
          where: { deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
            updatedAt: true,
            updatedBy: true,
          },
        }),
        ctx.db.contentPage.findMany({
          where: { deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            updatedAt: true,
            updatedBy: true,
          },
        }),
      ])

      return {
        blocks: recentBlocks,
        pages: recentPages,
      }
    }),
})
