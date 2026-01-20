/**
 * Gift State Transition Service Tests (GS-003)
 *
 * Tests for the gift state transition service with mocked external services.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GiftState } from '@prisma/client'

// Mock dependencies before importing the module
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    giftStateTransition: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    payment: {
      update: vi.fn(),
    },
    trip: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      booking: { findUnique: vi.fn(), update: vi.fn() },
      giftStateTransition: { create: vi.fn().mockResolvedValue({ id: 'transition-1' }) },
      trip: { update: vi.fn() },
    })),
  },
}))

vi.mock('@/lib/email/sendgrid', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email/templates/gift-notification-recipient', () => ({
  generateGiftNotificationRecipientEmail: vi.fn().mockReturnValue({
    subject: 'Gift Notification',
    html: '<p>Gift</p>',
    text: 'Gift',
  }),
}))

vi.mock('@/lib/email/templates/gift-acceptance-confirmation-recipient', () => ({
  generateGiftAcceptanceConfirmationRecipientEmail: vi.fn().mockReturnValue({
    subject: 'Gift Accepted',
    html: '<p>Accepted</p>',
    text: 'Accepted',
  }),
}))

vi.mock('@/lib/email/templates/gift-acceptance-notification-purchaser', () => ({
  generateGiftAcceptanceNotificationPurchaserEmail: vi.fn().mockReturnValue({
    subject: 'Gift Accepted Notification',
    html: '<p>Accepted</p>',
    text: 'Accepted',
  }),
}))

vi.mock('@/lib/logger', () => ({
  giftLogger: { info: vi.fn(), error: vi.fn() },
  emailLogger: { info: vi.fn(), error: vi.fn() },
  stripeLogger: { info: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUser: vi.fn().mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
      }),
    },
  }),
}))

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    refunds: {
      create: vi.fn().mockResolvedValue({ id: 'refund-1' }),
    },
  })),
}))

import { prisma } from '@/lib/db'
import * as transitionService from '../gift-transition-service'
import { giftStateMachine } from '../gift-state-machine'

describe('GiftTransitionService', () => {
  const mockBooking = {
    id: 'booking-1',
    bookingReference: 'PBP-2026-000001',
    isGift: true,
    giftStatus: 'PENDING',
    giftPurchaserId: 'user-1',
    giftRecipientEmail: 'recipient@example.com',
    giftRecipientName: 'Jane Doe',
    giftMessage: 'Happy Birthday!',
    giftAcceptanceToken: 'token-123',
    giftDeliveryDate: new Date('2026-01-15'),
    giftExpiresAt: null,
    tripId: 'trip-1',
    totalPrice: 1500000, // $15,000
    duration: 14,
    accommodationTier: 'Luxury',
    package: {
      name: 'Pure Play',
      tagline: 'Wellness Package',
    },
    trip: {
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-14'),
      destination: 'Chiang Mai, Thailand',
    },
    user: {
      email: 'purchaser@example.com',
    },
    payments: [{
      id: 'payment-1',
      stripePaymentIntentId: 'pi_test123',
      status: 'SUCCEEDED',
    }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('transitionGiftState', () => {
    it('should return error when booking not found', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(null)

      const result = await transitionService.transitionGiftState(
        'nonexistent',
        GiftState.SENT,
        'system'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking not found')
    })

    it('should return error when booking is not a gift', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        ...mockBooking,
        isGift: false,
      } as any)

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.SENT,
        'system'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking is not a gift')
    })

    it('should return error for invalid transition', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any)

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.ACCEPTED, // Invalid: PENDING -> ACCEPTED
        'system'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })

    it('should successfully transition from PENDING to SENT', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockResolvedValue({ id: 'transition-1' }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(mockBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.SENT,
        'cron',
        { skipEmails: true }
      )

      expect(result.success).toBe(true)
      expect(result.fromState).toBe(GiftState.PENDING)
      expect(result.toState).toBe(GiftState.SENT)
      expect(result.transitionId).toBe('transition-1')
    })

    it('should successfully transition from SENT to ACCEPTED', async () => {
      const sentBooking = { ...mockBooking, giftStatus: 'SENT' }
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(sentBooking as any)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockResolvedValue({ id: 'transition-2' }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(sentBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.ACCEPTED,
        'user',
        {
          recipientUserId: 'recipient-user-1',
          recipientEmail: 'recipient@example.com',
          skipEmails: true,
        }
      )

      expect(result.success).toBe(true)
      expect(result.fromState).toBe(GiftState.SENT)
      expect(result.toState).toBe(GiftState.ACCEPTED)
    })

    it('should successfully transition from SENT to DECLINED', async () => {
      const sentBooking = { ...mockBooking, giftStatus: 'SENT' }
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(sentBooking as any)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockResolvedValue({ id: 'transition-3' }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(sentBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.DECLINED,
        'user',
        {
          declineReason: 'Unable to travel',
          skipEmails: true,
        }
      )

      expect(result.success).toBe(true)
      expect(result.fromState).toBe(GiftState.SENT)
      expect(result.toState).toBe(GiftState.DECLINED)
    })

    it('should successfully transition from SENT to EXPIRED', async () => {
      const sentBooking = { ...mockBooking, giftStatus: 'SENT' }
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(sentBooking as any)
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockResolvedValue({ id: 'transition-4' }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(sentBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.EXPIRED,
        'cron',
        { skipEmails: true }
      )

      expect(result.success).toBe(true)
      expect(result.fromState).toBe(GiftState.SENT)
      expect(result.toState).toBe(GiftState.EXPIRED)
    })

    it('should not allow transition from terminal state', async () => {
      const acceptedBooking = { ...mockBooking, giftStatus: 'ACCEPTED' }
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(acceptedBooking as any)

      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.DECLINED,
        'user'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('terminal state')
    })

    it('should support custom reasons', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any)

      let capturedReason: string | undefined
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockImplementation((data) => {
              capturedReason = data.data.reason
              return Promise.resolve({ id: 'transition-5' })
            }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(mockBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      await transitionService.transitionGiftState(
        'booking-1',
        GiftState.SENT,
        'system',
        {
          customReason: 'Manual send by admin',
          skipEmails: true,
        }
      )

      expect(capturedReason).toBe('Manual send by admin')
    })
  })

  describe('getGiftStateHistory', () => {
    it('should return transition history for a booking', async () => {
      const mockHistory = [
        {
          id: 'transition-1',
          bookingId: 'booking-1',
          fromState: GiftState.PENDING,
          toState: GiftState.SENT,
          reason: 'Gift notification sent',
          createdAt: new Date('2026-01-15'),
        },
        {
          id: 'transition-2',
          bookingId: 'booking-1',
          fromState: GiftState.SENT,
          toState: GiftState.ACCEPTED,
          reason: 'Recipient accepted',
          createdAt: new Date('2026-01-20'),
        },
      ]

      vi.mocked(prisma.giftStateTransition.findMany).mockResolvedValue(mockHistory)

      const history = await transitionService.getGiftStateHistory('booking-1')

      expect(history).toHaveLength(2)
      expect(prisma.giftStateTransition.findMany).toHaveBeenCalledWith({
        where: { bookingId: 'booking-1' },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('isGiftExpired', () => {
    it('should return false for null expiration date', () => {
      expect(transitionService.isGiftExpired(null)).toBe(false)
    })

    it('should return false for future expiration date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      expect(transitionService.isGiftExpired(futureDate)).toBe(false)
    })

    it('should return true for past expiration date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      expect(transitionService.isGiftExpired(pastDate)).toBe(true)
    })
  })

  describe('state machine integration', () => {
    it('should use state machine for validation', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any)

      // PENDING -> ACCEPTED is invalid
      const result = await transitionService.transitionGiftState(
        'booking-1',
        GiftState.ACCEPTED,
        'user'
      )

      expect(result.success).toBe(false)
      // The error should come from the state machine
      expect(giftStateMachine.canTransition(GiftState.PENDING, GiftState.ACCEPTED)).toBe(false)
    })

    it('should use state machine default reasons', async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any)

      let capturedReason: string | undefined
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback({
          giftStateTransition: {
            create: vi.fn().mockImplementation((data) => {
              capturedReason = data.data.reason
              return Promise.resolve({ id: 'transition-6' })
            }),
          },
          booking: {
            update: vi.fn().mockResolvedValue(mockBooking),
          },
          trip: {
            update: vi.fn(),
          },
        } as any)
      })

      await transitionService.transitionGiftState(
        'booking-1',
        GiftState.SENT,
        'cron',
        { skipEmails: true }
      )

      expect(capturedReason).toBe(
        giftStateMachine.getTransitionReason(GiftState.PENDING, GiftState.SENT)
      )
    })
  })
})
