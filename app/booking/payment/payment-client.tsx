/**
 * Payment Page Client Component
 *
 * Handles client-side payment flow:
 * 1. Validates booking state
 * 2. Creates payment intent via tRPC
 * 3. Renders Stripe payment form
 *
 * E4-S13: Multi-currency support with currency selector
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/stores/booking-store'
import { trpc } from '@/lib/trpc/client'
import { StripeProvider } from '@/components/payments/stripe-provider'
import { PaymentForm } from '@/components/payments/payment-form'
import { CurrencySelector } from '@/components/payments/currency-selector'
import { Loader2, AlertCircle, ArrowLeft, Gift } from 'lucide-react'
import { getExchangeRates, type SupportedCurrency } from '@/lib/services/currency'

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
    selectedTripId,
    referralCode,
    paymentPlan,
    currency,
    setCurrency,
    setExchangeRates,
    isReadyForReview,
    calculateTotal,
    getDiscountedTotal,
    getInstallmentSchedule,
    formatDisplayPrice,
    // Gift booking fields (E3-S18)
    isGift,
    giftRecipient,
    giftMessage,
    giftDeliveryOption,
    giftDeliveryDate,
    validateGiftBooking,
  } = useBookingStore()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentCurrency, setPaymentCurrency] = useState<SupportedCurrency>(currency)

  const createPaymentIntentMutation = trpc.booking.createPaymentIntent.useMutation()
  const createGiftMutation = trpc.booking.createGift.useMutation()

  // Fetch exchange rates on mount
  useEffect(() => {
    getExchangeRates().then(setExchangeRates).catch(console.error)
  }, [setExchangeRates])

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
        // Gift booking flow (E3-S18)
        if (isGift) {
          // Validate gift data before calling mutation
          const giftValidation = validateGiftBooking()
          if (!giftValidation.isValid) {
            setError(giftValidation.errors.join(', '))
            return
          }

          if (!giftRecipient) {
            setError('Gift recipient information is required')
            return
          }

          const result = await createGiftMutation.mutateAsync({
            packageId: selectedPackage.id,
            tripId: selectedTripId || undefined,
            duration,
            accommodationTier,
            addOnIds: selectedAddOns.map((a) => a.id),
            referralCode: referralCode || undefined,
            giftRecipient: {
              firstName: giftRecipient.firstName,
              lastName: giftRecipient.lastName,
              email: giftRecipient.email,
              phone: giftRecipient.phone || undefined,
              dateOfBirth: giftRecipient.dateOfBirth || undefined,
            },
            giftMessage: giftMessage || undefined,
            giftDeliveryDate:
              giftDeliveryOption === 'scheduled' && giftDeliveryDate
                ? giftDeliveryDate.toISOString()
                : undefined,
          })

          setClientSecret(result.clientSecret)
          setBookingReference(result.bookingReference)
          return
        }

        // Standard booking flow
        const result = await createPaymentIntentMutation.mutateAsync({
          packageId: selectedPackage.id,
          duration,
          accommodationTier,
          addOnIds: selectedAddOns.map((a) => a.id),
          referralCode: referralCode || undefined,
          paymentPlan: paymentPlan === 'DEPOSIT_20' ? 'FULL' : paymentPlan, // E4-S6: Map DEPOSIT_20 to FULL (not in Prisma enum)
          currency: paymentCurrency, // E4-S13: Include selected currency
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
  }, [paymentCurrency, isGift]) // Re-run when currency or gift mode changes

  // Handle currency change
  const handleCurrencyChange = (newCurrency: SupportedCurrency) => {
    setPaymentCurrency(newCurrency)
    setCurrency(newCurrency)
    // Reset payment state to recreate intent with new currency
    setClientSecret(null)
    setBookingReference(null)
    setError(null)
  }

  // Loading state
  if (createPaymentIntentMutation.isPending || createGiftMutation.isPending || (!clientSecret && !error)) {
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
      {/* Gift Purchase Indicator (E3-S18) */}
      {isGift && giftRecipient && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
              <Gift className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900">
                Gift Purchase for {giftRecipient.firstName} {giftRecipient.lastName}
              </h3>
              <p className="mt-1 text-xs text-purple-700">
                This booking will be sent to {giftRecipient.email}
                {giftDeliveryOption === 'scheduled' && giftDeliveryDate
                  ? ` on ${giftDeliveryDate.toLocaleDateString()}`
                  : ' immediately after payment'}
              </p>
              {giftMessage && (
                <p className="mt-2 text-xs italic text-purple-600">
                  &quot;{giftMessage.length > 100 ? giftMessage.slice(0, 100) + '...' : giftMessage}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Currency Selector - E4-S13 (not available for gift bookings) */}
      {!isGift && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Payment Currency</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred payment currency
              </p>
            </div>
            <CurrencySelector
              value={paymentCurrency}
              onChange={handleCurrencyChange}
              showLabel={false}
              size="md"
            />
          </div>
          {paymentCurrency !== 'USD' && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2">
              Prices are converted from USD at current exchange rates. Your card will be charged in {paymentCurrency}.
            </p>
          )}
        </div>
      )}

      {/* Payment Form */}
      <StripeProvider clientSecret={clientSecret}>
        <PaymentForm
          bookingReference={bookingReference}
          amount={paymentAmount}
          totalAmount={totalAmount}
          paymentPlan={paymentPlan === 'DEPOSIT_20' ? 'FULL' : paymentPlan}
          installmentSchedule={installmentSchedule}
          currency={paymentCurrency}
        />
      </StripeProvider>
    </div>
  )
}
