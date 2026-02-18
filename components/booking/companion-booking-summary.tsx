/**
 * Companion Booking Summary Component
 *
 * E3-S17: Companion Booking Story Implementation
 *
 * Displays companion's booking details on the review page.
 * Shows package, duration, accommodation (shared or separate), and add-ons.
 *
 * Features:
 * - Companion information display
 * - Package selection (same or different)
 * - Accommodation sharing indicator
 * - Add-ons list
 * - Edit buttons for each section
 * - Responsive design
 */

'use client'

import { useBookingStore, type AccommodationTier } from '@/lib/stores/booking-store'
import { Calendar, Edit, Home, Package, Plus, User, Users } from 'lucide-react'
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
    description: 'Premium accommodations with outstanding amenities',
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

export function CompanionBookingSummary() {
  const router = useRouter()
  const {
    selectedPackage,
    duration,
    accommodationTier,
    hasCompanion,
    companionInfo,
    companionPackage,
    companionAccommodation,
    companionAddOns,
  } = useBookingStore()

  // Don't render if companion mode is not enabled
  if (!hasCompanion || !companionInfo || !companionPackage || !companionAccommodation) {
    return null
  }

  // Determine companion's package name
  const companionPackageName = companionPackage.sameAsPrimary
    ? selectedPackage?.name || 'Unknown Package'
    : 'Different Package'

  const companionDuration = companionPackage.duration
  const durationDetails = DURATION_DETAILS[companionDuration]

  // Accommodation details for companion
  const isSharedAccommodation = companionAccommodation.shared
  const companionAccommodationTier = companionAccommodation.tier || accommodationTier
  const accommodationDetails = companionAccommodationTier
    ? ACCOMMODATION_DETAILS[companionAccommodationTier]
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Companion Booking</h2>
            <p className="text-sm text-slate-600">
              {companionInfo.firstName} {companionInfo.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Companion Info Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-bold">Companion Information</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-sm font-semibold text-slate-900">
                {companionInfo.firstName} {companionInfo.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-900">{companionInfo.email}</p>
            </div>
            {companionInfo.phone && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-sm font-semibold text-slate-900">{companionInfo.phone}</p>
              </div>
            )}
            {companionInfo.dateOfBirth && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-slate-900">{companionInfo.dateOfBirth}</p>
              </div>
            )}
          </div>

          {companionInfo.dietaryNotes && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dietary Notes</p>
              <p className="text-sm text-slate-700">{companionInfo.dietaryNotes}</p>
            </div>
          )}

          <button
            onClick={() => router.push('/booking/configure/companion')}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Companion Information
          </button>
        </div>
      </section>

      {/* Package Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5" />
            <h3 className="text-lg font-bold">Selected Package</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xl font-bold text-slate-900">{companionPackageName}</h4>
            {companionPackage.sameAsPrimary && selectedPackage?.tagline && (
              <p className="text-sm text-slate-600 mt-1">{selectedPackage.tagline}</p>
            )}
            {companionPackage.sameAsPrimary && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                <span>✓</span>
                <span>Same as primary guest</span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/booking/configure/companion')}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Package Selection
          </button>
        </div>
      </section>

      {/* Duration Section */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-bold">Trip Duration</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">{companionDuration} Days</p>
            <p className="text-sm text-slate-600 mt-1">{durationDetails.itinerary}</p>
            <p className="text-sm text-blue-600 font-medium mt-2">{durationDetails.focus}</p>
            {companionDuration === duration && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                <span>✓</span>
                <span>Same as primary guest</span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/booking/configure/companion')}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
          {isSharedAccommodation ? (
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-slate-900">Shared Room</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {accommodationDetails?.name} - {accommodationDetails?.property}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">{accommodationDetails?.description}</p>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  💰 No additional accommodation charge
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Sharing accommodation with primary guest saves approximately{' '}
                  {formatPrice(accommodationDetails?.price || 0)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl font-bold text-slate-900">{accommodationDetails?.name}</p>
              <p className="text-sm text-slate-600 mt-1">{accommodationDetails?.property}</p>
              <p className="text-sm text-slate-500 mt-2">{accommodationDetails?.description}</p>
              {accommodationDetails && accommodationDetails.price > 0 && (
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  +{formatPrice(accommodationDetails.price)} upgrade
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <span>🏨</span>
                <span>Separate room</span>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/booking/configure/companion')}
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Accommodation Options
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
          {companionAddOns.length > 0 ? (
            <div className="space-y-3">
              {companionAddOns.map((addOn) => (
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
                Companion can add enhanced services and experiences during their trip
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/booking/configure/companion')}
            className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            {companionAddOns.length > 0 ? 'Edit Add-Ons' : 'Add Services & Experiences'}
          </button>
        </div>
      </section>
    </div>
  )
}
