/**
 * Unit Tests: WhatsApp Group Manager
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Tests cover:
 * - createTripGroup() activates group when criteria met
 * - inviteGuestToGroup() sends message and updates booking
 * - inviteGuestByBookingId() handles booking lookup
 * - markGuestJoined() updates booking with join timestamp
 * - sendGroupBroadcast() sends to all group members
 * - Error handling for missing data and API failures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client - must use inline factory function
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    trip: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock WhatsApp client
vi.mock('../client', () => ({
  sendMessage: vi.fn(),
  isConfigured: vi.fn(),
  whatsappLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock @/lib/logger
vi.mock('@/lib/logger', () => ({
  whatsappLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
  logError: vi.fn(),
}));

// Mock templates
vi.mock('../templates', () => ({
  generateTripGroupInvitationMessage: vi.fn(
    (data: { guestName: string; tripName: string; inviteLink: string }) =>
      `Hi ${data.guestName}! Join ${data.tripName}: ${data.inviteLink}`
  ),
}));

// Import after mocks
import { prisma } from '@/lib/db';
import { sendMessage, isConfigured } from '../client';
import {
  createTripGroup,
  inviteGuestToGroup,
  inviteGuestByBookingId,
  markGuestJoined,
  sendGroupBroadcast,
  buildInvitationData,
} from '../group-manager';

// Type assertions for mocked functions
const mockPrismaBooking = prisma.booking as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};
const mockPrismaTrip = prisma.trip as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};
const mockSendMessage = sendMessage as unknown as ReturnType<typeof vi.fn>;
const mockIsConfigured = isConfigured as unknown as ReturnType<typeof vi.fn>;

describe('WhatsApp Group Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConfigured.mockReturnValue(true);
    mockSendMessage.mockResolvedValue({ success: true, messageId: 'wamid.test123' });
  });

  describe('createTripGroup()', () => {
    it('should activate group when trip has 3+ confirmed bookings and invite link', async () => {
      const mockTrip = {
        id: 'trip-1',
        name: 'Thailand Adventure',
        whatsappGroupStatus: 'PENDING',
        whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
        whatsappGroupId: null,
        _count: { bookings: 5 },
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaTrip.update.mockResolvedValue({
        ...mockTrip,
        whatsappGroupStatus: 'ACTIVE',
        whatsappGroupCreatedAt: new Date(),
      });

      const result = await createTripGroup('trip-1');

      expect(result.success).toBe(true);
      expect(mockPrismaTrip.update).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
        data: {
          whatsappGroupStatus: 'ACTIVE',
          whatsappGroupCreatedAt: expect.any(Date),
        },
      });
    });

    it('should return error when trip not found', async () => {
      mockPrismaTrip.findUnique.mockResolvedValue(null);

      const result = await createTripGroup('nonexistent-trip');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Trip not found');
    });

    it('should return error when trip has fewer than 3 confirmed bookings', async () => {
      const mockTrip = {
        id: 'trip-1',
        whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
        whatsappGroupStatus: 'PENDING',
        _count: { bookings: 2 },
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);

      const result = await createTripGroup('trip-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('needs at least 3 confirmed bookings');
    });

    it('should return error when trip has no invite link', async () => {
      const mockTrip = {
        id: 'trip-1',
        whatsappGroupInviteLink: null,
        whatsappGroupStatus: 'PENDING',
        _count: { bookings: 5 },
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);

      const result = await createTripGroup('trip-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('invite link not set');
    });

    it('should return success if group is already active', async () => {
      const mockTrip = {
        id: 'trip-1',
        whatsappGroupStatus: 'ACTIVE',
        whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
        whatsappGroupId: 'group-123',
        _count: { bookings: 5 },
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);

      const result = await createTripGroup('trip-1');

      expect(result.success).toBe(true);
      expect(result.whatsappGroupInviteLink).toBe('https://chat.whatsapp.com/abc123');
      expect(mockPrismaTrip.update).not.toHaveBeenCalled();
    });
  });

  describe('inviteGuestToGroup()', () => {
    it('should send invitation message and update booking', async () => {
      const mockBooking = {
        id: 'booking-1',
        tripId: 'trip-1',
        userId: 'user-1',
        whatsappInvitationStatus: null,
        user: {
          guestProfile: {
            firstName: 'John',
            phone: '+15551234567',
          },
        },
        trip: {
          id: 'trip-1',
          name: 'Thailand Adventure',
          whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
        },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaBooking.update.mockResolvedValue({
        ...mockBooking,
        whatsappInvitationSentAt: new Date(),
        whatsappInvitationStatus: 'sent',
      });

      const result = await inviteGuestToGroup('booking-1', {
        guestName: 'John',
        tripName: 'Thailand Adventure',
        destination: 'Chiang Mai, Thailand',
        startDate: 'March 15, 2024',
        endDate: 'March 22, 2024',
        inviteLink: 'https://chat.whatsapp.com/abc123',
        memberCount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('wamid.test123');

      // Verify sendMessage was called
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage.mock.calls[0][0]).toBe('+15551234567');

      // Verify booking was updated
      expect(mockPrismaBooking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          whatsappInvitationSentAt: expect.any(Date),
          whatsappInvitationStatus: 'sent',
        },
      });
    });

    it('should return error when booking not found', async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      const result = await inviteGuestToGroup('nonexistent-booking', {
        guestName: 'John',
        tripName: 'Test Trip',
        destination: 'Test',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        inviteLink: 'https://chat.whatsapp.com/abc',
        memberCount: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Booking not found');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should return error when guest has no phone number', async () => {
      const mockBooking = {
        id: 'booking-1',
        user: { guestProfile: { firstName: 'John', phone: null } },
        trip: { whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123' },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await inviteGuestToGroup('booking-1', {
        guestName: 'John',
        tripName: 'Test Trip',
        destination: 'Test',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        inviteLink: 'https://chat.whatsapp.com/abc',
        memberCount: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('phone number');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should return error when trip has no WhatsApp group', async () => {
      const mockBooking = {
        id: 'booking-1',
        user: { guestProfile: { firstName: 'John', phone: '+15551234567' } },
        trip: { whatsappGroupInviteLink: null },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await inviteGuestToGroup('booking-1', {
        guestName: 'John',
        tripName: 'Test Trip',
        destination: 'Test',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        inviteLink: 'https://chat.whatsapp.com/abc',
        memberCount: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('WhatsApp group');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should return success if already invited', async () => {
      const mockBooking = {
        id: 'booking-1',
        whatsappInvitationStatus: 'sent',
        user: { guestProfile: { firstName: 'John', phone: '+15551234567' } },
        trip: { whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123' },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await inviteGuestToGroup('booking-1', {
        guestName: 'John',
        tripName: 'Test Trip',
        destination: 'Test',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        inviteLink: 'https://chat.whatsapp.com/abc',
        memberCount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBe('Already invited');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should handle WhatsApp not configured', async () => {
      mockIsConfigured.mockReturnValue(false);

      const result = await inviteGuestToGroup('booking-1', {
        guestName: 'John',
        tripName: 'Test Trip',
        destination: 'Test',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        inviteLink: 'https://chat.whatsapp.com/abc',
        memberCount: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('inviteGuestByBookingId()', () => {
    it('should build invitation data and send invitation', async () => {
      const mockBooking = {
        id: 'booking-1',
        tripId: 'trip-1',
        userId: 'user-1',
        whatsappInvitationStatus: null,
        user: {
          guestProfile: {
            firstName: 'John',
            phone: '+15551234567',
          },
        },
        trip: {
          id: 'trip-1',
          name: 'Thailand Adventure',
          destination: 'Chiang Mai, Thailand',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-22'),
          whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
          _count: { bookings: 5 },
        },
      };

      // First call is for buildInvitationData, second is for inviteGuestToGroup
      mockPrismaBooking.findUnique
        .mockResolvedValueOnce(mockBooking)
        .mockResolvedValueOnce(mockBooking);
      mockPrismaBooking.update.mockResolvedValue({
        ...mockBooking,
        whatsappInvitationSentAt: new Date(),
        whatsappInvitationStatus: 'sent',
      });

      const result = await inviteGuestByBookingId('booking-1');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('wamid.test123');
    });

    it('should return error when booking not found', async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      const result = await inviteGuestByBookingId('nonexistent-booking');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not build invitation data');
    });
  });

  describe('markGuestJoined()', () => {
    it('should update booking with join timestamp and increment member count', async () => {
      mockPrismaBooking.update.mockResolvedValue({
        id: 'booking-1',
        whatsappGroupJoinedAt: new Date(),
        whatsappInvitationStatus: 'joined',
      });
      mockPrismaBooking.findUnique.mockResolvedValue({
        id: 'booking-1',
        tripId: 'trip-1',
      });
      mockPrismaTrip.update.mockResolvedValue({
        id: 'trip-1',
        whatsappGroupMemberCount: 6,
      });

      const result = await markGuestJoined('booking-1');

      expect(result).toBe(true);

      // Verify booking was updated
      expect(mockPrismaBooking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          whatsappGroupJoinedAt: expect.any(Date),
          whatsappInvitationStatus: 'joined',
        },
      });

      // Verify trip member count was incremented
      expect(mockPrismaTrip.update).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
        data: { whatsappGroupMemberCount: { increment: 1 } },
      });
    });

    it('should return false on error', async () => {
      mockPrismaBooking.update.mockRejectedValue(new Error('DB error'));

      const result = await markGuestJoined('booking-1');

      expect(result).toBe(false);
    });
  });

  describe('sendGroupBroadcast()', () => {
    it('should send message to all group members', async () => {
      const mockTrip = {
        id: 'trip-1',
        name: 'Thailand Adventure',
        whatsappGroupStatus: 'ACTIVE',
        bookings: [
          {
            id: 'booking-1',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15551111111', firstName: 'Alice' } },
          },
          {
            id: 'booking-2',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15552222222', firstName: 'Bob' } },
          },
          {
            id: 'booking-3',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15553333333', firstName: 'Carol' } },
          },
        ],
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);
      mockSendMessage.mockResolvedValue({ success: true, messageId: 'wamid.test' });

      const result = await sendGroupBroadcast('trip-1', 'Hello everyone!');

      expect(result.success).toBe(true);
      expect(result.totalGuests).toBe(3);
      expect(result.successfulSends).toBe(3);
      expect(result.failedSends).toBe(0);

      // Verify sendMessage was called for each guest
      expect(mockSendMessage).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in broadcast', async () => {
      const mockTrip = {
        id: 'trip-1',
        name: 'Thailand Adventure',
        whatsappGroupStatus: 'ACTIVE',
        bookings: [
          {
            id: 'booking-1',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15551111111', firstName: 'Alice' } },
          },
          {
            id: 'booking-2',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15552222222', firstName: 'Bob' } },
          },
        ],
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);

      // First call succeeds, second fails after retries
      mockSendMessage
        .mockResolvedValueOnce({ success: true, messageId: 'wamid.test1' })
        .mockResolvedValue({ success: false, error: 'Invalid phone number' });

      const result = await sendGroupBroadcast('trip-1', 'Test message');

      expect(result.success).toBe(false); // Partial failure
      expect(result.totalGuests).toBe(2);
      expect(result.successfulSends).toBe(1);
      expect(result.failedSends).toBe(1);
      expect(result.errors).toBeDefined();
    });

    it('should return error when trip not found', async () => {
      mockPrismaTrip.findUnique.mockResolvedValue(null);

      const result = await sendGroupBroadcast('nonexistent-trip', 'Hello');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Trip not found');
    });

    it('should return error when trip has no active WhatsApp group', async () => {
      const mockTrip = {
        id: 'trip-1',
        whatsappGroupStatus: 'PENDING',
        bookings: [],
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);

      const result = await sendGroupBroadcast('trip-1', 'Hello');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Trip WhatsApp group is not active');
    });

    it('should handle WhatsApp not configured', async () => {
      mockIsConfigured.mockReturnValue(false);

      const result = await sendGroupBroadcast('trip-1', 'Hello');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('WhatsApp not configured');
    });

    it('should skip guests without phone numbers', async () => {
      const mockTrip = {
        id: 'trip-1',
        name: 'Thailand Adventure',
        whatsappGroupStatus: 'ACTIVE',
        bookings: [
          {
            id: 'booking-1',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: '+15551111111', firstName: 'Alice' } },
          },
          {
            id: 'booking-2',
            whatsappGroupJoinedAt: new Date(),
            user: { guestProfile: { phone: null, firstName: 'Bob' } }, // No phone
          },
        ],
      };

      mockPrismaTrip.findUnique.mockResolvedValue(mockTrip);
      mockSendMessage.mockResolvedValue({ success: true, messageId: 'wamid.test' });

      const result = await sendGroupBroadcast('trip-1', 'Hello everyone!');

      // Only 1 message sent (second guest has no phone)
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(result.totalGuests).toBe(1);
      expect(result.successfulSends).toBe(1);
    });
  });

  describe('buildInvitationData()', () => {
    it('should build invitation data from booking', async () => {
      const mockBooking = {
        id: 'booking-1',
        user: {
          guestProfile: { firstName: 'John' },
        },
        trip: {
          name: 'Thailand Adventure',
          destination: 'Chiang Mai, Thailand',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-22'),
          whatsappGroupInviteLink: 'https://chat.whatsapp.com/abc123',
          _count: { bookings: 5 },
        },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await buildInvitationData('booking-1');

      expect(result).not.toBeNull();
      expect(result?.guestName).toBe('John');
      expect(result?.tripName).toBe('Thailand Adventure');
      expect(result?.inviteLink).toBe('https://chat.whatsapp.com/abc123');
      expect(result?.memberCount).toBe(5);
    });

    it('should return null when booking not found', async () => {
      mockPrismaBooking.findUnique.mockResolvedValue(null);

      const result = await buildInvitationData('nonexistent-booking');

      expect(result).toBeNull();
    });

    it('should return null when trip has no invite link', async () => {
      const mockBooking = {
        id: 'booking-1',
        user: { guestProfile: { firstName: 'John' } },
        trip: {
          name: 'Test Trip',
          destination: 'Test',
          startDate: new Date(),
          endDate: new Date(),
          whatsappGroupInviteLink: null,
          _count: { bookings: 0 },
        },
      };

      mockPrismaBooking.findUnique.mockResolvedValue(mockBooking);

      const result = await buildInvitationData('booking-1');

      expect(result).toBeNull();
    });
  });
});
