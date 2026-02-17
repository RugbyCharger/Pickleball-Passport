/**
 * Booking Configurator - Wellness Add-Ons Selection (Step 5)
 *
 * E3-S5: Wellness & Cultural Add-Ons
 *
 * Allows guests to enhance their package with:
 * - Spa & wellness treatments (Thai massage, luxury spa days)
 * - Yoga & meditation sessions (daily classes, private sessions)
 * - Cultural experiences (temple tours, cooking classes, island tours)
 * - Pickleball training (private coaching, group clinics, tournaments)
 *
 * Features:
 * - Category filtering (Spa, Yoga, Cultural, Pickleball)
 * - Multi-select with checkboxes
 * - Real-time pricing with Thailand vs US comparison
 * - Savings calculator showing 40-70% savings
 * - Skip option (wellness is truly optional)
 * - State persistence via Zustand + localStorage
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import WellnessAddOnsSelector from '@/components/booking/wellness-add-ons-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Wellness Add-Ons | The Pickleball Passport',
  description:
    'Enhance your transformation with wellness treatments and cultural experiences.',
}

export default async function WellnessAddOnsPage() {
  // Protected route - require authentication
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/wellness')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            Step 5 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Enhance Your Experience
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Add wellness treatments and cultural activities to create a complete
            mind-body-spirit transformation. All experiences are optional.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Add-Ons Selection */}
          <div className="lg:col-span-2">
            <WellnessAddOnsSelector />
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
                <span>What wellness activities are included?</span>
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
                Choose from traditional Thai massage packages, luxury spa
                treatments, daily yoga and meditation classes, authentic
                cultural experiences like temple tours and cooking classes, and
                enhanced pickleball training with certified instructors. All
                activities are designed to complement your transformation
                journey.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Are the instructors and guides certified?</span>
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
                Yes! All yoga instructors are certified by international yoga
                alliances, massage therapists are licensed by Thai traditional
                medicine boards, cultural guides are licensed tour operators,
                and pickleball coaches hold professional certifications. We
                partner only with top-rated, verified providers.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Can I book wellness activities after arrival?</span>
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
                Absolutely! Many guests prefer to book wellness activities after
                arrival to see how they feel. Our concierge can arrange
                same-day or next-day bookings for most activities. However,
                booking in advance ensures availability, especially during peak
                season, and may offer better pricing.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What if I skip wellness add-ons?</span>
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
                No problem at all! Wellness and cultural add-ons are completely
                optional. Your base package already includes amazing
                accommodations, meals, and pickleball activities. These add-ons
                simply enhance your experience if you want a more comprehensive
                transformation journey.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>How do cultural experiences work?</span>
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
                Cultural experiences are led by local guides who are passionate
                about sharing Thai culture. Temple tours include monk blessings
                and meditation instruction, cooking classes use fresh market
                ingredients, and island tours showcase Phuket's natural beauty.
                All experiences are respectful, authentic, and designed for
                international guests.
              </p>
            </details>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                Certified
              </div>
              <div className="text-sm text-slate-600">
                Licensed Instructors & Guides
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                Authentic
              </div>
              <div className="text-sm text-slate-600">
                Traditional Thai Experiences
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                Flexible
              </div>
              <div className="text-sm text-slate-600">
                Book Now or On Arrival
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
