/**
 * Review Page Client Component
 *
 * Handles client-side navigation and validation for the review page.
 * Separated from the server component to use client-side hooks.
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { AlertCircle, ArrowLeft, Check, CreditCard, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

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
  const {
    isReadyForReview,
    hasCompanion,
    calculateTotal,
    calculateCompanionSubtotal,
    isGift,
    giftRecipient,
    validateGiftBooking,
  } = useBookingStore()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [giftValidationErrors, setGiftValidationErrors] = useState<string[]>([])

  // Validate gift booking data
  const giftValidation = useMemo(() => {
    if (!isGift) return { isValid: true, errors: [] }
    return validateGiftBooking()
  }, [isGift, validateGiftBooking])

  // Update validation errors when gift validation changes
  useEffect(() => {
    setGiftValidationErrors(giftValidation.errors)
  }, [giftValidation])

  // Determine readiness once per render; redirect if not ready (base validation only)
  const isBaseReady = useMemo(() => isReadyForReview(), [isReadyForReview])

  // Full proceed check includes gift validation
  const canProceed = useMemo(() => {
    if (!isBaseReady) return false
    if (isGift && !giftValidation.isValid) return false
    return true
  }, [isBaseReady, isGift, giftValidation])

  useEffect(() => {
    // Redirect to configure if base requirements not met (but allow gift validation errors)
    if (!isBaseReady) {
      router.push('/booking/configure')
    }
  }, [isBaseReady, router])

  const handleBack = () => {
    router.push('/booking/configure/accommodation')
  }

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      return
    }

    if (isGift) {
      const validation = validateGiftBooking()
      if (!validation.isValid) {
        setGiftValidationErrors(validation.errors)
        return
      }
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
      {/* Gift Validation Errors */}
      {isGift && giftValidationErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">
                Please complete gift recipient information
              </p>
              <ul className="text-xs text-red-700 mt-2 space-y-1">
                {giftValidationErrors.map((error, index) => (
                  <li key={index}>- {error}</li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/booking/configure/add-ons')}
                className="mt-3 text-xs font-semibold text-red-700 hover:text-red-800 underline"
              >
                Go back to complete gift details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Booking Confirmation */}
      {isGift && giftRecipient && giftValidationErrors.length === 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white flex-shrink-0">
              <Gift className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                Gift for {giftRecipient.firstName} {giftRecipient.lastName}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Will be sent to {giftRecipient.email}
              </p>
            </div>
          </div>
        </div>
      )}

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
                : isGift
                ? 'I confirm this gift purchase and agree to the terms and conditions'
                : 'I agree to the terms and conditions'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {hasCompanion ? (
                <>
                  By proceeding, you are confirming both your booking and your companion&apos;s booking.
                  You will be charged the combined total of {formatPrice(grandTotal)}.
                </>
              ) : isGift ? (
                <>
                  By proceeding, you are purchasing this trip as a gift. The recipient will receive
                  an email to accept and complete the booking. You will be charged {formatPrice(primaryTotal)}.
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
            : isGift
            ? `Purchase Gift - ${formatPrice(primaryTotal)}`
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
