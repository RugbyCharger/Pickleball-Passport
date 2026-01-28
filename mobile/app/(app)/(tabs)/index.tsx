import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Welcome to Pickleball Passport
          </Text>
        </View>

        {/* Placeholder content cards */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upcoming Trip
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            No trips scheduled. Book your first adventure!
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quick Actions
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            Browse destinations and packages
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
