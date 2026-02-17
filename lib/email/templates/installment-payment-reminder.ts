/**
 * Installment Payment Reminder Email Template
 * E4-S6 Phase 8
 *
 * Sent when an installment payment fails (attempts 1-3)
 * Friendly tone, includes retry schedule and help info
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface InstallmentReminderData {
  // Guest details
  firstName: string
  email: string

  // Booking info
  bookingReference: string
  packageName: string
  tripStartDate: string // ISO date string

  // Payment details
  installmentNumber: number // 2, 3, or 4
  installmentAmount: number // In cents
  dueDate: string // ISO date string

  // Retry info
  attemptNumber: number // 1, 2, 3
  nextRetryDate: string // Formatted date like "Monday, January 20, 2026"
  failureReason?: string // Optional user-friendly reason

  // Links
  updatePaymentUrl: string // Link to dashboard to update payment method
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
 * Get user-friendly failure reason
 */
function getFriendlyReason(reason?: string): string {
  if (!reason) return 'Your payment could not be processed'

  const reasonMap: Record<string, string> = {
    card_declined: 'Your card was declined',
    insufficient_funds: 'Insufficient funds were available',
    expired_card: 'Your card has expired',
    authentication_required: 'Additional authentication is required',
  }

  return reasonMap[reason] || 'Your payment could not be processed'
}

export function generateInstallmentReminderEmail(
  data: InstallmentReminderData
): {
  html: string
  text: string
  subject: string
} {
  const content = `
    <h1>Payment Reminder: Installment Due 📅</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      We wanted to let you know that we were unable to process your recent installment payment
      for your upcoming The Pickleball Passport trip.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600; font-size: 16px;">
        ⚠️ Payment Attempt Unsuccessful
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ${getFriendlyReason(data.failureReason)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Payment Details</h2>

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
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Installment:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.installmentNumber} of 4</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(data.installmentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Due Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.dueDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.tripStartDate)}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        🔄 Automatic Retry Scheduled
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        We'll automatically try to process this payment again on <strong>${data.nextRetryDate}</strong>.
        No action is needed unless you'd like to update your payment method.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ What You Can Do</h2>

    <p>
      If you'd like to update your payment method or ensure sufficient funds are available,
      you can manage your payment settings in your dashboard:
    </p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.updatePaymentUrl}" class="button">
        Update Payment Method
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        💡 Common Solutions
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #166534; font-size: 14px;">
        <li>Ensure your card has not expired</li>
        <li>Verify sufficient funds are available</li>
        <li>Contact your bank to authorize the charge</li>
        <li>Update to a different payment method if needed</li>
      </ul>
    </div>

    <p>
      If you have any questions or need assistance, please don't hesitate to reach out.
      We're here to help ensure your trip goes smoothly!
    </p>

    <p>
      Thank you for your attention to this matter.<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Payment Reminder - The Pickleball Passport',
    content,
    preheader: `Installment payment reminder - ${formatCurrency(data.installmentAmount)} due`,
    footerText: `This is a payment reminder for your Pickleball Passport booking.`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `Payment Reminder: Installment ${data.installmentNumber} - ${data.bookingReference}`,
  }
}
