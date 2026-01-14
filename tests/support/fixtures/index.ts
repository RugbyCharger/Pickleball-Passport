import { test as base } from '@playwright/test';

/**
 * Test Fixtures for Pickleball Passport
 *
 * Fixture Architecture Pattern:
 * - Auto-cleanup: All fixtures automatically clean up created resources
 * - Isolation: Each test gets fresh, isolated data
 * - Composable: Fixtures can depend on other fixtures
 *
 * Knowledge Base Reference: fixture-architecture.md
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '@/tests/support/fixtures';
 *
 * test('should create booking', async ({ authenticatedUser }) => {
 *   // authenticatedUser fixture provides logged-in user with auto-cleanup
 * });
 * ```
 */

type TestFixtures = {
  // Add custom fixtures here as you build them
  // Example: authenticatedUser: { id: string; email: string; token: string };
};

export const test = base.extend<TestFixtures>({
  // Fixtures will be added here as the test suite grows
  // Example:
  // authenticatedUser: async ({ page }, use) => {
  //   // Setup: Create and authenticate user
  //   const user = await createTestUser();
  //   await loginUser(page, user);
  //
  //   // Provide to test
  //   await use(user);
  //
  //   // Cleanup: Delete user
  //   await deleteTestUser(user.id);
  // },
});

export { expect } from '@playwright/test';

/**
 * Export all test data factories
 * These generate random test data using faker
 */
export * from './factories/user.factory';
export * from './factories/booking.factory';
export * from './factories/trip.factory';
export * from './factories/payment.factory';
export * from './factories/stripe.factory';
