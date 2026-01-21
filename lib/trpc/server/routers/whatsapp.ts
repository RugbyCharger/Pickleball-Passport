/**
 * WhatsApp tRPC Router
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Provides procedures for WhatsApp group functionality:
 * - Guest: Get group info for dashboard, mark as joined
 * - Admin: Manage groups, view members, set invite links, archive groups
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { markGuestJoined, createTripGroup } from '@/lib/whatsapp/group-manager';
import { TRPCError } from '@trpc/server';
import { WhatsAppGroupStatus } from '@prisma/client';
import { dbLogger } from '@/lib/logger';

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

  // ============================================================================
  // ADMIN PROCEDURES
  // ============================================================================

  /**
   * Admin: Get all trips with WhatsApp group information
   *
   * Returns a paginated list of trips with their WhatsApp group status,
   * member counts, and creation dates.
   */
  adminGetWhatsAppGroups: adminProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(WhatsAppGroupStatus).optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      // Filter by status if provided
      if (input?.status) {
        where.whatsappGroupStatus = input.status;
      }

      // Search filter
      if (input?.search && input.search.trim()) {
        const searchTerm = input.search.trim();
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { destination: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [trips, total] = await Promise.all([
        ctx.db.trip.findMany({
          where,
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
            whatsappGroupCreatedAt: true,
            _count: {
              select: {
                bookings: {
                  where: { status: 'CONFIRMED' },
                },
              },
            },
          },
          orderBy: [{ startDate: 'asc' }],
          take: input?.limit ?? 50,
          skip: input?.offset ?? 0,
        }),
        ctx.db.trip.count({ where }),
      ]);

      return {
        trips: trips.map((trip) => ({
          ...trip,
          confirmedBookings: trip._count.bookings,
        })),
        total,
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      };
    }),

  /**
   * Admin: Get counts by WhatsApp group status for dashboard stats
   */
  adminGetWhatsAppGroupCounts: adminProcedure.query(async ({ ctx }) => {
    const [total, pending, active, archived] = await Promise.all([
      ctx.db.trip.count(),
      ctx.db.trip.count({ where: { whatsappGroupStatus: 'PENDING' } }),
      ctx.db.trip.count({ where: { whatsappGroupStatus: 'ACTIVE' } }),
      ctx.db.trip.count({ where: { whatsappGroupStatus: 'ARCHIVED' } }),
    ]);

    return {
      total,
      pending,
      active,
      archived,
    };
  }),

  /**
   * Admin: Get detailed WhatsApp group info for a specific trip
   *
   * Returns trip info with member list showing join status for each booking.
   */
  adminGetWhatsAppGroupDetails: adminProcedure
    .input(z.object({ tripId: z.string() }))
    .query(async ({ ctx, input }) => {
      const trip = await ctx.db.trip.findUnique({
        where: { id: input.tripId },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  guestProfile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phone: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        });
      }

      // Transform bookings to include join status
      const members = trip.bookings.map((booking) => ({
        bookingId: booking.id,
        userId: booking.user.id,
        email: booking.user.email,
        firstName: booking.user.guestProfile?.firstName || null,
        lastName: booking.user.guestProfile?.lastName || null,
        phone: booking.user.guestProfile?.phone || null,
        invitationSentAt: booking.whatsappInvitationSentAt,
        joinedAt: booking.whatsappGroupJoinedAt,
        invitationStatus: booking.whatsappInvitationStatus,
        bookingCreatedAt: booking.createdAt,
      }));

      return {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        whatsappGroupId: trip.whatsappGroupId,
        whatsappGroupInviteLink: trip.whatsappGroupInviteLink,
        whatsappGroupStatus: trip.whatsappGroupStatus,
        whatsappGroupMemberCount: trip.whatsappGroupMemberCount,
        whatsappGroupCreatedAt: trip.whatsappGroupCreatedAt,
        members,
        confirmedBookings: members.length,
      };
    }),

  /**
   * Admin: Set the WhatsApp group invite link for a trip
   *
   * This is the manual workflow for MVP - admin creates a WhatsApp group
   * externally and then enters the invite link here.
   */
  adminSetGroupInviteLink: adminProcedure
    .input(
      z.object({
        tripId: z.string(),
        inviteLink: z
          .string()
          .url('Invalid URL format')
          .refine(
            (url) => url.startsWith('https://chat.whatsapp.com/'),
            'Must be a valid WhatsApp group invite link (https://chat.whatsapp.com/...)'
          ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tripId, inviteLink } = input;

      // Verify trip exists
      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        });
      }

      // Extract the invite code from the link for the group ID
      const inviteCode = inviteLink.split('/').pop() || '';

      // Update the trip with the invite link
      const updatedTrip = await ctx.db.trip.update({
        where: { id: tripId },
        data: {
          whatsappGroupInviteLink: inviteLink,
          whatsappGroupId: inviteCode,
        },
      });

      dbLogger.info(
        {
          tripId,
          adminId: ctx.user.id,
          inviteLink,
        },
        'Admin set WhatsApp group invite link'
      );

      // Try to activate the group if eligible
      const activationResult = await createTripGroup(tripId);

      return {
        success: true,
        tripId,
        inviteLink: updatedTrip.whatsappGroupInviteLink,
        groupActivated: activationResult.success,
        status: activationResult.success ? 'ACTIVE' : updatedTrip.whatsappGroupStatus,
        message: activationResult.success
          ? 'Invite link set and group activated'
          : `Invite link set. ${activationResult.error || 'Group will activate when requirements are met.'}`,
      };
    }),

  /**
   * Admin: Archive a WhatsApp group
   *
   * Archives a trip's WhatsApp group (typically after trip completion).
   */
  adminArchiveGroup: adminProcedure
    .input(z.object({ tripId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { tripId } = input;

      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        });
      }

      // Only active groups can be archived
      if (trip.whatsappGroupStatus !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot archive a group with status ${trip.whatsappGroupStatus}. Only active groups can be archived.`,
        });
      }

      const updatedTrip = await ctx.db.trip.update({
        where: { id: tripId },
        data: {
          whatsappGroupStatus: 'ARCHIVED',
        },
      });

      dbLogger.info(
        {
          tripId,
          adminId: ctx.user.id,
        },
        'Admin archived WhatsApp group'
      );

      return {
        success: true,
        tripId,
        status: updatedTrip.whatsappGroupStatus,
      };
    }),

  /**
   * Admin: Refresh/update the invite link for a group
   *
   * Used when the old invite link has been revoked/changed.
   */
  adminRefreshInviteLink: adminProcedure
    .input(
      z.object({
        tripId: z.string(),
        newInviteLink: z
          .string()
          .url('Invalid URL format')
          .refine(
            (url) => url.startsWith('https://chat.whatsapp.com/'),
            'Must be a valid WhatsApp group invite link (https://chat.whatsapp.com/...)'
          ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tripId, newInviteLink } = input;

      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        });
      }

      // Extract the invite code
      const inviteCode = newInviteLink.split('/').pop() || '';

      const updatedTrip = await ctx.db.trip.update({
        where: { id: tripId },
        data: {
          whatsappGroupInviteLink: newInviteLink,
          whatsappGroupId: inviteCode,
        },
      });

      dbLogger.info(
        {
          tripId,
          adminId: ctx.user.id,
          newInviteLink,
        },
        'Admin refreshed WhatsApp group invite link'
      );

      return {
        success: true,
        tripId,
        inviteLink: updatedTrip.whatsappGroupInviteLink,
      };
    }),

  /**
   * Admin: Manually activate a WhatsApp group
   *
   * Forces group activation regardless of booking count (for testing/override).
   */
  adminActivateGroup: adminProcedure
    .input(z.object({ tripId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { tripId } = input;

      const trip = await ctx.db.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Trip not found',
        });
      }

      if (!trip.whatsappGroupInviteLink) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot activate group without an invite link. Please set an invite link first.',
        });
      }

      if (trip.whatsappGroupStatus === 'ACTIVE') {
        return {
          success: true,
          tripId,
          status: 'ACTIVE',
          message: 'Group is already active',
        };
      }

      const updatedTrip = await ctx.db.trip.update({
        where: { id: tripId },
        data: {
          whatsappGroupStatus: 'ACTIVE',
          whatsappGroupCreatedAt: trip.whatsappGroupCreatedAt || new Date(),
        },
      });

      dbLogger.info(
        {
          tripId,
          adminId: ctx.user.id,
        },
        'Admin manually activated WhatsApp group'
      );

      return {
        success: true,
        tripId,
        status: updatedTrip.whatsappGroupStatus,
        message: 'Group activated successfully',
      };
    }),
});
