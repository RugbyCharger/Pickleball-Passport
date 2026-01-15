/**
 * Integration tests for chargeInstallment function
 * E4-S6 Phase 10
 *
 * Tests the complete payment charging flow including:
 * - Successful payment processing
 * - Stripe error handling (transient/permanent)
 * - Retry logic and attempt tracking
 * - Email notifications (customer reminders, admin alerts)
 * - Edge cases (cancelled bookings, missing customer)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { chargeInstallment } from '../charge-installment'
import Stripe from 'stripe'
import * as stripeModule from '@/lib/stripe/get-stripe'
import * as emailModule from '@/lib/email/send-email'

// Mock modules
vi.mock('@/lib/stripe/get-stripe')
vi.mock('@/lib/email/send-email')
vi.mock('@/lib/db', () => ({
  prisma: {
    paymentRecord: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

describe('chargeInstallment', () => {
  let mockStripe: any
  let mockPaymentIntents: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Stripe mock
    mockPaymentIntents = {
      create: vi.fn(),
    }

    mockStripe = {
      paymentIntents: mockPaymentIntents,
    }

    vi.mocked(stripeModule.getStripe).mockReturnValue(mockStripe)
    vi.mocked(emailModule.sendEmail).mockResolvedValue(undefined)
  })

  // Helper to create mock payment record with booking
  const createMockPaymentRecord = (overrides?: any) => ({
    id: 'pay_test123',
    bookingId: 'bk_test123',
    amountCents: 50000,
    dueDate: new Date('2026-01-15'),
    status: 'PENDING',
    installmentNumber: 2,
    retryCount: 0,
    lastAttemptAt: null,
    failureReason: null,
    stripePaymentIntentId: null,
    booking: {
      id: 'bk_test123',
      bookingReference: 'BK-TEST-001',
      status: 'CONFIRMED',
      paymentPlan: 'INSTALLMENT_4',
      totalPriceCents: 200000,
      stripeCustomerId: 'cus_test123',
      user: {
        id: 'user_test123',
        clerkId: 'clerk_test123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      },
      trip: {
        id: 'trip_test123',
        name: 'Costa Rica Adventure',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-07'),
      },
      package: {
        id: 'pkg_test123',
        name: 'Deluxe Package',
      },
    },
    ...overrides,
  })

  describe('Successful payment processing', () => {
    it('should successfully charge an installment payment', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const mockPaymentIntent = {
        id: 'pi_test123',
        status: 'succeeded',
        amount: 50000,
      }
      mockPaymentIntents.create.mockResolvedValue(mockPaymentIntent)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(true)
      expect(result.stripePaymentIntentId).toBe('pi_test123')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(false)

      // Verify Stripe API called correctly
      expect(mockPaymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000,
          currency: 'usd',
          customer: 'cus_test123',
          confirm: true,
          off_session: true,
          description: expect.stringContaining('BK-TEST-001'),
          metadata: expect.objectContaining({
            bookingReference: 'BK-TEST-001',
            installmentNumber: '2',
            installmentOf: '4',
          }),
        }),
        expect.objectContaining({
          idempotencyKey: expect.stringContaining('pay_test123'),
        })
      )

      // Verify payment record updated
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: {
          stripePaymentIntentId: 'pi_test123',
          lastAttemptAt: expect.any(Date),
        },
      })
    })

    it('should use idempotency key with retry count and due date', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({
        retryCount: 2,
        dueDate: new Date('2026-02-15'),
      })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      mockPaymentIntents.create.mockResolvedValue({ id: 'pi_idem123' })

      // Act
      await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(mockPaymentIntents.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          idempotencyKey: 'installment-pay_test123-2-2026-02-15',
        })
      )
    })
  })

  describe('Error handling - Payment record validation', () => {
    it('should return permanent failure if payment record not found', async () => {
      // Arrange
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(null)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'nonexistent-id',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('payment_record_not_found')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(true)
      expect(mockPaymentIntents.create).not.toHaveBeenCalled()
    })

    it('should skip payment for cancelled booking', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({
        booking: {
          ...createMockPaymentRecord().booking,
          status: 'CANCELLED',
        },
      })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('booking_cancelled')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(true)
      expect(mockPaymentIntents.create).not.toHaveBeenCalled()
    })

    it('should fail permanently if no Stripe customer ID exists', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({
        booking: {
          ...createMockPaymentRecord().booking,
          stripeCustomerId: null,
        },
      })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('customer_not_found')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(true)
      expect(mockPaymentIntents.create).not.toHaveBeenCalled()

      // Verify admin alert sent
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('admin'),
          subject: expect.stringContaining('Failed'),
        })
      )
    })
  })

  describe('Error handling - Stripe transient errors', () => {
    it('should mark payment for retry on card_declined error', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Your card was declined',
        type: 'card_error',
        code: 'card_declined',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('card_declined')
      expect(result.shouldRetry).toBe(true)
      expect(result.isPermanentFailure).toBe(false)

      // Verify payment record updated with retry count
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: {
          retryCount: 1,
          lastAttemptAt: expect.any(Date),
          failureReason: 'card_declined',
        },
      })

      // Verify customer reminder email sent
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Payment'),
        })
      )
    })

    it('should mark payment as FAILED after 4 attempts', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({
        retryCount: 3, // Already tried 3 times
        lastAttemptAt: new Date('2026-01-12'),
      })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Insufficient funds',
        type: 'card_error',
        code: 'insufficient_funds',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act: 4th attempt
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('insufficient_funds')
      expect(result.shouldRetry).toBe(true) // Error is transient
      expect(result.isPermanentFailure).toBe(false)

      // Verify payment marked as FAILED (max retries reached)
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: {
          retryCount: 4,
          lastAttemptAt: expect.any(Date),
          failureReason: 'insufficient_funds',
          status: 'FAILED', // Max retries reached
        },
      })

      // Verify admin alert sent (max retries)
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('admin'),
          subject: expect.stringContaining('Failed'),
        })
      )

      // Customer reminder NOT sent (last attempt)
      const customerEmails = vi
        .mocked(emailModule.sendEmail)
        .mock.calls.filter((call) => call[0].to === 'test@example.com')
      expect(customerEmails.length).toBe(0)
    })

    it('should handle insufficient_funds error with retry', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({ retryCount: 1 })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Insufficient funds',
        type: 'card_error',
        code: 'insufficient_funds',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act
      const result = await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('insufficient_funds')
      expect(result.shouldRetry).toBe(true)
      expect(result.isPermanentFailure).toBe(false)

      // Still PENDING (not at max retries yet)
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: expect.not.objectContaining({ status: 'FAILED' }),
      })
    })
  })

  describe('Error handling - Stripe permanent errors', () => {
    it('should mark payment as FAILED on card_not_supported error', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Card not supported',
        type: 'card_error',
        code: 'card_not_supported',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('card_not_supported')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(true)

      // Verify payment marked as FAILED immediately
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: {
          retryCount: 1,
          lastAttemptAt: expect.any(Date),
          failureReason: 'card_not_supported',
          status: 'FAILED', // Permanent failure
        },
      })

      // Verify admin alert sent
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining('admin'),
          subject: expect.stringContaining('Failed'),
        })
      )

      // No customer reminder sent (permanent error)
      const customerEmails = vi
        .mocked(emailModule.sendEmail)
        .mock.calls.filter((call) => call[0].to === 'test@example.com')
      expect(customerEmails.length).toBe(0)
    })

    it('should handle fraudulent error as neither transient nor permanent', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Card was declined as fraudulent',
        type: 'card_error',
        code: 'fraudulent',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act
      const result = await chargeInstallment({
        paymentRecordId: 'pay_test123',
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('fraudulent')
      // 'fraudulent' is not in transient OR permanent lists
      expect(result.shouldRetry).toBe(false) // Not transient
      expect(result.isPermanentFailure).toBe(false) // Not permanent

      // Verify payment record updated but NOT marked as FAILED
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: {
          retryCount: 1,
          lastAttemptAt: expect.any(Date),
          failureReason: 'fraudulent',
          // No status: 'FAILED' - neither permanent nor max retries
        },
      })
    })

    it('should handle expired_card as transient error (retryable)', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      const stripeError = new Stripe.errors.StripeCardError({
        message: 'Card has expired',
        type: 'card_error',
        code: 'expired_card',
      })
      mockPaymentIntents.create.mockRejectedValue(stripeError)

      // Act
      const result = await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('expired_card')
      // expired_card is in the transient errors list
      expect(result.shouldRetry).toBe(true)
      expect(result.isPermanentFailure).toBe(false)

      // Customer reminder should be sent
      expect(emailModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
        })
      )
    })
  })

  describe('Metadata and tracking', () => {
    it('should include correct metadata in Stripe payment intent', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord({
        installmentNumber: 3,
        amountCents: 15000,
      })
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      mockPaymentIntents.create.mockResolvedValue({ id: 'pi_meta123' })

      // Act
      await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(mockPaymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 15000,
          metadata: {
            bookingId: 'bk_test123',
            bookingReference: 'BK-TEST-001',
            paymentRecordId: 'pay_test123',
            installmentNumber: '3',
            installmentOf: '4',
          },
        }),
        expect.anything()
      )
    })

    it('should update lastAttemptAt on each attempt', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)
      vi.mocked(prisma.paymentRecord.update).mockResolvedValue(mockPaymentRecord as any)

      mockPaymentIntents.create.mockResolvedValue({ id: 'pi_test123' })

      // Act
      await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(prisma.paymentRecord.update).toHaveBeenCalledWith({
        where: { id: 'pay_test123' },
        data: expect.objectContaining({
          lastAttemptAt: expect.any(Date),
        }),
      })
    })
  })

  describe('Unknown errors', () => {
    it('should handle unknown errors gracefully', async () => {
      // Arrange
      const mockPaymentRecord = createMockPaymentRecord()
      vi.mocked(prisma.paymentRecord.findUnique).mockResolvedValue(mockPaymentRecord as any)

      const unknownError = new Error('Network timeout')
      mockPaymentIntents.create.mockRejectedValue(unknownError)

      // Act
      const result = await chargeInstallment({ paymentRecordId: 'pay_test123' })

      // Assert
      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('unknown_error')
      expect(result.errorMessage).toBe('Network timeout')
      expect(result.shouldRetry).toBe(false)
      expect(result.isPermanentFailure).toBe(false)

      // Should NOT update payment record for unknown errors
      expect(prisma.paymentRecord.update).not.toHaveBeenCalled()
    })
  })
})
