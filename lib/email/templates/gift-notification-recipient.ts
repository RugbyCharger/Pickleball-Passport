/**
 * Gift Notification Email Template (Recipient)
 *
 * Sent to recipient when gift is ready for acceptance
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftNotificationRecipientData {
  // Recipient details
  recipientFirstName: string;
  recipientEmail: string;

  // Purchaser details
  purchaserFirstName: string;
  purchaserLastName: string;

  // Booking details
  bookingReference: string;
  packageName: string;
  packageDescription?: string;
  duration: number; // Days
  accommodationTier: string;

  // Trip details
  tripStartDate?: string; // ISO date string or formatted date
  tripEndDate?: string; // ISO date string or formatted date
  destination: string; // e.g., "Chiang Mai, Thailand"

  // Total value
  totalValue: number; // In cents

  // Add-ons
  addOns?: Array<{
    name: string;
    quantity: number;
  }>;

  // Gift details
  giftMessage?: string;

  // Acceptance link
  acceptanceUrl: string;
  packageUrl?: string;
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateGiftNotificationRecipientEmail(data: GiftNotificationRecipientData): {
  html: string;
  text: string;
  subject: string;
} {
  const packageUrl = data.packageUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/packages`;

  // Build gift message section
  const giftMessageHtml = data.giftMessage
    ? `
    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0; text-align: center;">💌 Personal Message from ${data.purchaserFirstName}</h3>
      <div style="background-color: rgba(255, 255, 255, 0.8); padding: 16px; border-radius: 8px;">
        <p style="margin: 0; color: #78350f; font-size: 15px; font-style: italic; line-height: 1.7; text-align: center;">
          "${data.giftMessage}"
        </p>
      </div>
    </div>
    `
    : '';

  // Build add-ons list HTML
  const addOnsHtml = data.addOns && data.addOns.length > 0
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">✨ Included Add-Ons:</h3>
      ${data.addOns.map(addOn => `
        <p style="margin: 4px 0; color: #065f46; font-size: 14px;">
          ✓ ${addOn.quantity > 1 ? `${addOn.quantity}x ` : ''}${addOn.name}
        </p>
      `).join('')}
    </div>
    `
    : '';

  // Build trip dates section
  const tripDatesHtml = data.tripStartDate && data.tripEndDate
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 8px 0;">📅 Your Trip Dates:</h3>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Check-in:</strong> ${formatDate(data.tripStartDate)}
      </p>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Check-out:</strong> ${formatDate(data.tripEndDate)}
      </p>
      <p style="margin: 4px 0; color: #1e40af; font-size: 14px;">
        <strong>Destination:</strong> ${data.destination}
      </p>
    </div>
    `
    : `
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;">
        <strong>Destination:</strong> ${data.destination}<br>
        <em>You'll be able to choose your preferred travel dates after accepting this gift.</em>
      </p>
    </div>
    `;

  const content = `
    <div style="text-align: center; margin: 0 0 32px 0;">
      <div style="font-size: 64px; margin: 0 0 16px 0;">🎁</div>
      <h1 style="margin: 0; font-size: 28px; color: #111827;">You've Received a Gift!</h1>
    </div>

    <p style="font-size: 18px; text-align: center; color: #4b5563; margin: 0 0 32px 0;">
      Hi ${data.recipientFirstName},
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%); border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">
        ${data.purchaserFirstName} ${data.purchaserLastName} has gifted you
      </p>
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.4;">
        An Incredible Transformation Trip<br>to Thailand! 🇹🇭
      </p>
    </div>

    ${giftMessageHtml}

    <p style="font-size: 16px; color: #4b5563; line-height: 1.7; text-align: center; margin: 32px 0;">
      This is an all-inclusive wellness and pickleball experience in beautiful Chiang Mai, Thailand.
      <strong>Everything is paid for</strong> - you just need to accept the gift and get ready for an unforgettable journey!
    </p>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0; text-align: center;">🎁 Your Gift Package</h2>

    <div style="margin: 16px 0; padding: 24px; background-color: #f9fafb; border-radius: 12px; border: 2px solid #e5e7eb;">
      <div style="text-align: center; margin: 0 0 16px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
          Package
        </p>
        <p style="color: #111827; font-size: 22px; font-weight: bold; margin: 0;">
          ${data.packageName}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.duration} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.accommodationTier}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 0 0; color: #059669; font-size: 14px; font-weight: 600;">Total Value:</td>
          <td style="padding: 12px 0 0 0; color: #059669; font-size: 18px; font-weight: bold; text-align: right;">${formatCurrency(data.totalValue)}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 16px 0 0 0; padding: 12px; background-color: #ecfdf5; border-radius: 8px;">
        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
          ✓ Fully Paid by ${data.purchaserFirstName}
        </p>
      </div>
    </div>

    ${addOnsHtml}
    ${tripDatesHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0; text-align: center;">🎯 How to Accept Your Gift</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
        <li>Click the "Accept Your Gift" button below</li>
        <li>Log in to your existing account, or create a new one (it's quick!)</li>
        <li>The booking will be transferred to your account automatically</li>
        <li>${data.tripStartDate ? 'Review your trip dates and complete your profile' : 'Choose your preferred travel dates and complete your profile'}</li>
        <li>Pack your bags and get ready for an amazing transformation experience! ✈️</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${data.acceptanceUrl}" class="button" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        🎁 Accept Your Gift
      </a>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
        Want to learn more about the experience first?
      </p>
      <a href="${packageUrl}" style="color: #2563eb; text-decoration: underline; font-size: 14px;">
        View Package Details
      </a>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>Note:</strong> This gift link is valid for 90 days. Please accept your gift at your earliest convenience.
        If you have any questions or need assistance, contact us at
        <a href="mailto:support@pickleballpassport.com" style="color: #b45309;">support@pickleballpassport.com</a>.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0; text-align: center;">
      ${data.purchaserFirstName} wanted you to have this incredible experience.<br>
      We can't wait to welcome you to Thailand!
    </p>

    <p style="color: #111827; font-weight: 600; margin: 16px 0 0 0; text-align: center;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: `🎁 You've Received a Gift Trip from ${data.purchaserFirstName}!`,
    content,
    preheader: `${data.purchaserFirstName} ${data.purchaserLastName} has gifted you a ${data.duration}-day transformation trip to Thailand worth ${formatCurrency(data.totalValue)}. Accept your gift now!`,
    footerText: `You received this email because ${data.purchaserFirstName} ${data.purchaserLastName} sent you a gift booking with Pickleball Passport.`,
  });

  const text = generatePlainText(html);

  const subject = `🎁 You've received a gift trip to Thailand from ${data.purchaserFirstName} ${data.purchaserLastName}!`;

  return { html, text, subject };
}
