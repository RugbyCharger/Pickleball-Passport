/**
 * Integration tests for charge-installments cron route
 * E4-S6 Phase 10
 *
 * Tests the complete cron job flow including:
 * - Authorization with CRON_SECRET
 * - Payment record filtering (due dates, retry eligibility)
 * - Batch processing with rate limiting
 * - Result aggregation and reporting
 * - Error handling and timeout scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { GET } from '../charge-installments/route'
import { NextRequest } from 'next/server'
import * as chargeInstallmentModule from '@/lib/payments/charge-installment'
import * as retryCalculatorModule from '@/lib/payments/retry-calculator'

// Mock modules
vi.mock('@/lib/payments/charge-installment')
vi.mock('@/lib/payments/retry-calculator')
vi.mock('@/lib/db', () => ({
  prisma: {
    paymentRecord: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

describe('GET /api/cron/charge-installments', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = { ...process.env }
    process.env.CRON_SECRET = 'test-cron-secret-123'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // Helper to create mock request
  const createMockRequest = (authorization?: string) => {
    const headers = new Headers()
    if (authorization) {
      headers.set('authorization', authorization)
    }
    return new NextRequest('https://example.com/api/cron/charge-installments', {
      headers,
    })
  }

  // Helper to create mock payment record
  const createMockPaymentRecord = (overrides?: any) => ({
    id: 'pay_test123',
    bookingId: 'bk_test123',
    amountCents: 50000,
    dueDate: new Date('2026-01-15'),
    status: 'PENDING',
    installmentNumber: 2,
    retryCount: 0,
    lastAttemptAt: null,
    booking: {
      id: 'bk_test123',
      bookingReference: 'BK-TEST-001',
      user: {
        id: 'user_test123',
        firstName: 'John',
        lastName: 'Doe',
      },
      trip: {
        id: 'trip_test123',
        name: 'Costa Rica',
      },
      package: {
        id: 'pkg_test123',
        name: 'Deluxe',
      },
    },
    ...overrides,
  })

  describe('Authorization', () => {
    it('should return 500 if CRON_SECRET not configured', async () => {
      // Arrange
      delete process.env.CRON_SECRET
      const request = createMockRequest('Bearer any-token')

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Cron job not configured')
    })

    it('should return 401 if authorization header missing', async () => {
      // Arrange
      const request = createMockRequest()

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 401 if authorization token incorrect', async () => {
      // Arrange
      const request = createMockRequest('Bearer wrong-token')

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should proceed if authorization token correct', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(200)
      expect(prisma.paymentRecord.findMany).toHaveBeenCalled()
    })
  })

  describe('Payment record filtering', () => {
    it('should find payments due today or overdue with retryCount=0', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      await GET(request)

      // Assert
      expect(prisma.paymentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
            OR: expect.arrayContaining([
              // New payments due today or overdue
              expect.objectContaining({
                dueDate: expect.objectContaining({ lte: expect.any(Date) }),
                retryCount: 0,
              }),
              // Failed payments ready for retry
              expect.objectContaining({
                retryCount: expect.objectContaining({ gte: 1, lt: 4 }),
                lastAttemptAt: expect.objectContaining({ not: null }),
              }),
            ]),
          }),
        })
      )
    })

    it('should include booking, user, trip, and package data', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      await GET(request)

      // Assert
      expect(prisma.paymentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            booking: {
              include: {
                user: true,
                trip: true,
                package: true,
              },
            },
          },
        })
      )
    })

    it('should order by dueDate ascending', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      await GET(request)

      // Assert
      expect(prisma.paymentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: 'asc' },
        })
      )
    })

    it('should limit to MAX_PAYMENTS_PER_RUN (100)', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      await GET(request)

      // Assert
      expect(prisma.paymentRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      )
    })
  })

  describe('Retry eligibility filtering', () => {
    it('should process new payments (retryCount=0)', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [createMockPaymentRecord({ retryCount: 0 })]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: true,
        paymentRecordId: 'pay_test123',
        shouldRetry: false,
        isPermanentFailure: false,
      })

      // Act
      await GET(request)

      // Assert
      expect(chargeInstallmentModule.chargeInstallment).toHaveBeenCalledWith({
        paymentRecordId: 'pay_test123',
      })
    })

    it('should skip payments not eligible for retry', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [
        createMockPaymentRecord({
          retryCount: 1,
          lastAttemptAt: new Date('2026-01-14'), // Too soon
        }),
      ]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(false)

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.totalFound).toBe(1)
      expect(data.totalEligible).toBe(0) // Filtered out
      expect(chargeInstallmentModule.chargeInstallment).not.toHaveBeenCalled()
    })

    it('should process payments eligible for retry', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [
        createMockPaymentRecord({
          retryCount: 1,
          lastAttemptAt: new Date('2026-01-10'), // Eligible
        }),
      ]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: true,
        paymentRecordId: 'pay_test123',
        shouldRetry: false,
        isPermanentFailure: false,
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.totalEligible).toBe(1)
      expect(chargeInstallmentModule.chargeInstallment).toHaveBeenCalledWith({
        paymentRecordId: 'pay_test123',
      })
    })
  })

  describe('Payment processing', () => {
    it('should process successful payment and track result', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [createMockPaymentRecord()]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: true,
        paymentRecordId: 'pay_test123',
        stripePaymentIntentId: 'pi_success123',
        shouldRetry: false,
        isPermanentFailure: false,
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.successful).toBe(1)
      expect(data.failedRetry).toBe(0)
      expect(data.failedPermanent).toBe(0)
      expect(data.results[0]).toMatchObject({
        paymentRecordId: 'pay_test123',
        result: 'success',
        stripePaymentIntentId: 'pi_success123',
      })
    })

    it('should handle failed payment with retry', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [createMockPaymentRecord()]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: false,
        paymentRecordId: 'pay_test123',
        errorCode: 'card_declined',
        shouldRetry: true,
        isPermanentFailure: false,
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.successful).toBe(0)
      expect(data.failedRetry).toBe(1)
      expect(data.results[0]).toMatchObject({
        result: 'failed_retry',
        errorCode: 'card_declined',
      })
    })

    it('should handle permanent failure', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [createMockPaymentRecord()]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: false,
        paymentRecordId: 'pay_test123',
        errorCode: 'card_not_supported',
        shouldRetry: false,
        isPermanentFailure: true,
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.successful).toBe(0)
      expect(data.failedPermanent).toBe(1)
      expect(data.results[0]).toMatchObject({
        result: 'failed_permanent',
        errorCode: 'card_not_supported',
      })
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = [createMockPaymentRecord()]
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockRejectedValue(
        new Error('Database connection lost')
      )

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.errors).toBe(1)
      expect(data.results[0]).toMatchObject({
        result: 'error',
        errorCode: 'unexpected_error',
      })
    })
  })

  describe('Batch processing', () => {
    it('should process multiple payments in parallel batches', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      const mockPayments = Array.from({ length: 15 }, (_, i) =>
        createMockPaymentRecord({ id: `pay_test${i}` })
      )
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue(mockPayments as any)
      vi.mocked(retryCalculatorModule.isRetryEligible).mockReturnValue(true)
      vi.mocked(chargeInstallmentModule.chargeInstallment).mockResolvedValue({
        success: true,
        paymentRecordId: 'pay_test',
        shouldRetry: false,
        isPermanentFailure: false,
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.totalEligible).toBe(15)
      expect(data.successful).toBe(15)
      // Should have been called 15 times (batch size = 10, so 2 batches)
      expect(chargeInstallmentModule.chargeInstallment).toHaveBeenCalledTimes(15)
    })
  })

  describe('Response format', () => {
    it('should return correct summary structure', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        processedAt: expect.any(String),
        totalFound: expect.any(Number),
        totalEligible: expect.any(Number),
        successful: expect.any(Number),
        failedRetry: expect.any(Number),
        failedPermanent: expect.any(Number),
        errors: expect.any(Number),
        executionTimeMs: expect.any(Number),
        results: expect.any(Array),
      })
    })

    it('should include execution time', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockResolvedValue([])

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data.executionTimeMs).toBeGreaterThanOrEqual(0)
      expect(data.executionTimeMs).toBeLessThan(10000) // Should finish in < 10s
    })
  })

  describe('Error handling', () => {
    it('should return 500 if database query fails', async () => {
      // Arrange
      const request = createMockRequest('Bearer test-cron-secret-123')
      vi.mocked(prisma.paymentRecord.findMany).mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.error).toBe('Cron job failed')
      expect(data.message).toBe('Database connection failed')
    })
  })
})
