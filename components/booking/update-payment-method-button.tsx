/**
 * Update Payment Method Button
 * E4-S12: Update Payment Method
 *
 * Client component that displays an "Update Payment Method" button
 * for bookings with installment plans.
 *
 * Features:
 * - Fetches current payment method on file
 * - Shows card details (brand, last 4 digits)
 * - Opens modal for updating payment method
 */

'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { UpdatePaymentMethodModal } from './update-payment-method-modal'

interface UpdatePaymentMethodButtonProps {
  bookingId: string
  bookingReference: string
  /** Only show for installment plans */
  paymentPlan: 'FULL' | 'INSTALLMENT_4' | 'FINANCING'
  /** Must have a Stripe customer ID */
  hasStripeCustomer: boolean
  /** Optional: variant of the button */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** Optional: size of the button */
  size?: 'default' | 'sm' | 'lg'
  /** Optional: full width button */
  fullWidth?: boolean
}

export function UpdatePaymentMethodButton({
  bookingId,
  bookingReference,
  paymentPlan,
  hasStripeCustomer,
  variant = 'outline',
  size = 'default',
  fullWidth = false,
}: UpdatePaymentMethodButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch current payment methods
  const { data: paymentMethodsData, isLoading } = trpc.payment.getPaymentMethods.useQuery(
    { bookingId },
    {
      enabled: hasStripeCustomer && paymentPlan === 'INSTALLMENT_4',
    }
  )

  // Don't show for non-installment bookings
  if (paymentPlan !== 'INSTALLMENT_4') {
    return null
  }

  // Don't show if no Stripe customer (shouldn't happen for installments)
  if (!hasStripeCustomer) {
    return null
  }

  // Find current default payment method
  const currentPaymentMethod = paymentMethodsData?.paymentMethods.find(
    (pm) => pm.id === paymentMethodsData.defaultPaymentMethodId
  ) || paymentMethodsData?.paymentMethods[0] || null

  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'MC',
      amex: 'Amex',
      discover: 'Discover',
    }
    return brands[brand.toLowerCase()] || brand
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className={fullWidth ? 'w-full justify-start' : ''}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-4 w-4" />
        )}
        {currentPaymentMethod ? (
          <span>
            Update Card ({formatCardBrand(currentPaymentMethod.brand)} ...{currentPaymentMethod.last4})
          </span>
        ) : (
          <span>Update Payment Method</span>
        )}
      </Button>

      <UpdatePaymentMethodModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        bookingId={bookingId}
        bookingReference={bookingReference}
        currentPaymentMethod={currentPaymentMethod}
      />
    </>
  )
}
