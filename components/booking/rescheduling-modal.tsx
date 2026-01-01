'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Calendar, X } from 'lucide-react'

interface ReschedulingModalProps {
  bookingId: string
  bookingReference: string
  currentTripName: string
  currentTripStartDate: Date
  currentTripEndDate: Date
  rescheduleCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReschedulingModal({
  bookingId,
  bookingReference,
  currentTripName,
  currentTripStartDate,
  currentTripEndDate,
  rescheduleCount,
  open,
  onOpenChange
}: ReschedulingModalProps) {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const router = useRouter()
  const utils = trpc.useUtils()

  // Fetch available trips
  const { data: trips, isLoading: tripsLoading } = trpc.trip.getAvailableForReschedule.useQuery(
    { bookingId },
    { enabled: open }
  )

  // Reschedule mutation
  const rescheduleMutation = trpc.booking.reschedule.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Booking rescheduled successfully! New trip: ${data.newTrip?.name || 'Updated'}`
      )
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Rescheduling failed. Please try again.')
    }
  })

  const selectedTrip = trips?.find(t => t.id === selectedTripId)
  const hasRescheduleAvailable = rescheduleCount < 1

  const handleReschedule = () => {
    if (!selectedTripId) return
    rescheduleMutation.mutate({
      bookingId,
      newTripId: selectedTripId
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-start justify-between">
            <div>
              <Dialog.Title id="modal-title" className="text-2xl font-serif font-bold text-gray-900">
                Reschedule Booking
              </Dialog.Title>
              <p id="modal-description" className="text-gray-600 mt-2">
                Booking: <strong>{bookingReference}</strong>
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close"
                disabled={rescheduleMutation.isPending}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Trip Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Current Trip</h3>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{currentTripName}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                {new Date(currentTripStartDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })} - {new Date(currentTripEndDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Eligibility Status */}
            {hasRescheduleAvailable ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-green-700">
                  ✓ You have 1 reschedule available
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Select a new trip below to reschedule your booking.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Note:</strong> Rescheduling is only available less than 30 days before your trip (non-refundable period). You can only reschedule once per booking.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-red-700">
                  Reschedule limit reached
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  You have already rescheduled this booking. Contact support for assistance.
                </p>
              </div>
            )}

            {/* Trip Selection */}
            {hasRescheduleAvailable && (
              <>
                <h3 className="font-semibold text-gray-900 mb-4">Select New Trip</h3>

                {tripsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-ocean-blue" />
                    <span className="ml-2 text-gray-600">Loading available trips...</span>
                  </div>
                )}

                {!tripsLoading && trips && trips.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">No trips currently available for rescheduling.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please contact support for assistance.
                    </p>
                  </div>
                )}

                {!tripsLoading && trips && trips.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {trips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2 ${
                          selectedTripId === trip.id
                            ? 'border-ocean-blue bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        role="radio"
                        aria-checked={selectedTripId === trip.id}
                        tabIndex={0}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{trip.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {new Date(trip.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })} - {new Date(trip.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {trip.location}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {trip.spotsAvailable} {trip.spotsAvailable === 1 ? 'spot' : 'spots'} left
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Price Adjustment Note */}
                {selectedTrip && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> No price adjustment for this reschedule.
                      Your booking total remains the same.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Dialog.Close asChild>
              <button
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={rescheduleMutation.isPending}
              >
                Cancel
              </button>
            </Dialog.Close>
            {hasRescheduleAvailable && (
              <button
                onClick={handleReschedule}
                disabled={!selectedTripId || rescheduleMutation.isPending}
                className="px-6 py-3 min-h-[48px] text-white bg-ocean-blue hover:bg-ocean-blue/90 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rescheduleMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {rescheduleMutation.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
