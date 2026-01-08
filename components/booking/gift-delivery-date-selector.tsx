'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { useBookingStore } from '@/lib/stores/booking-store'
import { Calendar, Send, Clock, AlertCircle } from 'lucide-react'

export function GiftDeliveryDateSelector() {
  const giftDeliveryOption = useBookingStore((state) => state.giftDeliveryOption)
  const giftDeliveryDate = useBookingStore((state) => state.giftDeliveryDate)
  const setGiftDeliveryOption = useBookingStore((state) => state.setGiftDeliveryOption)
  const setGiftDeliveryDate = useBookingStore((state) => state.setGiftDeliveryDate)

  const [localDate, setLocalDate] = useState(
    giftDeliveryDate ? new Date(giftDeliveryDate).toISOString().split('T')[0] : ''
  )
  const [dateError, setDateError] = useState<string | null>(null)

  // Calculate min and max dates
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const maxDate = oneYearFromNow.toISOString().split('T')[0]

  useEffect(() => {
    if (giftDeliveryDate) {
      setLocalDate(new Date(giftDeliveryDate).toISOString().split('T')[0])
    }
  }, [giftDeliveryDate])

  const handleDateChange = (value: string) => {
    setLocalDate(value)

    if (!value) {
      setDateError('Please select a delivery date')
      setGiftDeliveryDate(null)
      return
    }

    const selectedDate = new Date(value)
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    tomorrowDate.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < tomorrowDate) {
      setDateError('Delivery date must be at least tomorrow')
      setGiftDeliveryDate(null)
    } else if (selectedDate > new Date(maxDate)) {
      setDateError('Delivery date must be within one year')
      setGiftDeliveryDate(null)
    } else {
      setDateError(null)
      setGiftDeliveryDate(selectedDate)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-purple-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-purple-600" />
        <div>
          <Label className="text-base font-semibold text-gray-900">
            When should we send the gift notification?
          </Label>
          <p className="text-sm text-gray-600">
            Choose when the recipient receives their gift
          </p>
        </div>
      </div>

      {/* Radio Group */}
      <RadioGroup
        value={giftDeliveryOption}
        onValueChange={(value: string) => setGiftDeliveryOption(value as 'immediate' | 'scheduled')}
        className="space-y-3"
      >
        {/* Immediate Option */}
        <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
          <RadioGroupItem
            value="immediate"
            id="delivery-immediate"
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="delivery-immediate"
              className="flex cursor-pointer items-center gap-2 font-medium"
            >
              <Send className="h-4 w-4 text-purple-600" />
              Send immediately
            </Label>
            <p className="text-sm text-gray-600">
              Gift notification will be sent as soon as payment is confirmed
            </p>
          </div>
        </div>

        {/* Scheduled Option */}
        <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
          <RadioGroupItem
            value="scheduled"
            id="delivery-scheduled"
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="delivery-scheduled"
              className="flex cursor-pointer items-center gap-2 font-medium"
            >
              <Calendar className="h-4 w-4 text-purple-600" />
              Schedule for a specific date
            </Label>
            <p className="text-sm text-gray-600">
              Perfect for birthdays, anniversaries, or special occasions
            </p>
          </div>
        </div>
      </RadioGroup>

      {/* Date Picker (shown when scheduled is selected) */}
      {giftDeliveryOption === 'scheduled' && (
        <div className="space-y-3 rounded-lg bg-purple-50/50 p-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-date" className="font-medium">
              Select delivery date
            </Label>
            <Input
              id="delivery-date"
              type="date"
              value={localDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDate}
              max={maxDate}
              className="max-w-xs bg-white"
              aria-invalid={!!dateError}
              aria-describedby={dateError ? 'date-error' : 'date-help'}
            />

            {dateError && (
              <div id="date-error" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{dateError}</span>
              </div>
            )}

            <p id="date-help" className="text-xs text-gray-600">
              We'll send the gift notification at 9:00 AM PST on this date
            </p>
          </div>

          {localDate && !dateError && (
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Your gift will be delivered on{' '}
                <span className="font-semibold">
                  {new Date(localDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
