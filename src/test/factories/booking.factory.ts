import type { Booking, BookingStatus, PaymentPlan } from '@prisma/client'

export interface BookingFactoryOptions {
  id?: string
  userId?: string
  tripId?: string
  status?: BookingStatus
  paymentPlan?: PaymentPlan
  totalAmountCents?: number
  depositAmountCents?: number
  depositPaidAt?: Date | null
  isGift?: boolean
  giftRecipientName?: string | null
  giftRecipientEmail?: string | null
  stripeCustomerId?: string | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Factory for creating Booking test data
 */
export function createBooking(
  options: BookingFactoryOptions = {}
): Omit<Booking, 'user' | 'trip' | 'participants' | 'addOns' | 'paymentRecords' | 'documents' | 'notifications'> {
  const now = new Date()

  return {
    id: options.id ?? `test-booking-${Date.now()}`,
    userId: options.userId ?? `test-user-${Date.now()}`,
    tripId: options.tripId ?? `test-trip-${Date.now()}`,
    status: options.status ?? 'DRAFT',
    paymentPlan: options.paymentPlan ?? 'FULL',
    totalAmountCents: options.totalAmountCents ?? 500000, // $5000
    depositAmountCents: options.depositAmountCents ?? 250000, // $2500 (50%)
    depositPaidAt: options.depositPaidAt === undefined ? null : options.depositPaidAt,
    isGift: options.isGift ?? false,
    giftRecipientName: options.giftRecipientName === undefined ? null : options.giftRecipientName,
    giftRecipientEmail: options.giftRecipientEmail === undefined ? null : options.giftRecipientEmail,
    stripeCustomerId: options.stripeCustomerId === undefined ? null : options.stripeCustomerId,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  }
}

/**
 * Create a booking with installment payment plan
 */
export function createInstallmentBooking(
  totalAmountCents: number,
  options: Partial<BookingFactoryOptions> = {}
): Omit<Booking, 'user' | 'trip' | 'participants' | 'addOns' | 'paymentRecords' | 'documents' | 'notifications'> {
  return createBooking({
    ...options,
    paymentPlan: 'INSTALLMENT_4',
    totalAmountCents,
    depositAmountCents: Math.round(totalAmountCents * 0.5), // 50% deposit
  })
}

/**
 * Create a booking with full payment plan (2% discount)
 */
export function createFullPaymentBooking(
  totalAmountCents: number,
  options: Partial<BookingFactoryOptions> = {}
): Omit<Booking, 'user' | 'trip' | 'participants' | 'addOns' | 'paymentRecords' | 'documents' | 'notifications'> {
  const discountedAmount = Math.round(totalAmountCents * 0.98) // 2% discount

  return createBooking({
    ...options,
    paymentPlan: 'FULL',
    totalAmountCents,
    depositAmountCents: discountedAmount,
  })
}

/**
 * Create a gift booking
 */
export function createGiftBooking(
  options: Partial<BookingFactoryOptions> = {}
): Omit<Booking, 'user' | 'trip' | 'participants' | 'addOns' | 'paymentRecords' | 'documents' | 'notifications'> {
  return createBooking({
    ...options,
    isGift: true,
    giftRecipientName: options.giftRecipientName ?? 'John Doe',
    giftRecipientEmail: options.giftRecipientEmail ?? 'john.doe@example.com',
    paymentPlan: 'FULL', // Gifts require full payment
  })
}
