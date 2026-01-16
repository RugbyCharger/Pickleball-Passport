/**
 * Payment Page Client Component
 *
 * Handles client-side payment flow:
 * 1. Validates booking state
 * 2. Creates payment intent via tRPC
 * 3. Renders Stripe payment form
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/stores/booking-store'
import { trpc } from '@/lib/trpc/client'
import { StripeProvider } from '@/components/payments/stripe-provider'
import { PaymentForm } from '@/components/payments/payment-form'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

interface PaymentPageClientProps {
  userEmail: string
}

export function PaymentPageClient({ userEmail }: PaymentPageClientProps) {
  const router = useRouter()
  const {
    selectedPackage,
    duration,
    accommodationTier,
    selectedAddOns,
    referralCode,
    paymentPlan,
    isReadyForReview,
    calculateTotal,
    getDiscountedTotal,
    getInstallmentSchedule,
  } = useBookingStore()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntentMutation = trpc.booking.createPaymentIntent.useMutation()

  useEffect(() => {
    // Validate booking selections
    if (!isReadyForReview()) {
      router.push('/booking/configure')
      return
    }

    if (!selectedPackage || !duration || !accommodationTier) {
      router.push('/booking/configure')
      return
    }

    // Create payment intent
    const createIntent = async () => {
      try {
        const result = await createPaymentIntentMutation.mutateAsync({
          packageId: selectedPackage.id,
          duration,
          accommodationTier,
          addOnIds: selectedAddOns.map((a) => a.id),
          referralCode: referralCode || undefined,
          paymentPlan, // E4-S6: Include payment plan
        })

        setClientSecret(result.clientSecret)
        setBookingReference(result.bookingReference)
      } catch (err: unknown) {
        console.error('Payment intent creation failed:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.'
        setError(errorMessage)
      }
    }

    createIntent()
  }, []) // Run once on mount

  // Loading state
  if (createPaymentIntentMutation.isPending || (!clientSecret && !error)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">Preparing Your Payment</p>
            <p className="text-sm text-slate-600 mt-2">
              Securing your booking details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !clientSecret || !bookingReference) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-900">Payment Initialization Failed</h3>
            <p className="text-sm text-red-700 mt-2">
              {error || 'Unable to prepare payment. Please try again.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/booking/review')}
            className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </button>
        </div>
      </div>
    )
  }

  // Success - render payment form
  const totalAmount = getDiscountedTotal() // E4-S6: Use discounted total
  const installmentSchedule = paymentPlan === 'INSTALLMENT_4' ? getInstallmentSchedule() : []
  const paymentAmount = installmentSchedule.length > 0
    ? installmentSchedule[0].amount
    : totalAmount

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Payment Form */}
      <StripeProvider clientSecret={clientSecret}>
        <PaymentForm
          bookingReference={bookingReference}
          amount={paymentAmount}
          totalAmount={totalAmount}
          paymentPlan={paymentPlan}
          installmentSchedule={installmentSchedule}
        />
      </StripeProvider>
    </div>
  )
}
