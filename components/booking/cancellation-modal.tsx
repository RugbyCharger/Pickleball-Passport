'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, X, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

interface CompanionBooking {
  id: string
  bookingReference: string
  guestFirstName: string | null
  guestLastName: string | null
  totalPrice: number
}

interface PrimaryBooking {
  id: string
  bookingReference: string
}

interface CancellationModalProps {
  bookingId: string
  bookingReference: string
  tripName: string
  tripStartDate: Date
  totalPrice: number
  companionBooking?: CompanionBooking
  primaryBooking?: PrimaryBooking
  isCompanionBooking?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CancellationModal({
  bookingId,
  bookingReference,
  tripName,
  tripStartDate,
  totalPrice,
  companionBooking,
  primaryBooking,
  isCompanionBooking = false,
  open,
  onOpenChange
}: CancellationModalProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [cancelBothBookings, setCancelBothBookings] = useState(false)

  const cancelMutation = trpc.booking.cancel.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Booking cancelled. ${data.refundAmount > 0 ? `Refund of $${(data.refundAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} processed.` : 'No refund applicable.'}`
      )
      utils.booking.list.invalidate()
      onOpenChange(false)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Cancellation failed. Please try again.')
    }
  })

  // Calculate days until trip (stable within render)
  const daysUntilTrip = useMemo(() => {
    const now = Date.now()
    return Math.floor((new Date(tripStartDate).getTime() - now) / (1000 * 60 * 60 * 24))
  }, [tripStartDate])

  // Determine if this is a linked booking scenario
  const hasCompanion = !isCompanionBooking && !!companionBooking
  const hasPrimaryBooking = isCompanionBooking && !!primaryBooking

  // Calculate total price considering linked bookings
  const effectiveTotalPrice = (hasCompanion && cancelBothBookings)
    ? totalPrice + (companionBooking?.totalPrice || 0)
    : totalPrice

  // Calculate refund amount (client-side for display only - server validates)
  let refundAmount = 0
  let refundPercentage = 0
  const PROCESSING_FEE = 500 // $500

  if (daysUntilTrip > 60) {
    refundAmount = effectiveTotalPrice / 100 - PROCESSING_FEE
    refundPercentage = 100
  } else if (daysUntilTrip >= 30) {
    refundAmount = (effectiveTotalPrice / 100) * 0.5
    refundPercentage = 50
  }

  // Ensure refund amount is not negative
  if (refundAmount < 0) {
    refundAmount = 0
  }

  // Companion name for display
  const companionName = companionBooking?.guestFirstName && companionBooking?.guestLastName
    ? `${companionBooking.guestFirstName} ${companionBooking.guestLastName}`
    : 'Your Companion'

  const handleCancel = () => {
    cancelMutation.mutate({
      bookingId,
      cancelBothBookings: hasCompanion && cancelBothBookings,
      companionBookingId: hasCompanion && cancelBothBookings ? companionBooking?.id : undefined
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto z-50 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title id="modal-title" className="text-2xl font-serif font-bold text-gray-900 mb-2 pr-8">
            Cancel Booking
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description id="modal-description" className="text-gray-600 mb-6">
            Are you sure you want to cancel booking <strong className="font-semibold text-gray-900">{bookingReference}</strong>? This action cannot be undone.
          </Dialog.Description>

          {/* Linked Booking Warning (Primary booking with companion) */}
          {hasCompanion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Linked Companion Booking</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You have a linked companion booking for <strong>{companionName}</strong> ({companionBooking.bookingReference}).
                  </p>

                  {/* Cancellation Options */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="cancellation-option"
                        checked={!cancelBothBookings}
                        onChange={() => setCancelBothBookings(false)}
                        className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-700">Cancel only my booking</p>
                        <p className="text-sm text-gray-600">Companion booking remains active</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="cancellation-option"
                        checked={cancelBothBookings}
                        onChange={() => setCancelBothBookings(true)}
                        className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-700">Cancel both bookings</p>
                        <p className="text-sm text-gray-600">Cancels both your booking and the companion booking together</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linked Booking Info (Companion booking) */}
          {hasPrimaryBooking && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Companion Booking</h3>
                  <p className="text-sm text-gray-700">
                    This is a companion booking linked to primary booking <strong>{primaryBooking.bookingReference}</strong>.
                    Canceling this booking will only cancel your companion booking. The primary booking will remain active.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trip Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Trip Details</h3>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Trip:</span> {tripName}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Start Date:</span>{' '}
              {new Date(tripStartDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Total Paid:</span> ${(effectiveTotalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {hasCompanion && cancelBothBookings && (
                <span className="text-xs text-gray-600 ml-1">(2 bookings combined)</span>
              )}
            </p>
          </div>

          {/* Refund Policy Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Refund Policy</h3>
            <p className="text-sm text-gray-700 mb-3">
              Your trip is in <strong className="font-semibold text-blue-900">{daysUntilTrip} days</strong>.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className={`flex items-start gap-2 ${daysUntilTrip > 60 ? 'font-semibold text-green-700' : ''}`}>
                <span className="mt-0.5">{daysUntilTrip > 60 ? '✓' : '•'}</span>
                <span>More than 60 days: 100% refund minus $500 processing fee</span>
              </li>
              <li className={`flex items-start gap-2 ${daysUntilTrip >= 30 && daysUntilTrip <= 60 ? 'font-semibold text-green-700' : ''}`}>
                <span className="mt-0.5">{daysUntilTrip >= 30 && daysUntilTrip <= 60 ? '✓' : '•'}</span>
                <span>30-60 days: 50% refund</span>
              </li>
              <li className={`flex items-start gap-2 ${daysUntilTrip < 30 ? 'font-semibold text-red-700' : ''}`}>
                <span className="mt-0.5">{daysUntilTrip < 30 ? '✓' : '•'}</span>
                <span>Less than 30 days: Non-refundable (reschedule available)</span>
              </li>
            </ul>
          </div>

          {/* Refund Amount */}
          {refundAmount > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Refund Calculation</h3>
              <p className="text-sm text-gray-700 mb-1">
                Original price: ${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {refundPercentage === 100 && (
                <p className="text-sm text-gray-700 mb-1">
                  Processing fee: $500.00
                </p>
              )}
              {refundPercentage === 50 && (
                <p className="text-sm text-gray-700 mb-1">
                  Refund rate: 50%
                </p>
              )}
              <p className="text-lg font-semibold text-green-700 mt-2">
                You will receive: ${refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Refund will be processed to your original payment method within 5-10 business days.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2">Non-Refundable</h3>
              <p className="text-sm text-gray-700 mb-2">
                Since your trip is less than 30 days away, this booking is non-refundable.
              </p>
              <p className="text-sm text-gray-700">
                You can reschedule once instead of canceling. Contact our support team at{' '}
                <a href="mailto:support@pickleballpassport.com" className="text-blue-600 hover:text-blue-700 underline">
                  support@pickleballpassport.com
                </a>{' '}
                for assistance.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cancelMutation.isPending}
              >
                Keep Booking
              </button>
            </Dialog.Close>
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
