import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';

/**
 * Payment Test Data Factory
 *
 * Generates payment record data for testing:
 * - FULL payment records (single payment with discount)
 * - INSTALLMENT_4 records (4 payments with schedule)
 * - Payment status tracking (PAID, PENDING, FAILED)
 *
 * Usage:
 *   const payment = createPayment();
 *   const installments = createInstallmentPayments(bookingId, 1000000); // $10,000
 *   const fullPayment = createFullPayment(bookingId, 500000); // $5,000
 */

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';
export type PaymentPlan = 'FULL' | 'INSTALLMENT_4' | 'FINANCING';

export interface TestPayment {
  id: string;
  bookingId: string;
  amountCents: number;
  status: PaymentStatus;
  dueDate: Date;
  paidDate?: Date;
  percentage?: number; // For installment payments (50, 25, 15, 10)
  installmentNumber?: number; // 1, 2, 3, 4
  stripePaymentIntentId?: string;
  createdAt: Date;
}

/**
 * Create a single payment record with random data
 */
export function createPayment(
  overrides: Partial<TestPayment> = {}
): TestPayment {
  return {
    id: faker.string.uuid(),
    bookingId: faker.string.uuid(),
    amountCents: faker.number.int({ min: 50000, max: 500000 }), // $500 - $5,000
    status: 'PENDING',
    dueDate: faker.date.future(),
    stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
    createdAt: faker.date.past(),
    ...overrides,
  };
}

/**
 * Create a FULL payment record (single payment with 2% discount)
 */
export function createFullPayment(
  bookingId: string,
  originalAmountCents: number,
  overrides: Partial<TestPayment> = {}
): TestPayment {
  // Calculate 2% discount
  const discountCents = Math.floor(originalAmountCents * 0.02);
  const finalAmountCents = originalAmountCents - discountCents;

  return createPayment({
    bookingId,
    amountCents: finalAmountCents,
    status: 'PAID',
    dueDate: new Date(), // Due immediately
    paidDate: new Date(),
    ...overrides,
  });
}

/**
 * Create 4 installment payment records for INSTALLMENT_4 plan
 * Returns array: [first (50%), second (25%), third (15%), fourth (10%)]
 */
export function createInstallmentPayments(
  bookingId: string,
  totalAmountCents: number,
  tripStartDate: Date,
  overrides: Partial<TestPayment> = {}
): TestPayment[] {
  // Calculate installment amounts (with proper rounding)
  const first = Math.ceil(totalAmountCents * 0.5); // 50% - round up
  const second = Math.floor(totalAmountCents * 0.25); // 25% - round down
  const third = Math.floor(totalAmountCents * 0.15); // 15% - round down
  const fourth = totalAmountCents - first - second - third; // Remainder (ensures exact total)

  // Calculate due dates based on trip start
  const firstDueDate = new Date(); // Due at booking
  const secondDueDate = addDays(tripStartDate, -45); // 45 days before trip
  const thirdDueDate = addDays(tripStartDate, -30); // 30 days before trip
  const fourthDueDate = addDays(tripStartDate, -14); // 14 days before trip

  return [
    createPayment({
      bookingId,
      amountCents: first,
      status: 'PAID', // First payment paid immediately
      dueDate: firstDueDate,
      paidDate: firstDueDate,
      percentage: 50,
      installmentNumber: 1,
      ...overrides,
    }),
    createPayment({
      bookingId,
      amountCents: second,
      status: 'PENDING',
      dueDate: secondDueDate,
      percentage: 25,
      installmentNumber: 2,
      ...overrides,
    }),
    createPayment({
      bookingId,
      amountCents: third,
      status: 'PENDING',
      dueDate: thirdDueDate,
      percentage: 15,
      installmentNumber: 3,
      ...overrides,
    }),
    createPayment({
      bookingId,
      amountCents: fourth,
      status: 'PENDING',
      dueDate: fourthDueDate,
      percentage: 10,
      installmentNumber: 4,
      ...overrides,
    }),
  ];
}

/**
 * Create payments with specific amounts (for calculation testing)
 */
export function createPaymentsWithAmounts(
  bookingId: string,
  amounts: number[]
): TestPayment[] {
  return amounts.map((amountCents, index) =>
    createPayment({
      bookingId,
      amountCents,
      installmentNumber: index + 1,
    })
  );
}

/**
 * Create a failed payment record
 */
export function createFailedPayment(
  bookingId: string,
  overrides: Partial<TestPayment> = {}
): TestPayment {
  return createPayment({
    bookingId,
    status: 'FAILED',
    stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}_failed`,
    ...overrides,
  });
}

/**
 * Standard test payment scenarios
 */
export const testPayments = {
  /**
   * FULL payment for $5,000 trip (with 2% discount = $4,900)
   */
  standardFull: (bookingId: string): TestPayment =>
    createFullPayment(bookingId, 500000),

  /**
   * INSTALLMENT_4 for $10,000 trip
   * Returns: [$5,000, $2,500, $1,500, $1,000]
   */
  standardInstallment: (
    bookingId: string,
    tripStartDate: Date
  ): TestPayment[] =>
    createInstallmentPayments(bookingId, 1000000, tripStartDate),

  /**
   * INSTALLMENT_4 for $15,385.67 (odd amount with rounding)
   */
  oddAmountInstallment: (
    bookingId: string,
    tripStartDate: Date
  ): TestPayment[] =>
    createInstallmentPayments(bookingId, 1538567, tripStartDate),

  /**
   * INSTALLMENT_4 for $10.00 (minimal amount edge case)
   */
  minimalInstallment: (
    bookingId: string,
    tripStartDate: Date
  ): TestPayment[] => createInstallmentPayments(bookingId, 1000, tripStartDate),
};

/**
 * Verify installment amounts sum to exact total (helper for tests)
 */
export function verifyInstallmentSum(
  payments: TestPayment[],
  expectedTotalCents: number
): boolean {
  const sum = payments.reduce((total, payment) => total + payment.amountCents, 0);
  return sum === expectedTotalCents;
}
