/**
 * Partner Notification Service Tests
 * E11-S9: Partner Notification System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock modules at top level with factory functions
vi.mock('@/lib/db', () => ({
  prisma: {
    partnerProfile: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/email/sendgrid', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  emailLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  logError: vi.fn(),
}))

// Import after mocks
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/sendgrid'
import {
  sendPartnerBookingNotification,
  sendPartnerApplicationNotification,
  sendPartnerPointsEarnedNotification,
  sendPartnerTierChangeNotification,
  sendPartnerCommissionNotification,
  getTierDisplayName,
  getTierCommissionRate,
  getTierBenefits,
  calculateBookingsUntilNextTier,
} from '../partner-notifications'
import type { PartnerReferralBookingData } from '@/lib/email/templates/partner-referral-booking'
import type { PartnerReferralApplicationData } from '@/lib/email/templates/partner-referral-application'
import type { PartnerPointsEarnedData } from '@/lib/email/templates/partner-points-earned'
import type { PartnerTierChangeData } from '@/lib/email/templates/partner-tier-change'
import type { PartnerCommissionAvailableData } from '@/lib/email/templates/partner-commission-available'

// Get mocked functions
const mockFindUnique = prisma.partnerProfile.findUnique as ReturnType<typeof vi.fn>
const mockCreate = prisma.notification.create as ReturnType<typeof vi.fn>
const mockSendEmail = sendEmail as ReturnType<typeof vi.fn>

describe('Partner Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no preferences set (use defaults)
    mockFindUnique.mockResolvedValue(null)
    mockSendEmail.mockResolvedValue(undefined)
    mockCreate.mockResolvedValue({ id: 'notif-123' })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('sendPartnerBookingNotification', () => {
    const mockBookingData: PartnerReferralBookingData = {
      partnerName: 'John Smith',
      partnerEmail: 'john@partner.com',
      guestName: 'Jane Doe',
      bookingReference: 'BOOK-12345',
      packageName: '14-Day Pickleball Adventure',
      tripDates: {
        start: '2025-03-01T00:00:00.000Z',
        end: '2025-03-15T00:00:00.000Z',
      },
      totalValue: 850000, // $8,500
      pointsEarned: 850,
      newPointsBalance: 2500,
      currentTier: 'SILVER',
      bookingsUntilNextTier: 3,
      nextTier: 'Gold',
    }

    it('should send email and create in-app notification when preferences are default', async () => {
      await sendPartnerBookingNotification('partner-123', 'user-123', mockBookingData)

      // Email should be sent
      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@partner.com',
          subject: expect.stringContaining('Jane Doe'),
        })
      )

      // In-app notification should be created
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-123',
            type: 'REFERRAL_BOOKING',
            title: expect.stringContaining('850'),
          }),
        })
      )
    })

    it('should skip email when emailBookings preference is disabled', async () => {
      mockFindUnique.mockResolvedValue({
        notificationPreferences: { emailBookings: false },
      })

      await sendPartnerBookingNotification('partner-123', 'user-123', mockBookingData)

      // Email should NOT be sent
      expect(mockSendEmail).not.toHaveBeenCalled()

      // In-app notification should still be created (default enabled)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('should skip in-app notification when inAppBookings preference is disabled', async () => {
      mockFindUnique.mockResolvedValue({
        notificationPreferences: { inAppBookings: false },
      })

      await sendPartnerBookingNotification('partner-123', 'user-123', mockBookingData)

      // Email should be sent (default enabled)
      expect(mockSendEmail).toHaveBeenCalledTimes(1)

      // In-app notification should NOT be created
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should not throw when email fails (non-blocking)', async () => {
      mockSendEmail.mockRejectedValue(new Error('SendGrid error'))

      // Should not throw
      await expect(
        sendPartnerBookingNotification('partner-123', 'user-123', mockBookingData)
      ).resolves.not.toThrow()
    })

    it('should not throw when in-app notification creation fails (non-blocking)', async () => {
      mockCreate.mockRejectedValue(new Error('DB error'))

      // Should not throw
      await expect(
        sendPartnerBookingNotification('partner-123', 'user-123', mockBookingData)
      ).resolves.not.toThrow()
    })
  })

  describe('sendPartnerApplicationNotification', () => {
    const mockApplicationData: PartnerReferralApplicationData = {
      partnerName: 'John Smith',
      partnerEmail: 'john@partner.com',
      guestInitials: 'J.D.',
      applicationDate: '2025-02-15T00:00:00.000Z',
      potentialPoints: 850,
      referralDetailsUrl: '/partners/referrals/ref-123',
    }

    it('should send email and create in-app notification for applications', async () => {
      await sendPartnerApplicationNotification('partner-123', 'user-123', mockApplicationData)

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'REFERRAL_APPLICATION',
            title: expect.stringContaining('New Application'),
          }),
        })
      )
    })

    it('should skip when application notifications are disabled', async () => {
      mockFindUnique.mockResolvedValue({
        notificationPreferences: { emailApplications: false, inAppApplications: false },
      })

      await sendPartnerApplicationNotification('partner-123', 'user-123', mockApplicationData)

      expect(mockSendEmail).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe('sendPartnerPointsEarnedNotification', () => {
    const mockPointsData: PartnerPointsEarnedData = {
      partnerName: 'John Smith',
      partnerEmail: 'john@partner.com',
      pointsEarned: 850,
      reason: 'Referral booking confirmed',
      newBalance: 2500,
      redemptionOptions: [
        { name: 'Trip Credit', description: '$500 credit', pointsRequired: 5000 },
      ],
    }

    it('should send points earned notification', async () => {
      await sendPartnerPointsEarnedNotification('partner-123', 'user-123', mockPointsData)

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'POINTS_EARNED',
            title: expect.stringContaining('850'),
          }),
        })
      )
    })
  })

  describe('sendPartnerTierChangeNotification', () => {
    const mockTierData: PartnerTierChangeData = {
      partnerName: 'John Smith',
      partnerEmail: 'john@partner.com',
      previousTier: 'BRONZE',
      newTier: 'SILVER',
      newCommissionRate: '$750/player',
      tierBenefits: ['$750 per booked player', 'FREE solo trip'],
      nextTierGoal: '5 more bookings to Gold',
    }

    it('should send tier change notification', async () => {
      await sendPartnerTierChangeNotification('partner-123', 'user-123', mockTierData)

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'TIER_CHANGE',
            title: expect.stringContaining('Silver'),
          }),
        })
      )
    })
  })

  describe('sendPartnerCommissionNotification', () => {
    const mockCommissionData: PartnerCommissionAvailableData = {
      partnerName: 'John Smith',
      partnerEmail: 'john@partner.com',
      availableBalance: 5000,
      redemptionOptions: [
        { name: 'Cash Out', description: 'Direct deposit', pointsRequired: 5000 },
      ],
      rewardsUrl: '/partners/rewards',
    }

    it('should send commission available notification', async () => {
      await sendPartnerCommissionNotification('partner-123', 'user-123', mockCommissionData)

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'COMMISSION_AVAILABLE',
            title: expect.stringContaining('Ready to Redeem'),
          }),
        })
      )
    })
  })

  describe('Helper Functions', () => {
    describe('getTierDisplayName', () => {
      it('should return correct display names', () => {
        expect(getTierDisplayName('BRONZE')).toBe('Bronze')
        expect(getTierDisplayName('SILVER')).toBe('Silver')
        expect(getTierDisplayName('GOLD')).toBe('Gold')
        expect(getTierDisplayName('PLATINUM')).toBe('Platinum')
        expect(getTierDisplayName('UNKNOWN')).toBe('UNKNOWN')
      })
    })

    describe('getTierCommissionRate', () => {
      it('should return correct commission rates', () => {
        expect(getTierCommissionRate('BRONZE')).toBe('$500/player')
        expect(getTierCommissionRate('SILVER')).toBe('$750/player')
        expect(getTierCommissionRate('GOLD')).toBe('$1,000/player')
        expect(getTierCommissionRate('PLATINUM')).toBe('$1,500/player')
        expect(getTierCommissionRate('UNKNOWN')).toBe('$500/player')
      })
    })

    describe('getTierBenefits', () => {
      it('should return benefits array for each tier', () => {
        const bronzeBenefits = getTierBenefits('BRONZE')
        expect(bronzeBenefits).toContain('$500 per booked player')
        expect(bronzeBenefits).toContain('50% off your own trip')

        const platinumBenefits = getTierBenefits('PLATINUM')
        expect(platinumBenefits).toContain('$1,500 per booked player')
        expect(platinumBenefits).toContain('Revenue share potential')
      })

      it('should return Bronze benefits for unknown tier', () => {
        const benefits = getTierBenefits('UNKNOWN')
        expect(benefits).toContain('$500 per booked player')
      })
    })

    describe('calculateBookingsUntilNextTier', () => {
      it('should calculate bookings needed for Bronze to Silver', () => {
        const result = calculateBookingsUntilNextTier(2, 'BRONZE')
        expect(result).toEqual({
          bookingsNeeded: 3, // 5 - 2 = 3
          nextTier: 'Silver',
        })
      })

      it('should calculate bookings needed for Silver to Gold', () => {
        const result = calculateBookingsUntilNextTier(7, 'SILVER')
        expect(result).toEqual({
          bookingsNeeded: 3, // 10 - 7 = 3
          nextTier: 'Gold',
        })
      })

      it('should calculate bookings needed for Gold to Platinum', () => {
        const result = calculateBookingsUntilNextTier(15, 'GOLD')
        expect(result).toEqual({
          bookingsNeeded: 5, // 20 - 15 = 5
          nextTier: 'Platinum',
        })
      })

      it('should return null for Platinum tier (no next tier)', () => {
        const result = calculateBookingsUntilNextTier(25, 'PLATINUM')
        expect(result).toBeNull()
      })

      it('should return null for invalid tier', () => {
        const result = calculateBookingsUntilNextTier(5, 'INVALID')
        expect(result).toBeNull()
      })

      it('should handle edge case at tier boundary', () => {
        const result = calculateBookingsUntilNextTier(4, 'BRONZE')
        expect(result).toEqual({
          bookingsNeeded: 1, // 5 - 4 = 1
          nextTier: 'Silver',
        })
      })
    })
  })

  describe('Preference Merging', () => {
    it('should use default preferences when partner has none set', async () => {
      mockFindUnique.mockResolvedValue(null)

      const mockData: PartnerReferralBookingData = {
        partnerName: 'John',
        partnerEmail: 'john@test.com',
        guestName: 'Jane',
        bookingReference: 'BK-123',
        packageName: 'Test Package',
        tripDates: { start: '2025-01-01', end: '2025-01-15' },
        totalValue: 100000,
        pointsEarned: 100,
        newPointsBalance: 100,
        currentTier: 'BRONZE',
      }

      await sendPartnerBookingNotification('partner-123', 'user-123', mockData)

      // Both should be called with default preferences (all enabled)
      expect(mockSendEmail).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should merge partial preferences with defaults', async () => {
      // Partner only disabled one preference
      mockFindUnique.mockResolvedValue({
        notificationPreferences: { emailBookings: false },
      })

      const mockData: PartnerReferralBookingData = {
        partnerName: 'John',
        partnerEmail: 'john@test.com',
        guestName: 'Jane',
        bookingReference: 'BK-123',
        packageName: 'Test Package',
        tripDates: { start: '2025-01-01', end: '2025-01-15' },
        totalValue: 100000,
        pointsEarned: 100,
        newPointsBalance: 100,
        currentTier: 'BRONZE',
      }

      await sendPartnerBookingNotification('partner-123', 'user-123', mockData)

      // Email should NOT be sent (explicitly disabled)
      expect(mockSendEmail).not.toHaveBeenCalled()

      // In-app should still be sent (defaults to enabled)
      expect(mockCreate).toHaveBeenCalled()
    })
  })
})
