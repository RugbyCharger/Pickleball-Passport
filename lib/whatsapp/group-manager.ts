/**
 * WhatsApp Group Manager Service
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Provides utilities for managing trip WhatsApp groups:
 * - Creating trip groups (manual for MVP - admin enters invite link)
 * - Inviting guests to groups after booking
 * - Broadcasting messages to trip groups
 *
 * Note: For MVP, group creation is manual (admin creates group externally,
 * enters invite link via admin UI). Automated group creation via WhatsApp
 * Business Platform can be added later.
 */

import { prisma } from '@/lib/db';
import { sendMessage, whatsappLogger, isConfigured } from './client';
import {
  generateTripGroupInvitationMessage,
  type TripGroupInvitationData,
} from './templates';
import { logError } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTripGroupResult {
  success: boolean;
  tripId: string;
  whatsappGroupId?: string;
  whatsappGroupInviteLink?: string;
  error?: string;
}

export interface InviteGuestResult {
  success: boolean;
  bookingId: string;
  messageId?: string;
  error?: string;
}

export interface SendBroadcastResult {
  success: boolean;
  tripId: string;
  totalGuests: number;
  successfulSends: number;
  failedSends: number;
  errors?: string[];
}

// Minimum confirmed bookings required before creating a WhatsApp group
const MIN_BOOKINGS_FOR_GROUP = 3;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with exponential backoff retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        whatsappLogger.warn(
          { attempt, maxRetries: MAX_RETRIES, delay, context },
          `Retry attempt ${attempt} failed, waiting ${delay}ms before retry`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
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

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Create a WhatsApp group for a trip
 *
 * For MVP: This function activates a trip's WhatsApp group status when the
 * trip has 3+ confirmed bookings AND an invite link has been manually set.
 *
 * The actual WhatsApp group is created externally by an admin, who then
 * enters the invite link via the admin UI.
 *
 * @param tripId - The trip ID to create a group for
 * @returns Result object with success status
 *
 * @example
 * const result = await createTripGroup('trip_123');
 * if (result.success) {
 *   console.log('Group activated:', result.whatsappGroupInviteLink);
 * }
 */
export async function createTripGroup(
  tripId: string
): Promise<CreateTripGroupResult> {
  whatsappLogger.info({ tripId }, 'Checking trip eligibility for WhatsApp group');

  try {
    // Get trip with booking count
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    });

    if (!trip) {
      whatsappLogger.warn({ tripId }, 'Trip not found');
      return {
        success: false,
        tripId,
        error: 'Trip not found',
      };
    }

    const confirmedBookings = trip._count.bookings;

    // Check minimum booking requirement
    if (confirmedBookings < MIN_BOOKINGS_FOR_GROUP) {
      whatsappLogger.info(
        { tripId, confirmedBookings, required: MIN_BOOKINGS_FOR_GROUP },
        'Trip does not have enough confirmed bookings for WhatsApp group'
      );
      return {
        success: false,
        tripId,
        error: `Trip needs at least ${MIN_BOOKINGS_FOR_GROUP} confirmed bookings (current: ${confirmedBookings})`,
      };
    }

    // Check if invite link has been set
    if (!trip.whatsappGroupInviteLink) {
      whatsappLogger.info(
        { tripId },
        'Trip does not have a WhatsApp group invite link set'
      );
      return {
        success: false,
        tripId,
        error: 'WhatsApp group invite link not set. Please add the invite link via admin UI.',
      };
    }

    // Already active?
    if (trip.whatsappGroupStatus === 'ACTIVE') {
      whatsappLogger.info({ tripId }, 'Trip WhatsApp group is already active');
      return {
        success: true,
        tripId,
        whatsappGroupId: trip.whatsappGroupId ?? undefined,
        whatsappGroupInviteLink: trip.whatsappGroupInviteLink,
      };
    }

    // Activate the group
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        whatsappGroupStatus: 'ACTIVE',
        whatsappGroupCreatedAt: new Date(),
      },
    });

    whatsappLogger.info(
      {
        tripId,
        whatsappGroupStatus: updatedTrip.whatsappGroupStatus,
        whatsappGroupInviteLink: updatedTrip.whatsappGroupInviteLink,
      },
      'Trip WhatsApp group activated successfully'
    );

    return {
      success: true,
      tripId,
      whatsappGroupId: updatedTrip.whatsappGroupId ?? undefined,
      whatsappGroupInviteLink: updatedTrip.whatsappGroupInviteLink ?? undefined,
    };
  } catch (error) {
    logError(whatsappLogger, error, 'Failed to create trip group', { tripId });
    return {
      success: false,
      tripId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Invite a guest to the trip's WhatsApp group
 *
 * Sends a WhatsApp invitation message to the guest after their booking
 * is confirmed. Updates the booking record with invitation status.
 *
 * @param bookingId - The booking ID
 * @param guestData - Guest information for the invitation message
 * @returns Result object with success status
 *
 * @example
 * const result = await inviteGuestToGroup('booking_123', {
 *   guestName: 'John',
 *   tripName: 'Chiang Mai Adventure',
 *   destination: 'Chiang Mai, Thailand',
 *   startDate: 'March 15, 2024',
 *   endDate: 'March 22, 2024',
 *   inviteLink: 'https://chat.whatsapp.com/ABC123',
 *   memberCount: 5,
 * });
 */
export async function inviteGuestToGroup(
  bookingId: string,
  guestData: TripGroupInvitationData
): Promise<InviteGuestResult> {
  whatsappLogger.info({ bookingId }, 'Inviting guest to WhatsApp group');

  // Check WhatsApp configuration
  if (!isConfigured()) {
    whatsappLogger.warn(
      { bookingId },
      'WhatsApp not configured - invitation not sent'
    );
    return {
      success: false,
      bookingId,
      error: 'WhatsApp not configured',
    };
  }

  try {
    // Get booking with user and trip info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          include: {
            guestProfile: true,
          },
        },
        trip: true,
      },
    });

    if (!booking) {
      whatsappLogger.warn({ bookingId }, 'Booking not found');
      return {
        success: false,
        bookingId,
        error: 'Booking not found',
      };
    }

    // Get guest phone number
    const guestPhone = booking.user.guestProfile?.phone;
    if (!guestPhone) {
      whatsappLogger.warn(
        { bookingId, userId: booking.userId },
        'Guest does not have a phone number on file'
      );
      return {
        success: false,
        bookingId,
        error: 'Guest does not have a phone number on file',
      };
    }

    // Check if trip has an active WhatsApp group
    if (!booking.trip?.whatsappGroupInviteLink) {
      whatsappLogger.info(
        { bookingId, tripId: booking.tripId },
        'Trip does not have a WhatsApp group invite link'
      );
      return {
        success: false,
        bookingId,
        error: 'Trip does not have a WhatsApp group',
      };
    }

    // Check if already invited
    if (booking.whatsappInvitationStatus === 'sent' || booking.whatsappInvitationStatus === 'joined') {
      whatsappLogger.info(
        { bookingId, status: booking.whatsappInvitationStatus },
        'Guest already invited to WhatsApp group'
      );
      return {
        success: true,
        bookingId,
        error: 'Already invited',
      };
    }

    // Generate invitation message
    const message = generateTripGroupInvitationMessage(guestData);

    // Send invitation with retry logic
    const result = await withRetry(
      () => sendMessage(guestPhone, message),
      `inviteGuestToGroup:${bookingId}`
    );

    if (result.success) {
      // Update booking with invitation status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          whatsappInvitationSentAt: new Date(),
          whatsappInvitationStatus: 'sent',
        },
      });

      whatsappLogger.info(
        {
          bookingId,
          messageId: result.messageId,
          guestPhone: guestPhone.slice(-4), // Log last 4 digits only
        },
        'WhatsApp group invitation sent successfully'
      );

      return {
        success: true,
        bookingId,
        messageId: result.messageId,
      };
    } else {
      // Update booking with failed status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          whatsappInvitationStatus: 'failed',
        },
      });

      whatsappLogger.warn(
        { bookingId, error: result.error },
        'Failed to send WhatsApp group invitation'
      );

      return {
        success: false,
        bookingId,
        error: result.error,
      };
    }
  } catch (error) {
    // Update booking with failed status on exception
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          whatsappInvitationStatus: 'failed',
        },
      });
    } catch {
      // Ignore update failure
    }

    logError(whatsappLogger, error, 'Failed to invite guest to group', { bookingId });
    return {
      success: false,
      bookingId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a broadcast message to all guests in a trip's WhatsApp group
 *
 * Note: WhatsApp Business API doesn't support true group messages.
 * This sends individual messages to each confirmed guest.
 *
 * @param tripId - The trip ID
 * @param message - The message to broadcast
 * @returns Result object with success/failure counts
 *
 * @example
 * const result = await sendGroupBroadcast(
 *   'trip_123',
 *   '📢 Important update: Meet in the lobby at 9 AM tomorrow!'
 * );
 * console.log(`Sent to ${result.successfulSends}/${result.totalGuests} guests`);
 */
export async function sendGroupBroadcast(
  tripId: string,
  message: string
): Promise<SendBroadcastResult> {
  whatsappLogger.info({ tripId }, 'Sending broadcast to trip WhatsApp group');

  // Check WhatsApp configuration
  if (!isConfigured()) {
    whatsappLogger.warn(
      { tripId },
      'WhatsApp not configured - broadcast not sent'
    );
    return {
      success: false,
      tripId,
      totalGuests: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: ['WhatsApp not configured'],
    };
  }

  try {
    // Get trip with confirmed bookings
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
            // Only send to guests who have joined the group
            whatsappGroupJoinedAt: { not: null },
          },
          include: {
            user: {
              include: {
                guestProfile: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      whatsappLogger.warn({ tripId }, 'Trip not found');
      return {
        success: false,
        tripId,
        totalGuests: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Trip not found'],
      };
    }

    // Check if trip has active WhatsApp group
    if (trip.whatsappGroupStatus !== 'ACTIVE') {
      whatsappLogger.warn(
        { tripId, status: trip.whatsappGroupStatus },
        'Trip WhatsApp group is not active'
      );
      return {
        success: false,
        tripId,
        totalGuests: 0,
        successfulSends: 0,
        failedSends: 0,
        errors: ['Trip WhatsApp group is not active'],
      };
    }

    // Filter guests with phone numbers
    const guestsWithPhones = trip.bookings.filter(
      (booking) => booking.user.guestProfile?.phone
    );

    if (guestsWithPhones.length === 0) {
      whatsappLogger.info(
        { tripId },
        'No guests with phone numbers in the group'
      );
      return {
        success: true,
        tripId,
        totalGuests: 0,
        successfulSends: 0,
        failedSends: 0,
      };
    }

    // Send messages to all guests
    const errors: string[] = [];
    let successfulSends = 0;
    let failedSends = 0;

    // Process sequentially to avoid rate limiting
    for (const booking of guestsWithPhones) {
      const phone = booking.user.guestProfile!.phone!;
      const guestName = booking.user.guestProfile?.firstName || 'Guest';

      try {
        const result = await withRetry(
          () => sendMessage(phone, message),
          `broadcast:${tripId}:${booking.id}`
        );

        if (result.success) {
          successfulSends++;
          whatsappLogger.debug(
            { bookingId: booking.id, messageId: result.messageId },
            'Broadcast message sent to guest'
          );
        } else {
          failedSends++;
          errors.push(`Failed to send to ${guestName}: ${result.error}`);
        }
      } catch (error) {
        failedSends++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to send to ${guestName}: ${errorMessage}`);
      }

      // Small delay between messages to respect rate limits
      await sleep(100);
    }

    const success = failedSends === 0;

    whatsappLogger.info(
      {
        tripId,
        totalGuests: guestsWithPhones.length,
        successfulSends,
        failedSends,
      },
      success ? 'Broadcast completed successfully' : 'Broadcast completed with some failures'
    );

    return {
      success,
      tripId,
      totalGuests: guestsWithPhones.length,
      successfulSends,
      failedSends,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    logError(whatsappLogger, error, 'Failed to send broadcast', { tripId });
    return {
      success: false,
      tripId,
      totalGuests: 0,
      successfulSends: 0,
      failedSends: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Helper function to build guest invitation data from a booking
 *
 * @param bookingId - The booking ID
 * @returns TripGroupInvitationData or null if booking/trip not found
 */
export async function buildInvitationData(
  bookingId: string
): Promise<TripGroupInvitationData | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: {
        include: {
          guestProfile: true,
        },
      },
      trip: {
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  whatsappGroupJoinedAt: { not: null },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking || !booking.trip || !booking.trip.whatsappGroupInviteLink) {
    return null;
  }

  const guestName = booking.user.guestProfile?.firstName || 'Guest';

  return {
    guestName,
    tripName: booking.trip.name,
    destination: booking.trip.destination,
    startDate: formatDate(booking.trip.startDate),
    endDate: formatDate(booking.trip.endDate),
    inviteLink: booking.trip.whatsappGroupInviteLink,
    memberCount: booking.trip._count.bookings,
  };
}

/**
 * Convenience function to invite a guest using just their booking ID
 *
 * Builds the invitation data automatically from the booking and trip.
 *
 * @param bookingId - The booking ID
 * @returns Result object with success status
 */
export async function inviteGuestByBookingId(
  bookingId: string
): Promise<InviteGuestResult> {
  const invitationData = await buildInvitationData(bookingId);

  if (!invitationData) {
    whatsappLogger.warn(
      { bookingId },
      'Could not build invitation data for booking'
    );
    return {
      success: false,
      bookingId,
      error: 'Could not build invitation data - booking or trip not found',
    };
  }

  return inviteGuestToGroup(bookingId, invitationData);
}

/**
 * Mark a guest as having joined the WhatsApp group
 *
 * Called when we detect the guest has joined (e.g., via webhook or manual tracking)
 *
 * @param bookingId - The booking ID
 * @returns Success status
 */
export async function markGuestJoined(bookingId: string): Promise<boolean> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        whatsappGroupJoinedAt: new Date(),
        whatsappInvitationStatus: 'joined',
      },
    });

    // Increment member count on trip
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { tripId: true },
    });

    if (booking?.tripId) {
      await prisma.trip.update({
        where: { id: booking.tripId },
        data: {
          whatsappGroupMemberCount: { increment: 1 },
        },
      });
    }

    whatsappLogger.info({ bookingId }, 'Guest marked as joined WhatsApp group');
    return true;
  } catch (error) {
    logError(whatsappLogger, error, 'Failed to mark guest as joined', { bookingId });
    return false;
  }
}
