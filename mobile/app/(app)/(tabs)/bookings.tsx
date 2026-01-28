import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '../../../lib/api';
import { BookingCard } from '../../../components/BookingCard';
import { useState } from 'react';
import { Calendar } from 'lucide-react-native';

// Booking type from tRPC API
interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  package: {
    name: string;
  };
  trip: {
    id: string;
    startDate: Date | string;
    endDate: Date | string;
    destination: string;
  } | null;
  totalPrice: number;
}

export default function Bookings() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: bookings,
    isLoading,
    refetch,
    error,
  } = trpc.booking.list.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Separate upcoming, pending, and past bookings
  const now = new Date();
  const typedBookings = bookings as Booking[] | undefined;

  const upcomingBookings =
    typedBookings?.filter(
      (b: Booking) =>
        b.trip &&
        new Date(b.trip.startDate) > now &&
        (b.status === 'CONFIRMED' || b.status === 'PENDING')
    ) || [];

  const pendingBookings =
    typedBookings?.filter(
      (b: Booking) => !b.trip && b.status === 'PENDING'
    ) || [];

  const pastBookings =
    typedBookings?.filter(
      (b: Booking) =>
        (b.trip && new Date(b.trip.endDate) < now) || b.status === 'COMPLETED'
    ) || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="p-4 pb-0">
        <Text className="text-2xl font-bold text-gray-900">Bookings</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-500 mt-2">Loading bookings...</Text>
          </View>
        ) : error ? (
          <View className="py-8 items-center bg-red-50 rounded-xl p-4">
            <Text className="text-red-600 font-medium">
              Failed to load bookings
            </Text>
            <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
          </View>
        ) : (
          <>
            {upcomingBookings.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Upcoming ({upcomingBookings.length})
                </Text>
                {upcomingBookings.map((booking: Booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </View>
            )}

            {pendingBookings.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-yellow-700 mb-3">
                  Pending ({pendingBookings.length})
                </Text>
                {pendingBookings.map((booking: Booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </View>
            )}

            {pastBookings.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-600 mb-3">
                  Past Trips ({pastBookings.length})
                </Text>
                {pastBookings.map((booking: Booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </View>
            )}

            {typedBookings?.length === 0 && (
              <View className="py-12 items-center bg-white rounded-xl border border-gray-100">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Calendar size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-500 text-lg">No bookings yet</Text>
                <Text className="text-gray-400 text-sm mt-1 text-center px-4">
                  Your trip bookings will appear here
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
