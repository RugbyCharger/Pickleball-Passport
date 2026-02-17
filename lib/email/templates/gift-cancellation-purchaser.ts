/**
 * Gift Cancellation Confirmation Email Template (Purchaser)
 *
 * Sent to purchaser when they cancel a PENDING gift before delivery
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftCancellationPurchaserData {
  // Purchaser details
  purchaserFirstName: string;
  purchaserEmail: string;

  // Recipient details
  recipientName: string;

  // Booking details
  bookingReference: string;
  packageName: string;
  totalRefund: number; // In cents
}

/**
 * Format currency amount from cents to dollars
 */
function formatCurrency(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function generateGiftCancellationPurchaserEmail(data: GiftCancellationPurchaserData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <div style="text-align: center; margin: 0 0 32px 0;">
      <div style="font-size: 64px; margin: 0 0 16px 0;">&#10004;</div>
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Gift Cancelled - Refund Processed</h1>
    </div>

    <p style="font-size: 18px; text-align: center; color: #4b5563; margin: 0 0 32px 0;">
      Hi ${data.purchaserFirstName},
    </p>

    <p style="font-size: 16px; color: #4b5563; line-height: 1.7; text-align: center; margin: 0 0 24px 0;">
      Your gift to <strong>${data.recipientName}</strong> has been cancelled as requested. A full refund has been processed.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #ecfdf5; border-radius: 12px; text-align: center; border: 2px solid #10b981;">
      <p style="color: #065f46; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Refund Amount
      </p>
      <p style="color: #059669; font-size: 32px; font-weight: bold; margin: 0;">
        ${formatCurrency(data.totalRefund)}
      </p>
      <p style="color: #047857; font-size: 14px; margin: 12px 0 0 0;">
        Processed to your original payment method
      </p>
    </div>

    <div style="margin: 24px 0; padding: 16px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>Note:</strong> It may take 5-10 business days for the refund to appear in your account, depending on your bank or card issuer.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 18px; margin: 32px 0 16px 0;">Cancelled Booking Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Gift Recipient:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.recipientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 12px;">Refund Amount:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 12px;">${formatCurrency(data.totalRefund)}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
        Changed your mind? You can always purchase a new gift at any time. We'd love to help you share The Pickleball Passport experience with someone special.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
      If you have any questions about your refund, please contact our support team at
      <a href="mailto:support@pickleballpassport.com" style="color: #2563eb;">support@pickleballpassport.com</a>.
    </p>

    <p style="color: #111827; font-weight: 600; margin: 24px 0 0 0;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Gift Cancelled - Refund Processed',
    content,
    preheader: `Your gift to ${data.recipientName} has been cancelled. Full refund processed.`,
    footerText: 'You received this email because you cancelled a gift purchase with The Pickleball Passport.',
  });

  const text = generatePlainText(html);

  const subject = `Gift Cancelled - Refund Processed - ${data.bookingReference}`;

  return { html, text, subject };
}
