/**
 * Photo Card Component
 *
 * Displays a photo in a grid layout with optional caption and delete button.
 * Used in both group gallery and personal journal screens.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { trpc } from '../../lib/api';

interface TripPhoto {
  id: string;
  tripId: string;
  uploadedBy: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  uploadedAt: Date | string;
}

interface PhotoCardProps {
  photo: TripPhoto;
  tripId: string;
  onPress?: () => void;
  showDelete?: boolean;
  size?: 'small' | 'medium';
}

export function PhotoCard({
  photo,
  tripId,
  onPress,
  showDelete = false,
  size = 'small',
}: PhotoCardProps) {
  const utils = trpc.useUtils();

  const deletePhoto = trpc.photo.delete.useMutation({
    onSuccess: () => {
      utils.photo.list.invalidate({ tripId });
      utils.photo.listMine.invalidate({ tripId });
      Alert.alert('Deleted', 'Photo has been removed');
    },
    onError: (error: { message?: string }) => {
      Alert.alert('Error', error.message || 'Failed to delete photo');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePhoto.mutate({ photoId: photo.id }),
        },
      ]
    );
  };

  // Use thumbnail if available, otherwise use full URL
  const imageUri = photo.thumbnailUrl || photo.fileUrl;

  // Size classes for different grid layouts
  const sizeClasses = size === 'small' ? 'aspect-square' : 'aspect-[4/3]';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="relative"
      disabled={!onPress}
    >
      <Image
        source={{ uri: imageUri }}
        className={`w-full ${sizeClasses} rounded-lg bg-gray-200`}
        resizeMode="cover"
      />

      {/* Caption overlay */}
      {photo.caption && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 rounded-b-lg">
          <Text
            className="text-white text-xs"
            numberOfLines={2}
          >
            {photo.caption}
          </Text>
        </View>
      )}

      {/* Delete button */}
      {showDelete && (
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deletePhoto.isPending}
          className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5"
        >
          {deletePhoto.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Trash2 size={16} color="white" />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
