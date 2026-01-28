import { View, Text } from 'react-native';

interface MetricsProps {
  totalActivities: number;
  photosUploaded: number;
  daysOnTrip: number;
  pickleballSessions: number;
}

/**
 * Displays transformation journey metrics in a horizontal card layout.
 *
 * Shows key stats from the user's trip: days, activities, photos, and pickleball sessions.
 */
export function TransformationMetrics({
  totalActivities,
  photosUploaded,
  daysOnTrip,
  pickleballSessions,
}: MetricsProps) {
  const metrics = [
    { label: 'Days', value: daysOnTrip, icon: '📅' },
    { label: 'Activities', value: totalActivities, icon: '🎯' },
    { label: 'Photos', value: photosUploaded, icon: '📸' },
    { label: 'Pickleball', value: pickleballSessions, icon: '🏓' },
  ];

  return (
    <View className="flex-row justify-between px-4 py-6 bg-white rounded-xl mx-4 shadow-sm">
      {metrics.map((m) => (
        <View key={m.label} className="items-center flex-1">
          <Text className="text-2xl mb-1">{m.icon}</Text>
          <Text className="text-2xl font-bold text-gray-900">{m.value}</Text>
          <Text className="text-xs text-gray-500 mt-1">{m.label}</Text>
        </View>
      ))}
    </View>
  );
}
