/**
 * Referral Code Input Component
 *
 * E3-S7: Booking Review Page
 * Epic 10 - US-003: Updated to support both partner and guest referral codes
 *
 * Allows users to enter and validate referral codes for discounts (partners)
 * or referral attribution (guests).
 * Client-side validation for UX; server-side validation happens during payment.
 *
 * Features:
 * - Input field with validation
 * - Loading state during validation
 * - Error/success feedback
 * - Discount display (for partner codes)
 * - Referral attribution display (for guest codes)
 * - Integration with booking store
 */

'use client'

import React, { useState } from 'react'
import { useBookingStore } from '@/lib/stores/booking-store'
import { trpc } from '@/lib/trpc/client'
import { AlertCircle, CheckCircle2, Loader2, Tag, Users } from 'lucide-react'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function ReferralCodeInput() {
  const {
    referralCode,
    referralDiscount,
    setReferralCode,
    setReferralDiscount,
    setReferralPartnerId,
    setReferralPartnerInfo,
  } = useBookingStore()

  const [inputValue, setInputValue] = useState(referralCode || '')
  const [shouldValidate, setShouldValidate] = useState(false)
  const [isValid, setIsValid] = useState(!!referralCode)
  // Track referral type for UI display
  const [referralType, setReferralType] = useState<'partner' | 'guest' | null>(null)
  const [guestReferrerName, setGuestReferrerName] = useState<string | null>(null)

  // tRPC query for validation - uses the new endpoint that validates both partner and guest codes
  const { data: validationResult, isLoading, error } = trpc.partner.validateAnyReferralCode.useQuery(
    { code: inputValue },
    {
      enabled: shouldValidate && inputValue.length >= 3,
      retry: false,
    }
  )

  // Handle validation results
  React.useEffect(() => {
    if (!shouldValidate || isLoading) return

    if (validationResult) {
      if (validationResult.isValid) {
        setReferralCode(inputValue.toUpperCase())
        setIsValid(true)

        if (validationResult.type === 'partner') {
          // Partner referral - set partner info for discount
          setReferralPartnerId(validationResult.partnerId!)
          setReferralPartnerInfo({
            partnerName: validationResult.partnerName!,
            clubName: validationResult.clubName!,
            clubLocation: validationResult.clubLocation!,
          })
          setReferralType('partner')
          setGuestReferrerName(null)
        } else if (validationResult.type === 'guest') {
          // Guest referral - no discount, just attribution
          setReferralPartnerId(null)
          setReferralPartnerInfo(null)
          setReferralType('guest')
          setGuestReferrerName(validationResult.referrerName || 'A Pickleball Friend')
        }
      } else {
        setIsValid(false)
        setReferralCode(null)
        setReferralPartnerId(null)
        setReferralPartnerInfo(null)
        setReferralType(null)
        setGuestReferrerName(null)
      }
      setShouldValidate(false)
    }

    if (error) {
      setIsValid(false)
      setReferralCode(null)
      setReferralPartnerId(null)
      setReferralPartnerInfo(null)
      setReferralType(null)
      setGuestReferrerName(null)
      setShouldValidate(false)
    }
  }, [validationResult, error, shouldValidate, isLoading, inputValue, setReferralCode, setReferralPartnerId, setReferralPartnerInfo])

  const handleApply = () => {
    const code = inputValue.trim().toUpperCase()

    if (!code) {
      return
    }

    // Accept two formats:
    // Partner codes: LOCATION-NAME-YEAR (e.g., VILLAGES-JEN-2025)
    // Guest codes: FIRSTNAME-YEAR (e.g., SUSAN-2026)
    const partnerCodePattern = /^[A-Z0-9]+-[A-Z0-9]+-\d{4}$/
    const guestCodePattern = /^[A-Z]+-\d{4}$/

    if (!partnerCodePattern.test(code) && !guestCodePattern.test(code)) {
      // Invalid format - don't call API
      return
    }

    // Trigger validation
    setShouldValidate(true)
  }

  const handleRemove = () => {
    setInputValue('')
    setReferralCode(null)
    setReferralDiscount(0)
    setReferralPartnerId(null)
    setReferralPartnerInfo(null)
    setReferralType(null)
    setGuestReferrerName(null)
    setIsValid(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  // Get error message from validation
  const validationError = error?.message || (!validationResult?.isValid && validationResult?.message)

  // Check format for client-side validation
  // Accept both partner (LOCATION-NAME-YEAR) and guest (FIRSTNAME-YEAR) formats
  const code = inputValue.trim().toUpperCase()
  const partnerCodePattern = /^[A-Z0-9]+-[A-Z0-9]+-\d{4}$/
  const guestCodePattern = /^[A-Z]+-\d{4}$/
  const hasInvalidFormat = inputValue.length > 0 && !partnerCodePattern.test(code) && !guestCodePattern.test(code)

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
            disabled={isLoading || !inputValue.trim() || hasInvalidFormat}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Apply referral code"
          >
            {isLoading ? (
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

      {/* Format Error Message */}
      {hasInvalidFormat && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3" role="alert">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              Invalid code format. Expected: LOCATION-NAME-YEAR or FIRSTNAME-YEAR
            </p>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && !hasInvalidFormat && (
        <div id="referral-code-error" className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3" role="alert">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{validationError}</p>
            <p className="text-xs text-red-700 mt-1">
              Check your code and try again, or contact the person who gave you the code.
            </p>
          </div>
        </div>
      )}

      {/* Success Message - Partner Referral */}
      {isValid && referralType === 'partner' && validationResult?.isValid && validationResult.type === 'partner' && (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3" role="status">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              Partner code applied! Referred by {validationResult.partnerName}
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              {validationResult.clubName}, {validationResult.clubLocation}
            </p>
          </div>
        </div>
      )}

      {/* Success Message - Guest Referral */}
      {isValid && referralType === 'guest' && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3" role="status">
          <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Referral code applied! Referred by {guestReferrerName}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Your friend will earn rewards when you complete your booking.
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!isValid && !validationError && !hasInvalidFormat && (
        <p className="text-xs text-slate-500">
          Have a referral code from a partner facility or a friend who traveled with us? Enter it here.
        </p>
      )}
    </div>
  )
}
