/**
 * Partner Dashboard
 * P1-S1: Partner Dashboard (5 pts)
 *
 * Features:
 * - Referral statistics and conversion tracking
 * - Points earned and current tier display
 * - Referral code sharing tools
 * - Tier progress visualization
 * - Individual referral details
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import {
  Users,
  TrendingUp,
  Award,
  DollarSign,
  Copy,
  Check,
  Loader2,
  Trophy,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const TIER_COLORS = {
  BRONZE: 'bg-amber-700 text-white',
  SILVER: 'bg-slate-400 text-white',
  GOLD: 'bg-yellow-500 text-white',
  PLATINUM: 'bg-purple-600 text-white',
};

const TIER_RING_COLORS = {
  BRONZE: 'text-amber-700',
  SILVER: 'text-slate-400',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-purple-600',
};

export default function PartnerDashboardPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch partner profile and stats
  const { data: profile, isLoading: profileLoading } =
    trpc.partner.getMyProfile.useQuery();
  const { data: stats, isLoading: statsLoading } =
    trpc.partner.getDashboardStats.useQuery();
  const { data: tierInfo, isLoading: tierLoading } =
    trpc.partner.getTierInfo.useQuery();
  const { data: referrals, isLoading: referralsLoading } =
    trpc.partner.getMyReferrals.useQuery();

  const handleCopyCode = async () => {
    if (profile?.referralCode) {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const isLoading = profileLoading || statsLoading || tierLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile || !stats || !tierInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Partner profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Partner Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome back, {profile.clubName}! Track your referrals and grow your rewards.
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="mb-8 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Your Referral Code</h2>
              <p className="mt-1 text-sm text-slate-600">
                Share this code with your club members to earn rewards
              </p>
              <div className="mt-4 flex items-center gap-3">
                <code className="rounded-lg bg-white px-4 py-3 text-2xl font-bold tracking-wide text-emerald-600">
                  {profile.referralCode}
                </code>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="gap-2"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="rounded-full bg-emerald-100 p-4">
                <Users className="h-12 w-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Referrals */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Referrals</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.totalReferrals}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {stats.confirmedReferrals} confirmed
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.conversionRate}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {stats.pendingReferrals} pending
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Points Earned */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Points</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.currentPoints.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {stats.totalPointsEarned.toLocaleString()} lifetime
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ${(stats.totalRevenue / 100).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  From confirmed bookings
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Partner Tier</h2>
                <p className="text-sm text-slate-600">Track your progress to the next level</p>
              </div>
            </div>
            <div
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold',
                TIER_COLORS[stats.currentTier]
              )}
            >
              {stats.currentTier}
            </div>
          </div>

          {/* Progress Bar */}
          {stats.nextTier ? (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Progress to {stats.nextTier}
                </span>
                <span className="text-slate-600">
                  {stats.currentPoints.toLocaleString()} /{' '}
                  {tierInfo.thresholds[stats.nextTier].toLocaleString()} points
                </span>
              </div>
              <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${stats.tierProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-600">
                    {stats.pointsToNextTier.toLocaleString()} points to go!
                  </span>
                </div>
                <span className="text-slate-500">{stats.tierProgress}% complete</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <Trophy className="mx-auto h-12 w-12 text-purple-600 mb-2" />
              <p className="font-semibold text-purple-900">
                Congratulations! You've reached the highest tier!
              </p>
              <p className="mt-1 text-sm text-purple-700">
                Keep earning points to maintain your PLATINUM status
              </p>
            </div>
          )}

          {/* Current Tier Benefits */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Your {stats.currentTier} Benefits
            </h3>
            <ul className="space-y-2">
              {tierInfo.currentBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Tier Benefits Preview */}
          {stats.nextTier && tierInfo.nextTierBenefits && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <ArrowRight className="h-4 w-4" />
                Unlock at {stats.nextTier}
              </h3>
              <ul className="space-y-2">
                {tierInfo.nextTierBenefits.slice(0, 3).map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                    <Trophy className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recent Referrals */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Referrals</h2>
          </div>

          {referralsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : referrals && referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-6 py-3">Guest</th>
                    <th className="px-6 py-3">Package</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Points</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {referrals.slice(0, 10).map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{referral.guestName}</p>
                          <p className="text-sm text-slate-500">{referral.bookingReference}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {referral.packageName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            referral.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : referral.status === 'PENDING_PAYMENT'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {referral.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        ${(referral.totalPrice / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">
                          +{referral.pointsEarned}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No referrals yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Start sharing your referral code to earn rewards!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
