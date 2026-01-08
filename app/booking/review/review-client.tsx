/**
 * Review Page Client Component
 *
 * Handles client-side navigation and validation for the review page.
 * Separated from the server component to use client-side hooks.
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { ArrowLeft, Check, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function ReviewPageClient() {
  const router = useRouter()
  const { isReadyForReview, hasCompanion, calculateTotal, calculateCompanionSubtotal } = useBookingStore()
  const [canProceed, setCanProceed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  useEffect(() => {
    // Check if all required selections are made
    const ready = isReadyForReview()
    setCanProceed(ready)

    // Redirect to configure if not ready
    if (!ready) {
      router.push('/booking/configure')
    }
  }, [isReadyForReview, router])

  const handleBack = () => {
    router.push('/booking/configure/accommodation')
  }

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      return
    }
    router.push('/booking/payment')
  }

  // Calculate totals
  const primaryTotal = calculateTotal()
  const companionTotal = hasCompanion ? calculateCompanionSubtotal() : 0
  const grandTotal = primaryTotal + companionTotal
  const bookingCount = hasCompanion ? 2 : 1

  return (
    <div className="space-y-6 w-full">
      {/* Terms & Conditions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
          <label htmlFor="terms" className="flex-1 cursor-pointer">
            <p className="text-sm font-semibold text-slate-900">
              {hasCompanion
                ? 'I confirm both bookings and agree to the terms and conditions'
                : 'I agree to the terms and conditions'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {hasCompanion ? (
                <>
                  By proceeding, you are confirming both your booking and your companion&apos;s booking.
                  You will be charged the combined total of {formatPrice(grandTotal)}.
                </>
              ) : (
                'By proceeding, you agree to our booking policy, cancellation terms, and payment terms.'
              )}
            </p>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Accommodation
        </button>

        <button
          onClick={handleProceedToPayment}
          disabled={!canProceed || !termsAccepted}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <CreditCard className="h-5 w-5" />
          {hasCompanion
            ? `Pay ${formatPrice(grandTotal)} for ${bookingCount} Bookings`
            : 'Proceed to Payment'}
        </button>
      </div>

      {hasCompanion && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-blue-900">Companion Booking Payment</p>
              <p className="text-blue-700 mt-1">
                You&apos;re booking for 2 guests. A single payment of {formatPrice(grandTotal)} will be processed
                for both your booking ({formatPrice(primaryTotal)}) and your companion&apos;s booking ({formatPrice(companionTotal)}).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
