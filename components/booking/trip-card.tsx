/**
 * Trip Card Component
 *
 * Reusable card for displaying trips in the booking configurator.
 * Used in E3-S8 (Trip Selection).
 *
 * Features:
 * - Radio button selection (single selection only)
 * - Trip dates and duration display
 * - Availability indicator
 * - Fully booked state
 * - Responsive design
 * - Accessibility support
 */

'use client'

import { useState } from 'react'
import { CheckCircle2, MapPin, Calendar, Users } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

// Type for trip data from tRPC
export interface TripData {
  id: string
  name: string
  destination: string
  startDate: Date
  endDate: Date
  capacity: number
  currentBookings: number
  _count: {
    bookings: number
  }
}

interface TripCardProps {
  trip: TripData
  isSelected: boolean
  onSelect: (trip: TripData) => void
}

// Format date for display
function formatDate(date: Date): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

// Calculate duration in days
function calculateDuration(startDate: Date, endDate: Date): number {
  return differenceInDays(new Date(endDate), new Date(startDate))
}

// Calculate spots remaining
function getSpotsRemaining(capacity: number, currentBookings: number): number {
  return Math.max(0, capacity - currentBookings)
}

// Check if trip is fully booked
function isFullyBooked(capacity: number, currentBookings: number): boolean {
  return currentBookings >= capacity
}

export default function TripCard({
  trip,
  isSelected,
  onSelect,
}: TripCardProps) {
  const [showWaitlistMessage, setShowWaitlistMessage] = useState(false)
  const duration = calculateDuration(trip.startDate, trip.endDate)
  const spotsRemaining = getSpotsRemaining(trip.capacity, trip.currentBookings)
  const fullyBooked = isFullyBooked(trip.capacity, trip.currentBookings)

  return (
    <article
      onClick={() => !fullyBooked && onSelect(trip)}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select trip: ${trip.name}`}
      tabIndex={fullyBooked ? -1 : 0}
      onKeyDown={(e) => {
        if (!fullyBooked && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(trip)
        }
      }}
      className={`
        group relative rounded-lg border-2 bg-white p-6 shadow-sm transition-all
        ${
          fullyBooked
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
        }
        ${
          isSelected && !fullyBooked
            ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-emerald-300'
        }
      `}
    >
      {/* Selection Checkmark (top-right) */}
      {isSelected && !fullyBooked && (
        <div className="absolute right-4 top-4">
          <CheckCircle2
            className="h-6 w-6 text-emerald-600"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Fully Booked Badge */}
      {fullyBooked && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Fully Booked
          </span>
        </div>
      )}

      {/* Trip Name */}
      <h3 className="mb-4 text-xl font-serif font-semibold text-slate-900 pr-20">
        {trip.name}
      </h3>

      {/* Trip Details */}
      <div className="space-y-3">
        {/* Destination */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>{trip.destination}</span>
        </div>

        {/* Dates */}
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-700">
              {formatDate(trip.startDate)}
            </span>
            <span className="text-slate-500">to {formatDate(trip.endDate)}</span>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {duration} {duration === 1 ? 'day' : 'days'}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span
              className={`text-sm font-semibold ${
                spotsRemaining <= 3 && spotsRemaining > 0
                  ? 'text-amber-600'
                  : spotsRemaining === 0
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}
            >
              {fullyBooked ? 'No' : spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining
            </span>
            <span className="text-xs text-slate-500">
              ({trip.currentBookings}/{trip.capacity} booked)
            </span>
          </div>
        </div>
      </div>

      {/* Fully Booked Action */}
      {fullyBooked && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          {!showWaitlistMessage ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowWaitlistMessage(true)
                // Auto-hide after 5 seconds
                setTimeout(() => setShowWaitlistMessage(false), 5000)
              }}
              className="w-full rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Join Waitlist
            </button>
          ) : (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
              <p className="font-medium">Waitlist feature coming soon!</p>
              <p className="mt-1 text-xs text-blue-600">
                Contact us at Ryan@thepickleballpassport.org to be notified when spots open up.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && !fullyBooked && (
        <div className="mt-4 border-t border-emerald-200 pt-3">
          <p className="text-center text-sm font-medium text-emerald-700">
            ✓ Selected departure date
          </p>
        </div>
      )}
    </article>
  )
}
