import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface JourneySummaryCardProps {
  booking: {
    id: string;
    trip?: {
      name: string;
      startDate: string;
      endDate: string;
      location?: string;
    };
  };
  photosCount: number;
  activitiesCount: number;
}

/**
 * Card component showing a summary of a completed trip.
 *
 * Tappable to navigate to the full journey details screen.
 */
export function JourneySummaryCard({
  booking,
  photosCount,
  activitiesCount,
}: JourneySummaryCardProps) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/alumni/journey?bookingId=${booking.id}`)}
      className="bg-white rounded-xl mx-4 shadow-sm overflow-hidden"
    >
      <View className="h-32 bg-purple-100 items-center justify-center">
        <Text className="text-4xl">🏝️</Text>
      </View>
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900">
          {booking.trip?.name ?? 'Trip'}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {booking.trip?.location ?? 'Thailand'}
        </Text>
        <View className="flex-row mt-3">
          <Text className="text-purple-600 text-sm mr-4">{photosCount} photos</Text>
          <Text className="text-purple-600 text-sm">{activitiesCount} activities</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
