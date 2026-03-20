'use client'

/**
 * Duration Selector Component
 *
 * Step 2 of booking configurator - allows guests to select trip duration.
 *
 * Features:
 * - Duration options: 7, 10, 14, 21 days
 * - Dynamic price calculation based on duration
 * - Sample itinerary preview for selected duration
 * - Back/Next navigation
 * - Zustand store integration
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/booking-store'
import { Button } from '@/components/ui/button'

interface DurationOption {
  days: number
  label: string
  popular?: boolean
}

const DURATION_OPTIONS: DurationOption[] = [
  { days: 7, label: '1 Week' },
  { days: 10, label: '10 Days' },
  { days: 14, label: '2 Weeks', popular: true },
  { days: 21, label: '3 Weeks' },
]

interface SampleItinerary {
  [key: number]: {
    highlights: string[]
    description: string
  }
}

// Sample itinerary highlights based on duration
const ITINERARY_HIGHLIGHTS: SampleItinerary = {
  7: {
    description: 'Perfect for a quick transformation getaway',
    highlights: [
      'Initial medical consultations and assessments',
      '3 days of pickleball training and matches',
      'Primary medical/cosmetic procedures',
      'Post-procedure recovery and wellness',
      'Cultural excursion to Bangkok temples',
      'Farewell beach sunset dinner',
    ],
  },
  10: {
    description: 'Ideal balance of transformation and relaxation',
    highlights: [
      'Comprehensive wellness consultations',
      '5 days of pickleball with pro coaching',
      'Spa and wellness treatments',
      'Thai massage and wellness treatments',
      'Day trip to Ayutthaya historical park',
      'Cooking class and market tour',
      'Beach day and water sports',
      'Final celebration dinner cruise',
    ],
  },
  14: {
    description: 'Our most popular package - full transformation experience',
    highlights: [
      'Extended wellness program and planning',
      '7 days of intensive pickleball training',
      'Multiple excursions and cultural activities',
      'Daily wellness activities (yoga, meditation)',
      'Weekend trip to Hua Hin or Chiang Mai',
      'Thai cooking masterclass series',
      'Spa day at premier resort',
      'Shopping tour and cultural experiences',
      'Extended spa and wellness sessions',
      'Pre-departure trip preparation',
    ],
  },
  21: {
    description: 'Ultimate transformation journey with maximum results',
    highlights: [
      'Comprehensive wellness optimization program',
      '10+ days of pickleball with tournament play',
      'Deep cultural immersion experiences',
      'Advanced wellness program (detox, nutrition)',
      '3-day island retreat to Koh Samui',
      'Professional photography session',
      'Multiple cultural and adventure activities',
      'Extended wellness and spa treatments',
      'Personalized fitness and nutrition plan',
      'Alumni network introduction',
      'Post-trip follow-up and community access',
      'Graduation ceremony and celebration',
    ],
  },
}

export default function DurationSelector() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Zustand store
  const selectedPackage = useBookingStore((state) => state.selectedPackage)
  const duration = useBookingStore((state) => state.duration)
  const setDuration = useBookingStore((state) => state.setDuration)
  const previousStep = useBookingStore((state) => state.previousStep)
  const nextStep = useBookingStore((state) => state.nextStep)
  const calculateSubtotal = useBookingStore((state) => state.calculateSubtotal)

  // Handle duration selection
  const handleSelectDuration = (days: number) => {
    setDuration(days)
  }

  // Handle back button
  const handleBack = () => {
    previousStep()
    router.push('/booking/configure')
  }

  // Handle next button
  const handleNext = () => {
    if (!duration) return

    setIsNavigating(true)
    nextStep()
    router.push('/booking/configure/accommodation')
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

  // Calculate price for specific duration
  const getPriceForDuration = (days: number) => {
    if (!selectedPackage) return 0
    return Math.round(selectedPackage.basePrice * (days / 14))
  }

  // Get current subtotal
  const currentSubtotal = calculateSubtotal()

  // Get itinerary for selected duration
  const selectedItinerary = duration ? ITINERARY_HIGHLIGHTS[duration] : null

  if (!selectedPackage) {
    router.push('/booking/configure')
    return null
  }

  return (
    <div>
      {/* Package Reminder */}
      <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            ✓
          </div>
          <div>
            <p className="font-semibold text-emerald-900">
              {selectedPackage.name}
            </p>
            <p className="text-sm text-emerald-700">
              Base price: {formatPrice(selectedPackage.basePrice)} (14 days)
            </p>
          </div>
        </div>
      </div>

      {/* Duration Options */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = duration === option.days
          const price = getPriceForDuration(option.days)
          const isAvailable = selectedPackage.durationOptions.includes(option.days)

          return (
            <button
              key={option.days}
              onClick={() => isAvailable && handleSelectDuration(option.days)}
              disabled={!isAvailable}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-100'
                  : isAvailable
                  ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Popular Badge */}
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Duration */}
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-400" />
                <span className="text-2xl font-bold text-slate-900">
                  {option.days}
                </span>
                <span className="text-sm text-slate-600">days</span>
              </div>

              {/* Label */}
              <div className="mb-3 text-sm font-medium text-slate-600">
                {option.label}
              </div>

              {/* Price */}
              {isAvailable ? (
                <div className="text-xl font-bold text-emerald-600">
                  {formatPrice(price)}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Not available</div>
              )}

              {/* Per Day */}
              {isAvailable && (
                <div className="mt-1 text-xs text-slate-500">
                  {formatPrice(Math.round(price / option.days))} per day
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-600">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Sample Itinerary */}
      {selectedItinerary && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Sample {duration}-Day Itinerary
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            {selectedItinerary.description}
          </p>

          <div className="space-y-2">
            {selectedItinerary.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700">{highlight}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            * Sample itinerary - actual activities may vary based on your
            selected add-ons and activities.
          </p>
        </div>
      )}

      {/* Price Summary */}
      {duration && (
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Current Total</p>
              <p className="text-xs text-blue-600">
                {selectedPackage.name} • {duration} days
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatPrice(currentSubtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between gap-4">
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
          disabled={!duration || isNavigating}
          className="min-w-64 bg-gradient-to-r from-emerald-600 to-blue-600 text-lg font-semibold hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
        >
          {isNavigating ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Loading...
            </span>
          ) : duration ? (
            <>
              Next: Choose Accommodation
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            'Select a duration to continue'
          )}
        </Button>
      </div>
    </div>
  )
}
