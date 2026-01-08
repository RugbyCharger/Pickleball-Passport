/**
 * SendGrid Email Service
 *
 * Provides utilities for sending emails via SendGrid API
 */

import type { MailService } from '@sendgrid/mail';

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
  console.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
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
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const sgMail = await getSgMail();

  const msg = {
    to: options.to,
    from: options.from || FROM_EMAIL,
    subject: options.subject,
    html: options.html,
    text: options.text || '', // SendGrid requires text field
    replyTo: options.replyTo,
    attachments: options.attachments,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
  } catch (error) {
    console.error('SendGrid error:', error);
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
    console.log(`Batch of ${emails.length} emails sent successfully`);
  } catch (error) {
    console.error('SendGrid batch error:', error);
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
  const { generateTripReminderEmail } = await import('./templates/trip-reminder');
  const { html, text, subject } = generateTripReminderEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
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
