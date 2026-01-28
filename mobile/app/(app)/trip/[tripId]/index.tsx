import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Calendar,
  CalendarDays,
  MessageSquare,
  Users,
  Car,
  Camera,
  BookOpen,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../../../lib/api';
import { useCountdown } from '../../../../hooks/useCountdown';
import { CountdownTimer } from '../../../../components/trip/CountdownTimer';
import { ChecklistItem } from '../../../../components/trip/ChecklistItem';
import { PassportUpload } from '../../../../components/trip/PassportUpload';
import { SOSButton } from '../../../../components/sos/SOSButton';
import { SOSModal } from '../../../../components/sos/SOSModal';
import { NotificationPrompt } from '../../../../components/NotificationPrompt';

// Feature card for during-trip navigation
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function FeatureCard({ icon, title, subtitle, onPress }: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg p-4 shadow-sm w-[48%] mb-3 active:bg-gray-50"
    >
      <View className="mb-2">{icon}</View>
      <Text className="text-gray-800 font-semibold">{title}</Text>
      <Text className="text-gray-500 text-sm">{subtitle}</Text>
    </Pressable>
  );
}

export default function TripOverviewScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const utils = trpc.useUtils();
  const [sosModalVisible, setSOSModalVisible] = useState(false);

  // Fetch trip details
  const {
    data: trip,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Fetch passport document for this booking
  const { data: documents } = trpc.document.list.useQuery(
    { bookingId: trip?.userBookingId, type: 'PASSPORT' },
    { enabled: !!trip?.userBookingId }
  );

  // Fetch checklist status for this booking (persisted state)
  const { data: checklistData } = trpc.checklist.getChecklistStatus.useQuery(
    { bookingId: trip?.userBookingId! },
    { enabled: !!trip?.userBookingId }
  );

  // Mutation to toggle checklist items
  const toggleChecklist = trpc.checklist.toggleChecklistItem.useMutation({
    onSuccess: () => {
      utils.checklist.getChecklistStatus.invalidate({ bookingId: trip?.userBookingId! });
    },
  });

  // Helper to get completion state for an item key
  const isItemComplete = (itemKey: string) => {
    return checklistData?.items?.find((item: { key: string; isComplete: boolean }) => item.key === itemKey)?.isComplete ?? false;
  };

  // Handler to toggle an item
  const handleToggleItem = (itemKey: string) => {
    if (!trip?.userBookingId) return;
    toggleChecklist.mutate({
      bookingId: trip.userBookingId,
      itemKey,
      isComplete: !isItemComplete(itemKey),
    });
  };

  const passportDoc = documents?.[0];
  const countdown = useCountdown(trip?.startDate);

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading trip details...</Text>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Trip not found</Text>
      </SafeAreaView>
    );
  }

  const navigateTo = (screen: string) => {
    router.push(`/trip/${tripId}/${screen}` as const);
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Notification Permission Prompt */}
        <NotificationPrompt />

        {/* Trip Header */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800">{trip.name}</Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{trip.destination}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Calendar size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">
              {new Date(trip.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })} - {new Date(trip.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Countdown Timer */}
        <View className="mb-4">
          <CountdownTimer {...countdown} />
        </View>

        {/* Pre-Trip Checklist */}
        <View className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-800">Pre-Trip Checklist</Text>
            {checklistData?.progress && (
              <Text className="text-gray-500 text-sm mt-1">
                {checklistData.progress.completed} of {checklistData.progress.total} completed
              </Text>
            )}
          </View>

          {/* Passport Upload */}
          <View className="p-4 border-b border-gray-100">
            <Text className="text-sm font-medium text-gray-700 mb-2">Passport</Text>
            <PassportUpload
              bookingId={trip.userBookingId}
              existingDocument={passportDoc}
            />
          </View>

          {/* Other Checklist Items - state persisted via tRPC */}
          <ChecklistItem
            title="Review Itinerary"
            description="See your daily schedule"
            isComplete={isItemComplete('itinerary_reviewed')}
            onPress={() => {
              handleToggleItem('itinerary_reviewed');
              navigateTo('itinerary');
            }}
            showChevron
          />
          <ChecklistItem
            title="Pack Your Bags"
            description="View recommended packing list"
            isComplete={isItemComplete('packing_complete')}
            onPress={() => {
              handleToggleItem('packing_complete');
              navigateTo('packing');
            }}
            showChevron
          />
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-800">Quick Access</Text>
          </View>

          <ChecklistItem
            title="Fellow Travelers"
            description="Connect with your group"
            isComplete={false}
            onPress={() => navigateTo('travelers')}
            showChevron
          />
          <ChecklistItem
            title="Group Chat"
            description="Message your trip group"
            isComplete={false}
            onPress={() => navigateTo('chat')}
            showChevron
          />
        </View>

        {/* During Your Trip Features */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">During Your Trip</Text>
          <View className="flex-row flex-wrap justify-between">
            <FeatureCard
              icon={<CalendarDays size={24} color="#059669" />}
              title="Itinerary"
              subtitle="View daily activities"
              onPress={() => navigateTo('itinerary')}
            />
            <FeatureCard
              icon={<MessageSquare size={24} color="#059669" />}
              title="Concierge"
              subtitle="24/7 support"
              onPress={() => navigateTo('concierge')}
            />
            <FeatureCard
              icon={<Ionicons name="tennisball" size={24} color="#059669" />}
              title="Book Courts"
              subtitle="Reserve pickleball time"
              onPress={() => navigateTo('courts')}
            />
            <FeatureCard
              icon={<Users size={24} color="#059669" />}
              title="Find Players"
              subtitle="Connect with guests"
              onPress={() => navigateTo('players')}
            />
            <FeatureCard
              icon={<Car size={24} color="#059669" />}
              title="Transportation"
              subtitle="Request a ride"
              onPress={() => navigateTo('transport')}
            />
            <FeatureCard
              icon={<Camera size={24} color="#059669" />}
              title="Photo Gallery"
              subtitle="Trip memories"
              onPress={() => navigateTo('photos')}
            />
            <FeatureCard
              icon={<BookOpen size={24} color="#059669" />}
              title="My Journal"
              subtitle="Your photos"
              onPress={() => navigateTo('journal')}
            />
          </View>
        </View>

        {/* Spacer to prevent SOS button overlap */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating SOS Button */}
      <View className="absolute bottom-6 right-6">
        <SOSButton onPress={() => setSOSModalVisible(true)} />
      </View>

      {/* SOS Modal */}
      <SOSModal
        visible={sosModalVisible}
        tripId={tripId!}
        onClose={() => setSOSModalVisible(false)}
        onSuccess={() => {
          setSOSModalVisible(false);
          Alert.alert(
            'SOS Sent',
            'Our team has been notified and will contact you shortly.',
            [{ text: 'OK' }]
          );
        }}
      />
    </SafeAreaView>
  );
}
