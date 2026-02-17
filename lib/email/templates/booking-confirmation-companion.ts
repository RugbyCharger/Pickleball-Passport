/**
 * Booking Confirmation Email Template - Companion Guest
 *
 * Sent to companion guest after successful payment
 * Shows companion's booking details and link to primary booking
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface CompanionConfirmationData {
  // Companion guest details
  firstName: string;
  lastName: string;
  email: string;

  // Primary guest details (who they're traveling with)
  primaryFirstName: string;
  primaryLastName: string;
  primaryEmail: string;

  // Companion booking details
  bookingReference: string;
  packageName: string;
  duration: number; // Days
  accommodationTier: string;

  // Primary booking reference (for context)
  primaryBookingReference: string;

  // Trip details
  tripStartDate?: string; // ISO date string or formatted date
  tripEndDate?: string; // ISO date string or formatted date
  destination: string; // e.g., "Chiang Mai, Thailand"

  // Pricing (companion's portion)
  basePrice: number; // In cents
  accommodationPrice: number; // In cents ($0 if shared)
  addOnsTotal: number; // In cents
  totalPrice: number; // In cents (companion's portion)

  // Shared accommodation
  isSharedAccommodation: boolean;

  // Grand total (combined payment for both)
  grandTotal: number; // In cents

  // Add-ons
  addOns?: Array<{
    name: string;
    quantity: number;
    price: number; // In cents
  }>;

  // Account creation link
  createAccountUrl?: string;
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

export function generateCompanionConfirmationEmail(data: CompanionConfirmationData): {
  html: string;
  text: string;
  subject: string;
} {
  const createAccountUrl = data.createAccountUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/sign-up?email=${encodeURIComponent(data.email)}`;
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard`;

  // Build add-ons list HTML
  const addOnsHtml = data.addOns && data.addOns.length > 0
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #059669;">
      <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Your Selected Add-Ons:</h3>
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

  // Shared accommodation callout
  const sharedAccommodationHtml = data.isSharedAccommodation
    ? `
    <div style="margin: 20px 0; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 14px;">
        🏨 Shared Accommodation
      </p>
      <p style="margin: 8px 0 0 0; color: #047857; font-size: 14px;">
        You'll be sharing a ${data.accommodationTier} accommodation with ${data.primaryFirstName} ${data.primaryLastName}.
        No additional accommodation charge has been applied to your booking.
      </p>
    </div>
    `
    : '';

  // Linked booking info
  const linkedBookingHtml = `
    <div style="margin: 24px 0; padding: 16px; background-color: #f3e8ff; border-radius: 8px; border-left: 4px solid #9333ea;">
      <p style="margin: 0 0 8px 0; color: #6b21a8; font-weight: 600; font-size: 14px;">
        🔗 Linked Companion Booking
      </p>
      <p style="margin: 0; color: #7c3aed; font-size: 14px;">
        Your booking is linked to ${data.primaryFirstName} ${data.primaryLastName}'s booking (Ref: ${data.primaryBookingReference}).
        Payment of ${formatCurrency(data.grandTotal)} was processed for both bookings together.
      </p>
    </div>
  `;

  const content = `
    <h1>Welcome to Your Transformation Journey! 🎉</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Great news! Your companion booking has been confirmed. You'll be traveling to Thailand with
      ${data.primaryFirstName} ${data.primaryLastName} for an unforgettable The Pickleball Passport experience
      combining world-class medical care, wellness, and pickleball.
    </p>

    <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); border-radius: 12px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
        Your Booking Reference
      </p>
      <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">
        ${data.bookingReference}
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 12px 0 0 0;">
        Traveling with ${data.primaryFirstName} ${data.primaryLastName}
      </p>
    </div>

    ${linkedBookingHtml}

    ${sharedAccommodationHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Your Booking Summary</h2>

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
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.accommodationTier}${data.isSharedAccommodation ? ' (Shared)' : ''}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0 8px 0; color: #6b7280; font-size: 14px;">Base Package:</td>
          <td style="padding: 12px 0 8px 0; color: #111827; text-align: right;">${formatCurrency(data.basePrice)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Accommodation:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.accommodationPrice)}${data.isSharedAccommodation ? ' ✨' : ''}</td>
        </tr>
        ${data.addOnsTotal > 0 ? `
        <tr>
          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Add-Ons:</td>
          <td style="padding: 4px 0; color: #111827; text-align: right;">${formatCurrency(data.addOnsTotal)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #2563eb;">
          <td style="padding: 12px 0 0 0; color: #111827; font-size: 18px; font-weight: bold;">Your Portion:</td>
          <td style="padding: 12px 0 0 0; color: #2563eb; font-size: 18px; font-weight: bold; text-align: right;">${formatCurrency(data.totalPrice)}</td>
        </tr>
      </table>
      ${data.isSharedAccommodation ? `
      <p style="margin: 12px 0 0 0; padding: 12px; background-color: #ecfdf5; border-radius: 6px; color: #047857; font-size: 13px;">
        ✨ You saved ${formatCurrency(data.basePrice > 0 ? Math.floor(data.basePrice * 0.3) : 0)} by sharing accommodation!
      </p>
      ` : ''}
    </div>

    ${addOnsHtml}

    ${tripDatesHtml}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Next Steps</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Create Your Account</p>
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
          Access your member portal to view your booking, download documents, and track your pre-trip checklist.
        </p>
        <p style="text-align: center; margin: 0;">
          <a href="${createAccountUrl}" class="button">
            Create Account
          </a>
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Complete Your Pre-Trip Checklist</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Passport verification, medical questionnaire, and travel arrangements.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Coordinate with ${data.primaryFirstName}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Connect with ${data.primaryFirstName} (${data.primaryEmail}) to coordinate flights and travel plans.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">4. Stay Connected</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          You'll receive regular updates leading up to your trip with packing tips, local insights, and preparation guides.
        </p>
      </div>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        💡 Important Reminders
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #78350f; font-size: 14px;">
        <li style="margin: 4px 0;">Ensure your passport is valid for at least 6 months from travel date</li>
        <li style="margin: 4px 0;">US citizens get 30-day visa-free entry to Thailand</li>
        <li style="margin: 4px 0;">Travel insurance is highly recommended</li>
        <li style="margin: 4px 0;">Complete your medical questionnaire within 7 days</li>
        <li style="margin: 4px 0;">Contact ${data.primaryFirstName} to coordinate airport transfers</li>
        ${data.isSharedAccommodation ? `<li style="margin: 4px 0;">Room sharing preferences can be adjusted up to 14 days before arrival</li>` : ''}
      </ul>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💰 Payment Information
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
        ${data.primaryFirstName} ${data.primaryLastName} processed the combined payment of ${formatCurrency(data.grandTotal)} for both bookings.
        Your portion is ${formatCurrency(data.totalPrice)}. Please arrange payment directly with ${data.primaryFirstName} if needed.
      </p>
    </div>

    <p>
      If you have any questions or need assistance, our team is here to help! Simply reply to
      this email or contact us through your member portal (after creating your account).
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
    title: 'Booking Confirmed - Companion - The Pickleball Passport',
    content,
    preheader: `Booking ${data.bookingReference} confirmed! Traveling with ${data.primaryFirstName} ${data.primaryLastName}.`,
    footerText: `You received this email because ${data.primaryFirstName} ${data.primaryLastName} booked a companion booking for you with The Pickleball Passport.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `🎉 Booking Confirmed - Traveling with ${data.primaryFirstName} (Ref: ${data.bookingReference})`,
  };
}
