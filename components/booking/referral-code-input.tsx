/**
 * Referral Code Input Component
 *
 * E3-S7: Booking Review Page
 *
 * Allows users to enter and validate partner referral codes for discounts.
 * Client-side validation for UX; server-side validation happens during payment.
 *
 * Features:
 * - Input field with validation
 * - Loading state during validation
 * - Error/success feedback
 * - Discount display
 * - Integration with booking store
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { trpc } from '@/lib/trpc/client'
import { AlertCircle, CheckCircle2, Loader2, Tag } from 'lucide-react'
import { useState } from 'react'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function ReferralCodeInput() {
  const { referralCode, referralDiscount, setReferralCode, setReferralDiscount, calculateSubtotal } =
    useBookingStore()

  const [inputValue, setInputValue] = useState(referralCode || '')
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(!!referralCode)

  const handleApply = async () => {
    const code = inputValue.trim().toUpperCase()

    if (!code) {
      setValidationError('Please enter a referral code')
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      // Simulate validation - in a real implementation, this would call the backend
      // For now, we'll do basic format validation and calculate discount
      // The actual validation will happen server-side in createPaymentIntent

      // Basic format check: CODE-NAME-YEAR pattern
      const codePattern = /^[A-Z0-9]+-[A-Z0-9]+-\d{4}$/
      if (!codePattern.test(code)) {
        setValidationError('Invalid code format. Expected format: LOCATION-NAME-YEAR')
        setIsValid(false)
        setReferralCode(null)
        setReferralDiscount(0)
        return
      }

      // For demo purposes, calculate a 5% discount
      // In production, this would come from the backend based on partner tier
      const subtotal = calculateSubtotal()
      const discount = Math.round(subtotal * 0.05) // 5% discount

      setReferralCode(code)
      setReferralDiscount(discount)
      setIsValid(true)
      setValidationError(null)
    } catch (error) {
      setValidationError('Failed to validate code. Please try again.')
      setIsValid(false)
      setReferralCode(null)
      setReferralDiscount(0)
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = () => {
    setInputValue('')
    setReferralCode(null)
    setReferralDiscount(0)
    setIsValid(false)
    setValidationError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-slate-600" />
        <label htmlFor="referral-code" className="text-sm font-semibold text-slate-900">
          Referral Code (Optional)
        </label>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            id="referral-code"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="e.g., VILLAGES-JEN-2025"
            disabled={isValid}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium uppercase transition-colors ${
              isValid
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : validationError
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
                : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {!isValid ? (
          <button
            onClick={handleApply}
            disabled={isValidating || !inputValue.trim()}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </span>
            ) : (
              'Apply'
            )}
          </button>
        ) : (
          <button
            onClick={handleRemove}
            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Remove
          </button>
        )}
      </div>

      {/* Validation Messages */}
      {validationError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{validationError}</p>
            <p className="text-xs text-red-700 mt-1">
              Referral codes are provided by our partner facilities. Contact your partner for a valid code.
            </p>
          </div>
        </div>
      )}

      {isValid && referralDiscount > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              Code applied! You save {formatPrice(referralDiscount)}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Your discount will be applied at checkout.
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!isValid && !validationError && (
        <p className="text-xs text-slate-500">
          Have a referral code from one of our partner facilities? Enter it here to receive a discount.
        </p>
      )}
    </div>
  )
}
