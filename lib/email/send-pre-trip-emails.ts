/**
 * Send Pre-Trip Emails Service
 * E11-S4: Pre-Trip Email Sequence
 *
 * Finds bookings at each milestone (60, 30, 14, 7, 1 days before trip)
 * and sends the appropriate nurture email.
 */

import { addDays, startOfDay, endOfDay, differenceInDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-email'
import {
  generatePreTripEmail,
  PreTripEmailData,
  PRE_TRIP_MILESTONES,
  PreTripMilestoneKey,
} from '@/lib/email/templates/pre-trip-sequence'

export interface SendPreTripEmailsResult {
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
 * Send pre-trip emails for all milestones
 */
export async function sendPreTripEmails(): Promise<SendPreTripEmailsResult> {
  const today = startOfDay(new Date())

  console.log('[PreTripEmails] Starting pre-trip email job')

  const result: SendPreTripEmailsResult = {
    totalProcessed: 0,
    emailsSent: 0,
    errors: 0,
    skipped: 0,
    byMilestone: {},
    details: [],
  }

  // Process each milestone
  for (const milestone of Object.values(PRE_TRIP_MILESTONES)) {
    const milestoneResult = await processOneMilestone(today, milestone.key, milestone.daysBeforeTrip)
    
    result.totalProcessed += milestoneResult.processed
    result.emailsSent += milestoneResult.sent
    result.errors += milestoneResult.errors
    result.skipped += milestoneResult.skipped
    result.byMilestone[milestone.key] = { sent: milestoneResult.sent, errors: milestoneResult.errors }
    result.details.push(...milestoneResult.details)
  }

  console.log('[PreTripEmails] Job complete', {
    totalProcessed: result.totalProcessed,
    emailsSent: result.emailsSent,
    errors: result.errors,
    skipped: result.skipped,
  })

  return result
}

/**
 * Process a single milestone (e.g., 60 days, 30 days, etc.)
 */
async function processOneMilestone(
  today: Date,
  milestoneKey: PreTripMilestoneKey,
  daysBeforeTrip: number
): Promise<{
  processed: number
  sent: number
  errors: number
  skipped: number
  details: SendPreTripEmailsResult['details']
}> {
  // Calculate target trip start date for this milestone
  const targetTripDate = addDays(today, daysBeforeTrip)
  const targetStart = startOfDay(targetTripDate)
  const targetEnd = endOfDay(targetTripDate)

  console.log(`[PreTripEmails] Processing ${milestoneKey} milestone (trips starting ${targetTripDate.toISOString().split('T')[0]})`)

  // Find eligible bookings
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      tripId: { not: null },
      // Trip starts in exactly X days
      trip: {
        startDate: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
      // Haven't sent this milestone email yet
      NOT: {
        preTripEmailsSent: {
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

  console.log(`[PreTripEmails] Found ${bookings.length} bookings for ${milestoneKey}`)

  const details: SendPreTripEmailsResult['details'] = []
  let sent = 0
  let errors = 0
  let skipped = 0

  for (const booking of bookings) {
    // Get user email
    const userEmail = booking.user?.email
    if (!userEmail) {
      console.warn(`[PreTripEmails] No email for booking ${booking.bookingReference}`)
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
      console.warn(`[PreTripEmails] No trip for booking ${booking.bookingReference}`)
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

    try {
      // Get guest first name
      const guestProfile = await prisma.guestProfile.findUnique({
        where: { userId: booking.userId },
        select: { firstName: true },
      })
      const firstName = guestProfile?.firstName || 'Guest'

      // Calculate trip duration
      const duration = booking.trip.endDate 
        ? differenceInDays(booking.trip.endDate, booking.trip.startDate) + 1
        : booking.duration

      // Prepare email data
      const emailData: PreTripEmailData = {
        firstName,
        email: userEmail,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        tripStartDate: booking.trip.startDate.toISOString(),
        tripEndDate: booking.trip.endDate?.toISOString() || addDays(booking.trip.startDate, duration - 1).toISOString(),
        destination: booking.trip.destination || 'Chiang Mai, Thailand',
        accommodationTier: booking.accommodationTier,
        duration,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
        checklistUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}#checklist`,
      }

      // Generate and send email
      const { html, text, subject } = generatePreTripEmail(emailData, milestoneKey)

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
          preTripEmailsSent: {
            push: milestoneKey,
          },
        },
      })

      console.log(`[PreTripEmails] Sent ${milestoneKey} email to ${userEmail} for ${booking.bookingReference}`)

      sent++
      details.push({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        milestone: milestoneKey,
        result: 'sent',
      })
    } catch (error) {
      console.error(`[PreTripEmails] Error sending ${milestoneKey} email for ${booking.bookingReference}:`, error)

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
