/**
 * Send Payment Reminders Service
 * E4-S8: Installment Payment Reminders
 *
 * Finds pending payments due in 7 days and sends reminder emails
 * to guests so they can ensure their payment method is valid.
 */

import { addDays, startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-email'
import { generateUpcomingPaymentReminderEmail, UpcomingPaymentReminderData } from '@/lib/email/templates/upcoming-payment-reminder'
import { getCustomerDefaultPaymentMethod } from '@/lib/stripe/stripe-service'
import { paymentLogger, logError } from '@/lib/logger'

export interface SendPaymentRemindersResult {
  totalFound: number
  remindersSent: number
  errors: number
  skipped: number
  details: Array<{
    paymentRecordId: string
    bookingReference: string
    installmentNumber: number
    result: 'sent' | 'error' | 'skipped'
    error?: string
  }>
}

/**
 * Find payments due in 7 days and send reminder emails
 */
export async function sendPaymentReminders(): Promise<SendPaymentRemindersResult> {
  const today = new Date()
  const sevenDaysFromNow = addDays(today, 7)

  // Target the full day 7 days from now
  const targetDayStart = startOfDay(sevenDaysFromNow)
  const targetDayEnd = endOfDay(sevenDaysFromNow)

  paymentLogger.info(
    { targetDate: targetDayStart.toISOString() },
    'Starting payment reminder job'
  )

  // Find all pending payments due in 7 days that haven't been reminded yet
  const paymentsToRemind = await prisma.paymentRecord.findMany({
    where: {
      status: 'PENDING',
      installmentNumber: { gte: 2 }, // Skip first payment (already paid at booking)
      reminderSentAt: null, // Not already reminded
      dueDate: {
        gte: targetDayStart,
        lte: targetDayEnd,
      },
      booking: {
        status: { not: 'CANCELLED' },
      },
    },
    include: {
      booking: {
        include: {
          user: true,
          package: true,
          trip: true,
        },
      },
    },
    take: 100, // Safety limit
  })

  paymentLogger.info(
    { count: paymentsToRemind.length },
    'Found payments needing reminders'
  )

  const result: SendPaymentRemindersResult = {
    totalFound: paymentsToRemind.length,
    remindersSent: 0,
    errors: 0,
    skipped: 0,
    details: [],
  }

  // Process each payment
  for (const payment of paymentsToRemind) {
    const { booking } = payment
    const user = booking.user

    try {
      // Get user email
      const userEmail = user?.email
      if (!userEmail) {
        paymentLogger.warn(
          { paymentRecordId: payment.id, bookingReference: booking.bookingReference },
          'No email found for payment - skipping'
        )
        result.skipped++
        result.details.push({
          paymentRecordId: payment.id,
          bookingReference: booking.bookingReference,
          installmentNumber: payment.installmentNumber || 0,
          result: 'skipped',
          error: 'No email address',
        })
        continue
      }

      // Get payment method details from Stripe (if available)
      let paymentMethodLast4: string | undefined
      let paymentMethodBrand: string | undefined

      if (booking.stripeCustomerId) {
        try {
          const paymentMethod = await getCustomerDefaultPaymentMethod(booking.stripeCustomerId)
          if (paymentMethod?.card) {
            paymentMethodLast4 = paymentMethod.card.last4
            paymentMethodBrand = paymentMethod.card.brand
              ? paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)
              : undefined
          }
        } catch (error) {
          // Non-blocking - continue without payment method info
          paymentLogger.warn(
            { bookingReference: booking.bookingReference },
            'Could not fetch payment method - continuing without it'
          )
        }
      }

      // Get guest first name from user or GuestProfile
      const guestProfile = await prisma.guestProfile.findUnique({
        where: { userId: user.id },
        select: { firstName: true },
      })
      const firstName = guestProfile?.firstName || 'Guest'

      // Prepare email data
      const emailData: UpcomingPaymentReminderData = {
        firstName,
        email: userEmail,
        bookingReference: booking.bookingReference,
        packageName: booking.package.name,
        tripStartDate: booking.trip?.startDate?.toISOString(),
        installmentNumber: payment.installmentNumber || 0,
        totalInstallments: 4,
        installmentAmount: payment.amountCents,
        dueDate: payment.dueDate.toISOString(),
        paymentMethodLast4,
        paymentMethodBrand,
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
        bookingDetailsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${booking.id}`,
      }

      // Generate and send email
      const { html, text, subject } = generateUpcomingPaymentReminderEmail(emailData)

      await sendEmail({
        to: userEmail,
        subject,
        html,
        text,
      })

      // Mark reminder as sent
      await prisma.paymentRecord.update({
        where: { id: payment.id },
        data: { reminderSentAt: new Date() },
      })

      paymentLogger.info(
        { paymentRecordId: payment.id, bookingReference: booking.bookingReference, email: userEmail },
        'Payment reminder sent'
      )

      result.remindersSent++
      result.details.push({
        paymentRecordId: payment.id,
        bookingReference: booking.bookingReference,
        installmentNumber: payment.installmentNumber || 0,
        result: 'sent',
      })
    } catch (error) {
      logError(paymentLogger, error, 'Error sending payment reminder', {
        paymentRecordId: payment.id,
        bookingReference: booking.bookingReference,
      })

      result.errors++
      result.details.push({
        paymentRecordId: payment.id,
        bookingReference: booking.bookingReference,
        installmentNumber: payment.installmentNumber || 0,
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  paymentLogger.info(
    {
      totalFound: result.totalFound,
      remindersSent: result.remindersSent,
      errors: result.errors,
      skipped: result.skipped,
    },
    'Payment reminder job complete'
  )

  return result
}
