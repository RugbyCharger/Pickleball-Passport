'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import ReschedulingModal from './rescheduling-modal'
import { BookingStatus } from '@prisma/client'

interface RescheduleBookingButtonProps {
  bookingId: string
  bookingReference: string
  bookingStatus: BookingStatus
  tripName: string
  tripStartDate: Date
  tripEndDate: Date
  rescheduleCount: number
}

export default function RescheduleBookingButton({
  bookingId,
  bookingReference,
  bookingStatus,
  tripName,
  tripStartDate,
  tripEndDate,
  rescheduleCount
}: RescheduleBookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate eligibility
  const now = new Date()
  const daysUntilTrip = Math.floor(
    (new Date(tripStartDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const tripHasStarted = new Date(tripStartDate) <= now
  const isEligible = daysUntilTrip < 30 && !tripHasStarted && rescheduleCount < 1
  const canShowButton = bookingStatus === 'CONFIRMED' || bookingStatus === 'PENDING_PAYMENT'
  const isDisabled = !isEligible || rescheduleCount >= 1 || tripHasStarted

  if (!canShowButton) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        disabled={isDisabled}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Reschedule Booking
      </Button>

      <ReschedulingModal
        bookingId={bookingId}
        bookingReference={bookingReference}
        currentTripName={tripName}
        currentTripStartDate={tripStartDate}
        currentTripEndDate={tripEndDate}
        rescheduleCount={rescheduleCount}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
