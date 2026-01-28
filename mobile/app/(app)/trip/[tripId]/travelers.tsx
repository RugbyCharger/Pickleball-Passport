import React from 'react';
import { View, Text, FlatList, Switch, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { TravelerCard } from '@/components/trip/TravelerCard';

export default function TravelersScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const utils = trpc.useUtils();

  // Get trip details to find user's booking
  const { data: trip } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Get user's booking to check/update visibility
  const { data: booking } = trpc.booking.getById.useQuery(
    { bookingId: trip?.userBookingId! },
    { enabled: !!trip?.userBookingId }
  );

  // Get fellow travelers (only works if user has opted in)
  const {
    data: travelers,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = trpc.trip.getFellowTravelers.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId && !!booking?.showInTravelersList }
  );

  // Toggle visibility mutation
  const toggleVisibility = trpc.booking.updateTravelerVisibility.useMutation({
    onSuccess: () => {
      utils.booking.getById.invalidate();
      utils.trip.getFellowTravelers.invalidate();
    },
  });

  const handleToggleVisibility = (value: boolean) => {
    if (!trip?.userBookingId) return;
    toggleVisibility.mutate({
      bookingId: trip.userBookingId,
      showInTravelersList: value,
    });
  };

  const isOptedIn = booking?.showInTravelersList ?? false;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      {/* Visibility Toggle */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {isOptedIn ? (
              <Eye size={20} color="#059669" />
            ) : (
              <EyeOff size={20} color="#9CA3AF" />
            )}
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-medium">Show me to others</Text>
              <Text className="text-gray-500 text-sm">
                {isOptedIn
                  ? 'Other travelers can see your name'
                  : 'You are hidden from the travelers list'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOptedIn}
            onValueChange={handleToggleVisibility}
            trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            thumbColor="white"
            disabled={toggleVisibility.isPending}
          />
        </View>
      </View>

      {/* Content */}
      {!isOptedIn ? (
        <View className="flex-1 items-center justify-center p-8">
          <Users size={64} color="#D1D5DB" />
          <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
            Opt in to see fellow travelers
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Toggle the switch above to share your name and see who else is on your trip
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-red-500 text-center">{error.message}</Text>
        </View>
      ) : !travelers || travelers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Users size={64} color="#D1D5DB" />
          <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
            No travelers yet
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            You're the first to opt in! Others will appear here when they join.
          </Text>
        </View>
      ) : (
        <FlatList
          data={travelers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TravelerCard
              firstName={item.firstName}
              lastName={item.lastName}
              profileImageUrl={item.profileImageUrl}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </SafeAreaView>
  );
}
