/**
 * WhatsApp Milestone Messages Job
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Sends pre-trip WhatsApp milestone messages to guests who have joined
 * the trip's WhatsApp group. Runs daily to check for milestones:
 * - 60 days before trip
 * - 30 days before trip
 * - 14 days before trip
 * - 7 days before trip
 * - 1 day before trip
 *
 * Similar to lib/email/send-pre-trip-emails.ts but for WhatsApp.
 */

import { addDays, startOfDay, endOfDay } from 'date-fns';
import { prisma } from '@/lib/db';
import { sendMessage, isConfigured } from '@/lib/whatsapp/client';
import { whatsappLogger } from '@/lib/logger';
import {
  generateMilestoneMessage,
  WHATSAPP_MILESTONES,
  type WhatsAppMilestoneKey,
  type MilestoneMessageData,
} from '@/lib/whatsapp/templates/milestone-messages';

// ============================================================================
// TYPES
// ============================================================================

export interface SendMilestoneMessagesResult {
  totalProcessed: number;
  messagesSent: number;
  errors: number;
  skipped: number;
  byMilestone: Record<string, { sent: number; errors: number }>;
  details: Array<{
    bookingId: string;
    bookingReference: string;
    milestone: string;
    result: 'sent' | 'error' | 'skipped';
    error?: string;
  }>;
}

interface ProcessMilestoneResult {
  processed: number;
  sent: number;
  errors: number;
  skipped: number;
  details: SendMilestoneMessagesResult['details'];
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Check and send milestone WhatsApp messages for all milestones
 *
 * This function:
 * 1. Checks if WhatsApp is configured
 * 2. Processes each milestone (60, 30, 14, 7, 1 days)
 * 3. Finds bookings at each milestone that:
 *    - Have joined the WhatsApp group
 *    - Haven't received this milestone message yet
 * 4. Sends the appropriate milestone message
 * 5. Tracks sent milestones in the booking record
 */
export async function checkAndSendMilestoneMessages(): Promise<SendMilestoneMessagesResult> {
  const today = startOfDay(new Date());

  whatsappLogger.info('Starting WhatsApp milestone messages job');

  const result: SendMilestoneMessagesResult = {
    totalProcessed: 0,
    messagesSent: 0,
    errors: 0,
    skipped: 0,
    byMilestone: {},
    details: [],
  };

  // Check if WhatsApp is configured
  if (!isConfigured()) {
    whatsappLogger.warn('WhatsApp not configured - milestone messages job skipped');
    return result;
  }

  // Process each milestone
  for (const milestone of Object.values(WHATSAPP_MILESTONES)) {
    const milestoneResult = await processOneMilestone(
      today,
      milestone.key,
      milestone.daysBeforeTrip
    );

    result.totalProcessed += milestoneResult.processed;
    result.messagesSent += milestoneResult.sent;
    result.errors += milestoneResult.errors;
    result.skipped += milestoneResult.skipped;
    result.byMilestone[milestone.key] = {
      sent: milestoneResult.sent,
      errors: milestoneResult.errors,
    };
    result.details.push(...milestoneResult.details);
  }

  whatsappLogger.info(
    {
      totalProcessed: result.totalProcessed,
      messagesSent: result.messagesSent,
      errors: result.errors,
      skipped: result.skipped,
    },
    'WhatsApp milestone messages job complete'
  );

  return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Process a single milestone (e.g., 60 days, 30 days, etc.)
 */
async function processOneMilestone(
  today: Date,
  milestoneKey: WhatsAppMilestoneKey,
  daysBeforeTrip: number
): Promise<ProcessMilestoneResult> {
  // Calculate target trip start date for this milestone
  const targetTripDate = addDays(today, daysBeforeTrip);
  const targetStart = startOfDay(targetTripDate);
  const targetEnd = endOfDay(targetTripDate);

  whatsappLogger.debug(
    {
      milestoneKey,
      daysBeforeTrip,
      targetDate: targetTripDate.toISOString().split('T')[0],
    },
    'Processing milestone'
  );

  // Find eligible bookings:
  // - Confirmed status
  // - Trip has active WhatsApp group
  // - Guest has joined the WhatsApp group
  // - Haven't received this milestone message yet
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      tripId: { not: null },
      // Guest must have joined the WhatsApp group
      whatsappGroupJoinedAt: { not: null },
      // Trip starts in exactly X days
      trip: {
        startDate: {
          gte: targetStart,
          lte: targetEnd,
        },
        // Trip must have active WhatsApp group
        whatsappGroupStatus: 'ACTIVE',
      },
      // Skip unaccepted gift bookings
      OR: [{ isGift: false }, { isGift: true, giftStatus: 'ACCEPTED' }],
    },
    include: {
      user: {
        include: {
          guestProfile: true,
        },
      },
      package: true,
      trip: true,
    },
  });

  const result: ProcessMilestoneResult = {
    processed: bookings.length,
    sent: 0,
    errors: 0,
    skipped: 0,
    details: [],
  };

  // Process each booking
  for (const booking of bookings) {
    const detail: (typeof result.details)[number] = {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      milestone: milestoneKey,
      result: 'sent',
    };

    try {
      // Get existing milestones sent (stored as JSON)
      const existingMilestones = (booking.whatsappMilestonesSent as Record<string, boolean>) || {};

      // Skip if this milestone was already sent
      if (existingMilestones[milestoneKey]) {
        detail.result = 'skipped';
        detail.error = 'Milestone already sent';
        result.skipped++;
        result.details.push(detail);
        continue;
      }

      // Get guest phone number
      const guestPhone = booking.user.guestProfile?.phone;
      if (!guestPhone) {
        detail.result = 'skipped';
        detail.error = 'No phone number on file';
        result.skipped++;
        result.details.push(detail);
        continue;
      }

      // Build message data
      const messageData: MilestoneMessageData = {
        guestName: booking.user.guestProfile?.firstName || 'Guest',
        tripName: booking.trip!.name,
        destination: booking.trip!.destination,
        startDate: formatDate(booking.trip!.startDate),
        endDate: formatDate(booking.trip!.endDate),
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard`,
        accommodationTier: booking.accommodationTier,
      };

      // Generate milestone message
      const message = generateMilestoneMessage(messageData, milestoneKey);

      // Send WhatsApp message
      const sendResult = await sendMessage(guestPhone, message);

      if (sendResult.success) {
        // Update booking to track sent milestone
        const updatedMilestones = { ...existingMilestones, [milestoneKey]: true };
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            whatsappMilestonesSent: updatedMilestones,
          },
        });

        detail.result = 'sent';
        result.sent++;

        whatsappLogger.info(
          {
            bookingId: booking.id,
            milestoneKey,
            messageId: sendResult.messageId,
          },
          'Milestone message sent'
        );
      } else {
        detail.result = 'error';
        detail.error = sendResult.error;
        result.errors++;

        whatsappLogger.warn(
          {
            bookingId: booking.id,
            milestoneKey,
            error: sendResult.error,
          },
          'Failed to send milestone message'
        );
      }
    } catch (error) {
      detail.result = 'error';
      detail.error = error instanceof Error ? error.message : 'Unknown error';
      result.errors++;

      whatsappLogger.error(
        {
          bookingId: booking.id,
          milestoneKey,
          error: error instanceof Error ? error.message : String(error),
        },
        'Error processing milestone message'
      );
    }

    result.details.push(detail);
  }

  whatsappLogger.debug(
    {
      milestoneKey,
      processed: result.processed,
      sent: result.sent,
      errors: result.errors,
      skipped: result.skipped,
    },
    'Milestone processing complete'
  );

  return result;
}

/**
 * Format a date for display in messages
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
