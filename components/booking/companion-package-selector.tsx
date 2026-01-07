'use client'

import { useEffect } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/booking-store'

export function CompanionPackageSelector() {
  const selectedPackage = useBookingStore((state) => state.selectedPackage)
  const duration = useBookingStore((state) => state.duration)
  const companionPackage = useBookingStore((state) => state.companionPackage)
  const setCompanionPackage = useBookingStore((state) => state.setCompanionPackage)

  // Format price for display
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  // Calculate companion package price
  const calculatePackagePrice = (baseDuration: number = 14) => {
    if (!selectedPackage || !duration) return 0
    return Math.round(selectedPackage.basePrice * (baseDuration / 14))
  }

  // Default to "Same Package" on mount
  useEffect(() => {
    if (!companionPackage && selectedPackage && duration) {
      setCompanionPackage({
        packageId: selectedPackage.id,
        sameAsPrimary: true,
        duration: duration,
      })
    }
  }, [companionPackage, selectedPackage, duration, setCompanionPackage])

  const handlePackageOptionChange = (value: string) => {
    if (!selectedPackage || !duration) return

    const sameAsPrimary = value === 'same'

    setCompanionPackage({
      packageId: selectedPackage.id,
      sameAsPrimary,
      duration: sameAsPrimary ? duration : duration,
    })
  }

  if (!selectedPackage || !duration) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">
              Primary booking incomplete
            </p>
            <p className="mt-1 text-sm text-yellow-700">
              Please select a package and duration for the primary guest first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Companion Package Selection
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Choose the same package or select a different one for your travel companion
        </p>
      </div>

      <div className="space-y-3">
        {/* Same Package Option */}
        <button
          type="button"
          onClick={() => handlePackageOptionChange('same')}
          className={`relative w-full flex items-start space-x-3 rounded-lg border-2 p-4 text-left transition-colors ${
            companionPackage?.sameAsPrimary
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
            companionPackage?.sameAsPrimary
              ? 'border-blue-500 bg-blue-500'
              : 'border-slate-300 bg-white'
          }`}>
            {companionPackage?.sameAsPrimary && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Same Package (Recommended)
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedPackage.name} • {duration} days
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {formatPrice(calculatePackagePrice(duration))}
            </p>
          </div>
        </button>

        {/* Different Package Option */}
        <button
          type="button"
          onClick={() => handlePackageOptionChange('different')}
          className={`relative w-full flex items-start space-x-3 rounded-lg border-2 p-4 text-left transition-colors ${
            companionPackage?.sameAsPrimary === false
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
            companionPackage?.sameAsPrimary === false
              ? 'border-blue-500 bg-blue-500'
              : 'border-slate-300 bg-white'
          }`}>
            {companionPackage?.sameAsPrimary === false && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Different Package
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Choose a different package for your companion
            </p>
            {companionPackage?.sameAsPrimary === false && (
              <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                <p className="flex items-start gap-2 text-xs text-yellow-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>Note:</strong> Different package durations may require separate travel arrangements.
                    Full package selector will be available in the next update.
                  </span>
                </p>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Package Summary */}
      <div className="rounded-md bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Companion Package
            </p>
            <p className="text-sm text-slate-600">
              {selectedPackage.name} • {companionPackage?.duration || duration} days
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {formatPrice(calculatePackagePrice(companionPackage?.duration || duration))}
          </p>
        </div>
      </div>
    </div>
  )
}
