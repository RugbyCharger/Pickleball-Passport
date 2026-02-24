/**
 * Support Ticket Resolved Email Template
 *
 * Sent to guest/prospect when their support ticket is marked as resolved.
 */

import { baseEmailTemplate, generatePlainText } from './base'
import { escapeHtml } from '@/lib/utils/html-escape'

export interface TicketResolvedData {
  name: string
  email: string
  referenceNumber: string
  originalSubject: string
  source: 'WEBSITE_CONTACT' | 'GUEST_DASHBOARD' | 'ADMIN_CREATED' | 'EMAIL'
}

/**
 * Generate ticket resolved notification email
 */
export function generateTicketResolvedEmail(data: TicketResolvedData): {
  html: string
  text: string
  subject: string
} {
  const { name, referenceNumber, originalSubject, source } = data

  const subject = `Your Support Request Has Been Resolved - ${referenceNumber}`

  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/support/status`
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard/support`
  const contactUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/contact`

  // Show different tracking info based on source
  const viewTicketSection =
    source === 'GUEST_DASHBOARD'
      ? `
    <p>You can view the full conversation history in your dashboard:</p>
    <a href="${dashboardUrl}" class="button" style="background-color: #003D5C;">
      View My Tickets
    </a>
  `
      : `
    <p>You can view the full conversation history using your reference number:</p>
    <a href="${statusUrl}" class="button" style="background-color: #003D5C;">
      View Ticket History
    </a>
  `

  const content = `
    <h1>Your Request Has Been Resolved</h1>

    <p>Hi ${escapeHtml(name)},</p>

    <p>Great news! Your support request has been marked as resolved by our team.</p>

    <div style="background-color: #ecfdf5; border: 1px solid #059669; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #047857; width: 140px;">Reference Number:</td>
          <td style="padding: 4px 0; font-family: monospace; font-weight: 600; color: #065f46;">${referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #047857;">Subject:</td>
          <td style="padding: 4px 0; color: #065f46;">${escapeHtml(originalSubject)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #047857;">Status:</td>
          <td style="padding: 4px 0;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #ffffff; background-color: #059669;">Resolved</span>
          </td>
        </tr>
      </table>
    </div>

    ${viewTicketSection}

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #374151;">Need Further Help?</p>
      <p style="margin: 0; color: #4b5563;">
        If you still have questions or need additional assistance, don't hesitate to reach out. You can reply to this email or submit a new support request.
      </p>
      <a href="${contactUrl}" style="display: inline-block; margin-top: 12px; color: #003D5C; text-decoration: none; font-weight: 600;">
        Contact Us Again →
      </a>
    </div>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Thank you for choosing The Pickleball Passport. We hope we were able to help!
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `Your support request ${referenceNumber} has been resolved. Thank you for contacting The Pickleball Passport!`,
    footerText:
      'You received this email because you submitted a support request to The Pickleball Passport.',
  })

  const text = generatePlainText(`
    Your Request Has Been Resolved

    Hi ${name},

    Great news! Your support request has been marked as resolved by our team.

    Ticket Details:
    - Reference Number: ${referenceNumber}
    - Subject: ${originalSubject}
    - Status: Resolved

    ${source === 'GUEST_DASHBOARD' ? `View your tickets: ${dashboardUrl}` : `View ticket history: ${statusUrl}`}

    Need Further Help?
    If you still have questions or need additional assistance, don't hesitate to reach out. You can reply to this email or submit a new support request.

    Contact Us: ${contactUrl}

    Thank you for choosing The Pickleball Passport. We hope we were able to help!

    ---

    You received this email because you submitted a support request to The Pickleball Passport.

    © ${new Date().getFullYear()} The Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
