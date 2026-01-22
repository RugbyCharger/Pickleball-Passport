/**
 * Gift Expiration Cron Job Tests (GS-005)
 *
 * Tests for the expire-gifts cron route with mocked database and services.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GiftState } from '@prisma/client'

// Mock environment variables
vi.stubEnv('CRON_SECRET', 'test-cron-secret')

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/gift/gift-transition-service', () => ({
  transitionGiftState: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  giftLogger: { info: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}))

import { GET } from '../expire-gifts/route'
import { prisma } from '@/lib/db'
import * as transitionService from '@/lib/gift/gift-transition-service'

describe('GET /api/cron/expire-gifts', () => {
  const createRequest = (authHeader?: string) => {
    const headers = new Headers()
    if (authHeader) {
      headers.set('authorization', authHeader)
    }
    return new NextRequest('http://localhost/api/cron/expire-gifts', { headers })
  }

  const mockExpiredGifts = [
    {
      id: 'booking-1',
      bookingReference: 'PBP-2026-000001',
      giftRecipientName: 'Jane Doe',
      giftRecipientEmail: 'jane@example.com',
      giftExpiresAt: new Date('2026-01-01'),
      totalPrice: 1500000,
    },
    {
      id: 'booking-2',
      bookingReference: 'PBP-2026-000002',
      giftRecipientName: 'John Smith',
      giftRecipientEmail: 'john@example.com',
      giftExpiresAt: new Date('2026-01-05'),
      totalPrice: 2000000,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.booking.findMany).mockResolvedValue([])
    vi.mocked(transitionService.transitionGiftState).mockResolvedValue({
      success: true,
      fromState: GiftState.SENT,
      toState: GiftState.EXPIRED,
      bookingId: 'booking-1',
      transitionId: 'transition-1',
    })
  })

  describe('Authorization', () => {
    it('should return 500 if CRON_SECRET not configured', async () => {
      vi.stubEnv('CRON_SECRET', '')

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Cron job not configured')

      // Restore
      vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    })

    it('should return 401 if authorization header missing', async () => {
      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 401 if authorization token incorrect', async () => {
      const request = createRequest('Bearer wrong-token')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should proceed if authorization token correct', async () => {
      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalExpired).toBe(0)
    })
  })

  describe('Gift expiration processing', () => {
    it('should return success when no expired gifts', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalExpired).toBe(0)
      expect(data.successful).toBe(0)
      expect(data.failed).toBe(0)
      expect(data.message).toBe('No expired gifts to process')
    })

    it('should find and expire SENT gifts with giftExpiresAt <= now', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockExpiredGifts)
      vi.mocked(transitionService.transitionGiftState).mockResolvedValue({
        success: true,
        fromState: GiftState.SENT,
        toState: GiftState.EXPIRED,
        bookingId: 'booking-1',
        transitionId: 'transition-1',
      })

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalExpired).toBe(2)
      expect(data.successful).toBe(2)
      expect(data.failed).toBe(0)

      // Verify transition was called with correct parameters
      expect(transitionService.transitionGiftState).toHaveBeenCalledTimes(2)
      expect(transitionService.transitionGiftState).toHaveBeenCalledWith(
        'booking-1',
        GiftState.EXPIRED,
        'cron',
        expect.objectContaining({
          customReason: 'Auto-expired: 30 days without recipient response',
        })
      )
    })

    it('should handle transition failures gracefully', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockExpiredGifts)
      vi.mocked(transitionService.transitionGiftState)
        .mockResolvedValueOnce({
          success: true,
          fromState: GiftState.SENT,
          toState: GiftState.EXPIRED,
          bookingId: 'booking-1',
          transitionId: 'transition-1',
        })
        .mockResolvedValueOnce({
          success: false,
          fromState: GiftState.SENT,
          toState: GiftState.EXPIRED,
          bookingId: 'booking-2',
          transitionId: '',
          error: 'Transition failed',
        })

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalExpired).toBe(2)
      expect(data.successful).toBe(1)
      expect(data.failed).toBe(1)

      // Check results array
      expect(data.results[0].result).toBe('success')
      expect(data.results[1].result).toBe('failed')
      expect(data.results[1].error).toBe('Transition failed')
    })

    it('should handle exceptions during transition', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([mockExpiredGifts[0]])
      vi.mocked(transitionService.transitionGiftState).mockRejectedValue(
        new Error('Database error')
      )

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalExpired).toBe(1)
      expect(data.successful).toBe(0)
      expect(data.failed).toBe(1)
      expect(data.results[0].error).toBe('Database error')
    })

    it('should query database with correct filters', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      await GET(request)

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isGift: true,
            giftStatus: 'SENT',
            giftExpiresAt: {
              lte: expect.any(Date),
            },
          },
          orderBy: {
            giftExpiresAt: 'asc',
          },
          take: 100, // MAX_GIFTS_PER_RUN
        })
      )
    })
  })

  describe('Execution summary', () => {
    it('should return execution time in response', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(data.executionTimeMs).toBeDefined()
      expect(typeof data.executionTimeMs).toBe('number')
    })

    it('should return processedAt timestamp', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(data.processedAt).toBeDefined()
      expect(new Date(data.processedAt)).toBeInstanceOf(Date)
    })
  })

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      vi.mocked(prisma.booking.findMany).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Cron job failed')
      expect(data.message).toBe('Database connection failed')
    })
  })
})
