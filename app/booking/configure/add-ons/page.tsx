/**
 * Booking Configurator - Add-Ons Selection (Step 4)
 *
 * E3-S4: Activity & Wellness Add-Ons
 *
 * Allows guests to customize their package with:
 * - Wellness treatments (spa, massage, yoga)
 * - Extra pickleball coaching sessions
 * - Cultural excursions and experiences
 * - Health & fitness activities
 *
 * Features:
 * - Category filtering
 * - Multi-select with checkboxes
 * - Real-time pricing
 * - Skip option for base packages
 * - State persistence via Zustand + localStorage
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import MedicalAddOnsSelector from '@/components/booking/medical-add-ons-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'
import { GiftSection } from '@/components/booking/gift-section'

export const metadata: Metadata = {
  title: 'Trip Add-Ons | The Pickleball Passport',
  description:
    'Customize your trip with wellness treatments, extra coaching, excursions, and more.',
}

export default async function AddOnsSelectionPage() {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/add-ons')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              4
            </span>
            Step 4 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Customize Your Trip
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Add wellness treatments, extra coaching, excursions, and more to your
            package. All add-ons are optional.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Gift Options + Add-Ons Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gift Booking Section */}
            <GiftSection />

            {/* Medical Add-Ons Section */}
            <MedicalAddOnsSelector />
          </div>

          {/* Right Column: Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <PricingSummary />
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
                <span>Can I add extras after booking?</span>
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
                Yes! You can modify your booking up to 30 days before
                departure. Many guests add extras after speaking with our
                team. However, booking in advance ensures availability and
                better scheduling.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What if I don&apos;t want any add-ons?</span>
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
                No problem! The base package already includes daily pickleball,
                premier accommodation, and group activities. Simply click
                &quot;Skip Add-Ons&quot; above to continue without adding any extras.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What types of add-ons are available?</span>
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
                We offer spa and wellness treatments, private pickleball
                coaching sessions, cultural excursions, island day trips,
                cooking classes, and more. Browse the options above to see
                what is available for your trip.
              </p>
            </details>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-3">
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
                100%
              </div>
              <div className="text-sm text-slate-600">
                Customizable Experience
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
      </div>
    </div>
  )
}
