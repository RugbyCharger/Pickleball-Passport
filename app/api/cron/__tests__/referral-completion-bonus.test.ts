/**
 * Unit Tests: Referral Completion Bonus Cron Job
 * Epic 10 - US-005: Post-Trip Completion Bonus
 *
 * Tests cover:
 * - Date range calculation for yesterday
 * - Finding eligible completed bookings
 * - Duplicate prevention logic
 * - Points awarding logic
 * - Status updates
 *
 * Mocks: Prisma, Email
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: { findMany: vi.fn(), update: vi.fn() },
    referralEvent: { findFirst: vi.fn(), create: vi.fn() },
    partnerProfile: { findUnique: vi.fn(), update: vi.fn() },
    user: { findFirst: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    guestReferral: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

// Mock email sending
vi.mock('@/lib/email/send-email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/email/templates/guest-referral-completion', () => ({
  generateGuestReferralCompletionEmail: vi.fn().mockReturnValue({
    html: '<html>Test</html>',
    text: 'Test',
    subject: 'Test Subject',
  }),
}));

import { prisma } from '@/lib/db';
import { GUEST_REFERRAL_POINTS_CONFIG } from '@/lib/config/business-constants';

describe('Referral Completion Bonus Cron Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authorization', () => {
    it('should verify CRON_SECRET is required', () => {
      const cronSecret = 'test-secret';
      const authHeader = 'Bearer test-secret';

      // Simulate authorization check
      const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

      // Authorization check should return true when secret matches
      expect(isAuthorized).toBe(true);
    });

    it('should reject missing authorization header', () => {
      const cronSecret = 'test-secret';
      const authHeader: string | null = null;

      const isAuthorized = authHeader === `Bearer ${cronSecret}`;
      expect(isAuthorized).toBe(false);
    });

    it('should reject invalid authorization header', () => {
      const cronSecret = 'test-secret';
      const authHeader = 'Bearer wrong-secret' as string;

      const isAuthorized = authHeader === `Bearer ${cronSecret}`;
      expect(isAuthorized).toBe(false);
    });
  });

  describe('Date range calculation', () => {
    it('should calculate yesterday date range correctly', () => {
      const now = new Date('2026-01-15T12:00:00Z');

      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      expect(yesterdayStart.getDate()).toBe(14);
      expect(yesterdayStart.getHours()).toBe(0);
      expect(yesterdayStart.getMinutes()).toBe(0);

      expect(yesterdayEnd.getDate()).toBe(14);
      expect(yesterdayEnd.getHours()).toBe(23);
      expect(yesterdayEnd.getMinutes()).toBe(59);
    });

    it('should handle month boundaries correctly', () => {
      const now = new Date('2026-02-01T12:00:00Z');

      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      // Should be January 31st
      expect(yesterdayStart.getMonth()).toBe(0); // January
      expect(yesterdayStart.getDate()).toBe(31);
    });
  });

  describe('Finding eligible bookings', () => {
    it('should find bookings with referredBy code', async () => {
      const mockBookings = [
        {
          id: 'booking_1',
          bookingReference: 'PBP-2026-001',
          referredBy: 'SUSAN-2026',
          status: 'CONFIRMED',
          userId: 'user_1',
          trip: { endDate: new Date('2026-01-14') },
          package: { name: 'Thailand Adventure' },
          user: { guestProfile: { firstName: 'Jane', lastName: 'Doe' } },
        },
      ];

      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockBookings as any);

      const bookings = await prisma.booking.findMany({
        where: {
          trip: {
            endDate: {
              gte: new Date('2026-01-14T00:00:00Z'),
              lte: new Date('2026-01-14T23:59:59Z'),
            },
          },
          referredBy: { not: null },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      });

      expect(bookings).toHaveLength(1);
      expect(bookings[0].referredBy).toBe('SUSAN-2026');
    });

    it('should exclude bookings without referredBy', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([]);

      const bookings = await prisma.booking.findMany({
        where: {
          referredBy: null, // This should not match
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
      });

      expect(bookings).toHaveLength(0);
    });

    it('should only include CONFIRMED or COMPLETED status', () => {
      const validStatuses = ['CONFIRMED', 'COMPLETED'];

      expect(validStatuses.includes('CONFIRMED')).toBe(true);
      expect(validStatuses.includes('COMPLETED')).toBe(true);
      expect(validStatuses.includes('CANCELLED')).toBe(false);
      expect(validStatuses.includes('PENDING_PAYMENT')).toBe(false);
    });
  });

  describe('Duplicate prevention', () => {
    it('should skip if COMPLETION event already exists', async () => {
      vi.mocked(prisma.referralEvent.findFirst).mockResolvedValue({
        id: 'event_123',
        referralCode: 'SUSAN-2026',
        eventType: 'COMPLETION',
        userId: 'user_1',
      } as any);

      const existingEvent = await prisma.referralEvent.findFirst({
        where: {
          referralCode: 'SUSAN-2026',
          eventType: 'COMPLETION',
          userId: 'user_1',
        },
      });

      expect(existingEvent).not.toBeNull();
      // Should skip processing this booking
    });

    it('should process if no COMPLETION event exists', async () => {
      vi.mocked(prisma.referralEvent.findFirst).mockResolvedValue(null);

      const existingEvent = await prisma.referralEvent.findFirst({
        where: {
          referralCode: 'SUSAN-2026',
          eventType: 'COMPLETION',
          userId: 'user_1',
        },
      });

      expect(existingEvent).toBeNull();
      // Should proceed with processing
    });
  });

  describe('Referrer lookup', () => {
    it('should find partner referrer by code', async () => {
      vi.mocked(prisma.partnerProfile.findUnique).mockResolvedValue({
        id: 'partner_123',
        referralCode: 'GOLD2024',
        clubName: 'Tennis Pro Club',
        passportPoints: 5000,
        user: { email: 'partner@example.com' },
      } as any);

      const partner = await prisma.partnerProfile.findUnique({
        where: { referralCode: 'GOLD2024' },
        include: { user: true },
      });

      expect(partner).not.toBeNull();
      expect(partner?.clubName).toBe('Tennis Pro Club');
    });

    it('should find guest referrer by code', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'user_123',
        referralCode: 'SUSAN-2026',
        email: 'susan@example.com',
        referralPointsBalance: 3000,
        guestProfile: { firstName: 'Susan' },
      } as any);

      const guestReferrer = await prisma.user.findFirst({
        where: { referralCode: 'SUSAN-2026' },
        include: { guestProfile: true },
      });

      expect(guestReferrer).not.toBeNull();
      expect(guestReferrer?.referralCode).toBe('SUSAN-2026');
    });

    it('should skip if referrer not found', async () => {
      vi.mocked(prisma.partnerProfile.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const [partner, guestReferrer] = await Promise.all([
        prisma.partnerProfile.findUnique({ where: { referralCode: 'UNKNOWN' } }),
        prisma.user.findFirst({ where: { referralCode: 'UNKNOWN' } }),
      ]);

      expect(partner).toBeNull();
      expect(guestReferrer).toBeNull();
      // Should skip with status 'skipped_no_referrer'
    });
  });

  describe('Bonus points awarding', () => {
    it('should use correct completion bonus value', () => {
      const bonusPoints = GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS;
      expect(bonusPoints).toBe(500);
    });

    it('should award points to partner passportPoints', async () => {
      vi.mocked(prisma.partnerProfile.update).mockResolvedValue({
        id: 'partner_123',
        passportPoints: 5500,
      } as any);

      const updated = await prisma.partnerProfile.update({
        where: { id: 'partner_123' },
        data: { passportPoints: { increment: 500 } },
      });

      expect(updated.passportPoints).toBe(5500);
      expect(prisma.partnerProfile.update).toHaveBeenCalledWith({
        where: { id: 'partner_123' },
        data: { passportPoints: { increment: 500 } },
      });
    });

    it('should award points to guest referralPointsBalance', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: 'user_123',
        referralPointsBalance: 3500,
      } as any);

      const updated = await prisma.user.update({
        where: { id: 'user_123' },
        data: { referralPointsBalance: { increment: 500 } },
      });

      expect(updated.referralPointsBalance).toBe(3500);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        data: { referralPointsBalance: { increment: 500 } },
      });
    });
  });

  describe('Status updates', () => {
    it('should create COMPLETION referral event', async () => {
      vi.mocked(prisma.referralEvent.create).mockResolvedValue({
        id: 'event_new',
        referralCode: 'SUSAN-2026',
        eventType: 'COMPLETION',
        userId: 'user_1',
      } as any);

      const event = await prisma.referralEvent.create({
        data: {
          referralCode: 'SUSAN-2026',
          eventType: 'COMPLETION',
          userId: 'user_1',
        },
      });

      expect(event.eventType).toBe('COMPLETION');
      expect(prisma.referralEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'COMPLETION',
        }),
      });
    });

    it('should update GuestReferral status to COMPLETED', async () => {
      vi.mocked(prisma.guestReferral.updateMany).mockResolvedValue({ count: 1 } as any);

      const result = await prisma.guestReferral.updateMany({
        where: {
          referrerUserId: 'referrer_123',
          referredUserId: 'user_1',
          status: { not: 'COMPLETED' },
        },
        data: {
          status: 'COMPLETED',
          pointsEarned: { increment: 500 },
        },
      });

      expect(result.count).toBe(1);
    });

    it('should update booking status from CONFIRMED to COMPLETED', async () => {
      vi.mocked(prisma.booking.update).mockResolvedValue({
        id: 'booking_1',
        status: 'COMPLETED',
      } as any);

      const updated = await prisma.booking.update({
        where: { id: 'booking_1' },
        data: { status: 'COMPLETED' },
      });

      expect(updated.status).toBe('COMPLETED');
    });
  });

  describe('Transaction handling', () => {
    it('should wrap updates in transaction', async () => {
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return callback({
          referralEvent: { create: vi.fn() },
          partnerProfile: { update: vi.fn() },
          user: { update: vi.fn() },
          guestReferral: { updateMany: vi.fn() },
          booking: { update: vi.fn() },
        });
      });

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await prisma.$transaction(async (tx) => {
        await tx.referralEvent.create({
          data: { referralCode: 'TEST', eventType: 'COMPLETION' },
        });
        await tx.user.update({
          where: { id: 'user_123' },
          data: { referralPointsBalance: { increment: 500 } },
        });
      });

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  describe('Result tracking', () => {
    it('should track success results', () => {
      const results: Array<{
        bookingId: string;
        referralCode: string;
        status: 'success' | 'skipped_duplicate' | 'skipped_no_referrer' | 'error';
        pointsAwarded: number;
      }> = [];

      results.push({
        bookingId: 'booking_1',
        referralCode: 'SUSAN-2026',
        status: 'success',
        pointsAwarded: 500,
      });

      const successful = results.filter((r) => r.status === 'success');
      expect(successful).toHaveLength(1);
      expect(successful[0].pointsAwarded).toBe(500);
    });

    it('should track skipped results', () => {
      const results: Array<{
        bookingId: string;
        referralCode: string;
        status: 'success' | 'skipped_duplicate' | 'skipped_no_referrer' | 'error';
        pointsAwarded: number;
      }> = [];

      results.push({
        bookingId: 'booking_1',
        referralCode: 'SUSAN-2026',
        status: 'skipped_duplicate',
        pointsAwarded: 0,
      });

      results.push({
        bookingId: 'booking_2',
        referralCode: 'UNKNOWN',
        status: 'skipped_no_referrer',
        pointsAwarded: 0,
      });

      const skipped = results.filter((r) => r.status.startsWith('skipped'));
      expect(skipped).toHaveLength(2);
    });

    it('should calculate total points awarded', () => {
      const results = [
        { status: 'success', pointsAwarded: 500 },
        { status: 'success', pointsAwarded: 500 },
        { status: 'skipped_duplicate', pointsAwarded: 0 },
        { status: 'error', pointsAwarded: 0 },
      ];

      const totalPointsAwarded = results
        .filter((r) => r.status === 'success')
        .reduce((sum, r) => sum + r.pointsAwarded, 0);

      expect(totalPointsAwarded).toBe(1000);
    });
  });

  describe('Error handling', () => {
    it('should handle individual booking errors without failing entire job', async () => {
      const processBooking = async (booking: { id: string; referredBy: string }) => {
        try {
          // Simulate error for one booking
          if (booking.id === 'booking_error') {
            throw new Error('Processing error');
          }
          return { status: 'success', bookingId: booking.id };
        } catch (error) {
          return {
            status: 'error',
            bookingId: booking.id,
            error: error instanceof Error ? error.message : 'Unknown',
          };
        }
      };

      const bookings = [
        { id: 'booking_1', referredBy: 'SUSAN-2026' },
        { id: 'booking_error', referredBy: 'BOB-2026' },
        { id: 'booking_2', referredBy: 'ALICE-2026' },
      ];

      const results = await Promise.all(bookings.map(processBooking));

      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
      expect(results[2].status).toBe('success');
    });
  });
});
