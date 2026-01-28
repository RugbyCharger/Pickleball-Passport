import { View, Text } from 'react-native';

export default function TabOneScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        Tab One
      </Text>
      <View className="my-8 h-px w-4/5 bg-gray-200 dark:bg-gray-700" />
      <Text className="text-sm text-gray-500 dark:text-gray-400 px-4 text-center">
        NativeWind styling is now active. Edit app/(tabs)/index.tsx to see changes.
      </Text>
    </View>
  );
}
