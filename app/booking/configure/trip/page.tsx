/**
 * Booking Configurator - Trip Selection (Step 6)
 *
 * E3-S8: Trip Selection - Choose Departure Date
 *
 * Allows guests to select their preferred trip departure date:
 * - View all available upcoming trips
 * - See trip dates, duration, and availability
 * - Select departure date (radio button - single selection)
 * - View capacity and spots remaining
 * - Fully booked trips show waitlist option
 *
 * Features:
 * - Radio selection (only one trip can be selected)
 * - Real-time availability indicators
 * - Fully booked state with waitlist CTA
 * - Loading and error states
 * - State persistence via Zustand + localStorage
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import TripSelector from '@/components/booking/trip-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Choose Departure Date | Pickleball Passport',
  description: 'Select your transformation journey departure date to Thailand.',
}

export default async function TripSelectionPage() {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/trip')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              6
            </span>
            Step 6 of 6
          </div>
          <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your Departure Date
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select from our upcoming transformation journeys to Thailand
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Trip Selection */}
          <div className="lg:col-span-2">
            <TripSelector />
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
          <h2 className="mb-6 text-center text-2xl font-serif font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What if my preferred dates aren't available?</span>
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
                We add new trip dates regularly! If you don't see dates that work for you,
                join our waitlist or contact us to discuss custom departure options. We often
                schedule additional trips based on demand.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Can I change my departure date after booking?</span>
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
                Yes, you can request to reschedule your trip up to 60 days before departure,
                subject to availability on your new preferred dates. Changes made within 60 days
                may incur rescheduling fees. Contact us to discuss your options.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What's included in the trip dates?</span>
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
                Your trip includes accommodations for the full duration, all meals,
                daily pickleball sessions, airport transfers, and access to resort amenities.
                The start date is when you arrive in Thailand, and the end date is when you depart.
                Medical procedures and add-ons are scheduled throughout your stay based on
                recovery timelines.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>How many people will be on my trip?</span>
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
                We limit each trip to a maximum of 12 guests to ensure personalized attention,
                quality medical care, and an intimate group experience. This allows our team to
                focus on each guest's transformation journey while fostering meaningful
                connections with fellow travelers.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>When should I arrive and depart?</span>
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
                Plan to arrive on the trip start date and depart on the end date. We provide
                airport transfers for guests arriving/departing on these dates. If you want to
                arrive early or extend your stay, we can arrange additional accommodations and
                transfers at an extra cost. Many guests choose to explore Thailand before or
                after their transformation journey.
              </p>
            </details>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                12 Guests
              </div>
              <div className="text-sm text-slate-600">
                Maximum Group Size
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                Flexible
              </div>
              <div className="text-sm text-slate-600">
                Reschedule Up to 60 Days
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                All-Inclusive
              </div>
              <div className="text-sm text-slate-600">
                Lodging, Meals & Activities
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
