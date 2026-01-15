import type { PaymentRecord, PaymentRecordStatus } from '@prisma/client'

export interface PaymentRecordFactoryOptions {
  id?: string
  bookingId?: string
  amountCents?: number
  status?: PaymentRecordStatus
  dueDate?: Date
  paidDate?: Date | null
  percentage?: number | null
  installmentNumber?: number | null
  stripePaymentIntentId?: string | null
  retryCount?: number
  lastAttemptAt?: Date | null
  failureReason?: string | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Factory for creating PaymentRecord test data
 */
export function createPaymentRecord(
  options: PaymentRecordFactoryOptions = {}
): Omit<PaymentRecord, 'booking'> {
  const now = new Date()

  return {
    id: options.id ?? `test-payment-${Date.now()}`,
    bookingId: options.bookingId ?? `test-booking-${Date.now()}`,
    amountCents: options.amountCents ?? 100000, // $1000
    status: options.status ?? 'PENDING',
    dueDate: options.dueDate ?? now,
    paidDate: options.paidDate === undefined ? null : options.paidDate,
    percentage: options.percentage === undefined ? null : options.percentage,
    installmentNumber: options.installmentNumber === undefined ? null : options.installmentNumber,
    stripePaymentIntentId: options.stripePaymentIntentId === undefined ? null : options.stripePaymentIntentId,
    retryCount: options.retryCount ?? 0,
    lastAttemptAt: options.lastAttemptAt === undefined ? null : options.lastAttemptAt,
    failureReason: options.failureReason === undefined ? null : options.failureReason,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  }
}

/**
 * Create an installment payment record
 */
export function createInstallmentPayment(
  installmentNumber: 1 | 2 | 3 | 4,
  options: Partial<PaymentRecordFactoryOptions> = {}
): Omit<PaymentRecord, 'booking'> {
  const percentages = { 1: 50, 2: 25, 3: 15, 4: 10 }
  const percentage = percentages[installmentNumber]

  return createPaymentRecord({
    ...options,
    percentage,
    installmentNumber,
  })
}

/**
 * Create a failed payment with retry information
 */
export function createFailedPayment(
  retryCount: number,
  options: Partial<PaymentRecordFactoryOptions> = {}
): Omit<PaymentRecord, 'booking'> {
  return createPaymentRecord({
    ...options,
    status: 'FAILED',
    retryCount,
    lastAttemptAt: new Date(),
    failureReason: options.failureReason ?? 'card_declined',
  })
}
