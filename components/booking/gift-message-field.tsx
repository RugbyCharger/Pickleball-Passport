'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBookingStore } from '@/lib/stores/booking-store'
import { MessageSquare } from 'lucide-react'

const MAX_CHARACTERS = 500

export function GiftMessageField() {
  const giftMessage = useBookingStore((state) => state.giftMessage)
  const setGiftMessage = useBookingStore((state) => state.setGiftMessage)

  const [localMessage, setLocalMessage] = useState(giftMessage)
  const remainingChars = MAX_CHARACTERS - localMessage.length

  useEffect(() => {
    setLocalMessage(giftMessage)
  }, [giftMessage])

  const handleChange = (value: string) => {
    // Enforce character limit
    if (value.length <= MAX_CHARACTERS) {
      setLocalMessage(value)
      setGiftMessage(value)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-purple-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        <div>
          <Label htmlFor="gift-message" className="text-base font-semibold text-gray-900">
            Add a personal message
          </Label>
          <p className="text-sm text-gray-600">
            Write a heartfelt message to accompany your gift (optional)
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <Textarea
          id="gift-message"
          value={localMessage}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write a heartfelt message to accompany your gift..."
          className="min-h-[120px] resize-y bg-purple-50/30"
          aria-label="Personal message for recipient"
          aria-describedby="gift-message-counter"
        />

        {/* Character Counter */}
        <div
          id="gift-message-counter"
          className="flex items-center justify-between text-sm"
          aria-live="polite"
        >
          <span className="text-gray-500">
            This message will be included in the gift notification email
          </span>
          <span
            className={
              remainingChars < 50
                ? 'font-medium text-amber-600'
                : 'text-gray-500'
            }
          >
            {remainingChars} / {MAX_CHARACTERS} characters remaining
          </span>
        </div>
      </div>

      {/* Preview */}
      {localMessage.trim() && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Preview</Label>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm italic text-gray-700">"{localMessage}"</p>
          </div>
        </div>
      )}
    </div>
  )
}
