/**
 * Guest Referrals Dashboard Page
 * Epic 10 - US-004: Guest Referral Code Generation
 *
 * Features:
 * - Display referral code and shareable link
 * - Copy to clipboard functionality
 * - Referral statistics (clicks, applications, bookings, completions)
 * - Points balance
 * - List of referrals
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Users,
  Copy,
  Check,
  Loader2,
  Share2,
  MousePointer,
  FileText,
  Calendar,
  Trophy,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  CLICKED: 'bg-slate-100 text-slate-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  BOOKED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<string, string> = {
  CLICKED: 'Clicked',
  APPLIED: 'Applied',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
};

export default function GuestReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: referralCode, isLoading: isLoadingCode } = trpc.user.getMyReferralCode.useQuery();
  const { data: stats, isLoading: isLoadingStats } = trpc.user.getReferralStats.useQuery();
  const { data: eligibility, isLoading: isLoadingEligibility } = trpc.user.checkReferralCodeEligibility.useQuery();

  const generateCodeMutation = trpc.user.generateReferralCode.useMutation({
    onSuccess: () => {
      // Refetch data after generating code
      window.location.reload();
    },
  });

  const handleCopyLink = async () => {
    if (referralCode?.shareableLink) {
      await navigator.clipboard.writeText(referralCode.shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    if (referralCode?.referralCode) {
      await navigator.clipboard.writeText(referralCode.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  const isLoading = isLoadingCode || isLoadingStats || isLoadingEligibility;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // User doesn't have a code yet
  if (!referralCode?.hasCode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Referrals</h1>
          <p className="mt-1 text-slate-600">
            Earn rewards by referring friends to The Pickleball Passport
          </p>
        </div>

        {/* Locked State Card */}
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Lock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {eligibility?.eligible
                ? 'Your Referral Code is Ready!'
                : 'Unlock Your Referral Code'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {eligibility?.eligible
                ? 'Congratulations on completing your first trip! Click below to generate your unique referral code.'
                : eligibility?.reason || 'Complete your first trip to unlock your personal referral code and start earning rewards.'}
            </p>

            {eligibility?.eligible ? (
              <Button
                onClick={handleGenerateCode}
                disabled={generateCodeMutation.isPending}
                size="lg"
              >
                {generateCodeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate My Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Link href="/packages">
                <Button size="lg">
                  Browse Packages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* How It Works Section */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">How It Works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Complete a Trip</h3>
                    <p className="text-sm text-slate-600">Finish your first The Pickleball Passport experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Your Code</h3>
                    <p className="text-sm text-slate-600">Receive a unique referral code to share</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Earn Rewards</h3>
                    <p className="text-sm text-slate-600">Earn points for every friend who books</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // User has a referral code - show full dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Referrals</h1>
        <p className="mt-1 text-slate-600">
          Share your code and earn rewards when friends book trips
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-600" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share this code with friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code Display */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg bg-white border border-emerald-200 px-4 py-3">
              <p className="text-2xl font-bold text-emerald-600 tracking-wider">
                {referralCode.referralCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="h-12 w-12"
            >
              {copiedCode ? (
                <Check className="h-5 w-5 text-emerald-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Shareable Link */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600 truncate">
                {referralCode.shareableLink}
              </div>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Link Clicks
            </CardDescription>
            <CardTitle className="text-3xl">{stats?.clicks ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </CardDescription>
            <CardTitle className="text-3xl">{stats?.applications ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </CardDescription>
            <CardTitle className="text-3xl">{stats?.bookings ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Completed
            </CardDescription>
            <CardTitle className="text-3xl">{stats?.completed ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-emerald-700">
              <Trophy className="h-4 w-4" />
              Points Balance
            </CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {(stats?.currentBalance ?? 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Referrals List */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals
            </CardTitle>
            <CardDescription>
              People who signed up using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="border-b bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Referral</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Points Earned</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {referral.referredUser.firstName && referral.referredUser.lastName
                            ? `${referral.referredUser.firstName} ${referral.referredUser.lastName.charAt(0)}.`
                            : 'Guest'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            'font-medium',
                            STATUS_COLORS[referral.status] || 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {STATUS_LABELS[referral.status] || referral.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-600">
                          +{referral.pointsEarned.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for Referrals */}
      {(!stats?.referrals || stats.referrals.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Referrals Yet</h3>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              Share your referral link with friends who love pickleball. You&apos;ll earn points when they sign up and book a trip!
            </p>
            <Button onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Your Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rewards Info */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards You Can Earn</CardTitle>
          <CardDescription>
            Earn points at each stage of your friend&apos;s journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Application</p>
              <p className="text-xl font-bold text-emerald-600">+100 pts</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Booking (under $15K)</p>
              <p className="text-xl font-bold text-emerald-600">+1,000 pts</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Booking ($15K+)</p>
              <p className="text-xl font-bold text-emerald-600">+1,500 pts</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Trip Completed</p>
              <p className="text-xl font-bold text-emerald-600">+500 pts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
