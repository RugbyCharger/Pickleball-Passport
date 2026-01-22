/**
 * Partner Leaderboard
 * E9-S19: Partner Leaderboard
 *
 * Features:
 * - Display top performing partners ranked by points
 * - Toggle between monthly and all-time leaderboards
 * - Highlight current partner's position
 * - Gold/Silver/Bronze styling for top 3
 * - Privacy toggle to show as anonymous
 */

'use client'

import { trpc } from '@/lib/trpc/client'
import {
  Trophy,
  Medal,
  Crown,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

const TIER_COLORS = {
  BRONZE: 'bg-amber-700 text-white',
  SILVER: 'bg-slate-400 text-white',
  GOLD: 'bg-yellow-500 text-white',
  PLATINUM: 'bg-purple-600 text-white',
}

const RANK_STYLES = {
  1: {
    bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
    border: 'border-yellow-300',
    icon: Crown,
    iconColor: 'text-yellow-500',
    label: 'Gold',
  },
  2: {
    bg: 'bg-gradient-to-r from-slate-100 to-gray-100',
    border: 'border-slate-300',
    icon: Medal,
    iconColor: 'text-slate-400',
    label: 'Silver',
  },
  3: {
    bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
    border: 'border-amber-400',
    icon: Medal,
    iconColor: 'text-amber-600',
    label: 'Bronze',
  },
}

type Timeframe = 'monthly' | 'alltime'

export default function PartnerLeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly')
  const utils = trpc.useUtils()

  // Fetch leaderboard data
  const { data, isLoading, error } = trpc.partner.getLeaderboard.useQuery({
    timeframe,
    limit: 50,
  })

  // Fetch leaderboard settings
  const { data: settings } = trpc.partner.getLeaderboardSettings.useQuery()

  // Mutation to update visibility
  const updateVisibility = trpc.partner.updateLeaderboardVisibility.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.showOnLeaderboard
          ? 'Your profile is now visible on the leaderboard'
          : 'You are now shown as Anonymous Partner'
      )
      utils.partner.getLeaderboard.invalidate()
      utils.partner.getLeaderboardSettings.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update visibility')
    },
  })

  const handleToggleVisibility = () => {
    if (settings) {
      updateVisibility.mutate({ showOnLeaderboard: !settings.showOnLeaderboard })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load leaderboard</p>
          <p className="mt-2 text-sm text-slate-500">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">No leaderboard data available</p>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Partner Leaderboard</h1>
                <p className="mt-1 text-slate-600">
                  See how you rank among our partner community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rank Card */}
        {data.currentPartnerRank && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-600">
                  #{data.currentPartnerRank}
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Your Current Rank</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {data.currentPartnerPoints.toLocaleString()} points
                  </p>
                  <p className="text-sm text-emerald-600">
                    {timeframe === 'monthly' ? currentMonth : 'All Time'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-2">
                  Out of {data.totalPartners} partners
                </p>
                {data.currentPartnerRank <= 3 && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Top {data.currentPartnerRank === 1 ? 'Partner' : '3'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Toggle */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings?.showOnLeaderboard ? (
                <Eye className="h-5 w-5 text-emerald-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <p className="font-medium text-slate-900">Leaderboard Visibility</p>
                <p className="text-sm text-slate-600">
                  {settings?.showOnLeaderboard
                    ? 'Your club name is visible on the leaderboard'
                    : 'You appear as "Anonymous Partner"'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVisibility}
              disabled={updateVisibility.isPending}
              className="gap-2"
            >
              {updateVisibility.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : settings?.showOnLeaderboard ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Go Anonymous
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show My Name
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Timeframe Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            onClick={() => setTimeframe('monthly')}
            className="flex-1"
          >
            This Month
          </Button>
          <Button
            variant={timeframe === 'alltime' ? 'default' : 'outline'}
            onClick={() => setTimeframe('alltime')}
            className="flex-1"
          >
            All Time
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <h2 className="font-semibold text-slate-900">
              {timeframe === 'monthly' ? `${currentMonth} Rankings` : 'All-Time Rankings'}
            </h2>
          </div>

          {data.leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No rankings yet
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Start referring guests to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.leaderboard.map((partner) => {
                const rankStyle = RANK_STYLES[partner.rank as keyof typeof RANK_STYLES]
                const isTopThree = partner.rank <= 3
                const RankIcon = rankStyle?.icon || Trophy

                return (
                  <div
                    key={partner.id}
                    className={cn(
                      'flex items-center gap-4 px-6 py-4 transition-colors',
                      partner.isCurrentPartner && 'bg-emerald-50',
                      isTopThree && rankStyle?.bg,
                      isTopThree && `border-l-4 ${rankStyle?.border}`
                    )}
                  >
                    {/* Rank */}
                    <div className="flex w-12 items-center justify-center">
                      {isTopThree ? (
                        <div className={cn('flex items-center justify-center', rankStyle?.iconColor)}>
                          <RankIcon className="h-8 w-8" />
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-slate-400">
                          #{partner.rank}
                        </span>
                      )}
                    </div>

                    {/* Partner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            'font-semibold truncate',
                            partner.isCurrentPartner
                              ? 'text-emerald-900'
                              : 'text-slate-900',
                            partner.isAnonymous && 'italic text-slate-600'
                          )}
                        >
                          {partner.clubName}
                          {partner.isCurrentPartner && (
                            <span className="ml-2 text-xs font-normal text-emerald-600">
                              (You)
                            </span>
                          )}
                        </p>
                      </div>
                      {partner.clubLocation && !partner.isAnonymous && (
                        <p className="text-sm text-slate-500 truncate">
                          {partner.clubLocation}
                        </p>
                      )}
                    </div>

                    {/* Tier Badge */}
                    <div
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        TIER_COLORS[partner.tier]
                      )}
                    >
                      {partner.tier}
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          partner.isCurrentPartner
                            ? 'text-emerald-600'
                            : isTopThree
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        )}
                      >
                        {partner.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-medium text-slate-900 mb-2">How Points Are Calculated</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-slate-400" />
              <span>
                <strong>Monthly leaderboard:</strong> Points earned from referrals this month
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-slate-400" />
              <span>
                <strong>All-time leaderboard:</strong> Total Passport Points balance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-slate-400" />
              <span>
                Leaderboard rankings are updated in real-time as referrals are processed
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
