/**
 * Booking Configurator - Accommodation Tier Selection (Step 3)
 *
 * E3-S3: Accommodation Tier Story Implementation
 *
 * Allows users to select their luxury accommodation tier:
 * - Luxury (Four Seasons) - Baseline (+$0)
 * - Ultra-Luxury (Aman) - Premium (+$3,000)
 * - Villa (Private Villa) - Ultimate (+$5,000)
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { AccommodationSelector } from '@/components/booking/accommodation-selector'
import { PricingSummary } from '@/components/booking/pricing-summary'

export const metadata: Metadata = {
  title: 'Select Accommodation | Pickleball Passport',
  description: 'Choose your luxury accommodation tier for your Thailand adventure.',
}

export default async function AccommodationSelectionPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/configure/accommodation')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              3
            </span>
            Step 3 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your Accommodation
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Select the luxury tier that matches your style. From world-class
            resorts to private beachfront villas, we offer experiences tailored
            to your preferences.
          </p>
        </div>

        {/* Main Content Grid with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Accommodation Selection */}
          <div className="lg:col-span-2">
            <AccommodationSelector />
          </div>

          {/* Right Column: Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <PricingSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
