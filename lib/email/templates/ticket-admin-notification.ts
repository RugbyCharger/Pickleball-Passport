/**
 * Support Ticket Admin Notification Email Template
 *
 * Sent to admin when a new support ticket is created.
 * Includes special urgency styling for URGENT priority tickets.
 */

import { baseEmailTemplate, generatePlainText } from './base'
import { escapeHtml, escapeHtmlAttr } from '@/lib/utils/html-escape'

export interface TicketAdminNotificationData {
  referenceNumber: string
  name: string
  email: string
  phone?: string | null
  category: string
  message: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  source: 'WEBSITE_CONTACT' | 'GUEST_DASHBOARD' | 'ADMIN_CREATED' | 'EMAIL'
  bookingReference?: string | null
  createdAt: Date
}

/**
 * Generate admin notification email for new support ticket
 */
export function generateTicketAdminNotificationEmail(data: TicketAdminNotificationData): {
  html: string
  text: string
  subject: string
} {
  const {
    referenceNumber,
    name,
    email,
    phone,
    category,
    message,
    priority,
    source,
    bookingReference,
    createdAt,
  } = data

  const isUrgent = priority === 'URGENT'
  const priorityLabel = priority.charAt(0) + priority.slice(1).toLowerCase()
  const categoryLabel = category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
  const sourceLabel = source
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())

  const subject = isUrgent
    ? `🚨 URGENT Support Ticket - ${referenceNumber}`
    : `New Support Ticket - ${referenceNumber}`

  const formattedDate = createdAt.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  })

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/admin/support`

  const urgentBanner = isUrgent
    ? `
    <div style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 16px; border-radius: 8px; margin: 0 0 24px 0; text-align: center;">
      <p style="margin: 0; font-weight: 700; color: #dc2626; font-size: 18px;">🚨 URGENT TICKET - IMMEDIATE ATTENTION REQUIRED</p>
    </div>
  `
    : ''

  const priorityBadgeColor =
    priority === 'URGENT'
      ? '#dc2626'
      : priority === 'HIGH'
        ? '#ea580c'
        : priority === 'NORMAL'
          ? '#2563eb'
          : '#6b7280'

  const content = `
    <h1>New Support Ticket Received</h1>

    ${urgentBanner}

    <p>A new support request has been submitted and requires attention.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 140px;">Reference:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: 600; color: #065f46;">${referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Priority:</td>
          <td style="padding: 8px 0;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #ffffff; background-color: ${priorityBadgeColor};">${priorityLabel}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Category:</td>
          <td style="padding: 8px 0; color: #1f2937;">${categoryLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Source:</td>
          <td style="padding: 8px 0; color: #1f2937;">${sourceLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Submitted:</td>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${formattedDate}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #0369a1;">Contact Information</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #374151; width: 80px;">Name:</td>
          <td style="padding: 4px 0; color: #1f2937;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #374151;">Email:</td>
          <td style="padding: 4px 0;">
            <a href="mailto:${escapeHtmlAttr(email)}" style="color: #003D5C; text-decoration: none;">${escapeHtml(email)}</a>
          </td>
        </tr>
        ${
          phone
            ? `
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #374151;">Phone:</td>
          <td style="padding: 4px 0; color: #1f2937;">${escapeHtml(phone)}</td>
        </tr>
        `
            : ''
        }
        ${
          bookingReference
            ? `
        <tr>
          <td style="padding: 4px 0; font-weight: 500; color: #374151;">Booking:</td>
          <td style="padding: 4px 0; font-family: monospace; color: #1f2937;">${escapeHtml(bookingReference)}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <div style="background-color: #fffbeb; border-left: 4px solid #D4AF37; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Message:</p>
      <p style="margin: 0; color: #78350f; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>

    <a href="${adminUrl}" class="button" style="background-color: #003D5C;">
      View in Admin Dashboard
    </a>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      💡 Tip: This email is set up with a reply-to address, so you can click "Reply" in your email client to respond directly to ${escapeHtml(name)}.
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: isUrgent
      ? `URGENT: New support ticket from ${escapeHtml(name)} requires immediate attention`
      : `New support ticket from ${escapeHtml(name)} (${categoryLabel})`,
    footerText:
      'This is an automated notification from the Pickleball Passport support system.',
  })

  const text = generatePlainText(`
    ${isUrgent ? '🚨 URGENT TICKET - IMMEDIATE ATTENTION REQUIRED\n\n' : ''}New Support Ticket Received

    A new support request has been submitted and requires attention.

    Ticket Details:
    - Reference: ${referenceNumber}
    - Priority: ${priorityLabel}
    - Category: ${categoryLabel}
    - Source: ${sourceLabel}
    - Submitted: ${formattedDate}

    Contact Information:
    - Name: ${name}
    - Email: ${email}
    ${phone ? `- Phone: ${phone}` : ''}
    ${bookingReference ? `- Booking: ${bookingReference}` : ''}

    Message:
    "${message}"

    View in Admin Dashboard: ${adminUrl}

    ---

    This is an automated notification from the Pickleball Passport support system.

    © ${new Date().getFullYear()} Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
