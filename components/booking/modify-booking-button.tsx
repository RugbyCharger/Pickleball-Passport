'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Edit } from 'lucide-react'
import ModificationModal from './modification-modal'
import { BookingStatus } from '@prisma/client'
import { canModifyBooking } from '@/lib/utils/date-validation'

interface ModifyBookingButtonProps {
  bookingId: string
  bookingReference: string
  bookingStatus: BookingStatus
  tripStartDate: Date
  tripAssigned: boolean
  currentAddOns: Array<{
    id: string
    name: string
    price: number
  }>
  packageName: string
  duration: number
  accommodationTier: string
  currentTotal: number
}

export default function ModifyBookingButton({
  bookingId,
  bookingReference,
  bookingStatus,
  tripStartDate,
  tripAssigned,
  currentAddOns,
  packageName,
  duration,
  accommodationTier,
  currentTotal,
}: ModifyBookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check eligibility using utility function
  const eligibility = canModifyBooking(tripStartDate, bookingStatus, tripAssigned)
  const isEligible = eligibility.canModify

  // Don't show button if trip not assigned
  if (!tripAssigned) {
    return null
  }

  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsModalOpen(true)}
      disabled={!isEligible}
      className="gap-2"
      aria-label="Modify booking add-ons"
    >
      <Edit className="h-4 w-4" />
      Modify Add-Ons
    </Button>
  )

  return (
    <>
      {isEligible ? (
        buttonContent
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent>
              <p>{eligibility.reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <ModificationModal
        bookingId={bookingId}
        bookingReference={bookingReference}
        packageName={packageName}
        duration={duration}
        accommodationTier={accommodationTier}
        currentAddOns={currentAddOns}
        currentTotal={currentTotal}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
