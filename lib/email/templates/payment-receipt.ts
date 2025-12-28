/**
 * Payment Receipt Email Template
 *
 * Sent to guests after successful payment (separate from booking confirmation)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PaymentReceiptData {
  // Guest details
  firstName: string;
  email: string;

  // Payment details
  receiptNumber: string;
  paymentDate: string; // ISO date string
  paymentMethod: string; // e.g., "Visa ending in 4242"

  // Booking reference
  bookingReference: string;
  packageName: string;

  // Pricing breakdown
  items: Array<{
    description: string;
    quantity?: number;
    amount: number; // In cents
  }>;

  subtotal: number; // In cents
  tax?: number; // In cents
  totalAmount: number; // In cents

  // Optional
  receiptUrl?: string; // Link to Stripe receipt
  notes?: string;
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generatePaymentReceiptEmail(data: PaymentReceiptData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h1>Payment Receipt 🧾</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Thank you for your payment! This email confirms we've successfully received your payment
      for Pickleball Passport.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Receipt Number
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.receiptNumber}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Payment Summary</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.paymentDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💰 Payment Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${data.items.map(item => `
        <tr>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}${item.description}
          </td>
          <td style="padding: 8px 0; color: #111827; text-align: right;">${formatCurrency(item.amount)}</td>
        </tr>
        `).join('')}
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px;">Subtotal:</td>
          <td style="padding: 12px 0 8px 0; color: #111827; text-align: right;">${formatCurrency(data.subtotal)}</td>
        </tr>
        ${data.tax && data.tax > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Tax:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.tax)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #059669;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 18px; font-weight: bold;">Total Paid:</td>
          <td style="padding: 12px 0 0 0; color: #059669; font-size: 18px; font-weight: bold; text-align: right;">${formatCurrency(data.totalAmount)}</td>
        </tr>
      </table>
    </div>

    ${data.notes ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>Note:</strong> ${data.notes}
      </p>
    </div>
    ` : ''}

    ${data.receiptUrl ? `
    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.receiptUrl}" class="button">
        Download Official Receipt
      </a>
    </p>
    ` : ''}

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">
        ✅ Payment Confirmed
      </p>
      <p style="margin: 0; color: #166534; font-size: 14px;">
        Your payment has been successfully processed. You'll receive a separate booking confirmation email
        with details about your trip and next steps.
      </p>
    </div>

    <p>
      If you have any questions about this payment or need assistance, please don't hesitate to contact us.
    </p>

    <p>
      Thank you for choosing Pickleball Passport!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Payment Receipt - Pickleball Passport',
    content,
    preheader: `Payment receipt for ${data.packageName} - ${formatCurrency(data.totalAmount)}`,
    footerText: `This is a payment receipt for your Pickleball Passport booking.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `Payment Receipt - ${data.receiptNumber}`,
  };
}
