/**
 * Booking Configurator - Duration Selection (Step 2)
 *
 * Second step of the booking flow where guests select trip duration.
 *
 * Features:
 * - Duration options: 7, 10, 14, 21 days
 * - Dynamic price calculation based on selected duration
 * - Sample itinerary preview for each duration
 * - Back/Next navigation
 * - Zustand store integration
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import DurationSelector from '@/components/booking/duration-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Select Duration | Pickleball Passport',
  description: 'Choose the duration of your transformation journey.',
}

export default async function DurationSelectionPage() {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/duration')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              2
            </span>
            Step 2 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your Duration
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Select how many days you'd like to stay for your transformation
            journey.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Duration Selection */}
          <div className="lg:col-span-2">
            <DurationSelector />
          </div>

          {/* Right Column: Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <PricingSummary />
            </div>
          </div>
        </div>

        {/* Why Duration Matters */}
        <div className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">
            Why Duration Matters
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-3 text-3xl">⏱️</div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Recovery Time
              </h3>
              <p className="text-sm text-slate-600">
                Longer stays allow for optimal healing and recovery from medical
                procedures, ensuring the best results.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-3 text-3xl">🏐</div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Pickleball Progress
              </h3>
              <p className="text-sm text-slate-600">
                Extended programs include advanced training, tournaments, and
                skill development with professional coaches.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-3 text-3xl">🌴</div>
              <h3 className="mb-2 font-semibold text-slate-900">
                Cultural Immersion
              </h3>
              <p className="text-sm text-slate-600">
                More time means deeper cultural experiences, excursions, and
                connections with fellow travelers.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Note */}
        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            💡 Pricing Information
          </h3>
          <p className="text-sm text-blue-700">
            Our pricing scales with duration to reflect the comprehensive care
            and activities included. The 14-day package is our baseline, with
            shorter trips optimized for efficiency and longer trips offering
            extended benefits. All medical procedures, accommodations, and
            activities are included in the price.
          </p>
        </div>
      </div>
    </div>
  )
}
