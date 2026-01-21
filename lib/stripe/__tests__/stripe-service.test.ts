/**
 * Stripe Service Tests
 * E4-S11: Affirm/Klarna Financing Integration
 *
 * Unit tests for utility functions in stripe-service.
 * Note: Payment intent creation is tested via integration tests
 * since it requires complex Stripe mocking.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  isStripeConfigured,
  formatAmountForStripe,
  formatAmountFromStripe,
} from '../stripe-service'

describe('Stripe Service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isStripeConfigured', () => {
    it('should return true when both Stripe keys are configured', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_key'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_key'

      expect(isStripeConfigured()).toBe(true)
    })

    it('should return false when secret key is missing', () => {
      delete process.env.STRIPE_SECRET_KEY
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_key'

      expect(isStripeConfigured()).toBe(false)
    })

    it('should return false when publishable key is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_key'
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      expect(isStripeConfigured()).toBe(false)
    })

    it('should return false when both keys are missing', () => {
      delete process.env.STRIPE_SECRET_KEY
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      expect(isStripeConfigured()).toBe(false)
    })
  })

  describe('formatAmountForStripe', () => {
    it('should convert dollars to cents', () => {
      expect(formatAmountForStripe(10)).toBe(1000)
      expect(formatAmountForStripe(99.99)).toBe(9999)
      expect(formatAmountForStripe(0.5)).toBe(50)
      expect(formatAmountForStripe(1)).toBe(100)
      expect(formatAmountForStripe(0.01)).toBe(1)
    })

    it('should round to nearest cent', () => {
      expect(formatAmountForStripe(10.005)).toBe(1001) // rounds up
      expect(formatAmountForStripe(10.004)).toBe(1000) // rounds down
      expect(formatAmountForStripe(10.999)).toBe(1100) // rounds up
    })

    it('should handle zero', () => {
      expect(formatAmountForStripe(0)).toBe(0)
    })

    it('should handle large amounts', () => {
      expect(formatAmountForStripe(10000)).toBe(1000000) // $10,000
      expect(formatAmountForStripe(999999.99)).toBe(99999999) // ~$1M
    })
  })

  describe('formatAmountFromStripe', () => {
    it('should convert cents to dollars', () => {
      expect(formatAmountFromStripe(1000)).toBe(10)
      expect(formatAmountFromStripe(9999)).toBe(99.99)
      expect(formatAmountFromStripe(50)).toBe(0.5)
      expect(formatAmountFromStripe(100)).toBe(1)
      expect(formatAmountFromStripe(1)).toBe(0.01)
    })

    it('should handle zero', () => {
      expect(formatAmountFromStripe(0)).toBe(0)
    })

    it('should handle large amounts', () => {
      expect(formatAmountFromStripe(1000000)).toBe(10000) // $10,000
      expect(formatAmountFromStripe(99999999)).toBe(999999.99) // ~$1M
    })
  })
})

/**
 * Note: Payment intent creation tests (createPaymentIntent function)
 * are better covered by integration tests that can verify:
 * - Payment method types for Affirm financing
 * - Automatic payment methods for standard payments
 * - Customer attachment for installment plans
 * - Currency handling
 *
 * These tests would require a real or mocked Stripe SDK instance
 * which is better handled in the E2E test suite.
 *
 * Integration test coverage should verify:
 * 1. FINANCING plan creates payment intent with ['affirm', 'card'] types
 * 2. FULL/INSTALLMENT_4 plans use automatic_payment_methods
 * 3. Affirm payments are properly detected in webhooks
 * 4. Confirmation page handles pending Affirm payments
 */
