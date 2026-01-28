/**
 * Photo Upload Component
 *
 * Allows users to pick, compress, and upload photos to their trip journal.
 * - Image picker (camera or gallery)
 * - Automatic compression via useImageCompressor
 * - Optional caption input
 * - Offline check (disabled when offline)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X, Upload } from 'lucide-react-native';
import { trpc } from '../../lib/api';
import { useImageCompressor } from '../../hooks/useImageCompressor';
import { useNetworkStatus } from '../../lib/offline';

interface PhotoUploadProps {
  tripId: string;
  onUploadComplete?: () => void;
}

export function PhotoUpload({ tripId, onUploadComplete }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { compressImage, loading: compressing } = useImageCompressor();
  const { isConnected } = useNetworkStatus();
  const utils = trpc.useUtils();

  const uploadPhoto = trpc.photo.upload.useMutation({
    onSuccess: () => {
      utils.photo.list.invalidate({ tripId });
      utils.photo.listMine.invalidate({ tripId });
      onUploadComplete?.();
      resetState();
      Alert.alert('Success', 'Photo uploaded successfully');
    },
    onError: (error: { message?: string }) => {
      Alert.alert('Upload Failed', error.message || 'Please try again');
    },
  });

  const resetState = () => {
    setPreviewUri(null);
    setCaption('');
    setShowPreview(false);
    setIsUploading(false);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async (useCamera: boolean) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1, // Full quality - compression happens later
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];

      // Compress the image
      const compressed = await compressImage(asset.uri);
      if (compressed) {
        setPreviewUri(compressed.uri);
        setShowPreview(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const showUploadOptions = () => {
    Alert.alert('Add Photo', 'Choose how to add your photo', [
      { text: 'Take Photo', onPress: () => handlePickImage(true) },
      { text: 'Choose from Gallery', onPress: () => handlePickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUpload = async () => {
    if (!previewUri) return;

    setIsUploading(true);
    try {
      // v2.0 SCOPE NOTE: Actual Supabase Storage upload is deferred.
      // For MVP, we store the local URI. Full cloud upload will be
      // implemented post-v2.0 when offline mutation queue is added.
      await uploadPhoto.mutateAsync({
        tripId,
        fileUrl: previewUri,
        caption: caption.trim() || undefined,
      });
    } catch {
      // Error handled in mutation onError
    } finally {
      setIsUploading(false);
    }
  };

  // Offline state - show disabled button with message
  if (!isConnected) {
    return (
      <View className="border-2 border-dashed border-gray-200 rounded-lg p-6 items-center bg-gray-100">
        <ImagePlus size={40} color="#9CA3AF" />
        <Text className="text-gray-400 font-medium mt-3">Upload requires internet</Text>
        <Text className="text-gray-400 text-sm mt-1">Photos will be available when you reconnect</Text>
      </View>
    );
  }

  return (
    <>
      {/* Add Photo Button */}
      <TouchableOpacity
        onPress={showUploadOptions}
        disabled={compressing}
        className="border-2 border-dashed border-emerald-300 rounded-lg p-6 items-center bg-emerald-50"
      >
        {compressing ? (
          <>
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-emerald-600 font-medium mt-3">Compressing...</Text>
          </>
        ) : (
          <>
            <Camera size={40} color="#059669" />
            <Text className="text-emerald-600 font-medium mt-3">Add Photo</Text>
            <Text className="text-emerald-500 text-sm mt-1">Tap to capture or choose</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetState}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-white"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={resetState} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">New Photo</Text>
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isUploading}
              className="p-2"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Upload size={24} color="#059669" />
              )}
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <View className="flex-1 p-4">
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                className="w-full aspect-[4/3] rounded-lg"
                resizeMode="cover"
              />
            )}

            {/* Caption Input */}
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Caption (optional)</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption to your photo..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 min-h-[80px]"
                textAlignVertical="top"
              />
              <Text className="text-xs text-gray-400 mt-1 text-right">
                {caption.length}/500
              </Text>
            </View>
          </View>

          {/* Upload Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleUpload}
              disabled={isUploading}
              className={`py-3 rounded-lg items-center ${
                isUploading ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Upload Photo</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
