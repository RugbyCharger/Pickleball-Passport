/**
 * Booking Cancellation Guest Email
 * EML-01 & EML-02
 *
 * Sent to guest when their booking is cancelled (by themselves or admin)
 * Provides confirmation of cancellation and refund details if applicable
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface BookingCancellationGuestData {
  firstName: string;
  email: string;
  bookingReference: string;
  packageName: string;
  tripName: string;
  cancellationDate: string; // ISO date
  refundAmount?: number; // In cents, optional - only if refund processed
  refundPercentage?: number; // Optional
  supportUrl: string;
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateBookingCancellationGuestEmail(
  data: BookingCancellationGuestData
): {
  html: string;
  text: string;
  subject: string;
} {
  const hasRefund = data.refundAmount && data.refundAmount > 0;

  const content = `
    <h1>Booking Cancellation Confirmation</h1>

    <p>Hi ${data.firstName},</p>

    <p>
      We're sorry to see you go. This email confirms that your booking has been cancelled.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6b7280;">
      <h2 style="color: #111827; font-size: 18px; margin: 0 0 16px 0;">Cancellation Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.tripName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cancellation Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.cancellationDate)}</td>
        </tr>
      </table>
    </div>

    ${hasRefund ? `
    <div style="margin: 32px 0; padding: 24px; background-color: #ecfdf5; border-radius: 12px; border-left: 4px solid #059669;">
      <h2 style="color: #065f46; font-size: 18px; margin: 0 0 16px 0;">Refund Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px; width: 40%;">Refund Amount:</td>
          <td style="padding: 8px 0; color: #065f46; font-weight: bold; font-size: 18px;">${formatCurrency(data.refundAmount!)}${data.refundPercentage ? ` (${data.refundPercentage}%)` : ''}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #065f46; font-size: 14px;">Processing Time:</td>
          <td style="padding: 8px 0; color: #065f46; font-weight: 600;">5-10 business days</td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; color: #065f46; font-size: 14px;">
        Your refund will be credited to your original payment method. Please allow 5-10 business days for the funds to appear in your account.
      </p>
    </div>
    ` : ''}

    <p>
      We understand plans can change, and we hope to welcome you on a future The Pickleball Passport adventure.
    </p>

    <p>
      If you have any questions about your cancellation${hasRefund ? ' or refund' : ''}, please don't hesitate to reach out to our support team.
    </p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.supportUrl}" class="button">
        Contact Support
      </a>
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      Thank you for considering The Pickleball Passport. We hope to see you on the courts soon!
    </p>

    <p>
      <strong>The Pickleball Passport Team</strong>
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Booking Cancellation Confirmation',
    content,
    preheader: `Your booking ${data.bookingReference} has been cancelled`,
    footerText: 'This is a transactional email regarding your Pickleball Passport booking.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `Booking Cancelled - ${data.bookingReference}`,
  };
}
