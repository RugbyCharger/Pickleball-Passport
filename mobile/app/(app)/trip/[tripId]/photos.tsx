/**
 * Group Photo Gallery Screen
 *
 * Displays all photos uploaded by all guests on the trip.
 * 3-column grid layout with pull-to-refresh.
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageOff } from 'lucide-react-native';
import { trpc } from '../../../../lib/api';
import { PhotoCard } from '../../../../components/photos/PhotoCard';

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 4;
const ITEM_WIDTH = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface TripPhoto {
  id: string;
  tripId: string;
  uploadedBy: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  uploadedAt: Date | string;
}

export default function PhotoGalleryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const {
    data: photos,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.photo.list.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  const renderPhoto = ({ item }: { item: TripPhoto }) => (
    <View style={{ width: ITEM_WIDTH, margin: GAP / 2 }}>
      <PhotoCard
        photo={item}
        tripId={tripId!}
        size="small"
        // No delete button in group gallery - users can only delete from their journal
        showDelete={false}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <ImageOff size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        No photos yet
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        Be the first to share! Add photos from your trip journal.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-4">Loading photos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      {/* Header with photo count */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-gray-600">
          {photos?.length || 0} {photos?.length === 1 ? 'photo' : 'photos'} shared
        </Text>
      </View>

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          padding: GAP / 2,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#059669"
          />
        }
        ListEmptyComponent={renderEmptyState}
        // Performance optimizations (per RESEARCH.md pitfall #1)
        removeClippedSubviews
        maxToRenderPerBatch={12}
        windowSize={5}
        initialNumToRender={12}
      />
    </SafeAreaView>
  );
}
