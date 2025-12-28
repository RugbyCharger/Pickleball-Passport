/**
 * Stripe Elements Provider
 *
 * E4-S3: Payment Form UI
 *
 * Wraps children with Stripe Elements context.
 * Required for using Stripe payment components.
 */

'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/get-stripe'

interface StripeProviderProps {
  clientSecret: string
  children: React.ReactNode
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const stripePromise = getStripe()

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981', // emerald-600
        colorBackground: '#ffffff',
        colorText: '#0f172a', // slate-900
        colorDanger: '#ef4444', // red-500
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '1px solid #cbd5e1', // slate-300
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #10b981', // emerald-600
          boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '600',
          color: '#475569', // slate-600
        },
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
