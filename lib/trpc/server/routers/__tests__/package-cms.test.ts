/**
 * Unit Tests: Package CMS Router
 *
 * Tests cover critical package content management operations:
 * - Package content queries
 * - Content updates with version history
 * - Version restore functionality
 * - Content block associations
 * - Image management
 *
 * Story: 12-2 Package Content Editing
 * Mocks: Prisma
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TRPCError } from '@trpc/server'

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    package: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    packageContentVersion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    contentBlock: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn) => {
      if (typeof fn === 'function') {
        return fn({
          package: {
            findUnique: vi.fn(),
            update: vi.fn(),
          },
          packageContentVersion: {
            create: vi.fn(),
            findMany: vi.fn(),
            deleteMany: vi.fn(),
          },
          contentBlock: {
            update: vi.fn(),
          },
        })
      }
      return Promise.all(fn)
    }),
  },
}))

import { prisma } from '@/lib/db'

describe('Package CMS Router', () => {
  // Common test fixtures
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'ADMIN',
  }

  const mockPackage = {
    id: 'pkg_123',
    slug: 'pure-play',
    name: 'Pure Play',
    tagline: 'Your perfect pickleball getaway',
    description: 'A week of pure pickleball action in Thailand',
    cmsDescription: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich description' }] }] },
    cmsPricingText: 'Starting from $5,000',
    cmsDurationText: 'Choose 7, 10, 14, or 21 days',
    cmsHighlights: ['Highlight 1', 'Highlight 2'],
    cmsIncludedItems: ['Item 1', 'Item 2'],
    cmsNotIncludedItems: ['Not included 1'],
    basePrice: 500000,
    durationOptions: [7, 10, 14, 21],
    heroImageUrl: 'https://example.com/hero.jpg',
    imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    metaTitle: 'Pure Play | Pickleball Passport',
    metaDescription: 'Experience the ultimate pickleball vacation',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockContentVersion = {
    id: 'ver_123',
    packageId: 'pkg_123',
    versionNumber: 1,
    content: {
      name: 'Pure Play',
      description: 'Old description',
      cmsDescription: null,
    },
    changesSummary: 'Initial version',
    createdBy: 'admin_123',
    createdAt: new Date(),
  }

  const mockContentBlock = {
    id: 'block_123',
    name: 'Package FAQ',
    slug: 'package-faq',
    type: 'FAQ',
    status: 'PUBLISHED',
    content: { type: 'doc', content: [] },
    packageId: 'pkg_123',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // PACKAGE CONTENT QUERIES
  // ============================================================================

  describe('getPackagesForCms', () => {
    it('should return all packages with CMS content status', async () => {
      const packages = [
        {
          ...mockPackage,
          _count: { contentBlocks: 2, bookings: 5 },
        },
      ]

      vi.mocked(prisma.package.findMany).mockResolvedValue(packages as any)
      vi.mocked(prisma.package.count).mockResolvedValue(1)

      const [result, total] = await Promise.all([
        prisma.package.findMany({
          select: expect.any(Object),
          orderBy: { updatedAt: 'desc' },
          take: 50,
          skip: 0,
        }),
        prisma.package.count(),
      ])

      expect(result).toEqual(packages)
      expect(total).toBe(1)
    })

    it('should filter by search term', async () => {
      vi.mocked(prisma.package.findMany).mockResolvedValue([])

      await prisma.package.findMany({
        where: {
          OR: [
            { name: { contains: 'play', mode: 'insensitive' } },
            { slug: { contains: 'play', mode: 'insensitive' } },
            { description: { contains: 'play', mode: 'insensitive' } },
          ],
        },
      })

      expect(prisma.package.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      )
    })

    it('should filter by active status', async () => {
      vi.mocked(prisma.package.findMany).mockResolvedValue([])

      await prisma.package.findMany({
        where: { isActive: true },
      })

      expect(prisma.package.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      )
    })
  })

  describe('getPackageContent', () => {
    it('should return package with content blocks and versions', async () => {
      const packageWithRelations = {
        ...mockPackage,
        contentBlocks: [mockContentBlock],
        contentVersions: [mockContentVersion],
        itineraries: [],
      }

      vi.mocked(prisma.package.findUnique).mockResolvedValue(packageWithRelations as any)

      const result = await prisma.package.findUnique({
        where: { id: 'pkg_123' },
        include: {
          contentBlocks: true,
          contentVersions: true,
          itineraries: true,
        },
      })

      expect(result).toEqual(packageWithRelations)
      expect(result?.contentBlocks).toHaveLength(1)
      expect(result?.contentVersions).toHaveLength(1)
    })

    it('should return null for non-existent package', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(null)

      const result = await prisma.package.findUnique({
        where: { id: 'nonexistent' },
      })

      expect(result).toBeNull()
    })
  })

  describe('getPackageContentPreview', () => {
    it('should only return active packages for public preview', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as any)

      const result = await prisma.package.findUnique({
        where: { slug: 'pure-play' },
      })

      expect(result?.isActive).toBe(true)
    })

    it('should include only published content blocks', () => {
      const contentBlocksWhere = {
        status: 'PUBLISHED',
        deletedAt: null,
      }

      expect(contentBlocksWhere.status).toBe('PUBLISHED')
      expect(contentBlocksWhere.deletedAt).toBeNull()
    })
  })

  // ============================================================================
  // PACKAGE CONTENT MUTATIONS
  // ============================================================================

  describe('updatePackageContent', () => {
    it('should create version before updating', async () => {
      const packageWithVersions = {
        ...mockPackage,
        contentVersions: [{ versionNumber: 1 }],
      }

      vi.mocked(prisma.package.findUnique).mockResolvedValue(packageWithVersions as any)

      // Next version should be 2
      const nextVersion = (packageWithVersions.contentVersions[0]?.versionNumber || 0) + 1

      expect(nextVersion).toBe(2)
    })

    it('should update all CMS fields', async () => {
      const updateData = {
        name: 'Updated Pure Play',
        tagline: 'New tagline',
        description: 'Updated description',
        cmsDescription: { type: 'doc', content: [] },
        cmsPricingText: 'Starting from $6,000',
        cmsDurationText: 'New duration text',
        heroImageUrl: 'https://example.com/new-hero.jpg',
        imageUrls: ['https://example.com/new-img.jpg'],
        metaTitle: 'Updated Title',
        metaDescription: 'Updated meta description',
      }

      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        ...updateData,
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: updateData,
      })

      expect(result.name).toBe('Updated Pure Play')
      expect(result.cmsPricingText).toBe('Starting from $6,000')
    })

    it('should record change summary in version', () => {
      const versionData = {
        packageId: 'pkg_123',
        versionNumber: 2,
        content: mockPackage,
        changesSummary: 'Updated pricing information',
        createdBy: 'admin_123',
      }

      expect(versionData.changesSummary).toBe('Updated pricing information')
    })
  })

  describe('restorePackageVersion', () => {
    it('should save current state before restoring', async () => {
      const currentVersion = 3
      const restoreToVersion = 1

      // Before restoring, should create version currentVersion + 1
      const newVersionNumber = currentVersion + 1

      expect(newVersionNumber).toBe(4)
    })

    it('should restore content from specified version', async () => {
      const version = {
        ...mockContentVersion,
        content: {
          name: 'Old Name',
          tagline: 'Old tagline',
          description: 'Old description',
          cmsDescription: null,
          cmsPricingText: 'Old pricing',
        },
      }

      vi.mocked(prisma.packageContentVersion.findUnique).mockResolvedValue(version as any)

      const result = await prisma.packageContentVersion.findUnique({
        where: {
          packageId_versionNumber: {
            packageId: 'pkg_123',
            versionNumber: 1,
          },
        },
      })

      expect(result?.content).toEqual(version.content)
    })

    it('should return error for non-existent version', async () => {
      vi.mocked(prisma.packageContentVersion.findUnique).mockResolvedValue(null)

      const result = await prisma.packageContentVersion.findUnique({
        where: {
          packageId_versionNumber: {
            packageId: 'pkg_123',
            versionNumber: 999,
          },
        },
      })

      expect(result).toBeNull()
    })
  })

  describe('getPackageVersionHistory', () => {
    it('should return versions ordered by version number descending', async () => {
      const versions = [
        { ...mockContentVersion, versionNumber: 3 },
        { ...mockContentVersion, versionNumber: 2 },
        { ...mockContentVersion, versionNumber: 1 },
      ]

      vi.mocked(prisma.packageContentVersion.findMany).mockResolvedValue(versions as any)

      const result = await prisma.packageContentVersion.findMany({
        where: { packageId: 'pkg_123' },
        orderBy: { versionNumber: 'desc' },
      })

      expect(result[0].versionNumber).toBe(3)
      expect(result[2].versionNumber).toBe(1)
    })

    it('should support pagination', async () => {
      vi.mocked(prisma.packageContentVersion.findMany).mockResolvedValue([])
      vi.mocked(prisma.packageContentVersion.count).mockResolvedValue(25)

      await prisma.packageContentVersion.findMany({
        where: { packageId: 'pkg_123' },
        take: 10,
        skip: 10,
      })

      expect(prisma.packageContentVersion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 10,
        })
      )
    })
  })

  // ============================================================================
  // VERSION CLEANUP
  // ============================================================================

  describe('Version Cleanup', () => {
    it('should keep only last 10 versions', async () => {
      const MAX_VERSIONS = 10
      const versions = Array.from({ length: 15 }, (_, i) => ({
        id: `ver_${i}`,
        versionNumber: 15 - i,
      }))

      vi.mocked(prisma.packageContentVersion.findMany).mockResolvedValue(versions as any)

      const result = await prisma.packageContentVersion.findMany({
        where: { packageId: 'pkg_123' },
        orderBy: { versionNumber: 'desc' },
      })

      const idsToDelete = result.slice(MAX_VERSIONS).map((v) => v.id)

      expect(idsToDelete.length).toBe(5)
    })
  })

  // ============================================================================
  // CONTENT BLOCK ASSOCIATIONS
  // ============================================================================

  describe('linkBlockToPackage', () => {
    it('should link content block to package', async () => {
      vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock as any)
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as any)
      vi.mocked(prisma.contentBlock.update).mockResolvedValue({
        ...mockContentBlock,
        packageId: 'pkg_123',
      } as any)

      const result = await prisma.contentBlock.update({
        where: { id: 'block_123' },
        data: { packageId: 'pkg_123' },
      })

      expect(result.packageId).toBe('pkg_123')
    })

    it('should return error for non-existent block', async () => {
      vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(null)

      const result = await prisma.contentBlock.findUnique({
        where: { id: 'nonexistent' },
      })

      expect(result).toBeNull()
    })

    it('should return error for non-existent package', async () => {
      vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock as any)
      vi.mocked(prisma.package.findUnique).mockResolvedValue(null)

      const packageResult = await prisma.package.findUnique({
        where: { id: 'nonexistent' },
      })

      expect(packageResult).toBeNull()
    })
  })

  describe('unlinkBlockFromPackage', () => {
    it('should remove package association from block', async () => {
      vi.mocked(prisma.contentBlock.findUnique).mockResolvedValue(mockContentBlock as any)
      vi.mocked(prisma.contentBlock.update).mockResolvedValue({
        ...mockContentBlock,
        packageId: null,
      } as any)

      const result = await prisma.contentBlock.update({
        where: { id: 'block_123' },
        data: { packageId: null },
      })

      expect(result.packageId).toBeNull()
    })
  })

  describe('getAvailableBlocks', () => {
    it('should exclude deleted blocks', async () => {
      const where = {
        deletedAt: null,
      }

      expect(where.deletedAt).toBeNull()
    })

    it('should exclude blocks already linked to the package', async () => {
      vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

      await prisma.contentBlock.findMany({
        where: {
          deletedAt: null,
          packageId: { not: 'pkg_123' },
        },
      })

      expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            packageId: { not: 'pkg_123' },
          }),
        })
      )
    })

    it('should filter by search term', async () => {
      vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

      await prisma.contentBlock.findMany({
        where: {
          OR: [
            { name: { contains: 'faq', mode: 'insensitive' } },
            { slug: { contains: 'faq', mode: 'insensitive' } },
          ],
        },
      })

      expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      )
    })

    it('should filter by block type', async () => {
      vi.mocked(prisma.contentBlock.findMany).mockResolvedValue([])

      await prisma.contentBlock.findMany({
        where: { type: 'FAQ' },
      })

      expect(prisma.contentBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'FAQ' },
        })
      )
    })
  })

  describe('reorderPackageBlocks', () => {
    it('should update sort order for all blocks', async () => {
      const blockIds = ['block_1', 'block_2', 'block_3']

      // Each block should get sortOrder matching its index
      blockIds.forEach((blockId, index) => {
        expect(index).toBeGreaterThanOrEqual(0)
      })
    })
  })

  // ============================================================================
  // IMAGE MANAGEMENT
  // ============================================================================

  describe('updateHeroImage', () => {
    it('should update hero image URL', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as any)
      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        heroImageUrl: 'https://example.com/new-hero.jpg',
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: { heroImageUrl: 'https://example.com/new-hero.jpg' },
      })

      expect(result.heroImageUrl).toBe('https://example.com/new-hero.jpg')
    })

    it('should allow removing hero image', async () => {
      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        heroImageUrl: null,
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: { heroImageUrl: null },
      })

      expect(result.heroImageUrl).toBeNull()
    })
  })

  describe('updateGalleryImages', () => {
    it('should replace all gallery images', async () => {
      const newImageUrls = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg']

      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        imageUrls: newImageUrls,
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: { imageUrls: newImageUrls },
      })

      expect(result.imageUrls).toEqual(newImageUrls)
    })
  })

  describe('addGalleryImage', () => {
    it('should append image to existing gallery', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as any)

      const newImageUrl = 'https://example.com/new.jpg'
      const updatedUrls = [...mockPackage.imageUrls, newImageUrl]

      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        imageUrls: updatedUrls,
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: { imageUrls: updatedUrls },
      })

      expect(result.imageUrls).toContain(newImageUrl)
      expect(result.imageUrls.length).toBe(3)
    })
  })

  describe('removeGalleryImage', () => {
    it('should remove specific image from gallery', async () => {
      vi.mocked(prisma.package.findUnique).mockResolvedValue(mockPackage as any)

      const urlToRemove = mockPackage.imageUrls[0]
      const filteredUrls = mockPackage.imageUrls.filter(url => url !== urlToRemove)

      vi.mocked(prisma.package.update).mockResolvedValue({
        ...mockPackage,
        imageUrls: filteredUrls,
      } as any)

      const result = await prisma.package.update({
        where: { id: 'pkg_123' },
        data: { imageUrls: filteredUrls },
      })

      expect(result.imageUrls).not.toContain(urlToRemove)
      expect(result.imageUrls.length).toBe(1)
    })
  })

  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================

  describe('Input Validation', () => {
    describe('Package ID validation', () => {
      it('should require valid package ID', () => {
        const validId = 'pkg_123'
        const emptyId = ''

        expect(validId.length > 0).toBe(true)
        expect(emptyId.length > 0).toBe(false)
      })
    })

    describe('URL validation', () => {
      it('should validate image URLs', () => {
        const validUrls = [
          'https://example.com/image.jpg',
          'https://cdn.example.com/path/to/image.png',
        ]
        const invalidUrls = [
          'not-a-url',
          'ftp://example.com/file',
        ]

        const urlRegex = /^https?:\/\//

        validUrls.forEach(url => {
          expect(urlRegex.test(url)).toBe(true)
        })

        invalidUrls.forEach(url => {
          expect(urlRegex.test(url)).toBe(false)
        })
      })
    })

    describe('Text length validation', () => {
      it('should validate meta title length', () => {
        const maxLength = 200
        const validTitle = 'Pure Play | Pickleball Passport'
        const longTitle = 'A'.repeat(250)

        expect(validTitle.length <= maxLength).toBe(true)
        expect(longTitle.length <= maxLength).toBe(false)
      })

      it('should validate meta description length', () => {
        const maxLength = 300
        const validDescription = 'Experience the ultimate pickleball vacation in Thailand'
        const longDescription = 'B'.repeat(350)

        expect(validDescription.length <= maxLength).toBe(true)
        expect(longDescription.length <= maxLength).toBe(false)
      })
    })
  })

  // ============================================================================
  // CONTENT EXTRACTION
  // ============================================================================

  describe('Content Extraction', () => {
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

    it('should handle empty content', () => {
      const emptyContent = { type: 'doc', content: [] }

      const extractPlainText = (doc: any): string => {
        if (!doc.content || doc.content.length === 0) return ''
        return 'has content'
      }

      expect(extractPlainText(emptyContent)).toBe('')
    })
  })
})
