/**
 * Booking Confirmation Email Template - Primary Guest with Companion
 *
 * Sent to primary guest after successful payment for both bookings
 * Shows both the primary and companion booking details
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PrimaryWithCompanionConfirmationData {
  // Primary guest details
  firstName: string;
  email: string;

  // Primary booking details
  primaryBookingReference: string;
  primaryPackageName: string;
  primaryDuration: number;
  primaryAccommodationTier: string;
  primaryBasePrice: number; // In cents
  primaryAccommodationPrice: number; // In cents
  primaryAddOnsTotal: number; // In cents
  primarySubtotal: number; // In cents

  // Companion details
  companionFirstName: string;
  companionLastName: string;
  companionEmail: string;

  // Companion booking details
  companionBookingReference: string;
  companionPackageName: string;
  companionDuration: number;
  companionAccommodationTier: string;
  companionBasePrice: number; // In cents
  companionAccommodationPrice: number; // In cents ($0 if shared)
  companionAddOnsTotal: number; // In cents
  companionSubtotal: number; // In cents

  // Shared accommodation
  isSharedAccommodation: boolean;

  // Trip details (same for both if durations match)
  tripStartDate?: string; // ISO date string or formatted date
  tripEndDate?: string; // ISO date string or formatted date
  destination: string; // e.g., "Chiang Mai, Thailand"

  // Combined pricing
  grandTotal: number; // In cents (what was actually paid)

  // Primary guest add-ons
  primaryAddOns?: Array<{
    name: string;
    quantity: number;
    price: number; // In cents
  }>;

  // Companion add-ons
  companionAddOns?: Array<{
    name: string;
    quantity: number;
    price: number; // In cents
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

export function generatePrimaryWithCompanionConfirmationEmail(data: PrimaryWithCompanionConfirmationData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`;

  // Build primary guest add-ons
  const primaryAddOnsHtml = data.primaryAddOns && data.primaryAddOns.length > 0
    ? `
    <div style="margin: 12px 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600; font-size: 14px;">Your Add-Ons:</p>
      ${data.primaryAddOns.map(addOn => `
        <p style="margin: 4px 0; color: #4b5563; font-size: 13px;">
          ${addOn.quantity > 1 ? `${addOn.quantity}x ` : ''}${addOn.name} - ${formatCurrency(addOn.price)}
        </p>
      `).join('')}
    </div>
    `
    : '';

  // Build companion add-ons
  const companionAddOnsHtml = data.companionAddOns && data.companionAddOns.length > 0
    ? `
    <div style="margin: 12px 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #059669;">
      <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600; font-size: 14px;">Companion's Add-Ons:</p>
      ${data.companionAddOns.map(addOn => `
        <p style="margin: 4px 0; color: #4b5563; font-size: 13px;">
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

  // Shared accommodation callout
  const sharedAccommodationHtml = data.isSharedAccommodation
    ? `
    <div style="margin: 20px 0; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 14px;">
        🏨 Shared Accommodation
      </p>
      <p style="margin: 8px 0 0 0; color: #047857; font-size: 14px;">
        You and ${data.companionFirstName} will be sharing a ${data.primaryAccommodationTier} accommodation.
        No additional charge has been applied for ${data.companionFirstName}'s accommodation.
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
      Congratulations! Your booking has been confirmed along with your companion ${data.companionFirstName} ${data.companionLastName}.
      Payment has been received for both bookings. We're thrilled to welcome you both to The Pickleball Passport for an
      unforgettable experience combining exceptional medical care, wellness, and pickleball in beautiful Thailand.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #2563eb 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Your Booking References
      </p>
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.primaryBookingReference}
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 8px 0 0 0;">
        (Your Booking)
      </p>
      <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 16px 0 0 0; letter-spacing: 2px;">
        ${data.companionBookingReference}
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 8px 0 0 0;">
        (${data.companionFirstName}'s Booking)
      </p>
    </div>

    ${sharedAccommodationHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Booking Summary</h2>

    <!-- Primary Guest Booking -->
    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #059669; font-size: 18px; margin: 0 0 16px 0;">Your Booking</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.primaryPackageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.primaryDuration} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.primaryAccommodationTier}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px;">Base Package:</td>
          <td style="padding: 12px 0 8px 0; color: #111827; text-align: right;">${formatCurrency(data.primaryBasePrice)}</td>
        </tr>
        ${data.primaryAccommodationPrice > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.primaryAccommodationPrice)}</td>
        </tr>
        ` : ''}
        ${data.primaryAddOnsTotal > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Add-Ons:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.primaryAddOnsTotal)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #059669;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: bold;">Your Subtotal:</td>
          <td style="padding: 12px 0 0 0; color: #059669; font-size: 16px; font-weight: bold; text-align: right;">${formatCurrency(data.primarySubtotal)}</td>
        </tr>
      </table>
      ${primaryAddOnsHtml}
    </div>

    <!-- Companion Booking -->
    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
      <h3 style="color: #2563eb; font-size: 18px; margin: 0 0 16px 0;">Companion Booking (${data.companionFirstName} ${data.companionLastName})</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.companionPackageName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.companionDuration} days</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.companionAccommodationTier}${data.isSharedAccommodation ? ' (Shared)' : ''}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px;">Base Package:</td>
          <td style="padding: 12px 0 8px 0; color: #111827; text-align: right;">${formatCurrency(data.companionBasePrice)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.companionAccommodationPrice)}${data.isSharedAccommodation ? ' ✨' : ''}</td>
        </tr>
        ${data.companionAddOnsTotal > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Add-Ons:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.companionAddOnsTotal)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #2563eb;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 16px; font-weight: bold;">Companion Subtotal:</td>
          <td style="padding: 12px 0 0 0; color: #2563eb; font-size: 16px; font-weight: bold; text-align: right;">${formatCurrency(data.companionSubtotal)}</td>
        </tr>
      </table>
      ${companionAddOnsHtml}
    </div>

    <!-- Grand Total -->
    <div style="margin: 24px 0; padding: 24px; background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%); border-radius: 12px; border: 2px solid #059669;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0; color: #111827; font-size: 20px; font-weight: bold;">TOTAL PAID:</td>
          <td style="padding: 0; color: #059669; font-size: 24px; font-weight: bold; text-align: right;">${formatCurrency(data.grandTotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px 0 0 0; color: #6b7280; font-size: 12px; text-align: right;">
            (Combined payment for 2 guests)
          </td>
        </tr>
      </table>
    </div>

    ${tripDatesHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Next Steps</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Access Your Member Portal</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          View both bookings, itineraries, download documents, and track pre-trip checklists for both you and ${data.companionFirstName}.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Share Confirmation with ${data.companionFirstName}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ${data.companionFirstName} will receive a separate confirmation email at ${data.companionEmail}.
          They can create an account to access their booking portal.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Complete Pre-Trip Checklists</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Both guests should complete passport verification, medical questionnaires, and travel arrangements.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">4. Coordinate Travel</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          We'll send detailed flight recommendations and airport transfer coordination for both travelers.
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
        <li style="margin: 4px 0;">Ensure both travelers' passports are valid for at least 6 months from travel date</li>
        <li style="margin: 4px 0;">US citizens get 30-day visa-free entry to Thailand</li>
        <li style="margin: 4px 0;">Travel insurance is highly recommended for both guests</li>
        <li style="margin: 4px 0;">Both guests should complete medical questionnaires within 7 days</li>
        ${data.isSharedAccommodation ? `<li style="margin: 4px 0;">Room sharing preferences can be adjusted up to 14 days before arrival</li>` : ''}
      </ul>
    </div>

    <p>
      If you have any questions or need assistance, our team is here to help! Simply reply to
      this email or contact us through your member portal.
    </p>

    <p>
      We can't wait to welcome you and ${data.companionFirstName} to Thailand for your transformation journey!
    </p>

    <p>
      Safe travels and see you both soon!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Booking Confirmed - You + Companion - The Pickleball Passport',
    content,
    preheader: `Bookings ${data.primaryBookingReference} and ${data.companionBookingReference} confirmed! Your transformation journey awaits.`,
    footerText: `You received this email because you completed a booking with The Pickleball Passport.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `🎉 Booking Confirmed - You + ${data.companionFirstName} (Refs: ${data.primaryBookingReference}, ${data.companionBookingReference})`,
  };
}
