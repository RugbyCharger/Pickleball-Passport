/**
 * Booking Cancellation Admin Alert
 * Story 11-8
 *
 * Sent to admin when a guest cancels their booking
 * Provides context for revenue tracking and potential follow-up
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface BookingCancellationAdminData {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  bookingId: string;
  cancellationReason?: string;
  packageName: string;
  tripName: string;
  tripStartDate: string; // ISO date
  totalBookingValue: number; // In cents
  refundAmount: number; // In cents
  refundStatus: 'pending' | 'processing' | 'completed';
  daysUntilTrip: number;
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

/**
 * Get urgency color based on days until trip
 */
function getUrgencyColor(daysUntilTrip: number): string {
  if (daysUntilTrip < 14) return '#dc2626'; // Red - very urgent
  if (daysUntilTrip < 30) return '#ea580c'; // Orange - urgent
  if (daysUntilTrip < 60) return '#ca8a04'; // Yellow - moderate
  return '#059669'; // Green - not urgent
}

/**
 * Get urgency label
 */
function getUrgencyLabel(daysUntilTrip: number): string {
  if (daysUntilTrip < 14) return 'URGENT - Less than 2 weeks';
  if (daysUntilTrip < 30) return 'HIGH - Less than 1 month';
  if (daysUntilTrip < 60) return 'MEDIUM - Less than 2 months';
  return 'LOW - More than 2 months';
}

export function generateBookingCancellationAdminEmail(
  data: BookingCancellationAdminData
): {
  html: string;
  text: string;
  subject: string;
} {
  const urgencyColor = getUrgencyColor(data.daysUntilTrip);
  const urgencyLabel = getUrgencyLabel(data.daysUntilTrip);
  const refundPercentage = ((data.refundAmount / data.totalBookingValue) * 100).toFixed(0);

  const content = `
    <h1>📋 Booking Cancellation - Admin Alert</h1>

    <p>
      A guest has cancelled their booking. Review the details below for potential follow-up and revenue tracking.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: ${urgencyColor === '#dc2626' ? '#fee2e2' : '#fef3c7'}; border-radius: 12px; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 8px 0; color: ${urgencyColor === '#dc2626' ? '#991b1b' : '#92400e'}; font-weight: 600; font-size: 16px;">
        ⏰ ${urgencyLabel}
      </p>
      <p style="margin: 0; color: ${urgencyColor === '#dc2626' ? '#991b1b' : '#92400e'}; font-size: 14px;">
        ${data.daysUntilTrip} days remaining until trip start date
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">👤 Customer Information</h2>

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
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.bookingReference}</td>
        </tr>
      </table>
    </div>

    ${data.cancellationReason ? `
    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💬 Cancellation Reason</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #ca8a04;">
      <p style="margin: 0; color: #78350f; font-size: 14px; font-style: italic;">
        "${data.cancellationReason}"
      </p>
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📦 Booking Details</h2>

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
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Days Until Trip:</td>
          <td style="padding: 8px 0; color: ${urgencyColor}; font-weight: 600;">${data.daysUntilTrip} days</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💰 Financial Impact</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Total Booking Value:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 16px;">${formatCurrency(data.totalBookingValue)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Refund Amount:</td>
          <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 16px;">${formatCurrency(data.refundAmount)} (${refundPercentage}%)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Refund Status:</td>
          <td style="padding: 8px 0; color: ${data.refundStatus === 'completed' ? '#059669' : '#ca8a04'}; font-weight: 600; text-transform: uppercase;">${data.refundStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Revenue Retained:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 16px;">${formatCurrency(data.totalBookingValue - data.refundAmount)}</td>
        </tr>
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Recommended Actions</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.6;">
      <li><strong>Review Cancellation Reason:</strong> Identify if there's a service improvement opportunity</li>
      <li><strong>Send Feedback Survey:</strong> Ask what could have improved their experience</li>
      <li><strong>Add to Re-engagement List:</strong> Consider future promotional offers</li>
      <li><strong>Update Trip Capacity:</strong> Slot may now be available for waitlist customers</li>
      <li><strong>Monitor Refund Processing:</strong> Ensure refund completes within expected timeline</li>
      <li><strong>Track Cancellation Metrics:</strong> Add to monthly cancellation rate analysis</li>
    </ol>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${data.bookingAdminUrl}" class="button">
        View Booking in Admin Dashboard
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Follow-up Opportunity
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        Consider reaching out to understand what led to the cancellation. This feedback can help improve the service and potentially win back future bookings.
      </p>
    </div>

    <p>
      <strong>Pickleball Passport Admin System</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Booking Cancellation - Admin Alert',
    content,
    preheader: `${data.bookingReference} - ${data.customerName} cancelled their booking`,
    footerText: 'This is an automated admin alert from Pickleball Passport.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `📋 Booking Cancelled: ${data.bookingReference} - ${data.daysUntilTrip} days until trip`,
  };
}
