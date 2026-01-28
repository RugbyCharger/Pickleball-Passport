import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { trpc } from '../../../lib/api';
import { BookingCard } from '../../../components/BookingCard';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';
import { useState } from 'react';
import { Ticket, ChevronRight, GraduationCap } from 'lucide-react-native';

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

export default function Dashboard() {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const { isAlumni, totalTrips } = useAlumniStatus();

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

  // Get next upcoming booking
  const now = new Date();
  const upcomingBooking = (bookings as Booking[] | undefined)?.find(
    (b: Booking) => b.trip && new Date(b.trip.startDate) > now && b.status === 'CONFIRMED'
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </Text>
          <Text className="text-gray-600 mt-1">Your upcoming adventures</Text>
        </View>

        {/* Alumni Hub Card */}
        {isAlumni && (
          <TouchableOpacity
            onPress={() => router.push('/alumni')}
            className="mb-4 bg-purple-600 p-4 rounded-xl flex-row items-center"
          >
            <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center">
              <GraduationCap size={24} color="white" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold">Alumni Hub</Text>
              <Text className="text-purple-200 text-sm">
                {totalTrips} trip{totalTrips !== 1 ? 's' : ''} completed - View
                benefits
              </Text>
            </View>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        )}

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
        ) : upcomingBooking ? (
          <>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Next Trip
            </Text>
            <BookingCard booking={upcomingBooking} />

            {bookings && bookings.length > 1 && (
              <>
                <Text className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                  Other Bookings ({bookings.length - 1})
                </Text>
                {(bookings as Booking[])
                  .filter((b: Booking) => b.id !== upcomingBooking.id)
                  .slice(0, 3)
                  .map((booking: Booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
              </>
            )}
          </>
        ) : bookings && bookings.length > 0 ? (
          <>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Your Bookings ({bookings.length})
            </Text>
            {(bookings as Booking[]).map((booking: Booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </>
        ) : (
          <View className="py-12 items-center bg-white rounded-xl border border-gray-100">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ticket size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-lg">No bookings yet</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center px-4">
              Book your first pickleball adventure to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
