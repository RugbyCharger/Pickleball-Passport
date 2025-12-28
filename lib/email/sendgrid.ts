/**
 * SendGrid Email Service
 *
 * Provides utilities for sending emails via SendGrid API
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
} else {
  sgMail.setApiKey(apiKey);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@pickleballpassport.com';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!apiKey) {
    throw new Error('SendGrid API key is not configured');
  }

  const msg = {
    to: options.to,
    from: options.from || FROM_EMAIL,
    subject: options.subject,
    html: options.html,
    text: options.text || '', // SendGrid requires text field
    replyTo: options.replyTo,
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
  if (!apiKey) {
    throw new Error('SendGrid API key is not configured');
  }

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
  return !!apiKey;
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
  data: import('./templates/payment-receipt').PaymentReceiptData
): Promise<void> {
  const { generatePaymentReceiptEmail } = await import('./templates/payment-receipt');
  const { html, text, subject } = generatePaymentReceiptEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
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
