/**
 * Partner Router
 *
 * tRPC procedures for partner-specific operations:
 * - Partner dashboard data
 * - Referral statistics
 * - Tier progress tracking
 */

import { z } from 'zod'
import { router, partnerProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PartnerTier } from '@prisma/client'

/**
 * Tier thresholds for partner progression
 * Points required to reach each tier
 */
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 15000,
}

/**
 * Tier benefits for each level
 */
const TIER_BENEFITS = {
  BRONZE: [
    'Basic referral tracking',
    '5% commission on bookings',
    'Monthly partner newsletter',
  ],
  SILVER: [
    'Priority support',
    '7.5% commission on bookings',
    'Quarterly performance reviews',
    'Exclusive partner resources',
  ],
  GOLD: [
    'Dedicated account manager',
    '10% commission on bookings',
    'Co-marketing opportunities',
    'Early access to new packages',
    'Invitation to annual partner summit',
  ],
  PLATINUM: [
    'VIP account management',
    '12.5% commission on bookings',
    'Custom partnership packages',
    'Featured partner status',
    'Premium marketing support',
    'Exclusive retreat invitations',
  ],
}

export const partnerRouter = router({
  /**
   * Get partner profile with current user's data
   */
  getMyProfile: partnerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: {
        userId: ctx.user!.id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    return profile
  }),

  /**
   * Get dashboard statistics for current partner
   */
  getDashboardStats: partnerProcedure.query(async ({ ctx }) => {
    // Get partner profile
    const profile = await ctx.db.partnerProfile.findUnique({
      where: {
        userId: ctx.user!.id,
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    // Get all referrals for this partner
    const referrals = await ctx.db.partnerReferral.findMany({
      where: {
        partnerId: profile.id,
      },
      include: {
        booking: {
          select: {
            status: true,
            totalPrice: true,
            createdAt: true,
            user: {
              select: {
                email: true,
              },
            },
            package: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const totalReferrals = referrals.length
    const confirmedReferrals = referrals.filter(
      (r) => r.booking.status === 'CONFIRMED'
    ).length
    const conversionRate =
      totalReferrals > 0
        ? Math.round((confirmedReferrals / totalReferrals) * 100)
        : 0

    const totalPointsEarned = referrals.reduce(
      (sum, r) => sum + r.pointsEarned,
      0
    )

    const totalRevenue = referrals
      .filter((r) => r.booking.status === 'CONFIRMED')
      .reduce((sum, r) => sum + r.booking.totalPrice, 0)

    // Tier progress
    const currentTier = profile.tier
    const currentPoints = profile.passportPoints
    const nextTier = getNextTier(currentTier)
    const nextTierThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null
    const pointsToNextTier = nextTierThreshold
      ? nextTierThreshold - currentPoints
      : 0
    const tierProgress = nextTierThreshold
      ? Math.min(
          Math.round((currentPoints / nextTierThreshold) * 100),
          100
        )
      : 100

    return {
      totalReferrals,
      confirmedReferrals,
      pendingReferrals: totalReferrals - confirmedReferrals,
      conversionRate,
      totalPointsEarned,
      currentPoints,
      totalRevenue,
      currentTier,
      nextTier,
      pointsToNextTier,
      tierProgress,
    }
  }),

  /**
   * Get tier information and benefits
   */
  getTierInfo: partnerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: {
        userId: ctx.user!.id,
      },
      select: {
        tier: true,
        passportPoints: true,
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    const currentTier = profile.tier
    const currentPoints = profile.passportPoints
    const nextTier = getNextTier(currentTier)

    return {
      currentTier,
      currentPoints,
      currentBenefits: TIER_BENEFITS[currentTier],
      thresholds: TIER_THRESHOLDS,
      nextTier,
      nextTierThreshold: nextTier ? TIER_THRESHOLDS[nextTier] : null,
      nextTierBenefits: nextTier ? TIER_BENEFITS[nextTier] : null,
    }
  }),

  /**
   * Get individual referral details for current partner
   */
  getMyReferrals: partnerProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      const referrals = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
        },
        include: {
          booking: {
            select: {
              bookingReference: true,
              status: true,
              totalPrice: true,
              createdAt: true,
              user: {
                select: {
                  email: true,
                  guestProfile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              package: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input?.limit || 50,
        skip: input?.offset || 0,
      })

      return referrals.map((r) => ({
        id: r.id,
        bookingReference: r.booking.bookingReference,
        guestName: r.booking.user.guestProfile
          ? `${r.booking.user.guestProfile.firstName} ${r.booking.user.guestProfile.lastName}`
          : r.booking.user.email,
        packageName: r.booking.package.name,
        status: r.booking.status,
        totalPrice: r.booking.totalPrice,
        pointsEarned: r.pointsEarned,
        isRedeemed: r.isRedeemed,
        createdAt: r.createdAt,
      }))
    }),

  /**
   * Get referral performance over time (chart data)
   */
  getReferralTrends: partnerProcedure
    .input(
      z
        .object({
          months: z.number().min(1).max(12).default(6),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      const monthsAgo = input?.months || 6
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - monthsAgo)

      const referrals = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          pointsEarned: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Group by month
      const monthlyData = new Map<string, { referrals: number; points: number }>()

      referrals.forEach((r) => {
        const monthKey = `${r.createdAt.getFullYear()}-${String(
          r.createdAt.getMonth() + 1
        ).padStart(2, '0')}`

        const existing = monthlyData.get(monthKey) || { referrals: 0, points: 0 }
        monthlyData.set(monthKey, {
          referrals: existing.referrals + 1,
          points: existing.points + r.pointsEarned,
        })
      })

      // Convert to array and sort
      return Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          referrals: data.referrals,
          pointsEarned: data.points,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
    }),
})

/**
 * Helper: Get the next tier based on current tier
 */
function getNextTier(currentTier: PartnerTier): PartnerTier | null {
  const tiers: PartnerTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null // Already at max tier
  }

  return tiers[currentIndex + 1]
}
