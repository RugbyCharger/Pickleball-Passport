/**
 * Payment Errors Tests
 * E4-S11: Affirm/Klarna Financing Integration
 *
 * Tests for payment error handling including:
 * - Affirm-specific error codes
 * - Error categorization
 * - User-friendly error messages
 * - Alternative payment suggestions
 */

import { describe, it, expect } from 'vitest'
import {
  categorizePaymentError,
  getAlternativePaymentSuggestions,
  type PaymentErrorInfo,
} from '../payment-errors'
import type { StripeError } from '@stripe/stripe-js'

describe('Payment Errors', () => {
  describe('categorizePaymentError', () => {
    describe('Affirm-specific errors', () => {
      it('should categorize payment_method_not_available as affirm error', () => {
        const error = {
          type: 'invalid_request_error',
          code: 'payment_method_not_available',
          message: 'Affirm is not available for this transaction',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('affirm')
        expect(result.title).toBe('Affirm Not Available')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
        expect(result.message).toContain('not available for this transaction')
      })

      it('should categorize payment_intent_payment_attempt_expired as affirm error', () => {
        const error = {
          type: 'invalid_request_error',
          code: 'payment_intent_payment_attempt_expired',
          message: 'Payment attempt expired',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('affirm')
        expect(result.title).toBe('Session Expired')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })

      it('should categorize payment_method_provider_decline as affirm error', () => {
        const error = {
          type: 'card_error',
          code: 'payment_method_provider_decline',
          message: 'Application declined',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('affirm')
        expect(result.title).toBe('Affirm Application Declined')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
        expect(result.message).toContain('not approved')
      })

      it('should categorize affirm_canceled as affirm error', () => {
        const error = {
          type: 'invalid_request_error',
          code: 'affirm_canceled',
          message: 'User canceled Affirm checkout',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('affirm')
        expect(result.title).toBe('Affirm Checkout Canceled')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })
    })

    describe('Card errors', () => {
      it('should categorize card_declined as card error', () => {
        const error = {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('card')
        expect(result.title).toBe('Card Declined')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })

      it('should categorize insufficient_funds as card error', () => {
        const error = {
          type: 'card_error',
          code: 'insufficient_funds',
          message: 'Insufficient funds',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('card')
        expect(result.title).toBe('Insufficient Funds')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })

      it('should categorize expired_card as card error', () => {
        const error = {
          type: 'card_error',
          code: 'expired_card',
          message: 'Card expired',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('card')
        expect(result.title).toBe('Expired Card')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })
    })

    describe('Validation errors', () => {
      it('should categorize incorrect_cvc as validation error', () => {
        const error = {
          type: 'card_error',
          code: 'incorrect_cvc',
          message: 'Incorrect CVC',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('validation')
        expect(result.title).toBe('Incorrect Security Code')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(false)
      })

      it('should categorize invalid_number as validation error', () => {
        const error = {
          type: 'validation_error',
          code: 'invalid_number',
          message: 'Invalid card number',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('validation')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(false)
      })
    })

    describe('Network errors', () => {
      it('should categorize api_connection_error as network error', () => {
        const error = {
          type: 'api_connection_error',
          code: 'api_connection_error',
          message: 'Connection failed',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('network')
        expect(result.title).toBe('Connection Error')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(false)
      })
    })

    describe('Default/Unknown errors', () => {
      it('should return default error for null error', () => {
        const result = categorizePaymentError(null)

        expect(result.category).toBe('generic')
        expect(result.title).toBe('Payment Error')
        expect(result.canRetry).toBe(true)
        expect(result.suggestAlternative).toBe(true)
      })

      it('should return default error for unknown error code', () => {
        const error = {
          type: 'api_error',
          code: 'some_unknown_code',
          message: 'Unknown error',
        } as StripeError

        const result = categorizePaymentError(error)

        expect(result.category).toBe('generic')
        expect(result.canRetry).toBe(true)
      })

      it('should use Stripe message for unknown error with message', () => {
        const error = {
          type: 'card_error',
          code: undefined,
          message: 'Custom Stripe error message',
        } as unknown as StripeError

        const result = categorizePaymentError(error)

        expect(result.message).toBe('Custom Stripe error message')
        expect(result.category).toBe('card')
      })
    })
  })

  describe('getAlternativePaymentSuggestions', () => {
    it('should return Affirm-specific suggestions for affirm errors', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Affirm Declined',
        message: 'Application declined',
        canRetry: true,
        suggestAlternative: true,
        category: 'affirm',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toContain('Pay with a credit or debit card instead')
      expect(suggestions).toContain('Try Affirm financing again')
      expect(suggestions).toContain('Contact Affirm support for eligibility questions')
    })

    it('should return card suggestions for card errors', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Card Declined',
        message: 'Card declined',
        canRetry: true,
        suggestAlternative: true,
        category: 'card',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toContain('Try a different credit or debit card')
      expect(suggestions).toContain('Contact your bank to authorize the payment')
      expect(suggestions).toContain('Verify your card details are correct')
    })

    it('should return validation suggestions for validation errors', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Invalid Card',
        message: 'Invalid card',
        canRetry: true,
        suggestAlternative: true,
        category: 'validation',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toContain('Double-check your card information')
      expect(suggestions).toContain('Ensure all fields are filled correctly')
    })

    it('should return network suggestions for network errors', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Connection Error',
        message: 'Connection failed',
        canRetry: true,
        suggestAlternative: true,
        category: 'network',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toContain('Check your internet connection')
      expect(suggestions).toContain('Try again in a few moments')
    })

    it('should return empty array when suggestAlternative is false', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Validation Error',
        message: 'Invalid CVC',
        canRetry: true,
        suggestAlternative: false,
        category: 'validation',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toEqual([])
    })

    it('should return generic suggestions for unknown category', () => {
      const errorInfo: PaymentErrorInfo = {
        title: 'Unknown Error',
        message: 'Something went wrong',
        canRetry: true,
        suggestAlternative: true,
        category: 'generic',
      }

      const suggestions = getAlternativePaymentSuggestions(errorInfo)

      expect(suggestions).toContain('Try a different payment method')
      expect(suggestions).toContain('Contact our support team for assistance')
    })
  })
})
