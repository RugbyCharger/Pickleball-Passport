/**
 * Booking Modification Review Page
 *
 * E3-S16: Booking Modification (Change Add-Ons)
 *
 * Review modification changes before confirming. Shows:
 * - Added/removed add-ons comparison
 * - Price difference (charge or refund)
 * - Payment adjustment details
 * - Confirmation with terms acceptance
 */

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { ModificationReviewClient } from './review-client'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Review Modification | Pickleball Passport',
  description: 'Review your booking modification before confirming changes.',
}

interface PageProps {
  params: {
    bookingId: string
  }
}

export default async function ModificationReviewPage({ params }: PageProps) {
  const user = await currentUser()

  if (!user) {
    redirect(`/sign-in?redirect_url=/booking/modify/${params.bookingId}/review`)
  }

  // Fetch booking to verify ownership and eligibility
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      bookingAddOns: {
        include: {
          addOn: true,
        },
      },
      trip: true,
      package: true,
      user: true,
    },
  })

  if (!booking) {
    notFound()
  }

  // Verify user owns booking
  if (booking.userId !== user.id) {
    redirect('/dashboard/bookings')
  }

  // Verify booking is eligible for modification
  if (booking.status !== 'CONFIRMED') {
    redirect(`/dashboard/bookings/${booking.id}`)
  }

  if (!booking.trip) {
    redirect(`/dashboard/bookings/${booking.id}`)
  }

  // Calculate days until trip
  const tripStartDate = new Date(booking.trip.startDate)
  const now = new Date()
  const daysUntilTrip = Math.floor(
    (tripStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Verify >60 days before trip
  if (daysUntilTrip <= 60 || tripStartDate <= now) {
    redirect(`/dashboard/bookings/${booking.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              ✓
            </span>
            Modification Mode
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Review Changes
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Review your add-on modifications before confirming. Changes will take effect immediately.
          </p>
        </div>

        {/* Booking Reference */}
        <div className="mb-8 text-center">
          <p className="text-sm text-slate-600">
            Booking Reference:{' '}
            <span className="font-mono font-semibold text-slate-900">
              {booking.bookingReference}
            </span>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Trip: {booking.package.name} • {booking.duration} days
          </p>
        </div>

        {/* Main Content */}
        <ModificationReviewClient
          bookingId={booking.id}
          bookingReference={booking.bookingReference}
          packageName={booking.package.name}
          duration={booking.duration}
          currentAddOns={booking.bookingAddOns.map((ba: any) => ({
            id: ba.addOn.id,
            name: ba.addOn.name,
            description: ba.addOn.description,
            category: ba.addOn.category,
            thPrice: ba.price,
            usPrice: ba.addOn.usPrice,
          }))}
        />

        {/* Important Notes */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-sm font-bold text-blue-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Price increase:</strong> You will be charged immediately via your saved payment method
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Refunds:</strong> Processed within 5-10 business days to your original payment method
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Locked items:</strong> Base package, duration, and accommodation cannot be modified
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                <strong>Modification window:</strong> Changes allowed only 60+ days before trip departure
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
