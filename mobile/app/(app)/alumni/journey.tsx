import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTransformationData } from '../../../hooks/useTransformationData';
import { TransformationMetrics } from '../../../components/alumni/TransformationMetrics';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';

/**
 * Journey screen - displays the transformation summary for a completed trip.
 *
 * Shows trip header, metrics (days, activities, photos, pickleball sessions),
 * photo gallery preview, and a reflection prompt.
 */
export default function JourneyScreen() {
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { completedBookings } = useAlumniStatus();

  // Use provided bookingId or first completed booking
  const bookingId = params.bookingId ?? completedBookings[0]?.id ?? '';
  const { booking, trip, photos, metrics, isLoading } =
    useTransformationData(bookingId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-xl font-bold text-gray-900">No Journey Found</Text>
        <Text className="text-gray-500 text-center mt-2">
          Complete a trip to see your transformation journey
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Trip Header */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">
          {trip?.name ?? 'Your Journey'}
        </Text>
        <Text className="text-purple-200 mt-1">
          {trip?.startDate
            ? new Date(trip.startDate).toLocaleDateString()
            : ''}{' '}
          -{' '}
          {trip?.endDate ? new Date(trip.endDate).toLocaleDateString() : ''}
        </Text>
      </View>

      {/* Metrics */}
      <View className="-mt-4 mb-4">
        <TransformationMetrics {...metrics} />
      </View>

      {/* Photo Gallery Preview */}
      {photos.length > 0 && (
        <View className="mt-4">
          <Text className="text-lg font-bold text-gray-900 px-4 mb-3">
            Trip Memories
          </Text>
          <FlatList
            horizontal
            data={photos.slice(0, 10)}
            keyExtractor={(item: any) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }: { item: any }) => (
              <View className="mr-2 rounded-lg overflow-hidden">
                <Image
                  source={{ uri: item.url }}
                  className="w-32 h-32"
                  resizeMode="cover"
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Journey Reflections Prompt */}
      <View className="mx-4 mt-6 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-200">
        <Text className="text-purple-800 font-semibold">
          Reflect on Your Journey
        </Text>
        <Text className="text-purple-600 text-sm mt-2">
          What transformation did you experience? What memories stand out?
          Share your story by submitting a testimonial!
        </Text>
      </View>
    </ScrollView>
  );
}
