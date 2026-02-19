/**
 * Gift Acceptance Confirmation Email Template (Recipient)
 *
 * Sent to recipient after they accept the gift
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftAcceptanceConfirmationRecipientData {
  // Recipient details
  recipientFirstName: string;
  recipientEmail: string;

  // Purchaser details
  purchaserFirstName: string;
  purchaserLastName: string;

  // Booking details
  bookingReference: string;
  packageName: string;
  duration: number; // Days
  accommodationTier: string;

  // Trip details
  tripStartDate?: string; // ISO date string or formatted date
  tripEndDate?: string; // ISO date string or formatted date
  destination: string; // e.g., "Chiang Mai, Thailand"

  // Portal link
  portalUrl?: string;
  needsDateSelection: boolean; // True if trip dates not yet selected
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

export function generateGiftAcceptanceConfirmationRecipientEmail(data: GiftAcceptanceConfirmationRecipientData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`;

  // Build trip dates section or next steps
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
    <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⏳ Trip dates not selected yet.</strong> You can choose your preferred travel dates in your dashboard.
      </p>
    </div>
    `;

  const content = `
    <div style="text-align: center; margin: 0 0 32px 0;">
      <div style="font-size: 64px; margin: 0 0 16px 0;">✅</div>
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Gift Accepted!</h1>
    </div>

    <p style="font-size: 18px; text-align: center; color: #4b5563; margin: 0 0 32px 0;">
      Hi ${data.recipientFirstName},
    </p>

    <p style="font-size: 16px; color: #4b5563; line-height: 1.7; text-align: center; margin: 0 0 32px 0;">
      Congratulations! You've successfully accepted the gift trip from <strong>${data.purchaserFirstName} ${data.purchaserLastName}</strong>.
      Your transformation journey to Thailand is now confirmed and ready to go!
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Your Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Your Booking</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.duration} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.accommodationTier}</td>
        </tr>
      </table>
    </div>

    ${tripDatesHtml}

    <div style="margin: 24px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: center;">
        ✓ Fully Paid - No Payment Required
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎯 Next Steps</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
        ${data.needsDateSelection
          ? '<li><strong>Choose your travel dates</strong> - Select your preferred trip dates in your dashboard</li>'
          : '<li><strong>Review your trip dates</strong> - Your dates are confirmed as shown above</li>'
        }
        <li><strong>Complete your guest profile</strong> - Add any required personal information</li>
        <li><strong>Upload travel documents</strong> - Submit passport and any other required documents</li>
        <li><strong>Review trip details</strong> - Familiarize yourself with the itinerary and what's included</li>
        <li><strong>Prepare for your journey</strong> - Get ready for an incredible transformation experience! ✈️</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${portalUrl}" class="button" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Go to My Dashboard
      </a>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; font-size: 16px; margin: 0 0 8px 0;">💡 Pro Tips:</h3>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.7;">
        <li>Complete your profile and upload documents as soon as possible</li>
        <li>Check your email regularly for trip updates and reminders</li>
        <li>Join our community to connect with other travelers</li>
        <li>Review the packing list and travel guidelines in your dashboard</li>
      </ul>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
      We've also notified ${data.purchaserFirstName} that you've accepted the gift. If you have any questions or need
      assistance, please contact our support team at
      <a href="mailto:Ryan@thepickleballpassport.org" style="color: #2563eb;">Ryan@thepickleballpassport.org</a>.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0 0;">
      We can't wait to welcome you to Chiang Mai!
    </p>

    <p style="color: #111827; font-weight: 600; margin: 16px 0 0 0;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: '✅ Gift Accepted - Welcome to The Pickleball Passport!',
    content,
    preheader: `You've successfully accepted your gift trip to Thailand. Your booking ${data.bookingReference} is now active.`,
    footerText: 'You received this email because you accepted a gift booking with The Pickleball Passport.',
  });

  const text = generatePlainText(html);

  const subject = `✅ Gift Accepted! Your Trip to Thailand is Confirmed - ${data.bookingReference}`;

  return { html, text, subject };
}
