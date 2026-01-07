/**
 * Modification Review Client Component
 *
 * Handles client-side state for modification review:
 * - Compares original vs new add-ons from booking store
 * - Shows added/removed add-ons with price changes
 * - Manages terms acceptance checkbox
 * - Triggers booking.modify tRPC mutation
 * - Handles loading states and navigation
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore, type SelectedAddOn } from '@/lib/stores/booking-store'
import { trpc } from '@/lib/trpc/client'
import { Check, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { toast } from 'sonner'

interface ModificationReviewClientProps {
  bookingId: string
  bookingReference: string
  packageName: string
  duration: number
  currentAddOns: SelectedAddOn[]
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function ModificationReviewClient({
  bookingId,
  bookingReference,
  packageName,
  duration,
  currentAddOns,
}: ModificationReviewClientProps) {
  const router = useRouter()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const {
    selectedAddOns,
    originalAddOns,
    calculatePriceDifference,
    exitModificationMode,
  } = useBookingStore()

  const priceDifference = calculatePriceDifference()

  // Calculate original and new totals
  const originalTotal = currentAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)
  const newTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.thPrice, 0)

  // Determine added and removed add-ons
  const originalIds = currentAddOns.map((a) => a.id)
  const newIds = selectedAddOns.map((a) => a.id)

  const addedAddOns = selectedAddOns.filter((addOn) => !originalIds.includes(addOn.id))
  const removedAddOns = currentAddOns.filter((addOn) => !newIds.includes(addOn.id))
  const unchangedAddOns = selectedAddOns.filter((addOn) => originalIds.includes(addOn.id))

  // tRPC mutation
  const modifyBooking = trpc.booking.modify.useMutation({
    onSuccess: (data) => {
      // Exit modification mode
      exitModificationMode()

      // Show success message
      if (data.requiresPayment) {
        toast.success('Please complete payment to finalize your modification')
        // Redirect to payment page with client secret
        router.push(`/booking/payment?booking=${bookingId}&modification=true`)
      } else {
        toast.success('Booking modified successfully!')
        // Redirect to booking details
        router.push(`/dashboard/bookings/${bookingId}`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to modify booking. Please try again.')
    },
  })

  const handleConfirm = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms to continue')
      return
    }

    // Trigger mutation
    modifyBooking.mutate({
      bookingId,
      addOnIds: newIds,
    })
  }

  const handleBack = () => {
    router.push(`/booking/modify/${bookingId}`)
  }

  return (
    <div className="space-y-8">
      {/* Change Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Change Summary</h2>

        {/* Added Add-Ons */}
        {addedAddOns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700 mb-3">
              ✓ Added ({addedAddOns.length})
            </h3>
            <div className="space-y-2">
              {addedAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{addOn.name}</p>
                    <p className="text-xs text-slate-600">{addOn.category}</p>
                  </div>
                  <p className="font-bold text-green-700">+{formatPrice(addOn.thPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed Add-Ons */}
        {removedAddOns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700 mb-3">
              ✕ Removed ({removedAddOns.length})
            </h3>
            <div className="space-y-2">
              {removedAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 line-through">{addOn.name}</p>
                    <p className="text-xs text-slate-600">{addOn.category}</p>
                  </div>
                  <p className="font-bold text-red-700">-{formatPrice(addOn.thPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unchanged Add-Ons */}
        {unchangedAddOns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              = Unchanged ({unchangedAddOns.length})
            </h3>
            <div className="space-y-2">
              {unchangedAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{addOn.name}</p>
                    <p className="text-xs text-slate-500">{addOn.category}</p>
                  </div>
                  <p className="font-semibold text-slate-600">{formatPrice(addOn.thPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Changes */}
        {addedAddOns.length === 0 && removedAddOns.length === 0 && (
          <div className="rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">No changes detected</p>
            <p className="text-sm text-slate-500 mt-1">
              Your add-on selections are the same as before
            </p>
          </div>
        )}
      </div>

      {/* Price Comparison Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Price Comparison</h2>

        <div className="space-y-4">
          {/* Original Total */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Original Add-Ons Total</p>
            <p className="text-lg font-semibold text-slate-500 line-through">
              {formatPrice(originalTotal)}
            </p>
          </div>

          {/* New Total */}
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">New Add-Ons Total</p>
            <p className="text-2xl font-bold text-slate-900">{formatPrice(newTotal)}</p>
          </div>

          {/* Price Difference */}
          <div
            className={`flex items-center justify-between rounded-lg border-2 p-4 ${
              priceDifference > 0
                ? 'border-red-300 bg-red-50'
                : priceDifference < 0
                ? 'border-green-300 bg-green-50'
                : 'border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex-1">
              <p
                className={`font-bold ${
                  priceDifference > 0
                    ? 'text-red-900'
                    : priceDifference < 0
                    ? 'text-green-900'
                    : 'text-slate-900'
                }`}
              >
                {priceDifference > 0
                  ? 'Price Increase'
                  : priceDifference < 0
                  ? 'Price Decrease'
                  : 'No Price Change'}
              </p>
              <p
                className={`text-sm mt-1 ${
                  priceDifference > 0
                    ? 'text-red-700'
                    : priceDifference < 0
                    ? 'text-green-700'
                    : 'text-slate-600'
                }`}
              >
                {priceDifference > 0 && 'You will be charged the difference'}
                {priceDifference < 0 && 'Refund will be issued (5-10 business days)'}
                {priceDifference === 0 && 'No payment adjustment needed'}
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                priceDifference > 0
                  ? 'text-red-700'
                  : priceDifference < 0
                  ? 'text-green-700'
                  : 'text-slate-700'
              }`}
            >
              {priceDifference > 0 && '+'}
              {priceDifference < 0 && '-'}
              {formatPrice(Math.abs(priceDifference))}
            </p>
          </div>
        </div>
      </div>

      {/* Terms Acceptance */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-start gap-3">
          <Checkbox.Root
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
              termsAccepted
                ? 'border-emerald-600 bg-emerald-600'
                : 'border-slate-300 bg-white hover:border-emerald-400'
            }`}
            aria-label="Accept modification terms"
          >
            <Checkbox.Indicator>
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              I confirm these changes to my booking
            </p>
            <p className="text-xs text-slate-600 mt-1">
              I understand that price increases will be charged immediately and refunds will be
              processed within 5-10 business days. Modifications are only allowed 60+ days before
              trip departure.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={handleBack}
          disabled={modifyBooking.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Add-Ons
        </button>

        <button
          onClick={handleConfirm}
          disabled={!termsAccepted || modifyBooking.isPending || (addedAddOns.length === 0 && removedAddOns.length === 0)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {modifyBooking.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {priceDifference > 0 ? 'Processing Payment...' : 'Confirming Changes...'}
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Confirm Modification
            </>
          )}
        </button>
      </div>
    </div>
  )
}
