/**
 * Mux Video Service
 *
 * Handles video upload, processing, and playback with Mux.
 *
 * @see https://docs.mux.com/guides/video/upload-files-directly
 */

import Mux from '@mux/mux-node';

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export interface CreateUploadUrlResult {
  uploadUrl: string;
  assetId: string;
}

export interface VideoAsset {
  assetId: string;
  playbackId: string;
  status: 'preparing' | 'ready' | 'errored';
  duration?: number;
  aspectRatio?: string;
  thumbnailUrl?: string;
}

/**
 * Create a direct upload URL for video files
 *
 * This generates a temporary URL where the client can upload a video file.
 * Mux will automatically process the video and create an asset.
 */
export async function createUploadUrl(): Promise<CreateUploadUrlResult> {
  try {
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
    });

    return {
      uploadUrl: upload.url,
      assetId: upload.asset_id || '',
    };
  } catch (error) {
    console.error('Error creating Mux upload URL:', error);
    throw new Error('Failed to create video upload URL');
  }
}

/**
 * Get video asset details from Mux
 *
 * Retrieves information about a video asset including playback ID,
 * processing status, and thumbnail URL.
 */
export async function getVideoAsset(assetId: string): Promise<VideoAsset | null> {
  try {
    const asset = await mux.video.assets.retrieve(assetId);

    if (!asset) {
      return null;
    }

    // Get the public playback ID
    const playbackId = asset.playback_ids?.[0]?.id || '';

    // Generate thumbnail URL (Mux automatically creates thumbnails)
    const thumbnailUrl = playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
      : undefined;

    return {
      assetId: asset.id,
      playbackId,
      status: asset.status as VideoAsset['status'],
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('Error retrieving Mux asset:', error);
    return null;
  }
}

/**
 * Delete a video asset from Mux
 *
 * Permanently removes the video from Mux storage.
 */
export async function deleteVideoAsset(assetId: string): Promise<boolean> {
  try {
    await mux.video.assets.delete(assetId);
    return true;
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    return false;
  }
}

/**
 * Get thumbnail URL for a video
 *
 * Generates a thumbnail image URL from a Mux playback ID.
 * Supports various sizing and cropping options.
 */
export function getThumbnailUrl(
  playbackId: string,
  options?: {
    width?: number;
    height?: number;
    fitMode?: 'preserve' | 'stretch' | 'crop' | 'smartcrop';
    time?: number; // Timestamp in seconds to capture thumbnail
  }
): string {
  const { width = 640, height = 360, fitMode = 'smartcrop', time } = options || {};

  let url = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  url += `?width=${width}&height=${height}&fit_mode=${fitMode}`;

  if (time !== undefined) {
    url += `&time=${time}`;
  }

  return url;
}

/**
 * Check if video is ready for playback
 *
 * Polls Mux to see if a video has finished processing.
 */
export async function isVideoReady(assetId: string): Promise<boolean> {
  const asset = await getVideoAsset(assetId);
  return asset?.status === 'ready';
}

/**
 * Get playback URL for Mux Player
 *
 * Returns the HLS stream URL for a video.
 */
export function getPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
