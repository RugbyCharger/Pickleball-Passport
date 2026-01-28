/**
 * Personal Trip Journal Screen
 *
 * Displays only the current user's photos with upload capability.
 * 2-column grid layout with PhotoUpload component at top.
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
import { BookImage } from 'lucide-react-native';
import { trpc } from '../../../../lib/api';
import { PhotoUpload } from '../../../../components/photos/PhotoUpload';
import { PhotoCard } from '../../../../components/photos/PhotoCard';

const NUM_COLUMNS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 8;
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

export default function JournalScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const {
    data: photos,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.photo.listMine.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  const renderPhoto = ({ item }: { item: TripPhoto }) => (
    <View style={{ width: ITEM_WIDTH, margin: GAP / 2 }}>
      <PhotoCard
        photo={item}
        tripId={tripId!}
        size="medium"
        // User can delete their own photos from journal
        showDelete
      />
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 pt-4 pb-2">
      <PhotoUpload tripId={tripId!} />
    </View>
  );

  const renderEmptyState = () => (
    <View className="items-center justify-center p-8">
      <BookImage size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
        Start your journal
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        Capture memories from your trip! Your photos will also appear in the group gallery.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-4">Loading your journal...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        // Performance optimizations
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={8}
      />
    </SafeAreaView>
  );
}
