import type { User, Role } from '@prisma/client'

export interface UserFactoryOptions {
  id?: string
  email?: string
  name?: string
  emailVerified?: Date | null
  image?: string | null
  phone?: string | null
  role?: Role
  stripeCustomerId?: string | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Factory for creating User test data
 */
export function createUser(
  options: UserFactoryOptions = {}
): Omit<User, 'accounts' | 'sessions' | 'bookings' | 'applications' | 'notifications' | 'supportTickets' | 'partnerProfile'> {
  const now = new Date()
  const randomId = Date.now()

  return {
    id: options.id ?? `test-user-${randomId}`,
    email: options.email ?? `test-${randomId}@example.com`,
    name: options.name ?? `Test User ${randomId}`,
    emailVerified: options.emailVerified === undefined ? null : options.emailVerified,
    image: options.image === undefined ? null : options.image,
    phone: options.phone === undefined ? null : options.phone,
    role: options.role ?? 'GUEST',
    stripeCustomerId: options.stripeCustomerId === undefined ? null : options.stripeCustomerId,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  }
}

/**
 * Create an admin user
 */
export function createAdminUser(
  options: Partial<UserFactoryOptions> = {}
): Omit<User, 'accounts' | 'sessions' | 'bookings' | 'applications' | 'notifications' | 'supportTickets' | 'partnerProfile'> {
  return createUser({
    ...options,
    role: 'ADMIN',
  })
}

/**
 * Create a guest user with Stripe customer ID
 */
export function createGuestWithStripe(
  options: Partial<UserFactoryOptions> = {}
): Omit<User, 'accounts' | 'sessions' | 'bookings' | 'applications' | 'notifications' | 'supportTickets' | 'partnerProfile'> {
  return createUser({
    ...options,
    role: 'GUEST',
    stripeCustomerId: options.stripeCustomerId ?? `cus_test_${Date.now()}`,
  })
}
