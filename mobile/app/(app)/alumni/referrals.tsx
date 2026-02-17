import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { trpc } from '../../../lib/api';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';
import { ReferralShareButton } from '../../../components/alumni/ReferralShareButton';
import { ReferralStatusList } from '../../../components/alumni/ReferralStatusList';

/**
 * Referrals screen - allows alumni to share referral links and track referrals.
 *
 * Features:
 * - Stats cards showing referral counts and points
 * - Referral code display
 * - Share button using native share sheet
 * - Copy link button
 * - How it works section
 * - List of referrals with status
 */
export default function ReferralsScreen() {
  const { isAlumni, isLoading: statusLoading } = useAlumniStatus();
  const [refreshing, setRefreshing] = useState(false);
  const utils = trpc.useUtils();

  // Get user's profile for referral code generation
  const { data: user } = trpc.user.me.useQuery();

  // Generate referral code from first name
  const referralCode = user?.guestProfile?.firstName
    ? `${user.guestProfile.firstName.toUpperCase()}-2026`
    : 'ALUMNI-2026';

  // Get referrals - using optional chaining for safety since referral router may not exist yet
  const { data: referrals, refetch } = trpc.referral?.myReferrals?.useQuery?.() ?? {
    data: [],
    refetch: async () => {},
  };

  // Calculate stats
  const totalReferrals = referrals?.length ?? 0;
  const completedReferrals =
    referrals?.filter((r: any) => r.status === 'COMPLETED').length ?? 0;
  const totalPoints =
    referrals?.reduce((sum: number, r: any) => sum + (r.pointsEarned ?? 0), 0) ??
    0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      utils.user.me.invalidate(),
      refetch?.(),
    ]);
    setRefreshing(false);
  };

  if (statusLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!isAlumni) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-4xl mb-4">🎁</Text>
        <Text className="text-xl font-bold text-gray-900 text-center">
          Referral Program
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Complete your first trip to unlock the referral program and earn
          rewards!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">Earn Rewards</Text>
        <Text className="text-purple-200 mt-1">
          Share your love of The Pickleball Passport
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-4 -mt-4 mb-4">
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mr-2">
          <Text className="text-2xl font-bold text-purple-600">
            {totalReferrals}
          </Text>
          <Text className="text-gray-500 text-xs">Total Referrals</Text>
        </View>
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 mx-2">
          <Text className="text-2xl font-bold text-green-600">
            {completedReferrals}
          </Text>
          <Text className="text-gray-500 text-xs">Completed</Text>
        </View>
        <View className="bg-white rounded-xl p-4 shadow-sm flex-1 ml-2">
          <Text className="text-2xl font-bold text-yellow-600">
            {totalPoints}
          </Text>
          <Text className="text-gray-500 text-xs">Points Earned</Text>
        </View>
      </View>

      {/* Referral Code */}
      <View className="mx-4 mb-4 bg-white p-4 rounded-xl shadow-sm">
        <Text className="text-gray-500 text-sm">Your Referral Code</Text>
        <Text className="text-2xl font-bold text-purple-600 mt-1">
          {referralCode}
        </Text>
      </View>

      {/* Share Button */}
      <View className="mx-4 mb-6">
        <ReferralShareButton
          referralCode={referralCode}
          userName={user?.guestProfile?.firstName ?? 'Friend'}
        />
      </View>

      {/* How It Works */}
      <View className="mx-4 mb-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
        <Text className="text-purple-800 font-semibold mb-2">How It Works</Text>
        <Text className="text-purple-600 text-sm">
          1. Share your unique referral link{'\n'}
          2. Friend books a trip using your code{'\n'}
          3. You earn points when they complete their trip{'\n'}
          4. Redeem points for discounts on your next adventure!
        </Text>
      </View>

      {/* Referral List */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Your Referrals
        </Text>
        <ReferralStatusList referrals={referrals ?? []} />
      </View>
    </ScrollView>
  );
}
