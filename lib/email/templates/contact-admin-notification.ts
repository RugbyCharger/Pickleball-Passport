/**
 * Contact Admin Notification Email Template
 *
 * Sent to admin (hello@pickleballpassport.com) when a new contact form is submitted.
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface ContactAdminNotificationData {
  name: string
  email: string
  phone: string
  message: string
  timestamp: Date
}

/**
 * Generate contact admin notification email
 */
export function generateContactAdminNotificationEmail(
  data: ContactAdminNotificationData
): {
  html: string
  text: string
  subject: string
} {
  const { name, email, phone, message, timestamp } = data

  const subject = `New Contact Form Submission - ${name}`

  const formattedDate = timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  })

  const content = `
    <h1>New Contact Form Submission</h1>

    <p>You've received a new message from the Pickleball Passport contact form.</p>

    <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Name:</td>
          <td style="padding: 8px 0; color: #1f2937;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
          <td style="padding: 8px 0;">
            <a href="mailto:${email}" style="color: #003D5C; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone:</td>
          <td style="padding: 8px 0; color: #1f2937;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #374151;">Submitted:</td>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${formattedDate}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fffbeb; border-left: 4px solid #D4AF37; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Message:</p>
      <p style="margin: 0; color: #78350f; white-space: pre-wrap;">${message}</p>
    </div>

    <a href="mailto:${email}?subject=Re: Your Inquiry to Pickleball Passport" class="button" style="background-color: #003D5C;">
      Reply to ${name}
    </a>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      💡 Tip: This email is set up with a reply-to address, so you can click "Reply" in your email client to respond directly to ${name}.
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: `New message from ${name} (${email})`,
    footerText:
      'This is an automated notification from the Pickleball Passport contact form.',
  })

  const text = generatePlainText(`
    New Contact Form Submission

    You've received a new message from the Pickleball Passport contact form.

    Contact Details:
    - Name: ${name}
    - Email: ${email}
    - Phone: ${phone}
    - Submitted: ${formattedDate}

    Message:
    "${message}"

    Reply to ${name}: mailto:${email}

    ---

    This is an automated notification from the Pickleball Passport contact form.

    © ${new Date().getFullYear()} Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
