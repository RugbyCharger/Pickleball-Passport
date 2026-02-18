/**
 * Accommodation Tier Selector Component
 *
 * Part of Step 3 in the booking configurator.
 * Allows users to choose between 3 luxury accommodation tiers:
 * - Luxury (Four Seasons) - Baseline
 * - Ultra-Luxury (Aman) - +$3,000
 * - Villa (Private Villa) - +$5,000
 *
 * Features:
 * - Visual tier cards with gradients
 * - Price differential display
 * - Amenities list
 * - Selection state
 * - Responsive grid layout
 * - Back/Next navigation
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore, type AccommodationTier } from '@/lib/stores/booking-store'
import { CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TierOption {
  id: AccommodationTier
  name: string
  subtitle: string
  price: number // Additional cost in cents
  description: string
  amenities: string[]
  gradient: string
  popular?: boolean
}

const ACCOMMODATION_TIERS: TierOption[] = [
  {
    id: 'LUXURY',
    name: 'Luxury',
    subtitle: 'Four Seasons Resort',
    price: 0,
    description: 'Premier 5-star resort accommodation with outstanding amenities',
    amenities: [
      'Ocean or garden view rooms',
      'Daily breakfast included',
      'Pool and spa access',
      'Concierge service',
      'Fitness center',
      '24/7 room service',
    ],
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    id: 'ULTRA_LUXURY',
    name: 'Ultra-Luxury',
    subtitle: 'Aman Resort',
    price: 300000, // $3,000
    description: 'Ultra-luxury boutique resort with personalized service',
    amenities: [
      'Private pool villa',
      'All meals included',
      'Personal butler service',
      'Premium spa treatments',
      'VIP airport transfer',
      'Private yoga sessions',
    ],
    gradient: 'from-purple-400 to-purple-600',
    popular: true,
  },
  {
    id: 'VILLA',
    name: 'Private Villa',
    subtitle: 'Exclusive Beachfront',
    price: 500000, // $5,000
    description: 'Your own private paradise with dedicated staff',
    amenities: [
      'Private beachfront villa',
      'Dedicated chef and staff',
      'Full-service in-villa dining',
      'Private pickleball court option',
      'Chauffeur service',
      'Luxury yacht excursion',
    ],
    gradient: 'from-amber-400 to-amber-600',
  },
]

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function AccommodationSelector() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const { accommodationTier, setAccommodationTier, selectedPackage, duration, calculateSubtotal } = useBookingStore()

  const handleSelectTier = (tierId: AccommodationTier) => {
    setAccommodationTier(tierId)
  }

  const handleBack = () => {
    setIsNavigating(true)
    router.push('/booking/configure/duration')
  }

  const handleNext = () => {
    if (!accommodationTier) return

    setIsNavigating(true)
    router.push('/booking/review')
  }

  const currentSubtotal = calculateSubtotal()

  return (
    <div className="space-y-8">
      {/* Tier Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ACCOMMODATION_TIERS.map((tier) => {
          const isSelected = accommodationTier === tier.id
          const isPremium = tier.price > 0

          return (
            <button
              key={tier.id}
              onClick={() => handleSelectTier(tier.id)}
              className={`
                group relative overflow-hidden rounded-2xl bg-white shadow-lg
                transition-all duration-200
                ${
                  isSelected
                    ? 'ring-4 ring-emerald-500 ring-offset-4'
                    : 'hover:shadow-xl hover:scale-[1.02]'
                }
              `}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute left-4 top-4 z-10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 drop-shadow-lg" />
                </div>
              )}

              {/* Gradient Hero */}
              <div
                className={`
                  h-48 bg-gradient-to-br ${tier.gradient}
                  flex items-center justify-center text-white
                `}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="mt-1 text-sm opacity-90">{tier.subtitle}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price */}
                <div className="mb-4 text-center">
                  {isPremium ? (
                    <>
                      <div className="text-2xl font-bold text-slate-900">
                        +{formatPrice(tier.price)}
                      </div>
                      <div className="text-sm text-slate-500">additional</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-emerald-600">
                        Included
                      </div>
                      <div className="text-sm text-slate-500">
                        in package price
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  {tier.description}
                </p>

                {/* Amenities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amenities
                  </h4>
                  <ul className="space-y-1.5">
                    {tier.amenities.map((amenity, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection Button */}
                <div className="mt-6">
                  {isSelected ? (
                    <div className="w-full rounded-lg bg-emerald-500 py-3 text-center text-sm font-semibold text-white">
                      Selected
                    </div>
                  ) : (
                    <div className="w-full rounded-lg bg-slate-100 py-3 text-center text-sm font-semibold text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      Select {tier.name}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Educational Content */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Why Accommodation Tier Matters
        </h3>
        <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Luxury</h4>
            <p>
              Perfect for those who want excellent amenities and service at
              a five-star resort without additional premium costs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Ultra-Luxury</h4>
            <p>
              Ideal for discerning travelers seeking elevated exclusivity,
              personalized service, and ultra-premium facilities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Private Villa</h4>
            <p>
              The ultimate in privacy and luxury with dedicated staff,
              private facilities, and VIP experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Help Text */}
      {!accommodationTier && (
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Select an accommodation tier to continue
          </p>
        </div>
      )}

      {/* Price Summary */}
      {accommodationTier && selectedPackage && duration && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Current Total</p>
              <p className="text-xs text-blue-600">
                {selectedPackage.name} • {duration} days • {ACCOMMODATION_TIERS.find(t => t.id === accommodationTier)?.name}
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatPrice(currentSubtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleBack}
          className="min-w-32"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        <Button
          size="lg"
          onClick={handleNext}
          disabled={!accommodationTier || isNavigating}
          className="min-w-64 bg-gradient-to-r from-emerald-600 to-blue-600 text-lg font-semibold hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
        >
          {isNavigating ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Loading...
            </span>
          ) : accommodationTier ? (
            <>
              Next: Add-Ons & Customization
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            'Select accommodation to continue'
          )}
        </Button>
      </div>
    </div>
  )
}
