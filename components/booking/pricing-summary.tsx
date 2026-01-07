/**
 * Pricing Summary Component
 *
 * E3-S6: Real-Time Price Calculator
 *
 * Sticky sidebar component that displays real-time pricing breakdown
 * throughout the booking configurator flow.
 *
 * Features:
 * - Real-time price updates as user makes selections
 * - Breakdown by package, duration, accommodation, add-ons
 * - Savings calculation (Thailand vs US prices)
 * - Progress indicator showing current step
 * - Sticky positioning on larger screens
 * - Responsive design (bottom bar on mobile)
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { CheckCircle2, Clock, Home, Plus, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'

// Accommodation tier pricing for display
const ACCOMMODATION_TIER_NAMES = {
  LUXURY: 'Luxury (Four Seasons)',
  ULTRA_LUXURY: 'Ultra-Luxury (Aman)',
  VILLA: 'Private Villa',
}

const ACCOMMODATION_TIER_PRICING = {
  LUXURY: 0,
  ULTRA_LUXURY: 300000, // $3,000
  VILLA: 500000, // $5,000
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function PricingSummary() {
  const {
    selectedPackage,
    duration,
    accommodationTier,
    selectedAddOns,
    currentStep,
    referralDiscount,
    calculateSubtotal,
    calculateSavings,
    calculateTotal,
    isModificationMode,
    originalAddOns,
    calculatePriceDifference,
  } = useBookingStore()

  // Calculate prices
  const subtotal = useMemo(() => calculateSubtotal(), [
    selectedPackage,
    duration,
    accommodationTier,
    selectedAddOns,
  ])

  const savings = useMemo(() => calculateSavings(), [
    selectedPackage,
    duration,
    selectedAddOns,
  ])

  // Calculate individual components for breakdown
  const packagePrice = useMemo(() => {
    if (!selectedPackage) return 0
    const basePrice = selectedPackage.basePrice
    const durationMultiplier = duration ? duration / 14 : 1
    return Math.round(basePrice * durationMultiplier)
  }, [selectedPackage, duration])

  const accommodationPrice = useMemo(() => {
    if (!accommodationTier) return 0
    return ACCOMMODATION_TIER_PRICING[accommodationTier]
  }, [accommodationTier])

  const addOnsTotal = useMemo(() => {
    return selectedAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
  }, [selectedAddOns])

  // Modification mode calculations
  const originalAddOnsTotal = useMemo(() => {
    if (!isModificationMode) return 0
    return originalAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
  }, [isModificationMode, originalAddOns])

  const priceDifference = useMemo(() => {
    if (!isModificationMode) return 0
    return calculatePriceDifference()
  }, [isModificationMode, selectedAddOns, originalAddOns])

  // Progress steps
  const steps = [
    { number: 1, label: 'Package', icon: ShoppingCart, completed: !!selectedPackage },
    { number: 2, label: 'Duration', icon: Clock, completed: !!duration },
    { number: 3, label: 'Accommodation', icon: Home, completed: !!accommodationTier },
    { number: 4, label: 'Add-Ons', icon: Plus, completed: selectedAddOns.length > 0 },
  ]

  // If no package selected yet, show minimal state
  if (!selectedPackage) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Your Trip Summary
        </h3>
        <p className="text-sm text-slate-500">
          Select a package to see pricing details
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-1">Your Trip Summary</h3>
        <p className="text-sm text-emerald-50">Real-time pricing</p>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = step.completed

            return (
              <div
                key={step.number}
                className={`flex items-center gap-3 ${
                  isActive ? 'text-emerald-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {step.label}
                  {isCompleted && !isActive && ' ✓'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Price Breakdown
        </h4>

        {/* Package */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {selectedPackage.name}
              </p>
              {duration && (
                <p className="text-xs text-slate-500">{duration} days</p>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              {formatPrice(packagePrice)}
            </p>
          </div>
        </div>

        {/* Accommodation */}
        {accommodationTier && (
          <div className="flex items-start justify-between gap-2 border-t border-slate-100 pt-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {ACCOMMODATION_TIER_NAMES[accommodationTier]}
              </p>
              <p className="text-xs text-slate-500">Accommodation upgrade</p>
            </div>
            <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              {accommodationPrice === 0 ? (
                <span className="text-emerald-600">Included</span>
              ) : (
                `+${formatPrice(accommodationPrice)}`
              )}
            </p>
          </div>
        )}

        {/* Add-Ons */}
        {selectedAddOns.length > 0 && (
          <div className="border-t border-slate-100 pt-2 space-y-2">
            {selectedAddOns.map((addOn) => (
              <div key={addOn.id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {addOn.name}
                  </p>
                  <p className="text-xs text-slate-500">{addOn.category}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                  +{formatPrice(addOn.thPrice)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Subtotal */}
        {!isModificationMode ? (
          <div className="border-t-2 border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">Subtotal</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(subtotal)}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Modification Mode: Show Original vs New */}
            <div className="border-t-2 border-slate-200 pt-4 space-y-3">
              {/* Original Total */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Original Add-Ons Total</p>
                <p className="text-lg font-semibold text-slate-500 line-through">
                  {formatPrice(originalAddOnsTotal)}
                </p>
              </div>

              {/* New Total */}
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">New Add-Ons Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPrice(addOnsTotal)}
                </p>
              </div>

              {/* Price Difference */}
              <div className={`flex items-center justify-between rounded-lg border-2 p-3 ${
                priceDifference > 0
                  ? 'border-red-200 bg-red-50'
                  : priceDifference < 0
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <p className={`text-sm font-semibold ${
                  priceDifference > 0
                    ? 'text-red-900'
                    : priceDifference < 0
                    ? 'text-green-900'
                    : 'text-slate-900'
                }`}>
                  {priceDifference > 0 ? 'Price Increase' : priceDifference < 0 ? 'Price Decrease' : 'No Change'}
                </p>
                <p className={`text-xl font-bold ${
                  priceDifference > 0
                    ? 'text-red-700'
                    : priceDifference < 0
                    ? 'text-green-700'
                    : 'text-slate-700'
                }`}>
                  {priceDifference > 0 && '+'}
                  {formatPrice(Math.abs(priceDifference))}
                </p>
              </div>

              {/* Payment Adjustment Explanation */}
              {priceDifference !== 0 && (
                <div className="text-xs text-slate-600">
                  {priceDifference > 0 && (
                    <p>You will be charged the price increase</p>
                  )}
                  {priceDifference < 0 && (
                    <p>You will receive a refund (5-10 business days)</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Referral Discount */}
        {referralDiscount > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-sm font-medium text-emerald-700">Referral Discount</p>
            <p className="text-lg font-bold text-emerald-700">
              -{formatPrice(referralDiscount)}
            </p>
          </div>
        )}

        {/* Total (if referral applied) */}
        {referralDiscount > 0 && (
          <div className="border-t-2 border-slate-300 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-slate-900">Total</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatPrice(calculateTotal())}
              </p>
            </div>
          </div>
        )}

        {/* Savings */}
        {savings > 0 && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 mt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-emerald-900">
                You Save vs US Prices
              </p>
              <p className="text-lg font-bold text-emerald-700">
                {formatPrice(savings)}
              </p>
            </div>
            <p className="text-xs text-emerald-700">
              Estimated savings compared to similar services in the United States
            </p>
          </div>
        )}

        {/* What's Included Note */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>What's included:</strong> All accommodations, daily breakfast,
            pickleball training sessions, airport transfers, and basic medical
            consultations. Add-ons and specific procedures billed separately.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
        <p className="text-xs text-slate-600 text-center">
          Final price confirmed at checkout. All prices in USD.
        </p>
      </div>
    </div>
  )
}
