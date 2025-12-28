/**
 * Client-side Stripe initialization
 *
 * Provides a singleton Stripe.js instance for use in React components.
 * This ensures Stripe is only loaded once per page load.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}
