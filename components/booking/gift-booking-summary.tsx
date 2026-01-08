/**
 * Gift Booking Summary Component
 *
 * E3-S18: Gift Booking Story Implementation
 *
 * Displays gift booking details on the review page.
 * Shows purchaser info, recipient info, gift message, and delivery date.
 *
 * Features:
 * - Prominent gift indicator badge
 * - Purchaser information
 * - Recipient information
 * - Gift message display
 * - Delivery date display
 * - Edit functionality
 * - Responsive design
 */

'use client'

import { useBookingStore } from '@/lib/stores/booking-store'
import { Gift, User, Mail, Phone, Calendar, MessageSquare, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export function GiftBookingSummary() {
  const router = useRouter()
  const { user } = useUser()
  const {
    isGift,
    giftRecipient,
    giftMessage,
    giftDeliveryOption,
    giftDeliveryDate,
  } = useBookingStore()

  // Don't render if gift mode is not enabled
  if (!isGift || !giftRecipient) {
    return null
  }

  const formatDeliveryDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md">
      {/* Gift Badge */}
      <div className="flex items-center gap-3 border-b border-purple-200 bg-purple-100/50 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-purple-900">🎁 This is a Gift Booking</h2>
          <p className="text-sm text-purple-700">
            You're purchasing this trip for someone special
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Section 1: Purchaser Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-4 w-4 text-purple-600" />
              Your Information (Purchaser)
            </h3>
          </div>

          <div className="rounded-lg bg-white p-4 space-y-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <div className="pt-2 text-sm text-purple-700 bg-purple-50 rounded px-3 py-2">
              ✓ You are purchasing this trip as a gift
            </div>
          </div>
        </div>

        {/* Section 2: Gift Recipient */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Gift className="h-4 w-4 text-purple-600" />
              Gift Recipient
            </h3>
            <button
              onClick={() => router.push('/booking/configuration')}
              className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              aria-label="Edit recipient information"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="rounded-lg bg-white p-4 space-y-3">
            {/* Name */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Recipient Name</p>
              <p className="text-sm font-medium text-gray-900">
                {giftRecipient.firstName} {giftRecipient.lastName}
              </p>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{giftRecipient.email}</p>
              </div>
            </div>

            {/* Phone (if provided) */}
            {giftRecipient.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{giftRecipient.phone}</p>
                </div>
              </div>
            )}

            {/* Date of Birth (if provided) */}
            {giftRecipient.dateOfBirth && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">
                    {new Date(giftRecipient.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Gift Message (if provided) */}
        {giftMessage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Your Personal Message
              </h3>
              <button
                onClick={() => router.push('/booking/configuration')}
                className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                aria-label="Edit gift message"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>

            <div className="rounded-lg bg-white p-4 border-l-4 border-purple-400">
              <p className="text-sm italic text-gray-700">"{giftMessage}"</p>
            </div>
          </div>
        )}

        {/* Section 4: Delivery Date */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Calendar className="h-4 w-4 text-purple-600" />
              Gift Delivery
            </h3>
            <button
              onClick={() => router.push('/booking/configuration')}
              className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              aria-label="Edit delivery date"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="rounded-lg bg-white p-4">
            {giftDeliveryOption === 'immediate' ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <Gift className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Send immediately</p>
                  <p className="text-xs text-gray-600">
                    Gift notification will be sent as soon as payment is confirmed
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled delivery</p>
                  <p className="text-xs text-gray-600">
                    {giftDeliveryDate ? formatDeliveryDate(giftDeliveryDate) : 'Date not set'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gift will be sent at 9:00 AM PST
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Note */}
        <div className="rounded-lg bg-purple-100 p-4 border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>Important:</strong> Payment will be charged to your account. The recipient will receive
            a beautiful gift notification email and can accept the gift to start planning their trip.
          </p>
        </div>
      </div>
    </div>
  )
}
