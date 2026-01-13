'use client'

/**
 * Installment Schedule Display Component
 * E4-S6: Installment Payment Plans
 *
 * Displays the 4-payment installment schedule with dates and amounts
 */

import { useBookingStore } from '@/lib/stores/booking-store'
import { formatCentsAsDollars } from '@/lib/utils/installment-calculator'
import { format } from 'date-fns'
import { Calendar, CreditCard, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InstallmentScheduleDisplay() {
  const { paymentPlan, getInstallmentSchedule, calculateTotal } = useBookingStore()

  // Only show if installment plan is selected
  if (paymentPlan !== 'INSTALLMENT_4') {
    return null
  }

  const schedule = getInstallmentSchedule()
  const total = calculateTotal()

  if (schedule.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
        <p className="mt-1 text-sm text-gray-600">
          Your booking will be divided into 4 payments
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Installment
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Due Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {schedule.map((installment, index) => {
              const isFirst = index === 0

              return (
                <tr
                  key={installment.number}
                  className={cn(
                    isFirst && 'bg-blue-50'
                  )}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        {installment.number}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Installment {installment.number} of 4
                        </div>
                        <div className="text-sm text-gray-500">
                          {installment.percentage} of total
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCentsAsDollars(installment.amount)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {format(installment.dueDate, 'MMM d, yyyy')}
                    </div>
                    {isFirst && (
                      <div className="mt-1 text-xs text-blue-600 font-medium">
                        Due today
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {isFirst ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                        <Calendar className="mr-1 h-3 w-3" />
                        Scheduled
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">
                Total
              </td>
              <td colSpan={2} className="px-6 py-4 text-lg font-bold text-gray-900">
                {formatCentsAsDollars(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {schedule.map((installment, index) => {
          const isFirst = index === 0

          return (
            <div
              key={installment.number}
              className={cn(
                'rounded-lg border-2 p-4',
                isFirst ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {installment.number}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Installment {installment.number} of 4
                    </div>
                    <div className="text-xs text-gray-500">
                      {installment.percentage} of total
                    </div>
                  </div>
                </div>
                {isFirst ? (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    Scheduled
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCentsAsDollars(installment.amount)}
                </div>
              </div>

              {/* Due Date */}
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Due {format(installment.dueDate, 'MMMM d, yyyy')}</span>
              </div>

              {isFirst && (
                <div className="mt-2 text-xs font-medium text-blue-600">
                  This payment will be charged today
                </div>
              )}
            </div>
          )
        })}

        {/* Total */}
        <div className="rounded-lg border-2 border-gray-900 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total (4 installments)</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCentsAsDollars(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex items-start rounded-lg bg-blue-50 p-4">
        <Info className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold">About automatic payments:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Payments 2-4 will be automatically charged to your saved payment method on the scheduled dates</li>
            <li>You'll receive email reminders 7 days before each automatic payment</li>
            <li>You can update your payment method anytime in your dashboard</li>
            <li>All payments must be completed before your trip departure date</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
