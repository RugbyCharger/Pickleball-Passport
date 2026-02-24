/**
 * Gift Acceptance Notification Email Template (Purchaser)
 *
 * Sent to purchaser when recipient accepts the gift
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftAcceptanceNotificationPurchaserData {
  // Purchaser details
  purchaserFirstName: string;
  purchaserEmail: string;

  // Recipient details
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;

  // Booking details
  bookingReference: string;
  packageName: string;
  duration: number; // Days
  accommodationTier: string;

  // Acceptance date
  acceptedAt: string; // ISO date string

  // Portal link
  portalUrl?: string;
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

/**
 * Format date and time for display
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function generateGiftAcceptanceNotificationPurchaserEmail(data: GiftAcceptanceNotificationPurchaserData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard`;

  const content = `
    <div style="text-align: center; margin: 0 0 32px 0;">
      <div style="font-size: 64px; margin: 0 0 16px 0;">🎉</div>
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Your Gift Has Been Accepted!</h1>
    </div>

    <p style="font-size: 18px; text-align: center; color: #4b5563; margin: 0 0 32px 0;">
      Hi ${data.purchaserFirstName},
    </p>

    <p style="font-size: 16px; color: #4b5563; line-height: 1.7; text-align: center; margin: 0 0 32px 0;">
      Great news! <strong>${data.recipientFirstName} ${data.recipientLastName}</strong> has accepted your gift
      and is now ready to embark on their transformation journey to Thailand.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Gift Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
      <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 12px 0 0 0;">
        Accepted on ${formatDateTime(data.acceptedAt)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎁 Gift Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <div style="margin: 0 0 16px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
          Gift Recipient
        </p>
        <p style="margin: 0 0 4px 0; color: #78350f; font-size: 14px;">
          <strong>Name:</strong> ${data.recipientFirstName} ${data.recipientLastName}
        </p>
        <p style="margin: 0; color: #78350f; font-size: 14px;">
          <strong>Email:</strong> ${data.recipientEmail}
        </p>
      </div>

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

    <div style="margin: 24px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600; text-align: center;">
        ✅ Booking Successfully Transferred to ${data.recipientFirstName}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📬 What Happens Next?</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
        ${data.recipientFirstName} now has full access to their booking and can:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
        <li>Select or confirm travel dates</li>
        <li>Complete their guest profile</li>
        <li>Upload required documents</li>
        <li>Review trip details and itinerary</li>
        <li>Add additional experiences (with payment)</li>
        <li>Contact support with any questions</li>
      </ul>
      <p style="margin: 12px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.7;">
        The Pickleball Passport team will guide them through every step of the journey.
      </p>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${portalUrl}" class="button" style="display: inline-block; padding: 16px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Gift Status in Dashboard
      </a>
    </div>

    <div style="margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600; line-height: 1.7;">
        Thank you for giving the gift of transformation! 💝
      </p>
      <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        Your thoughtful gift will create memories that last a lifetime.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
      You can continue to track the booking status in your dashboard. The booking is now managed by ${data.recipientFirstName},
      but you'll always have visibility into the gift you purchased.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0 0;">
      If you have any questions, please contact our support team at
      <a href="mailto:Ryan@thepickleballpassport.org" style="color: #2563eb;">Ryan@thepickleballpassport.org</a>.
    </p>

    <p style="color: #111827; font-weight: 600; margin: 16px 0 0 0;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: `🎉 ${data.recipientFirstName} Accepted Your Gift!`,
    content,
    preheader: `${data.recipientFirstName} ${data.recipientLastName} has accepted your gift booking for a trip to Thailand. Booking ${data.bookingReference} is now active.`,
    footerText: 'You received this email because the recipient accepted your gift booking with The Pickleball Passport.',
  });

  const text = generatePlainText(html);

  const subject = `🎉 ${data.recipientFirstName} ${data.recipientLastName} accepted your gift! - ${data.bookingReference}`;

  return { html, text, subject };
}
