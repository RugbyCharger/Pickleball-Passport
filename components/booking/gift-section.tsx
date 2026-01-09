'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { GiftToggle } from './gift-toggle'
import { GiftRecipientForm } from './gift-recipient-form'
import { GiftMessageField } from './gift-message-field'
import { GiftDeliveryDateSelector } from './gift-delivery-date-selector'

/**
 * Gift Section Component
 *
 * Displays gift booking options in the booking flow.
 * Shows the gift toggle, and conditionally renders the gift
 * configuration fields when gift mode is enabled.
 *
 * Placement: After accommodation selection, before medical add-ons
 * (on the Add-Ons page in the booking flow)
 */
export function GiftSection() {
  const isGift = useBookingStore((state) => state.isGift)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Gift Options
        </h2>
        <p className="text-sm text-slate-600">
          Purchase this trip as a gift for someone special. They&apos;ll receive a personalized notification and can accept the gift when ready.
        </p>
      </div>

      {/* Gift Toggle */}
      <GiftToggle />

      {/* Gift Configuration (shown when toggle is enabled) */}
      {isGift && (
        <div className="mt-6 space-y-6">
          <GiftRecipientForm />
          <GiftMessageField />
          <GiftDeliveryDateSelector />
        </div>
      )}
    </div>
  )
}
