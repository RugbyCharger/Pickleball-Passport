import { View, Text } from 'react-native';

interface PassportStampBadgeProps {
  name: string;
  description: string;
  category: string;
  isEarned: boolean;
  earnedAt?: string;
}

// Emoji icons for each category
const categoryEmojis: Record<string, string> = {
  TRIPS: '🏝️',
  REFERRALS: '🎁',
  ENGAGEMENT: '⭐',
  ACHIEVEMENTS: '🏆',
};

export function PassportStampBadge({
  name,
  description,
  category,
  isEarned,
  earnedAt,
}: PassportStampBadgeProps) {
  const emoji = categoryEmojis[category] ?? '🎯';

  return (
    <View
      className={`p-4 rounded-xl ${isEarned ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-100 border-2 border-gray-200'}`}
    >
      <View className="items-center">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${isEarned ? 'bg-purple-200' : 'bg-gray-200'}`}
        >
          <Text className={`text-3xl ${!isEarned && 'opacity-40'}`}>{emoji}</Text>
        </View>
        <Text
          className={`font-bold mt-2 text-center ${isEarned ? 'text-purple-900' : 'text-gray-400'}`}
          numberOfLines={2}
        >
          {name}
        </Text>
        <Text
          className={`text-xs text-center mt-1 ${isEarned ? 'text-purple-600' : 'text-gray-400'}`}
          numberOfLines={2}
        >
          {description}
        </Text>
        {isEarned && earnedAt && (
          <Text className="text-xs text-purple-500 mt-2">
            {new Date(earnedAt).toLocaleDateString()}
          </Text>
        )}
        {!isEarned && (
          <Text className="text-xs text-gray-400 mt-2">Locked</Text>
        )}
      </View>
    </View>
  );
}
