import React from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Eye, EyeOff, User, Send } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
}

function PlayerCard({ traveler, tripName }: { traveler: Traveler; tripName: string }) {
  const initials = `${traveler.firstName?.[0] || ''}${traveler.lastName?.[0] || ''}`.toUpperCase();

  const handleInviteToPlay = async () => {
    try {
      await Share.share({
        message: `Hey ${traveler.firstName}! Want to play some pickleball? I'm on the ${tripName} trip and would love to have a match!`,
      });
    } catch {
      // User cancelled sharing
    }
  };

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
      {traveler.profileImageUrl ? (
        <Image
          source={{ uri: traveler.profileImageUrl }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
          {initials ? (
            <Text className="text-emerald-700 font-semibold text-lg">{initials}</Text>
          ) : (
            <User size={24} color="#059669" />
          )}
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-gray-800 font-medium text-base">
          {traveler.firstName} {traveler.lastName}
        </Text>
        <Text className="text-gray-500 text-sm">Fellow Traveler</Text>
      </View>
      <TouchableOpacity
        onPress={handleInviteToPlay}
        className="bg-emerald-600 rounded-lg px-3 py-2 flex-row items-center"
      >
        <Send size={16} color="white" />
        <Text className="text-white font-medium ml-1 text-sm">Invite</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlayersScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const utils = trpc.useUtils();

  // Get trip details to find user's booking and trip name
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
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Find Players</Text>
        <Text className="text-gray-500 text-sm mt-1">Connect with other guests on your trip</Text>
      </View>

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
                  ? 'Other travelers can see you and invite you to play'
                  : 'You are hidden from the players list'}
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
            Opt in to find players
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Toggle the switch above to see fellow travelers and invite them to play pickleball
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
            No players available yet
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
            <PlayerCard traveler={item as Traveler} tripName={trip?.name || 'trip'} />
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
