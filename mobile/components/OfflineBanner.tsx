import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/lib/offline';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-amber-500 px-4 py-2">
      <Text className="text-amber-900 text-center text-sm font-medium">
        You're offline. Some features may be limited.
      </Text>
    </View>
  );
}
