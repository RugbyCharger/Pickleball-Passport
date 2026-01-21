/**
 * WhatsApp tRPC Router
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Provides procedures for WhatsApp group functionality:
 * - Guest: Get group info for dashboard, mark as joined
 * - Admin: Manage groups, send broadcasts (to be added in US-008)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { markGuestJoined } from '@/lib/whatsapp/group-manager';
import { TRPCError } from '@trpc/server';

export const whatsappRouter = router({
  /**
   * Get WhatsApp group info for a guest's booking
   *
   * Returns the WhatsApp group details for the guest's trip,
   * including invite link and member count.
   *
   * Used by the guest dashboard WhatsApp card component.
   */
  getGuestWhatsAppGroup: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { bookingId } = input;

      // Get booking with trip and WhatsApp group info
      const booking = await ctx.db.booking.findUnique({
        where: {
          id: bookingId,
          userId: ctx.user.id, // Ensure user owns this booking
        },
        select: {
          id: true,
          status: true,
          whatsappInvitationSentAt: true,
          whatsappGroupJoinedAt: true,
          whatsappInvitationStatus: true,
          trip: {
            select: {
              id: true,
              name: true,
              destination: true,
              startDate: true,
              endDate: true,
              whatsappGroupId: true,
              whatsappGroupInviteLink: true,
              whatsappGroupStatus: true,
              whatsappGroupMemberCount: true,
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // No trip assigned or no WhatsApp group
      if (!booking.trip || !booking.trip.whatsappGroupInviteLink) {
        return null;
      }

      // Only show group info if status is ACTIVE
      if (booking.trip.whatsappGroupStatus !== 'ACTIVE') {
        return null;
      }

      // Extract invite code from link (https://chat.whatsapp.com/{code})
      const inviteLink = booking.trip.whatsappGroupInviteLink;
      const inviteCode = inviteLink.split('/').pop() || '';

      return {
        bookingId: booking.id,
        tripId: booking.trip.id,
        tripName: booking.trip.name,
        destination: booking.trip.destination,
        startDate: booking.trip.startDate,
        endDate: booking.trip.endDate,
        inviteLink,
        inviteCode,
        memberCount: booking.trip.whatsappGroupMemberCount,
        hasJoined: !!booking.whatsappGroupJoinedAt,
        joinedAt: booking.whatsappGroupJoinedAt,
        invitationStatus: booking.whatsappInvitationStatus,
      };
    }),

  /**
   * Mark a guest as having joined the WhatsApp group
   *
   * Called when the guest clicks the "Join WhatsApp Group" button.
   * Updates the booking with whatsappGroupJoinedAt timestamp.
   */
  markGroupJoined: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId } = input;

      // Verify the booking belongs to the current user
      const booking = await ctx.db.booking.findUnique({
        where: {
          id: bookingId,
          userId: ctx.user.id,
        },
        select: {
          id: true,
          whatsappGroupJoinedAt: true,
          trip: {
            select: {
              whatsappGroupInviteLink: true,
              whatsappGroupStatus: true,
            },
          },
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      // Check if trip has an active WhatsApp group
      if (!booking.trip?.whatsappGroupInviteLink || booking.trip.whatsappGroupStatus !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This trip does not have an active WhatsApp group',
        });
      }

      // Already joined - return success without updating
      if (booking.whatsappGroupJoinedAt) {
        return {
          success: true,
          alreadyJoined: true,
          joinedAt: booking.whatsappGroupJoinedAt,
        };
      }

      // Mark as joined using the group manager function
      const success = await markGuestJoined(bookingId);

      if (!success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update join status',
        });
      }

      return {
        success: true,
        alreadyJoined: false,
        joinedAt: new Date(),
      };
    }),
});
