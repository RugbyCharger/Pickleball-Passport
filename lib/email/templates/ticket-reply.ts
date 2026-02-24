/**
 * Support Ticket Reply Email Template
 *
 * Sent to guest/prospect when an admin replies to their support ticket.
 */

import { baseEmailTemplate, generatePlainText } from './base'
import { escapeHtml } from '@/lib/utils/html-escape'

export interface TicketReplyData {
  name: string
  email: string
  referenceNumber: string
  adminName: string
  replyMessage: string
  originalSubject: string
  source: 'WEBSITE_CONTACT' | 'GUEST_DASHBOARD' | 'ADMIN_CREATED' | 'EMAIL'
}

/**
 * Generate ticket reply notification email
 */
export function generateTicketReplyEmail(data: TicketReplyData): {
  html: string
  text: string
  subject: string
} {
  const { name, referenceNumber, adminName, replyMessage, originalSubject, source } = data

  const subject = `Re: ${originalSubject} - ${referenceNumber}`

  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/support/status`
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard/support`

  // Show different tracking info based on source
  const viewTicketSection =
    source === 'GUEST_DASHBOARD'
      ? `
    <p>You can view the full conversation and respond in your dashboard:</p>
    <a href="${dashboardUrl}" class="button" style="background-color: #003D5C;">
      View My Tickets
    </a>
  `
      : `
    <p>You can view your ticket status and any additional replies using your reference number:</p>
    <a href="${statusUrl}" class="button" style="background-color: #003D5C;">
      Check Ticket Status
    </a>
  `

  const content = `
    <h1>You've Got a Reply!</h1>

    <p>Hi ${escapeHtml(name)},</p>

    <p>Our team has responded to your support request.</p>

    <div style="background-color: #ecfdf5; border: 1px solid #059669; padding: 12px 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #047857;">Reference Number: <strong style="font-family: monospace;">${referenceNumber}</strong></p>
    </div>

    <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #0369a1;">Response from ${escapeHtml(adminName)}:</p>
      <p style="margin: 0; color: #0c4a6e; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(replyMessage)}</p>
    </div>

    ${viewTicketSection}

    <p style="margin-top: 24px; color: #4b5563;">
      If you have additional questions or need further assistance, simply reply to this email or submit a new support request.
    </p>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Thank you for choosing The Pickleball Passport. We're here to help!
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `${adminName} has responded to your support request ${referenceNumber}`,
    footerText:
      'You received this email because you submitted a support request to The Pickleball Passport.',
  })

  const text = generatePlainText(`
    You've Got a Reply!

    Hi ${name},

    Our team has responded to your support request.

    Reference Number: ${referenceNumber}

    Response from ${adminName}:
    "${replyMessage}"

    ${source === 'GUEST_DASHBOARD' ? `View your tickets: ${dashboardUrl}` : `Check ticket status: ${statusUrl}`}

    If you have additional questions or need further assistance, simply reply to this email or submit a new support request.

    Thank you for choosing The Pickleball Passport. We're here to help!

    ---

    You received this email because you submitted a support request to The Pickleball Passport.

    © ${new Date().getFullYear()} The Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
