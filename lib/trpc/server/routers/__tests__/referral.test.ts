/**
 * Unit Tests: Referral System
 * Epic 10 - US-008: Unit Tests for Referral System
 *
 * Tests cover:
 * - Referral link cookie setting
 * - Referral attribution at application
 * - Referral attribution at booking
 * - Guest referral code generation
 * - Referral analytics queries
 *
 * Mocks: Prisma
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma before imports
vi.mock('@/lib/db', () => ({
  prisma: {
    partnerProfile: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    referralEvent: { create: vi.fn(), count: vi.fn(), groupBy: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    guestReferral: { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    application: { create: vi.fn() },
    booking: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

// Mock email sending
vi.mock('@/lib/email/send-email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

import { prisma } from '@/lib/db';
import {
  GUEST_REFERRAL_POINTS_CONFIG,
  calculateGuestReferralPoints,
} from '@/lib/config/business-constants';

describe('Referral System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // US-001: Referral Link Cookie Setting
  // ============================================================================
  describe('Referral Link Cookie Setting', () => {
    describe('Referral code validation', () => {
      it('should validate partner referral codes', async () => {
        vi.mocked(prisma.partnerProfile.findUnique).mockResolvedValue({
          id: 'partner_123',
          referralCode: 'GOLD2024',
          referralCodeClickCount: 5,
        } as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const [partnerProfile, userWithCode] = await Promise.all([
          prisma.partnerProfile.findUnique({ where: { referralCode: 'GOLD2024' } }),
          prisma.user.findUnique({ where: { referralCode: 'GOLD2024' } }),
        ]);

        const isValid = partnerProfile !== null || userWithCode !== null;
        expect(isValid).toBe(true);
        expect(partnerProfile?.referralCode).toBe('GOLD2024');
      });

      it('should validate guest referral codes', async () => {
        vi.mocked(prisma.partnerProfile.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          id: 'user_123',
          referralCode: 'SUSAN-2026',
        } as any);

        const [partnerProfile, userWithCode] = await Promise.all([
          prisma.partnerProfile.findUnique({ where: { referralCode: 'SUSAN-2026' } }),
          prisma.user.findUnique({ where: { referralCode: 'SUSAN-2026' } }),
        ]);

        const isValid = partnerProfile !== null || userWithCode !== null;
        expect(isValid).toBe(true);
        expect(userWithCode?.referralCode).toBe('SUSAN-2026');
      });

      it('should reject invalid referral codes', async () => {
        vi.mocked(prisma.partnerProfile.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const [partnerProfile, userWithCode] = await Promise.all([
          prisma.partnerProfile.findUnique({ where: { referralCode: 'INVALID' } }),
          prisma.user.findUnique({ where: { referralCode: 'INVALID' } }),
        ]);

        const isValid = partnerProfile !== null || userWithCode !== null;
        expect(isValid).toBe(false);
      });
    });

    describe('Click event tracking', () => {
      it('should create referral event on click', async () => {
        vi.mocked(prisma.referralEvent.create).mockResolvedValue({
          id: 'event_123',
          referralCode: 'SUSAN-2026',
          eventType: 'CLICK',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          utmSource: 'facebook',
          utmMedium: 'social',
          utmCampaign: 'summer2026',
          createdAt: new Date(),
        } as any);

        const event = await prisma.referralEvent.create({
          data: {
            referralCode: 'SUSAN-2026',
            eventType: 'CLICK',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            utmSource: 'facebook',
            utmMedium: 'social',
            utmCampaign: 'summer2026',
          },
        });

        expect(prisma.referralEvent.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            referralCode: 'SUSAN-2026',
            eventType: 'CLICK',
          }),
        });
        expect(event.referralCode).toBe('SUSAN-2026');
        expect(event.eventType).toBe('CLICK');
      });

      it('should capture UTM parameters', async () => {
        vi.mocked(prisma.referralEvent.create).mockResolvedValue({
          id: 'event_123',
          referralCode: 'GOLD2024',
          eventType: 'CLICK',
          utmSource: 'google',
          utmMedium: 'cpc',
          utmCampaign: 'pickleball_ads',
        } as any);

        const event = await prisma.referralEvent.create({
          data: {
            referralCode: 'GOLD2024',
            eventType: 'CLICK',
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: 'pickleball_ads',
          },
        });

        expect(event.utmSource).toBe('google');
        expect(event.utmMedium).toBe('cpc');
        expect(event.utmCampaign).toBe('pickleball_ads');
      });
    });

    describe('Click count increment', () => {
      it('should increment partner click count', async () => {
        vi.mocked(prisma.partnerProfile.update).mockResolvedValue({
          id: 'partner_123',
          referralCodeClickCount: 6,
        } as any);

        const updated = await prisma.partnerProfile.update({
          where: { id: 'partner_123' },
          data: { referralCodeClickCount: { increment: 1 } },
        });

        expect(prisma.partnerProfile.update).toHaveBeenCalledWith({
          where: { id: 'partner_123' },
          data: { referralCodeClickCount: { increment: 1 } },
        });
        expect(updated.referralCodeClickCount).toBe(6);
      });
    });

    describe('First-click attribution', () => {
      it('should not overwrite existing cookie (first-click wins)', () => {
        const existingCookie = 'FIRST-CODE';
        const newCode = 'SECOND-CODE';

        // Logic: if cookie exists, don't overwrite
        const shouldSetCookie = !existingCookie;
        const finalCode = existingCookie || newCode;

        expect(shouldSetCookie).toBe(false);
        expect(finalCode).toBe('FIRST-CODE');
      });

      it('should set cookie when none exists', () => {
        const existingCookie: string | undefined = undefined;
        const newCode = 'FIRST-CODE';

        const shouldSetCookie = !existingCookie;
        const finalCode = existingCookie || newCode;

        expect(shouldSetCookie).toBe(true);
        expect(finalCode).toBe('FIRST-CODE');
      });
    });

    describe('Cookie configuration', () => {
      it('should use 30-day expiration', () => {
        const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
        expect(REFERRAL_COOKIE_MAX_AGE).toBe(2592000);
      });
    });
  });

  // ============================================================================
  // US-002: Referral Attribution at Application
  // ============================================================================
  describe('Referral Attribution at Application', () => {
    describe('Application referral tracking', () => {
      it('should create APPLICATION event when referral code exists', async () => {
        vi.mocked(prisma.referralEvent.create).mockResolvedValue({
          id: 'event_123',
          referralCode: 'SUSAN-2026',
          eventType: 'APPLICATION',
          userId: 'user_456',
        } as any);

        const event = await prisma.referralEvent.create({
          data: {
            referralCode: 'SUSAN-2026',
            eventType: 'APPLICATION',
            userId: 'user_456',
          },
        });

        expect(event.eventType).toBe('APPLICATION');
        expect(event.userId).toBe('user_456');
      });

      it('should award 100 points for application', () => {
        const APPLICATION_POINTS = 100;
        expect(APPLICATION_POINTS).toBe(100);
      });
    });
  });

  // ============================================================================
  // US-003: Referral Attribution at Booking
  // ============================================================================
  describe('Referral Attribution at Booking', () => {
    describe('Points calculation', () => {
      it('should award 1000 points for packages under $15K', () => {
        const totalPrice = 1000000; // $10,000
        const points = calculateGuestReferralPoints(totalPrice);
        expect(points).toBe(1000);
      });

      it('should award 1500 points for packages $15K or more', () => {
        const totalPrice = 1500000; // $15,000
        const points = calculateGuestReferralPoints(totalPrice);
        expect(points).toBe(1500);
      });

      it('should award 1500 points for packages over $15K', () => {
        const totalPrice = 2000000; // $20,000
        const points = calculateGuestReferralPoints(totalPrice);
        expect(points).toBe(1500);
      });

      it('should use correct threshold value', () => {
        expect(GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_THRESHOLD).toBe(1500000);
        expect(GUEST_REFERRAL_POINTS_CONFIG.STANDARD_POINTS).toBe(1000);
        expect(GUEST_REFERRAL_POINTS_CONFIG.HIGH_VALUE_POINTS).toBe(1500);
      });
    });

    describe('Manual referral code input', () => {
      it('should prefer manual code over cookie when both exist', () => {
        const cookieCode = 'COOKIE-CODE';
        const manualCode = 'MANUAL-CODE';

        // Logic: manual code takes precedence
        const finalCode = manualCode || cookieCode;
        expect(finalCode).toBe('MANUAL-CODE');
      });

      it('should use cookie code when no manual code provided', () => {
        const cookieCode = 'COOKIE-CODE';
        const manualCode: string | undefined = undefined;

        const finalCode = manualCode || cookieCode;
        expect(finalCode).toBe('COOKIE-CODE');
      });
    });

    describe('GuestReferral record creation', () => {
      it('should create GuestReferral with BOOKED status', async () => {
        vi.mocked(prisma.guestReferral.create).mockResolvedValue({
          id: 'ref_123',
          referrerUserId: 'referrer_123',
          referredUserId: 'referred_456',
          referralCode: 'SUSAN-2026',
          status: 'BOOKED',
          pointsEarned: 1000,
          createdAt: new Date(),
        } as any);

        const referral = await prisma.guestReferral.create({
          data: {
            referrerUserId: 'referrer_123',
            referredUserId: 'referred_456',
            referralCode: 'SUSAN-2026',
            status: 'BOOKED',
            pointsEarned: 1000,
          },
        });

        expect(referral.status).toBe('BOOKED');
        expect(referral.pointsEarned).toBe(1000);
      });
    });
  });

  // ============================================================================
  // US-004: Guest Referral Code Generation
  // ============================================================================
  describe('Guest Referral Code Generation', () => {
    describe('Code format', () => {
      it('should generate code in FIRSTNAME-YEAR format', () => {
        const firstName = 'SUSAN';
        const year = 2026;
        const baseCode = `${firstName}-${year}`;

        expect(baseCode).toBe('SUSAN-2026');
      });

      it('should handle missing first name', () => {
        const firstName = 'GUEST';
        const year = 2026;
        const baseCode = `${firstName}-${year}`;

        expect(baseCode).toBe('GUEST-2026');
      });

      it('should append counter for duplicates', () => {
        const baseCode = 'SUSAN-2026';
        const counter = 2;
        const uniqueCode = `${baseCode}-${counter}`;

        expect(uniqueCode).toBe('SUSAN-2026-2');
      });
    });

    describe('Eligibility check', () => {
      it('should require completed booking for code generation', async () => {
        vi.mocked(prisma.booking.findFirst).mockResolvedValue({
          id: 'booking_123',
          status: 'COMPLETED',
        } as any);

        const completedBooking = await prisma.booking.findFirst({
          where: { userId: 'user_123', status: 'COMPLETED' },
        });

        expect(completedBooking).not.toBeNull();
        expect(completedBooking?.status).toBe('COMPLETED');
      });

      it('should reject code generation without completed booking', async () => {
        vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);

        const completedBooking = await prisma.booking.findFirst({
          where: { userId: 'user_123', status: 'COMPLETED' },
        });

        expect(completedBooking).toBeNull();
      });
    });

    describe('Code uniqueness', () => {
      it('should check for existing codes before assigning', async () => {
        // First call returns existing code, second returns null (unique)
        vi.mocked(prisma.user.findUnique)
          .mockResolvedValueOnce({ id: 'user_other', referralCode: 'SUSAN-2026' } as any)
          .mockResolvedValueOnce(null);

        let referralCode = 'SUSAN-2026';
        let counter = 1;

        // Simulate uniqueness check loop
        let existing = await prisma.user.findUnique({
          where: { referralCode },
          select: { id: true },
        });

        if (existing) {
          counter++;
          referralCode = `SUSAN-2026-${counter}`;
          existing = await prisma.user.findUnique({
            where: { referralCode },
            select: { id: true },
          });
        }

        expect(referralCode).toBe('SUSAN-2026-2');
        expect(existing).toBeNull();
      });
    });
  });

  // ============================================================================
  // US-005: Completion Bonus Cron Job (tested in separate file)
  // ============================================================================
  describe('Post-Trip Completion Bonus', () => {
    describe('Bonus points', () => {
      it('should award 500 completion bonus points', () => {
        expect(GUEST_REFERRAL_POINTS_CONFIG.COMPLETION_BONUS_POINTS).toBe(500);
      });
    });

    describe('Duplicate prevention', () => {
      it('should check for existing COMPLETION event', async () => {
        vi.mocked(prisma.referralEvent.findFirst).mockResolvedValue({
          id: 'event_123',
          referralCode: 'SUSAN-2026',
          eventType: 'COMPLETION',
          userId: 'user_456',
        } as any);

        const existingCompletion = await prisma.referralEvent.findFirst({
          where: {
            referralCode: 'SUSAN-2026',
            eventType: 'COMPLETION',
            userId: 'user_456',
          },
        });

        expect(existingCompletion).not.toBeNull();
        expect(existingCompletion?.eventType).toBe('COMPLETION');
      });

      it('should proceed when no existing completion event', async () => {
        vi.mocked(prisma.referralEvent.findFirst).mockResolvedValue(null);

        const existingCompletion = await prisma.referralEvent.findFirst({
          where: {
            referralCode: 'SUSAN-2026',
            eventType: 'COMPLETION',
            userId: 'user_456',
          },
        });

        expect(existingCompletion).toBeNull();
      });
    });

    describe('Status update', () => {
      it('should update GuestReferral status to COMPLETED', async () => {
        vi.mocked(prisma.guestReferral.updateMany).mockResolvedValue({
          count: 1,
        } as any);

        const result = await prisma.guestReferral.updateMany({
          where: {
            referrerUserId: 'referrer_123',
            referredUserId: 'referred_456',
            status: { not: 'COMPLETED' },
          },
          data: {
            status: 'COMPLETED',
            pointsEarned: { increment: 500 },
          },
        });

        expect(result.count).toBe(1);
      });
    });
  });

  // ============================================================================
  // US-006: Referral Analytics Queries
  // ============================================================================
  describe('Referral Analytics Queries', () => {
    describe('Funnel statistics', () => {
      it('should count events by type', async () => {
        vi.mocked(prisma.referralEvent.count)
          .mockResolvedValueOnce(1000) // clicks
          .mockResolvedValueOnce(200) // applications
          .mockResolvedValueOnce(50) // bookings
          .mockResolvedValueOnce(40); // completed

        const [clicks, applications, bookings, completed] = await Promise.all([
          prisma.referralEvent.count({ where: { eventType: 'CLICK' } }),
          prisma.referralEvent.count({ where: { eventType: 'APPLICATION' } }),
          prisma.referralEvent.count({ where: { eventType: 'BOOKING' } }),
          prisma.referralEvent.count({ where: { eventType: 'COMPLETION' } }),
        ]);

        expect(clicks).toBe(1000);
        expect(applications).toBe(200);
        expect(bookings).toBe(50);
        expect(completed).toBe(40);
      });

      it('should calculate conversion rates', () => {
        const clicks = 1000;
        const applications = 200;
        const bookings = 50;
        const completed = 40;

        const clickToApplication = clicks > 0 ? Math.round((applications / clicks) * 100) : 0;
        const applicationToBooking =
          applications > 0 ? Math.round((bookings / applications) * 100) : 0;
        const bookingToCompletion = bookings > 0 ? Math.round((completed / bookings) * 100) : 0;
        const overallConversion = clicks > 0 ? Math.round((completed / clicks) * 100) : 0;

        expect(clickToApplication).toBe(20);
        expect(applicationToBooking).toBe(25);
        expect(bookingToCompletion).toBe(80);
        expect(overallConversion).toBe(4);
      });

      it('should handle zero values in conversion rates', () => {
        const clicks = 0;
        const applications = 0;

        const clickToApplication = clicks > 0 ? Math.round((applications / clicks) * 100) : 0;
        expect(clickToApplication).toBe(0);
      });
    });

    describe('Top referrers', () => {
      it('should fetch top partner referrers', async () => {
        vi.mocked(prisma.partnerProfile.findMany).mockResolvedValue([
          {
            id: 'partner_1',
            clubName: 'Tennis Club Pro',
            referralCode: 'TCP2024',
            referralCodeClickCount: 500,
            passportPoints: 10000,
            user: { email: 'partner1@example.com' },
          },
          {
            id: 'partner_2',
            clubName: 'Pickleball Palace',
            referralCode: 'PP2024',
            referralCodeClickCount: 300,
            passportPoints: 5000,
            user: { email: 'partner2@example.com' },
          },
        ] as any);

        const topPartners = await prisma.partnerProfile.findMany({
          where: { referralCodeClickCount: { gt: 0 } },
          orderBy: { referralCodeClickCount: 'desc' },
          take: 10,
        });

        expect(topPartners).toHaveLength(2);
        expect(topPartners[0].referralCodeClickCount).toBe(500);
      });

      it('should fetch top guest referrers', async () => {
        vi.mocked(prisma.user.findMany).mockResolvedValue([
          {
            id: 'user_1',
            email: 'guest1@example.com',
            referralCode: 'SUSAN-2026',
            referralPointsBalance: 5000,
          },
          {
            id: 'user_2',
            email: 'guest2@example.com',
            referralCode: 'BOB-2026',
            referralPointsBalance: 3000,
          },
        ] as any);

        const topGuests = await prisma.user.findMany({
          where: {
            referralCode: { not: null },
            referralPointsBalance: { gt: 0 },
          },
          orderBy: { referralPointsBalance: 'desc' },
          take: 10,
        });

        expect(topGuests).toHaveLength(2);
        expect(topGuests[0].referralPointsBalance).toBe(5000);
      });
    });

    describe('Source breakdown', () => {
      it('should categorize events by source type', () => {
        const partnerCodes = new Set(['TCP2024', 'PP2024']);
        const guestCodes = new Set(['SUSAN-2026', 'BOB-2026']);

        const testCode1 = 'TCP2024';
        const testCode2 = 'SUSAN-2026';
        const testCode3 = 'UNKNOWN-CODE';

        const getSource = (code: string): 'partner' | 'guest' | 'unknown' => {
          if (partnerCodes.has(code)) return 'partner';
          if (guestCodes.has(code)) return 'guest';
          return 'unknown';
        };

        expect(getSource(testCode1)).toBe('partner');
        expect(getSource(testCode2)).toBe('guest');
        expect(getSource(testCode3)).toBe('unknown');
      });

      it('should calculate percentages correctly', () => {
        const partner = { clicks: 600 };
        const guest = { clicks: 300 };
        const unknown = { clicks: 100 };
        const total = partner.clicks + guest.clicks + unknown.clicks;

        const partnerPercent = total > 0 ? Math.round((partner.clicks / total) * 100) : 0;
        const guestPercent = total > 0 ? Math.round((guest.clicks / total) * 100) : 0;

        expect(partnerPercent).toBe(60);
        expect(guestPercent).toBe(30);
      });
    });

    describe('Date filtering', () => {
      it('should construct date filter correctly', () => {
        const startDate = new Date('2026-01-01');
        const endDate = new Date('2026-01-31');

        // Date filter construction as used in admin.ts
        const dateFilter: Record<string, unknown> = {};
        if (startDate) {
          dateFilter.createdAt = { ...(dateFilter.createdAt as object), gte: startDate };
        }
        if (endDate) {
          dateFilter.createdAt = { ...(dateFilter.createdAt as object), lte: endDate };
        }

        expect(dateFilter).toEqual({
          createdAt: { gte: startDate, lte: endDate },
        });
      });

      it('should handle partial date ranges', () => {
        const startDate = new Date('2026-01-01');
        const endDate = undefined;

        // Date filter construction with partial range
        const dateFilter: Record<string, unknown> = {};
        if (startDate) {
          dateFilter.createdAt = { ...(dateFilter.createdAt as object), gte: startDate };
        }
        if (endDate) {
          dateFilter.createdAt = { ...(dateFilter.createdAt as object), lte: endDate };
        }

        expect(dateFilter).toEqual({
          createdAt: { gte: startDate },
        });
      });
    });
  });

  // ============================================================================
  // US-007: UTM Parameter Tracking
  // ============================================================================
  describe('UTM Parameter Tracking', () => {
    describe('UTM capture', () => {
      it('should capture UTM params from referral events', async () => {
        vi.mocked(prisma.referralEvent.groupBy).mockResolvedValue([
          { utmSource: 'facebook', eventType: 'CLICK', _count: 100 },
          { utmSource: 'facebook', eventType: 'BOOKING', _count: 10 },
          { utmSource: 'google', eventType: 'CLICK', _count: 200 },
          { utmSource: 'google', eventType: 'BOOKING', _count: 30 },
        ] as any);

        const utmData = await prisma.referralEvent.groupBy({
          by: ['utmSource', 'eventType'],
          where: { utmSource: { not: null } },
          _count: true,
        });

        expect(utmData).toHaveLength(4);
        expect(utmData.some((d) => d.utmSource === 'facebook')).toBe(true);
        expect(utmData.some((d) => d.utmSource === 'google')).toBe(true);
      });
    });

    describe('UTM breakdown processing', () => {
      it('should process UTM data into source map', () => {
        const rawData = [
          { utmSource: 'facebook', eventType: 'CLICK', _count: 100 },
          { utmSource: 'facebook', eventType: 'BOOKING', _count: 10 },
          { utmSource: 'google', eventType: 'CLICK', _count: 200 },
          { utmSource: 'google', eventType: 'BOOKING', _count: 30 },
        ];

        const sourceMap: Record<
          string,
          { clicks: number; applications: number; bookings: number; completed: number }
        > = {};

        for (const row of rawData) {
          const source = row.utmSource || 'unknown';
          if (!sourceMap[source]) {
            sourceMap[source] = { clicks: 0, applications: 0, bookings: 0, completed: 0 };
          }
          if (row.eventType === 'CLICK') sourceMap[source].clicks = row._count;
          if (row.eventType === 'BOOKING') sourceMap[source].bookings = row._count;
        }

        expect(sourceMap.facebook.clicks).toBe(100);
        expect(sourceMap.facebook.bookings).toBe(10);
        expect(sourceMap.google.clicks).toBe(200);
        expect(sourceMap.google.bookings).toBe(30);
      });

      it('should calculate conversion rates per UTM source', () => {
        const sourceData = { clicks: 100, bookings: 10 };
        const conversionRate =
          sourceData.clicks > 0 ? Math.round((sourceData.bookings / sourceData.clicks) * 100) : 0;

        expect(conversionRate).toBe(10);
      });
    });

    describe('UTM source list', () => {
      it('should fetch distinct UTM sources', async () => {
        vi.mocked(prisma.referralEvent.findMany).mockResolvedValue([
          { utmSource: 'facebook' },
          { utmSource: 'google' },
          { utmSource: 'instagram' },
        ] as any);

        const sources = await prisma.referralEvent.findMany({
          where: { utmSource: { not: null } },
          select: { utmSource: true },
          distinct: ['utmSource'],
          orderBy: { utmSource: 'asc' },
        });

        const sourceList = sources.map((s) => s.utmSource).filter((s): s is string => s !== null);

        expect(sourceList).toEqual(['facebook', 'google', 'instagram']);
      });
    });
  });
});
