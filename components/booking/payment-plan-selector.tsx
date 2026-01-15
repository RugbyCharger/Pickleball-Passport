'use client'

/**
 * Payment Plan Selector Component
 * E4-S6: Installment Payment Plans
 *
 * Allows guests to choose between payment options:
 * - Pay in Full (2% discount)
 * - 4-Payment Installment Plan
 * - Financing (Future - Affirm)
 */

import { useBookingStore, type PaymentPlan } from '@/lib/stores/booking-store'
import { formatCentsAsDollars } from '@/lib/utils/installment-calculator'
import { Check, CreditCard, Calendar, Building2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface PaymentOption {
  value: PaymentPlan
  title: string
  description: string
  icon: React.ReactNode
  badge?: {
    text: string
    variant: 'success' | 'primary' | 'secondary'
  }
  disabled?: boolean
}

export function PaymentPlanSelector() {
  const {
    paymentPlan,
    setPaymentPlan,
    calculateTotal,
    getDiscountedTotal,
    canUseInstallments,
    isGift,
    hasCompanion,
  } = useBookingStore()

  const total = calculateTotal()
  const discountedTotal = getDiscountedTotal()
  const discount = total - discountedTotal
  const canInstallments = canUseInstallments()

  // E4-S6: Disable installments for gift bookings and companion bookings (FULL payment only)
  const installmentsDisabled = isGift || hasCompanion || !canInstallments

  // E4-S6 Phase 7: Authorization checkbox for installment plans (AC-7)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)

  const paymentOptions: PaymentOption[] = [
    {
      value: 'FULL',
      title: 'Pay in Full',
      description: 'Single payment today with 2% savings',
      icon: <CreditCard className="h-5 w-5" />,
      badge: {
        text: 'Save 2%',
        variant: 'success',
      },
    },
    {
      value: 'INSTALLMENT_4',
      title: '4-Payment Installment Plan',
      description: 'Spread payments over time before your trip',
      icon: <Calendar className="h-5 w-5" />,
      badge: {
        text: 'Most Popular',
        variant: 'primary',
      },
      disabled: installmentsDisabled,
    },
    {
      value: 'FINANCING',
      title: 'Financing',
      description: 'Monthly payments with Affirm',
      icon: <Building2 className="h-5 w-5" />,
      badge: {
        text: 'Coming Soon',
        variant: 'secondary',
      },
      disabled: true,
    },
  ]

  const handleSelect = (value: PaymentPlan) => {
    // E4-S6 Phase 7: Clear error when switching plans
    setShowAuthError(false)
    setPaymentPlan(value)
  }

  // E4-S6 Phase 7: Validate authorization before allowing proceed
  const canProceed = paymentPlan !== 'INSTALLMENT_4' || isAuthorized

  return (
    <div className="space-y-6" data-testid="payment-plan-selector">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Options</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose how you'd like to pay for your booking
        </p>
      </div>

      {/* Payment Option Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {paymentOptions.map((option) => {
          const isSelected = paymentPlan === option.value
          const isDisabled = option.disabled

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && handleSelect(option.value)}
              disabled={isDisabled}
              data-testid={`payment-plan-${option.value.toLowerCase().replace('_', '-')}`}
              className={cn(
                'relative flex flex-col items-start rounded-lg border-2 p-6 text-left transition-all',
                'min-h-[200px]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isSelected && !isDisabled && 'border-blue-600 bg-blue-50',
                !isSelected && !isDisabled && 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50',
                isDisabled && 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
              )}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.title}: ${option.description}`}
            >
              {/* Badge */}
              {option.badge && (
                <span
                  data-testid={`payment-plan-${option.value.toLowerCase().replace('_', '-')}-badge`}
                  className={cn(
                    'absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold',
                    option.badge.variant === 'success' && 'bg-green-100 text-green-800',
                    option.badge.variant === 'primary' && 'bg-blue-100 text-blue-800',
                    option.badge.variant === 'secondary' && 'bg-gray-100 text-gray-800'
                  )}
                >
                  {option.badge.text}
                </span>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'mb-4 rounded-full p-3',
                isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600',
                isDisabled && 'bg-gray-100 text-gray-400'
              )}>
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>

                {/* Amount Display */}
                {option.value === 'FULL' && (
                  <div className="mt-4 space-y-1" data-testid="payment-plan-full-amount">
                    <p className="text-xs text-gray-500">Original: {formatCentsAsDollars(total)}</p>
                    <p className="text-xs text-green-600">Discount: -{formatCentsAsDollars(discount)}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCentsAsDollars(discountedTotal)}
                    </p>
                  </div>
                )}

                {option.value === 'INSTALLMENT_4' && !isDisabled && (
                  <div className="mt-4" data-testid="payment-plan-installment-4-amount">
                    <p className="text-sm text-gray-500">4 payments starting at:</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCentsAsDollars(Math.round(total * 0.5))} today
                    </p>
                  </div>
                )}

                {/* Disabled Message */}
                {isDisabled && option.value === 'INSTALLMENT_4' && (
                  <p className="mt-4 text-xs text-gray-500">
                    {isGift
                      ? 'Gift bookings must be paid in full'
                      : hasCompanion
                      ? 'Companion bookings must be paid in full'
                      : 'Installment plans require booking at least 70 days before departure'}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* E4-S6 Phase 7: Authorization Checkbox (AC-7) */}
      {paymentPlan === 'INSTALLMENT_4' && !installmentsDisabled && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="payment-method-authorization-checkbox"
                data-testid="payment-method-authorization-checkbox"
                checked={isAuthorized}
                onCheckedChange={(checked) => {
                  setIsAuthorized(checked as boolean)
                  setShowAuthError(false)
                }}
                aria-label="Authorize automatic installment payments"
                aria-describedby="authorization-text authorization-help"
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <Label
                  htmlFor="payment-method-authorization-checkbox"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  <span id="authorization-text" data-testid="authorization-text">
                    I authorize Pickleball Passport to charge my payment method for future installments on the scheduled dates
                  </span>
                </Label>
                <p
                  id="authorization-help"
                  className="text-xs text-gray-600"
                >
                  Your card will be securely saved for scheduled payments. You can update your payment method anytime in your dashboard.
                </p>
              </div>
            </div>

            {/* E4-S6 Phase 7: Authorization Error Message */}
            {showAuthError && (
              <div
                data-testid="authorization-error"
                className="mt-4 flex items-start space-x-2 rounded-md bg-red-50 p-3"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  Please check the authorization box to proceed with installment payments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> All prices are in USD. Payments are processed securely through Stripe.
          {paymentPlan === 'INSTALLMENT_4' && (
            <span className="ml-1">
              Remaining installments will be automatically charged to your saved payment method on scheduled dates.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
