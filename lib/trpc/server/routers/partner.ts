/**
 * Partner Router
 *
 * tRPC procedures for partner-specific operations:
 * - Partner dashboard data
 * - Referral statistics
 * - Tier progress tracking
 */

import { z } from 'zod'
import { router, partnerProcedure, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PartnerTier, Role } from '@prisma/client'
import { checkRateLimit, getIpAddress } from '@/lib/rate-limit'
import {
  createConnectAccount,
  createAccountLink,
  getConnectAccountStatus,
  createLoginLink,
  isStripeConnectConfigured,
} from '@/lib/stripe/stripe-connect'

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
   * E9-S2: Extended with filtering, sorting, and pagination
   */
  getMyReferrals: partnerProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          // E9-S2: Filtering
          statusFilter: z.enum(['ALL', 'DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          // E9-S2: Sorting
          sortBy: z.enum(['date', 'points', 'value']).default('date'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
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

      // Build where clause with filters
      const bookingWhere: Record<string, unknown> = {}
      
      if (input?.statusFilter && input.statusFilter !== 'ALL') {
        bookingWhere.status = input.statusFilter
      }

      // Build date filter on referral createdAt
      const referralWhere: Record<string, unknown> = {
        partnerId: profile.id,
      }

      if (input?.dateFrom || input?.dateTo) {
        referralWhere.createdAt = {
          ...(input?.dateFrom && { gte: input.dateFrom }),
          ...(input?.dateTo && { lte: input.dateTo }),
        }
      }

      // Build orderBy based on sortBy
      let orderBy: Record<string, unknown> = { createdAt: input?.sortOrder || 'desc' }
      
      if (input?.sortBy === 'points') {
        orderBy = { pointsEarned: input?.sortOrder || 'desc' }
      }
      // Note: sorting by value requires sorting in application layer since it's in booking

      // Get total count for pagination
      const totalCount = await ctx.db.partnerReferral.count({
        where: {
          ...referralWhere,
          ...(Object.keys(bookingWhere).length > 0 && { booking: bookingWhere }),
        },
      })

      const referrals = await ctx.db.partnerReferral.findMany({
        where: {
          ...referralWhere,
          ...(Object.keys(bookingWhere).length > 0 && { booking: bookingWhere }),
        },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              totalPrice: true,
              createdAt: true,
              tripId: true,
              trip: {
                select: {
                  startDate: true,
                  endDate: true,
                  destination: true,
                },
              },
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
                  description: true,
                },
              },
            },
          },
        },
        orderBy,
        take: input?.limit || 20,
        skip: input?.offset || 0,
      })

      // If sorting by value, sort in application layer
      let sortedReferrals = referrals
      if (input?.sortBy === 'value') {
        sortedReferrals = [...referrals].sort((a, b) => {
          const diff = a.booking.totalPrice - b.booking.totalPrice
          return input?.sortOrder === 'asc' ? diff : -diff
        })
      }

      return {
        referrals: sortedReferrals.map((r) => ({
          id: r.id,
          bookingId: r.booking.id,
          bookingReference: r.booking.bookingReference,
          guestName: r.booking.user.guestProfile
            ? `${r.booking.user.guestProfile.firstName} ${r.booking.user.guestProfile.lastName}`
            : r.booking.user.email,
          guestEmail: r.booking.user.email,
          guestFirstName: r.booking.user.guestProfile?.firstName || null,
          guestLastName: r.booking.user.guestProfile?.lastName || null,
          packageName: r.booking.package.name,
          packageDescription: r.booking.package.description,
          status: r.booking.status,
          totalPrice: r.booking.totalPrice,
          pointsEarned: r.pointsEarned,
          isRedeemed: r.isRedeemed,
          createdAt: r.createdAt,
          bookingCreatedAt: r.booking.createdAt,
          tripStartDate: r.booking.trip?.startDate || null,
          tripEndDate: r.booking.trip?.endDate || null,
          tripDestination: r.booking.trip?.destination || null,
        })),
        pagination: {
          total: totalCount,
          limit: input?.limit || 20,
          offset: input?.offset || 0,
          hasMore: (input?.offset || 0) + (input?.limit || 20) < totalCount,
        },
      }
    }),

  /**
   * Get points balance and summary
   * E9-S3: Points Balance & Transactions
   */
  getPointsBalance: partnerProcedure.query(async ({ ctx }) => {
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

    // Get all referrals to calculate lifetime earned
    const referrals = await ctx.db.partnerReferral.findMany({
      where: {
        partnerId: profile.id,
      },
      select: {
        pointsEarned: true,
      },
    })

    const lifetimeEarned = referrals.reduce((sum, r) => sum + r.pointsEarned, 0)
    const currentBalance = profile.passportPoints
    const lifetimeRedeemed = lifetimeEarned - currentBalance

    return {
      currentBalance,
      lifetimeEarned,
      lifetimeRedeemed,
    }
  }),

  /**
   * Get points transaction history
   * E9-S3: Points Balance & Transactions
   */
  getPointsTransactions: partnerProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
          filter: z.enum(['ALL', 'EARNED', 'REDEEMED']).default('ALL'),
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

      // Get referrals (earned transactions)
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Build transaction list from referrals
      const earnedTransactions = referrals.map((r) => ({
        id: `earned-${r.id}`,
        type: 'EARNED' as const,
        points: r.pointsEarned,
        description: `Referral booking: ${r.booking.bookingReference}`,
        bookingReference: r.booking.bookingReference,
        bookingStatus: r.booking.status,
        createdAt: r.createdAt,
      }))

      // Filter transactions
      let transactions = earnedTransactions
      if (input?.filter === 'EARNED') {
        transactions = earnedTransactions
      } else if (input?.filter === 'REDEEMED') {
        // TODO: Add redemption transactions when redemption system is built
        transactions = []
      }

      // Calculate running balance (for display)
      // Sort by date (oldest first) to calculate cumulative balance
      const sortedByDate = [...transactions].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )
      
      // Calculate balance after each transaction
      let runningBalance = 0
      const balanceMap = new Map<string, number>()
      
      for (const t of sortedByDate) {
        if (t.type === 'EARNED') {
          runningBalance += t.points
        } else {
          runningBalance -= t.points
        }
        balanceMap.set(t.id, runningBalance)
      }

      // Add transactions with balance (newest first for display)
      const transactionsWithBalance = transactions.map((t) => ({
        ...t,
        balanceAfter: balanceMap.get(t.id) || 0,
      }))

      // Paginate
      const total = transactionsWithBalance.length
      const paginated = transactionsWithBalance.slice(
        input?.offset || 0,
        (input?.offset || 0) + (input?.limit || 20)
      )

      return {
        transactions: paginated,
        pagination: {
          total,
          limit: input?.limit || 20,
          offset: input?.offset || 0,
          hasMore: (input?.offset || 0) + (input?.limit || 20) < total,
        },
      }
    }),

  /**
   * Get commission and revenue report
   * E9-S5: Commission Reports
   */
  getCommissionReport: partnerProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          period: z.enum(['month', 'quarter', 'year', 'all']).default('all'),
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

      // Calculate date range based on period
      let startDate: Date | undefined
      let endDate: Date | undefined

      if (input?.startDate && input?.endDate) {
        startDate = input.startDate
        endDate = input.endDate
      } else if (input?.period) {
        const now = new Date()
        switch (input.period) {
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            break
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
            endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
            break
          case 'all':
          default:
            startDate = undefined
            endDate = undefined
        }
      }

      // Get all referrals with bookings
      const referrals = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {}),
        },
        include: {
          booking: {
            select: {
              id: true,
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
      })

      // Filter to confirmed bookings for revenue calculations
      const confirmedReferrals = referrals.filter((r) => r.booking.status === 'CONFIRMED')

      // Calculate summary
      const totalRevenue = confirmedReferrals.reduce((sum, r) => sum + r.booking.totalPrice, 0)
      const totalPointsEarned = referrals.reduce((sum, r) => sum + r.pointsEarned, 0)
      const currentPointsBalance = profile.passportPoints
      const confirmedBookings = confirmedReferrals.length
      const averageBookingValue =
        confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0

      // Build bookings array
      const bookings = referrals.map((r) => ({
        bookingReference: r.booking.bookingReference,
        guestName: r.booking.user.guestProfile
          ? `${r.booking.user.guestProfile.firstName} ${r.booking.user.guestProfile.lastName}`
          : r.booking.user.email,
        packageName: r.booking.package.name,
        bookingDate: r.booking.createdAt,
        bookingValue: r.booking.totalPrice,
        pointsEarned: r.pointsEarned,
        status: r.booking.status,
      }))

      // Calculate monthly data
      const monthlyMap = new Map<string, { revenue: number; points: number; bookings: number }>()

      confirmedReferrals.forEach((r) => {
        const monthKey = `${r.createdAt.getFullYear()}-${String(
          r.createdAt.getMonth() + 1
        ).padStart(2, '0')}`
        const existing = monthlyMap.get(monthKey) || { revenue: 0, points: 0, bookings: 0 }
        monthlyMap.set(monthKey, {
          revenue: existing.revenue + r.booking.totalPrice,
          points: existing.points + r.pointsEarned,
          bookings: existing.bookings + 1,
        })
      })

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          points: data.points,
          bookings: data.bookings,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      return {
        summary: {
          totalRevenue,
          totalPointsEarned,
          currentPointsBalance,
          confirmedBookings,
          averageBookingValue,
        },
        bookings,
        monthlyData,
        period: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          period: input?.period || 'all',
        },
      }
    }),

  /**
   * Get leads (applications and bookings from referrals)
   * E9-S6: Lead Management
   */
  getLeads: partnerProcedure
    .input(
      z
        .object({
          filter: z.enum(['all', 'applications', 'bookings']).default('all'),
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

      // Get applications that used this partner's referral code
      const applications = await ctx.db.application.findMany({
        where: {
          referralSource: profile.referralCode,
        },
        include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Get bookings from referrals
      const referralBookings = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
        },
        include: {
          booking: {
            include: {
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
      })

      // Build leads array
      const leads: Array<{
        id: string
        type: 'application' | 'booking'
        guestName: string
        guestEmail: string
        applicationDate?: Date
        applicationStatus?: string
        bookingStatus?: string
        bookingValue?: number
        pointsEarned?: number
        bookingReference?: string
        lastActivityDate: Date
        interests?: string[]
        preferredDuration?: string
      }> = []

      // Add applications as leads
      applications.forEach((app) => {
        // Check if this application led to a booking
        const relatedBooking = referralBookings.find(
          (rb) => rb.booking.userId === app.userId
        )

        if (!relatedBooking || input?.filter === 'applications') {
          leads.push({
            id: `app-${app.id}`,
            type: 'application',
            guestName: app.user.guestProfile
              ? `${app.user.guestProfile.firstName} ${app.user.guestProfile.lastName}`
              : app.email,
            guestEmail: app.email,
            applicationDate: app.createdAt,
            applicationStatus: app.status,
            lastActivityDate: app.createdAt,
            interests: app.interests,
            preferredDuration: app.preferredDuration,
          })
        }
      })

      // Add bookings as leads
      if (input?.filter !== 'applications') {
        referralBookings.forEach((rb) => {
          leads.push({
            id: `booking-${rb.booking.id}`,
            type: 'booking',
            guestName: rb.booking.user.guestProfile
              ? `${rb.booking.user.guestProfile.firstName} ${rb.booking.user.guestProfile.lastName}`
              : rb.booking.user.email,
            guestEmail: rb.booking.user.email,
            applicationDate: rb.booking.createdAt, // Use booking date as proxy
            bookingStatus: rb.booking.status,
            bookingValue: rb.booking.totalPrice,
            pointsEarned: rb.pointsEarned,
            bookingReference: rb.booking.bookingReference,
            lastActivityDate: rb.createdAt,
          })
        })
      }

      // Calculate funnel metrics
      const totalApplications = applications.length
      const totalBookings = referralBookings.length
      const conversionRate =
        totalApplications > 0
          ? Math.round((totalBookings / totalApplications) * 100)
          : 0

      // Remove duplicates (if application led to booking, show booking only)
      const uniqueLeads = leads.filter((lead, index, self) => {
        if (lead.type === 'application') {
          // Check if there's a booking for this email
          return !self.some(
            (l) => l.type === 'booking' && l.guestEmail === lead.guestEmail
          )
        }
        return true
      })

      // Sort by last activity date
      uniqueLeads.sort(
        (a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime()
      )

      return {
        leads: uniqueLeads,
        funnel: {
          totalClicks: totalApplications + totalBookings, // Approximation for MVP
          totalApplications,
          totalBookings,
          conversionRate,
        },
      }
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

  /**
   * Validate referral code and return partner information
   * Public procedure (no auth required - guests can validate codes before booking)
   * Rate limited to prevent enumeration attacks
   */
  validateReferralCode: publicProcedure
    .input(
      z.object({
        code: z.string().min(5).max(50).trim(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Rate limiting to prevent code enumeration
      const ip = getIpAddress(ctx.headers)
      const rateLimitResult = await checkRateLimit('api', ip)

      if (rateLimitResult && !rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many validation attempts. Please try again later.',
        })
      }

      // Convert to uppercase for case-insensitive matching
      const normalizedCode = input.code.toUpperCase()

      // Find partner by referral code
      const partner = await ctx.db.partnerProfile.findUnique({
        where: {
          referralCode: normalizedCode,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      })

      if (!partner) {
        return {
          isValid: false,
          message: 'Invalid referral code. Please check with your partner facility.',
        }
      }

      // Return partner information
      return {
        isValid: true,
        partnerId: partner.id,
        partnerName: partner.clubName, // Using clubName as partner name
        clubName: partner.clubName,
        clubLocation: partner.clubLocation,
      }
    }),

  /**
   * Validate any referral code (partner or guest)
   * Epic 10 - US-003: Support both partner and guest referral codes at booking
   * Public procedure (no auth required)
   */
  validateAnyReferralCode: publicProcedure
    .input(
      z.object({
        code: z.string().min(3).max(50).trim(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Rate limiting to prevent code enumeration
      const ip = getIpAddress(ctx.headers)
      const rateLimitResult = await checkRateLimit('api', ip)

      if (rateLimitResult && !rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many validation attempts. Please try again later.',
        })
      }

      // Convert to uppercase for case-insensitive matching
      const normalizedCode = input.code.toUpperCase()

      // Check both partner and guest referral codes in parallel
      const [partner, guestUser] = await Promise.all([
        ctx.db.partnerProfile.findUnique({
          where: { referralCode: normalizedCode },
          select: {
            id: true,
            clubName: true,
            clubLocation: true,
            tier: true,
          },
        }),
        ctx.db.user.findUnique({
          where: { referralCode: normalizedCode },
          select: {
            id: true,
            email: true,
          },
        }),
      ])

      // Partner code takes precedence if both exist (shouldn't happen)
      if (partner) {
        return {
          isValid: true,
          type: 'partner' as const,
          partnerId: partner.id,
          partnerName: partner.clubName,
          clubName: partner.clubName,
          clubLocation: partner.clubLocation,
          tier: partner.tier,
        }
      }

      if (guestUser) {
        // Get the guest's first name for display (from email prefix)
        const firstName = guestUser.email?.split('@')[0] || 'Pickleball Friend'
        return {
          isValid: true,
          type: 'guest' as const,
          referrerUserId: guestUser.id,
          referrerName: firstName,
        }
      }

      return {
        isValid: false,
        message: 'Invalid referral code. Please check and try again.',
      }
    }),

  /**
   * Partner signup - create new partner account
   * SECURITY: Changed to protectedProcedure - userId comes from authenticated session
   * Previously accepted userId as input which allowed spoofing
   */
  signup: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional(),
        clubName: z.string().min(1, 'Club name is required'),
        clubLocation: z.string().min(1, 'Club location is required'),
        jobTitle: z.string().optional(),
        // SECURITY: Removed userId from input - now taken from authenticated session
      })
    )
    .mutation(async ({ input, ctx }) => {
      // SECURITY: Use authenticated user's ID instead of accepting from input
      const userId = ctx.user.id
      const { email, firstName, lastName, phone, clubName, clubLocation, jobTitle } = input

      // Check if user already has a partner profile
      const existingPartner = await ctx.db.partnerProfile.findUnique({
        where: { userId },
      })

      if (existingPartner) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Partner account already exists for this user',
        })
      }

      // Check if email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== userId) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists',
        })
      }

      // Generate unique referral code
      const baseReferralCode = generateReferralCode(clubName, firstName)
      const referralCode = await ensureUniqueReferralCode(ctx.db, baseReferralCode)

      try {
        // Create or update User, then create PartnerProfile
        const user = await ctx.db.user.upsert({
          where: { id: userId },
          update: {
            role: Role.PARTNER,
            email,
          },
          create: {
            id: userId,
            email,
            role: Role.PARTNER,
          },
        })

        // Create partner profile
        const partnerProfile = await ctx.db.partnerProfile.create({
          data: {
            userId: user.id,
            clubName,
            clubLocation,
            jobTitle: jobTitle || null,
            referralCode,
            tier: PartnerTier.BRONZE,
            passportPoints: 0,
          },
        })

        // TODO: Send welcome email via SendGrid
        // This is handled separately to not block signup
        try {
          // await sendPartnerWelcomeEmail(email, firstName, referralCode)
          console.log(`Welcome email would be sent to: ${email}`)
        } catch (emailError) {
          console.error('Failed to send partner welcome email:', emailError)
          // Don't throw - email failure shouldn't block signup
        }

        return {
          success: true,
          partnerId: partnerProfile.id,
          referralCode,
        }
      } catch (error) {
        console.error('Partner signup error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create partner account. Please try again.',
        })
      }
    }),

  // ============================================================================
  // E9-S8: Co-Branded Landing Pages
  // ============================================================================

  /**
   * Get all landing pages for current partner
   */
  getMyLandingPages: partnerProcedure.query(async ({ ctx }) => {
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

    const landingPages = await ctx.db.partnerLandingPage.findMany({
      where: {
        partnerId: profile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return landingPages
  }),

  /**
   * Get single landing page by ID (partner must own it)
   */
  getLandingPage: partnerProcedure
    .input(z.object({ id: z.string() }))
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

      const landingPage = await ctx.db.partnerLandingPage.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
      })

      if (!landingPage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Landing page not found',
        })
      }

      return landingPage
    }),

  /**
   * Create new landing page
   */
  createLandingPage: partnerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        headline: z.string().optional(),
        subheadline: z.string().optional(),
        clubLogoUrl: z.string().url().optional().nullable(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        clubContact: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Check if slug is unique
      const existing = await ctx.db.partnerLandingPage.findUnique({
        where: {
          slug: input.slug,
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A landing page with this slug already exists',
        })
      }

      const landingPage = await ctx.db.partnerLandingPage.create({
        data: {
          partnerId: profile.id,
          name: input.name,
          slug: input.slug,
          headline: input.headline || null,
          subheadline: input.subheadline || null,
          clubLogoUrl: input.clubLogoUrl || null,
          primaryColor: input.primaryColor || '#003D5C',
          secondaryColor: input.secondaryColor || '#D4AF37',
          clubContact: input.clubContact || null,
          isPublished: false,
        },
      })

      return landingPage
    }),

  /**
   * Update landing page
   */
  updateLandingPage: partnerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
        headline: z.string().optional().nullable(),
        subheadline: z.string().optional().nullable(),
        clubLogoUrl: z.string().url().optional().nullable(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        clubContact: z.string().optional().nullable(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Verify ownership
      const existing = await ctx.db.partnerLandingPage.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Landing page not found',
        })
      }

      // Check slug uniqueness if changing
      if (input.slug && input.slug !== existing.slug) {
        const slugExists = await ctx.db.partnerLandingPage.findUnique({
          where: {
            slug: input.slug,
          },
        })

        if (slugExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A landing page with this slug already exists',
          })
        }
      }

      const { id, ...updateData } = input
      const landingPage = await ctx.db.partnerLandingPage.update({
        where: {
          id: input.id,
        },
        data: updateData,
      })

      return landingPage
    }),

  /**
   * Delete landing page
   */
  deleteLandingPage: partnerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      // Verify ownership
      const existing = await ctx.db.partnerLandingPage.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Landing page not found',
        })
      }

      await ctx.db.partnerLandingPage.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),

  /**
   * Get landing page by slug (public, no auth required)
   */
  getLandingPageBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const landingPage = await ctx.db.partnerLandingPage.findUnique({
        where: {
          slug: input.slug,
          isPublished: true,
        },
        include: {
          partner: {
            select: {
              clubName: true,
              referralCode: true,
            },
          },
        },
      })

      return landingPage
    }),

  /**
   * Track landing page view (public, no auth required)
   */
  trackLandingPageView: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const landingPage = await ctx.db.partnerLandingPage.findUnique({
        where: {
          slug: input.slug,
          isPublished: true,
        },
      })

      if (!landingPage) {
        return { success: false }
      }

      await ctx.db.partnerLandingPage.update({
        where: {
          id: landingPage.id,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Track landing page click (public, no auth required)
   */
  trackLandingPageClick: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const landingPage = await ctx.db.partnerLandingPage.findUnique({
        where: {
          slug: input.slug,
          isPublished: true,
        },
      })

      if (!landingPage) {
        return { success: false }
      }

      await ctx.db.partnerLandingPage.update({
        where: {
          id: landingPage.id,
        },
        data: {
          clickCount: {
            increment: 1,
          },
        },
      })

      return { success: true }
    }),

  // ============================================================================
  // E9-S10: Performance Analytics
  // ============================================================================

  /**
   * Get performance analytics with charts and trends
   * E9-S10: Performance Analytics
   */
  getPerformanceAnalytics: partnerProcedure
    .input(
      z
        .object({
          period: z.enum(['7d', '30d', '90d', '12m', 'all']).default('30d'),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
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

      // Calculate date range
      const now = new Date()
      let startDate: Date
      let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      if (input?.startDate && input?.endDate) {
        startDate = input.startDate
        endDate = input.endDate
      } else {
        const period = input?.period || '30d'
        switch (period) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case '12m':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            break
          case 'all':
          default:
            startDate = new Date(0) // All time
        }
      }

      // Get all referrals in period
      const referrals = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              totalPrice: true,
              createdAt: true,
              user: {
                select: {
                  applications: {
                    select: {
                      id: true,
                      createdAt: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Calculate funnel metrics
      const totalReferrals = referrals.length
      const applicationsCount = referrals.filter((r) => r.booking.user.applications?.[0]?.createdAt).length
      const bookingsCount = referrals.filter((r) => r.booking.status === 'CONFIRMED').length
      const completedCount = referrals.filter((r) => r.booking.status === 'COMPLETED').length

      // Calculate revenue
      const totalRevenue = referrals
        .filter((r) => r.booking.status === 'CONFIRMED')
        .reduce((sum, r) => sum + r.booking.totalPrice, 0)
      const averageBookingValue =
        bookingsCount > 0 ? Math.round(totalRevenue / bookingsCount) : 0

      // Calculate points
      const totalPointsEarned = referrals.reduce((sum, r) => sum + r.pointsEarned, 0)

      // Group by date for time-series data
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const groupBy = daysDiff <= 90 ? 'day' : daysDiff <= 365 ? 'week' : 'month'

      const timeSeriesMap = new Map<string, { referrals: number; revenue: number; bookings: number }>()

      referrals.forEach((r) => {
        let key: string
        const date = new Date(r.createdAt)

        if (groupBy === 'day') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate()
          ).padStart(2, '0')}`
        } else if (groupBy === 'week') {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getDate() + 6) / 7)).padStart(2, '0')}`
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }

        const existing = timeSeriesMap.get(key) || { referrals: 0, revenue: 0, bookings: 0 }
        timeSeriesMap.set(key, {
          referrals: existing.referrals + 1,
          revenue:
            existing.revenue + (r.booking.status === 'CONFIRMED' ? r.booking.totalPrice : 0),
          bookings: existing.bookings + (r.booking.status === 'CONFIRMED' ? 1 : 0),
        })
      })

      const timeSeriesData = Array.from(timeSeriesMap.entries())
        .map(([date, data]) => ({
          date,
          referrals: data.referrals,
          revenue: data.revenue,
          bookings: data.bookings,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Get previous period for comparison
      const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
      const previousPeriodEnd = startDate

      const previousReferrals = await ctx.db.partnerReferral.findMany({
        where: {
          partnerId: profile.id,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
        include: {
          booking: {
            select: {
              status: true,
              totalPrice: true,
            },
          },
        },
      })

      const previousTotalReferrals = previousReferrals.length
      const previousBookings = previousReferrals.filter(
        (r) => r.booking.status === 'CONFIRMED'
      ).length
      const previousRevenue = previousReferrals
        .filter((r) => r.booking.status === 'CONFIRMED')
        .reduce((sum, r) => sum + r.booking.totalPrice, 0)

      const referralsChange =
        previousTotalReferrals > 0
          ? Math.round(((totalReferrals - previousTotalReferrals) / previousTotalReferrals) * 100)
          : 0
      const bookingsChange =
        previousBookings > 0
          ? Math.round(((bookingsCount - previousBookings) / previousBookings) * 100)
          : 0
      const revenueChange =
        previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) : 0

      return {
        summary: {
          totalReferrals,
          applicationsCount,
          bookingsCount,
          completedCount,
          totalRevenue,
          averageBookingValue,
          totalPointsEarned,
          conversionRate: totalReferrals > 0 ? Math.round((bookingsCount / totalReferrals) * 100) : 0,
        },
        funnel: {
          referrals: totalReferrals,
          applications: applicationsCount,
          bookings: bookingsCount,
          completed: completedCount,
          applicationRate:
            totalReferrals > 0 ? Math.round((applicationsCount / totalReferrals) * 100) : 0,
          bookingRate:
            totalReferrals > 0 ? Math.round((bookingsCount / totalReferrals) * 100) : 0,
          completionRate:
            bookingsCount > 0 ? Math.round((completedCount / bookingsCount) * 100) : 0,
        },
        timeSeries: timeSeriesData,
        comparison: {
          referrals: {
            current: totalReferrals,
            previous: previousTotalReferrals,
            change: referralsChange,
          },
          bookings: {
            current: bookingsCount,
            previous: previousBookings,
            change: bookingsChange,
          },
          revenue: {
            current: totalRevenue,
            previous: previousRevenue,
            change: revenueChange,
          },
        },
        period: {
          startDate,
          endDate,
          groupBy,
        },
      }
    }),

  // ============================================================================
  // E9-S11: Payout Management
  // ============================================================================

  /**
   * Get payout settings (bank account info)
   */
  getPayoutSettings: partnerProcedure.query(async ({ ctx }) => {
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

    const payoutMethod = await ctx.db.partnerPayoutMethod.findUnique({
      where: {
        partnerId: profile.id,
      },
    })

    return payoutMethod
  }),

  /**
   * Save/update payout settings (bank account)
   */
  updatePayoutSettings: partnerProcedure
    .input(
      z.object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(4),
        routingNumber: z.string().min(9),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Extract last 4 digits for display
      const accountLast4 = input.accountNumber.slice(-4)

      const payoutMethod = await ctx.db.partnerPayoutMethod.upsert({
        where: {
          partnerId: profile.id,
        },
        create: {
          partnerId: profile.id,
          bankName: input.bankName,
          accountNumber: input.accountNumber, // TODO: Encrypt in production
          routingNumber: input.routingNumber, // TODO: Encrypt in production
          accountLast4,
        },
        update: {
          bankName: input.bankName,
          accountNumber: input.accountNumber, // TODO: Encrypt in production
          routingNumber: input.routingNumber, // TODO: Encrypt in production
          accountLast4,
        },
      })

      return payoutMethod
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: partnerProcedure.query(async ({ ctx }) => {
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

    const payouts = await ctx.db.partnerPayout.findMany({
      where: {
        partnerId: profile.id,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    })

    return payouts
  }),

  /**
   * Request payout
   */
  requestPayout: partnerProcedure
    .input(
      z.object({
        pointsToRedeem: z.number().min(5000, 'Minimum 5,000 points required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Check minimum points
      if (input.pointsToRedeem < 5000) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum 5,000 points required for payout',
        })
      }

      // Check sufficient balance
      if (profile.passportPoints < input.pointsToRedeem) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient points balance',
        })
      }

      // Check if bank account is set up
      const payoutMethod = await ctx.db.partnerPayoutMethod.findUnique({
        where: {
          partnerId: profile.id,
        },
      })

      if (!payoutMethod) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Bank account must be set up before requesting payout',
        })
      }

      // Calculate payout amount ($0.80 per point)
      const amountInCents = Math.round(input.pointsToRedeem * 0.80 * 100)

      // Create payout request and deduct points
      const payout = await ctx.db.$transaction(async (tx) => {
        // Create payout record
        const newPayout = await tx.partnerPayout.create({
          data: {
            partnerId: profile.id,
            pointsRedeemed: input.pointsToRedeem,
            amountInCents,
            status: 'PENDING',
            bankAccountLast4: payoutMethod.accountLast4,
          },
        })

        // Deduct points from partner profile
        await tx.partnerProfile.update({
          where: {
            id: profile.id,
          },
          data: {
            passportPoints: {
              decrement: input.pointsToRedeem,
            },
          },
        })

        return newPayout
      })

      return payout
    }),

  /**
   * Complete onboarding wizard
   * E9-S14: Partner Onboarding Flow
   */
  completeOnboarding: partnerProcedure.mutation(async ({ ctx }) => {
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

    // Update onboarding status
    const updated = await ctx.db.partnerProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        onboardingCompleted: true,
      },
    })

    return {
      success: true,
      onboardingCompleted: updated.onboardingCompleted,
    }
  }),

  /**
   * Update partner notification preferences
   * E11-S9: Partner Notification System
   */
  updateNotificationPreferences: partnerProcedure
    .input(
      z.object({
        preferences: z.record(z.string(), z.boolean()),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const updated = await ctx.db.partnerProfile.update({
        where: {
          id: profile.id,
        },
        data: {
          notificationPreferences: input.preferences,
        },
      })

      return {
        success: true,
        preferences: updated.notificationPreferences,
      }
    }),

  // ============================================================================
  // E9-S15: Partner Agreement E-Signature
  // ============================================================================

  /**
   * Get current agreement status and text
   * Returns the agreement document and whether the partner has signed it
   */
  getAgreement: partnerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: {
        userId: ctx.user!.id,
      },
      include: {
        agreements: {
          orderBy: {
            signedAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    // Current agreement version
    const currentVersion = '1.0'
    const latestSignedAgreement = profile.agreements[0]
    const hasSigned = latestSignedAgreement?.version === currentVersion

    return {
      currentVersion,
      hasSigned,
      signedAgreement: latestSignedAgreement || null,
      partnerId: profile.id,
      clubName: profile.clubName,
    }
  }),

  /**
   * Sign the partner agreement
   * Records the signature, timestamp, and IP address
   */
  signAgreement: partnerProcedure
    .input(
      z.object({
        signature: z.string().min(1, 'Signature is required'),
        agreedToTerms: z.boolean().refine((val) => val === true, {
          message: 'You must agree to the terms',
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: {
          userId: ctx.user!.id,
        },
        include: {
          agreements: {
            orderBy: {
              signedAt: 'desc',
            },
            take: 1,
          },
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      // Current agreement version
      const currentVersion = '1.0'

      // Check if already signed current version
      if (profile.agreements[0]?.version === currentVersion) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already signed the current agreement version',
        })
      }

      // Get IP address from headers
      const ipAddress = getIpAddress(ctx.headers)

      // Create the agreement record
      const agreement = await ctx.db.partnerAgreement.create({
        data: {
          partnerId: profile.id,
          version: currentVersion,
          signedAt: new Date(),
          ipAddress,
          signature: input.signature,
          documentUrl: '/content/partner-agreement.md',
        },
      })

      return {
        success: true,
        agreementId: agreement.id,
        signedAt: agreement.signedAt,
      }
    }),

  /**
   * Get all agreements for current partner (history)
   */
  getMyAgreements: partnerProcedure.query(async ({ ctx }) => {
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

    const agreements = await ctx.db.partnerAgreement.findMany({
      where: {
        partnerId: profile.id,
      },
      orderBy: {
        signedAt: 'desc',
      },
    })

    return agreements
  }),

  // ============================================================================
  // E9-S16: Partner Support Ticketing System
  // ============================================================================

  /**
   * Create a new support ticket
   */
  createTicket: partnerProcedure
    .input(
      z.object({
        subject: z.string().min(1, 'Subject is required').max(200),
        description: z.string().min(1, 'Description is required').max(5000),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const ticket = await ctx.db.partnerSupportTicket.create({
        data: {
          partnerId: profile.id,
          subject: input.subject,
          description: input.description,
          priority: input.priority,
          status: 'OPEN',
        },
      })

      // Send email notification to admin (non-blocking)
      try {
        const { sendPartnerTicketNotification } = await import('@/lib/email/sendgrid')
        await sendPartnerTicketNotification({
          ticketId: ticket.id,
          subject: input.subject,
          partnerName: profile.clubName,
          partnerEmail: profile.user.email,
          priority: input.priority,
        })
      } catch (error) {
        console.error('Failed to send ticket notification email:', error)
        // Don't fail the operation if email fails
      }

      return ticket
    }),

  /**
   * Get all support tickets for current partner
   */
  getTickets: partnerProcedure
    .input(
      z
        .object({
          status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
          limit: z.number().min(1).max(100).default(20),
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

      const where = {
        partnerId: profile.id,
        ...(input?.status && { status: input.status }),
      }

      const [tickets, total] = await Promise.all([
        ctx.db.partnerSupportTicket.findMany({
          where,
          include: {
            replies: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                createdAt: true,
                isStaff: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: input?.limit || 20,
          skip: input?.offset || 0,
        }),
        ctx.db.partnerSupportTicket.count({ where }),
      ])

      return {
        tickets: tickets.map((t) => ({
          ...t,
          lastReply: t.replies[0] || null,
          replyCount: t._count.replies,
        })),
        total,
        hasMore: (input?.offset || 0) + (input?.limit || 20) < total,
      }
    }),

  /**
   * Get single ticket with full conversation thread
   */
  getTicket: partnerProcedure
    .input(z.object({ id: z.string() }))
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

      const ticket = await ctx.db.partnerSupportTicket.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
        include: {
          replies: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        })
      }

      return ticket
    }),

  /**
   * Reply to a support ticket
   */
  replyToTicket: partnerProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(1, 'Message is required').max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Verify ticket belongs to partner
      const ticket = await ctx.db.partnerSupportTicket.findFirst({
        where: {
          id: input.ticketId,
          partnerId: profile.id,
        },
      })

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        })
      }

      // Don't allow replies to closed tickets
      if (ticket.status === 'CLOSED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot reply to a closed ticket',
        })
      }

      // Create reply and update ticket
      const reply = await ctx.db.partnerSupportReply.create({
        data: {
          ticketId: input.ticketId,
          userId: ctx.user!.id,
          message: input.message,
          isStaff: false,
        },
      })

      // Update ticket updatedAt
      await ctx.db.partnerSupportTicket.update({
        where: { id: input.ticketId },
        data: { updatedAt: new Date() },
      })

      return reply
    }),

  /**
   * Reopen a resolved ticket (within 7 days)
   */
  reopenTicket: partnerProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      const ticket = await ctx.db.partnerSupportTicket.findFirst({
        where: {
          id: input.ticketId,
          partnerId: profile.id,
        },
      })

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        })
      }

      // Can only reopen RESOLVED tickets
      if (ticket.status !== 'RESOLVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only reopen resolved tickets',
        })
      }

      // Check if within 7 days of resolution
      if (ticket.resolvedAt) {
        const daysSinceResolution = Math.floor(
          (Date.now() - ticket.resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceResolution > 7) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Tickets can only be reopened within 7 days of resolution',
          })
        }
      }

      const updatedTicket = await ctx.db.partnerSupportTicket.update({
        where: { id: input.ticketId },
        data: {
          status: 'OPEN',
          resolvedAt: null,
        },
      })

      return updatedTicket
    }),

  // ============================================================================
  // E9-S17: Partner Event Calendar
  // ============================================================================

  /**
   * Get all upcoming partner events
   */
  getEvents: partnerProcedure
    .input(
      z
        .object({
          eventType: z.enum(['WEBINAR', 'MEETUP', 'TRAINING', 'SUMMIT']).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          includeRegistered: z.boolean().optional(),
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

      const now = new Date()
      const where = {
        isActive: true,
        startDate: {
          gte: input?.startDate || now,
          ...(input?.endDate && { lte: input.endDate }),
        },
        ...(input?.eventType && { eventType: input.eventType }),
      }

      const events = await ctx.db.partnerEvent.findMany({
        where,
        include: {
          registrations: {
            where: {
              partnerId: profile.id,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      })

      return events.map((event) => ({
        ...event,
        isRegistered: event.registrations.length > 0,
        registrationId: event.registrations[0]?.id || null,
        spotsRemaining: event.maxAttendees
          ? event.maxAttendees - event._count.registrations
          : null,
        isFull: event.maxAttendees
          ? event._count.registrations >= event.maxAttendees
          : false,
      }))
    }),

  /**
   * Get a single event by ID
   */
  getEvent: partnerProcedure
    .input(z.object({ id: z.string() }))
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

      const event = await ctx.db.partnerEvent.findUnique({
        where: { id: input.id },
        include: {
          registrations: {
            where: {
              partnerId: profile.id,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      })

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      return {
        ...event,
        isRegistered: event.registrations.length > 0,
        registrationId: event.registrations[0]?.id || null,
        spotsRemaining: event.maxAttendees
          ? event.maxAttendees - event._count.registrations
          : null,
        isFull: event.maxAttendees
          ? event._count.registrations >= event.maxAttendees
          : false,
      }
    }),

  /**
   * Register for an event
   */
  registerForEvent: partnerProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      // Get event with current registrations
      const event = await ctx.db.partnerEvent.findUnique({
        where: { id: input.eventId },
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      })

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        })
      }

      if (!event.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This event is no longer active',
        })
      }

      // Check if already registered
      const existingRegistration = await ctx.db.partnerEventRegistration.findUnique({
        where: {
          eventId_partnerId: {
            eventId: input.eventId,
            partnerId: profile.id,
          },
        },
      })

      if (existingRegistration) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already registered for this event',
        })
      }

      // Check capacity
      if (
        event.maxAttendees &&
        event._count.registrations >= event.maxAttendees
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This event is at full capacity',
        })
      }

      // Check if event hasn't started yet
      if (new Date() > event.startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This event has already started',
        })
      }

      const registration = await ctx.db.partnerEventRegistration.create({
        data: {
          eventId: input.eventId,
          partnerId: profile.id,
        },
      })

      return registration
    }),

  /**
   * Unregister from an event
   */
  unregisterFromEvent: partnerProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      const registration = await ctx.db.partnerEventRegistration.findUnique({
        where: {
          eventId_partnerId: {
            eventId: input.eventId,
            partnerId: profile.id,
          },
        },
        include: {
          event: true,
        },
      })

      if (!registration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Registration not found',
        })
      }

      // Check if event hasn't started yet
      if (new Date() > registration.event.startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot unregister from an event that has already started',
        })
      }

      await ctx.db.partnerEventRegistration.delete({
        where: {
          id: registration.id,
        },
      })

      return { success: true }
    }),

  /**
   * Get partner's registered events
   */
  getMyRegistrations: partnerProcedure
    .input(
      z
        .object({
          includesPast: z.boolean().optional(),
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

      const now = new Date()
      const registrations = await ctx.db.partnerEventRegistration.findMany({
        where: {
          partnerId: profile.id,
          ...(input?.includesPast
            ? {}
            : {
                event: {
                  endDate: { gte: now },
                },
              }),
        },
        include: {
          event: {
            include: {
              _count: {
                select: {
                  registrations: true,
                },
              },
            },
          },
        },
        orderBy: {
          event: {
            startDate: 'asc',
          },
        },
      })

      return registrations.map((reg) => ({
        ...reg,
        event: {
          ...reg.event,
          spotsRemaining: reg.event.maxAttendees
            ? reg.event.maxAttendees - reg.event._count.registrations
            : null,
        },
      }))
    }),

  // ============================================================================
  // E9-S18: Partner Testimonials System
  // ============================================================================

  /**
   * Submit a new testimonial
   */
  submitTestimonial: partnerProcedure
    .input(
      z.object({
        content: z.string().min(1, 'Content is required').max(500, 'Maximum 500 characters'),
        rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      const testimonial = await ctx.db.partnerTestimonial.create({
        data: {
          partnerId: profile.id,
          content: input.content,
          rating: input.rating,
          isApproved: false,
          isFeatured: false,
        },
      })

      return testimonial
    }),

  /**
   * Get all testimonials for current partner
   */
  getMyTestimonials: partnerProcedure.query(async ({ ctx }) => {
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

    const testimonials = await ctx.db.partnerTestimonial.findMany({
      where: {
        partnerId: profile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return testimonials
  }),

  /**
   * Update a pending testimonial
   * Partners can only edit their own pending testimonials
   */
  updateTestimonial: partnerProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1, 'Content is required').max(500, 'Maximum 500 characters').optional(),
        rating: z.number().int().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Verify ownership and status
      const testimonial = await ctx.db.partnerTestimonial.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
      })

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        })
      }

      // Can only edit pending (not approved) testimonials
      if (testimonial.isApproved) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot edit approved testimonials',
        })
      }

      const { id, ...updateData } = input
      const updatedTestimonial = await ctx.db.partnerTestimonial.update({
        where: { id: input.id },
        data: updateData,
      })

      return updatedTestimonial
    }),

  /**
   * Delete a pending testimonial
   * Partners can only delete their own pending testimonials
   */
  deleteTestimonial: partnerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      // Verify ownership
      const testimonial = await ctx.db.partnerTestimonial.findFirst({
        where: {
          id: input.id,
          partnerId: profile.id,
        },
      })

      if (!testimonial) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testimonial not found',
        })
      }

      // Can only delete pending (not approved) testimonials
      if (testimonial.isApproved) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete approved testimonials',
        })
      }

      await ctx.db.partnerTestimonial.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Get featured testimonials (public procedure for marketing page)
   */
  getFeaturedTestimonials: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(6),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const testimonials = await ctx.db.partnerTestimonial.findMany({
        where: {
          isApproved: true,
          isFeatured: true,
        },
        include: {
          partner: {
            select: {
              clubName: true,
              clubLocation: true,
              tier: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
        take: input?.limit || 6,
      })

      return testimonials
    }),

  // ============================================================================
  // E9-S19: Partner Leaderboard
  // ============================================================================

  /**
   * Get partner leaderboard
   * Shows top performing partners ranked by points
   */
  getLeaderboard: partnerProcedure
    .input(
      z
        .object({
          timeframe: z.enum(['monthly', 'alltime']).default('monthly'),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const timeframe = input?.timeframe || 'monthly'
      const limit = input?.limit || 50

      // Get current partner's profile for highlighting
      const currentPartner = await ctx.db.partnerProfile.findUnique({
        where: { userId: ctx.user!.id },
        select: { id: true, showOnLeaderboard: true },
      })

      if (!currentPartner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      // Build date filter for monthly leaderboard
      let dateFilter: { gte?: Date } = {}
      if (timeframe === 'monthly') {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        dateFilter = { gte: startOfMonth }
      }

      // Get all partners with their referral data
      const partners = await ctx.db.partnerProfile.findMany({
        select: {
          id: true,
          clubName: true,
          clubLocation: true,
          tier: true,
          passportPoints: true,
          showOnLeaderboard: true,
          referrals: {
            where: timeframe === 'monthly' ? { createdAt: dateFilter } : {},
            select: {
              pointsEarned: true,
              createdAt: true,
            },
          },
        },
      })

      // Calculate points for each partner based on timeframe
      const partnerPoints = partners.map((partner) => {
        const points =
          timeframe === 'monthly'
            ? partner.referrals.reduce((sum, r) => sum + r.pointsEarned, 0)
            : partner.passportPoints

        return {
          id: partner.id,
          clubName: partner.showOnLeaderboard ? partner.clubName : 'Anonymous Partner',
          clubLocation: partner.showOnLeaderboard ? partner.clubLocation : null,
          tier: partner.tier,
          points,
          isCurrentPartner: partner.id === currentPartner.id,
          isAnonymous: !partner.showOnLeaderboard,
        }
      })

      // Sort by points (descending)
      partnerPoints.sort((a, b) => b.points - a.points)

      // Assign ranks (handle ties)
      let currentRank = 1
      let previousPoints = -1
      const rankedPartners = partnerPoints.map((partner, index) => {
        if (partner.points !== previousPoints) {
          currentRank = index + 1
        }
        previousPoints = partner.points
        return {
          ...partner,
          rank: currentRank,
        }
      })

      // Find current partner's rank (even if not in top results)
      const currentPartnerEntry = rankedPartners.find((p) => p.isCurrentPartner)
      const currentPartnerRank = currentPartnerEntry?.rank || null

      // Return top partners and current partner info
      return {
        leaderboard: rankedPartners.slice(0, limit),
        currentPartnerRank,
        currentPartnerPoints: currentPartnerEntry?.points || 0,
        currentPartnerShowOnLeaderboard: currentPartner.showOnLeaderboard,
        timeframe,
        totalPartners: rankedPartners.length,
      }
    }),

  /**
   * Update partner's leaderboard visibility preference
   */
  updateLeaderboardVisibility: partnerProcedure
    .input(
      z.object({
        showOnLeaderboard: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.partnerProfile.findUnique({
        where: { userId: ctx.user!.id },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Partner profile not found',
        })
      }

      await ctx.db.partnerProfile.update({
        where: { id: profile.id },
        data: { showOnLeaderboard: input.showOnLeaderboard },
      })

      return { success: true, showOnLeaderboard: input.showOnLeaderboard }
    }),

  /**
   * Get partner's leaderboard settings
   */
  getLeaderboardSettings: partnerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: { userId: ctx.user!.id },
      select: { showOnLeaderboard: true },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    return { showOnLeaderboard: profile.showOnLeaderboard }
  }),

  // ============================================================================
  // E4-S14: Stripe Connect Partner Payouts
  // ============================================================================

  /**
   * Get partner's Stripe Connect status
   * Returns current onboarding status, account details, and whether payouts are enabled
   */
  getStripeConnectStatus: partnerProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: { userId: ctx.user!.id },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeConnectOnboardingComplete: true,
        stripeConnectAccountType: true,
        stripeConnectPayoutsEnabled: true,
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    // Check if Stripe Connect is configured for the platform
    const isConfigured = isStripeConnectConfigured()

    // If partner has a Stripe account, fetch latest status from Stripe
    let stripeAccountStatus = null
    if (profile.stripeConnectAccountId) {
      try {
        stripeAccountStatus = await getConnectAccountStatus(profile.stripeConnectAccountId)
      } catch {
        // Account may have been deleted or is inaccessible
        stripeAccountStatus = null
      }
    }

    return {
      isStripeConnectConfigured: isConfigured,
      hasStripeAccount: !!profile.stripeConnectAccountId,
      accountId: profile.stripeConnectAccountId,
      onboardingComplete: profile.stripeConnectOnboardingComplete,
      accountType: profile.stripeConnectAccountType,
      payoutsEnabled: profile.stripeConnectPayoutsEnabled,
      stripeAccountStatus,
    }
  }),

  /**
   * Create a Stripe Connect account and get onboarding link
   * Called when partner initiates Stripe Connect setup
   */
  createStripeConnectAccount: partnerProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: { userId: ctx.user!.id },
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

    // Check if already has a Stripe Connect account
    if (profile.stripeConnectAccountId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Stripe Connect account already exists. Use getStripeConnectOnboardingLink to continue onboarding.',
      })
    }

    // Check if Stripe Connect is configured
    if (!isStripeConnectConfigured()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Stripe Connect is not configured for this platform',
      })
    }

    // Create the Stripe Connect account
    const { accountId, accountType } = await createConnectAccount({
      partnerId: profile.id,
      email: profile.user.email,
      businessName: profile.clubName,
      accountType: 'express',
    })

    // Save account ID to partner profile
    await ctx.db.partnerProfile.update({
      where: { id: profile.id },
      data: {
        stripeConnectAccountId: accountId,
        stripeConnectAccountType: accountType,
      },
    })

    // Generate onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { url, expiresAt } = await createAccountLink({
      accountId,
      refreshUrl: `${baseUrl}/dashboard/partner/payouts?stripe_refresh=true`,
      returnUrl: `${baseUrl}/dashboard/partner/payouts?stripe_return=true`,
    })

    return {
      success: true,
      accountId,
      onboardingUrl: url,
      expiresAt,
    }
  }),

  /**
   * Get a new onboarding link for an existing Stripe Connect account
   * Used when partner needs to continue or redo onboarding
   */
  getStripeConnectOnboardingLink: partnerProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: { userId: ctx.user!.id },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeConnectOnboardingComplete: true,
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    if (!profile.stripeConnectAccountId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No Stripe Connect account exists. Use createStripeConnectAccount first.',
      })
    }

    // Generate new onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { url, expiresAt } = await createAccountLink({
      accountId: profile.stripeConnectAccountId,
      refreshUrl: `${baseUrl}/dashboard/partner/payouts?stripe_refresh=true`,
      returnUrl: `${baseUrl}/dashboard/partner/payouts?stripe_return=true`,
    })

    return {
      onboardingUrl: url,
      expiresAt,
    }
  }),

  /**
   * Get Stripe Express Dashboard link for partner
   * Allows partner to access their Stripe dashboard to manage payouts
   */
  getStripeConnectDashboardLink: partnerProcedure.mutation(async ({ ctx }) => {
    const profile = await ctx.db.partnerProfile.findUnique({
      where: { userId: ctx.user!.id },
      select: {
        stripeConnectAccountId: true,
        stripeConnectOnboardingComplete: true,
      },
    })

    if (!profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Partner profile not found',
      })
    }

    if (!profile.stripeConnectAccountId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No Stripe Connect account exists',
      })
    }

    if (!profile.stripeConnectOnboardingComplete) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Stripe Connect onboarding must be completed before accessing dashboard',
      })
    }

    const dashboardUrl = await createLoginLink(profile.stripeConnectAccountId)

    return {
      dashboardUrl,
    }
  }),
})

/**
 * Helper: Generate referral code from club name and first name
 * Format: {CLUB_SLUG}-{FIRST_NAME_PREFIX}-{YEAR}
 * Example: VILLAGES-JEN-2026
 */
function generateReferralCode(clubName: string, firstName: string): string {
  const year = new Date().getFullYear()

  // Slugify club name: uppercase, remove special chars, replace spaces with hyphens
  const clubSlug = clubName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // Use first 3 letters of first name
  const namePrefix = firstName.substring(0, 3).toUpperCase()

  return `${clubSlug}-${namePrefix}-${year}`
}

/**
 * Helper: Ensure referral code is unique in database
 * If code exists, append suffix (-2, -3, etc.)
 */
async function ensureUniqueReferralCode(
  db: any,
  baseCode: string
): Promise<string> {
  let code = baseCode
  let suffix = 1

  while (true) {
    const existing = await db.partnerProfile.findUnique({
      where: { referralCode: code },
    })

    if (!existing) {
      return code
    }

    suffix++
    code = `${baseCode}-${suffix}`
  }
}

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
