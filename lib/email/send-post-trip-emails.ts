/**
 * Send Post-Trip Emails Service
 * E15: Post-Trip Email Sequence (COMM-03)
 *
 * Finds COMPLETED bookings at each milestone (3, 7, 14, 30, 60 days after trip ends)
 * and sends the appropriate follow-up email.
 */

import { addDays, startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-email'
import { canSendNotification } from '@/lib/preferences/user-preferences'
import {
  generatePostTripEmail,
  PostTripEmailData,
  POST_TRIP_MILESTONES,
  PostTripMilestoneKey,
} from '@/lib/email/templates/post-trip-sequence'

export interface SendPostTripEmailsResult {
  totalProcessed: number
  emailsSent: number
  errors: number
  skipped: number
  byMilestone: Record<string, { sent: number; errors: number }>
  details: Array<{
    bookingId: string
    bookingReference: string
    milestone: string
    result: 'sent' | 'error' | 'skipped'
    error?: string
  }>
}

/**
 * Send post-trip emails for all milestones
 */
export async function sendPostTripEmails(): Promise<SendPostTripEmailsResult> {
  const today = startOfDay(new Date())

  console.log('[PostTripEmails] Starting post-trip email job')

  const result: SendPostTripEmailsResult = {
    totalProcessed: 0,
    emailsSent: 0,
    errors: 0,
    skipped: 0,
    byMilestone: {},
    details: [],
  }

  // Process each milestone
  for (const milestone of Object.values(POST_TRIP_MILESTONES)) {
    const milestoneResult = await processOneMilestone(today, milestone.key, milestone.daysAfterTrip)

    result.totalProcessed += milestoneResult.processed
    result.emailsSent += milestoneResult.sent
    result.errors += milestoneResult.errors
    result.skipped += milestoneResult.skipped
    result.byMilestone[milestone.key] = { sent: milestoneResult.sent, errors: milestoneResult.errors }
    result.details.push(...milestoneResult.details)
  }

  console.log('[PostTripEmails] Job complete', {
    totalProcessed: result.totalProcessed,
    emailsSent: result.emailsSent,
    errors: result.errors,
    skipped: result.skipped,
  })

  return result
}

/**
 * Process a single milestone (e.g., 3 days, 7 days, etc.)
 */
async function processOneMilestone(
  today: Date,
  milestoneKey: PostTripMilestoneKey,
  daysAfterTrip: number
): Promise<{
  processed: number
  sent: number
  errors: number
  skipped: number
  details: SendPostTripEmailsResult['details']
}> {
  // Calculate target trip end date for this milestone
  // If today is the 10th and milestone is 3 days after, we look for trips that ended on the 7th
  const targetTripEndDate = addDays(today, -daysAfterTrip)
  const targetStart = startOfDay(targetTripEndDate)
  const targetEnd = endOfDay(targetTripEndDate)

  console.log(`[PostTripEmails] Processing ${milestoneKey} milestone (trips ended ${targetTripEndDate.toISOString().split('T')[0]})`)

  // Find eligible bookings - COMPLETED bookings where trip ended X days ago
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      tripId: { not: null },
      // Trip ended exactly X days ago
      trip: {
        endDate: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
      // Haven't sent this milestone email yet
      NOT: {
        postTripEmailsSent: {
          has: milestoneKey,
        },
      },
      // Skip unaccepted gift bookings
      OR: [
        { isGift: false },
        { isGift: true, giftStatus: 'ACCEPTED' },
      ],
    },
    include: {
      user: true,
      package: true,
      trip: true,
    },
    take: 100, // Safety limit per milestone
  })

  console.log(`[PostTripEmails] Found ${bookings.length} bookings for ${milestoneKey}`)

  const details: SendPostTripEmailsResult['details'] = []
  let sent = 0
  let errors = 0
  let skipped = 0

  for (const booking of bookings) {
    // Get user email
    const userEmail = booking.user?.email
    if (!userEmail) {
      console.warn(`[PostTripEmails] No email for booking ${booking.bookingReference}`)
      skipped++
      details.push({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        milestone: milestoneKey,
        result: 'skipped',
        error: 'No email address',
      })
      continue
    }

    // Verify trip exists
    if (!booking.trip) {
      console.warn(`[PostTripEmails] No trip for booking ${booking.bookingReference}`)
      skipped++
      details.push({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        milestone: milestoneKey,
        result: 'skipped',
        error: 'No trip assigned',
      })
      continue
    }

    // Check user preferences before sending
    try {
      const canSend = await canSendNotification(booking.userId, 'emailPostTripFollowUp')
      if (!canSend) {
        console.log(`[PostTripEmails] User ${booking.userId} opted out of post-trip emails`)
        skipped++
        details.push({
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          milestone: milestoneKey,
          result: 'skipped',
          error: 'User opted out (emailPostTripFollowUp)',
        })
        continue
      }
    } catch (prefError) {
      // If we can't get preferences, log but continue (fail open)
      console.warn(`[PostTripEmails] Could not check preferences for ${booking.userId}:`, prefError)
    }

    try {
      // Get guest first name
      const guestProfile = await prisma.guestProfile.findUnique({
        where: { userId: booking.userId },
        select: { firstName: true },
      })
      const firstName = guestProfile?.firstName || 'Guest'

      // Prepare email data
      const emailData: PostTripEmailData = {
        firstName,
        email: userEmail,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        tripStartDate: booking.trip.startDate.toISOString(),
        tripEndDate: booking.trip.endDate?.toISOString() || booking.trip.startDate.toISOString(),
        destination: booking.trip.destination || 'Chiang Mai, Thailand',
        testimonialUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/testimonials/submit`,
        rebookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }

      // Generate and send email
      const { html, text, subject } = generatePostTripEmail(emailData, milestoneKey)

      await sendEmail({
        to: userEmail,
        subject,
        html,
        text,
      })

      // Mark email as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          postTripEmailsSent: {
            push: milestoneKey,
          },
        },
      })

      console.log(`[PostTripEmails] Sent ${milestoneKey} email to ${userEmail} for ${booking.bookingReference}`)

      sent++
      details.push({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        milestone: milestoneKey,
        result: 'sent',
      })
    } catch (error) {
      console.error(`[PostTripEmails] Error sending ${milestoneKey} email for ${booking.bookingReference}:`, error)

      errors++
      details.push({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        milestone: milestoneKey,
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    processed: bookings.length,
    sent,
    errors,
    skipped,
    details,
  }
}
