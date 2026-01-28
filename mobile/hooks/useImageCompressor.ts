/**
 * Image Compressor Hook
 *
 * Compresses images before upload to reduce file size and bandwidth.
 * Max dimensions: 1920x1080 (maintains aspect ratio)
 * Quality: 70% JPEG compression
 *
 * @example
 * const { compressImage, loading, error } = useImageCompressor();
 * const result = await compressImage(imageUri);
 * if (result) {
 *   // Upload result.uri
 * }
 */

import { useCallback, useState } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';

interface CompressionResult {
  uri: string;
  width: number;
  height: number;
}

interface UseImageCompressorResult {
  compressImage: (uri: string) => Promise<CompressionResult | null>;
  loading: boolean;
  error: string | null;
}

// Constants per RESEARCH.md requirements
const MAX_WIDTH = 1920;
const COMPRESSION_QUALITY = 0.7;

export function useImageCompressor(): UseImageCompressorResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compressImage = useCallback(async (uri: string): Promise<CompressionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Resize to max dimensions while maintaining aspect ratio
      // Only resize width - height auto-calculated to maintain aspect ratio
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: MAX_WIDTH,
              // Height auto-calculated to maintain aspect ratio
            },
          },
        ],
        {
          compress: COMPRESSION_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setLoading(false);
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compress image';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  return { compressImage, loading, error };
}
