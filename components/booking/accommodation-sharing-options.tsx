'use client'

import { useEffect } from 'react'
import { Home, Users, Check, AlertCircle } from 'lucide-react'
import { useBookingStore, type AccommodationTier } from '@/lib/stores/booking-store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AccommodationSharingOptions() {
  const accommodationTier = useBookingStore((state) => state.accommodationTier)
  const duration = useBookingStore((state) => state.duration)
  const companionPackage = useBookingStore((state) => state.companionPackage)
  const companionAccommodation = useBookingStore((state) => state.companionAccommodation)
  const setCompanionAccommodation = useBookingStore((state) => state.setCompanionAccommodation)

  // Accommodation tier pricing
  const ACCOMMODATION_TIER_PRICING: Record<AccommodationTier, number> = {
    LUXURY: 0,
    ULTRA_LUXURY: 300000,
    VILLA: 500000,
  }

  const TIER_LABELS: Record<AccommodationTier, string> = {
    LUXURY: 'Luxury',
    ULTRA_LUXURY: 'Ultra-Luxury',
    VILLA: 'Private Villa',
  }

  // Check if shared accommodation is allowed
  const canShareAccommodation = () => {
    if (!accommodationTier || !duration || !companionPackage) return false
    // Same duration and same tier required for sharing
    return duration === companionPackage.duration
  }

  const isSharedDisabled = !canShareAccommodation()

  // Default to shared room if allowed
  useEffect(() => {
    if (!companionAccommodation && accommodationTier) {
      setCompanionAccommodation({
        shared: canShareAccommodation(),
        tier: accommodationTier,
      })
    }
  }, [companionAccommodation, accommodationTier, setCompanionAccommodation])

  const handleOptionChange = (shared: boolean) => {
    if (!accommodationTier) return

    setCompanionAccommodation({
      shared,
      tier: accommodationTier,
    })
  }

  // Format price for display
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  if (!accommodationTier || !companionPackage) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">
              Configuration incomplete
            </p>
            <p className="mt-1 text-sm text-yellow-700">
              Please complete accommodation and package selections first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const accommodationPrice = ACCOMMODATION_TIER_PRICING[accommodationTier]

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Accommodation Sharing
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Choose whether to share a room or have separate accommodations
        </p>
      </div>

      <div className="space-y-3">
        {/* Shared Room Option */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => !isSharedDisabled && handleOptionChange(true)}
                disabled={isSharedDisabled}
                className={`relative w-full flex items-start space-x-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  isSharedDisabled
                    ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60'
                    : companionAccommodation?.shared
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 rounded-lg bg-green-50 p-2">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Shared Room (Recommended)
                    </p>
                    {companionAccommodation?.shared && (
                      <div className="rounded-full bg-blue-500 p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Share a {TIER_LABELS[accommodationTier]} accommodation with your travel companion
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-lg font-bold text-green-600">
                      FREE
                    </p>
                    <p className="text-xs text-slate-500">
                      No additional accommodation charge
                    </p>
                  </div>
                  {isSharedDisabled && (
                    <div className="mt-2 rounded-md bg-red-50 p-2">
                      <p className="text-xs text-red-700">
                        Shared accommodation requires matching trip durations
                      </p>
                    </div>
                  )}
                </div>
              </button>
            </TooltipTrigger>
            {!isSharedDisabled && (
              <TooltipContent>
                <p>You&apos;re sharing a {TIER_LABELS[accommodationTier]} accommodation with your travel companion</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Separate Room Option */}
        <button
          type="button"
          onClick={() => handleOptionChange(false)}
          className={`relative w-full flex items-start space-x-3 rounded-lg border-2 p-4 text-left transition-colors ${
            companionAccommodation?.shared === false
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="mt-0.5 rounded-lg bg-blue-50 p-2">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                Separate Room
              </p>
              {companionAccommodation?.shared === false && (
                <div className="rounded-full bg-blue-500 p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Companion gets their own {TIER_LABELS[accommodationTier]} accommodation
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-lg font-bold text-slate-900">
                +{formatPrice(accommodationPrice)}
              </p>
              <p className="text-xs text-slate-500">
                Full accommodation price
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-md bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Companion Accommodation
            </p>
            <p className="text-sm text-slate-600">
              {companionAccommodation?.shared ? 'Shared' : 'Separate'} {TIER_LABELS[accommodationTier]}
            </p>
          </div>
          <p className={`text-lg font-bold ${companionAccommodation?.shared ? 'text-green-600' : 'text-slate-900'}`}>
            {companionAccommodation?.shared ? 'FREE' : `+${formatPrice(accommodationPrice)}`}
          </p>
        </div>
      </div>
    </div>
  )
}
