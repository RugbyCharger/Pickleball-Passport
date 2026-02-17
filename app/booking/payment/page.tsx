/**
 * Payment Page
 *
 * E4-S3: Payment Form UI Story Implementation
 *
 * Checkout page where users complete payment for their booking.
 * Creates a payment intent and renders the Stripe payment form.
 *
 * Flow:
 * 1. Validate booking selections from store
 * 2. Create payment intent via tRPC
 * 3. Render Stripe Elements with payment form
 * 4. Handle payment submission
 * 5. Redirect to confirmation on success
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { PaymentPageClient } from './payment-client'

export const metadata: Metadata = {
  title: 'Complete Payment | The Pickleball Passport',
  description: 'Securely complete your booking payment.',
}

export default async function PaymentPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/payment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              6
            </span>
            Final Step - Secure Payment
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Complete Your Booking
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            You're one step away from your Thailand adventure! Complete your secure payment below.
          </p>
        </div>

        {/* Client Component - handles payment intent creation and form rendering */}
        <PaymentPageClient userEmail={user.emailAddresses[0]?.emailAddress || ''} />
      </div>
    </div>
  )
}
