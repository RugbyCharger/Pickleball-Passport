/**
 * Admin Email Alerts Service
 * Story 11-8
 *
 * Central service module for sending admin alerts
 * Non-blocking: Logs errors but doesn't throw
 */

import { emailLogger, logError } from '@/lib/logger';
import { sendEmail } from './sendgrid';

/**
 * Get admin email addresses
 */
function getAdminEmails(): { primary: string | undefined; cc: string[] } {
  const primary = process.env.ADMIN_ALERT_EMAIL;
  const cc = process.env.ADMIN_ALERT_CC_EMAILS?.split(',').map((e) => e.trim()).filter(Boolean) || [];
  return { primary, cc };
}

/**
 * Check if admin alerts are configured
 */
export function isAdminAlertsConfigured(): boolean {
  return !!process.env.ADMIN_ALERT_EMAIL;
}

/**
 * Get high-value booking threshold in cents
 */
export function getHighValueThreshold(): number {
  const threshold = parseInt(process.env.HIGH_VALUE_BOOKING_THRESHOLD || '500000', 10);
  return isNaN(threshold) ? 500000 : threshold; // Default $5,000 in cents if invalid
}

export interface AdminAlertOptions {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send admin alert email
 * Non-blocking: Logs errors but doesn't throw
 */
export async function sendAdminAlert(options: AdminAlertOptions): Promise<void> {
  if (!isAdminAlertsConfigured()) {
    emailLogger.warn('Admin alerts not configured - skipping alert');
    return;
  }

  try {
    const { primary, cc } = getAdminEmails();
    const recipients = [primary!, ...cc];

    await sendEmail({
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    emailLogger.info({ subject: options.subject, recipientCount: recipients.length }, 'Admin alert sent successfully');
  } catch (error) {
    logError(emailLogger, error, 'Failed to send admin alert', {
      subject: options.subject,
    });
    // Don't throw - admin alerts are non-blocking
  }
}

/**
 * Send payment failure admin alert
 * Uses existing installment-failure-admin template
 */
export async function sendPaymentFailureAlert(
  data: import('./templates/installment-failure-admin').InstallmentFailureAdminData
): Promise<void> {
  try {
    const { generateInstallmentFailureAdminEmail } = await import('./templates/installment-failure-admin');
    const { html, text, subject } = generateInstallmentFailureAdminEmail(data);

    await sendAdminAlert({ subject, html, text });
  } catch (error) {
    logError(emailLogger, error, 'Failed to send payment failure alert', {
      bookingReference: data.bookingReference,
      installmentNumber: data.installmentNumber,
    });
  }
}

/**
 * Booking cancellation data for admin alerts
 */
export interface BookingCancellationAlertData {
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
 * Send booking cancellation admin alert
 */
export async function sendBookingCancellationAlert(
  data: BookingCancellationAlertData
): Promise<void> {
  try {
    const { generateBookingCancellationAdminEmail } = await import('./templates/booking-cancellation-admin');
    const { html, text, subject } = generateBookingCancellationAdminEmail(data);

    await sendAdminAlert({ subject, html, text });
  } catch (error) {
    logError(emailLogger, error, 'Failed to send booking cancellation alert', {
      bookingReference: data.bookingReference,
    });
  }
}

/**
 * High-value booking data for admin alerts
 */
export interface HighValueBookingAlertData {
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
 * Send high-value booking admin alert
 */
export async function sendHighValueBookingAlert(
  data: HighValueBookingAlertData
): Promise<void> {
  try {
    const { generateHighValueBookingAdminEmail } = await import('./templates/high-value-booking-admin');
    const { html, text, subject } = generateHighValueBookingAdminEmail(data);

    await sendAdminAlert({ subject, html, text });
  } catch (error) {
    logError(emailLogger, error, 'Failed to send high-value booking alert', {
      bookingReference: data.bookingReference,
      totalValue: data.totalBookingValue,
    });
  }
}

/**
 * Overbooking alert data for admin notification
 */
export interface OverbookingAlertData {
  guestName: string;
  guestEmail: string;
  bookingReference: string;
  bookingId: string;
  packageName: string;
  tripName: string;
  tripId: string;
  tripStartDate: string;
  tripCapacity: number;
  currentBookings: number;
  paymentAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  bookingAdminUrl: string;
  tripAdminUrl: string;
}

/**
 * System error data for admin alerts
 */
export interface SystemErrorAlertData {
  errorType: 'payment' | 'email' | 'sms' | 'database' | 'api' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  errorMessage: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
  timestamp: string; // ISO date
  environment: string; // production, staging, development
  userId?: string;
  bookingId?: string;
}

/**
 * Send system error admin alert
 */
export async function sendSystemErrorAlert(
  data: SystemErrorAlertData
): Promise<void> {
  try {
    const { generateSystemErrorAdminEmail } = await import('./templates/system-error-admin');
    const { html, text, subject } = generateSystemErrorAdminEmail(data);

    await sendAdminAlert({ subject, html, text });
  } catch (error) {
    logError(emailLogger, error, 'Failed to send system error alert', {
      errorType: data.errorType,
      severity: data.severity,
    });
  }
}

/**
 * Send overbooking prevention admin alert
 * Triggered when atomic capacity check prevents overbooking during payment confirmation
 */
export async function sendOverbookingAlert(
  data: OverbookingAlertData
): Promise<void> {
  try {
    const { generateOverbookingAlertEmail } = await import('./templates/overbooking-alert-admin');
    const { html, text, subject } = generateOverbookingAlertEmail(data);

    await sendAdminAlert({ subject, html, text });

    emailLogger.warn(
      { tripId: data.tripId, bookingId: data.bookingId, capacity: data.tripCapacity, current: data.currentBookings },
      'Overbooking alert sent to admin'
    );
  } catch (error) {
    logError(emailLogger, error, 'Failed to send overbooking alert', {
      tripId: data.tripId,
      bookingReference: data.bookingReference,
    });
  }
}
