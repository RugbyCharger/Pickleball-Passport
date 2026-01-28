import { View, Text } from 'react-native';
import { useHasPendingMutations } from '@/lib/offline';
import { Cloud } from 'lucide-react-native';

export function PendingMutationsIndicator() {
  const hasPending = useHasPendingMutations();

  if (!hasPending) return null;

  return (
    <View className="flex-row items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
      <Cloud size={14} color="#3b82f6" />
      <Text className="text-blue-600 text-xs">Syncing...</Text>
    </View>
  );
}
