/**
 * Database Transaction Wrappers
 *
 * This module provides atomic transaction wrappers for complex database operations
 * that require multiple related records to be created together. All operations within
 * a transaction are automatically rolled back if any step fails.
 */

import { prisma } from '@/lib/db';
import type { Booking, PaymentRecord } from '@prisma/client';

/**
 * Input data for creating a booking
 * Matches Prisma's BookingCreateInput but with required fields only
 */
export interface BookingCreateData {
  userId: string;
  tripId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'OFFLINE';
  paymentPlan?: 'FULL' | 'INSTALLMENT_4' | null;
  isGift?: boolean;
  giftRecipientEmail?: string | null;
  giftRecipientName?: string | null;
  stripeSessionId?: string | null;
}

/**
 * Input data for creating a payment record
 * Matches PaymentRecord fields needed for creation
 */
export interface PaymentRecordCreateData {
  amountCents: number;
  dueDate: Date;
  percentage?: number | null;
  installmentNumber?: number | null;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paidDate?: Date | null;
  stripePaymentIntentId?: string | null;
}

/**
 * Result of creating a booking with payment records
 */
export interface BookingWithPaymentsResult {
  booking: Booking;
  payments: PaymentRecord[];
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
 *
 * @example
 * ```typescript
 * const result = await createBookingWithPayments(
 *   {
 *     userId: 'user_123',
 *     tripId: 'trip_456',
 *     startDate: new Date('2024-07-15'),
 *     endDate: new Date('2024-07-22'),
 *     totalAmount: 100000, // $1000.00
 *     status: 'PENDING',
 *     paymentMethod: 'STRIPE',
 *     paymentPlan: 'INSTALLMENT_4',
 *   },
 *   [
 *     { amountCents: 50000, dueDate: new Date(), percentage: 50, installmentNumber: 1 },
 *     { amountCents: 25000, dueDate: new Date('2024-05-31'), percentage: 25, installmentNumber: 2 },
 *     { amountCents: 15000, dueDate: new Date('2024-06-15'), percentage: 15, installmentNumber: 3 },
 *     { amountCents: 10000, dueDate: new Date('2024-07-01'), percentage: 10, installmentNumber: 4 },
 *   ]
 * );
 * console.log(`Created booking ${result.booking.id} with ${result.payments.length} payments`);
 * ```
 */
export async function createBookingWithPayments(
  bookingData: BookingCreateData,
  paymentRecords: PaymentRecordCreateData[]
): Promise<BookingWithPaymentsResult> {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Create the booking
    const booking = await tx.booking.create({
      data: bookingData,
    });

    // Step 2: Create all payment records, linking them to the booking
    const payments = await Promise.all(
      paymentRecords.map((record) =>
        tx.paymentRecord.create({
          data: {
            ...record,
            bookingId: booking.id,
          },
        })
      )
    );

    // Return both the booking and associated payments
    return {
      booking,
      payments,
    };
  });
}
