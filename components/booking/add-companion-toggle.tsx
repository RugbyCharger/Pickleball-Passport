'use client'

import { Users } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useBookingStore } from '@/lib/stores/booking-store'

export function AddCompanionToggle() {
  const hasCompanion = useBookingStore((state) => state.hasCompanion)
  const toggleCompanion = useBookingStore((state) => state.toggleCompanion)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-blue-50 p-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <Label
              htmlFor="companion-toggle"
              className="text-base font-semibold text-slate-900 cursor-pointer"
            >
              Traveling with someone? Add a companion booking
            </Label>
            <p className="mt-1 text-sm text-slate-600">
              Book for a friend or spouse on the same trip. Share a room for free or choose separate accommodations.
            </p>
          </div>
        </div>
        <Switch
          id="companion-toggle"
          checked={hasCompanion}
          onCheckedChange={toggleCompanion}
          aria-label="Add companion booking"
          className="mt-1"
        />
      </div>

      {/* Companion benefits */}
      {!hasCompanion && (
        <div className="mt-4 rounded-md bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900 mb-2">
            Companion Booking Benefits:
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Share accommodation for FREE (no additional room charge)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Independent package and add-ons selection</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Single combined payment for both bookings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Option for separate rooms if preferred</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
