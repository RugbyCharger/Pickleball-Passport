/**
 * Unit tests for admin-alerts service
 * Story 11-8: Admin Email Alerts
 *
 * Tests the admin alert functions including:
 * - Configuration checking
 * - Threshold retrieval
 * - Alert sending with non-blocking error handling
 * - Template integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  isAdminAlertsConfigured,
  getHighValueThreshold,
  sendAdminAlert,
  sendPaymentFailureAlert,
  sendBookingCancellationAlert,
  sendHighValueBookingAlert,
  sendSystemErrorAlert,
} from '../admin-alerts'
import * as sendgridModule from '../sendgrid'

// Mock modules
vi.mock('../sendgrid')

describe('admin-alerts', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables before each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('isAdminAlertsConfigured', () => {
    it('should return true when ADMIN_ALERT_EMAIL is set', () => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      expect(isAdminAlertsConfigured()).toBe(true)
    })

    it('should return false when ADMIN_ALERT_EMAIL is not set', () => {
      delete process.env.ADMIN_ALERT_EMAIL
      expect(isAdminAlertsConfigured()).toBe(false)
    })

    it('should return false when ADMIN_ALERT_EMAIL is empty string', () => {
      process.env.ADMIN_ALERT_EMAIL = ''
      expect(isAdminAlertsConfigured()).toBe(false)
    })
  })

  describe('getHighValueThreshold', () => {
    it('should return default threshold when env var not set', () => {
      delete process.env.HIGH_VALUE_BOOKING_THRESHOLD
      expect(getHighValueThreshold()).toBe(500000) // $5,000 in cents
    })

    it('should return custom threshold when env var is set', () => {
      process.env.HIGH_VALUE_BOOKING_THRESHOLD = '1000000'
      expect(getHighValueThreshold()).toBe(1000000) // $10,000 in cents
    })

    it('should return default threshold when env var is invalid', () => {
      process.env.HIGH_VALUE_BOOKING_THRESHOLD = 'invalid'
      expect(getHighValueThreshold()).toBe(500000) // Falls back to default
    })

    it('should handle zero threshold', () => {
      process.env.HIGH_VALUE_BOOKING_THRESHOLD = '0'
      expect(getHighValueThreshold()).toBe(0)
    })
  })

  describe('sendAdminAlert', () => {
    beforeEach(() => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      vi.mocked(sendgridModule.sendEmail).mockResolvedValue(undefined)
    })

    it('should send alert when configured', async () => {
      const options = {
        subject: 'Test Alert',
        html: '<p>Test content</p>',
        text: 'Test content',
      }

      await sendAdminAlert(options)

      expect(sendgridModule.sendEmail).toHaveBeenCalledWith({
        to: ['admin@test.com'],
        subject: 'Test Alert',
        html: '<p>Test content</p>',
        text: 'Test content',
      })
    })

    it('should include CC emails when configured', async () => {
      process.env.ADMIN_ALERT_CC_EMAILS = 'owner@test.com,ops@test.com'

      const options = {
        subject: 'Test Alert',
        html: '<p>Test content</p>',
      }

      await sendAdminAlert(options)

      expect(sendgridModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['admin@test.com', 'owner@test.com', 'ops@test.com'],
        })
      )
    })

    it('should not send alert when not configured', async () => {
      delete process.env.ADMIN_ALERT_EMAIL

      const options = {
        subject: 'Test Alert',
        html: '<p>Test content</p>',
      }

      await sendAdminAlert(options)

      expect(sendgridModule.sendEmail).not.toHaveBeenCalled()
    })

    it('should handle sendEmail errors gracefully (non-blocking)', async () => {
      vi.mocked(sendgridModule.sendEmail).mockRejectedValue(
        new Error('SendGrid API error')
      )

      const options = {
        subject: 'Test Alert',
        html: '<p>Test content</p>',
      }

      // Should not throw
      await expect(sendAdminAlert(options)).resolves.toBeUndefined()
    })

    it('should trim CC emails and handle whitespace', async () => {
      process.env.ADMIN_ALERT_CC_EMAILS = ' owner@test.com , ops@test.com '

      const options = {
        subject: 'Test Alert',
        html: '<p>Test content</p>',
      }

      await sendAdminAlert(options)

      expect(sendgridModule.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['admin@test.com', 'owner@test.com', 'ops@test.com'],
        })
      )
    })
  })

  describe('sendPaymentFailureAlert', () => {
    beforeEach(() => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      vi.mocked(sendgridModule.sendEmail).mockResolvedValue(undefined)
    })

    it('should send payment failure alert with correct data', async () => {
      const data = {
        customerName: 'John Doe',
        customerEmail: 'john@test.com',
        customerPhone: '+1234567890',
        bookingReference: 'BK-TEST-001',
        bookingId: 'bk_123',
        packageName: 'Deluxe Package',
        tripName: 'Costa Rica Adventure',
        tripStartDate: '2026-06-01',
        installmentNumber: 2,
        installmentAmount: 50000,
        originalDueDate: '2026-02-01',
        attempts: [
          { attemptNumber: 1, attemptDate: '2026-01-15', errorCode: 'insufficient_funds', errorMessage: 'Insufficient funds' },
          { attemptNumber: 2, attemptDate: '2026-01-16', errorCode: 'card_declined', errorMessage: 'Card declined' },
          { attemptNumber: 3, attemptDate: '2026-01-17', errorCode: 'card_declined', errorMessage: 'Card declined' },
          { attemptNumber: 4, attemptDate: '2026-01-18', errorCode: 'card_declined', errorMessage: 'Card declined' },
        ],
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_123',
        customerDashboardUrl: 'https://app.test.com/dashboard/bookings/bk_123',
      }

      await sendPaymentFailureAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(sendgridModule.sendEmail).mock.calls[0][0]
      expect(callArgs.to).toEqual(['admin@test.com'])
      expect(callArgs.subject).toContain('Payment Failed')
      expect(callArgs.subject).toContain('BK-TEST-001')
      expect(callArgs.html).toBeTruthy()
      expect(callArgs.text).toBeTruthy()
    })

    it('should not throw when SendGrid fails', async () => {
      vi.mocked(sendgridModule.sendEmail).mockRejectedValue(
        new Error('SendGrid error')
      )

      const data = {
        customerName: 'John Doe',
        customerEmail: 'john@test.com',
        bookingReference: 'BK-TEST-001',
        bookingId: 'bk_123',
        packageName: 'Deluxe Package',
        tripName: 'Costa Rica Adventure',
        tripStartDate: '2026-06-01',
        installmentNumber: 2,
        installmentAmount: 50000,
        originalDueDate: '2026-02-01',
        attempts: [
          { attemptNumber: 1, attemptDate: '2026-01-15', errorCode: 'card_declined', errorMessage: 'Card declined' },
        ],
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_123',
        customerDashboardUrl: 'https://app.test.com/dashboard/bookings/bk_123',
      }

      await expect(sendPaymentFailureAlert(data)).resolves.toBeUndefined()
    })
  })

  describe('sendBookingCancellationAlert', () => {
    beforeEach(() => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      vi.mocked(sendgridModule.sendEmail).mockResolvedValue(undefined)
    })

    it('should send cancellation alert with correct data', async () => {
      const data = {
        customerName: 'Jane Smith',
        customerEmail: 'jane@test.com',
        bookingReference: 'BK-TEST-002',
        bookingId: 'bk_456',
        cancellationReason: 'Travel plans changed',
        packageName: 'Premium Package',
        tripName: 'Thailand Retreat',
        tripStartDate: '2026-07-15',
        totalBookingValue: 300000,
        refundAmount: 250000,
        refundStatus: 'pending',
        daysUntilTrip: 45,
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_456',
      }

      await sendBookingCancellationAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(sendgridModule.sendEmail).mock.calls[0][0]
      expect(callArgs.subject).toContain('Booking Cancelled')
      expect(callArgs.subject).toContain('BK-TEST-002')
    })

    it('should not throw on error', async () => {
      vi.mocked(sendgridModule.sendEmail).mockRejectedValue(
        new Error('Network error')
      )

      const data = {
        customerName: 'Jane Smith',
        customerEmail: 'jane@test.com',
        bookingReference: 'BK-TEST-002',
        bookingId: 'bk_456',
        packageName: 'Premium Package',
        tripName: 'Thailand Retreat',
        tripStartDate: '2026-07-15',
        totalBookingValue: 300000,
        refundAmount: 250000,
        refundStatus: 'pending',
        daysUntilTrip: 45,
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_456',
      }

      await expect(sendBookingCancellationAlert(data)).resolves.toBeUndefined()
    })
  })

  describe('sendHighValueBookingAlert', () => {
    beforeEach(() => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      vi.mocked(sendgridModule.sendEmail).mockResolvedValue(undefined)
    })

    it('should send high-value booking alert with correct data', async () => {
      const data = {
        customerName: 'Robert Johnson',
        customerEmail: 'robert@test.com',
        customerLocation: 'New York, USA',
        bookingReference: 'BK-TEST-003',
        bookingId: 'bk_789',
        packageName: 'VIP Package',
        tripName: 'Bali Experience',
        tripStartDate: '2026-08-01',
        addOns: ['Private Villa', 'Golf Package', 'Spa Day'],
        totalBookingValue: 750000,
        paymentMethod: 'full_payment',
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_789',
      }

      await sendHighValueBookingAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(sendgridModule.sendEmail).mock.calls[0][0]
      expect(callArgs.subject).toContain('High-Value Booking')
      expect(callArgs.subject).toContain('$7,500')
    })

    it('should handle installment payment method', async () => {
      const data = {
        customerName: 'Sarah Williams',
        customerEmail: 'sarah@test.com',
        bookingReference: 'BK-TEST-004',
        bookingId: 'bk_890',
        packageName: 'Luxury Package',
        tripName: 'Mexico Adventure',
        tripStartDate: '2026-09-01',
        addOns: ['Surfing Lessons'],
        totalBookingValue: 600000,
        paymentMethod: 'installments' as const,
        installmentPlan: '4 monthly installments',
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_890',
      }

      await sendHighValueBookingAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
    })

    it('should not throw on error', async () => {
      vi.mocked(sendgridModule.sendEmail).mockRejectedValue(
        new Error('SendGrid timeout')
      )

      const data = {
        customerName: 'Robert Johnson',
        customerEmail: 'robert@test.com',
        bookingReference: 'BK-TEST-003',
        bookingId: 'bk_789',
        packageName: 'VIP Package',
        tripName: 'Bali Experience',
        tripStartDate: '2026-08-01',
        addOns: ['Private Villa'],
        totalBookingValue: 750000,
        paymentMethod: 'full_payment' as const,
        bookingAdminUrl: 'https://app.test.com/admin/bookings/bk_789',
      }

      await expect(sendHighValueBookingAlert(data)).resolves.toBeUndefined()
    })
  })

  describe('sendSystemErrorAlert', () => {
    beforeEach(() => {
      process.env.ADMIN_ALERT_EMAIL = 'admin@test.com'
      vi.mocked(sendgridModule.sendEmail).mockResolvedValue(undefined)
    })

    it('should send system error alert with correct data', async () => {
      const data = {
        errorType: 'Stripe API Error',
        severity: 'high' as const,
        errorMessage: 'Failed to create payment intent',
        stackTrace: 'Error: Failed to create payment intent\n  at stripe.ts:42',
        context: {
          bookingId: 'bk_123',
          userId: 'user_456',
          amount: 50000,
        },
        environment: 'production',
      }

      await sendSystemErrorAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(sendgridModule.sendEmail).mock.calls[0][0]
      expect(callArgs.subject).toContain('Error')
      expect(callArgs.subject).toContain('HIGH')
    })

    it('should handle different severity levels', async () => {
      const data = {
        errorType: 'Email Delivery Failure',
        severity: 'medium' as const,
        errorMessage: 'SendGrid API returned 429',
        environment: 'production',
      }

      await sendSystemErrorAlert(data)

      expect(sendgridModule.sendEmail).toHaveBeenCalledTimes(1)
    })

    it('should not throw on error', async () => {
      vi.mocked(sendgridModule.sendEmail).mockRejectedValue(
        new Error('SendGrid down')
      )

      const data = {
        errorType: 'Database Error',
        severity: 'critical' as const,
        errorMessage: 'Connection pool exhausted',
        environment: 'production',
      }

      await expect(sendSystemErrorAlert(data)).resolves.toBeUndefined()
    })
  })
})
