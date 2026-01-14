import { faker } from '@faker-js/faker';

/**
 * User Factory - Generate test user data
 *
 * Knowledge Base Reference: data-factories.md
 *
 * Principles:
 * - Use faker for random data (no hardcoded values)
 * - Support overrides for specific test scenarios
 * - Generate complete, valid objects
 * - Provide bulk creation helpers
 *
 * Usage:
 * ```typescript
 * const user = createUser({ email: 'specific@example.com' });
 * const users = createUsers(5); // Generate 5 random users
 * ```
 */

export interface TestUser {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'GUEST' | 'MEDICAL_PROFESSIONAL' | 'ADMIN';
}

/**
 * Create a single test user with optional overrides
 */
export function createUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password({ length: 12 }),
    phone: faker.phone.number(),
    role: 'GUEST',
    ...overrides,
  };
}

/**
 * Create multiple test users
 */
export function createUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Create a guest user (default role)
 */
export function createGuest(overrides: Partial<TestUser> = {}): TestUser {
  return createUser({ role: 'GUEST', ...overrides });
}

/**
 * Create a medical professional user
 */
export function createMedicalProfessional(overrides: Partial<TestUser> = {}): TestUser {
  return createUser({ role: 'MEDICAL_PROFESSIONAL', ...overrides });
}

/**
 * Create an admin user
 */
export function createAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createUser({ role: 'ADMIN', ...overrides });
}
