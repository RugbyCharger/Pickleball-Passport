import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useOfflineItinerary } from '@/hooks/useOfflineItinerary';
import { useNetworkStatus } from '@/lib/offline';

// Activity type colors matching web app
const ACTIVITY_COLORS: Record<string, { bg: string; text: string }> = {
  PICKLEBALL: { bg: 'bg-green-100', text: 'text-green-700' },
  MEDICAL: { bg: 'bg-red-100', text: 'text-red-700' },
  WELLNESS: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CULTURAL: { bg: 'bg-amber-100', text: 'text-amber-700' },
  MEAL: { bg: 'bg-orange-100', text: 'text-orange-700' },
  FREE_TIME: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

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

function ActivityCard({ activity }: { activity: Activity }) {
  const colors = ACTIVITY_COLORS[activity.type] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <View className="bg-white rounded-lg p-3 mb-2 border border-gray-100">
      <View className="flex-row items-start">
        {activity.time && (
          <View className="mr-3">
            <View className="flex-row items-center">
              <Clock size={14} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">{activity.time}</Text>
            </View>
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`px-2 py-0.5 rounded-full ${colors.bg}`}>
              <Text className={`text-xs font-medium ${colors.text}`}>
                {activity.type.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text className="text-gray-800 font-medium">{activity.title}</Text>
          {activity.description && (
            <Text className="text-gray-600 text-sm mt-1">{activity.description}</Text>
          )}
          {activity.location && (
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">{activity.location}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function DaySection({ day, isExpanded, onToggle }: { day: Day; isExpanded: boolean; onToggle: () => void }) {
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
              <ActivityCard key={activity.id} activity={activity} />
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
  const { isConnected } = useNetworkStatus();

  // Get trip details to find package
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
              />
            ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
