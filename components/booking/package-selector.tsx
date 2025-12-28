'use client'

/**
 * Package Selector Component
 *
 * Displays all available packages in a grid with radio button selection behavior.
 *
 * Features:
 * - Fetches packages via tRPC
 * - Radio button selection (only one package at a time)
 * - Visual feedback for selected state (blue border, checkmark)
 * - "Next: Choose Duration" button (disabled until selection)
 * - Zustand store integration
 * - Responsive grid (2 columns on desktop, 1 on mobile)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useBookingStore } from '@/lib/stores/booking-store'
import { Button } from '@/components/ui/button'

export default function PackageSelector() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Fetch packages via tRPC
  const { data: packages, isLoading, error } = trpc.package.getAll.useQuery()

  // Zustand store
  const selectedPackage = useBookingStore((state) => state.selectedPackage)
  const setSelectedPackage = useBookingStore((state) => state.setSelectedPackage)
  const nextStep = useBookingStore((state) => state.nextStep)

  // Handle package selection
  const handleSelectPackage = (pkg: NonNullable<typeof packages>[number]) => {
    setSelectedPackage({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      tagline: pkg.tagline,
      basePrice: pkg.basePrice,
      durationOptions: pkg.durationOptions,
      heroImageUrl: pkg.heroImageUrl,
    })
  }

  // Handle next button click
  const handleNext = () => {
    if (!selectedPackage) return

    setIsNavigating(true)
    nextStep() // Update Zustand step
    router.push('/booking/configure/duration') // Navigate to step 2
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

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-96 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-900">
          Error loading packages
        </p>
        <p className="mt-2 text-sm text-red-700">
          {error.message || 'Please try again later.'}
        </p>
      </div>
    )
  }

  // No packages found
  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="font-semibold text-slate-900">
          No packages available
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Please check back later or contact support.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Package Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {packages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id

          return (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all hover:shadow-xl ${
                isSelected
                  ? 'border-blue-600 shadow-lg ring-4 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-blue-600 p-1">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Hero Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {pkg.heroImageUrl ? (
                  <Image
                    src={pkg.heroImageUrl}
                    alt={pkg.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-400 to-blue-500">
                    <span className="text-4xl font-bold text-white">
                      {pkg.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Package Content */}
              <div className="p-6">
                {/* Package Name */}
                <h3 className="text-2xl font-bold text-slate-900">
                  {pkg.name}
                </h3>

                {/* Tagline */}
                {pkg.tagline && (
                  <p className="mt-2 text-sm text-slate-600">
                    {pkg.tagline}
                  </p>
                )}

                {/* Pricing */}
                <div className="mt-4">
                  <div className="text-3xl font-bold text-emerald-600">
                    {formatPrice(pkg.basePrice)}
                  </div>
                  <div className="text-sm text-slate-500">
                    Starting price (14 days)
                  </div>
                </div>

                {/* Duration Options */}
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Available Durations
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pkg.durationOptions.map((days) => (
                      <span
                        key={days}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {days} days
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description Preview */}
                {pkg.description && (
                  <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                    {pkg.description.substring(0, 150)}...
                  </p>
                )}

                {/* Select Indicator */}
                <div className="mt-6">
                  {isSelected ? (
                    <div className="flex items-center gap-2 font-semibold text-blue-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Selected
                    </div>
                  ) : (
                    <div className="font-medium text-slate-400 group-hover:text-slate-600">
                      Click to select
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <div className="mt-12 flex justify-center">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!selectedPackage || isNavigating}
          className="min-w-64 bg-gradient-to-r from-emerald-600 to-blue-600 text-lg font-semibold hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
        >
          {isNavigating ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Loading...
            </span>
          ) : selectedPackage ? (
            'Next: Choose Duration →'
          ) : (
            'Select a package to continue'
          )}
        </Button>
      </div>

      {/* Selection Summary (if package selected) */}
      {selectedPackage && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">
                {selectedPackage.name} Selected
              </p>
              <p className="mt-1 text-sm text-blue-700">
                You'll customize your duration and accommodation in the next
                steps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
