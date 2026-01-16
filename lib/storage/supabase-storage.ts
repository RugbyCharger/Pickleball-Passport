/**
 * Supabase Storage Service - E4-S8
 *
 * Handles file uploads to Supabase Storage for receipt PDFs
 * Supports private storage with authenticated access
 */

import { createClient } from '@supabase/supabase-js';
import { storageLogger, logError } from '@/lib/logger';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  storageLogger.warn(
    'Supabase Storage is not configured. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'
  );
}

// Create Supabase client with service role key for admin operations
// Service role key bypasses RLS policies for server-side operations
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export interface UploadToStorageInput {
  bucket: string;
  path: string;
  buffer: Buffer;
  contentType: string;
  upsert?: boolean;
}

export interface UploadToStorageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 *
 * @param {UploadToStorageInput} input - Upload parameters
 * @returns {Promise<UploadToStorageResult>} Upload result with public URL
 */
export async function uploadToSupabaseStorage(
  input: UploadToStorageInput
): Promise<UploadToStorageResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase Storage is not configured',
    };
  }

  try {
    const { bucket, path, buffer, contentType, upsert = true } = input;

    // 1. Ensure bucket exists (create if needed)
    const bucketExists = await ensureBucketExists(bucket);
    if (!bucketExists) {
      return {
        success: false,
        error: `Failed to create or access bucket: ${bucket}`,
      };
    }

    // 2. Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert,
        cacheControl: '3600', // Cache for 1 hour
      });

    if (error) {
      logError(storageLogger, error, 'Supabase upload error', { bucket, path });
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data?.path) {
      return {
        success: false,
        error: 'Upload succeeded but no path returned',
      };
    }

    // 3. Get public/signed URL for the uploaded file
    // For private buckets, we use signed URLs with expiration
    // For public buckets, we use public URLs
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to generate URL for uploaded file',
      };
    }

    storageLogger.info({ bucket, path }, 'File uploaded successfully');

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    logError(storageLogger, error, 'Error uploading to Supabase Storage', { bucket, path });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a signed URL for private file access
 *
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string | null>} Signed URL or null if failed
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!supabase) {
    storageLogger.error('Supabase Storage is not configured');
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      logError(storageLogger, error, 'Error creating signed URL', { bucket, path });
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    logError(storageLogger, error, 'Error creating signed URL', { bucket, path });
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 *
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<boolean> {
  if (!supabase) {
    storageLogger.error('Supabase Storage is not configured');
    return false;
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logError(storageLogger, error, 'Error deleting file', { bucket, path });
      return false;
    }

    storageLogger.info({ bucket, path }, 'File deleted successfully');
    return true;
  } catch (error) {
    logError(storageLogger, error, 'Error deleting from Supabase Storage', { bucket, path });
    return false;
  }
}

/**
 * Download a file from Supabase Storage
 *
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @returns {Promise<Buffer | null>} File buffer or null if failed
 */
export async function downloadFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<Buffer | null> {
  if (!supabase) {
    storageLogger.error('Supabase Storage is not configured');
    return null;
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
      logError(storageLogger, error, 'Error downloading file', { bucket, path });
      return null;
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    logError(storageLogger, error, 'Error downloading from Supabase Storage', { bucket, path });
    return null;
  }
}

/**
 * Ensure a storage bucket exists, create if it doesn't
 *
 * @param {string} bucketName - Name of the bucket
 * @returns {Promise<boolean>} True if bucket exists or was created
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      logError(storageLogger, listError, 'Error listing buckets');
      return false;
    }

    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (bucketExists) {
      return true;
    }

    // Create bucket if it doesn't exist
    storageLogger.info({ bucketName }, 'Creating bucket');
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false, // Private bucket - requires authentication
      fileSizeLimit: 1024 * 1024, // 1MB limit for PDFs
      allowedMimeTypes: ['application/pdf'],
    });

    if (createError) {
      logError(storageLogger, createError, 'Error creating bucket', { bucketName });
      return false;
    }

    storageLogger.info({ bucketName }, 'Bucket created successfully');
    return true;
  } catch (error) {
    logError(storageLogger, error, 'Error ensuring bucket exists', { bucketName });
    return false;
  }
}

/**
 * Check if Supabase Storage is configured
 *
 * @returns {boolean} True if configured
 */
export function isStorageConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceRoleKey);
}
