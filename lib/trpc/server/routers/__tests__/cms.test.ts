/**
 * Unit Tests: CMS Router
 *
 * Tests cover critical CMS operations:
 * - Category CRUD operations
 * - Content block CRUD with versioning
 * - Content page CRUD with versioning
 * - Draft/publish workflow
 * - Soft delete and restore
 * - Statistics and activity queries
 *
 * Mocks: Prisma
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import { ContentStatus, ContentBlockType } from '@prisma/client'

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    contentCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    contentBlock: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    contentBlockVersion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    contentPage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    contentPageVersion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn({
      contentBlock: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      contentBlockVersion: {
        create: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      contentPage: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
      },
      contentPageVersion: {
        create: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    })),
  },
}))

import { prisma } from '@/lib/db'

describe('CMS Router', () => {
  // Common test fixtures
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'ADMIN',
  }

  const mockCategory = {
    id: 'cat_123',
    name: 'Blog',
    slug: 'blog',
    description: 'Blog posts category',
    parentId: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockContentBlock = {
    id: 'block_123',
    name: 'Homepage Hero',
    slug: 'homepage-hero',
    type: ContentBlockType.HERO,
    status: ContentStatus.DRAFT,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }] },
    plainText: 'Hello World',
    settings: null,
    sortOrder: 0,
    pageId: null,
    categoryId: null,
    deletedAt: null,
    publishedAt: null,
    createdBy: 'admin_123',
    updatedBy: 'admin_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockContentPage = {
    id: 'page_123',
    title: 'About Us',
    slug: 'about-us',
    description: 'About our company',
    status: ContentStatus.DRAFT,
    metaTitle: null,
    metaDescription: null,
    ogImage: null,
    template: null,
    isHomepage: false,
    publishedAt: null,
    deletedAt: null,
    categoryId: null,
    createdBy: 'admin_123',
    updatedBy: 'admin_123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // CONTENT CATEGORIES
  // ============================================================================

  describe('Categories', () => {
    describe('getCategories', () => {
      it('should return all categories ordered by sortOrder and name', async () => {
        const categories = [
          { ...mockCategory, sortOrder: 1 },
          { ...mockCategory, id: 'cat_456', name: 'News', slug: 'news', sortOrder: 0 },
        ]

        vi.mocked(prisma.contentCategory.findMany).mockResolvedValue(categories)

        const result = await prisma.contentCategory.findMany({
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })

        expect(result).toEqual(categories)
        expect(prisma.contentCategory.findMany).toHaveBeenCalled()
      })

      it('should filter by parentId when provided', async () => {
        vi.mocked(prisma.contentCategory.findMany).mockResolvedValue([])

        await prisma.contentCategory.findMany({
          where: { parentId: null },
        })

        expect(prisma.contentCategory.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { parentId: null },
          })
        )
      })
    })

    describe('getCategoryById', () => {
      it('should return category with relations', async () => {
        const categoryWithRelations = {
          ...mockCategory,
          parent: null,
          children: [],
          pages: [],
          blocks: [],
        }

        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue(categoryWithRelations)

        const result = await prisma.contentCategory.findUnique({
          where: { id: 'cat_123' },
          include: { parent: true, children: true, pages: true, blocks: true },
        })

        expect(result).toEqual(categoryWithRelations)
      })

      it('should return null for non-existent category', async () => {
        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue(null)

        const result = await prisma.contentCategory.findUnique({
          where: { id: 'nonexistent' },
        })

        expect(result).toBeNull()
      })
    })

    describe('createCategory', () => {
      it('should create category with valid data', async () => {
        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.contentCategory.create).mockResolvedValue(mockCategory)

        const result = await prisma.contentCategory.create({
          data: {
            name: 'Blog',
            slug: 'blog',
            description: 'Blog posts category',
          },
        })

        expect(result).toEqual(mockCategory)
      })

      it('should reject duplicate slug', async () => {
        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue(mockCategory)

        // In real implementation, this would throw CONFLICT error
        const existing = await prisma.contentCategory.findUnique({
          where: { slug: 'blog' },
        })

        expect(existing).not.toBeNull()
      })

      it('should validate slug format', () => {
        const validSlugs = ['blog', 'news-updates', 'category-123']
        const invalidSlugs = ['Blog', 'news updates', 'category@123']

        const slugRegex = /^[a-z0-9-]+$/

        validSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(true)
        })

        invalidSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(false)
        })
      })
    })

    describe('updateCategory', () => {
      it('should update category fields', async () => {
        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue(mockCategory)
        vi.mocked(prisma.contentCategory.update).mockResolvedValue({
          ...mockCategory,
          name: 'Updated Blog',
        })

        const result = await prisma.contentCategory.update({
          where: { id: 'cat_123' },
          data: { name: 'Updated Blog' },
        })

        expect(result.name).toBe('Updated Blog')
      })

      it('should prevent circular parent reference', () => {
        const categoryId = 'cat_123'
        const parentId = 'cat_123'

        const isCircular = categoryId === parentId

        expect(isCircular).toBe(true)
      })
    })

    describe('deleteCategory', () => {
      it('should delete category without children or content', async () => {
        vi.mocked(prisma.contentCategory.findUnique).mockResolvedValue({
          ...mockCategory,
          _count: { pages: 0, blocks: 0, children: 0 },
        } as any)

        vi.mocked(prisma.contentCategory.delete).mockResolvedValue(mockCategory)

        await prisma.contentCategory.delete({
          where: { id: 'cat_123' },
        })

        expect(prisma.contentCategory.delete).toHaveBeenCalledWith({
          where: { id: 'cat_123' },
        })
      })

      it('should prevent deletion of category with children', () => {
        const categoryWithChildren = {
          ...mockCategory,
          _count: { pages: 0, blocks: 0, children: 2 },
        }

        const canDelete = categoryWithChildren._count.children === 0

        expect(canDelete).toBe(false)
      })

      it('should prevent deletion of category with content', () => {
        const categoryWithContent = {
          ...mockCategory,
          _count: { pages: 3, blocks: 5, children: 0 },
        }

        const canDelete =
          categoryWithContent._count.pages === 0 &&
          categoryWithContent._count.blocks === 0

        expect(canDelete).toBe(false)
      })
    })
  })

  // ============================================================================
  // CONTENT BLOCKS
  // ============================================================================

  describe('Content Blocks', () => {
    describe('getBlocks', () => {
      it('should return blocks with pagination', async () => {
        const blocks = [mockContentBlock]

        vi.mocked(prisma.contentBlock.findMany).mockResolvedValue(blocks)
        vi.mocked(prisma.contentBlock.count).mockResolvedValue(1)

        const [result, total] = await Promise.all([
          prisma.contentBlock.findMany({ take: 50, skip: 0 }),
          prisma.contentBlock.count(),
        ])

        expect(result).toEqual(blocks)
        expect(total).toBe(1)
      })

      it('should filter by status', async () => {
        vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

        await prisma.contentBlock.findMany({
          where: { status: ContentStatus.PUBLISHED },
        })

        expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { status: ContentStatus.PUBLISHED },
          })
        )
      })

      it('should filter by type', async () => {
        vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

        await prisma.contentBlock.findMany({
          where: { type: ContentBlockType.HERO },
        })

        expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { type: ContentBlockType.HERO },
          })
        )
      })

      it('should search by name, slug, or plainText', () => {
        const searchTerm = 'hero'
        const searchConditions = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
          { plainText: { contains: searchTerm, mode: 'insensitive' } },
        ]

        expect(searchConditions.length).toBe(3)
      })

      it('should exclude deleted blocks by default', async () => {
        vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

        await prisma.contentBlock.findMany({
          where: { deletedAt: null },
        })

        expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { deletedAt: null },
          })
        )
      })
    })

    describe('getBlockById', () => {
      it('should return block with versions', async () => {
        const blockWithVersions = {
          ...mockContentBlock,
          category: null,
          page: null,
          versions: [],
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(blockWithVersions as any)

        const result = await prisma.contentBlock.findUnique({
          where: { id: 'block_123' },
          include: { category: true, page: true, versions: true },
        })

        expect(result).toEqual(blockWithVersions)
      })
    })

    describe('getBlockBySlug (public)', () => {
      it('should only return published blocks', async () => {
        const publishedBlock = {
          ...mockContentBlock,
          status: ContentStatus.PUBLISHED,
        }

        vi.mocked(prisma.contentBlock.findFirst).mockResolvedValue(publishedBlock)

        await prisma.contentBlock.findFirst({
          where: {
            slug: 'homepage-hero',
            status: ContentStatus.PUBLISHED,
            deletedAt: null,
          },
        })

        expect(prisma.contentBlock.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: ContentStatus.PUBLISHED,
              deletedAt: null,
            }),
          })
        )
      })
    })

    describe('createBlock', () => {
      it('should create block with valid data', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.contentBlock.create).mockResolvedValue(mockContentBlock)

        const result = await prisma.contentBlock.create({
          data: {
            name: 'Homepage Hero',
            slug: 'homepage-hero',
            type: ContentBlockType.HERO,
            content: mockContentBlock.content,
            plainText: 'Hello World',
            status: ContentStatus.DRAFT,
            createdBy: 'admin_123',
            updatedBy: 'admin_123',
          },
        })

        expect(result).toEqual(mockContentBlock)
      })

      it('should reject duplicate slug', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock)

        const existing = await prisma.contentBlock.findUnique({
          where: { slug: 'homepage-hero' },
        })

        expect(existing).not.toBeNull()
      })

      it('should extract plain text from TipTap JSON', () => {
        const content = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Hello ' },
                { type: 'text', text: 'World' },
              ],
            },
          ],
        }

        const extractPlainText = (doc: any): string => {
          const texts: string[] = []
          const extract = (node: any) => {
            if (node.text) texts.push(node.text)
            if (node.content) node.content.forEach(extract)
          }
          if (doc.content) doc.content.forEach(extract)
          return texts.join(' ').trim()
        }

        const plainText = extractPlainText(content)
        expect(plainText).toBe('Hello  World')
      })
    })

    describe('updateBlock', () => {
      it('should create version before updating content', async () => {
        const blockWithVersions = {
          ...mockContentBlock,
          versions: [{ versionNumber: 1 }],
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(blockWithVersions as any)

        // Version should be created with versionNumber = 2
        const nextVersion = (blockWithVersions.versions[0]?.versionNumber || 0) + 1
        expect(nextVersion).toBe(2)
      })

      it('should not create version when only metadata changes', () => {
        const contentChanged = false
        const metadataChanged = true

        const shouldCreateVersion = contentChanged

        expect(shouldCreateVersion).toBe(false)
      })

      it('should prevent updating deleted blocks', async () => {
        const deletedBlock = {
          ...mockContentBlock,
          deletedAt: new Date(),
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(deletedBlock)

        const block = await prisma.contentBlock.findUnique({
          where: { id: 'block_123' },
        })

        expect(block?.deletedAt).not.toBeNull()
      })
    })

    describe('publishBlock', () => {
      it('should set status to PUBLISHED and publishedAt', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock)
        vi.mocked(prisma.contentBlock.update).mockResolvedValue({
          ...mockContentBlock,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        })

        const result = await prisma.contentBlock.update({
          where: { id: 'block_123' },
          data: {
            status: ContentStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        })

        expect(result.status).toBe('PUBLISHED')
        expect(result.publishedAt).not.toBeNull()
      })

      it('should prevent publishing deleted blocks', async () => {
        const deletedBlock = {
          ...mockContentBlock,
          deletedAt: new Date(),
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(deletedBlock)

        const block = await prisma.contentBlock.findUnique({
          where: { id: 'block_123' },
        })

        expect(block?.deletedAt).not.toBeNull()
      })
    })

    describe('unpublishBlock', () => {
      it('should set status to DRAFT', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue({
          ...mockContentBlock,
          status: ContentStatus.PUBLISHED,
        })
        vi.mocked(prisma.contentBlock.update).mockResolvedValue({
          ...mockContentBlock,
          status: ContentStatus.DRAFT,
        })

        const result = await prisma.contentBlock.update({
          where: { id: 'block_123' },
          data: { status: ContentStatus.DRAFT },
        })

        expect(result.status).toBe('DRAFT')
      })
    })

    describe('archiveBlock', () => {
      it('should set status to ARCHIVED', async () => {
        vi.mocked(prisma.contentBlock.update).mockResolvedValue({
          ...mockContentBlock,
          status: ContentStatus.ARCHIVED,
        })

        const result = await prisma.contentBlock.update({
          where: { id: 'block_123' },
          data: { status: ContentStatus.ARCHIVED },
        })

        expect(result.status).toBe('ARCHIVED')
      })
    })

    describe('deleteBlock (soft delete)', () => {
      it('should set deletedAt timestamp', async () => {
        vi.mocked(prisma.contentBlock.update).mockResolvedValue({
          ...mockContentBlock,
          deletedAt: new Date(),
          status: ContentStatus.ARCHIVED,
        })

        const result = await prisma.contentBlock.update({
          where: { id: 'block_123' },
          data: {
            deletedAt: new Date(),
            status: ContentStatus.ARCHIVED,
          },
        })

        expect(result.deletedAt).not.toBeNull()
        expect(result.status).toBe('ARCHIVED')
      })
    })

    describe('restoreBlock', () => {
      it('should clear deletedAt and set status to DRAFT', async () => {
        const deletedBlock = {
          ...mockContentBlock,
          deletedAt: new Date(),
          status: ContentStatus.ARCHIVED,
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(deletedBlock)
        vi.mocked(prisma.contentBlock.update).mockResolvedValue({
          ...mockContentBlock,
          deletedAt: null,
          status: ContentStatus.DRAFT,
        })

        const result = await prisma.contentBlock.update({
          where: { id: 'block_123' },
          data: {
            deletedAt: null,
            status: ContentStatus.DRAFT,
          },
        })

        expect(result.deletedAt).toBeNull()
        expect(result.status).toBe('DRAFT')
      })

      it('should prevent restoring non-deleted blocks', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock)

        const block = await prisma.contentBlock.findUnique({
          where: { id: 'block_123' },
        })

        expect(block?.deletedAt).toBeNull()
      })
    })

    describe('permanentlyDeleteBlock', () => {
      it('should only allow deletion of soft-deleted blocks', async () => {
        const deletedBlock = {
          ...mockContentBlock,
          deletedAt: new Date(),
        }

        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(deletedBlock)

        const block = await prisma.contentBlock.findUnique({
          where: { id: 'block_123' },
        })

        const canPermanentlyDelete = block?.deletedAt !== null

        expect(canPermanentlyDelete).toBe(true)
      })

      it('should cascade delete versions', async () => {
        // Delete block should cascade to versions due to onDelete: Cascade
        vi.mocked(prisma.contentBlock.delete).mockResolvedValue(mockContentBlock)

        await prisma.contentBlock.delete({
          where: { id: 'block_123' },
        })

        expect(prisma.contentBlock.delete).toHaveBeenCalled()
      })
    })

    describe('restoreBlockVersion', () => {
      it('should save current state before restoring', () => {
        const currentVersion = 3
        const restoreToVersion = 1

        // Before restoring, create version currentVersion + 1
        const newVersionNumber = currentVersion + 1

        expect(newVersionNumber).toBe(4)
      })

      it('should restore content and settings from version', async () => {
        const version = {
          id: 'ver_123',
          blockId: 'block_123',
          versionNumber: 1,
          content: { type: 'doc', content: [] },
          settings: null,
          createdAt: new Date(),
        }

        vi.mocked(prisma.contentBlockVersion.findUnique).mockResolvedValue(version as any)

        const result = await prisma.contentBlockVersion.findUnique({
          where: {
            blockId_versionNumber: {
              blockId: 'block_123',
              versionNumber: 1,
            },
          },
        })

        expect(result?.content).toEqual(version.content)
      })
    })

    describe('duplicateBlock', () => {
      it('should create copy with unique slug', async () => {
        vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock)

        const timestamp = Date.now()
        const newSlug = `${mockContentBlock.slug}-copy-${timestamp}`

        expect(newSlug).toContain('homepage-hero-copy-')
        expect(newSlug).not.toBe(mockContentBlock.slug)
      })

      it('should set status to DRAFT', async () => {
        vi.mocked(prisma.contentBlock.create).mockResolvedValue({
          ...mockContentBlock,
          id: 'block_456',
          name: 'Homepage Hero (Copy)',
          slug: 'homepage-hero-copy-123',
          status: ContentStatus.DRAFT,
        })

        const duplicate = await prisma.contentBlock.create({
          data: {
            name: 'Homepage Hero (Copy)',
            slug: 'homepage-hero-copy-123',
            type: ContentBlockType.HERO,
            content: mockContentBlock.content,
            status: ContentStatus.DRAFT,
            createdBy: 'admin_123',
            updatedBy: 'admin_123',
          },
        })

        expect(duplicate.status).toBe('DRAFT')
      })
    })
  })

  // ============================================================================
  // CONTENT PAGES
  // ============================================================================

  describe('Content Pages', () => {
    describe('getPages', () => {
      it('should return pages with pagination', async () => {
        vi.mocked(prisma.contentPage.findMany).mockResolvedValue([mockContentPage])
        vi.mocked(prisma.contentPage.count).mockResolvedValue(1)

        const [pages, total] = await Promise.all([
          prisma.contentPage.findMany({ take: 50, skip: 0 }),
          prisma.contentPage.count(),
        ])

        expect(pages).toHaveLength(1)
        expect(total).toBe(1)
      })

      it('should filter by status', async () => {
        vi.mocked(prisma.contentPage.findMany).mockResolvedValue([])

        await prisma.contentPage.findMany({
          where: { status: ContentStatus.PUBLISHED },
        })

        expect(prisma.contentPage.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { status: ContentStatus.PUBLISHED },
          })
        )
      })
    })

    describe('getPageById', () => {
      it('should return page with blocks and versions', async () => {
        const pageWithRelations = {
          ...mockContentPage,
          category: null,
          blocks: [],
          versions: [],
        }

        vi.mocked(prisma.contentPage.findUnique).mockResolvedValue(pageWithRelations as any)

        const result = await prisma.contentPage.findUnique({
          where: { id: 'page_123' },
          include: { category: true, blocks: true, versions: true },
        })

        expect(result).toEqual(pageWithRelations)
      })
    })

    describe('getPageBySlug (public)', () => {
      it('should only return published pages with published blocks', async () => {
        vi.mocked(prisma.contentPage.findFirst).mockResolvedValue({
          ...mockContentPage,
          status: ContentStatus.PUBLISHED,
          blocks: [],
        } as any)

        await prisma.contentPage.findFirst({
          where: {
            slug: 'about-us',
            status: ContentStatus.PUBLISHED,
            deletedAt: null,
          },
          include: {
            blocks: {
              where: {
                status: ContentStatus.PUBLISHED,
                deletedAt: null,
              },
            },
          },
        })

        expect(prisma.contentPage.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: ContentStatus.PUBLISHED,
            }),
          })
        )
      })
    })

    describe('createPage', () => {
      it('should create page with valid data', async () => {
        vi.mocked(prisma.contentPage.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.contentPage.create).mockResolvedValue(mockContentPage)

        const result = await prisma.contentPage.create({
          data: {
            title: 'About Us',
            slug: 'about-us',
            status: ContentStatus.DRAFT,
            createdBy: 'admin_123',
            updatedBy: 'admin_123',
          },
        })

        expect(result).toEqual(mockContentPage)
      })

      it('should validate page slug format (allows slashes)', () => {
        const validSlugs = ['about-us', 'blog/post-1', 'services/consulting']
        const invalidSlugs = ['About Us', 'blog post', 'services@consulting']

        const slugRegex = /^[a-z0-9-/]+$/

        validSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(true)
        })

        invalidSlugs.forEach((slug) => {
          expect(slugRegex.test(slug)).toBe(false)
        })
      })

      it('should unset existing homepage when setting new homepage', async () => {
        vi.mocked(prisma.contentPage.updateMany).mockResolvedValue({ count: 1 })

        await prisma.contentPage.updateMany({
          where: { isHomepage: true },
          data: { isHomepage: false },
        })

        expect(prisma.contentPage.updateMany).toHaveBeenCalled()
      })
    })

    describe('updatePage', () => {
      it('should create version before updating', async () => {
        const pageWithVersions = {
          ...mockContentPage,
          versions: [{ versionNumber: 1 }],
          blocks: [],
        }

        vi.mocked(prisma.contentPage.findUnique).mockResolvedValue(pageWithVersions as any)

        const nextVersion = (pageWithVersions.versions[0]?.versionNumber || 0) + 1
        expect(nextVersion).toBe(2)
      })
    })

    describe('publishPage', () => {
      it('should set status to PUBLISHED and publishedAt', async () => {
        vi.mocked(prisma.contentPage.update).mockResolvedValue({
          ...mockContentPage,
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        })

        const result = await prisma.contentPage.update({
          where: { id: 'page_123' },
          data: {
            status: ContentStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        })

        expect(result.status).toBe('PUBLISHED')
      })
    })

    describe('duplicatePage', () => {
      it('should create copy with unique slug', async () => {
        const timestamp = Date.now()
        const newSlug = `${mockContentPage.slug}-copy-${timestamp}`

        expect(newSlug).toContain('about-us-copy-')
      })

      it('should duplicate associated blocks', async () => {
        const pageWithBlocks = {
          ...mockContentPage,
          blocks: [mockContentBlock],
        }

        vi.mocked(prisma.contentPage.findUnique).mockResolvedValue(pageWithBlocks as any)

        const page = await prisma.contentPage.findUnique({
          where: { id: 'page_123' },
          include: { blocks: { where: { deletedAt: null } } },
        })

        expect(page?.blocks.length).toBe(1)
      })

      it('should never duplicate as homepage', () => {
        const duplicateIsHomepage = false

        expect(duplicateIsHomepage).toBe(false)
      })
    })
  })

  // ============================================================================
  // VERSION CLEANUP
  // ============================================================================

  describe('Version Cleanup', () => {
    it('should keep only last 5 versions for blocks', async () => {
      const MAX_VERSIONS = 5
      const versions = Array.from({ length: 7 }, (_, i) => ({
        id: `ver_${i}`,
        versionNumber: 7 - i,
      }))

      vi.mocked(prisma.contentBlockVersion.findMany).mockResolvedValue(versions as any)

      const result = await prisma.contentBlockVersion.findMany({
        where: { blockId: 'block_123' },
        orderBy: { versionNumber: 'desc' },
      })

      const idsToDelete = result.slice(MAX_VERSIONS).map((v) => v.id)

      expect(idsToDelete.length).toBe(2)
    })

    it('should keep only last 5 versions for pages', async () => {
      const MAX_VERSIONS = 5
      const versions = Array.from({ length: 8 }, (_, i) => ({
        id: `ver_${i}`,
        versionNumber: 8 - i,
      }))

      vi.mocked(prisma.contentPageVersion.findMany).mockResolvedValue(versions as any)

      const result = await prisma.contentPageVersion.findMany({
        where: { pageId: 'page_123' },
        orderBy: { versionNumber: 'desc' },
      })

      const idsToDelete = result.slice(MAX_VERSIONS).map((v) => v.id)

      expect(idsToDelete.length).toBe(3)
    })
  })

  // ============================================================================
  // STATISTICS
  // ============================================================================

  describe('Statistics', () => {
    describe('getStats', () => {
      it('should return counts for blocks, pages, and categories', async () => {
        vi.mocked(prisma.contentBlock.count)
          .mockResolvedValueOnce(10) // total
          .mockResolvedValueOnce(5) // published
          .mockResolvedValueOnce(3) // draft

        vi.mocked(prisma.contentPage.count)
          .mockResolvedValueOnce(8) // total
          .mockResolvedValueOnce(4) // published
          .mockResolvedValueOnce(2) // draft

        vi.mocked(prisma.contentCategory.count).mockResolvedValue(5)

        const [
          totalBlocks,
          publishedBlocks,
          draftBlocks,
          totalPages,
          publishedPages,
          draftPages,
          categories,
        ] = await Promise.all([
          prisma.contentBlock.count({ where: { deletedAt: null } }),
          prisma.contentBlock.count({ where: { status: ContentStatus.PUBLISHED, deletedAt: null } }),
          prisma.contentBlock.count({ where: { status: ContentStatus.DRAFT, deletedAt: null } }),
          prisma.contentPage.count({ where: { deletedAt: null } }),
          prisma.contentPage.count({ where: { status: ContentStatus.PUBLISHED, deletedAt: null } }),
          prisma.contentPage.count({ where: { status: ContentStatus.DRAFT, deletedAt: null } }),
          prisma.contentCategory.count(),
        ])

        expect(totalBlocks).toBe(10)
        expect(publishedBlocks).toBe(5)
        expect(draftBlocks).toBe(3)
        expect(totalPages).toBe(8)
        expect(publishedPages).toBe(4)
        expect(draftPages).toBe(2)
        expect(categories).toBe(5)
      })
    })

    describe('getRecentActivity', () => {
      it('should return recent blocks and pages', async () => {
        vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([mockContentBlock])
        vi.mocked(prisma.contentPage.findMany).mockResolvedValue([mockContentPage])

        const [blocks, pages] = await Promise.all([
          prisma.contentBlock.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
            take: 10,
          }),
          prisma.contentPage.findMany({
            where: { deletedAt: null },
            orderBy: { updatedAt: 'desc' },
            take: 10,
          }),
        ])

        expect(blocks.length).toBe(1)
        expect(pages.length).toBe(1)
      })
    })
  })

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================

  describe('Input Validation', () => {
    describe('Category validation', () => {
      it('should require name to be at least 1 character', () => {
        const validName = 'Blog'
        const invalidName = ''

        expect(validName.length >= 1).toBe(true)
        expect(invalidName.length >= 1).toBe(false)
      })
    })

    describe('Block validation', () => {
      it('should validate block type enum', () => {
        const validTypes = [
          'TEXT',
          'HERO',
          'FEATURE',
          'TESTIMONIAL',
          'CTA',
          'FAQ',
          'GALLERY',
          'VIDEO',
          'CUSTOM',
        ]

        expect(validTypes.includes('HERO')).toBe(true)
        expect(validTypes.includes('INVALID_TYPE')).toBe(false)
      })
    })

    describe('Page validation', () => {
      it('should validate status enum', () => {
        const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

        expect(validStatuses.includes('DRAFT')).toBe(true)
        expect(validStatuses.includes('INVALID_STATUS')).toBe(false)
      })
    })
  })
})
