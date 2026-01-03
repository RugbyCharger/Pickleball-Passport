/**
 * Contact Confirmation Email Template
 *
 * Sent to users after they submit the contact form (auto-reply).
 */

import { baseEmailTemplate, generatePlainText } from './base'

export interface ContactConfirmationData {
  name: string
  message: string
}

/**
 * Generate contact confirmation email
 */
export function generateContactConfirmationEmail(
  data: ContactConfirmationData
): {
  html: string
  text: string
  subject: string
} {
  const { name, message } = data

  const subject = 'We Received Your Message - Pickleball Passport'

  const content = `
    <h1>Thanks for Reaching Out, ${name}!</h1>

    <p>We've received your message and will get back to you within 24 hours during business days.</p>

    <p>Here's a copy of your message for your records:</p>

    <div style="background-color: #f9fafb; border-left: 4px solid #003D5C; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #4b5563; font-style: italic; white-space: pre-wrap;">${message}</p>
    </div>

    <p>In the meantime, feel free to explore our transformation tourism packages and see what Pickleball Passport has to offer.</p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages" class="button" style="background-color: #003D5C;">
      Browse Packages
    </a>

    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
      Questions? Reply to this email or call us at +1 (555) 123-4567 during office hours (Monday-Friday, 9am-6pm EST).
    </p>
  `

  const html = baseEmailTemplate({
    title: subject,
    content,
    preheader: "We've received your message and will respond within 24 hours.",
    footerText:
      'You received this email because you contacted Pickleball Passport.',
  })

  const text = generatePlainText(`
    Thanks for Reaching Out, ${name}!

    We've received your message and will get back to you within 24 hours during business days.

    Here's a copy of your message for your records:

    "${message}"

    In the meantime, feel free to explore our transformation tourism packages and see what Pickleball Passport has to offer.

    Browse Packages: ${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages

    Questions? Reply to this email or call us at +1 (555) 123-4567 during office hours (Monday-Friday, 9am-6pm EST).

    ---

    You received this email because you contacted Pickleball Passport.

    © ${new Date().getFullYear()} Pickleball Passport. All rights reserved.
    Chiang Mai, Thailand
  `)

  return { html, text, subject }
}
