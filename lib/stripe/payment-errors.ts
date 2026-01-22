/**
 * Payment Error Handling
 *
 * E4-S5: Payment Failure Handling
 *
 * Categorizes Stripe errors and provides user-friendly error messages.
 * Handles card errors, validation errors, network errors, and generic failures.
 */

import type { StripeError } from '@stripe/stripe-js'

export interface PaymentErrorInfo {
  title: string
  message: string
  canRetry: boolean
  suggestAlternative: boolean
  category: 'card' | 'validation' | 'network' | 'generic' | 'affirm'
}

/**
 * Error message mappings for different Stripe error codes
 */
const ERROR_MESSAGES: Record<string, PaymentErrorInfo> = {
  // Card errors
  card_declined: {
    title: 'Card Declined',
    message:
      'Your card was declined. Please try a different payment method or contact your bank for more information.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  insufficient_funds: {
    title: 'Insufficient Funds',
    message:
      'Your card has insufficient funds for this transaction. Please try a different payment method.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  expired_card: {
    title: 'Expired Card',
    message: 'Your card has expired. Please use a different card.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  incorrect_cvc: {
    title: 'Incorrect Security Code',
    message:
      'The security code (CVC) you entered is incorrect. Please check your card and try again.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  processing_error: {
    title: 'Processing Error',
    message:
      'An error occurred while processing your card. Please try again or use a different payment method.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  incorrect_number: {
    title: 'Invalid Card Number',
    message: 'The card number you entered is invalid. Please check and try again.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  card_velocity_exceeded: {
    title: 'Too Many Attempts',
    message:
      'This card has been declined too many times. Please try a different card or contact your bank.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  fraudulent: {
    title: 'Payment Declined',
    message:
      'This payment was declined for security reasons. Please contact your bank or try a different payment method.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },
  generic_decline: {
    title: 'Card Declined',
    message:
      'Your card was declined. Please contact your bank for more information or try a different payment method.',
    canRetry: true,
    suggestAlternative: true,
    category: 'card',
  },

  // Validation errors
  invalid_number: {
    title: 'Invalid Card Number',
    message: 'Please enter a valid card number.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  invalid_expiry_month: {
    title: 'Invalid Expiration Date',
    message: 'Please enter a valid expiration month.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  invalid_expiry_year: {
    title: 'Invalid Expiration Date',
    message: 'Please enter a valid expiration year.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  invalid_cvc: {
    title: 'Invalid Security Code',
    message: 'Please enter a valid CVC/CVV code.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  incomplete_number: {
    title: 'Incomplete Card Number',
    message: 'Please enter your complete card number.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  incomplete_expiry: {
    title: 'Incomplete Expiration Date',
    message: 'Please enter your card expiration date.',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },
  incomplete_cvc: {
    title: 'Incomplete Security Code',
    message: 'Please enter your card security code (CVC/CVV).',
    canRetry: true,
    suggestAlternative: false,
    category: 'validation',
  },

  // Network errors
  api_connection_error: {
    title: 'Connection Error',
    message:
      'Unable to connect to our payment processor. Please check your internet connection and try again.',
    canRetry: true,
    suggestAlternative: false,
    category: 'network',
  },
  api_error: {
    title: 'Payment Service Error',
    message:
      'Our payment service is temporarily unavailable. Please try again in a few moments.',
    canRetry: true,
    suggestAlternative: false,
    category: 'network',
  },
  rate_limit_error: {
    title: 'Too Many Requests',
    message: 'Too many payment attempts. Please wait a moment and try again.',
    canRetry: true,
    suggestAlternative: false,
    category: 'network',
  },

  // E4-S11: Affirm-specific errors
  payment_method_not_available: {
    title: 'Affirm Not Available',
    message:
      'Affirm financing is not available for this transaction. This may be due to order amount, location, or other eligibility requirements. Please try paying with a card instead.',
    canRetry: true,
    suggestAlternative: true,
    category: 'affirm',
  },
  payment_intent_payment_attempt_expired: {
    title: 'Session Expired',
    message:
      'Your Affirm payment session has expired. Please start a new payment attempt.',
    canRetry: true,
    suggestAlternative: true,
    category: 'affirm',
  },
  payment_method_provider_decline: {
    title: 'Affirm Application Declined',
    message:
      'Your Affirm financing application was not approved. This decision is made by Affirm based on their eligibility criteria. You can still complete your booking by paying with a credit or debit card.',
    canRetry: true,
    suggestAlternative: true,
    category: 'affirm',
  },
  affirm_canceled: {
    title: 'Affirm Checkout Canceled',
    message:
      'You canceled the Affirm checkout process. You can try again with Affirm or choose a different payment method.',
    canRetry: true,
    suggestAlternative: true,
    category: 'affirm',
  },
}

/**
 * Default error for unknown error codes
 */
const DEFAULT_ERROR: PaymentErrorInfo = {
  title: 'Payment Error',
  message:
    'An unexpected error occurred while processing your payment. Please try again or contact support if the problem persists.',
  canRetry: true,
  suggestAlternative: true,
  category: 'generic',
}

/**
 * Categorize and format a Stripe error for user display
 */
export function categorizePaymentError(error: StripeError | null): PaymentErrorInfo {
  if (!error) {
    return DEFAULT_ERROR
  }

  // Use the error code to look up the appropriate message
  const errorCode = error.code || error.decline_code
  if (errorCode && errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode]
  }

  // If we have an error message from Stripe, use it with default category
  if (error.message) {
    return {
      title: 'Payment Error',
      message: error.message,
      canRetry: true,
      suggestAlternative: error.type === 'card_error',
      category: error.type === 'card_error' ? 'card' : 'generic',
    }
  }

  return DEFAULT_ERROR
}

/**
 * Log payment error for support debugging
 */
export function logPaymentError(error: StripeError | null, context: {
  bookingReference?: string
  amount?: number
  timestamp?: Date
}) {
  const errorInfo = categorizePaymentError(error)

  console.error('[Payment Error]', {
    ...errorInfo,
    originalError: {
      type: error?.type,
      code: error?.code,
      decline_code: error?.decline_code,
      message: error?.message,
    },
    context: {
      ...context,
      timestamp: context.timestamp || new Date(),
    },
  })

  // In production, this would send to error tracking service (e.g., Sentry)
  // For now, just log to console
}

/**
 * Get user-friendly alternative payment suggestions
 */
export function getAlternativePaymentSuggestions(errorInfo: PaymentErrorInfo): string[] {
  if (!errorInfo.suggestAlternative) {
    return []
  }

  const suggestions: string[] = []

  switch (errorInfo.category) {
    case 'card':
      suggestions.push('Try a different credit or debit card')
      suggestions.push('Contact your bank to authorize the payment')
      suggestions.push('Verify your card details are correct')
      break
    case 'validation':
      suggestions.push('Double-check your card information')
      suggestions.push('Ensure all fields are filled correctly')
      break
    case 'network':
      suggestions.push('Check your internet connection')
      suggestions.push('Try again in a few moments')
      break
    case 'affirm':
      suggestions.push('Pay with a credit or debit card instead')
      suggestions.push('Try Affirm financing again')
      suggestions.push('Contact Affirm support for eligibility questions')
      break
    default:
      suggestions.push('Try a different payment method')
      suggestions.push('Contact our support team for assistance')
  }

  return suggestions
}
