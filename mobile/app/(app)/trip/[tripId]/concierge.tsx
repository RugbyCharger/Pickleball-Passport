import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Headphones } from 'lucide-react-native';
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  OverlayProvider,
} from 'stream-chat-expo';
import { useStreamChatClient } from '@/lib/stream-chat';
import { useNetworkStatus } from '@/lib/offline';
import { trpc } from '@/lib/trpc';

/**
 * 1:1 Concierge Chat Screen
 *
 * Private messaging channel between guest and 24/7 concierge support.
 * Used for non-emergency questions, requests, and assistance.
 */
export default function ConciergeScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { client, isReady, getConciergeChannel } = useStreamChatClient();
  const { isConnected } = useNetworkStatus();
  // Using any for channel state due to stream-chat / stream-chat-expo type mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify user has access to this trip
  const { data: trip, isLoading: tripLoading, error: tripError } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  useEffect(() => {
    if (!isReady || !client || !trip) {
      setIsLoading(true);
      return;
    }

    const initChannel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const conciergeChannel = await getConciergeChannel(tripId!);
        setChannel(conciergeChannel);
      } catch (err) {
        console.error('Failed to initialize concierge channel:', err);
        setError('Unable to connect to concierge. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initChannel();

    return () => {
      // Channel cleanup handled by Stream Chat
    };
  }, [isReady, client, tripId, getConciergeChannel, trip]);

  // Trip loading state
  if (tripLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </SafeAreaView>
    );
  }

  // Trip access error
  if (tripError || !trip) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50 items-center justify-center p-8">
        <Headphones size={64} color="#D1D5DB" />
        <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
          Unable to access concierge
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          {tripError?.message || 'You may not have permission to access this trip'}
        </Text>
      </SafeAreaView>
    );
  }

  // Offline state
  if (!isConnected) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-amber-50 items-center justify-center p-8">
        <Headphones size={64} color="#D97706" />
        <Text className="text-amber-700 font-medium text-lg text-center">
          Concierge requires an internet connection
        </Text>
        <Text className="text-amber-600 text-sm mt-2 text-center">
          Please reconnect to chat with our support team
        </Text>
      </SafeAreaView>
    );
  }

  // Chat loading state
  if (isLoading || !client) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-2">Connecting to concierge...</Text>
      </SafeAreaView>
    );
  }

  // Chat error state
  if (error) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-red-50 items-center justify-center p-8">
        <Headphones size={64} color="#DC2626" />
        <Text className="text-red-700 font-medium text-lg text-center">{error}</Text>
      </SafeAreaView>
    );
  }

  // Channel not ready
  if (!channel) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="small" color="#059669" />
        <Text className="text-gray-500 mt-2">Setting up concierge chat...</Text>
      </SafeAreaView>
    );
  }

  // Type assertions needed due to stream-chat / stream-chat-expo type generics mismatch
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white">
      <OverlayProvider>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Chat client={client as any}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Channel channel={channel as any}>
            <View className="flex-1">
              {/* Welcome banner */}
              <View className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
                <View className="flex-row items-center">
                  <Headphones size={20} color="#059669" />
                  <Text className="text-emerald-700 font-medium ml-2">24/7 Concierge Support</Text>
                </View>
                <Text className="text-emerald-600 text-sm mt-1">
                  Ask anything about your trip - we're here to help!
                </Text>
              </View>
              <MessageList />
              <MessageInput />
            </View>
          </Channel>
        </Chat>
      </OverlayProvider>
    </SafeAreaView>
  );
}
