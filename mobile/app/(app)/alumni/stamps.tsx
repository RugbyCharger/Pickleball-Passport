import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { usePassportStamps } from '../../../hooks/usePassportStamps';
import { StampGrid } from '../../../components/alumni/StampGrid';
import { useState } from 'react';

export default function StampsScreen() {
  const { stamps, earnedCount, totalCount, progress, isLoading, refetch } = usePassportStamps();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Progress */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">Passport Stamps</Text>
        <Text className="text-purple-200 mt-1">Collect achievements on your journey</Text>

        {/* Progress Bar */}
        <View className="mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-purple-200 text-sm">Progress</Text>
            <Text className="text-white font-bold">{earnedCount} / {totalCount}</Text>
          </View>
          <View className="bg-purple-400 h-3 rounded-full overflow-hidden">
            <View
              className="bg-white h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      {/* Achievement Stats */}
      <View className="flex-row mx-4 -mt-4 mb-4">
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mr-2 items-center">
          <Text className="text-3xl">🏆</Text>
          <Text className="text-xl font-bold text-purple-600 mt-1">{earnedCount}</Text>
          <Text className="text-gray-500 text-xs">Earned</Text>
        </View>
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2 items-center">
          <Text className="text-3xl">🔒</Text>
          <Text className="text-xl font-bold text-gray-400 mt-1">{totalCount - earnedCount}</Text>
          <Text className="text-gray-500 text-xs">Locked</Text>
        </View>
      </View>

      {/* How to Earn */}
      <View className="mx-4 mb-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
        <Text className="text-purple-800 font-semibold mb-2">How to Earn Stamps</Text>
        <Text className="text-purple-600 text-sm">
          Complete trips, refer friends, share photos, and submit testimonials to unlock achievements!
        </Text>
      </View>

      {/* Stamps Grid */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-gray-900 mb-3">Your Collection</Text>
        <StampGrid stamps={stamps} />
      </View>

      {/* Motivational Footer */}
      {earnedCount < totalCount && (
        <View className="mx-4 mb-8 items-center">
          <Text className="text-gray-500 text-center">
            Keep exploring to unlock all stamps!
          </Text>
        </View>
      )}

      {earnedCount === totalCount && totalCount > 0 && (
        <View className="mx-4 mb-8 bg-yellow-50 p-4 rounded-xl border border-yellow-200 items-center">
          <Text className="text-3xl mb-2">🎉</Text>
          <Text className="text-yellow-800 font-bold text-center">
            Congratulations!
          </Text>
          <Text className="text-yellow-600 text-center text-sm mt-1">
            You've collected all passport stamps!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
