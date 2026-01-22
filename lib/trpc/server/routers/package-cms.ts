/**
 * Package CMS Router
 *
 * tRPC procedures for package content management (Story 12-2)
 * Supports editing package content through the CMS with:
 * - Rich text descriptions
 * - Image management
 * - Pricing and duration text
 * - Content block associations
 * - Version history/audit log
 * - Preview functionality
 */

import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Maximum number of content versions to keep for audit log
const MAX_VERSIONS = 10

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
  packageId: string
): Promise<void> {
  const versions = await db.packageContentVersion.findMany({
    where: { packageId },
    orderBy: { versionNumber: 'desc' },
    select: { id: true, versionNumber: true },
  })

  if (versions.length > MAX_VERSIONS) {
    const idsToDelete = versions.slice(MAX_VERSIONS).map(v => v.id)
    await db.packageContentVersion.deleteMany({
      where: { id: { in: idsToDelete } },
    })
  }
}

export const packageCmsRouter = router({
  // ============================================================================
  // PACKAGE CONTENT QUERIES
  // ============================================================================

  /**
   * Get all packages for CMS management
   */
  getPackagesForCms: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['name', 'updatedAt', 'createdAt']).default('updatedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        search,
        isActive,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.PackageWhereInput = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [packages, total] = await Promise.all([
        ctx.db.package.findMany({
          where,
          select: {
            id: true,
            slug: true,
            name: true,
            tagline: true,
            heroImageUrl: true,
            isActive: true,
            basePrice: true,
            durationOptions: true,
            cmsDescription: true,
            cmsPricingText: true,
            cmsDurationText: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                contentBlocks: true,
                bookings: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.package.count({ where }),
      ])

      return { packages, total }
    }),

  /**
   * Get package content for editing
   */
  getPackageContent: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.id },
        include: {
          contentBlocks: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              status: true,
              content: true,
              sortOrder: true,
              updatedAt: true,
            },
          },
          contentVersions: {
            orderBy: { versionNumber: 'desc' },
            take: MAX_VERSIONS,
            select: {
              id: true,
              versionNumber: true,
              changesSummary: true,
              createdBy: true,
              createdAt: true,
            },
          },
          itineraries: {
            orderBy: { duration: 'asc' },
            select: {
              id: true,
              duration: true,
              content: true,
            },
          },
        },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return packageData
    }),

  /**
   * Get package content preview (public)
   * Returns CMS content for package detail pages
   */
  getPackageContentPreview: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          description: true,
          cmsDescription: true,
          cmsPricingText: true,
          cmsDurationText: true,
          cmsHighlights: true,
          cmsIncludedItems: true,
          cmsNotIncludedItems: true,
          basePrice: true,
          durationOptions: true,
          heroImageUrl: true,
          imageUrls: true,
          metaTitle: true,
          metaDescription: true,
          isActive: true,
          contentBlocks: {
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

      if (!packageData || !packageData.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return packageData
    }),

  // ============================================================================
  // PACKAGE CONTENT MUTATIONS
  // ============================================================================

  /**
   * Update package CMS content
   */
  updatePackageContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
        // Basic fields
        name: z.string().min(1).max(200).optional(),
        tagline: z.string().max(200).nullish(),
        description: z.string().optional(),
        // CMS fields
        cmsDescription: z.unknown().optional(), // TipTap JSON
        cmsPricingText: z.string().nullish(),
        cmsDurationText: z.string().nullish(),
        cmsHighlights: z.unknown().optional(), // JSON array
        cmsIncludedItems: z.unknown().optional(), // JSON array
        cmsNotIncludedItems: z.unknown().optional(), // JSON array
        // Media
        heroImageUrl: z.string().url().nullish(),
        imageUrls: z.array(z.string().url()).optional(),
        // SEO
        metaTitle: z.string().max(200).nullish(),
        metaDescription: z.string().max(300).nullish(),
        // Change summary for audit
        changesSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, changesSummary, ...updateData } = input

      // Fetch current package
      const current = await ctx.db.package.findUnique({
        where: { id },
        include: {
          contentVersions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      })

      if (!current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Create version snapshot before updating (audit log)
        const nextVersion = (current.contentVersions[0]?.versionNumber || 0) + 1

        await tx.packageContentVersion.create({
          data: {
            packageId: id,
            versionNumber: nextVersion,
            content: {
              name: current.name,
              tagline: current.tagline,
              description: current.description,
              cmsDescription: current.cmsDescription,
              cmsPricingText: current.cmsPricingText,
              cmsDurationText: current.cmsDurationText,
              cmsHighlights: current.cmsHighlights,
              cmsIncludedItems: current.cmsIncludedItems,
              cmsNotIncludedItems: current.cmsNotIncludedItems,
              heroImageUrl: current.heroImageUrl,
              imageUrls: current.imageUrls,
              metaTitle: current.metaTitle,
              metaDescription: current.metaDescription,
            } as Prisma.InputJsonValue,
            changesSummary: changesSummary || 'Content updated',
            createdBy: ctx.user.id,
          },
        })

        // Clean up old versions
        await cleanupOldVersions(tx, id)

        // Build update data with proper null handling
        const prismaUpdateData: Prisma.PackageUpdateInput = {}

        if (updateData.name !== undefined) prismaUpdateData.name = updateData.name
        if (updateData.tagline !== undefined) prismaUpdateData.tagline = updateData.tagline
        if (updateData.description !== undefined) prismaUpdateData.description = updateData.description
        if (updateData.cmsDescription !== undefined) {
          prismaUpdateData.cmsDescription = updateData.cmsDescription as Prisma.InputJsonValue
        }
        if (updateData.cmsPricingText !== undefined) prismaUpdateData.cmsPricingText = updateData.cmsPricingText
        if (updateData.cmsDurationText !== undefined) prismaUpdateData.cmsDurationText = updateData.cmsDurationText
        if (updateData.cmsHighlights !== undefined) {
          prismaUpdateData.cmsHighlights = updateData.cmsHighlights as Prisma.InputJsonValue
        }
        if (updateData.cmsIncludedItems !== undefined) {
          prismaUpdateData.cmsIncludedItems = updateData.cmsIncludedItems as Prisma.InputJsonValue
        }
        if (updateData.cmsNotIncludedItems !== undefined) {
          prismaUpdateData.cmsNotIncludedItems = updateData.cmsNotIncludedItems as Prisma.InputJsonValue
        }
        if (updateData.heroImageUrl !== undefined) prismaUpdateData.heroImageUrl = updateData.heroImageUrl
        if (updateData.imageUrls !== undefined) prismaUpdateData.imageUrls = updateData.imageUrls
        if (updateData.metaTitle !== undefined) prismaUpdateData.metaTitle = updateData.metaTitle
        if (updateData.metaDescription !== undefined) prismaUpdateData.metaDescription = updateData.metaDescription

        // Update package
        const updated = await tx.package.update({
          where: { id },
          data: prismaUpdateData,
          include: {
            contentBlocks: {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                status: true,
              },
            },
          },
        })

        return updated
      })
    }),

  /**
   * Restore package content to a previous version
   */
  restorePackageVersion: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        versionNumber: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.packageContentVersion.findUnique({
        where: {
          packageId_versionNumber: {
            packageId: input.packageId,
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

      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
        include: {
          contentVersions: {
            select: { versionNumber: true },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.$transaction(async (tx) => {
        // Save current state as new version before restoring
        const nextVersion = (packageData.contentVersions[0]?.versionNumber || 0) + 1

        await tx.packageContentVersion.create({
          data: {
            packageId: input.packageId,
            versionNumber: nextVersion,
            content: {
              name: packageData.name,
              tagline: packageData.tagline,
              description: packageData.description,
              cmsDescription: packageData.cmsDescription,
              cmsPricingText: packageData.cmsPricingText,
              cmsDurationText: packageData.cmsDurationText,
              cmsHighlights: packageData.cmsHighlights,
              cmsIncludedItems: packageData.cmsIncludedItems,
              cmsNotIncludedItems: packageData.cmsNotIncludedItems,
              heroImageUrl: packageData.heroImageUrl,
              imageUrls: packageData.imageUrls,
              metaTitle: packageData.metaTitle,
              metaDescription: packageData.metaDescription,
            } as Prisma.InputJsonValue,
            changesSummary: `Before restoring to version ${input.versionNumber}`,
            createdBy: ctx.user.id,
          },
        })

        // Restore content from version
        const versionContent = version.content as {
          name?: string
          tagline?: string | null
          description?: string
          cmsDescription?: unknown
          cmsPricingText?: string | null
          cmsDurationText?: string | null
          cmsHighlights?: unknown
          cmsIncludedItems?: unknown
          cmsNotIncludedItems?: unknown
          heroImageUrl?: string | null
          imageUrls?: string[]
          metaTitle?: string | null
          metaDescription?: string | null
        }

        const updated = await tx.package.update({
          where: { id: input.packageId },
          data: {
            name: versionContent.name || packageData.name,
            tagline: versionContent.tagline,
            description: versionContent.description || packageData.description,
            cmsDescription: versionContent.cmsDescription as Prisma.InputJsonValue,
            cmsPricingText: versionContent.cmsPricingText,
            cmsDurationText: versionContent.cmsDurationText,
            cmsHighlights: versionContent.cmsHighlights as Prisma.InputJsonValue,
            cmsIncludedItems: versionContent.cmsIncludedItems as Prisma.InputJsonValue,
            cmsNotIncludedItems: versionContent.cmsNotIncludedItems as Prisma.InputJsonValue,
            heroImageUrl: versionContent.heroImageUrl,
            imageUrls: versionContent.imageUrls || [],
            metaTitle: versionContent.metaTitle,
            metaDescription: versionContent.metaDescription,
          },
        })

        // Clean up old versions
        await cleanupOldVersions(tx, input.packageId)

        return updated
      })
    }),

  /**
   * Get version history for a package (audit log)
   */
  getPackageVersionHistory: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const [versions, total] = await Promise.all([
        ctx.db.packageContentVersion.findMany({
          where: { packageId: input.packageId },
          orderBy: { versionNumber: 'desc' },
          take: input.limit,
          skip: input.offset,
          select: {
            id: true,
            versionNumber: true,
            changesSummary: true,
            createdBy: true,
            createdAt: true,
          },
        }),
        ctx.db.packageContentVersion.count({
          where: { packageId: input.packageId },
        }),
      ])

      return { versions, total }
    }),

  /**
   * Get specific version content for preview/comparison
   */
  getPackageVersionContent: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        versionNumber: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      const version = await ctx.db.packageContentVersion.findUnique({
        where: {
          packageId_versionNumber: {
            packageId: input.packageId,
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

      return version
    }),

  // ============================================================================
  // CONTENT BLOCK ASSOCIATIONS
  // ============================================================================

  /**
   * Link a content block to a package
   */
  linkBlockToPackage: adminProcedure
    .input(
      z.object({
        blockId: z.string(),
        packageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify both exist
      const [block, packageData] = await Promise.all([
        ctx.db.contentBlock.findUnique({ where: { id: input.blockId } }),
        ctx.db.package.findUnique({ where: { id: input.packageId } }),
      ])

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.blockId },
        data: {
          packageId: input.packageId,
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Unlink a content block from a package
   */
  unlinkBlockFromPackage: adminProcedure
    .input(z.object({ blockId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const block = await ctx.db.contentBlock.findUnique({
        where: { id: input.blockId },
      })

      if (!block) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content block not found',
        })
      }

      return ctx.db.contentBlock.update({
        where: { id: input.blockId },
        data: {
          packageId: null,
          updatedBy: ctx.user.id,
        },
      })
    }),

  /**
   * Get available content blocks for linking to a package
   */
  getAvailableBlocks: adminProcedure
    .input(
      z.object({
        packageId: z.string().optional(), // Exclude blocks already linked to this package
        search: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.ContentBlockWhereInput = {
        deletedAt: null,
        ...(input.packageId && { packageId: { not: input.packageId } }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { slug: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
        ...(input.type && { type: input.type as Prisma.EnumContentBlockTypeFilter['equals'] }),
      }

      const blocks = await ctx.db.contentBlock.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
          packageId: true,
          package: {
            select: { id: true, name: true },
          },
        },
      })

      return blocks
    }),

  /**
   * Reorder content blocks within a package
   */
  reorderPackageBlocks: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        blockIds: z.array(z.string()), // Ordered list of block IDs
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      // Update sort order for each block
      await ctx.db.$transaction(
        input.blockIds.map((blockId, index) =>
          ctx.db.contentBlock.update({
            where: { id: blockId },
            data: {
              sortOrder: index,
              updatedBy: ctx.user.id,
            },
          })
        )
      )

      return { success: true }
    }),

  // ============================================================================
  // IMAGE MANAGEMENT
  // ============================================================================

  /**
   * Update package hero image
   */
  updateHeroImage: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        heroImageUrl: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.package.update({
        where: { id: input.packageId },
        data: { heroImageUrl: input.heroImageUrl },
      })
    }),

  /**
   * Update package gallery images
   */
  updateGalleryImages: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        imageUrls: z.array(z.string().url()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.package.update({
        where: { id: input.packageId },
        data: { imageUrls: input.imageUrls },
      })
    }),

  /**
   * Add image to gallery
   */
  addGalleryImage: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.package.update({
        where: { id: input.packageId },
        data: {
          imageUrls: [...packageData.imageUrls, input.imageUrl],
        },
      })
    }),

  /**
   * Remove image from gallery
   */
  removeGalleryImage: adminProcedure
    .input(
      z.object({
        packageId: z.string(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
      })

      if (!packageData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Package not found',
        })
      }

      return ctx.db.package.update({
        where: { id: input.packageId },
        data: {
          imageUrls: packageData.imageUrls.filter(url => url !== input.imageUrl),
        },
      })
    }),
})
