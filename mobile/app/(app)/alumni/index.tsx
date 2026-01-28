import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';
import { trpc } from '../../../lib/api';

interface FeatureItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

/**
 * Alumni Hub - the main dashboard for alumni features.
 *
 * Shows feature cards for navigation and recent completed trips.
 * Non-alumni users see a placeholder with instructions.
 */
export default function AlumniHub() {
  const { isAlumni, totalTrips, completedBookings, isLoading, refetch } = useAlumniStatus();
  const [refreshing, setRefreshing] = useState(false);
  const utils = trpc.useUtils();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      utils.alumni.getStatus.invalidate(),
      refetch(),
    ]);
    setRefreshing(false);
  };

  if (!isAlumni && !isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-6xl mb-4">🎓</Text>
        <Text className="text-xl font-bold text-gray-900 text-center">
          Welcome Future Alumni!
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Complete your first trip to unlock alumni features
        </Text>
      </View>
    );
  }

  const features: FeatureItem[] = [
    {
      title: 'My Journey',
      subtitle: 'View transformation summary',
      icon: 'map',
      route: '/alumni/journey',
    },
    {
      title: 'Referrals',
      subtitle: 'Share & earn rewards',
      icon: 'gift',
      route: '/alumni/referrals',
    },
    {
      title: 'Alumni Directory',
      subtitle: 'Connect with fellow alumni',
      icon: 'people',
      route: '/alumni/directory',
    },
    {
      title: 'Passport Stamps',
      subtitle: 'View achievements',
      icon: 'ribbon',
      route: '/alumni/stamps',
    },
    {
      title: 'Share Story',
      subtitle: 'Submit testimonial',
      icon: 'chatbubble-ellipses',
      route: '/alumni/testimonial',
    },
    {
      title: 'Book Again',
      subtitle: '10% alumni discount',
      icon: 'airplane',
      route: '/alumni/rebook',
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Stats */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-3xl font-bold">{totalTrips}</Text>
        <Text className="text-purple-200">
          Trip{totalTrips !== 1 ? 's' : ''} Completed
        </Text>
      </View>

      {/* Feature Cards */}
      <View className="px-4 -mt-4">
        <View className="flex-row flex-wrap justify-between">
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.title}
              onPress={() => router.push(feature.route as any)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              style={{ width: '48%' }}
            >
              <Ionicons name={feature.icon} size={28} color="#7c3aed" />
              <Text className="font-semibold text-gray-900 mt-2">
                {feature.title}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                {feature.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Trips */}
      {completedBookings.length > 0 && (
        <View className="mt-4 mb-8">
          <Text className="text-lg font-bold text-gray-900 px-4 mb-3">
            Your Journeys
          </Text>
          {completedBookings.slice(0, 3).map((booking: any) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() =>
                router.push(`/alumni/journey?bookingId=${booking.id}`)
              }
              className="bg-white mx-4 mb-2 p-4 rounded-xl shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                <Text className="text-xl">🏝️</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900">
                  {booking.trip?.name ?? 'Trip'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {booking.trip?.endDate
                    ? new Date(booking.trip.endDate).toLocaleDateString()
                    : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
