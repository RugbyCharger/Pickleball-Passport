/**
 * SendGrid Email Service
 *
 * Provides utilities for sending emails via SendGrid API
 */

import type { MailService } from '@sendgrid/mail';
import { emailLogger, logError } from '@/lib/logger';
import { generateEmailToken } from '@/lib/preferences/email-token';

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
const isConfiguredFlag = !!(apiKey && apiKey.length > 0);

let sgMailPromise: Promise<MailService> | null = null;

// Lazy initialization of SendGrid
async function getSgMail(): Promise<MailService> {
  if (!isConfiguredFlag) {
    throw new Error('SendGrid API key is not configured');
  }

  if (!sgMailPromise) {
    sgMailPromise = import('@sendgrid/mail').then(({ default: mail }) => {
      mail.setApiKey(apiKey);
      return mail;
    });
  }

  return sgMailPromise;
}

if (!isConfiguredFlag) {
  emailLogger.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@pickleballpassport.com';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    content: string; // Base64 encoded content
    filename: string;
    type: string; // MIME type
    disposition?: string; // 'attachment' or 'inline'
  }>;
  userId?: string; // For token generation (if preferenceToken not provided)
  preferenceToken?: string; // Pre-generated token (E11-S12)
  isMarketing?: boolean; // For List-Unsubscribe header
}

/**
 * Send an email using SendGrid
 *
 * IMPORTANT: For optional (non-transactional) emails, check user preferences BEFORE calling this function:
 *
 * @example
 * // For marketing emails
 * import { canSendNotification } from '@/lib/preferences/user-preferences';
 *
 * if (!(await canSendNotification(userId, 'emailMarketing'))) {
 *   emailLogger.info({ userId }, 'User opted out of marketing emails');
 *   return;
 * }
 *
 * await sendEmail({
 *   to: userEmail,
 *   subject: 'Special offer!',
 *   html: emailHtml,
 *   userId,
 *   isMarketing: true, // Enables List-Unsubscribe header
 * });
 *
 * @example
 * // For post-trip follow-up
 * if (!(await canSendNotification(userId, 'emailPostTripFollowUp'))) {
 *   return;
 * }
 *
 * @example
 * // For alumni events
 * if (!(await canSendNotification(userId, 'emailAlumniEvents'))) {
 *   return;
 * }
 *
 * Transactional emails (booking confirmations, payment receipts, etc.) should NEVER check preferences.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const sgMail = await getSgMail();

  // Use provided token or generate from userId
  let preferenceToken: string | undefined = options.preferenceToken;
  if (!preferenceToken && options.userId) {
    try {
      preferenceToken = await generateEmailToken(options.userId);
    } catch (error) {
      emailLogger.warn({ userId: options.userId }, 'Failed to generate email token, continuing without preference links');
    }
  }

  // Add List-Unsubscribe header for marketing emails
  const headers: Record<string, string> = {};
  if (options.isMarketing && preferenceToken) {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/unsubscribe?token=${preferenceToken}`;
    headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const msg = {
    to: options.to,
    from: options.from || FROM_EMAIL,
    subject: options.subject,
    html: options.html,
    text: options.text || '', // SendGrid requires text field
    replyTo: options.replyTo,
    attachments: options.attachments,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };

  try {
    await sgMail.send(msg);
    emailLogger.info({ to: options.to, subject: options.subject }, 'Email sent successfully');
  } catch (error) {
    logError(emailLogger, error, 'SendGrid error', { to: options.to, subject: options.subject });
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw new Error('Failed to send email');
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(emails: SendEmailOptions[]): Promise<void> {
  const sgMail = await getSgMail();

  const messages = emails.map((email) => ({
    to: email.to,
    from: email.from || FROM_EMAIL,
    subject: email.subject,
    html: email.html,
    text: email.text || '',
    replyTo: email.replyTo,
  }));

  try {
    await sgMail.send(messages);
    emailLogger.info({ count: emails.length }, 'Batch emails sent successfully');
  } catch (error) {
    logError(emailLogger, error, 'SendGrid batch error', { count: emails.length });
    if (error instanceof Error) {
      throw new Error(`Failed to send batch emails: ${error.message}`);
    }
    throw new Error('Failed to send batch emails');
  }
}

/**
 * Verify SendGrid configuration
 */
export function isConfigured(): boolean {
  return isConfiguredFlag;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  to: string,
  data: import('./templates/booking-confirmation').BookingConfirmationData
): Promise<void> {
  const { generateBookingConfirmationEmail } = await import('./templates/booking-confirmation');
  const { html, text, subject } = generateBookingConfirmationEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(
  to: string,
  data: import('./templates/payment-receipt').PaymentReceiptData & {
    pdfAttachment?: Buffer; // Optional PDF receipt attachment (E4-S8)
  }
): Promise<void> {
  const { generatePaymentReceiptEmail } = await import('./templates/payment-receipt');
  const { html, text, subject } = generatePaymentReceiptEmail(data);

  // Prepare attachments if PDF buffer is provided
  const attachments = data.pdfAttachment
    ? [
        {
          content: data.pdfAttachment.toString('base64'),
          filename: `${data.receiptNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ]
    : undefined;

  await sendEmail({
    to,
    subject,
    html,
    text,
    attachments,
  });
}

/**
 * Send trip reminder email
 */
export async function sendTripReminder(
  to: string,
  data: import('./templates/trip-reminder').TripReminderData
): Promise<void> {
  // Generate preference token if userId provided (E11-S12)
  let dataWithToken = data;
  let preferenceToken: string | undefined;
  if (data.userId && !data.preferenceToken) {
    try {
      preferenceToken = await generateEmailToken(data.userId);
      dataWithToken = { ...data, preferenceToken };
    } catch (error) {
      emailLogger.warn({ userId: data.userId }, 'Failed to generate token for trip reminder');
    }
  } else {
    preferenceToken = data.preferenceToken;
  }

  const { generateTripReminderEmail } = await import('./templates/trip-reminder');
  const { html, text, subject } = generateTripReminderEmail(dataWithToken);

  await sendEmail({
    to,
    subject,
    html,
    text,
    preferenceToken,
    isMarketing: false, // Trip reminders are not marketing emails
  });
}

/**
 * Send document approval email
 */
export async function sendDocumentApproval(
  to: string,
  data: import('./templates/document-approval').DocumentApprovalData
): Promise<void> {
  const { generateDocumentApprovalEmail } = await import('./templates/document-approval');
  const { html, text, subject } = generateDocumentApprovalEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send document rejection email
 */
export async function sendDocumentRejection(
  to: string,
  data: import('./templates/document-rejection').DocumentRejectionData
): Promise<void> {
  const { generateDocumentRejectionEmail } = await import('./templates/document-rejection');
  const { html, text, subject } = generateDocumentRejectionEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  data: import('./templates/welcome').WelcomeEmailData
): Promise<void> {
  const { generateWelcomeEmail } = await import('./templates/welcome');
  const { html, text, subject } = generateWelcomeEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send application confirmation email
 */
export async function sendApplicationConfirmation(
  to: string,
  data: import('./templates/application-confirmation').ApplicationConfirmationData
): Promise<void> {
  const { generateApplicationConfirmationEmail } = await import('./templates/application-confirmation');
  const { html, text, subject } = generateApplicationConfirmationEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmation(
  to: string,
  data: import('./templates/refund-confirmation').RefundConfirmationData
): Promise<void> {
  const { generateRefundConfirmationEmail } = await import('./templates/refund-confirmation');
  const html = generateRefundConfirmationEmail(data);

  await sendEmail({
    to,
    subject: `Refund Processed - Booking ${data.bookingReference}`,
    html,
    text: `Your refund of $${(data.refundAmount / 100).toFixed(2)} has been processed for booking ${data.bookingReference}. Please allow ${data.expectedTimeline} for the funds to appear in your account.`,
  });
}

/**
 * Send booking modification confirmation email (E3-S16)
 */
export async function sendBookingModification(
  to: string,
  data: import('./templates/booking-modification').BookingModificationData
): Promise<void> {
  const { generateBookingModificationEmail } = await import('./templates/booking-modification');
  const { html, text, subject } = generateBookingModificationEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send booking confirmation to primary guest with companion (E3-S17)
 */
export async function sendPrimaryWithCompanionConfirmation(
  to: string,
  data: import('./templates/booking-confirmation-primary-with-companion').PrimaryWithCompanionConfirmationData
): Promise<void> {
  const { generatePrimaryWithCompanionConfirmationEmail } = await import('./templates/booking-confirmation-primary-with-companion');
  const { html, text, subject } = generatePrimaryWithCompanionConfirmationEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send booking confirmation to companion guest (E3-S17)
 */
export async function sendCompanionConfirmation(
  to: string,
  data: import('./templates/booking-confirmation-companion').CompanionConfirmationData
): Promise<void> {
  const { generateCompanionConfirmationEmail } = await import('./templates/booking-confirmation-companion');
  const { html, text, subject } = generateCompanionConfirmationEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}
