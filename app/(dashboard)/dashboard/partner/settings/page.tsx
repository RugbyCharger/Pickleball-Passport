/**
 * Partner Settings
 * E9-S19: Partner Settings Page
 *
 * Features:
 * - Leaderboard visibility toggle (show name or appear as anonymous)
 * - Profile preferences
 */

'use client'

import { trpc } from '@/lib/trpc/client'
import {
  Settings,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Trophy,
  Bell,
  Shield,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

export default function PartnerSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch leaderboard settings
  const { data: leaderboardSettings, isLoading: leaderboardLoading } =
    trpc.partner.getLeaderboardSettings.useQuery()

  // Fetch profile for display
  const { data: profile, isLoading: profileLoading } =
    trpc.partner.getMyProfile.useQuery()

  // Mutation to update leaderboard visibility
  const updateLeaderboardVisibility = trpc.partner.updateLeaderboardVisibility.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.showOnLeaderboard
          ? 'Your profile is now visible on the leaderboard'
          : 'You are now shown as "Anonymous Partner"'
      )
      utils.partner.getLeaderboardSettings.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })

  const handleToggleLeaderboardVisibility = () => {
    if (leaderboardSettings) {
      updateLeaderboardVisibility.mutate({
        showOnLeaderboard: !leaderboardSettings.showOnLeaderboard,
      })
    }
  }

  const isLoading = leaderboardLoading || profileLoading

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/dashboard/partner"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 p-3">
              <Settings className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Partner Settings</h1>
              <p className="mt-1 text-slate-600">
                Manage your partner account preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {profile?.clubName}
              </h2>
              <p className="text-slate-600">{profile?.clubLocation}</p>
              <p className="text-sm text-slate-500">
                Referral Code: <code className="font-mono text-emerald-600">{profile?.referralCode}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Privacy & Visibility Section */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Privacy & Visibility</h2>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Control how your information appears to other partners
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Leaderboard Visibility */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Show on Leaderboard</p>
                    <p className="text-sm text-slate-600">
                      {leaderboardSettings?.showOnLeaderboard
                        ? 'Your club name is visible on the partner leaderboard'
                        : 'You appear as "Anonymous Partner" on the leaderboard'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleLeaderboardVisibility}
                  disabled={updateLeaderboardVisibility.isPending}
                  className={cn(
                    'gap-2 min-w-[140px]',
                    leaderboardSettings?.showOnLeaderboard
                      ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      : 'text-slate-600'
                  )}
                >
                  {updateLeaderboardVisibility.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : leaderboardSettings?.showOnLeaderboard ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Anonymous
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Quick Links</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <Link
                href="/dashboard/partner/leaderboard"
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  <span className="text-slate-900">View Leaderboard</span>
                </div>
                <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
              </Link>
              <Link
                href="/dashboard/partner/agreement"
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-900">Partner Agreement</span>
                </div>
                <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
              </Link>
              <Link
                href="/dashboard/partner/support"
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-600" />
                  <span className="text-slate-900">Support Tickets</span>
                </div>
                <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
