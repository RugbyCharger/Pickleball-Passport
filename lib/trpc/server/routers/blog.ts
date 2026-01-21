/**
 * Blog Router
 *
 * tRPC procedures for blog content management (Story 12-3)
 * Supports CRUD operations for blog posts, categories, and tags
 * with versioning, draft/scheduled/published workflow, and SEO fields.
 */

import { z } from 'zod'
import { Prisma, BlogPostStatus } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Schema for blog post status
const blogPostStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'])

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
async function cleanupOldPostVersions(
  db: Prisma.TransactionClient,
  postId: string
): Promise<void> {
  const versions = await db.blogPostVersion.findMany({
    where: { postId },
    orderBy: { versionNumber: 'desc' },
    select: { id: true, versionNumber: true },
  })

  if (versions.length > MAX_VERSIONS) {
    const idsToDelete = versions.slice(MAX_VERSIONS).map(v => v.id)
    await db.blogPostVersion.deleteMany({
      where: { id: { in: idsToDelete } },
    })
  }
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const blogRouter = router({
  // ============================================================================
  // BLOG CATEGORIES
  // ============================================================================

  /**
   * Get all blog categories
   */
  getCategories: adminProcedure
    .input(
      z.object({
        includePostCount: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { includePostCount = false } = input || {}

      return ctx.db.blogCategory.findMany({
        include: includePostCount ? { _count: { select: { posts: true } } } : undefined,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
    }),

  /**
   * Get public blog categories (for frontend filters)
   */
  getPublicCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
                deletedAt: null,
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
  }),

  /**
   * Get single category by ID
   */
  getCategoryById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.blogCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { posts: true } } },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog category not found',
        })
      }

      return category
    }),

  /**
   * Create blog category
   */
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || generateSlug(input.name)

      // Check slug uniqueness
      const existing = await ctx.db.blogCategory.findUnique({
        where: { slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A category with this slug already exists',
        })
      }

      return ctx.db.blogCategory.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          color: input.color,
          sortOrder: input.sortOrder,
        },
      })
    }),

  /**
   * Update blog category
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
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').nullish(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.blogCategory.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog category not found',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await ctx.db.blogCategory.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A category with this slug already exists',
          })
        }
      }

      return ctx.db.blogCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
      })
    }),

  /**
   * Delete blog category
   */
  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.blogCategory.findUnique({
        where: { id: input.id },
        include: { _count: { select: { posts: true } } },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog category not found',
        })
      }

      if (category._count.posts > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category with associated posts',
        })
      }

      await ctx.db.blogCategory.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================================================
  // BLOG TAGS
  // ============================================================================

  /**
   * Get all blog tags
   */
  getTags: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        includePostCount: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { search, includePostCount = false } = input || {}

      return ctx.db.blogTag.findMany({
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        } : undefined,
        include: includePostCount ? { _count: { select: { posts: true } } } : undefined,
        orderBy: { name: 'asc' },
      })
    }),

  /**
   * Get public blog tags (for frontend filters)
   */
  getPublicTags: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.blogTag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'PUBLISHED',
                  deletedAt: null,
                  publishedAt: { lte: new Date() },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }),

  /**
   * Create blog tag
   */
  createTag: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || generateSlug(input.name)

      // Check uniqueness
      const existingName = await ctx.db.blogTag.findUnique({
        where: { name: input.name },
      })

      if (existingName) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A tag with this name already exists',
        })
      }

      const existingSlug = await ctx.db.blogTag.findUnique({
        where: { slug },
      })

      if (existingSlug) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A tag with this slug already exists',
        })
      }

      return ctx.db.blogTag.create({
        data: {
          name: input.name,
          slug,
        },
      })
    }),

  /**
   * Delete blog tag
   */
  deleteTag: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.blogTag.findUnique({
        where: { id: input.id },
      })

      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog tag not found',
        })
      }

      // Delete tag (cascades to BlogPostTag relations)
      await ctx.db.blogTag.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================================================
  // BLOG POSTS
  // ============================================================================

  /**
   * Get all blog posts with filtering (admin)
   */
  getPosts: adminProcedure
    .input(
      z.object({
        status: blogPostStatusSchema.optional(),
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
        search: z.string().optional(),
        authorId: z.string().optional(),
        includeDeleted: z.boolean().default(false),
        sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'publishedAt']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        status,
        categoryId,
        tagId,
        search,
        authorId,
        includeDeleted = false,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.BlogPostWhereInput = {
        ...(status && { status }),
        ...(categoryId && { categoryId }),
        ...(tagId && { tags: { some: { tagId } } }),
        ...(authorId && { authorId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { plainText: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(!includeDeleted && { deletedAt: null }),
      }

      const [posts, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true, color: true } },
            tags: {
              include: { tag: { select: { id: true, name: true, slug: true } } },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.blogPost.count({ where }),
      ])

      return { posts, total }
    }),

  /**
   * Get single blog post by ID (admin)
   */
  getPostById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: MAX_VERSIONS,
          },
        },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return post
    }),

  /**
   * Get published blog posts (public)
   */
  getPublishedPosts: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        tagSlug: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        categorySlug,
        tagSlug,
        search,
        limit = 10,
        offset = 0,
      } = input || {}

      const now = new Date()

      const where: Prisma.BlogPostWhereInput = {
        status: 'PUBLISHED',
        deletedAt: null,
        publishedAt: { lte: now },
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { plainText: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [posts, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            featuredImage: true,
            featuredImageAlt: true,
            publishedAt: true,
            category: { select: { id: true, name: true, slug: true, color: true } },
            tags: {
              include: { tag: { select: { id: true, name: true, slug: true } } },
            },
          },
          orderBy: { publishedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.db.blogPost.count({ where }),
      ])

      return { posts, total }
    }),

  /**
   * Get single published blog post by slug (public)
   */
  getPublishedPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const now = new Date()

      const post = await ctx.db.blogPost.findFirst({
        where: {
          slug: input.slug,
          status: 'PUBLISHED',
          deletedAt: null,
          publishedAt: { lte: now },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          featuredImage: true,
          featuredImageAlt: true,
          authorId: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
          metaKeywords: true,
          ogImage: true,
          category: { select: { id: true, name: true, slug: true, color: true } },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } },
          },
        },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return post
    }),

  /**
   * Create blog post
   */
  createPost: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        content: z.unknown(), // TipTap JSON content
        excerpt: z.string().optional(),
        featuredImage: z.string().url().optional(),
        featuredImageAlt: z.string().optional(),
        categoryId: z.string().optional(),
        tagIds: z.array(z.string()).default([]),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.array(z.string()).default([]),
        ogImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || generateSlug(input.title)

      // Check slug uniqueness
      const existing = await ctx.db.blogPost.findUnique({
        where: { slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A blog post with this slug already exists',
        })
      }

      const plainText = extractPlainText(input.content)

      return ctx.db.$transaction(async (tx) => {
        // Create post
        const post = await tx.blogPost.create({
          data: {
            title: input.title,
            slug,
            content: input.content as Prisma.InputJsonValue,
            excerpt: input.excerpt,
            plainText,
            featuredImage: input.featuredImage,
            featuredImageAlt: input.featuredImageAlt,
            categoryId: input.categoryId,
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            metaKeywords: input.metaKeywords,
            ogImage: input.ogImage,
            authorId: ctx.user.id,
            status: 'DRAFT',
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          },
          include: {
            category: { select: { id: true, name: true } },
          },
        })

        // Create tag relations
        if (input.tagIds.length > 0) {
          await tx.blogPostTag.createMany({
            data: input.tagIds.map((tagId) => ({
              postId: post.id,
              tagId,
            })),
          })
        }

        return post
      })
    }),

  /**
   * Update blog post
   */
  updatePost: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        content: z.unknown().optional(),
        excerpt: z.string().nullish(),
        featuredImage: z.string().url().nullish(),
        featuredImageAlt: z.string().nullish(),
        categoryId: z.string().nullish(),
        tagIds: z.array(z.string()).optional(),
        metaTitle: z.string().nullish(),
        metaDescription: z.string().nullish(),
        metaKeywords: z.array(z.string()).optional(),
        ogImage: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tagIds, ...data } = input

      // Fetch current post
      const current = await ctx.db.blogPost.findUnique({
        where: { id },
        include: {
          versions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
          tags: { select: { tagId: true } },
        },
      })

      if (!current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      if (current.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update deleted blog post',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== current.slug) {
        const slugExists = await ctx.db.blogPost.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A blog post with this slug already exists',
          })
        }
      }

      // Create version if content or title changed
      const contentChanged = data.content !== undefined || data.title !== undefined

      return ctx.db.$transaction(async (tx) => {
        if (contentChanged) {
          const nextVersion = (current.versions[0]?.versionNumber || 0) + 1

          await tx.blogPostVersion.create({
            data: {
              postId: id,
              versionNumber: nextVersion,
              content: current.content as Prisma.InputJsonValue,
              title: current.title,
              excerpt: current.excerpt,
              changesSummary: 'Auto-saved before update',
              createdBy: ctx.user.id,
            },
          })

          // Clean up old versions
          await cleanupOldPostVersions(tx, id)
        }

        const plainText = data.content ? extractPlainText(data.content) : undefined

        // Update post
        const updated = await tx.blogPost.update({
          where: { id },
          data: {
            ...(data.title && { title: data.title }),
            ...(data.slug && { slug: data.slug }),
            ...(data.content !== undefined && { content: data.content as Prisma.InputJsonValue }),
            ...(plainText !== undefined && { plainText }),
            ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
            ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
            ...(data.featuredImageAlt !== undefined && { featuredImageAlt: data.featuredImageAlt }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
            ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
            ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
            ...(data.metaKeywords && { metaKeywords: data.metaKeywords }),
            ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
            updatedBy: ctx.user.id,
          },
          include: {
            category: { select: { id: true, name: true } },
            tags: { include: { tag: true } },
          },
        })

        // Update tag relations if provided
        if (tagIds !== undefined) {
          const currentTagIds = current.tags.map(t => t.tagId)
          const toAdd = tagIds.filter(id => !currentTagIds.includes(id))
          const toRemove = currentTagIds.filter(id => !tagIds.includes(id))

          if (toRemove.length > 0) {
            await tx.blogPostTag.deleteMany({
              where: { postId: id, tagId: { in: toRemove } },
            })
          }

          if (toAdd.length > 0) {
            await tx.blogPostTag.createMany({
              data: toAdd.map((tagId) => ({
                postId: id,
                tagId,
              })),
            })
          }
        }

        return updated
      })
    }),

  /**
   * Publish blog post
   */
  publishPost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      if (post.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot publish deleted blog post',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          scheduledAt: null,
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Schedule blog post for future publication
   */
  schedulePost: adminProcedure
    .input(
      z.object({
        id: z.string(),
        scheduledAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      if (post.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot schedule deleted blog post',
        })
      }

      if (input.scheduledAt <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Scheduled date must be in the future',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          status: 'SCHEDULED',
          scheduledAt: input.scheduledAt,
          publishedAt: input.scheduledAt,
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Unpublish blog post (set to draft)
   */
  unpublishPost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT',
          scheduledAt: null,
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Archive blog post
   */
  archivePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Soft delete blog post
   */
  deletePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
          status: 'ARCHIVED',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Restore soft-deleted blog post
   */
  restorePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      if (!post.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Blog post is not deleted',
        })
      }

      return ctx.db.blogPost.update({
        where: { id: input.id },
        data: {
          deletedAt: null,
          status: 'DRAFT',
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Permanently delete blog post
   */
  permanentlyDeletePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      if (!post.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post must be soft-deleted first',
        })
      }

      await ctx.db.blogPost.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Duplicate blog post
   */
  duplicatePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
        include: { tags: { select: { tagId: true } } },
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      const timestamp = Date.now()
      const newSlug = `${original.slug}-copy-${timestamp}`

      return ctx.db.$transaction(async (tx) => {
        const post = await tx.blogPost.create({
          data: {
            title: `${original.title} (Copy)`,
            slug: newSlug,
            content: original.content as Prisma.InputJsonValue,
            excerpt: original.excerpt,
            plainText: original.plainText,
            featuredImage: original.featuredImage,
            featuredImageAlt: original.featuredImageAlt,
            categoryId: original.categoryId,
            metaTitle: original.metaTitle,
            metaDescription: original.metaDescription,
            metaKeywords: original.metaKeywords,
            ogImage: original.ogImage,
            authorId: ctx.user.id,
            status: 'DRAFT',
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          },
        })

        // Copy tag relations
        if (original.tags.length > 0) {
          await tx.blogPostTag.createMany({
            data: original.tags.map((t) => ({
              postId: post.id,
              tagId: t.tagId,
            })),
          })
        }

        return post
      })
    }),

  /**
   * Restore post to a specific version
   */
  restorePostVersion: adminProcedure
    .input(
      z.object({
        postId: z.string(),
        versionNumber: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.blogPostVersion.findUnique({
        where: {
          postId_versionNumber: {
            postId: input.postId,
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

      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.postId },
        include: {
          versions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Save current state as new version
        const nextVersion = (post.versions[0]?.versionNumber || 0) + 1

        await tx.blogPostVersion.create({
          data: {
            postId: input.postId,
            versionNumber: nextVersion,
            content: post.content as Prisma.InputJsonValue,
            title: post.title,
            excerpt: post.excerpt,
            changesSummary: `Before restoring to version ${input.versionNumber}`,
            createdBy: ctx.user.id,
          },
        })

        // Restore version content
        const updated = await tx.blogPost.update({
          where: { id: input.postId },
          data: {
            content: version.content as Prisma.InputJsonValue,
            title: version.title,
            excerpt: version.excerpt,
            plainText: extractPlainText(version.content),
            updatedBy: ctx.user.id,
          },
        })

        // Clean up old versions
        await cleanupOldPostVersions(tx, input.postId)

        return updated
      })
    }),

  // ============================================================================
  // BLOG STATISTICS
  // ============================================================================

  /**
   * Get blog statistics for dashboard
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalCategories,
      totalTags,
    ] = await Promise.all([
      ctx.db.blogPost.count({ where: { deletedAt: null } }),
      ctx.db.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      ctx.db.blogPost.count({ where: { status: 'DRAFT', deletedAt: null } }),
      ctx.db.blogPost.count({ where: { status: 'SCHEDULED', deletedAt: null } }),
      ctx.db.blogCategory.count(),
      ctx.db.blogTag.count(),
    ])

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        scheduled: scheduledPosts,
        archived: totalPosts - publishedPosts - draftPosts - scheduledPosts,
      },
      categories: totalCategories,
      tags: totalTags,
    }
  }),

  /**
   * Get recent blog activity
   */
  getRecentActivity: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10

      return ctx.db.blogPost.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          featuredImage: true,
          publishedAt: true,
          updatedAt: true,
          updatedBy: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      })
    }),
})
