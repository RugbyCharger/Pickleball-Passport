/**
 * Retry Calculator for Failed Installment Payments
 * E4-S6 Phase 8
 *
 * Implements exponential backoff retry strategy:
 * - Attempt 1: On due date
 * - Attempt 2: +1 day after failure
 * - Attempt 3: +3 days after attempt 2
 * - Attempt 4: +7 days after attempt 3
 */

import { addDays } from 'date-fns'

/**
 * Calculate the next retry date based on current retry count
 *
 * @param lastAttemptDate - When the last attempt was made
 * @param currentRetryCount - Current retry count (0-3)
 * @returns Next retry date, or null if max retries exceeded
 */
export function getNextRetryDate(
  lastAttemptDate: Date,
  currentRetryCount: number
): Date | null {
  if (currentRetryCount >= 4) {
    return null // Max retries exceeded
  }

  // Exponential backoff: 1, 3, 7 days
  const daysToAdd = currentRetryCount === 1 ? 1 : currentRetryCount === 2 ? 3 : 7

  return addDays(lastAttemptDate, daysToAdd)
}

/**
 * Check if a payment is eligible for retry based on last attempt time
 *
 * @param lastAttemptDate - When the last attempt was made
 * @param currentRetryCount - Current retry count (1-3)
 * @param now - Current timestamp (defaults to now)
 * @returns True if payment should be retried
 */
export function isRetryEligible(
  lastAttemptDate: Date,
  currentRetryCount: number,
  now: Date = new Date()
): boolean {
  if (currentRetryCount === 0 || currentRetryCount >= 4) {
    return false // First attempt or max retries
  }

  const nextRetryDate = getNextRetryDate(lastAttemptDate, currentRetryCount)
  if (!nextRetryDate) {
    return false
  }

  return now >= nextRetryDate
}

/**
 * Categorize Stripe errors as transient (retry) or permanent (no retry)
 *
 * @param errorCode - Stripe error code
 * @returns True if error is transient and should be retried
 */
export function isTransientError(errorCode: string): boolean {
  const transientErrors = [
    'card_declined',
    'insufficient_funds',
    'expired_card',
    'authentication_required',
    'processing_error',
    'card_velocity_exceeded',
  ]

  return transientErrors.includes(errorCode)
}

/**
 * Categorize errors as permanent (should not retry)
 */
export function isPermanentError(errorCode: string): boolean {
  const permanentErrors = [
    'customer_not_found',
    'payment_method_not_found',
    'invalid_request',
    'card_not_supported',
  ]

  return permanentErrors.includes(errorCode)
}

/**
 * Format retry schedule for customer email
 *
 * @param retryCount - Current retry attempt (1-3)
 * @param lastAttemptDate - When last attempt was made
 * @returns Human-readable next retry date
 */
export function formatNextRetryDate(
  retryCount: number,
  lastAttemptDate: Date
): string {
  const nextDate = getNextRetryDate(lastAttemptDate, retryCount)

  if (!nextDate) {
    return 'No further automatic retries'
  }

  return nextDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
