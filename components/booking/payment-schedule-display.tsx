/**
 * Payment Schedule Display Component
 *
 * E4-S6: Installment Payment Plans
 *
 * Displays the payment schedule for bookings with installment plans.
 * Shows all installments with their amounts, due dates, and payment status.
 *
 * Features:
 * - Visual timeline of payments
 * - Status indicators (paid, pending, upcoming)
 * - Due date highlighting
 * - Total amount breakdown
 * - Responsive design
 * - Accessibility support
 */

'use client'

import { CheckCircle, Clock, AlertCircle, Calendar, CreditCard } from 'lucide-react'
import { useMemo } from 'react'

export interface PaymentScheduleItem {
  id: string
  number: number
  amount: number // in cents
  dueDate: Date
  status: 'PAID' | 'PENDING' | 'UPCOMING' | 'OVERDUE'
  paidDate?: Date
  paymentIntentId?: string
}

interface PaymentScheduleDisplayProps {
  bookingReference: string
  totalAmount: number // in cents
  schedule: PaymentScheduleItem[]
  showTitle?: boolean
  compact?: boolean
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getStatusConfig(status: PaymentScheduleItem['status']) {
  switch (status) {
    case 'PAID':
      return {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-900',
        label: 'Paid',
      }
    case 'PENDING':
      return {
        icon: Clock,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        label: 'Processing',
      }
    case 'UPCOMING':
      return {
        icon: Calendar,
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        iconColor: 'text-slate-600',
        textColor: 'text-slate-900',
        label: 'Upcoming',
      }
    case 'OVERDUE':
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
        label: 'Overdue',
      }
  }
}

export function PaymentScheduleDisplay({
  bookingReference,
  totalAmount,
  schedule,
  showTitle = true,
  compact = false,
}: PaymentScheduleDisplayProps) {
  // Calculate totals
  const { paidAmount, pendingAmount, upcomingAmount } = useMemo(() => {
    const paid = schedule
      .filter((item) => item.status === 'PAID')
      .reduce((sum, item) => sum + item.amount, 0)
    const pending = schedule
      .filter((item) => item.status === 'PENDING' || item.status === 'OVERDUE')
      .reduce((sum, item) => sum + item.amount, 0)
    const upcoming = schedule
      .filter((item) => item.status === 'UPCOMING')
      .reduce((sum, item) => sum + item.amount, 0)

    return { paidAmount: paid, pendingAmount: pending, upcomingAmount: upcoming }
  }, [schedule])

  const percentPaid = Math.round((paidAmount / totalAmount) * 100)

  // Find next payment due
  const nextPayment = useMemo(() => {
    return schedule.find(
      (item) => item.status === 'UPCOMING' || item.status === 'PENDING' || item.status === 'OVERDUE'
    )
  }, [schedule])

  return (
    <div className="space-y-6">
      {/* Header */}
      {showTitle && (
        <div>
          <h3 className="text-lg font-bold text-slate-900">Payment Schedule</h3>
          <p className="text-sm text-slate-600 mt-1">
            4-installment payment plan for booking {bookingReference}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Payment Progress</span>
          <span className="font-bold text-emerald-600">{percentPaid}% Complete</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${percentPaid}%` }}
            role="progressbar"
            aria-valuenow={percentPaid}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Payment progress: ${percentPaid}% complete`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Paid: {formatPrice(paidAmount)}</span>
          <span>Remaining: {formatPrice(totalAmount - paidAmount)}</span>
        </div>
      </div>

      {/* Next Payment Alert */}
      {nextPayment && nextPayment.status !== 'PAID' && (
        <div
          className={`rounded-lg p-4 ${
            nextPayment.status === 'OVERDUE'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <CreditCard
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                nextPayment.status === 'OVERDUE' ? 'text-red-600' : 'text-blue-600'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  nextPayment.status === 'OVERDUE' ? 'text-red-900' : 'text-blue-900'
                }`}
              >
                {nextPayment.status === 'OVERDUE' ? 'Payment Overdue' : 'Next Payment Due'}
              </p>
              <p
                className={`text-sm mt-1 ${
                  nextPayment.status === 'OVERDUE' ? 'text-red-700' : 'text-blue-700'
                }`}
              >
                {formatPrice(nextPayment.amount)} on {formatDate(nextPayment.dueDate)}
                {nextPayment.status === 'OVERDUE' && ' - Please update your payment method'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Schedule */}
      <div className="space-y-3">
        {schedule.map((item, index) => {
          const config = getStatusConfig(item.status)
          const Icon = config.icon
          const isLast = index === schedule.length - 1

          if (compact && item.status === 'PAID' && schedule.length > 2) {
            // In compact mode, skip showing all paid items except the first
            if (index > 0) return null
          }

          return (
            <div key={item.id} className="relative">
              {/* Connecting Line */}
              {!isLast && !compact && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Payment Item */}
              <div
                className={`relative rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      item.status === 'PAID' ? 'bg-emerald-100' : 'bg-white border-2 ' + config.borderColor
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${config.textColor}`}>
                          Payment {item.number} of 4
                          {item.status === 'PAID' && item.paidDate && (
                            <span className="font-normal text-xs ml-2">
                              • Paid {formatDate(item.paidDate)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.status === 'PAID' ? 'Completed' : `Due ${formatFullDate(item.dueDate)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${config.textColor}`}>
                          {formatPrice(item.amount)}
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'PENDING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {item.status === 'UPCOMING' && (
                      <p className="text-xs text-slate-600 mt-2">
                        Will be automatically charged to your saved payment method
                      </p>
                    )}
                    {item.status === 'OVERDUE' && (
                      <p className="text-xs text-red-700 mt-2">
                        Please update your payment method to complete this payment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {!compact && (
        <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Total Package Price</span>
            <span className="text-xl font-bold text-slate-900">{formatPrice(totalAmount)}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Paid to date:</span>
              <span className="font-semibold text-emerald-700">{formatPrice(paidAmount)}</span>
            </div>
            {pendingAmount > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Pending/Overdue:</span>
                <span className="font-semibold text-red-700">{formatPrice(pendingAmount)}</span>
              </div>
            )}
            {upcomingAmount > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Upcoming payments:</span>
                <span className="font-semibold text-slate-700">{formatPrice(upcomingAmount)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
