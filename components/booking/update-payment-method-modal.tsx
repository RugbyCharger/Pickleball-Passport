/**
 * Update Payment Method Modal
 * E4-S12: Update Payment Method
 *
 * Modal component for updating saved payment method for installment plans.
 * Uses Stripe Elements with SetupIntent for secure card collection.
 *
 * Features:
 * - Display current payment method on file
 * - Stripe Elements for new card input
 * - Success/error state handling
 * - Confirmation message
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/get-stripe'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CreditCard, Loader2, Lock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UpdatePaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  bookingReference: string
  currentPaymentMethod?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  } | null
}

/**
 * Inner form component that uses Stripe hooks
 */
function UpdatePaymentForm({
  bookingId,
  onSuccess,
  onCancel,
}: {
  bookingId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateDefaultPaymentMethod = trpc.payment.updateDefaultPaymentMethod.useMutation({
    onSuccess: () => {
      toast.success('Payment method updated successfully')
      router.refresh()
      onSuccess()
    },
    onError: (err) => {
      setError(err.message)
      setIsProcessing(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm the SetupIntent
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/bookings/${bookingId}`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Failed to save payment method')
        setIsProcessing(false)
        return
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Get the payment method ID from the SetupIntent
        const paymentMethodId = setupIntent.payment_method as string

        // Update the default payment method via tRPC
        await updateDefaultPaymentMethod.mutateAsync({
          bookingId,
          paymentMethodId,
        })
      } else {
        setError('Payment method setup incomplete. Please try again.')
        setIsProcessing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900">New Payment Method</h4>
        </div>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-900">Secure Payment</p>
            <p className="text-xs text-emerald-700 mt-1">
              Your payment information is encrypted and secure. Future installments will be charged to this card.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-gradient-to-r from-emerald-600 to-blue-600"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Save Payment Method
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

/**
 * Main modal component
 */
export function UpdatePaymentMethodModal({
  open,
  onOpenChange,
  bookingId,
  bookingReference,
  currentPaymentMethod,
}: UpdatePaymentMethodModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const createSetupIntent = trpc.payment.createSetupIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret)
      setIsLoading(false)
    },
    onError: (err) => {
      setError(err.message)
      setIsLoading(false)
    },
  })

  // Create SetupIntent when modal opens
  useEffect(() => {
    if (open && !clientSecret && !isSuccess) {
      setIsLoading(true)
      setError(null)
      createSetupIntent.mutate({ bookingId })
    }
  }, [open, bookingId, clientSecret, isSuccess])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow closing animation
      const timer = setTimeout(() => {
        setClientSecret(null)
        setError(null)
        setIsSuccess(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleSuccess = () => {
    setIsSuccess(true)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const stripePromise = getStripe()

  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
    }
    return brands[brand.toLowerCase()] || brand
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Update Payment Method
          </DialogTitle>
          <DialogDescription>
            Update the payment method for booking {bookingReference}
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {isSuccess && (
          <div className="space-y-6 py-4">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Payment Method Updated!
              </h3>
              <p className="text-sm text-slate-600">
                Your new payment method has been saved and will be used for future installment payments.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isSuccess && (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            <p className="mt-4 text-sm text-slate-600">Preparing secure form...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && !isSuccess && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Failed to load</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  createSetupIntent.mutate({ bookingId })
                }}
              >
                Try Again
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Form State */}
        {clientSecret && !isLoading && !error && !isSuccess && (
          <div className="space-y-6 py-4">
            {/* Current Payment Method */}
            {currentPaymentMethod && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-2">Current Payment Method</p>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCardBrand(currentPaymentMethod.brand)} ending in {currentPaymentMethod.last4}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires {currentPaymentMethod.expMonth}/{currentPaymentMethod.expYear}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Elements Form */}
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#10b981',
                    colorBackground: '#ffffff',
                    colorText: '#0f172a',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <UpdatePaymentForm
                bookingId={bookingId}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </Elements>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
