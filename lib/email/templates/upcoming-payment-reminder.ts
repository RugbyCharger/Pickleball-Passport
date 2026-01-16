/**
 * Upcoming Payment Reminder Email Template
 * E4-S8: Installment Payment Reminders
 *
 * Sent 7 days before a scheduled installment payment
 * Proactive reminder to ensure payment method is valid
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface UpcomingPaymentReminderData {
  // Guest details
  firstName: string
  email: string

  // Booking info
  bookingReference: string
  packageName: string
  tripStartDate?: string // ISO date string

  // Payment details
  installmentNumber: number // 2, 3, or 4
  totalInstallments: number // Usually 4
  installmentAmount: number // In cents
  dueDate: string // ISO date string

  // Payment method info
  paymentMethodLast4?: string // Last 4 digits of card
  paymentMethodBrand?: string // Visa, Mastercard, etc.

  // Links
  updatePaymentUrl: string // Link to dashboard to update payment method
  bookingDetailsUrl: string // Link to booking details page
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format short date for display
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function generateUpcomingPaymentReminderEmail(
  data: UpcomingPaymentReminderData
): {
  html: string
  text: string
  subject: string
} {
  const paymentMethodDisplay = data.paymentMethodLast4
    ? `${data.paymentMethodBrand || 'Card'} ending in ${data.paymentMethodLast4}`
    : 'Your saved payment method'

  const content = `
    <h1>Upcoming Payment Reminder 💳</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      This is a friendly reminder that your next installment payment for your 
      Pickleball Passport trip is coming up in <strong>7 days</strong>.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600; font-size: 16px;">
        📅 Payment Scheduled
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        We'll automatically charge <strong>${formatCurrency(data.installmentAmount)}</strong> 
        on <strong>${formatDate(data.dueDate)}</strong>.
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
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.installmentNumber} of ${data.totalInstallments}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px; text-align: right;">${formatCurrency(data.installmentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatShortDate(data.dueDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${paymentMethodDisplay}</td>
        </tr>
        ${data.tripStartDate ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatShortDate(data.tripStartDate)}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        ✅ No Action Required
      </p>
      <p style="margin: 0; color: #166534; font-size: 14px;">
        If your payment information is up to date, you don't need to do anything. 
        We'll automatically process your payment on the scheduled date.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💳 Need to Update Your Payment Method?</h2>

    <p>
      If your card has expired or you'd like to use a different payment method, 
      you can update it anytime before the payment date:
    </p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.updatePaymentUrl}" class="button" style="background-color: #D4AF37;">
        Update Payment Method
      </a>
    </p>

    <p style="text-align: center; margin: 16px 0;">
      <a href="${data.bookingDetailsUrl}" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
        View Booking Details
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        💡 Payment Tip
      </p>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        Make sure your card has sufficient funds and hasn't expired. 
        If there's an issue with the payment, we'll retry automatically, 
        but it's best to have everything in order beforehand.
      </p>
    </div>

    <p>
      If you have any questions about your payment or booking, our team is here to help!
    </p>

    <p>
      Looking forward to your amazing trip!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Upcoming Payment Reminder - Pickleball Passport',
    content,
    preheader: `Upcoming payment reminder - ${formatCurrency(data.installmentAmount)} due ${formatShortDate(data.dueDate)}`,
    footerText: `This is a payment reminder for your Pickleball Passport booking (${data.bookingReference}).`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `Upcoming Payment: Installment ${data.installmentNumber} Due ${formatShortDate(data.dueDate)} - ${data.bookingReference}`,
  }
}
