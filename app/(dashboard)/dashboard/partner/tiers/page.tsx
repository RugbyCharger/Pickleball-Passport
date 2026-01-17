/**
 * Partner Tiers and Benefits Page
 * E9-S12: Partner Tiers and Benefits
 *
 * Features:
 * - Current tier display with badge
 * - Tier structure table (all 4 tiers)
 * - Benefits comparison
 * - Progress to next tier
 * - How to earn points guide
 */

'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  Trophy,
  Target,
  Award,
  Loader2,
  Check,
  TrendingUp,
  ArrowRight,
  Users,
  Star,
  Gift,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000,
};

const TIER_COLORS = {
  BRONZE: 'bg-amber-700 text-white',
  SILVER: 'bg-slate-400 text-white',
  GOLD: 'bg-yellow-500 text-white',
  PLATINUM: 'bg-purple-600 text-white',
};

const TIER_BG_COLORS = {
  BRONZE: 'bg-amber-50 border-amber-200',
  SILVER: 'bg-slate-50 border-slate-200',
  GOLD: 'bg-yellow-50 border-yellow-200',
  PLATINUM: 'bg-purple-50 border-purple-200',
};

const TIER_ICON_COLORS = {
  BRONZE: 'text-amber-600',
  SILVER: 'text-slate-600',
  GOLD: 'text-yellow-600',
  PLATINUM: 'text-purple-600',
};

const COMMISSION_RATES = {
  BRONZE: '5%',
  SILVER: '7.5%',
  GOLD: '10%',
  PLATINUM: '12.5%',
};

const TIER_BENEFITS = {
  BRONZE: [
    'Basic referral tracking',
    '5% commission on bookings',
    'Monthly partner newsletter',
    'Marketing materials access',
    'Email support',
  ],
  SILVER: [
    'Priority support',
    '7.5% commission on bookings',
    'Quarterly performance reviews',
    'Exclusive partner resources',
    'Training materials',
    'Referral link generator',
  ],
  GOLD: [
    'Dedicated account manager',
    '10% commission on bookings',
    'Co-marketing opportunities',
    'Early access to new packages',
    'Invitation to annual partner summit',
    'Co-branded landing pages',
    'Performance analytics',
  ],
  PLATINUM: [
    'VIP account management',
    '12.5% commission on bookings',
    'Custom partnership packages',
    'Featured partner status',
    'Premium marketing support',
    'Exclusive retreat invitations',
    'Cash payout eligibility',
    'Priority partner events',
  ],
};

export default function PartnerTiersPage() {
  const { data: stats, isLoading: statsLoading } = trpc.partner.getDashboardStats.useQuery();
  const { data: tierInfo, isLoading: tierInfoLoading } = trpc.partner.getTierInfo.useQuery();

  const isLoading = statsLoading || tierInfoLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats || !tierInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Partner profile not found</p>
      </div>
    );
  }

  const tiers: (keyof typeof TIER_THRESHOLDS)[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentTier = stats.currentTier;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Tiers & Benefits</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Partner Tiers & Benefits</h1>
          <p className="mt-1 text-slate-600">
            Understand the tier system and work toward higher rewards
          </p>
        </div>

        {/* Current Tier Card */}
        <div
          className={cn(
            'mb-6 rounded-lg border-2 p-8 shadow-sm',
            TIER_BG_COLORS[currentTier]
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('rounded-full p-4', TIER_BG_COLORS[currentTier])}>
                <Trophy className={cn('h-8 w-8', TIER_ICON_COLORS[currentTier])} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Current Tier</h2>
                <div
                  className={cn(
                    'mt-2 inline-flex rounded-full px-4 py-2 text-lg font-bold',
                    TIER_COLORS[currentTier]
                  )}
                >
                  {currentTier}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {stats.currentPoints.toLocaleString()} points earned
                </p>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {stats.nextTier && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
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
          )}

          {!stats.nextTier && (
            <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-purple-600 mb-2" />
              <p className="font-semibold text-purple-900">
                Congratulations! You&apos;ve reached the highest tier!
              </p>
              <p className="mt-1 text-sm text-purple-700">
                Keep earning points to maintain your PLATINUM status
              </p>
            </div>
          )}
        </div>

        {/* Tier Structure Table */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Tier Structure</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-sm font-medium text-slate-600">
                <tr>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Points Required</th>
                  <th className="px-4 py-3">Commission Rate</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tiers.map((tier) => {
                  const isCurrentTier = tier === currentTier;
                  const hasReached = stats.currentPoints >= TIER_THRESHOLDS[tier];

                  return (
                    <tr
                      key={tier}
                      className={cn(
                        'hover:bg-slate-50',
                        isCurrentTier && 'bg-emerald-50'
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-bold',
                              TIER_COLORS[tier]
                            )}
                          >
                            {tier}
                          </div>
                          {isCurrentTier && (
                            <span className="text-xs font-medium text-emerald-600">
                              (Current)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {TIER_THRESHOLDS[tier].toLocaleString()} points
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {COMMISSION_RATES[tier]}
                      </td>
                      <td className="px-4 py-4">
                        {hasReached ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                            <Check className="h-3 w-3" />
                            Achieved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            <Target className="h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Comparison */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Benefits by Tier</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const isCurrentTier = tier === currentTier;
              const hasReached = stats.currentPoints >= TIER_THRESHOLDS[tier];

              return (
                <div
                  key={tier}
                  className={cn(
                    'rounded-lg border-2 p-6',
                    isCurrentTier
                      ? 'border-emerald-500 bg-emerald-50'
                      : hasReached
                      ? 'border-slate-300 bg-slate-50'
                      : 'border-slate-200 bg-white opacity-60'
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-bold',
                        TIER_COLORS[tier]
                      )}
                    >
                      {tier}
                    </div>
                    {isCurrentTier && (
                      <span className="text-xs font-medium text-emerald-600">Current</span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-slate-600">Commission</p>
                    <p className="text-lg font-bold text-slate-900">{COMMISSION_RATES[tier]}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="mb-3 text-xs font-medium text-slate-600">Benefits:</p>
                    <ul className="space-y-2">
                      {TIER_BENEFITS[tier].map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className={cn('mt-0.5 h-3 w-3 flex-shrink-0', isCurrentTier ? 'text-emerald-600' : 'text-slate-400')} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">How to Earn Points</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Referral Clicks</p>
                  <p className="text-sm text-slate-600">10 points per click</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Applications</p>
                  <p className="text-sm text-slate-600">100 points per application</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Bookings</p>
                  <p className="text-sm text-slate-600">1,000-1,500 points per booking</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Gift className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Trip Completion</p>
                  <p className="text-sm text-slate-600">500 bonus points</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Recruit Partners</p>
                  <p className="text-sm text-slate-600">2,000 points per partner</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Star className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Community Engagement</p>
                  <p className="text-sm text-slate-600">50-100 points per activity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Link href="/dashboard/partner/points">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Your Points Balance
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
