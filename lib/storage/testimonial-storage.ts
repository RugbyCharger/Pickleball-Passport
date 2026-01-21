/**
 * Testimonial Storage Service (Epic 12-5)
 *
 * Handles file uploads for guest testimonials:
 * - Video files (up to 500MB)
 * - Before/After photos (up to 10MB)
 *
 * Uses Supabase Storage with presigned URLs for secure uploads.
 */

import { createClient } from '@supabase/supabase-js';
import { storageLogger, logError } from '@/lib/logger';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client for server-side operations
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Storage bucket name for testimonials
export const TESTIMONIAL_BUCKET = 'testimonials';

// File validation constants
export const TESTIMONIAL_FILE_LIMITS = {
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB for videos
  PHOTO_MAX_SIZE: 10 * 1024 * 1024, // 10MB for photos
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
  ALLOWED_PHOTO_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
} as const;

export interface TestimonialUploadUrlResult {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  path?: string;
  error?: string;
}

/**
 * Ensure testimonial storage bucket exists
 */
async function ensureTestimonialBucketExists(): Promise<boolean> {
  if (!supabaseAdmin) {
    storageLogger.error('Supabase admin client not configured');
    return false;
  }

  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      logError(storageLogger, listError, 'Error listing buckets');
      return false;
    }

    const bucketExists = buckets?.some((b) => b.name === TESTIMONIAL_BUCKET);

    if (bucketExists) {
      return true;
    }

    // Create testimonial bucket
    storageLogger.info({ bucket: TESTIMONIAL_BUCKET }, 'Creating testimonial bucket');
    const { error: createError } = await supabaseAdmin.storage.createBucket(TESTIMONIAL_BUCKET, {
      public: true, // Public read for testimonial media
      fileSizeLimit: TESTIMONIAL_FILE_LIMITS.VIDEO_MAX_SIZE,
      allowedMimeTypes: [
        ...TESTIMONIAL_FILE_LIMITS.ALLOWED_VIDEO_TYPES,
        ...TESTIMONIAL_FILE_LIMITS.ALLOWED_PHOTO_TYPES,
      ],
    });

    if (createError) {
      logError(storageLogger, createError, 'Error creating testimonial bucket');
      return false;
    }

    storageLogger.info({ bucket: TESTIMONIAL_BUCKET }, 'Testimonial bucket created');
    return true;
  } catch (error) {
    logError(storageLogger, error, 'Error ensuring testimonial bucket exists');
    return false;
  }
}

/**
 * Generate a unique file path for testimonial uploads
 */
export function generateTestimonialFilePath(
  userId: string,
  fileType: 'video' | 'before-photo' | 'after-photo' | 'thumbnail',
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${fileType}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Create a signed upload URL for testimonial media
 *
 * @param userId - User ID for organizing files
 * @param fileType - Type of file (video, before-photo, after-photo, thumbnail)
 * @param fileName - Original file name
 * @returns Upload URL and public URL
 */
export async function createTestimonialUploadUrl(
  userId: string,
  fileType: 'video' | 'before-photo' | 'after-photo' | 'thumbnail',
  fileName: string
): Promise<TestimonialUploadUrlResult> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: 'Supabase storage not configured',
    };
  }

  try {
    // Ensure bucket exists
    const bucketReady = await ensureTestimonialBucketExists();
    if (!bucketReady) {
      return {
        success: false,
        error: 'Failed to initialize storage bucket',
      };
    }

    const filePath = generateTestimonialFilePath(userId, fileType, fileName);

    // Create signed upload URL (valid for 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from(TESTIMONIAL_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      logError(storageLogger, error, 'Error creating signed upload URL', { userId, fileType });
      return {
        success: false,
        error: error?.message || 'Failed to create upload URL',
      };
    }

    // Get public URL for the file (after upload)
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(TESTIMONIAL_BUCKET)
      .getPublicUrl(filePath);

    storageLogger.info({ userId, fileType, filePath }, 'Testimonial upload URL created');

    return {
      success: true,
      uploadUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    logError(storageLogger, error, 'Error creating testimonial upload URL');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a testimonial file from storage
 *
 * @param filePath - Path to the file in storage
 * @returns Success status
 */
export async function deleteTestimonialFile(filePath: string): Promise<boolean> {
  if (!supabaseAdmin) {
    storageLogger.error('Supabase admin client not configured');
    return false;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(TESTIMONIAL_BUCKET)
      .remove([filePath]);

    if (error) {
      logError(storageLogger, error, 'Error deleting testimonial file', { filePath });
      return false;
    }

    storageLogger.info({ filePath }, 'Testimonial file deleted');
    return true;
  } catch (error) {
    logError(storageLogger, error, 'Error deleting testimonial file', { filePath });
    return false;
  }
}

/**
 * Validate file before upload
 */
export function validateTestimonialFile(
  file: { size: number; type: string },
  fileType: 'video' | 'photo'
): { valid: boolean; error?: string } {
  const maxSize = fileType === 'video'
    ? TESTIMONIAL_FILE_LIMITS.VIDEO_MAX_SIZE
    : TESTIMONIAL_FILE_LIMITS.PHOTO_MAX_SIZE;

  const allowedTypes = fileType === 'video'
    ? TESTIMONIAL_FILE_LIMITS.ALLOWED_VIDEO_TYPES
    : TESTIMONIAL_FILE_LIMITS.ALLOWED_PHOTO_TYPES;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / 1024 / 1024;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB).`,
    };
  }

  // Check file type
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    const allowedExtensions = fileType === 'video'
      ? 'MP4, MOV, WebM, AVI'
      : 'JPEG, PNG, WebP, HEIC';
    return {
      valid: false,
      error: `File type not allowed. Accepted formats: ${allowedExtensions}`,
    };
  }

  return { valid: true };
}

/**
 * Check if storage is configured
 */
export function isTestimonialStorageConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceRoleKey);
}
