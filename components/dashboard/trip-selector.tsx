'use client'

/**
 * Trip Selector Component
 *
 * Client-side component for selecting and assigning trips to bookings
 * Features:
 * - Fetch available trips via tRPC
 * - Display trip cards with capacity info
 * - Assign trip to booking
 * - Handle loading and error states
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface TripSelectorProps {
  bookingId: string
  packageId: string
}

export function TripSelector({ bookingId, packageId }: TripSelectorProps) {
  const router = useRouter()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // Fetch available trips
  const { data: trips, isLoading, error } = trpc.booking.getAvailableTrips.useQuery({
    packageId,
  })

  // Assign trip mutation
  const assignTripMutation = trpc.booking.assignTrip.useMutation({
    onSuccess: () => {
      toast.success('Trip successfully assigned!', {
        description: 'Your booking has been updated with the selected trip dates.',
      })
      router.push(`/dashboard/bookings/${bookingId}`)
      router.refresh()
    },
    onError: (error) => {
      toast.error('Failed to assign trip', {
        description: error.message,
      })
    },
  })

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId)
  }

  const handleConfirmSelection = () => {
    if (!selectedTripId) {
      toast.error('Please select a trip')
      return
    }

    assignTripMutation.mutate({
      bookingId,
      tripId: selectedTripId,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">Failed to load available trips</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!trips || trips.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Available Trips</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There are currently no available trip dates for this package.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later or contact support for assistance.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Available Trips */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Trip Dates</h2>
        <div className="grid gap-4">
          {trips.map((trip) => {
            const isSelected = selectedTripId === trip.id
            const isLowCapacity = trip.spotsRemaining <= 3

            return (
              <Card
                key={trip.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleSelectTrip(trip.id)}
              >
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Destination */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{trip.destination}</h3>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(trip.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {' '}-{' '}
                          {new Date(trip.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {trip.spotsRemaining} spot{trip.spotsRemaining !== 1 ? 's' : ''} remaining
                          ({trip.currentBookings}/{trip.capacity} booked)
                        </span>
                        {isLowCapacity && (
                          <Badge variant="destructive" className="ml-2">
                            Limited Spots
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    <div className="ml-4">
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-primary-foreground"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Confirm Selection */}
      {selectedTripId && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Confirm Your Selection</CardTitle>
            <CardDescription>
              Once confirmed, your trip dates will be assigned to this booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              onClick={handleConfirmSelection}
              disabled={assignTripMutation.isPending}
            >
              {assignTripMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Trip Selection'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedTripId(null)}
              disabled={assignTripMutation.isPending}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
