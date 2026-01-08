'use client'

/**
 * Bookings List Component
 *
 * Client-side component for displaying and filtering bookings
 * Features:
 * - Status filtering
 * - Date sorting
 * - Responsive booking cards
 * - Click to view details
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, DollarSign } from 'lucide-react'
import { BookingStatus } from '@prisma/client'
import { LinkedBookingCard } from './linked-booking-card'

interface Booking {
  id: string
  bookingReference: string
  status: BookingStatus
  duration: number
  accommodationTier: string
  totalPrice: number
  createdAt: Date
  isCompanionBooking: boolean
  package: {
    name: string
    slug: string
  }
  trip: {
    startDate: Date
    endDate: Date
    destination: string
  } | null
  payments: Array<{
    id: string
    amount: number
    status: string
    createdAt: Date
  }>
  companionBookings: Array<{
    id: string
    bookingReference: string
    guestFirstName: string | null
    guestLastName: string | null
    status: BookingStatus
    totalPrice: number
    accommodationTier: string
  }>
  primaryBooking: {
    id: string
    bookingReference: string
    userId: string
  } | null
}

interface BookingsListProps {
  bookings: Booking[]
}

type StatusFilter = 'ALL' | BookingStatus

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Bookings' },
  { value: 'PENDING_PAYMENT', label: 'Payment Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

type SortOption = 'newest' | 'oldest'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
]

export function BookingsList({ bookings }: BookingsListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortOrder, setSortOrder] = useState<SortOption>('newest')

  // Filter and sort bookings
  // Exclude companion bookings (they're displayed with their primary booking)
  const filteredAndSortedBookings = useMemo(() => {
    let result = bookings.filter((booking) => !booking.isCompanionBooking)

    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    // Apply sort
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [bookings, statusFilter, sortOrder])

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sortOrder === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortOrder(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings List */}
      {filteredAndSortedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">No Bookings Found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {statusFilter === 'ALL'
                ? "You haven't made any bookings yet."
                : `No bookings found with status: ${statusOptions.find(o => o.value === statusFilter)?.label}`
              }
            </p>
            {statusFilter === 'ALL' && (
              <Link href="/packages">
                <Button>Browse Packages</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedBookings.map((booking) => {
            // Check if this booking has a companion
            const hasCompanion = booking.companionBookings && booking.companionBookings.length > 0

            // Render linked booking card if companion exists
            if (hasCompanion) {
              return <LinkedBookingCard key={booking.id} booking={booking} />
            }

            // Render regular booking card
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{booking.package.name}</h3>
                            <Badge variant={getStatusVariant(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.bookingReference}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {/* Duration */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.duration} days</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>${(booking.totalPrice / 100).toLocaleString()}</span>
                        </div>

                        {/* Trip Info */}
                        {booking.trip && (
                          <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {booking.trip.destination} • {new Date(booking.trip.startDate).toLocaleDateString()} - {new Date(booking.trip.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Accommodation Tier */}
                        <div className="text-muted-foreground">
                          <span className="font-medium">Accommodation:</span>{' '}
                          {formatAccommodationTier(booking.accommodationTier)}
                        </div>

                        {/* Booked Date */}
                        <div className="text-muted-foreground">
                          <span className="font-medium">Booked:</span>{' '}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Payment Status */}
                      {booking.payments[0] && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Payment:</span>{' '}
                            <Badge variant={booking.payments[0].status === 'SUCCEEDED' ? 'default' : 'secondary'} className="ml-1">
                              {booking.payments[0].status}
                            </Badge>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:self-start">
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Button variant="default" size="sm" className="w-full lg:w-auto">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Get badge variant based on booking status
 */
function getStatusVariant(status: BookingStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'CONFIRMED':
      return 'default'
    case 'PENDING_PAYMENT':
      return 'secondary'
    case 'CANCELLED':
      return 'destructive'
    case 'COMPLETED':
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get human-readable status label
 */
function getStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'PENDING_PAYMENT':
      return 'Payment Pending'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

/**
 * Format accommodation tier for display
 */
function formatAccommodationTier(tier: string): string {
  switch (tier) {
    case 'LUXURY':
      return 'Four Seasons (Luxury)'
    case 'ULTRA_LUXURY':
      return 'Aman (Ultra Luxury)'
    case 'VILLA':
      return 'Private Villa'
    default:
      return tier
  }
}
