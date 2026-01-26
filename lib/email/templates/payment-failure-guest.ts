/**
 * Payment Failure Guest Email Template
 * Phase 02-01
 *
 * Sent to guests when a payment fails (checkout or installment).
 * Includes direct link to update payment method for recovery.
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface PaymentFailureEmailData {
  // Guest details
  firstName: string
  email: string

  // Booking info
  bookingReference: string
  packageName: string
  tripStartDate?: string // ISO date string (optional for checkout failures)

  // Payment details
  failedAmount: number // In cents
  failureReason?: string // Stripe error code (optional)
  isInstallment: boolean
  installmentNumber?: number // Only for installment failures (2, 3, or 4)

  // Recovery link
  updatePaymentUrl: string // CRITICAL: link to dashboard booking page
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get user-friendly failure reason from Stripe error code
 */
function getFriendlyReason(reason?: string): string {
  if (!reason) return 'Your payment could not be processed'

  const reasonMap: Record<string, string> = {
    card_declined: 'Your card was declined by your bank',
    insufficient_funds: 'Insufficient funds were available on your card',
    expired_card: 'Your card has expired',
    incorrect_cvc: 'The security code (CVC) was incorrect',
    processing_error: 'A processing error occurred with your card',
    incorrect_number: 'The card number was incorrect',
    authentication_required: 'Additional authentication is required by your bank',
    card_not_supported: 'Your card type is not supported',
    currency_not_supported: 'Your card does not support this currency',
    do_not_honor: 'Your bank declined the transaction',
    generic_decline: 'Your card was declined',
    lost_card: 'This card has been reported lost',
    stolen_card: 'This card has been reported stolen',
    withdrawal_count_limit_exceeded: 'You have exceeded the withdrawal limit on your card',
  }

  return reasonMap[reason] || 'Your payment could not be processed'
}

export function generatePaymentFailureEmail(data: PaymentFailureEmailData): {
  html: string
  text: string
  subject: string
} {
  const paymentTypeLabel = data.isInstallment
    ? `Installment ${data.installmentNumber} of 4`
    : 'Initial payment'

  const content = `
    <h1>Action Required: Payment Update Needed</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      We were unable to process your recent payment for your Pickleball Passport booking.
      Don't worry - you can easily resolve this by updating your payment method.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600; font-size: 16px;">
        Payment Unsuccessful
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ${getFriendlyReason(data.failureReason)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Payment Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Type:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${paymentTypeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(data.failedAmount)}</td>
        </tr>
        ${
          data.tripStartDate
            ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.tripStartDate)}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">What To Do Next</h2>

    <p>
      Please update your payment method to complete your booking. Click the button below
      to go directly to your booking page where you can add a new card or retry the payment.
    </p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.updatePaymentUrl}" class="button" style="background-color: #f59e0b; color: #ffffff !important;">
        Update Payment Method
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        Common Solutions
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #166534; font-size: 14px;">
        <li>Check that your card has not expired</li>
        <li>Ensure sufficient funds are available</li>
        <li>Contact your bank to authorize international transactions</li>
        <li>Try using a different credit or debit card</li>
      </ul>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        Need Help?
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        If you continue to experience issues or have questions, please don't hesitate to reach out.
        Our team is here to help ensure your trip goes smoothly!
      </p>
    </div>

    <p>
      Thank you for your attention to this matter.<br>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Payment Update Required - Pickleball Passport',
    content,
    preheader: `Action required: Payment of ${formatCurrency(data.failedAmount)} could not be processed`,
    footerText: `This is an important notification about your Pickleball Passport booking.`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `Action Required: Payment Failed - ${data.bookingReference}`,
  }
}
