/**
 * Support Ticket Created Email Template
 *
 * Sent to users after they submit a support ticket (confirmation email).
 * Includes their reference number for tracking.
 */

import { baseEmailTemplate, generatePlainText } from './base'
import { escapeHtml } from '@/lib/utils/html-escape'

export interface TicketCreatedData {
  name: string
  email: string
  referenceNumber: string
  category: string
  message: string
  source: 'WEBSITE_CONTACT' | 'GUEST_DASHBOARD'
}

/**
 * Generate support ticket confirmation email
 */
export function generateTicketCreatedEmail(data: TicketCreatedData): {
  html: string
  text: string
  subject: string
} {
  const { name, referenceNumber, category, message, source } = data

  const subject = `Support Request Received - ${referenceNumber}`

  const categoryLabel = category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())

  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/support/status`
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/support`

  // Show different tracking info based on source
  const trackingSection =
    source === 'GUEST_DASHBOARD'
      ? `
    <p>You can view the status of your ticket and any responses from our team in your dashboard:</p>
    <a href="${dashboardUrl}" class="button" style="background-color: #003D5C;">
      View My Tickets
    </a>
  `
      : `
    <p>You can check the status of your request anytime using your reference number:</p>
    <a href="${statusUrl}" class="button" style="background-color: #003D5C;">
      Check Ticket Status
    </a>
  `

  const content = `
    <h1>Thanks for Reaching Out, ${escapeHtml(name)}!</h1>

    <p>We've received your support request and our team will get back to you within 24 hours during business days.</p>

    <div style="background-color: #ecfdf5; border: 1px solid #059669; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #047857;">Your Reference Number</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #065f46; font-family: monospace;">${referenceNumber}</p>
    </div>

    <p style="font-size: 14px; color: #6b7280;">Please keep this reference number for your records. You'll need it to check the status of your request.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">Category:</td>
          <td style="padding: 8px 0; color: #1f2937;">${categoryLabel}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fffbeb; border-left: 4px solid #D4AF37; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Your Message:</p>
      <p style="margin: 0; color: #78350f; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>

    ${trackingSection}

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Questions? Reply to this email or call us at +1 (555) 123-4567 during office hours (Monday-Friday, 9am-6pm EST).
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `Your support request ${referenceNumber} has been received. We'll respond within 24 hours.`,
    footerText:
      'You received this email because you submitted a support request to The Pickleball Passport.',
  })

  const text = generatePlainText(`
    Thanks for Reaching Out, ${name}!

    We've received your support request and our team will get back to you within 24 hours during business days.

    Your Reference Number: ${referenceNumber}

    Please keep this reference number for your records. You'll need it to check the status of your request.

    Category: ${categoryLabel}

    Your Message:
    "${message}"

    Check your ticket status: ${source === 'GUEST_DASHBOARD' ? dashboardUrl : statusUrl}

    Questions? Reply to this email or call us at +1 (555) 123-4567 during office hours (Monday-Friday, 9am-6pm EST).

    ---

    You received this email because you submitted a support request to The Pickleball Passport.

    © ${new Date().getFullYear()} The Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
