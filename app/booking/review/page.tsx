/**
 * Booking Review Page
 *
 * E3-S7: Booking Review Page Story Implementation
 *
 * Final review step before payment. Allows users to:
 * - Review all booking selections
 * - Apply optional referral codes
 * - See detailed price breakdown
 * - Edit any section before proceeding
 * - Navigate to payment
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { BookingSummary } from '@/components/booking/booking-summary'
import { CompanionBookingSummary } from '@/components/booking/companion-booking-summary'
import { PricingSummary } from '@/components/booking/pricing-summary'
import { ReferralCodeInput } from '@/components/booking/referral-code-input'
import { ReviewPageClient } from './review-client'

export const metadata: Metadata = {
  title: 'Review Your Booking | Pickleball Passport',
  description: 'Review your booking details before proceeding to payment.',
}

export default async function BookingReviewPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/booking/review')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              5
            </span>
            Step 5 of 5
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Review Your Booking
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Almost there! Review your selections and apply any referral codes before proceeding to payment.
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Booking Details */}
            <BookingSummary />

            {/* Companion Booking Details */}
            <CompanionBookingSummary />

            {/* Referral Code */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
              <ReferralCodeInput />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <ReviewPageClient />
            </div>

            {/* Important Notes */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-sm font-bold text-amber-900 mb-3">Before You Continue</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    <strong>Non-refundable deposit:</strong> A 30% deposit is required to secure your booking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    <strong>Payment plans available:</strong> Split your payment into installments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    <strong>Medical consultation required:</strong> We&apos;ll schedule a video consultation after booking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>
                    <strong>Trip dates:</strong> You&apos;ll select specific dates after payment confirmation
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Pricing Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PricingSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
