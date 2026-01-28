import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookings
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            View and manage your trips
          </Text>
        </View>

        {/* Placeholder empty state */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 items-center shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Bookings Yet
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            Your confirmed bookings will appear here. Start by exploring our destinations!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
