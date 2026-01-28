import { View } from 'react-native';
import { PassportStampBadge } from './PassportStampBadge';

interface Stamp {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isEarned: boolean;
  earnedAt?: string;
}

interface StampGridProps {
  stamps: Stamp[];
}

export function StampGrid({ stamps }: StampGridProps) {
  // Sort: earned first, then by category
  const sortedStamps = [...stamps].sort((a, b) => {
    if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
    return a.category.localeCompare(b.category);
  });

  return (
    <View className="flex-row flex-wrap justify-between">
      {sortedStamps.map((stamp) => (
        <View key={stamp.id} style={{ width: '48%' }} className="mb-3">
          <PassportStampBadge
            name={stamp.name}
            description={stamp.description}
            category={stamp.category}
            isEarned={stamp.isEarned}
            earnedAt={stamp.earnedAt}
          />
        </View>
      ))}
    </View>
  );
}
