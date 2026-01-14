import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';

/**
 * Booking Factory - Generate test booking data
 *
 * Knowledge Base Reference: data-factories.md
 *
 * Usage:
 * ```typescript
 * const booking = createBooking({ paymentPlan: 'INSTALLMENT_4' });
 * const bookings = createBookings(3);
 * ```
 */

export interface TestBooking {
  packageId: string;
  tripId: string;
  totalPrice: number; // in cents
  paymentPlan: 'FULL' | 'INSTALLMENT_4' | 'FINANCING';
  tripStartDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

/**
 * Create a single test booking with optional overrides
 */
export function createBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const tripStartDate = faker.date.future({ years: 1 }); // Random date within next year
  const packageId = faker.string.uuid();
  const tripId = faker.string.uuid();

  return {
    packageId,
    tripId,
    totalPrice: faker.number.int({ min: 500000, max: 2000000 }), // $5,000 - $20,000 in cents
    paymentPlan: 'FULL',
    tripStartDate,
    status: 'PENDING',
    ...overrides,
  };
}

/**
 * Create multiple test bookings
 */
export function createBookings(count: number, overrides: Partial<TestBooking> = {}): TestBooking[] {
  return Array.from({ length: count }, () => createBooking(overrides));
}

/**
 * Create a booking with full payment plan (2% discount)
 */
export function createFullPaymentBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  return createBooking({ paymentPlan: 'FULL', ...overrides });
}

/**
 * Create a booking with installment payment plan
 * Ensures trip is at least 70 days away (business rule)
 */
export function createInstallmentBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const tripStartDate = addDays(new Date(), 75); // 75 days from today (meets 70-day requirement)
  return createBooking({
    paymentPlan: 'INSTALLMENT_4',
    tripStartDate,
    ...overrides,
  });
}

/**
 * Create a booking with trip date that's too soon for installments
 * (Less than 70 days away)
 */
export function createNearTermBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const tripStartDate = addDays(new Date(), 30); // 30 days from today (fails 70-day requirement)
  return createBooking({
    tripStartDate,
    ...overrides,
  });
}

/**
 * Create a booking with trip starting in exactly 70 days (boundary test)
 */
export function createExactly70DayBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const tripStartDate = addDays(new Date(), 70);
  return createBooking({
    paymentPlan: 'INSTALLMENT_4',
    tripStartDate,
    ...overrides,
  });
}

/**
 * Create a booking with trip starting in 69 days (just under threshold)
 */
export function create69DayBooking(overrides: Partial<TestBooking> = {}): TestBooking {
  const tripStartDate = addDays(new Date(), 69);
  return createBooking({
    tripStartDate,
    ...overrides,
  });
}

/**
 * Create a gift booking (must use FULL payment plan)
 */
export interface TestGiftBooking extends TestBooking {
  isGift: true;
  recipientName: string;
  recipientEmail: string;
}

export function createGiftBooking(
  overrides: Partial<TestGiftBooking> = {}
): TestGiftBooking {
  return {
    ...createBooking({
      paymentPlan: 'FULL', // Gift bookings must be FULL
      ...overrides,
    }),
    isGift: true,
    recipientName: faker.person.fullName(),
    recipientEmail: faker.internet.email(),
    ...overrides,
  };
}

/**
 * Create a booking with specific price for calculation testing
 */
export function createBookingWithPrice(
  priceCents: number,
  overrides: Partial<TestBooking> = {}
): TestBooking {
  return createBooking({
    totalPrice: priceCents,
    ...overrides,
  });
}

/**
 * Standard test bookings for common scenarios
 */
export const testBookings = {
  /**
   * $5,000 booking with FULL payment (gets 2% discount)
   */
  standardFull: (): TestBooking =>
    createBookingWithPrice(500000, {
      paymentPlan: 'FULL',
    }),

  /**
   * $10,000 booking with INSTALLMENT_4 plan
   */
  standardInstallment: (): TestBooking =>
    createInstallmentBooking({
      totalPrice: 1000000,
    }),

  /**
   * $15,385.67 booking (odd amount for rounding tests)
   */
  oddAmount: (): TestBooking =>
    createBookingWithPrice(1538567, {
      paymentPlan: 'INSTALLMENT_4',
      tripStartDate: addDays(new Date(), 80),
    }),

  /**
   * $10.00 booking (minimal amount edge case)
   */
  minimal: (): TestBooking =>
    createBookingWithPrice(1000, {
      paymentPlan: 'FULL',
    }),

  /**
   * Companion booking (pair of bookings for same trip)
   */
  companion: (): [TestBooking, TestBooking] => {
    const tripId = faker.string.uuid();
    const tripStartDate = addDays(new Date(), 80);

    const primary = createBooking({
      tripId,
      tripStartDate,
      paymentPlan: 'FULL',
      totalPrice: 500000,
    });

    const companion = createBooking({
      tripId,
      tripStartDate,
      paymentPlan: 'INSTALLMENT_4',
      totalPrice: 500000,
    });

    return [primary, companion];
  },
};
