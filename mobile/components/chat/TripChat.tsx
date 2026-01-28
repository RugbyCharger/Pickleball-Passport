import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  OverlayProvider,
} from 'stream-chat-expo';
import { useStreamChatClient } from '@/lib/stream-chat';
import { useNetworkStatus } from '@/lib/offline';

interface TripChatProps {
  tripId: string;
}

export function TripChat({ tripId }: TripChatProps) {
  const { client, isReady, getTripChannel } = useStreamChatClient();
  const { isConnected } = useNetworkStatus();
  // Using any for channel state due to stream-chat / stream-chat-expo type mismatch
  // Runtime types are compatible; this is a known SDK issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !client) {
      setIsLoading(true);
      return;
    }

    const initChannel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const tripChannel = await getTripChannel(tripId);
        setChannel(tripChannel);
      } catch (err) {
        console.error('Failed to initialize chat channel:', err);
        setError('Unable to connect to chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initChannel();

    return () => {
      // Channel cleanup handled by Stream Chat
    };
  }, [isReady, client, tripId, getTripChannel]);

  if (!isConnected) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-amber-50">
        <Text className="text-amber-700 font-medium text-lg text-center">
          Chat requires an internet connection
        </Text>
        <Text className="text-amber-600 text-sm mt-2 text-center">
          Please reconnect to send and receive messages
        </Text>
      </View>
    );
  }

  if (isLoading || !client) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-gray-500 mt-2">Connecting to chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-red-50">
        <Text className="text-red-700 font-medium text-lg text-center">{error}</Text>
      </View>
    );
  }

  if (!channel) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500">Setting up chat...</Text>
      </View>
    );
  }

  // Type assertions needed due to stream-chat / stream-chat-expo type generics mismatch
  // Runtime compatibility is fine; this is a known SDK typing issue
  return (
    <OverlayProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Chat client={client as any}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Channel channel={channel as any}>
          <View className="flex-1">
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}
