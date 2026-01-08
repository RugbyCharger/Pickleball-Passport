'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Gift } from 'lucide-react'
import { useBookingStore } from '@/lib/stores/booking-store'

export function GiftToggle() {
  const isGift = useBookingStore((state) => state.isGift)
  const toggleGift = useBookingStore((state) => state.toggleGift)
  const hasCompanion = useBookingStore((state) => state.hasCompanion)

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
          <Gift className="h-5 w-5 text-purple-600" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="gift-toggle"
                className="text-base font-semibold text-gray-900"
              >
                Purchase this trip as a gift for someone special
              </Label>
              <p className="text-sm text-gray-600">
                Send this transformative experience to a loved one. You'll handle payment,
                and they'll receive a beautiful gift notification.
              </p>
            </div>

            <Switch
              id="gift-toggle"
              checked={isGift}
              onCheckedChange={toggleGift}
              disabled={hasCompanion}
              aria-label="Purchase as a gift"
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {hasCompanion && (
            <p className="text-sm text-amber-600">
              Gift mode is not available for companion bookings. Please disable companion booking first.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
