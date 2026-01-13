/**
 * Installment Payment Plan Calculator
 * E4-S6: Installment Payment Plans
 *
 * Utility functions for calculating installment amounts, dates, and discounts.
 */

import { differenceInDays, subDays } from 'date-fns'

/**
 * Calculate installment amounts for 4-payment plan
 * Percentages: 50%, 25%, 15%, 10%
 * Handles rounding by adjusting the last installment to match exact total
 *
 * @param totalCents - Total booking amount in cents
 * @returns Array of 4 installment amounts in cents [50%, 25%, 15%, 10%]
 */
export function calculateInstallmentAmounts(totalCents: number): number[] {
  // Calculate percentages in cents
  const installment1 = Math.round(totalCents * 0.50) // 50%
  const installment2 = Math.round(totalCents * 0.25) // 25%
  const installment3 = Math.round(totalCents * 0.15) // 15%

  // Calculate remaining for last installment (handles rounding)
  const installment4 = totalCents - installment1 - installment2 - installment3

  return [installment1, installment2, installment3, installment4]
}

/**
 * Calculate installment due dates based on trip start date
 * Schedule: Today, 60 days before, 30 days before, 7 days before
 *
 * @param tripStartDate - Date when trip starts
 * @returns Array of 4 dates [today, -60d, -30d, -7d]
 */
export function calculateInstallmentDates(tripStartDate: Date): Date[] {
  const today = new Date()
  const date60DaysBefore = subDays(tripStartDate, 60)
  const date30DaysBefore = subDays(tripStartDate, 30)
  const date7DaysBefore = subDays(tripStartDate, 7)

  return [today, date60DaysBefore, date30DaysBefore, date7DaysBefore]
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
 * Calculate 2% discount for full payment
 *
 * @param totalCents - Total booking amount in cents
 * @returns Object with discount amount and discounted total, both in cents
 */
export function calculateFullPaymentDiscount(totalCents: number): {
  discount: number
  discountedTotal: number
} {
  const discount = Math.round(totalCents * 0.02) // 2% discount
  const discountedTotal = totalCents - discount

  return { discount, discountedTotal }
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
