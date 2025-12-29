'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import CancellationModal from './cancellation-modal'

interface CancelBookingButtonProps {
  bookingId: string
  bookingReference: string
  bookingStatus: string
  tripName: string
  tripStartDate: Date
  totalPrice: number
}

export default function CancelBookingButton({
  bookingId,
  bookingReference,
  bookingStatus,
  tripName,
  tripStartDate,
  totalPrice
}: CancelBookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Only show cancel button for CONFIRMED or PENDING_PAYMENT bookings
  const canCancel = bookingStatus === 'CONFIRMED' || bookingStatus === 'PENDING_PAYMENT'

  // Check if trip has already started
  const tripStarted = new Date(tripStartDate) <= new Date()

  // Hide button if:
  // - Booking is already CANCELLED or COMPLETED
  // - Trip has already started
  if (!canCancel || tripStarted) {
    return null
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel Booking
      </Button>

      <CancellationModal
        bookingId={bookingId}
        bookingReference={bookingReference}
        tripName={tripName}
        tripStartDate={tripStartDate}
        totalPrice={totalPrice}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
