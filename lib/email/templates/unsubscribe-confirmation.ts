/**
 * Unsubscribe Confirmation Email Template
 *
 * Confirmation email sent after unsubscribing from newsletter (E1-S11)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export function unsubscribeConfirmationEmail(email: string): {
  subject: string;
  html: string;
  text: string;
} {
  const resubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}#newsletter`;
  const contactUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/contact`;

  const content = `
    <h1>You've Been Unsubscribed</h1>
    <p>We've successfully removed <strong>${email}</strong> from our newsletter mailing list.</p>
    <p>You will no longer receive marketing emails from The Pickleball Passport.</p>

    <div style="background-color: #f9fafb; border-left: 4px solid #059669; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #4b5563;">
        <strong>Note:</strong> You may still receive transactional emails related to bookings or account activity if you have an active account with us.
      </p>
    </div>

    <h2 style="font-size: 20px; color: #111827; margin: 24px 0 12px 0;">Changed Your Mind?</h2>
    <p>If you unsubscribed by mistake, you can easily resubscribe anytime by visiting our website.</p>
    <p style="text-align: center;">
      <a href="${resubscribeUrl}" class="button">Resubscribe</a>
    </p>

    <h2 style="font-size: 20px; color: #111827; margin: 24px 0 12px 0;">We'd Love Your Feedback</h2>
    <p>Sorry to see you go! If you have a moment, we'd appreciate hearing why you unsubscribed. Your feedback helps us improve.</p>
    <p style="font-size: 14px;">
      <a href="${contactUrl}" style="color: #059669; text-decoration: underline;">Send us feedback</a>
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      Thank you for being part of our community. We hope to see you again!
    </p>
  `;

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  const footerText = `This email confirms your unsubscribe request from The Pickleball Passport marketing emails.`;

  const html = baseEmailTemplate({
    title: 'Unsubscribe Confirmation',
    content,
    preheader: 'You have been unsubscribed from The Pickleball Passport updates',
    footerText: `${footerText}<br><br><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>`,
  });

  const text = `
You've Been Unsubscribed - The Pickleball Passport

We've successfully removed ${email} from our newsletter mailing list.

You will no longer receive marketing emails from The Pickleball Passport.

Note: You may still receive transactional emails related to bookings or account activity if you have an active account with us.

CHANGED YOUR MIND?
---
If you unsubscribed by mistake, you can easily resubscribe anytime by visiting our website: ${resubscribeUrl}

WE'D LOVE YOUR FEEDBACK
---
Sorry to see you go! If you have a moment, we'd appreciate hearing why you unsubscribed. Your feedback helps us improve.

Send us feedback: ${contactUrl}

Thank you for being part of our community. We hope to see you again!

---

${footerText}

© ${new Date().getFullYear()} The Pickleball Passport. All rights reserved.
Chiang Mai, Thailand
  `.trim();

  return {
    subject: "You've been unsubscribed from The Pickleball Passport",
    html,
    text,
  };
}
