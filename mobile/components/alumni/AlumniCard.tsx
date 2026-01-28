import { View, Text, TouchableOpacity } from 'react-native';

interface AlumniCardProps {
  firstName?: string;
  lastName?: string;
  email: string;
  bio?: string;
  tripsCompleted: number;
  onPress?: () => void;
}

export function AlumniCard({ firstName, lastName, email, bio, tripsCompleted, onPress }: AlumniCardProps) {
  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : firstName ?? email.split('@')[0];

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : displayName[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="bg-white rounded-xl p-4 shadow-sm flex-row items-center mb-3"
    >
      <View className="w-12 h-12 bg-purple-200 rounded-full items-center justify-center">
        <Text className="text-purple-700 font-bold text-lg">{initials.toUpperCase()}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-semibold text-gray-900">{displayName}</Text>
        {bio && (
          <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
            {bio}
          </Text>
        )}
        <Text className="text-purple-600 text-xs mt-1">
          {tripsCompleted} trip{tripsCompleted !== 1 ? 's' : ''} completed
        </Text>
      </View>
    </TouchableOpacity>
  );
}
