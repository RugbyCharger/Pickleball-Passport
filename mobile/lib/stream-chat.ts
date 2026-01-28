import { useEffect, useState, useCallback } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { trpc } from './trpc';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || '';

// Singleton chat client
let chatClientInstance: StreamChat | null = null;

function getChatClient(): StreamChat {
  if (!chatClientInstance && STREAM_API_KEY) {
    chatClientInstance = StreamChat.getInstance(STREAM_API_KEY);
  }
  return chatClientInstance as StreamChat;
}

export function useStreamChatClient() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Get Stream token from our backend
  const { data: tokenData } = trpc.chat.getStreamToken.useQuery(undefined, {
    enabled: isSignedIn && !!STREAM_API_KEY,
    staleTime: 1000 * 60 * 55, // Refresh token every 55 mins (tokens expire in 1hr)
  });

  useEffect(() => {
    if (!isSignedIn || !userId || !tokenData?.token || !STREAM_API_KEY) {
      setClient(null);
      setIsReady(false);
      return;
    }

    const chatClient = getChatClient();
    if (!chatClient) {
      return;
    }

    const connectUser = async () => {
      try {
        await chatClient.connectUser(
          {
            id: userId,
            name: user?.fullName || user?.firstName || 'Guest',
            image: user?.imageUrl,
          },
          tokenData.token
        );
        setClient(chatClient);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to connect Stream Chat user:', error);
        setIsReady(false);
      }
    };

    connectUser();

    return () => {
      chatClient.disconnectUser().catch(console.error);
      setClient(null);
      setIsReady(false);
    };
  }, [isSignedIn, userId, tokenData?.token, user]);

  // Hook to get or create a trip channel
  const getTripChannel = useCallback(
    async (tripId: string): Promise<StreamChannel | null> => {
      if (!client) return null;

      const channel = client.channel('messaging', `trip-${tripId}`);

      await channel.watch();
      return channel;
    },
    [client]
  );

  /**
   * Get or create a 1:1 concierge channel for private support.
   *
   * Creates a messaging channel between the current user and the concierge
   * system user. Channel ID is based on trip + user for uniqueness.
   */
  const getConciergeChannel = useCallback(
    async (tripId: string): Promise<StreamChannel | null> => {
      if (!client || !userId) return null;

      // Create 1:1 channel with concierge system user
      // Channel ID format: concierge-{tripId}-{userId} for uniqueness
      // Type assertion needed - Stream Chat SDK types don't include custom data fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channel = client.channel('messaging', `concierge-${tripId}-${userId}`, {
        members: [userId, 'concierge'], // 'concierge' is the system user ID
      } as any);

      await channel.watch();
      return channel;
    },
    [client, userId]
  );

  return { client, isReady, getTripChannel, getConciergeChannel };
}

export { getChatClient };
