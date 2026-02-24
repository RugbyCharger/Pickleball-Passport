/**
 * Booking Configurator - Package Selection (Step 1)
 *
 * First step of the booking flow where guests select their base transformation package.
 *
 * Features:
 * - Display all available packages in a grid
 * - Radio button selection behavior
 * - Visual feedback for selected package
 * - "Next: Choose Duration" button (disabled until selection)
 * - Zustand store integration for state persistence
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import PackageSelector from '@/components/booking/package-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Select Your Package | The Pickleball Passport',
  description: 'Choose your transformation package and begin your journey.',
}

export default async function PackageSelectionPage() {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              1
            </span>
            Step 1 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your Transformation Package
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select the package that best aligns with your wellness and
            transformation goals.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Package Selection */}
          <div className="lg:col-span-2">
            <PackageSelector />
          </div>

          {/* Right Column: Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <PricingSummary />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                100%
              </div>
              <div className="text-sm text-slate-600">
                Money-Back Guarantee
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                12
              </div>
              <div className="text-sm text-slate-600">
                Guests Per Trip
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                24/7
              </div>
              <div className="text-sm text-slate-600">
                Concierge Support
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Can I customize my package later?</span>
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-slate-600">
                Absolutely! You&apos;ll be able to add wellness treatments,
                excursions, and customize your accommodation in the next steps.
                You can also modify your booking up to 30 days before departure.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What&apos;s included in the base package?</span>
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-slate-600">
                All packages include premier accommodation, daily pickleball
                sessions, wellness activities, group excursions, airport
                transfers, and 24/7 concierge support. Additional add-ons are
                customizable in the next steps.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Is my payment secure?</span>
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-slate-600">
                Yes! We use Stripe for secure payment processing with
                industry-standard encryption. Your payment information is never
                stored on our servers.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
