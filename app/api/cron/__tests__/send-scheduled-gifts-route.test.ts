/**
 * Send Scheduled Gifts Cron Job Tests (GS-006)
 *
 * Tests for the send-scheduled-gifts cron route using state machine.
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

import { GET } from '../send-scheduled-gifts/route'
import { prisma } from '@/lib/db'
import * as transitionService from '@/lib/gift/gift-transition-service'

describe('GET /api/cron/send-scheduled-gifts', () => {
  const createRequest = (authHeader?: string) => {
    const headers = new Headers()
    if (authHeader) {
      headers.set('authorization', authHeader)
    }
    return new NextRequest('http://localhost/api/cron/send-scheduled-gifts', { headers })
  }

  const mockPendingGifts = [
    {
      id: 'booking-1',
      bookingReference: 'PBP-2026-000001',
      giftRecipientName: 'Jane Doe',
      giftRecipientEmail: 'jane@example.com',
      giftDeliveryDate: new Date('2026-01-15'),
      totalPrice: 1500000,
    },
    {
      id: 'booking-2',
      bookingReference: 'PBP-2026-000002',
      giftRecipientName: 'John Smith',
      giftRecipientEmail: 'john@example.com',
      giftDeliveryDate: new Date('2026-01-15'),
      totalPrice: 2000000,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.booking.findMany).mockResolvedValue([])
    vi.mocked(transitionService.transitionGiftState).mockResolvedValue({
      success: true,
      fromState: GiftState.PENDING,
      toState: GiftState.SENT,
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
      expect(data.success).toBe(true)
    })
  })

  describe('Gift sending', () => {
    it('should return success when no gifts to send', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(0)
      expect(data.sent).toBe(0)
      expect(data.failed).toBe(0)
      expect(data.message).toBe('No scheduled gifts to send')
    })

    it('should transition PENDING gifts to SENT using state machine', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockPendingGifts)
      vi.mocked(transitionService.transitionGiftState).mockResolvedValue({
        success: true,
        fromState: GiftState.PENDING,
        toState: GiftState.SENT,
        bookingId: 'booking-1',
        transitionId: 'transition-1',
      })

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(2)
      expect(data.sent).toBe(2)
      expect(data.failed).toBe(0)

      // Verify state machine was called correctly
      expect(transitionService.transitionGiftState).toHaveBeenCalledTimes(2)
      expect(transitionService.transitionGiftState).toHaveBeenCalledWith(
        'booking-1',
        GiftState.SENT,
        'cron',
        expect.objectContaining({
          customReason: 'Scheduled gift notification sent',
        })
      )
    })

    it('should handle transition failures gracefully', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockPendingGifts)
      vi.mocked(transitionService.transitionGiftState)
        .mockResolvedValueOnce({
          success: true,
          fromState: GiftState.PENDING,
          toState: GiftState.SENT,
          bookingId: 'booking-1',
          transitionId: 'transition-1',
        })
        .mockResolvedValueOnce({
          success: false,
          fromState: GiftState.PENDING,
          toState: GiftState.SENT,
          bookingId: 'booking-2',
          transitionId: '',
          error: 'Email delivery failed',
        })

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(2)
      expect(data.sent).toBe(1)
      expect(data.failed).toBe(1)

      expect(data.results[0].result).toBe('sent')
      expect(data.results[1].result).toBe('failed')
      expect(data.results[1].error).toBe('Email delivery failed')
    })

    it('should handle exceptions during transition', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([mockPendingGifts[0]])
      vi.mocked(transitionService.transitionGiftState).mockRejectedValue(
        new Error('Database error')
      )

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(1)
      expect(data.sent).toBe(0)
      expect(data.failed).toBe(1)
      expect(data.results[0].error).toBe('Database error')
    })

    it('should query database with correct filters for pending gifts', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      await GET(request)

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isGift: true,
            giftStatus: 'PENDING',
            giftDeliveryDate: {
              lte: expect.any(Date),
            },
          },
          orderBy: {
            giftDeliveryDate: 'asc',
          },
          take: 100,
        })
      )
    })
  })

  describe('Response format', () => {
    it('should return processedAt timestamp', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(data.processedAt).toBeDefined()
      expect(new Date(data.processedAt)).toBeInstanceOf(Date)
    })

    it('should return execution time', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(data.executionTimeMs).toBeDefined()
      expect(typeof data.executionTimeMs).toBe('number')
    })

    it('should include results array with details', async () => {
      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockPendingGifts)
      vi.mocked(transitionService.transitionGiftState).mockResolvedValue({
        success: true,
        fromState: GiftState.PENDING,
        toState: GiftState.SENT,
        bookingId: 'booking-1',
        transitionId: 'transition-1',
      })

      const request = createRequest('Bearer test-cron-secret')
      const response = await GET(request)
      const data = await response.json()

      expect(data.results).toHaveLength(2)
      expect(data.results[0]).toEqual(
        expect.objectContaining({
          bookingId: 'booking-1',
          bookingReference: 'PBP-2026-000001',
          recipientName: 'Jane Doe',
          recipientEmail: 'jane@example.com',
          result: 'sent',
        })
      )
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
      expect(data.error).toBe('Internal server error')
      expect(data.message).toBe('Database connection failed')
    })
  })
})
