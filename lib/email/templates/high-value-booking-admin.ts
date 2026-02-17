/**
 * High-Value Booking Admin Alert
 * Story 11-8
 *
 * Sent to admin when a booking exceeds the configured value threshold
 * Celebrates the booking and provides full context for VIP treatment
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface HighValueBookingAdminData {
  customerName: string;
  customerEmail: string;
  customerLocation?: string;
  bookingReference: string;
  bookingId: string;
  packageName: string;
  tripName: string;
  tripStartDate: string; // ISO date
  addOns: string[]; // List of add-on names
  totalBookingValue: number; // In cents
  paymentMethod: 'full_payment' | 'installments';
  installmentPlan?: string; // e.g., "4 monthly installments"
  bookingAdminUrl: string;
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

export function generateHighValueBookingAdminEmail(
  data: HighValueBookingAdminData
): {
  html: string;
  text: string;
  subject: string;
} {
  const paymentMethodLabel = data.paymentMethod === 'full_payment' ? '✅ Full Payment' : '📅 Installment Plan';

  const content = `
    <h1>🎉 High-Value Booking Alert</h1>

    <p>
      Great news! A high-value booking has just been confirmed. This customer deserves VIP treatment and personalized attention.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #d1fae5; border-radius: 12px; border-left: 4px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #065f46; font-weight: 600; font-size: 16px;">
        💰 Total Booking Value
      </p>
      <p style="margin: 0; color: #065f46; font-size: 32px; font-weight: bold;">
        ${formatCurrency(data.totalBookingValue)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">👤 Customer Profile</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a>
          </td>
        </tr>
        ${data.customerLocation ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.customerLocation}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📦 Booking Summary</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.packageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.tripName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Trip Start Date:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.tripStartDate)}</td>
        </tr>
      </table>
    </div>

    ${data.addOns.length > 0 ? `
    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✨ Selected Add-Ons</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
        ${data.addOns.map((addOn) => `<li>${addOn}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💳 Payment Information</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Payment Method:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${paymentMethodLabel}</td>
        </tr>
        ${data.installmentPlan ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.installmentPlan}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Value:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">${formatCurrency(data.totalBookingValue)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">⭐ VIP Treatment Checklist</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.6;">
      <li><strong>Personalized Welcome:</strong> Send a personal thank-you email from leadership</li>
      <li><strong>VIP Concierge:</strong> Assign a dedicated concierge for pre-trip planning</li>
      <li><strong>Room Upgrade:</strong> Consider complimentary accommodation upgrade if available</li>
      <li><strong>Welcome Gift:</strong> Prepare a special welcome package for arrival</li>
      <li><strong>Priority Support:</strong> Flag account for priority customer service</li>
      <li><strong>Feedback Loop:</strong> Schedule check-ins before, during, and after the trip</li>
      <li><strong>Referral Incentive:</strong> Offer enhanced referral rewards for this VIP customer</li>
      <li><strong>Alumni Program:</strong> Fast-track for exclusive alumni benefits and events</li>
    </ol>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.bookingAdminUrl}" class="button">
        View Booking in Admin Dashboard
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Customer Success Tip
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        High-value customers are the most likely to refer friends and become repeat travelers. Exceptional service here creates exponential value through word-of-mouth marketing.
      </p>
    </div>

    <p>
      <strong>The Pickleball Passport Admin System</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'High-Value Booking Alert',
    content,
    preheader: `${data.bookingReference} - ${formatCurrency(data.totalBookingValue)} booking confirmed!`,
    footerText: 'This is an automated admin alert from The Pickleball Passport.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `🎉 High-Value Booking: ${data.bookingReference} - ${formatCurrency(data.totalBookingValue)}`,
  };
}
