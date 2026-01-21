/**
 * Media Library Router
 *
 * tRPC procedures for media asset management (Story 12-6)
 * Supports file uploads, folder organization, and media browsing
 * with S3 presigned URLs for secure uploads.
 */

import { z } from 'zod'
import { Prisma, MediaAssetType } from '@prisma/client'
import { router, adminProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 client configuration
const getS3Client = () => {
  const region = process.env.AWS_REGION || 'us-east-1'
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    return null
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'pickleball-passport-media'

// Schema for media asset type
const mediaAssetTypeSchema = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT'])

// Supported MIME types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf']

const ALL_SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES, ...SUPPORTED_DOCUMENT_TYPES]

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024 // 25MB

/**
 * Get asset type from MIME type
 */
function getAssetTypeFromMime(mimeType: string): MediaAssetType {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'IMAGE'
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return 'VIDEO'
  if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) return 'DOCUMENT'
  throw new Error(`Unsupported MIME type: ${mimeType}`)
}

/**
 * Get max file size for asset type
 */
function getMaxSizeForType(type: MediaAssetType): number {
  switch (type) {
    case 'IMAGE': return MAX_IMAGE_SIZE
    case 'VIDEO': return MAX_VIDEO_SIZE
    case 'DOCUMENT': return MAX_DOCUMENT_SIZE
  }
}

/**
 * Generate S3 key for file upload
 */
function generateS3Key(filename: string, folderId: string | null): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const prefix = folderId ? `folders/${folderId}` : 'uploads'
  return `${prefix}/${timestamp}-${randomStr}-${sanitizedFilename}`
}

export const mediaRouter = router({
  // ============================================================================
  // MEDIA FOLDERS
  // ============================================================================

  /**
   * Get all folders with optional hierarchy
   */
  getFolders: adminProcedure
    .input(
      z.object({
        parentId: z.string().nullish(),
        includeChildren: z.boolean().default(false),
        includeAssetCount: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { parentId, includeChildren, includeAssetCount } = input || {}

      return ctx.db.mediaFolder.findMany({
        where: parentId !== undefined ? { parentId } : undefined,
        include: {
          ...(includeChildren && { children: true }),
          parent: { select: { id: true, name: true, slug: true } },
          ...(includeAssetCount && { _count: { select: { assets: true } } }),
        },
        orderBy: [{ name: 'asc' }],
      })
    }),

  /**
   * Get folder by ID with assets
   */
  getFolderById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.db.mediaFolder.findUnique({
        where: { id: input.id },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { assets: true } },
        },
      })

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        })
      }

      return folder
    }),

  /**
   * Create folder
   */
  createFolder: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(100),
        slug: z
          .string()
          .min(1, 'Slug is required')
          .max(100)
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
        description: z.string().max(500).optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check slug uniqueness
      const existing = await ctx.db.mediaFolder.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A folder with this slug already exists',
        })
      }

      // Validate parent exists if provided
      if (input.parentId) {
        const parent = await ctx.db.mediaFolder.findUnique({
          where: { id: input.parentId },
        })

        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent folder not found',
          })
        }
      }

      return ctx.db.mediaFolder.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          parentId: input.parentId,
          createdBy: ctx.user.id,
        },
        include: {
          parent: { select: { id: true, name: true } },
        },
      })
    }),

  /**
   * Update folder
   */
  updateFolder: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        slug: z
          .string()
          .max(100)
          .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')
          .optional(),
        description: z.string().max(500).nullish(),
        parentId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.mediaFolder.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        })
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await ctx.db.mediaFolder.findUnique({
          where: { slug: data.slug },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A folder with this slug already exists',
          })
        }
      }

      // Prevent circular parent reference
      if (data.parentId === id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Folder cannot be its own parent',
        })
      }

      return ctx.db.mediaFolder.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.parentId !== undefined && { parentId: data.parentId }),
        },
        include: {
          parent: { select: { id: true, name: true } },
        },
      })
    }),

  /**
   * Delete folder
   */
  deleteFolder: adminProcedure
    .input(z.object({ id: z.string(), moveAssetsTo: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.mediaFolder.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { assets: true, children: true } },
        },
      })

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        })
      }

      // Check for child folders
      if (folder._count.children > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete folder with subfolders. Delete subfolders first.',
        })
      }

      // Handle assets in folder
      if (folder._count.assets > 0) {
        if (input.moveAssetsTo) {
          // Move assets to another folder
          await ctx.db.mediaAsset.updateMany({
            where: { folderId: input.id },
            data: { folderId: input.moveAssetsTo },
          })
        } else {
          // Move assets to root (no folder)
          await ctx.db.mediaAsset.updateMany({
            where: { folderId: input.id },
            data: { folderId: null },
          })
        }
      }

      await ctx.db.mediaFolder.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================================================
  // MEDIA ASSETS
  // ============================================================================

  /**
   * Get media assets with filtering and pagination
   */
  getAssets: adminProcedure
    .input(
      z.object({
        folderId: z.string().nullish(), // null = root, undefined = all
        type: mediaAssetTypeSchema.optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        sortBy: z.enum(['uploadedAt', 'filename', 'size']).default('uploadedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const {
        folderId,
        type,
        search,
        tags,
        sortBy = 'uploadedAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0,
      } = input || {}

      const where: Prisma.MediaAssetWhereInput = {
        // folderId null means root folder, undefined means all folders
        ...(folderId !== undefined && { folderId }),
        ...(type && { type }),
        ...(search && {
          OR: [
            { filename: { contains: search, mode: 'insensitive' } },
            { alt: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { caption: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      }

      const [assets, total] = await Promise.all([
        ctx.db.mediaAsset.findMany({
          where,
          include: {
            folder: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.mediaAsset.count({ where }),
      ])

      return { assets, total }
    }),

  /**
   * Get single asset by ID
   */
  getAssetById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.mediaAsset.findUnique({
        where: { id: input.id },
        include: {
          folder: { select: { id: true, name: true, slug: true } },
        },
      })

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media asset not found',
        })
      }

      return asset
    }),

  /**
   * Get presigned URL for file upload
   */
  getUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().refine(
          (type) => ALL_SUPPORTED_TYPES.includes(type),
          { message: 'Unsupported file type' }
        ),
        size: z.number().int().positive(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assetType = getAssetTypeFromMime(input.mimeType)
      const maxSize = getMaxSizeForType(assetType)

      if (input.size > maxSize) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `File too large. Maximum size for ${assetType.toLowerCase()} is ${maxSize / 1024 / 1024}MB`,
        })
      }

      const s3Client = getS3Client()
      const s3Key = generateS3Key(input.filename, input.folderId || null)

      // If S3 is not configured, return a mock URL for development
      if (!s3Client) {
        return {
          uploadUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
          publicUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
          s3Key,
          s3Bucket: S3_BUCKET,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          mockUpload: true, // Flag for dev environment
        }
      }

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        ContentType: input.mimeType,
        ContentLength: input.size,
      })

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`

      return {
        uploadUrl,
        publicUrl,
        s3Key,
        s3Bucket: S3_BUCKET,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      }
    }),

  /**
   * Create asset record after successful upload
   */
  createAsset: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        mimeType: z.string(),
        size: z.number().int().positive(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        duration: z.number().int().positive().optional(),
        alt: z.string().max(500).optional(),
        title: z.string().max(200).optional(),
        caption: z.string().max(1000).optional(),
        tags: z.array(z.string()).default([]),
        folderId: z.string().optional(),
        s3Key: z.string().optional(),
        s3Bucket: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assetType = getAssetTypeFromMime(input.mimeType)

      // Validate folder exists if provided
      if (input.folderId) {
        const folder = await ctx.db.mediaFolder.findUnique({
          where: { id: input.folderId },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found',
          })
        }
      }

      return ctx.db.mediaAsset.create({
        data: {
          filename: input.filename,
          url: input.url,
          thumbnailUrl: input.thumbnailUrl,
          type: assetType,
          mimeType: input.mimeType,
          size: input.size,
          width: input.width,
          height: input.height,
          duration: input.duration,
          alt: input.alt,
          title: input.title,
          caption: input.caption,
          tags: input.tags,
          folderId: input.folderId,
          s3Key: input.s3Key,
          s3Bucket: input.s3Bucket,
          createdBy: ctx.user.id,
        },
        include: {
          folder: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Update asset metadata
   */
  updateAsset: adminProcedure
    .input(
      z.object({
        id: z.string(),
        alt: z.string().max(500).nullish(),
        title: z.string().max(200).nullish(),
        caption: z.string().max(1000).nullish(),
        tags: z.array(z.string()).optional(),
        folderId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existing = await ctx.db.mediaAsset.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media asset not found',
        })
      }

      // Validate folder exists if provided
      if (data.folderId) {
        const folder = await ctx.db.mediaFolder.findUnique({
          where: { id: data.folderId },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found',
          })
        }
      }

      return ctx.db.mediaAsset.update({
        where: { id },
        data: {
          ...(data.alt !== undefined && { alt: data.alt }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.caption !== undefined && { caption: data.caption }),
          ...(data.tags && { tags: data.tags }),
          ...(data.folderId !== undefined && { folderId: data.folderId }),
        },
        include: {
          folder: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Move asset to folder
   */
  moveAsset: adminProcedure
    .input(
      z.object({
        id: z.string(),
        folderId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.mediaAsset.findUnique({
        where: { id: input.id },
      })

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media asset not found',
        })
      }

      // Validate folder exists if provided
      if (input.folderId) {
        const folder = await ctx.db.mediaFolder.findUnique({
          where: { id: input.folderId },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found',
          })
        }
      }

      return ctx.db.mediaAsset.update({
        where: { id: input.id },
        data: { folderId: input.folderId },
        include: {
          folder: { select: { id: true, name: true, slug: true } },
        },
      })
    }),

  /**
   * Move multiple assets to folder
   */
  moveAssets: adminProcedure
    .input(
      z.object({
        ids: z.array(z.string()).min(1),
        folderId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate folder exists if provided
      if (input.folderId) {
        const folder = await ctx.db.mediaFolder.findUnique({
          where: { id: input.folderId },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found',
          })
        }
      }

      const result = await ctx.db.mediaAsset.updateMany({
        where: { id: { in: input.ids } },
        data: { folderId: input.folderId },
      })

      return { count: result.count }
    }),

  /**
   * Delete asset
   */
  deleteAsset: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.mediaAsset.findUnique({
        where: { id: input.id },
      })

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media asset not found',
        })
      }

      // Delete from S3 if configured
      if (asset.s3Key && asset.s3Bucket) {
        const s3Client = getS3Client()
        if (s3Client) {
          try {
            const command = new DeleteObjectCommand({
              Bucket: asset.s3Bucket,
              Key: asset.s3Key,
            })
            await s3Client.send(command)
          } catch (error) {
            console.error('Failed to delete S3 object:', error)
            // Continue with database deletion even if S3 fails
          }
        }
      }

      await ctx.db.mediaAsset.delete({
        where: { id: input.id },
      })

      return { success: true, deletedUrl: asset.url }
    }),

  /**
   * Delete multiple assets
   */
  deleteAssets: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const assets = await ctx.db.mediaAsset.findMany({
        where: { id: { in: input.ids } },
        select: { id: true, s3Key: true, s3Bucket: true },
      })

      // Delete from S3 if configured
      const s3Client = getS3Client()
      if (s3Client) {
        for (const asset of assets) {
          if (asset.s3Key && asset.s3Bucket) {
            try {
              const command = new DeleteObjectCommand({
                Bucket: asset.s3Bucket,
                Key: asset.s3Key,
              })
              await s3Client.send(command)
            } catch (error) {
              console.error(`Failed to delete S3 object ${asset.s3Key}:`, error)
            }
          }
        }
      }

      const result = await ctx.db.mediaAsset.deleteMany({
        where: { id: { in: input.ids } },
      })

      return { count: result.count }
    }),

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get media library statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalAssets,
      totalImages,
      totalVideos,
      totalDocuments,
      totalFolders,
      totalSize,
    ] = await Promise.all([
      ctx.db.mediaAsset.count(),
      ctx.db.mediaAsset.count({ where: { type: 'IMAGE' } }),
      ctx.db.mediaAsset.count({ where: { type: 'VIDEO' } }),
      ctx.db.mediaAsset.count({ where: { type: 'DOCUMENT' } }),
      ctx.db.mediaFolder.count(),
      ctx.db.mediaAsset.aggregate({ _sum: { size: true } }),
    ])

    return {
      totalAssets,
      totalImages,
      totalVideos,
      totalDocuments,
      totalFolders,
      totalSize: totalSize._sum.size || 0,
    }
  }),

  /**
   * Get all unique tags
   */
  getAllTags: adminProcedure.query(async ({ ctx }) => {
    const assets = await ctx.db.mediaAsset.findMany({
      select: { tags: true },
      where: { tags: { isEmpty: false } },
    })

    const tagSet = new Set<string>()
    assets.forEach(asset => {
      asset.tags.forEach(tag => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  }),

  // ============================================================================
  // PUBLIC ACCESS (for TipTap integration)
  // ============================================================================

  /**
   * Get asset by ID for public use (TipTap editor)
   */
  getPublicAsset: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.mediaAsset.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          filename: true,
          url: true,
          thumbnailUrl: true,
          type: true,
          mimeType: true,
          width: true,
          height: true,
          alt: true,
          title: true,
        },
      })

      if (!asset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Media asset not found',
        })
      }

      return asset
    }),
})
