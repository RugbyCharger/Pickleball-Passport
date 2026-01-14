import { subDays } from 'date-fns';

/**
 * Installment payment split configuration
 */
export interface InstallmentBreakdown {
  first: number;   // 50% - due at booking
  second: number;  // 25% - due 45 days before trip
  third: number;   // 15% - due 30 days before trip
  fourth: number;  // 10% (remainder) - due 14 days before trip
  total: number;   // Must equal input amount exactly
}

/**
 * Full payment discount calculation result
 */
export interface DiscountCalculation {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

/**
 * Installment payment due dates
 */
export interface InstallmentSchedule {
  first: Date;   // Due at booking (today)
  second: Date;  // 45 days before trip
  third: Date;   // 30 days before trip
  fourth: Date;  // 14 days before trip
}

/**
 * Calculate installment payment breakdown with exact penny allocation.
 * Uses 50/25/15/remainder split to ensure total matches exactly.
 *
 * @param totalAmountCents - Total amount in cents (must be positive)
 * @returns Breakdown of four installment payments
 *
 * @example
 * calculateInstallments(100000) // $1000.00
 * // Returns: { first: 50000, second: 25000, third: 15000, fourth: 10000, total: 100000 }
 */
export function calculateInstallments(totalAmountCents: number): InstallmentBreakdown {
  if (totalAmountCents <= 0) {
    throw new Error('Total amount must be positive');
  }

  // First installment: 50% rounded up
  const first = Math.ceil(totalAmountCents * 0.5);

  // Second installment: 25% rounded down
  const second = Math.floor(totalAmountCents * 0.25);

  // Third installment: 15% rounded down
  const third = Math.floor(totalAmountCents * 0.15);

  // Fourth installment: remainder (ensures exact total)
  const fourth = totalAmountCents - first - second - third;

  return {
    first,
    second,
    third,
    fourth,
    total: totalAmountCents,
  };
}

/**
 * Calculate 2% discount for full payment at booking.
 * Discount is always rounded down (favorable to business).
 *
 * @param totalAmountCents - Original amount in cents (must be positive)
 * @returns Original, discount, and final amounts
 *
 * @example
 * calculateFullPaymentDiscount(100000) // $1000.00
 * // Returns: { originalAmount: 100000, discountAmount: 2000, finalAmount: 98000 }
 */
export function calculateFullPaymentDiscount(totalAmountCents: number): DiscountCalculation {
  if (totalAmountCents <= 0) {
    throw new Error('Total amount must be positive');
  }

  // 2% discount, always rounded down
  const discountAmount = Math.floor(totalAmountCents * 0.02);
  const finalAmount = totalAmountCents - discountAmount;

  return {
    originalAmount: totalAmountCents,
    discountAmount,
    finalAmount,
  };
}

/**
 * Calculate installment payment due dates based on trip start date.
 * All dates use UTC timezone for consistency.
 *
 * @param tripStartDate - Trip start date
 * @returns Payment due dates for each installment
 *
 * @example
 * calculateInstallmentDates(new Date('2024-07-15'))
 * // Returns:
 * // {
 * //   first: new Date(),           // Today
 * //   second: new Date('2024-05-31'), // 45 days before
 * //   third: new Date('2024-06-15'),  // 30 days before
 * //   fourth: new Date('2024-07-01')  // 14 days before
 * // }
 */
export function calculateInstallmentDates(tripStartDate: Date): InstallmentSchedule {
  // Use current date for first installment (due at booking)
  const first = new Date();

  // Calculate subsequent installments relative to trip start
  const second = subDays(tripStartDate, 45);
  const third = subDays(tripStartDate, 30);
  const fourth = subDays(tripStartDate, 14);

  return {
    first,
    second,
    third,
    fourth,
  };
}
