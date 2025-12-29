/**
 * Trip Selector Component
 *
 * Step 6 of booking configurator - allows guests to choose their departure date.
 * Features trip display, radio selection, and availability indicators.
 *
 * Used in: /booking/configure/trip (E3-S8)
 */

'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useBookingStore } from '@/lib/stores/booking-store'
import TripCard, { type TripData } from './trip-card'
import { AlertCircle, Loader2, Calendar } from 'lucide-react'

export default function TripSelector() {
  const router = useRouter()

  // Zustand booking store
  const { selectedTripId, setSelectedTripId } = useBookingStore()

  // Fetch available trips from tRPC with refetch to prevent stale data
  const { data: trips, isLoading, error } = trpc.trip.getAvailable.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  // Check if a trip is selected
  const isSelected = (tripId: string) => {
    return selectedTripId === tripId
  }

  // Select a trip (radio button behavior - only one can be selected)
  const selectTrip = (trip: TripData) => {
    setSelectedTripId(trip.id)
  }

  // Navigation handlers
  const handleBack = () => {
    router.push('/booking/configure/wellness')
  }

  const handleNext = () => {
    if (!selectedTripId) return

    // Navigate to review page
    router.push('/booking/review')
  }

  // Retry handler for error state
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-slate-900">
          Choose Your Departure Date
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Select from our upcoming transformation journeys to Thailand
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm text-slate-600">Loading available trips...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Failed to load trips
          </h3>
          <p className="mb-4 text-sm text-red-700">
            We couldn't load the available trips. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State - No Trips Available */}
      {!isLoading && !error && trips && trips.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-slate-400" />
          <h3 className="mb-2 text-xl font-serif font-semibold text-slate-900">
            No upcoming trips available
          </h3>
          <p className="text-slate-600">
            Check back soon! New dates are added regularly.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Contact us to be notified when new trip dates become available.
          </p>
        </div>
      )}

      {/* Trips Grid */}
      {!isLoading && !error && trips && trips.length > 0 && (
        <>
          {/* Selection Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} available
            </p>
            {selectedTripId && (
              <p className="text-sm font-medium text-emerald-600">
                ✓ Departure date selected
              </p>
            )}
          </div>

          {/* Grid */}
          <div
            role="radiogroup"
            aria-label="Select trip departure date"
            className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2"
          >
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={isSelected(trip.id)}
                onSelect={selectTrip}
              />
            ))}
          </div>

          {/* All Trips Fully Booked State */}
          {trips.every(
            (trip) => trip.currentBookings >= trip.capacity
          ) && (
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
              <h3 className="mb-2 text-lg font-semibold text-amber-900">
                All trips are fully booked
              </h3>
              <p className="text-amber-700">
                Join our waitlist to be notified when new dates open or when spots become available.
              </p>
            </div>
          )}
        </>
      )}

      {/* Trust Indicator */}
      {!isLoading && !error && trips && trips.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6 text-center">
          <p className="text-sm font-medium text-blue-900">
            🏝️ All trips include luxurious accommodations • Expert guides • Daily pickleball sessions
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          ← Back to Wellness Add-Ons
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedTripId}
          className={`
            inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm
            ${
              selectedTripId
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          Next: Review Booking →
        </button>
      </div>
    </div>
  )
}
