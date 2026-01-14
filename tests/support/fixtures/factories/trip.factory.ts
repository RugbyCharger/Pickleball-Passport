import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';

/**
 * Trip Test Data Factory
 *
 * Generates random trip data for testing with business rule awareness:
 * - 70-day installment eligibility requirement
 * - Various price points for testing calculations
 * - Different trip types and destinations
 *
 * Usage:
 *   const trip = createTrip(); // Random trip eligible for installments
 *   const nearTerm = createNearTermTrip(); // < 70 days (installments not allowed)
 *   const farFuture = createFarFutureTrip(); // > 100 days (well eligible)
 */

export interface TestTrip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  pricePerPersonCents: number;
  description: string;
  maxCapacity: number;
  availableSpots: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Create a trip with random data
 * Default: 80 days from now (eligible for installments)
 */
export function createTrip(overrides: Partial<TestTrip> = {}): TestTrip {
  const startDate = addDays(new Date(), 80); // 80 days from now
  const endDate = addDays(startDate, faker.number.int({ min: 3, max: 14 })); // 3-14 day trip

  return {
    id: faker.string.uuid(),
    name: `${faker.location.city()} ${faker.word.adjective()} Adventure`,
    destination: faker.location.country(),
    startDate,
    endDate,
    pricePerPersonCents: faker.number.int({ min: 100000, max: 2000000 }), // $1,000 - $20,000
    description: faker.lorem.paragraph(),
    maxCapacity: faker.number.int({ min: 10, max: 50 }),
    availableSpots: faker.number.int({ min: 5, max: 30 }),
    isActive: true,
    createdAt: faker.date.past(),
    ...overrides,
  };
}

/**
 * Create a near-term trip (< 70 days)
 * Use for testing installment plan rejection
 */
export function createNearTermTrip(
  overrides: Partial<TestTrip> = {}
): TestTrip {
  const daysFromNow = faker.number.int({ min: 10, max: 69 }); // 10-69 days
  const startDate = addDays(new Date(), daysFromNow);

  return createTrip({
    name: 'Last Minute Adventure',
    startDate,
    ...overrides,
  });
}

/**
 * Create a far-future trip (> 100 days)
 * Use for testing well within installment eligibility
 */
export function createFarFutureTrip(
  overrides: Partial<TestTrip> = {}
): TestTrip {
  const daysFromNow = faker.number.int({ min: 100, max: 365 }); // 100-365 days
  const startDate = addDays(new Date(), daysFromNow);

  return createTrip({
    name: 'Plan Ahead Adventure',
    startDate,
    ...overrides,
  });
}

/**
 * Create a trip starting in exactly 70 days
 * Use for testing boundary condition
 */
export function createExactly70DayTrip(
  overrides: Partial<TestTrip> = {}
): TestTrip {
  const startDate = addDays(new Date(), 70);

  return createTrip({
    name: '70-Day Boundary Trip',
    startDate,
    ...overrides,
  });
}

/**
 * Create a trip with specific price for calculation testing
 */
export function createTripWithPrice(
  priceCents: number,
  overrides: Partial<TestTrip> = {}
): TestTrip {
  return createTrip({
    pricePerPersonCents: priceCents,
    ...overrides,
  });
}

/**
 * Create multiple trips
 */
export function createTrips(
  count: number,
  overrides: Partial<TestTrip> = {}
): TestTrip[] {
  return Array.from({ length: count }, () => createTrip(overrides));
}

/**
 * Standard test trips for common scenarios
 */
export const testTrips = {
  /**
   * $5,000 trip, 80 days away
   * Common test case for installment calculations
   */
  standard: (): TestTrip =>
    createTripWithPrice(500000, {
      name: 'Morocco Adventure',
      destination: 'Morocco',
    }),

  /**
   * $10,000 trip, 80 days away
   * Used in many E2E test examples
   */
  premium: (): TestTrip =>
    createTripWithPrice(1000000, {
      name: 'Italy Tour',
      destination: 'Italy',
    }),

  /**
   * $15,385.67 trip (odd amount for rounding tests)
   */
  oddAmount: (): TestTrip =>
    createTripWithPrice(1538567, {
      name: 'Spain Adventure',
      destination: 'Spain',
    }),

  /**
   * $10.00 trip (small amount edge case)
   */
  minimal: (): TestTrip =>
    createTripWithPrice(1000, {
      name: 'Day Trip',
      destination: 'Local',
    }),
};
