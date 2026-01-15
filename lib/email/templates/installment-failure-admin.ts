/**
 * Installment Payment Failure Admin Alert
 * E4-S6 Phase 8
 *
 * Sent to admin after 4th failed payment attempt
 * Includes full context for manual follow-up
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface InstallmentFailureAdminData {
  // Guest details
  customerName: string
  customerEmail: string
  customerPhone?: string

  // Booking info
  bookingReference: string
  bookingId: string
  packageName: string
  tripStartDate: string // ISO date string
  tripName: string

  // Payment details
  installmentNumber: number // 2, 3, or 4
  installmentAmount: number // In cents
  originalDueDate: string // ISO date string

  // Failure history
  attempts: Array<{
    attemptNumber: number
    attemptDate: string // ISO date
    errorCode: string
    errorMessage: string
  }>

  // Links
  bookingAdminUrl: string // Link to admin dashboard
  customerDashboardUrl: string // Link customers use
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

export function generateInstallmentFailureAdminEmail(
  data: InstallmentFailureAdminData
): {
  html: string
  text: string
  subject: string
} {
  const content = `
    <h1>🚨 Installment Payment Failed - Manual Intervention Required</h1>

    <p>
      An installment payment has failed after <strong>4 automatic retry attempts</strong> and requires manual follow-up.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fee2e2; border-radius: 12px; border-left: 4px solid #dc2626;">
      <p style="margin: 0 0 8px 0; color: #991b1b; font-weight: 600; font-size: 16px;">
        ⚠️ Payment Permanently Failed
      </p>
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        All automatic retry attempts have been exhausted. Manual intervention is required.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">👤 Customer Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a>
          </td>
        </tr>
        ${data.customerPhone ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="tel:${data.customerPhone}" style="color: #2563eb; text-decoration: none;">${data.customerPhone}</a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Booking Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.tripName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.tripStartDate)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💰 Payment Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Installment:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.installmentNumber} of 4</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 18px;">${formatCurrency(data.installmentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Due Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.originalDueDate)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📊 Failure History</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Attempt</th>
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Date</th>
            <th style="padding: 8px 0; color: #6b7280; font-size: 12px; text-align: left; font-weight: 600;">Error</th>
          </tr>
        </thead>
        <tbody>
          ${data.attempts.map((attempt) => `
          <tr>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">#${attempt.attemptNumber}</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatDate(attempt.attemptDate)}</td>
            <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-family: monospace;">
              ${attempt.errorCode}<br>
              <span style="color: #6b7280; font-size: 12px;">${attempt.errorMessage}</span>
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Recommended Actions</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.6;">
      <li><strong>Contact Customer:</strong> Reach out via email or phone to discuss payment options</li>
      <li><strong>Verify Payment Method:</strong> Confirm if card is expired or has issues</li>
      <li><strong>Offer Alternative Payment:</strong> Manual invoice, bank transfer, or different card</li>
      <li><strong>Review Booking Status:</strong> Decide whether to cancel or extend payment deadline</li>
      <li><strong>Update Admin Dashboard:</strong> Mark as resolved once handled</li>
    </ol>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.bookingAdminUrl}" class="button">
        View Booking in Admin Dashboard
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Customer Dashboard Link
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        Share this link with the customer to update their payment method:<br>
        <a href="${data.customerDashboardUrl}" style="color: #2563eb; word-break: break-all;">${data.customerDashboardUrl}</a>
      </p>
    </div>

    <p>
      <strong>Pickleball Passport Admin System</strong> 🏓
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Installment Payment Failed - Admin Alert',
    content,
    preheader: `${data.bookingReference} - Installment ${data.installmentNumber} failed after 4 attempts`,
    footerText: `This is an automated admin alert from Pickleball Passport.`,
  })

  const text = generatePlainText(content)

  return {
    html,
    text,
    subject: `🚨 Payment Failed: ${data.bookingReference} - Installment ${data.installmentNumber}`,
  }
}
