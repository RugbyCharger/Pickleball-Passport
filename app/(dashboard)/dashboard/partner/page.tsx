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
  FileText,
  BookOpen,
  Globe,
  QrCode,
  X,
  MessageSquare,
  PenTool,
  AlertTriangle,
  Medal,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Fetch partner profile and stats
  const { data: profile, isLoading: profileLoading } =
    trpc.partner.getMyProfile.useQuery();
  const { data: stats, isLoading: statsLoading } =
    trpc.partner.getDashboardStats.useQuery();
  const { data: tierInfo, isLoading: tierLoading } =
    trpc.partner.getTierInfo.useQuery();
  const { data: referrals, isLoading: referralsLoading } =
    trpc.partner.getMyReferrals.useQuery();
  // E9-S15: Check agreement status
  const { data: agreementStatus } = trpc.partner.getAgreement.useQuery();

  // Redirect new partners to onboarding
  useEffect(() => {
    if (
      profile &&
      !profile.onboardingCompleted &&
      !profileLoading &&
      !dismissedBanner
    ) {
      // Check if this is a new partner (created in last 24 hours)
      const createdAt = new Date(profile.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // If created in last 24 hours, redirect to onboarding
      if (hoursSinceCreation < 24) {
        router.push('/dashboard/partner/onboarding');
        return;
      }
    }
  }, [profile, profileLoading, dismissedBanner, router]);

  const handleCopyCode = async () => {
    if (profile?.referralCode) {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!profile?.referralCode) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      utm_source: 'partner',
      utm_medium: 'referral',
      utm_campaign: profile.referralCode,
    });
    const fullLink = `${baseUrl}/r/${profile.referralCode}?${params.toString()}`;

    await navigator.clipboard.writeText(fullLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  const showOnboardingBanner =
    profile &&
    !profile.onboardingCompleted &&
    !dismissedBanner &&
    !profileLoading;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Onboarding Banner */}
        {showOnboardingBanner && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900">
                  Complete Your Onboarding
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  Finish setting up your partner account and learn how to get started
                </p>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <Link href="/dashboard/partner/onboarding">
                  <Button size="sm" className="gap-2">
                    Complete Onboarding
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button
                  onClick={() => setDismissedBanner(true)}
                  className="text-emerald-600 hover:text-emerald-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* E9-S15: Agreement Banner - Show if not signed */}
        {agreementStatus && !agreementStatus.hasSigned && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">
                    Partner Agreement Required
                  </h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Please review and sign the Partner Agreement to unlock all features and start earning commissions.
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <Link href="/dashboard/partner/agreement">
                  <Button size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <PenTool className="h-4 w-4" />
                    Sign Agreement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

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
                <Link href="/dashboard/partner/referral-links">
                  <Button variant="outline" size="sm" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Generate QR Code
                  </Button>
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <code className="rounded-lg bg-white px-4 py-3 text-2xl font-bold tracking-wide text-emerald-600">
                  {profile.referralCode}
                </code>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied Link!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
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
          <Link href="/dashboard/partner/points">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
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
          </Link>

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
            <Link href="/dashboard/partner/tiers">
              <Button variant="outline" size="sm" className="gap-2">
                View All Tiers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
                Congratulations! You&apos;ve reached the highest tier!
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

        {/* Quick Actions */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
          <Link href="/dashboard/partner/materials">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Marketing Materials</h3>
                  <p className="text-sm text-slate-600">Download flyers, templates & more</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/referrals">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">View All Referrals</h3>
                  <p className="text-sm text-slate-600">Track and filter your referrals</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/leads">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Lead Management</h3>
                  <p className="text-sm text-slate-600">Track applications & bookings</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/commissions">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Commission Reports</h3>
                  <p className="text-sm text-slate-600">View revenue and earnings</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/training">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-indigo-100 p-3">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Training Resources</h3>
                  <p className="text-sm text-slate-600">Guides, tutorials & FAQs</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/landing-pages">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-teal-100 p-3">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Landing Pages</h3>
                  <p className="text-sm text-slate-600">Create co-branded pages</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/analytics">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-indigo-100 p-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Analytics</h3>
                  <p className="text-sm text-slate-600">View performance trends</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/payouts">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-100 p-3">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payouts</h3>
                  <p className="text-sm text-slate-600">Cash out your points</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/forum">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Directors Circle</h3>
                  <p className="text-sm text-slate-600">Partner community forum</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/leaderboard">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Medal className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Leaderboard</h3>
                  <p className="text-sm text-slate-600">See top partners</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/partner/settings">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-slate-100 p-3">
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Settings</h3>
                  <p className="text-sm text-slate-600">Manage preferences</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Referrals */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Referrals</h2>
            <Link
              href="/dashboard/partner/referrals"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {referralsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : referrals?.referrals && referrals.referrals.length > 0 ? (
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
                  {referrals.referrals.slice(0, 10).map((referral) => (
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
