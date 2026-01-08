/**
 * Booking Summary Component
 *
 * E3-S7: Booking Review Page
 *
 * Displays a comprehensive summary of all booking selections with edit functionality.
 * Allows users to review and modify their choices before proceeding to payment.
 *
 * Features:
 * - Package details with image and description
 * - Duration selection display
 * - Accommodation tier details
 * - Add-ons list (if any)
 * - Edit buttons for each section
 * - Responsive design
 */

'use client'

import { useBookingStore, type AccommodationTier } from '@/lib/stores/booking-store'
import { Calendar, Edit, Home, Package, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Accommodation tier details
const ACCOMMODATION_DETAILS: Record<
  AccommodationTier,
  {
    name: string
    property: string
    description: string
    price: number
  }
> = {
  LUXURY: {
    name: 'Luxury Tier',
    property: 'Four Seasons Resort',
    description: 'Premium accommodations with world-class amenities',
    price: 0,
  },
  ULTRA_LUXURY: {
    name: 'Ultra-Luxury Tier',
    property: 'Aman Resort',
    description: 'Ultra-premium accommodations with exclusive services',
    price: 300000,
  },
  VILLA: {
    name: 'Private Villa',
    property: 'Private Beachfront Villa',
    description: 'Exclusive private villa with dedicated staff',
    price: 500000,
  },
}

// Duration details
const DURATION_DETAILS: Record<number, { itinerary: string; focus: string }> = {
  7: {
    itinerary: '1-week intensive program',
    focus: 'Core procedures + recovery essentials',
  },
  10: {
    itinerary: '10-day balanced program',
    focus: 'Multiple procedures with comfortable recovery',
  },
  14: {
    itinerary: '2-week comprehensive program',
    focus: 'Full medical + recreational experience (Recommended)',
  },
  21: {
    itinerary: '3-week premium program',
    focus: 'Extended recovery + maximum pickleball training',
  },
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function BookingSummary() {
  const router = useRouter()
  const { selectedPackage, duration, accommodationTier, selectedAddOns, hasCompanion } = useBookingStore()

  if (!selectedPackage || !duration || !accommodationTier) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Complete the configurator to see your booking summary
        </p>
      </div>
    )
  }

  const accommodationDetails = ACCOMMODATION_DETAILS[accommodationTier]
  const durationDetails = DURATION_DETAILS[duration]

  return (
    <div className="space-y-6">
      {/* Header for companion mode */}
      {hasCompanion && (
        <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Booking</h2>
              <p className="text-sm text-slate-600">Primary guest booking details</p>
            </div>
          </div>
        </div>
      )}

      {/* Package Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5" />
            <h3 className="text-lg font-bold">Selected Package</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {selectedPackage.heroImageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={selectedPackage.heroImageUrl}
                alt={selectedPackage.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div>
            <h4 className="text-xl font-bold text-slate-900">{selectedPackage.name}</h4>
            {selectedPackage.tagline && (
              <p className="text-sm text-slate-600 mt-1">{selectedPackage.tagline}</p>
            )}
          </div>

          <button
            onClick={() => router.push('/booking/configure')}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Package Selection
          </button>
        </div>
      </section>

      {/* Duration Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-bold">Trip Duration</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">{duration} Days</p>
            <p className="text-sm text-slate-600 mt-1">{durationDetails.itinerary}</p>
            <p className="text-sm text-emerald-600 font-medium mt-2">{durationDetails.focus}</p>
          </div>

          <button
            onClick={() => router.push('/booking/configure/duration')}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Duration
          </button>
        </div>
      </section>

      {/* Accommodation Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Home className="h-5 w-5" />
            <h3 className="text-lg font-bold">Accommodation</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xl font-bold text-slate-900">{accommodationDetails.name}</p>
            <p className="text-sm text-slate-600 mt-1">{accommodationDetails.property}</p>
            <p className="text-sm text-slate-500 mt-2">{accommodationDetails.description}</p>
            {accommodationDetails.price > 0 && (
              <p className="text-sm text-emerald-600 font-semibold mt-2">
                +{formatPrice(accommodationDetails.price)} upgrade
              </p>
            )}
          </div>

          <button
            onClick={() => router.push('/booking/configure/accommodation')}
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Accommodation Tier
          </button>
        </div>
      </section>

      {/* Add-Ons Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Plus className="h-5 w-5" />
            <h3 className="text-lg font-bold">Add-Ons</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {selectedAddOns.length > 0 ? (
            <div className="space-y-3">
              {selectedAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{addOn.name}</p>
                    {addOn.description && (
                      <p className="text-xs text-slate-500 mt-1">{addOn.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{addOn.category}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                    {formatPrice(addOn.thPrice)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 font-medium">No add-ons selected</p>
              <p className="text-xs text-slate-500 mt-1">
                You can add enhanced services and experiences during your trip
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/booking/configure/add-ons')}
            className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            {selectedAddOns.length > 0 ? 'Edit Add-Ons' : 'Add Services & Experiences'}
          </button>
        </div>
      </section>
    </div>
  )
}
