/**
 * Payment Form Component
 *
 * E4-S3: Payment Form UI
 *
 * Stripe Elements payment form with card input and processing.
 * Handles payment submission, validation, and success/error states.
 *
 * Features:
 * - Stripe CardElement for secure card input
 * - Real-time validation
 * - Loading states during payment
 * - Error handling with user feedback
 * - Success redirect to confirmation page
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { AlertCircle, CreditCard, Loader2, Lock } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/booking-store'

interface PaymentFormProps {
  bookingReference: string
  amount: number // in cents
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function PaymentForm({ bookingReference, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { reset: resetBooking } = useBookingStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm the payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation?booking=${bookingReference}`,
        },
      })

      if (error) {
        // This point will only be reached if there's an immediate error when
        // confirming the payment. Otherwise, the customer will be redirected
        setErrorMessage(error.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
      } else {
        // Payment succeeded - user will be redirected to return_url
        // Clear booking state
        resetBooking()
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900">Payment Information</h3>
        </div>

        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Payment Error</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900">Secure Payment</p>
            <p className="text-xs text-emerald-700 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
              All transactions are processed through Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Amount</p>
            <p className="text-xs text-slate-500 mt-1">Booking: {bookingReference}</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatPrice(amount)}</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isProcessing}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Review
        </button>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Payment...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Pay {formatPrice(amount)}
            </span>
          )}
        </button>
      </div>

      {/* Payment Info */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          By completing this purchase, you agree to our{' '}
          <a href="/terms" className="text-emerald-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-emerald-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </form>
  )
}
