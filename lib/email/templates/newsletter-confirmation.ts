/**
 * Newsletter Confirmation Email Template
 *
 * Double opt-in confirmation email sent after newsletter signup (E1-S11)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export function newsletterConfirmationEmail(
  email: string,
  confirmToken: string
): {
  subject: string;
  html: string;
  text: string;
} {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/newsletter/confirm?token=${confirmToken}`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = `
    <h1>Confirm Your Subscription</h1>
    <p>Thanks for subscribing to Pickleball Passport updates!</p>
    <p>We're excited to share exclusive offers, wellness tips, and amazing pickleball adventures with you.</p>
    <p>Click the button below to confirm your subscription:</p>
    <p style="text-align: center;">
      <a href="${confirmUrl}" class="button">Confirm Subscription</a>
    </p>
    <p style="font-size: 14px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <a href="${confirmUrl}" style="color: #059669; word-break: break-all;">${confirmUrl}</a>
    </p>
    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      <strong>Note:</strong> This link expires in 7 days. If you didn't request this subscription, you can safely ignore this email.
    </p>
  `;

  const footerText = `You received this email because someone signed up for Pickleball Passport updates with this email address. If this wasn't you, please ignore this email.`;

  const html = baseEmailTemplate({
    title: 'Confirm Your Subscription',
    content,
    preheader: 'Click to confirm your subscription to Pickleball Passport updates',
    footerText: `${footerText}<br><br><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>`,
  });

  const text = `
Confirm Your Subscription - Pickleball Passport

Thanks for subscribing to Pickleball Passport updates!

We're excited to share exclusive offers, wellness tips, and amazing pickleball adventures with you.

To confirm your subscription, click the link below or copy it into your browser:
${confirmUrl}

Note: This link expires in 7 days. If you didn't request this subscription, you can safely ignore this email.

---

${footerText}

Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Pickleball Passport. All rights reserved.
Chiang Mai, Thailand
  `.trim();

  return {
    subject: 'Confirm Your Subscription to Pickleball Passport',
    html,
    text,
  };
}
