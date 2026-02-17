/**
 * Overbooking Admin Alert Email Template
 * Phase 02-03
 *
 * Sent to admin when atomic capacity check prevents overbooking during payment confirmation.
 * For luxury $15-25K packages, personal admin resolution is more appropriate than automated rejection.
 * Uses RED/urgent styling to indicate immediate attention required.
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface OverbookingAlertData {
  guestName: string;
  guestEmail: string;
  bookingReference: string;
  bookingId: string;
  packageName: string;
  tripName: string;
  tripId: string;
  tripStartDate: string; // ISO date
  tripCapacity: number;
  currentBookings: number;
  paymentAmount: number; // In cents, the payment that triggered this
  paymentStatus: string; // Should be 'SUCCEEDED'
  bookingStatus: string; // Will be 'CONFIRMED' per soft rejection
  bookingAdminUrl: string;
  tripAdminUrl: string;
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
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateOverbookingAlertEmail(
  data: OverbookingAlertData
): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `
    <h1 style="color: #dc2626;">URGENT: Overbooking Prevention Triggered</h1>

    <div style="margin: 32px 0; padding: 24px; background-color: #fef2f2; border-radius: 12px; border-left: 4px solid #dc2626;">
      <p style="margin: 0 0 8px 0; color: #991b1b; font-weight: 600; font-size: 16px;">
        Capacity Alert
      </p>
      <p style="margin: 0; color: #991b1b; font-size: 18px;">
        Trip <strong>${data.tripName}</strong> was at capacity when payment was confirmed.
      </p>
    </div>

    <p>
      A guest's payment succeeded, but the trip had already reached maximum capacity. The booking has been confirmed (payment accepted), but the trip capacity was <strong>not incremented</strong> to prevent overbooking. This requires immediate admin attention.
    </p>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Capacity Status</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #991b1b; font-size: 14px; width: 40%;">Current Capacity:</td>
          <td style="padding: 8px 0; color: #991b1b; font-weight: bold; font-size: 18px;">
            ${data.currentBookings} / ${data.tripCapacity} (at maximum)
          </td>
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

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Guest Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.guestName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">
            <a href="mailto:${data.guestEmail}" style="color: #2563eb; text-decoration: none;">${data.guestEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.packageName}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Payment Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Amount Paid:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">${formatCurrency(data.paymentAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Status:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 600;">${data.paymentStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Status:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingStatus}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Current State</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>Booking has been confirmed</strong> (payment accepted) but <strong>trip capacity was not incremented</strong>.
        The guest received their confirmation email. Admin intervention is required to resolve this situation.
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">Recommended Actions</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.8; padding-left: 20px;">
      <li><strong>Contact the guest immediately</strong> to discuss the situation and available options</li>
      <li><strong>If space becomes available</strong> (e.g., a cancellation occurred): Manually adjust trip capacity in admin dashboard</li>
      <li><strong>Consider alternatives:</strong>
        <ul style="margin-top: 8px;">
          <li>Offer the guest an upgrade to a different trip date with availability</li>
          <li>Provide a premium alternative with compensation for inconvenience</li>
          <li>If no alternatives work, process a full refund with apology</li>
        </ul>
      </li>
    </ol>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.bookingAdminUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 8px;">
        View Booking
      </a>
      <a href="${data.tripAdminUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 8px;">
        View Trip
      </a>
    </div>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        Why This Happened
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        This occurs when multiple guests complete payment at nearly the same time for a trip approaching capacity.
        Our atomic capacity check prevents actual overbooking by only allowing one booking through, but the other guest's payment
        still succeeds. This is by design to avoid payment failures for paying customers.
      </p>
    </div>

    <p>
      <strong>The Pickleball Passport Admin System</strong>
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'URGENT: Overbooking Prevention Triggered',
    content,
    preheader: `Trip ${data.tripName} at capacity - guest ${data.guestEmail} paid ${formatCurrency(data.paymentAmount)}`,
    footerText: 'This is an automated admin alert from The Pickleball Passport.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `URGENT: Overbooking Prevention Triggered - ${data.tripName}`,
  };
}
