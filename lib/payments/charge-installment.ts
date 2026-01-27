/**
 * Charge Installment Payment
 * E4-S6 Phase 8
 *
 * Core logic for charging an installment payment via Stripe
 * Handles off-session payment intents with idempotency
 */

import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { isTransientError, isPermanentError, getNextRetryDate } from './retry-calculator'
import { sendEmail } from '@/lib/email/send-email'
import { generateInstallmentReminderEmail } from '@/lib/email/templates/installment-payment-reminder'
import { paymentLogger, logError } from '@/lib/logger'
import { getStripeServer } from '@/lib/stripe/server'

// P1-008: Type for PaymentRecord with booking relations
type PaymentRecordWithBooking = Prisma.PaymentRecordGetPayload<{
  include: {
    booking: {
      include: {
        user: true
        trip: true
        package: true
      }
    }
  }
}>

export interface ChargeInstallmentInput {
  paymentRecordId: string
}

export interface ChargeInstallmentResult {
  success: boolean
  paymentRecordId: string
  stripePaymentIntentId?: string
  errorCode?: string
  errorMessage?: string
  shouldRetry: boolean
  isPermanentFailure: boolean
}

/**
 * Charge an installment payment using Stripe off-session payment intent
 *
 * @param input - Payment record ID to charge
 * @returns Result object with success status and error info
 */
export async function chargeInstallment(
  input: ChargeInstallmentInput
): Promise<ChargeInstallmentResult> {
  try {
    // Fetch payment record with related booking data
    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { id: input.paymentRecordId },
      include: {
        booking: {
          include: {
            user: true,
            trip: true,
            package: true,
          },
        },
      },
    })

    if (!paymentRecord) {
      paymentLogger.error({ paymentRecordId: input.paymentRecordId }, 'PaymentRecord not found')
      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'payment_record_not_found',
        errorMessage: 'Payment record not found',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    const { booking } = paymentRecord

    // Skip if booking is cancelled
    if (booking.status === 'CANCELLED') {
      paymentLogger.info({ bookingReference: booking.bookingReference }, 'Skipping payment for cancelled booking')
      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'booking_cancelled',
        errorMessage: 'Booking is cancelled',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    // Verify Stripe customer exists
    if (!booking.stripeCustomerId) {
      paymentLogger.error({ bookingReference: booking.bookingReference }, 'No Stripe customer for booking')

      // Send admin alert
      await sendAdminAlert(paymentRecord, 'customer_not_found', 'No Stripe customer ID found')

      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode: 'customer_not_found',
        errorMessage: 'No Stripe customer ID',
        shouldRetry: false,
        isPermanentFailure: true,
      }
    }

    // Create idempotency key
    const idempotencyKey = `installment-${paymentRecord.id}-${paymentRecord.retryCount}-${paymentRecord.dueDate.toISOString().split('T')[0]}`

    paymentLogger.info({ bookingReference: booking.bookingReference, installmentNumber: paymentRecord.installmentNumber }, 'Charging installment')

    // Create payment intent with off_session confirmation
    const paymentIntent = await getStripeServer().paymentIntents.create({
      amount: paymentRecord.amountCents,
      currency: 'usd',
      customer: booking.stripeCustomerId,
      confirm: true,
      off_session: true,
      description: `Installment ${paymentRecord.installmentNumber} - ${booking.bookingReference}`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        paymentRecordId: paymentRecord.id,
        installmentNumber: paymentRecord.installmentNumber?.toString() || '',
        installmentOf: '4',
      },
    }, {
      idempotencyKey,
    })

    // Update payment record with payment intent ID and attempt info
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        lastAttemptAt: new Date(),
      },
    })

    paymentLogger.info({ paymentIntentId: paymentIntent.id, bookingReference: booking.bookingReference }, 'Payment intent created')

    // Webhook will handle status update (Phase 6)
    return {
      success: true,
      paymentRecordId: paymentRecord.id,
      stripePaymentIntentId: paymentIntent.id,
      shouldRetry: false,
      isPermanentFailure: false,
    }
  } catch (error) {
    logError(paymentLogger, error, 'Error charging installment', { paymentRecordId: input.paymentRecordId })

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      const errorCode = error.code || 'unknown'
      const errorMessage = error.message

      // Determine if error is transient or permanent
      const isTransient = isTransientError(errorCode)
      const isPermanent = isPermanentError(errorCode)

      // Update payment record with failure info
      const paymentRecord = await prisma.paymentRecord.findUnique({
        where: { id: input.paymentRecordId },
        include: {
          booking: {
            include: {
              user: true,
              trip: true,
              package: true,
            },
          },
        },
      })

      if (paymentRecord) {
        const newRetryCount = paymentRecord.retryCount + 1
        const isLastAttempt = newRetryCount >= 4

        // Update retry count and failure reason
        await prisma.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: {
            retryCount: newRetryCount,
            lastAttemptAt: new Date(),
            failureReason: errorCode,
            // Mark as FAILED if permanent error or max retries reached
            ...(isPermanent || isLastAttempt ? { status: 'FAILED' } : {}),
          },
        })

        // Send customer reminder email (if transient and not last attempt)
        if (isTransient && !isLastAttempt) {
          await sendCustomerReminder(paymentRecord, newRetryCount)
        }

        // Send admin alert if permanent failure or max retries
        if (isPermanent || isLastAttempt) {
          await sendAdminAlert(paymentRecord, errorCode, errorMessage)
        }
      }

      return {
        success: false,
        paymentRecordId: input.paymentRecordId,
        errorCode,
        errorMessage,
        shouldRetry: isTransient,
        isPermanentFailure: isPermanent,
      }
    }

    // Unknown error - don't update payment record, will retry on next cron run
    return {
      success: false,
      paymentRecordId: input.paymentRecordId,
      errorCode: 'unknown_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      shouldRetry: false,
      isPermanentFailure: false,
    }
  }
}

/**
 * Send customer reminder email for failed payment
 */
async function sendCustomerReminder(
  paymentRecord: PaymentRecordWithBooking,
  newRetryCount: number
): Promise<void> {
  try {
    const { booking } = paymentRecord
    const user = booking.user

    const nextRetryDate = getNextRetryDate(new Date(), newRetryCount)
    if (!nextRetryDate) return

    const emailData = {
      firstName: booking.guestFirstName || 'Guest',
      email: user?.email || booking.guestEmail || '',
      bookingReference: booking.bookingReference,
      packageName: booking.package.name,
      tripStartDate: booking.trip?.startDate?.toISOString() || '',
      installmentNumber: paymentRecord.installmentNumber || 0,
      installmentAmount: paymentRecord.amountCents,
      dueDate: paymentRecord.dueDate.toISOString(),
      attemptNumber: newRetryCount,
      nextRetryDate: nextRetryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      failureReason: paymentRecord.failureReason ?? undefined,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
    }

    const { html, text, subject } = generateInstallmentReminderEmail(emailData)

    await sendEmail({
      to: emailData.email,
      subject,
      html,
      text,
    })

    paymentLogger.info({ email: emailData.email }, 'Customer reminder sent')
  } catch (error) {
    logError(paymentLogger, error, 'Error sending customer reminder')
    // Don't throw - email failure shouldn't break payment processing
  }
}

/**
 * Send admin alert for permanently failed payment
 * Story 11-8: Uses centralized admin-alerts service
 */
async function sendAdminAlert(
  paymentRecord: PaymentRecordWithBooking,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  try {
    const { booking } = paymentRecord
    const user = booking.user

    // Collect attempt history
    const attempts = []
    for (let i = 1; i <= paymentRecord.retryCount; i++) {
      attempts.push({
        attemptNumber: i,
        attemptDate: paymentRecord.lastAttemptAt?.toISOString() || new Date().toISOString(),
        errorCode: paymentRecord.failureReason || errorCode,
        errorMessage: errorMessage,
      })
    }

    const emailData = {
      customerName: `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim() || 'Unknown',
      customerEmail: user?.email || booking.guestEmail || '',
      customerPhone: booking.guestPhone ?? undefined,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
      packageName: booking.package.name,
      tripStartDate: booking.trip?.startDate?.toISOString() || '',
      tripName: booking.trip?.name || 'Unknown Trip',
      installmentNumber: paymentRecord.installmentNumber || 0,
      installmentAmount: paymentRecord.amountCents,
      originalDueDate: paymentRecord.dueDate.toISOString(),
      attempts,
      bookingAdminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`,
      customerDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
    }

    // Use centralized admin alerts service (Story 11-8)
    const { sendPaymentFailureAlert } = await import('@/lib/email/admin-alerts')
    await sendPaymentFailureAlert(emailData)

    paymentLogger.info('Payment failure admin alert sent via admin-alerts service')
  } catch (error) {
    logError(paymentLogger, error, 'Error sending admin alert')
    // Don't throw - email failure shouldn't break payment processing
  }
}
