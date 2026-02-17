/**
 * Booking Confirmation Email Template
 *
 * Sent to guests after successful payment
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface BookingConfirmationData {
  // Guest details
  firstName: string;
  email: string;

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
  basePrice: number; // In cents
  accommodationPrice: number; // In cents
  addOnsTotal: number; // In cents
  totalPrice: number; // In cents

  // Add-ons
  addOns?: Array<{
    name: string;
    quantity: number;
    price: number; // In cents
  }>;

  // Payment Plan - E4-S6
  paymentPlan?: 'FULL' | 'INSTALLMENT_4' | 'FINANCING';
  amountPaid?: number; // In cents - for installment plans (first payment)
  installmentSchedule?: Array<{
    number: number;
    amount: number; // In cents
    dueDate: string; // ISO date string
  }>;

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

export function generateBookingConfirmationEmail(data: BookingConfirmationData): {
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

  // Build trip dates section
  const tripDatesHtml = data.tripStartDate && data.tripEndDate
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 8px 0;">📅 Your Trip Dates:</h3>
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
    : '';

  const content = `
    <h1>Your Transformation Journey is Confirmed! 🎉</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Congratulations! Your booking has been confirmed and payment received. We're thrilled to
      welcome you to The Pickleball Passport for an unforgettable experience combining world-class
      medical care, wellness, and pickleball in beautiful Thailand.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Booking Summary</h2>

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
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px;">Base Package:</td>
          <td style="padding: 12px 0 8px 0; color: #111827; text-align: right;">${formatCurrency(data.basePrice)}</td>
        </tr>
        ${data.accommodationPrice > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Accommodation Upgrade:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.accommodationPrice)}</td>
        </tr>
        ` : ''}
        ${data.addOnsTotal > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Add-Ons:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.addOnsTotal)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #059669;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 18px; font-weight: bold;">
            ${data.paymentPlan === 'INSTALLMENT_4' ? 'Total Package Price:' : 'Total Paid:'}
          </td>
          <td style="padding: 12px 0 0 0; color: #059669; font-size: 18px; font-weight: bold; text-align: right;">${formatCurrency(data.totalPrice)}</td>
        </tr>
        ${data.paymentPlan === 'INSTALLMENT_4' && data.amountPaid ? `
        <tr>
          <td style="padding: 8px 0 0 0; color: #6b7280; font-size: 14px;">Paid Today (50%):</td>
          <td style="padding: 8px 0 0 0; color: #059669; font-weight: 600; text-align: right;">${formatCurrency(data.amountPaid)}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${addOnsHtml}

    ${data.paymentPlan === 'INSTALLMENT_4' && data.installmentSchedule ? `
    <div style="margin: 24px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">💳 Payment Schedule (4 Installments)</h3>
      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
        Your remaining payments will be automatically charged to your saved payment method on the following dates:
      </p>
      ${data.installmentSchedule.map(inst => `
        <div style="margin: 12px 0; padding: 12px; background-color: ${inst.number === 1 ? '#dbeafe' : '#ffffff'}; border-radius: 6px; ${inst.number === 1 ? 'border: 2px solid #2563eb;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px;">
                ${inst.number === 1 ? '✓ Payment 1 - Paid Today' : `Payment ${inst.number} - ${formatDate(inst.dueDate)}`}
              </p>
            </div>
            <p style="margin: 0; color: #111827; font-weight: bold; font-size: 16px;">
              ${formatCurrency(inst.amount)}
            </p>
          </div>
        </div>
      `).join('')}
      <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 12px;">
        You can view and manage your payment schedule anytime from your member portal. We'll send you email reminders before each payment.
      </p>
    </div>
    ` : ''}

    ${tripDatesHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Next Steps</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Access Your Member Portal</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          View your itinerary, download documents, and track your pre-trip checklist.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Complete Your Pre-Trip Checklist</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Passport verification, medical questionnaire, and travel arrangements.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Book Your Flights</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          We'll send detailed flight recommendations and airport transfer coordination.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">4. Stay Connected</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          You'll receive regular updates leading up to your trip with packing tips, local insights, and preparation guides.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}" class="button">
        Access Member Portal
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        💡 Important Reminders
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #78350f; font-size: 14px;">
        <li style="margin: 4px 0;">Ensure your passport is valid for at least 6 months from travel date</li>
        <li style="margin: 4px 0;">US citizens get 30-day visa-free entry to Thailand</li>
        <li style="margin: 4px 0;">Travel insurance is highly recommended</li>
        <li style="margin: 4px 0;">Complete your medical questionnaire within 7 days</li>
      </ul>
    </div>

    <p>
      If you have any questions or need assistance, our team is here to help! Simply reply to
      this email or contact us through your member portal.
    </p>

    <p>
      We can't wait to welcome you to Thailand for your transformation journey!
    </p>

    <p>
      Safe travels and see you soon!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Booking Confirmed - The Pickleball Passport',
    content,
    preheader: `Booking ${data.bookingReference} confirmed! Your transformation journey awaits.`,
    footerText: `You received this email because you completed a booking with The Pickleball Passport.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `🎉 Booking Confirmed - ${data.packageName} (Ref: ${data.bookingReference})`,
  };
}
