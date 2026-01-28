import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, Upload } from 'lucide-react-native';
import { trpc } from '../../lib/api';

interface PassportUploadProps {
  bookingId: string;
  existingDocument?: { id: string; status: string; fileUrl: string } | null;
  onUploadComplete?: () => void;
}

export function PassportUpload({ bookingId, existingDocument, onUploadComplete }: PassportUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const utils = trpc.useUtils();

  const createDocument = trpc.document.create.useMutation({
    onSuccess: () => {
      utils.document.list.invalidate();
      onUploadComplete?.();
    },
  });

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to upload your passport.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleUpload = async (useCamera: boolean) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 2], // Passport aspect ratio
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 2],
            quality: 0.7,
          });

      if (result.canceled || !result.assets[0]) return;

      setIsUploading(true);
      const asset = result.assets[0];

      // v2.0 SCOPE NOTE: Actual Supabase Storage upload is deferred per REQUIREMENTS.md
      // "Offline mutations — View-only offline mode for v2.0" means we store local URI for now.
      // Full cloud upload will be implemented post-v2.0 when offline mutation queue is added.
      const fileUrl = asset.uri;

      await createDocument.mutateAsync({
        bookingId,
        type: 'PASSPORT',
        fileName: 'passport-scan.jpg',
        fileUrl,
        fileSize: asset.fileSize || 0,
        mimeType: 'image/jpeg',
      });

      Alert.alert('Success', 'Passport uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Please try again');
    } finally {
      setIsUploading(false);
    }
  };

  const showUploadOptions = () => {
    Alert.alert('Upload Passport', 'Choose how to add your passport photo', [
      { text: 'Take Photo', onPress: () => handleUpload(true) },
      { text: 'Choose from Gallery', onPress: () => handleUpload(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (existingDocument) {
    return (
      <View className="bg-green-50 border border-green-200 rounded-lg p-4 flex-row items-center">
        <View className="bg-green-500 rounded-full p-2 mr-3">
          <Check size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-green-800 font-semibold">Passport Uploaded</Text>
          <Text className="text-green-600 text-sm capitalize">
            Status: {existingDocument.status.toLowerCase().replace('_', ' ')}
          </Text>
        </View>
        <TouchableOpacity onPress={showUploadOptions} className="p-2">
          <Upload size={20} color="#059669" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={showUploadOptions}
      disabled={isUploading}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center bg-gray-50"
    >
      {isUploading ? (
        <ActivityIndicator size="large" color="#059669" />
      ) : (
        <>
          <Camera size={48} color="#9CA3AF" />
          <Text className="text-gray-600 font-medium mt-3">Upload Passport</Text>
          <Text className="text-gray-400 text-sm mt-1">Tap to take photo or choose from gallery</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
