import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { MapPin, Calendar } from 'lucide-react-native';

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

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#065f46'; // emerald-800
      case 'PENDING':
        return '#92400e'; // yellow-800
      case 'CANCELLED':
        return '#991b1b'; // red-800
      case 'COMPLETED':
        return '#1e40af'; // blue-800
      default:
        return '#1f2937'; // gray-800
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Navigate to trip overview for confirmed trips, otherwise to booking details
  const handlePress = () => {
    if (booking.trip && (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')) {
      router.push(`/trip/${booking.trip.id}`);
    } else {
      router.push(`/(app)/booking/${booking.id}`);
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
          {booking.package.name}
        </Text>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusTextColor(booking.status) }}
          >
            {booking.status}
          </Text>
        </View>
      </View>

      {booking.trip && (
        <View className="mb-2">
          <View className="flex-row items-center mb-1">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 ml-1">
              {booking.trip.destination}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-1">
              {format(new Date(booking.trip.startDate), 'MMM d')} -{' '}
              {format(new Date(booking.trip.endDate), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <Text className="text-gray-500 text-sm">
          Ref: {booking.bookingReference}
        </Text>
        <Text className="text-emerald-600 font-semibold">
          {formatPrice(booking.totalPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
