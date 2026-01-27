/**
 * Server-side Stripe Client
 *
 * Provides a singleton Stripe instance for server-side operations.
 * This module is the canonical source for server-side Stripe client.
 *
 * @see stripe-service.ts for higher-level Stripe operations
 */

import Stripe from 'stripe'

// Lazy-initialized singleton
let stripeClient: Stripe | null = null

/**
 * Get the server-side Stripe client
 *
 * Uses lazy initialization to avoid build-time errors when
 * environment variables aren't available.
 *
 * @throws Error if STRIPE_SECRET_KEY is not configured
 */
export function getStripeServer(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }

  return stripeClient
}

/**
 * Reset the Stripe client (for testing purposes only)
 *
 * @internal
 */
export function _resetStripeClient(): void {
  stripeClient = null
}
