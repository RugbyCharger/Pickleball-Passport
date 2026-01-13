/**
 * Payment Form Component
 *
 * E4-S3: Payment Form UI
 * E4-S5: Payment Failure Handling
 *
 * Stripe Elements payment form with card input and processing.
 * Handles payment submission, validation, and success/error states.
 *
 * Features:
 * - Stripe CardElement for secure card input
 * - Real-time validation
 * - Loading states during payment
 * - Enhanced error handling with categorization
 * - Retry functionality with state preservation
 * - User-friendly error messages
 * - Alternative payment suggestions
 * - Error logging for support
 * - Success redirect to confirmation page
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { StripeError } from '@stripe/stripe-js'
import { AlertCircle, CreditCard, Loader2, Lock, RefreshCw, Info, Calendar } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/booking-store'
import {
  categorizePaymentError,
  logPaymentError,
  getAlternativePaymentSuggestions,
  type PaymentErrorInfo,
} from '@/lib/stripe/payment-errors'

interface InstallmentScheduleItem {
  number: number
  amount: number
  dueDate: Date
  percentage: string
}

interface PaymentFormProps {
  bookingReference: string
  amount: number // in cents - amount being charged now
  totalAmount: number // in cents - total booking amount
  paymentPlan: 'FULL' | 'INSTALLMENT_4' | 'FINANCING'
  installmentSchedule: InstallmentScheduleItem[]
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function PaymentForm({
  bookingReference,
  amount,
  totalAmount,
  paymentPlan,
  installmentSchedule,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { reset: resetBooking } = useBookingStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [errorInfo, setErrorInfo] = useState<PaymentErrorInfo | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setErrorInfo(null)

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

        // Categorize and log the error
        const categorizedError = categorizePaymentError(error as StripeError)
        setErrorInfo(categorizedError)

        // Log error for support debugging
        logPaymentError(error as StripeError, {
          bookingReference,
          amount,
          timestamp: new Date(),
        })

        // Increment retry count
        setRetryCount((prev) => prev + 1)

        // Don't reset booking state - preserve for retry
        setIsProcessing(false)
      } else {
        // Payment succeeded - user will be redirected to return_url
        // Only clear booking state on success
        resetBooking()
      }
    } catch (err) {
      // Handle unexpected errors
      const unexpectedError = categorizePaymentError(null)
      setErrorInfo(unexpectedError)

      logPaymentError(null, {
        bookingReference,
        amount,
        timestamp: new Date(),
      })

      setRetryCount((prev) => prev + 1)
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    // Clear error and allow user to try again
    setErrorInfo(null)
    // Don't increment retry count here - only on actual failures
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
      {errorInfo && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-red-900">{errorInfo.title}</p>
                <p className="text-sm text-red-700 mt-1">{errorInfo.message}</p>
              </div>

              {/* Alternative payment suggestions */}
              {errorInfo.suggestAlternative && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-red-800">What you can try:</p>
                  <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                    {getAlternativePaymentSuggestions(errorInfo).map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Retry button */}
              {errorInfo.canRetry && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try Again
                  </button>
                  {retryCount > 2 && (
                    <a
                      href="mailto:support@pickleballpassport.com"
                      className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      Contact Support
                    </a>
                  )}
                </div>
              )}

              {/* Retry count warning */}
              {retryCount > 1 && (
                <div className="flex items-start gap-2 pt-2 border-t border-red-200">
                  <Info className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    {retryCount === 2
                      ? 'If this problem continues, please contact our support team.'
                      : 'Multiple payment attempts detected. Our support team can help if needed.'}
                  </p>
                </div>
              )}
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
            {paymentPlan === 'INSTALLMENT_4' && (
              <p className="text-xs text-emerald-700 mt-2">
                <strong>Installment Plan:</strong> Your payment method will be securely saved for automatic charges
                on future installment due dates. You can manage your payment method anytime from your dashboard.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Installment Plan Info */}
      {paymentPlan === 'INSTALLMENT_4' && installmentSchedule.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-900">4-Payment Installment Plan</h3>
            <p className="text-sm text-blue-700 mt-1">
              Pay {formatPrice(amount)} today, then 3 more automatic payments
            </p>
          </div>

          <div className="space-y-2">
            {installmentSchedule.map((installment) => (
              <div
                key={installment.number}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  installment.number === 1
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-white border border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {installment.number}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {installment.number === 1 ? 'Due Today' : `Due ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(installment.dueDate)}`}
                    </p>
                    <p className="text-xs text-slate-600">{installment.percentage} of total</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatPrice(installment.amount)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">Total Booking Amount</p>
              <p className="text-xl font-bold text-blue-900">{formatPrice(totalAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Amount */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              {paymentPlan === 'INSTALLMENT_4' ? 'Due Today (First Installment)' : 'Total Amount'}
            </p>
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
              {paymentPlan === 'INSTALLMENT_4'
                ? `Pay First Installment ${formatPrice(amount)}`
                : `Pay ${formatPrice(amount)}`}
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
