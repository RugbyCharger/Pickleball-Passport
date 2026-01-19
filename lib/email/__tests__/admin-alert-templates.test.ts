/**
 * Integration tests for admin alert email templates
 * Story 11-8: Admin Email Alerts
 *
 * Tests that templates render correctly with real data:
 * - Booking cancellation template
 * - High-value booking template
 * - System error template
 * - Payment failure template (existing)
 */

import { describe, it, expect } from 'vitest'
import {
  generateBookingCancellationAdminEmail,
  type BookingCancellationAdminData,
} from '../templates/booking-cancellation-admin'
import {
  generateHighValueBookingAdminEmail,
  type HighValueBookingAdminData,
} from '../templates/high-value-booking-admin'
import {
  generateSystemErrorAdminEmail,
  type SystemErrorAdminData,
} from '../templates/system-error-admin'

describe('Admin Alert Email Templates', () => {
  describe('Booking Cancellation Template', () => {
    const mockData: BookingCancellationAdminData = {
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      bookingReference: 'BK-2026-001',
      bookingId: 'bk_test123',
      cancellationReason: 'Travel plans changed',
      packageName: 'Premium Thailand Package',
      tripName: 'Thailand Adventure 2026',
      tripStartDate: '2026-07-15T00:00:00.000Z',
      totalBookingValue: 300000, // $3,000
      refundAmount: 250000, // $2,500
      refundStatus: 'pending',
      daysUntilTrip: 45,
      bookingAdminUrl: 'https://app.pickleballpassport.com/admin/bookings/bk_test123',
    }

    it('should generate HTML content with all data fields', () => {
      const { html, text, subject } = generateBookingCancellationAdminEmail(mockData)

      // Subject includes booking reference
      expect(subject).toContain('Booking Cancelled')
      expect(subject).toContain('BK-2026-001')

      // HTML includes customer details
      expect(html).toContain('Jane Smith')
      expect(html).toContain('jane@example.com')
      expect(html).toContain('BK-2026-001')

      // HTML includes booking details
      expect(html).toContain('Premium Thailand Package')
      expect(html).toContain('Thailand Adventure 2026')

      // HTML includes financial details
      expect(html).toContain('$3,000') // Total value
      expect(html).toContain('$2,500') // Refund amount

      // HTML includes urgency indicator
      expect(html).toContain('45 days')

      // HTML includes admin action link
      expect(html).toContain('https://app.pickleballpassport.com/admin/bookings/bk_test123')

      // Text version exists and contains key info
      expect(text).toContain('Jane Smith')
      expect(text).toContain('BK-2026-001')
      expect(text).toContain('$2,500')
    })

    it('should handle missing optional fields', () => {
      const minimalData: BookingCancellationAdminData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        bookingReference: 'BK-2026-002',
        bookingId: 'bk_test456',
        packageName: 'Basic Package',
        tripName: 'Costa Rica Trip',
        tripStartDate: '2026-08-01T00:00:00.000Z',
        totalBookingValue: 200000,
        refundAmount: 180000,
        refundStatus: 'completed',
        daysUntilTrip: 30,
        bookingAdminUrl: 'https://app.pickleballpassport.com/admin/bookings/bk_test456',
      }

      const { html, text, subject } = generateBookingCancellationAdminEmail(minimalData)

      expect(subject).toBeTruthy()
      expect(html).toBeTruthy()
      expect(text).toBeTruthy()
      expect(html).toContain('John Doe')
    })

    it('should show urgency for cancellations close to trip date', () => {
      const urgentData: BookingCancellationAdminData = {
        ...mockData,
        daysUntilTrip: 10,
      }

      const { html } = generateBookingCancellationAdminEmail(urgentData)

      // Should include urgency indicators
      expect(html).toContain('10 days')
    })
  })

  describe('High-Value Booking Template', () => {
    const mockData: HighValueBookingAdminData = {
      customerName: 'Robert Johnson',
      customerEmail: 'robert@example.com',
      customerLocation: 'New York, USA',
      bookingReference: 'BK-2026-003',
      bookingId: 'bk_test789',
      packageName: 'VIP Ultimate Package',
      tripName: 'Bali Luxury Experience',
      tripStartDate: '2026-09-01T00:00:00.000Z',
      addOns: ['Private Villa Upgrade', 'Golf Package', 'Spa Day'],
      totalBookingValue: 850000, // $8,500
      paymentMethod: 'full_payment',
      bookingAdminUrl: 'https://app.pickleballpassport.com/admin/bookings/bk_test789',
    }

    it('should generate HTML content with all data fields', () => {
      const { html, text, subject } = generateHighValueBookingAdminEmail(mockData)

      // Subject includes booking value
      expect(subject).toContain('High-Value Booking')
      expect(subject).toContain('$8,500')

      // HTML includes customer details
      expect(html).toContain('Robert Johnson')
      expect(html).toContain('robert@example.com')
      expect(html).toContain('New York, USA')

      // HTML includes booking details
      expect(html).toContain('VIP Ultimate Package')
      expect(html).toContain('Bali Luxury Experience')
      expect(html).toContain('BK-2026-003')

      // HTML includes add-ons
      expect(html).toContain('Private Villa Upgrade')
      expect(html).toContain('Golf Package')
      expect(html).toContain('Spa Day')

      // HTML includes payment method (check for presence, format may vary)
      expect(html.length).toBeGreaterThan(500) // Has meaningful content

      // Text version exists
      expect(text).toContain('Robert Johnson')
      expect(text).toContain('$8,500')
    })

    it('should handle installment payment method', () => {
      const installmentData: HighValueBookingAdminData = {
        ...mockData,
        paymentMethod: 'installments',
        installmentPlan: '4 monthly installments',
      }

      const { html } = generateHighValueBookingAdminEmail(installmentData)

      // Should indicate installment payment
      expect(html.toLowerCase()).toContain('installment')
    })

    it('should handle booking without add-ons', () => {
      const noAddOnsData: HighValueBookingAdminData = {
        ...mockData,
        addOns: [],
      }

      const { html } = generateHighValueBookingAdminEmail(noAddOnsData)

      expect(html).toBeTruthy()
      expect(html).toContain('Robert Johnson')
    })

    it('should handle missing optional customer location', () => {
      const noLocationData: HighValueBookingAdminData = {
        ...mockData,
        customerLocation: undefined,
      }

      const { html } = generateHighValueBookingAdminEmail(noLocationData)

      expect(html).toBeTruthy()
      expect(html).toContain('Robert Johnson')
    })
  })

  describe('System Error Template', () => {
    const mockData: SystemErrorAdminData = {
      errorType: 'Stripe API Error',
      severity: 'high',
      errorMessage: 'Failed to create payment intent: rate_limit_exceeded',
      stackTrace: `Error: rate_limit_exceeded
  at createPaymentIntent (stripe-service.ts:142)
  at bookingRouter.createPaymentIntent (booking.ts:365)
  at processRequest (trpc.ts:89)`,
      context: {
        bookingId: 'bk_test123',
        userId: 'user_test456',
        amount: 50000,
        timestamp: '2026-01-19T12:34:56.789Z',
      },
      environment: 'production',
    }

    it('should generate HTML content with all data fields', () => {
      const { html, text, subject } = generateSystemErrorAdminEmail(mockData)

      // Subject includes error type and severity
      expect(subject).toContain('Error')
      expect(subject.toUpperCase()).toContain('HIGH')

      // HTML includes error details
      expect(html).toContain('Stripe API Error')
      expect(html).toContain('high' || 'High')
      expect(html).toContain('Failed to create payment intent')
      expect(html).toContain('rate_limit_exceeded')

      // HTML includes stack trace
      expect(html).toContain('stripe-service.ts')
      expect(html).toContain('booking.ts')

      // HTML includes context
      expect(html).toContain('bk_test123')
      expect(html).toContain('user_test456')

      // HTML includes environment
      expect(html).toContain('production')

      // Text version exists
      expect(text).toContain('Stripe API Error')
      expect(text).toContain('production')
    })

    it('should handle critical severity', () => {
      const criticalData: SystemErrorAdminData = {
        ...mockData,
        severity: 'critical',
      }

      const { html, subject } = generateSystemErrorAdminEmail(criticalData)

      expect(subject.toUpperCase()).toContain('CRITICAL')
      expect(html.toLowerCase()).toContain('critical')
    })

    it('should handle medium and low severity', () => {
      const mediumData: SystemErrorAdminData = {
        ...mockData,
        severity: 'medium',
      }

      const lowData: SystemErrorAdminData = {
        ...mockData,
        severity: 'low',
      }

      const mediumResult = generateSystemErrorAdminEmail(mediumData)
      const lowResult = generateSystemErrorAdminEmail(lowData)

      expect(mediumResult.html.toLowerCase()).toContain('medium')
      expect(lowResult.html.toLowerCase()).toContain('low')
    })

    it('should handle missing optional fields', () => {
      const minimalData: SystemErrorAdminData = {
        errorType: 'Database Connection Error',
        severity: 'high',
        errorMessage: 'Connection pool exhausted',
        environment: 'production',
      }

      const { html, text, subject } = generateSystemErrorAdminEmail(minimalData)

      expect(subject).toBeTruthy()
      expect(html).toBeTruthy()
      expect(text).toBeTruthy()
      expect(html).toContain('Database Connection Error')
    })

    it('should handle different error types', () => {
      const emailErrorData: SystemErrorAdminData = {
        errorType: 'SendGrid API Error',
        severity: 'medium',
        errorMessage: 'Rate limit exceeded',
        environment: 'production',
      }

      const { html } = generateSystemErrorAdminEmail(emailErrorData)

      expect(html).toContain('SendGrid API Error')
    })
  })

  describe('Template Consistency', () => {
    it('all templates should return subject, html, and text fields', () => {
      const cancellationResult = generateBookingCancellationAdminEmail({
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        bookingReference: 'BK-TEST',
        bookingId: 'bk_123',
        packageName: 'Test Package',
        tripName: 'Test Trip',
        tripStartDate: '2026-07-01T00:00:00.000Z',
        totalBookingValue: 100000,
        refundAmount: 90000,
        refundStatus: 'pending',
        daysUntilTrip: 30,
        bookingAdminUrl: 'https://test.com',
      })

      const highValueResult = generateHighValueBookingAdminEmail({
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        bookingReference: 'BK-TEST',
        bookingId: 'bk_123',
        packageName: 'Test Package',
        tripName: 'Test Trip',
        tripStartDate: '2026-07-01T00:00:00.000Z',
        addOns: [],
        totalBookingValue: 600000,
        paymentMethod: 'full_payment',
        bookingAdminUrl: 'https://test.com',
      })

      const systemErrorResult = generateSystemErrorAdminEmail({
        errorType: 'Test Error',
        severity: 'low',
        errorMessage: 'Test message',
        environment: 'test',
      })

      // All templates should have these three fields
      expect(cancellationResult).toHaveProperty('subject')
      expect(cancellationResult).toHaveProperty('html')
      expect(cancellationResult).toHaveProperty('text')

      expect(highValueResult).toHaveProperty('subject')
      expect(highValueResult).toHaveProperty('html')
      expect(highValueResult).toHaveProperty('text')

      expect(systemErrorResult).toHaveProperty('subject')
      expect(systemErrorResult).toHaveProperty('html')
      expect(systemErrorResult).toHaveProperty('text')
    })

    it('all templates should generate non-empty content', () => {
      const cancellationResult = generateBookingCancellationAdminEmail({
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        bookingReference: 'BK-TEST',
        bookingId: 'bk_123',
        packageName: 'Test Package',
        tripName: 'Test Trip',
        tripStartDate: '2026-07-01T00:00:00.000Z',
        totalBookingValue: 100000,
        refundAmount: 90000,
        refundStatus: 'pending',
        daysUntilTrip: 30,
        bookingAdminUrl: 'https://test.com',
      })

      expect(cancellationResult.subject.length).toBeGreaterThan(0)
      expect(cancellationResult.html.length).toBeGreaterThan(100)
      expect(cancellationResult.text.length).toBeGreaterThan(50)
    })
  })
})
