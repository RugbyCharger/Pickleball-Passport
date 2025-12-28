/**
 * Booking Configurator - Add-Ons Selection (Step 4)
 *
 * E3-S4: Medical/Cosmetic Add-Ons
 *
 * Allows guests to customize their package with:
 * - Dental procedures (veneers, whitening, implants)
 * - Facial cosmetic treatments (botox, fillers, facelifts)
 * - Body procedures (liposuction, tummy tucks, etc.)
 * - Health screenings (comprehensive health checks)
 *
 * Features:
 * - Category filtering (Dental, Facial, Body, Health)
 * - Multi-select with checkboxes
 * - Real-time pricing with Thailand vs US comparison
 * - Savings calculator showing 40-70% savings
 * - Skip option for Pure Play packages
 * - State persistence via Zustand + localStorage
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import MedicalAddOnsSelector from '@/components/booking/medical-add-ons-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Medical Add-Ons | Pickleball Passport',
  description:
    'Customize your transformation package with medical and cosmetic procedures at Thai prices.',
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
            Customize Your Transformation
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Add medical and cosmetic procedures to your package. All procedures
            are optional and performed at JCI-accredited hospitals.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Add-Ons Selection */}
          <div className="lg:col-span-2">
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
                <span>Are the medical procedures safe?</span>
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
                Yes! All medical procedures are performed at JCI-accredited
                hospitals (the international gold standard) by board-certified
                specialists. Thailand's medical tourism industry is world-class
                and serves hundreds of thousands of international patients
                annually.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Why are the prices so much lower than the US?</span>
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
                Lower operating costs, favorable exchange rates, and government
                support for medical tourism allow Thai hospitals to offer
                world-class care at 40-70% savings compared to US prices. The
                quality is identical or better - many Thai surgeons trained in
                the US and Europe.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Can I add procedures after booking?</span>
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
                departure. Many guests add procedures after consulting with our
                medical team or after arrival. However, booking in advance
                ensures availability and better scheduling.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>What if I don't want any medical procedures?</span>
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
                No problem! Our "Pure Play" package is perfect for guests who
                just want pickleball, wellness, and relaxation without medical
                procedures. Simply click "Skip Medical Add-Ons" above to
                continue without adding any procedures.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>How long is the recovery time?</span>
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
                Recovery time varies by procedure. Dental work (veneers,
                crowns) typically allows you to resume activities the next day.
                Cosmetic procedures range from 3-14 days depending on
                complexity. Our medical team will provide detailed recovery
                guidelines and our on-site concierge ensures you're comfortable
                throughout.
              </p>
            </details>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                JCI
              </div>
              <div className="text-sm text-slate-600">
                Accredited Hospitals
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                40-70%
              </div>
              <div className="text-sm text-slate-600">
                Savings vs US Prices
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-emerald-600">
                24/7
              </div>
              <div className="text-sm text-slate-600">
                Medical Concierge Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
