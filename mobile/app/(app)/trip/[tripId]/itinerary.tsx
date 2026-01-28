import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useOfflineItinerary } from '@/hooks/useOfflineItinerary';
import { useNetworkStatus } from '@/lib/offline';
import { ActivityCard } from '@/components/trip/ActivityCard';

interface Activity {
  id: string;
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  type: string;
}

interface Day {
  id: string;
  dayNumber: number;
  title: string;
  itineraryActivities: Activity[];
}

interface DaySectionProps {
  day: Day;
  isExpanded: boolean;
  onToggle: () => void;
  checkedInActivityIds: Set<string>;
  tripStartDate: Date | null;
  onCheckIn: (activityId: string) => void;
  isCheckingIn: boolean;
  checkingInActivityId: string | null;
}

function DaySection({
  day,
  isExpanded,
  onToggle,
  checkedInActivityIds,
  tripStartDate,
  onCheckIn,
  isCheckingIn,
  checkingInActivityId,
}: DaySectionProps) {
  // Calculate if this day is today or in the past (can check in)
  const canCheckInForDay = useMemo(() => {
    if (!tripStartDate) return false;
    const dayDate = new Date(tripStartDate);
    dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dayDate <= today;
  }, [tripStartDate, day.dayNumber]);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={onToggle}
        className="bg-emerald-600 rounded-t-lg p-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="bg-white rounded-full w-8 h-8 items-center justify-center mr-3">
            <Text className="text-emerald-600 font-bold">{day.dayNumber}</Text>
          </View>
          <Text className="text-white font-semibold text-lg">{day.title}</Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={24} color="white" />
        ) : (
          <ChevronDown size={24} color="white" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="bg-gray-50 rounded-b-lg p-3">
          {day.itineraryActivities.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No activities scheduled</Text>
          ) : (
            day.itineraryActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCheckedIn={checkedInActivityIds.has(activity.id)}
                canCheckIn={canCheckInForDay && !checkedInActivityIds.has(activity.id)}
                onCheckIn={() => onCheckIn(activity.id)}
                isCheckingIn={isCheckingIn && checkingInActivityId === activity.id}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function ItineraryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [checkingInActivityId, setCheckingInActivityId] = useState<string | null>(null);
  const { isConnected } = useNetworkStatus();
  const utils = trpc.useUtils();

  // Get trip details to find package and start date
  const { data: trip } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Get booking to find package and duration
  const { data: bookings } = trpc.booking.list.useQuery(undefined, {
    enabled: !!trip,
  });

  // Find the user's booking for this trip
  const userBooking = bookings?.find(
    (b: { trip?: { id: string } }) => b.trip?.id === tripId
  );

  // Get check-ins for this booking
  const { data: checkIns } = trpc.activity.getCheckIns.useQuery(
    { bookingId: userBooking?.id! },
    { enabled: !!userBooking?.id }
  );

  // Create a Set of checked-in activity IDs for quick lookup
  const checkedInActivityIds = useMemo(() => {
    if (!checkIns) return new Set<string>();
    return new Set(checkIns.map((ci: { activityId: string }) => ci.activityId));
  }, [checkIns]);

  // Check-in mutation
  const checkInMutation = trpc.activity.checkIn.useMutation({
    onMutate: () => {
      // Don't set checking state here, it's set in handleCheckIn
    },
    onSuccess: () => {
      utils.activity.getCheckIns.invalidate({ bookingId: userBooking?.id });
      setCheckingInActivityId(null);
    },
    onError: (error: { message?: string }) => {
      setCheckingInActivityId(null);
      Alert.alert('Check-in Failed', error.message || 'Could not check in. Please try again.');
    },
  });

  const handleCheckIn = (activityId: string) => {
    if (!userBooking?.id || !isConnected) {
      Alert.alert('Cannot Check In', 'You must be online to check in to activities.');
      return;
    }
    setCheckingInActivityId(activityId);
    checkInMutation.mutate({
      bookingId: userBooking.id,
      activityId,
    });
  };

  // Get itinerary with offline-first behavior
  const {
    data: itinerary,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useOfflineItinerary({
    packageId: userBooking?.package?.id,
    duration: userBooking?.duration,
  });

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  // Format last updated time
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  // Get trip start date for check-in eligibility calculation
  const tripStartDate = trip?.startDate ? new Date(trip.startDate) : null;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      {/* Offline indicator */}
      <View className={`flex-row items-center justify-between px-4 py-2 ${isConnected ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <View className="flex-row items-center">
          {isConnected ? (
            <Wifi size={16} color="#059669" />
          ) : (
            <WifiOff size={16} color="#D97706" />
          )}
          <Text className={`ml-2 text-sm ${isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isConnected ? 'Online' : 'Offline - viewing cached data'}
          </Text>
        </View>
        {lastUpdated && (
          <Text className="text-gray-500 text-xs">Updated {lastUpdated}</Text>
        )}
      </View>

      {isLoading && !itinerary ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 mt-2">Loading itinerary...</Text>
        </View>
      ) : !itinerary ? (
        <View className="flex-1 items-center justify-center p-8">
          <Calendar size={64} color="#D1D5DB" />
          <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
            No itinerary available
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Your trip itinerary will appear here once it's ready
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              enabled={isConnected}
            />
          }
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Itinerary Header */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-xl font-bold text-gray-800">{itinerary.name}</Text>
            {itinerary.description && (
              <Text className="text-gray-600 mt-2">{itinerary.description}</Text>
            )}
            <View className="flex-row items-center mt-2">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{itinerary.duration} Days</Text>
            </View>
          </View>

          {/* Days */}
          {itinerary.days
            .sort((a: Day, b: Day) => a.dayNumber - b.dayNumber)
            .map((day: Day) => (
              <DaySection
                key={day.id}
                day={day}
                isExpanded={expandedDays.has(day.dayNumber)}
                onToggle={() => toggleDay(day.dayNumber)}
                checkedInActivityIds={checkedInActivityIds as Set<string>}
                tripStartDate={tripStartDate}
                onCheckIn={handleCheckIn}
                isCheckingIn={checkInMutation.isPending}
                checkingInActivityId={checkingInActivityId}
              />
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
