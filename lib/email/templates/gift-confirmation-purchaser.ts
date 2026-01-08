/**
 * Gift Confirmation Email Template (Purchaser)
 *
 * Sent to purchaser after successful gift booking payment
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftConfirmationPurchaserData {
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

  // Trip details
  tripStartDate?: string; // ISO date string or formatted date
  tripEndDate?: string; // ISO date string or formatted date
  destination: string; // e.g., "Chiang Mai, Thailand"

  // Pricing
  totalPrice: number; // In cents

  // Add-ons
  addOns?: Array<{
    name: string;
    quantity: number;
    price: number; // In cents
  }>;

  // Gift details
  giftMessage?: string;
  deliveryDate?: string; // "immediate" or formatted date
  isScheduled: boolean;

  // Portal link
  portalUrl?: string;
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

export function generateGiftConfirmationPurchaserEmail(data: GiftConfirmationPurchaserData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`;

  // Build add-ons list HTML
  const addOnsHtml = data.addOns && data.addOns.length > 0
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Selected Add-Ons:</h3>
      ${data.addOns.map(addOn => `
        <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
          ${addOn.quantity > 1 ? `${addOn.quantity}x ` : ''}${addOn.name} - ${formatCurrency(addOn.price)}
        </p>
      `).join('')}
    </div>
    `
    : '';

  // Build gift message section
  const giftMessageHtml = data.giftMessage
    ? `
    <div style="margin: 24px 0; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">📝 Your Gift Message:</h3>
      <p style="margin: 0; color: #78350f; font-size: 14px; font-style: italic; line-height: 1.6;">
        "${data.giftMessage}"
      </p>
    </div>
    `
    : '';

  // Build delivery date section
  const deliveryDateHtml = data.isScheduled && data.deliveryDate
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>📅 Scheduled Delivery:</strong> Your gift notification will be sent to ${data.recipientFirstName} on <strong>${formatDate(data.deliveryDate)}</strong> at 9:00 AM PST.
      </p>
    </div>
    `
    : `
    <div style="margin: 24px 0; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        <strong>✅ Immediate Delivery:</strong> Your gift notification has been sent to ${data.recipientFirstName} at ${data.recipientEmail}.
      </p>
    </div>
    `;

  // Build trip dates section
  const tripDatesHtml = data.tripStartDate && data.tripEndDate
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 8px 0;">📅 Trip Dates:</h3>
      <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
        <strong>Check-in:</strong> ${formatDate(data.tripStartDate)}
      </p>
      <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
        <strong>Check-out:</strong> ${formatDate(data.tripEndDate)}
      </p>
      <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
        <strong>Destination:</strong> ${data.destination}
      </p>
    </div>
    `
    : `
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;">
        <strong>Destination:</strong> ${data.destination}<br>
        <em>Trip dates will be selected by the recipient after they accept the gift.</em>
      </p>
    </div>
    `;

  const content = `
    <h1>🎁 Your Gift Booking is Confirmed!</h1>

    <p>
      Hi ${data.purchaserFirstName},
    </p>

    <p>
      Thank you for giving the gift of transformation! Your payment has been received and your gift booking
      for <strong>${data.recipientFirstName} ${data.recipientLastName}</strong> has been confirmed.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #f59e0b 0%, #ec4899 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        🎁 Gift Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
    </div>

    ${deliveryDateHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🎁 Gift Recipient</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${data.recipientFirstName} ${data.recipientLastName}
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px;">
        ${data.recipientEmail}
      </p>
    </div>

    ${giftMessageHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Package Details</h2>

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

    ${addOnsHtml}
    ${tripDatesHtml}

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 16px; font-weight: 600;">Total Paid:</td>
          <td style="padding: 8px 0; color: #065f46; font-size: 20px; font-weight: bold; text-align: right;">${formatCurrency(data.totalPrice)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📬 What Happens Next?</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
      <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
        ${data.isScheduled
          ? `<li>On ${data.deliveryDate}, ${data.recipientFirstName} will receive a gift notification email</li>`
          : `<li>${data.recipientFirstName} has received a gift notification email with acceptance instructions</li>`
        }
        <li>They'll be able to accept the gift by logging in or creating an account</li>
        <li>Once accepted, the booking will be transferred to their account</li>
        <li>You'll receive a confirmation email when they accept the gift</li>
        <li>${data.recipientFirstName} can then select trip dates (if not already chosen) and complete their profile</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View Gift Status in Dashboard
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
      You can track the status of your gift booking in your dashboard. If you have any questions or need to make changes,
      please contact our support team at <a href="mailto:support@pickleballpassport.com" style="color: #2563eb;">support@pickleballpassport.com</a>.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0 0;">
      Thank you for sharing the gift of transformation!
    </p>

    <p style="color: #111827; font-weight: 600; margin: 16px 0 0 0;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: '🎁 Your Gift Booking is Confirmed!',
    content,
    preheader: `Your gift booking for ${data.recipientFirstName} ${data.recipientLastName} has been confirmed. Payment received: ${formatCurrency(data.totalPrice)}.`,
    footerText: 'You received this email because you purchased a gift booking with Pickleball Passport.',
  });

  const text = generatePlainText(html);

  const subject = `🎁 Gift Booking Confirmed for ${data.recipientFirstName} ${data.recipientLastName} - ${data.bookingReference}`;

  return { html, text, subject };
}
