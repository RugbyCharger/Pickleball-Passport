/**
 * Newsletter Welcome Email Template
 *
 * Welcome email sent after subscription confirmation (E1-S11)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export function newsletterWelcomeEmail(email: string): {
  subject: string;
  html: string;
  text: string;
} {
  const homeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  const content = `
    <h1>Welcome to Pickleball Passport! 🏓</h1>
    <p>You're officially part of our community! Thanks for confirming your subscription.</p>

    <h2 style="font-size: 20px; color: #111827; margin: 24px 0 12px 0;">What to Expect</h2>
    <ul style="color: #4b5563; font-size: 16px; line-height: 24px; margin: 0 0 16px 0; padding-left: 24px;">
      <li style="margin-bottom: 8px;"><strong>Exclusive Offers:</strong> Be the first to know about special packages and early-bird discounts</li>
      <li style="margin-bottom: 8px;"><strong>Wellness Tips:</strong> Monthly insights on health, dental care, and transformative wellness</li>
      <li style="margin-bottom: 8px;"><strong>Pickleball Adventures:</strong> Stories from our Thailand pickleball experiences and trip updates</li>
      <li style="margin-bottom: 8px;"><strong>Travel Inspiration:</strong> Discover how to combine your passion for pickleball with life-changing wellness</li>
    </ul>

    <h2 style="font-size: 20px; color: #111827; margin: 24px 0 12px 0;">Ready to Explore?</h2>
    <p>Discover our unique packages that blend pickleball, wellness, and adventure in beautiful Thailand.</p>
    <p style="text-align: center;">
      <a href="${homeUrl}" class="button">Explore Packages</a>
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      Have questions? Just reply to this email - we'd love to hear from you!
    </p>
  `;

  const footerText = `You're receiving this email because you confirmed your subscription to Pickleball Passport updates.`;

  const html = baseEmailTemplate({
    title: 'Welcome to Pickleball Passport',
    content,
    preheader: 'Welcome to the Pickleball Passport community! Here\'s what to expect.',
    footerText: `${footerText}<br><br><a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>`,
  });

  const text = `
Welcome to Pickleball Passport! 🏓

You're officially part of our community! Thanks for confirming your subscription.

WHAT TO EXPECT
---
- Exclusive Offers: Be the first to know about special packages and early-bird discounts
- Wellness Tips: Monthly insights on health, dental care, and transformative wellness
- Pickleball Adventures: Stories from our Thailand pickleball experiences and trip updates
- Travel Inspiration: Discover how to combine your passion for pickleball with life-changing wellness

READY TO EXPLORE?
---
Discover our unique packages that blend pickleball, wellness, and adventure in beautiful Thailand.

Visit: ${homeUrl}

Have questions? Just reply to this email - we'd love to hear from you!

---

${footerText}

Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Pickleball Passport. All rights reserved.
Chiang Mai, Thailand
  `.trim();

  return {
    subject: 'Welcome to Pickleball Passport Updates!',
    html,
    text,
  };
}
