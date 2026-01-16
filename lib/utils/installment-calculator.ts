/**
 * Installment Payment Plan Calculator
 * E4-S6: Installment Payment Plans
 *
 * Utility functions for calculating installment amounts, dates, and discounts.
 */

import { differenceInDays, subDays } from 'date-fns'

/**
 * Installment breakdown with named properties
 */
export interface InstallmentBreakdown {
  first: number   // 50% - due at booking
  second: number  // 25% - due 60 days before trip
  third: number   // 15% - due 30 days before trip
  fourth: number  // 10% (remainder) - due 7 days before trip
  total: number   // Must equal input amount exactly
}

/**
 * Installment schedule with due dates
 */
export interface InstallmentSchedule {
  first: Date   // Due at booking (today)
  second: Date  // 60 days before trip
  third: Date   // 30 days before trip
  fourth: Date  // 7 days before trip
}

/**
 * Calculate installment amounts for 4-payment plan
 * Percentages: 50%, 25%, 15%, 10%
 * Handles rounding by adjusting the last installment to match exact total
 *
 * @param totalCents - Total booking amount in cents
 * @returns Object with named installment amounts in cents
 */
export function calculateInstallments(totalCents: number): InstallmentBreakdown {
  if (totalCents <= 0) {
    throw new Error('Total amount must be positive')
  }

  // First installment: 50% rounded up
  const first = Math.ceil(totalCents * 0.50)

  // Second installment: 25% rounded down
  const second = Math.floor(totalCents * 0.25)

  // Third installment: 15% rounded down
  const third = Math.floor(totalCents * 0.15)

  // Fourth installment: remainder (ensures exact total)
  const fourth = totalCents - first - second - third

  return {
    first,
    second,
    third,
    fourth,
    total: totalCents,
  }
}

/**
 * Calculate installment amounts for 4-payment plan (array version)
 * Percentages: 50%, 25%, 15%, 10%
 * Handles rounding by adjusting the last installment to match exact total
 *
 * @param totalCents - Total booking amount in cents
 * @returns Array of 4 installment amounts in cents [50%, 25%, 15%, 10%]
 */
export function calculateInstallmentAmounts(totalCents: number): number[] {
  const breakdown = calculateInstallments(totalCents)
  return [breakdown.first, breakdown.second, breakdown.third, breakdown.fourth]
}

/**
 * Calculate installment due dates based on trip start date
 * Schedule: Today, 60 days before, 30 days before, 7 days before
 *
 * @param tripStartDate - Date when trip starts
 * @returns Object with named dates for each installment
 */
export function calculateInstallmentDates(tripStartDate: Date): InstallmentSchedule {
  const first = new Date() // Due today at booking
  const second = subDays(tripStartDate, 60)
  const third = subDays(tripStartDate, 30)
  const fourth = subDays(tripStartDate, 7)

  return { first, second, third, fourth }
}

/**
 * Calculate installment due dates based on trip start date (array version)
 * Schedule: Today, 60 days before, 30 days before, 7 days before
 *
 * @param tripStartDate - Date when trip starts
 * @returns Array of 4 dates [today, -60d, -30d, -7d]
 */
export function calculateInstallmentDatesArray(tripStartDate: Date): Date[] {
  const schedule = calculateInstallmentDates(tripStartDate)
  return [schedule.first, schedule.second, schedule.third, schedule.fourth]
}

/**
 * Check if installment plan is available for the given trip date
 * Requires at least 70 days between today and trip start
 *
 * @param tripStartDate - Date when trip starts
 * @returns True if installment plan is available, false otherwise
 */
export function canUseInstallmentPlan(tripStartDate: Date): boolean {
  const today = new Date()
  const daysUntilTrip = differenceInDays(tripStartDate, today)
  return daysUntilTrip >= 70
}

/**
 * Full payment discount result
 */
export interface DiscountCalculation {
  originalAmount: number
  discountAmount: number
  finalAmount: number
  // Aliases for backward compatibility
  discount: number
  discountedTotal: number
}

/**
 * Calculate 2% discount for full payment
 *
 * @param totalCents - Total booking amount in cents
 * @returns Object with discount amount and discounted total, both in cents
 */
export function calculateFullPaymentDiscount(totalCents: number): DiscountCalculation {
  if (totalCents <= 0) {
    throw new Error('Total amount must be positive')
  }

  const discountAmount = Math.floor(totalCents * 0.02) // 2% discount, rounded down
  const finalAmount = totalCents - discountAmount

  return {
    originalAmount: totalCents,
    discountAmount,
    finalAmount,
    // Aliases for backward compatibility
    discount: discountAmount,
    discountedTotal: finalAmount,
  }
}

/**
 * Format cents as dollar string
 *
 * @param cents - Amount in cents
 * @returns Formatted string like "$15,000.00"
 */
export function formatCentsAsDollars(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

/**
 * Validate that installment amounts sum to exact total
 * Used for testing and error detection
 *
 * @param installments - Array of installment amounts
 * @param totalCents - Expected total in cents
 * @returns True if sum matches total exactly
 */
export function validateInstallmentSum(installments: number[], totalCents: number): boolean {
  const sum = installments.reduce((acc, amount) => acc + amount, 0)
  return sum === totalCents
}
