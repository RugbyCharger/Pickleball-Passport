/**
 * Booking Confirmation Client Component
 *
 * E3-S10: Booking Confirmation Page
 *
 * Client component that fetches and displays complete booking details.
 * Handles loading state, error state, and triggers confirmation email.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ArrowRight,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  FileText,
  Home as HomeIcon,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

interface BookingConfirmationClientProps {
  bookingReference: string
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function formatAccommodationTier(tier: string): string {
  const tierMap: Record<string, string> = {
    LUXURY: 'Luxury (Four Seasons)',
    ULTRA_LUXURY: 'Ultra Luxury (Aman)',
    VILLA: 'Private Villa',
  }
  return tierMap[tier] || tier
}

export function BookingConfirmationClient({ bookingReference }: BookingConfirmationClientProps) {
  // Fetch booking details
  const { data: booking, isLoading, error } = trpc.booking.getBookingByReference.useQuery({
    bookingReference,
  })

  // Trigger email confirmation on component mount
  // TODO: Implement in E11 email workflow
  useEffect(() => {
    if (booking) {
      console.log('[Confirmation] Booking loaded, ready to send confirmation email:', {
        bookingReference: booking.bookingReference,
        email: 'user@example.com', // Would come from user context
      })
      // Future: Call tRPC mutation to send confirmation email
    }
  }, [booking])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Booking Not Found
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              We couldn't find a booking with reference {bookingReference}.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // E4-S11: Handle PENDING_PAYMENT status (Affirm canceled or still processing)
  if (booking.status === 'PENDING_PAYMENT') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 mb-6">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Payment Pending
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Your booking is reserved but payment hasn't been completed yet.
            </p>

            {/* Booking Reference */}
            <div className="mt-8 rounded-xl border-2 border-amber-200 bg-white p-6 shadow-lg">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                Booking Reference
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 tracking-wider">
                {booking.bookingReference}
              </p>
            </div>

            {/* Options */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-left">
              <h2 className="text-lg font-bold text-slate-900 mb-4">What would you like to do?</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-slate-900">Affirm Checkout Incomplete?</p>
                  <p className="text-xs text-slate-600 mt-1">
                    If you didn't complete the Affirm checkout or were declined, you can try a different payment method.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-slate-900">Want to try again?</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Return to the payment page to complete your booking with a different payment method.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/booking/payment?bookingRef=${booking.bookingReference}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <CreditCard className="h-5 w-5" />
                Complete Payment
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-6 relative">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Payment Successful!
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Your booking has been confirmed. We're excited for your Thailand adventure!
          </p>

          {/* Booking Reference */}
          <div className="mt-8 rounded-xl border-2 border-emerald-200 bg-white p-6 shadow-lg">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
              Booking Reference
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-wider">
              {booking.bookingReference}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Save this reference number for future correspondence
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Package:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {booking.package.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Duration:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {booking.duration} days
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Accommodation:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatAccommodationTier(booking.accommodationTier)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            {booking.trip && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">Trip Details</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Check-in</p>
                      <p className="text-sm text-slate-700">
                        {formatDate(booking.trip.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Check-out</p>
                      <p className="text-sm text-slate-700">
                        {formatDate(booking.trip.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Destination</p>
                      <p className="text-sm text-slate-700">{booking.trip.destination}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add-ons */}
            {booking.addOns.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Selected Add-Ons</h3>
                <div className="space-y-2">
                  {booking.addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{addOn.name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {addOn.category.toLowerCase()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPrice(addOn.price * addOn.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-900">Payment Summary</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-600">Base Package:</span>
                  <span className="text-sm text-slate-900">{formatPrice(booking.basePrice)}</span>
                </div>
                {booking.accommodationPrice > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Accommodation Upgrade:</span>
                    <span className="text-sm text-slate-900">
                      {formatPrice(booking.accommodationPrice)}
                    </span>
                  </div>
                )}
                {booking.addOnsTotal > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-slate-600">Add-Ons:</span>
                    <span className="text-sm text-slate-900">
                      {formatPrice(booking.addOnsTotal)}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-emerald-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Paid:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {booking.payment && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Payment Date:</span>
                    <span>{new Date(booking.payment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What's Next?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Confirmation Email</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Check your inbox for booking details and next steps
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Medical Consultation</p>
                    <p className="text-xs text-slate-600 mt-1">
                      We'll reach out within 24 hours to schedule your video consultation
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Trip Selection</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Choose your preferred trip dates from your dashboard
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pre-Trip Info</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Receive detailed itinerary 30 days before departure
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            View Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <HomeIcon className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        {/* Support Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Questions?{' '}
            <a href="mailto:Ryan@thepickleballpassport.org" className="text-emerald-600 hover:underline font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
