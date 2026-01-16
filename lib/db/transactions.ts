/**
 * Database Transaction Wrappers
 * E4-S6: Installment Payment Plans
 *
 * This module provides atomic transaction wrappers for complex database operations
 * that require multiple related records to be created together. All operations within
 * a transaction are automatically rolled back if any step fails.
 */

import { prisma } from '@/lib/db'
import type { Booking, PaymentRecord, PaymentPlan, BookingStatus } from '@prisma/client'

/**
 * Input data for creating a booking with payment records
 */
export interface BookingCreateData {
  bookingReference: string
  userId: string
  packageId: string
  tripId?: string | null
  status: BookingStatus
  duration: number
  accommodationTier: string
  basePrice: number
  accommodationPrice: number
  addOnsTotal: number
  totalPrice: number
  referredBy?: string | null
  paymentPlan: PaymentPlan
  stripeCustomerId?: string | null
}

/**
 * Input data for creating a payment record
 * Status values match PaymentRecordStatus enum from Prisma schema
 */
export interface PaymentRecordCreateData {
  amountCents: number
  dueDate: Date
  percentage?: number | null
  installmentNumber?: number | null
  status: 'PENDING' | 'PAID' | 'FAILED'
}

/**
 * Result of creating a booking with payment records
 */
export interface BookingWithPaymentsResult {
  booking: Booking
  payments: PaymentRecord[]
}

/**
 * Creates a booking and its associated payment records atomically.
 *
 * This function wraps both operations in a Prisma transaction to ensure:
 * - Either ALL records are created successfully, OR
 * - NO records are created (automatic rollback on failure)
 *
 * This prevents orphaned bookings without payment records (R-004 risk coverage).
 *
 * @param bookingData - Booking data to create
 * @param paymentRecords - Array of payment records to associate with the booking
 * @returns Promise resolving to created booking and payment records
 * @throws Error if any operation fails (transaction automatically rolls back)
 */
export async function createBookingWithPayments(
  bookingData: BookingCreateData,
  paymentRecords: PaymentRecordCreateData[]
): Promise<BookingWithPaymentsResult> {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Create the booking
    const booking = await tx.booking.create({
      data: bookingData,
    })

    // Step 2: Create all payment records, linking them to the booking
    const payments = await Promise.all(
      paymentRecords.map((record) =>
        tx.paymentRecord.create({
          data: {
            bookingId: booking.id,
            amountCents: record.amountCents,
            dueDate: record.dueDate,
            percentage: record.percentage,
            installmentNumber: record.installmentNumber,
            status: record.status,
          },
        })
      )
    )

    // Return both the booking and associated payments
    return {
      booking,
      payments,
    }
  })
}
