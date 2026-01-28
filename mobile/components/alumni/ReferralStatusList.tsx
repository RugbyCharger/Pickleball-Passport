import { View, Text } from 'react-native';

interface Referral {
  id: string;
  referredUser?: { email: string };
  status: 'CLICKED' | 'APPLIED' | 'BOOKED' | 'COMPLETED';
  pointsEarned: number;
  createdAt: string;
}

interface ReferralStatusListProps {
  referrals: Referral[];
}

const statusColors: Record<string, string> = {
  CLICKED: 'bg-gray-200',
  APPLIED: 'bg-yellow-200',
  BOOKED: 'bg-blue-200',
  COMPLETED: 'bg-green-200',
};

const statusLabels: Record<string, string> = {
  CLICKED: 'Link Clicked',
  APPLIED: 'Applied',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
};

/**
 * List component showing referral statuses with color-coded badges.
 *
 * Displays each referral with their status progression:
 * CLICKED -> APPLIED -> BOOKED -> COMPLETED
 */
export function ReferralStatusList({ referrals }: ReferralStatusListProps) {
  if (referrals.length === 0) {
    return (
      <View className="bg-gray-50 p-6 rounded-xl items-center">
        <Text className="text-gray-500 text-center">
          No referrals yet. Share your link to start earning rewards!
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {referrals.map((referral) => (
        <View key={referral.id} className="bg-white p-4 rounded-xl shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-gray-900">
              {referral.referredUser?.email ?? 'Anonymous'}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${statusColors[referral.status]}`}
            >
              <Text className="text-xs font-medium">
                {statusLabels[referral.status]}
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm mt-2">
            {referral.pointsEarned > 0
              ? `+${referral.pointsEarned} points earned`
              : 'Pending completion'}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            {new Date(referral.createdAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );
}
