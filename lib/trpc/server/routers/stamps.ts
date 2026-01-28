/**
 * Stamps Router (Phase 13)
 *
 * tRPC procedures for passport stamp management:
 * - Get all stamp definitions
 * - Get user's earned stamps
 * - Check eligibility and award new stamps
 */

import { z } from 'zod'
import { router, guestProcedure, publicProcedure } from '../trpc'
import { PASSPORT_STAMPS_CONFIG } from '@/lib/config/business-constants'

// Trigger types for stamp evaluation
const triggerTypeSchema = z.enum([
  'TRIP_COMPLETED',
  'REFERRAL_COMPLETED',
  'TESTIMONIAL_APPROVED',
  'PHOTO_UPLOADED',
])

export const stampsRouter = router({
  /**
   * Get all active stamp definitions
   *
   * Returns list of all stamps that can be earned,
   * ordered by sortOrder.
   */
  getDefinitions: publicProcedure.query(async ({ ctx }) => {
    const definitions = await ctx.db.passportStampDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return definitions
  }),

  /**
   * Get user's earned stamps
   *
   * Returns all stamps the current user has earned,
   * including stamp details and earned date.
   */
  getMyStamps: guestProcedure.query(async ({ ctx }) => {
    const earnedStamps = await ctx.db.userPassportStamp.findMany({
      where: { userId: ctx.user.id },
      include: {
        stamp: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    return earnedStamps
  }),

  /**
   * Check eligibility and award stamps
   *
   * Evaluates user's progress against stamp criteria and
   * awards any newly earned stamps.
   *
   * @param triggerType - What triggered the check (trip completed, referral, etc.)
   * @returns Newly awarded stamps and already earned stamp codes
   */
  checkAndAward: guestProcedure
    .input(
      z.object({
        triggerType: triggerTypeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id

      // Get all active stamp definitions
      const allStamps = await ctx.db.passportStampDefinition.findMany({
        where: { isActive: true },
      })

      // Get user's already earned stamps
      const earnedStampRecords = await ctx.db.userPassportStamp.findMany({
        where: { userId },
        select: { stampId: true },
      })
      const earnedStampIds = new Set(earnedStampRecords.map((s) => s.stampId))

      // Filter to unearned stamps
      const unearnedStamps = allStamps.filter((s) => !earnedStampIds.has(s.id))

      // Calculate current progress based on trigger type
      const progress = await calculateProgress(ctx.db, userId, input.triggerType)

      // Determine which stamps should be awarded
      const stampsToAward: typeof unearnedStamps = []

      for (const stamp of unearnedStamps) {
        const criteria = stamp.unlockCriteria as { type: string; count: number }

        // Check if trigger is relevant for this stamp
        if (!isRelevantTrigger(criteria.type, input.triggerType)) {
          continue
        }

        // Check if criteria is met
        const currentCount = progress[criteria.type] || 0
        if (currentCount >= criteria.count) {
          stampsToAward.push(stamp)
        }
      }

      // Award the new stamps
      const newStamps = []
      for (const stamp of stampsToAward) {
        await ctx.db.userPassportStamp.create({
          data: {
            userId,
            stampId: stamp.id,
          },
        })
        newStamps.push(stamp)
      }

      return {
        newStamps,
        alreadyEarned: Array.from(earnedStampIds),
      }
    }),
})

/**
 * Calculate user's current progress for stamp criteria
 */
async function calculateProgress(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  userId: string,
  triggerType: z.infer<typeof triggerTypeSchema>
): Promise<Record<string, number>> {
  const progress: Record<string, number> = {}

  // Always calculate relevant metrics based on trigger type
  switch (triggerType) {
    case 'TRIP_COMPLETED': {
      // Count completed bookings
      const completedCount = await db.booking.count({
        where: {
          userId,
          status: 'COMPLETED',
          deletedAt: null,
        },
      })
      progress['TRIPS_COMPLETED'] = completedCount
      break
    }

    case 'REFERRAL_COMPLETED': {
      // Count referrals that resulted in completed trips
      const referralsCount = await db.guestReferral.count({
        where: {
          referrerUserId: userId,
          status: 'COMPLETED',
        },
      })
      progress['REFERRALS_COMPLETED'] = referralsCount
      break
    }

    case 'TESTIMONIAL_APPROVED': {
      // Count approved testimonials
      const testimonialCount = await db.guestTestimonial.count({
        where: {
          guestId: userId,
          status: { in: ['APPROVED', 'PUBLISHED'] },
        },
      })
      progress['TESTIMONIAL_APPROVED'] = testimonialCount
      break
    }

    case 'PHOTO_UPLOADED': {
      // Count total photos uploaded by user
      const photoCount = await db.tripPhoto.count({
        where: {
          uploadedBy: userId,
        },
      })
      progress['PHOTOS_UPLOADED'] = photoCount
      break
    }
  }

  return progress
}

/**
 * Check if a trigger type is relevant for a criteria type
 */
function isRelevantTrigger(
  criteriaType: string,
  triggerType: z.infer<typeof triggerTypeSchema>
): boolean {
  const mapping: Record<string, z.infer<typeof triggerTypeSchema>> = {
    TRIPS_COMPLETED: 'TRIP_COMPLETED',
    REFERRALS_COMPLETED: 'REFERRAL_COMPLETED',
    TESTIMONIAL_APPROVED: 'TESTIMONIAL_APPROVED',
    PHOTOS_UPLOADED: 'PHOTO_UPLOADED',
  }

  return mapping[criteriaType] === triggerType
}
