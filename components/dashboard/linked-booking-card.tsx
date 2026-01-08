'use client'

/**
 * Linked Booking Card Component
 *
 * Displays primary and companion bookings together with visual connection
 * Features:
 * - Primary booking card (normal display)
 * - Companion booking card with "Traveling With You" badge
 * - Visual connecting line between cards
 * - Click to view details for each booking
 * - Mobile-responsive layout
 */

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react'
import { BookingStatus } from '@prisma/client'

interface CompanionBooking {
  id: string
  bookingReference: string
  guestFirstName: string | null
  guestLastName: string | null
  status: BookingStatus
  totalPrice: number
  accommodationTier: string
}

interface LinkedBookingCardProps {
  booking: {
    id: string
    bookingReference: string
    status: BookingStatus
    duration: number
    accommodationTier: string
    totalPrice: number
    createdAt: Date
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
    companionBookings: CompanionBooking[]
  }
}

export function LinkedBookingCard({ booking }: LinkedBookingCardProps) {
  const companion = booking.companionBookings[0]

  if (!companion) {
    return null
  }

  const companionName = companion.guestFirstName && companion.guestLastName
    ? `${companion.guestFirstName} ${companion.guestLastName}`
    : 'Your Companion'

  return (
    <div className="relative">
      {/* Primary Booking Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Booking Info */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-lg">{booking.package.name}</h3>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      Primary Booking
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

      {/* Visual Connection */}
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-8 w-0.5 bg-border" />
          <Users className="h-4 w-4" />
          <div className="h-8 w-0.5 bg-border" />
        </div>
      </div>

      {/* Companion Booking Card */}
      <Card className="hover:shadow-md transition-shadow border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Booking Info */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-lg">{booking.package.name}</h3>
                    <Badge variant={getStatusVariant(companion.status)}>
                      {getStatusLabel(companion.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Users className="h-3 w-3 mr-1" />
                      Traveling With You
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {companion.bookingReference}
                  </p>
                </div>
              </div>

              {/* Companion Name */}
              <div className="text-sm">
                <span className="font-medium">Guest:</span>{' '}
                <span className="text-muted-foreground">{companionName}</span>
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
                  <span>${(companion.totalPrice / 100).toLocaleString()}</span>
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
                  {formatAccommodationTier(companion.accommodationTier)}
                </div>

                {/* Companion Info */}
                <div className="text-muted-foreground">
                  <span className="font-medium">Linked to:</span>{' '}
                  {booking.bookingReference}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 lg:self-start">
              <Link href={`/dashboard/bookings/${companion.id}`}>
                <Button variant="default" size="sm" className="w-full lg:w-auto">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Total Info */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm text-center">
          <span className="font-medium">Combined Total:</span>{' '}
          <span className="text-lg font-semibold">
            ${((booking.totalPrice + companion.totalPrice) / 100).toLocaleString()}
          </span>
          <span className="text-muted-foreground ml-2">
            (2 bookings)
          </span>
        </p>
      </div>
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
