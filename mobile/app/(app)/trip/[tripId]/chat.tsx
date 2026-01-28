import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { TripChat } from '@/components/chat/TripChat';
import { trpc } from '@/lib/trpc';

export default function ChatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  // Verify user has access to this trip
  const { data: trip, isLoading, error } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !trip) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center p-8">
        <MessageCircle size={64} color="#D1D5DB" />
        <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
          Unable to access chat
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          {error?.message || 'You may not have permission to access this trip chat'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white">
      <TripChat tripId={tripId!} />
    </SafeAreaView>
  );
}
