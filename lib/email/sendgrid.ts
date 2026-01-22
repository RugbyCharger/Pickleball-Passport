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

/**
 * Send support ticket confirmation email to guest/prospect
 */
export async function sendTicketCreatedEmail(
  to: string,
  data: import('./templates/ticket-created').TicketCreatedData
): Promise<void> {
  const { generateTicketCreatedEmail } = await import('./templates/ticket-created');
  const { html, text, subject } = generateTicketCreatedEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send support ticket admin notification email
 */
export async function sendTicketAdminNotification(
  data: import('./templates/ticket-admin-notification').TicketAdminNotificationData
): Promise<void> {
  const { generateTicketAdminNotificationEmail } = await import('./templates/ticket-admin-notification');
  const { html, text, subject } = generateTicketAdminNotificationEmail(data);

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'hello@pickleballpassport.com';
  const ccEmails = process.env.ADMIN_ALERT_CC_EMAILS?.split(',').map((e) => e.trim()).filter(Boolean) || [];

  // Send to primary admin
  await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
    replyTo: data.email, // Set reply-to as the ticket submitter's email
  });

  // Send to CC admins if configured
  if (ccEmails.length > 0) {
    await sendEmail({
      to: ccEmails,
      subject,
      html,
      text,
      replyTo: data.email,
    });
  }
}

/**
 * Send support ticket reply notification email to guest/prospect
 */
export async function sendTicketReplyEmail(
  to: string,
  data: import('./templates/ticket-reply').TicketReplyData
): Promise<void> {
  const { generateTicketReplyEmail } = await import('./templates/ticket-reply');
  const { html, text, subject } = generateTicketReplyEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send support ticket resolved notification email to guest/prospect
 */
export async function sendTicketResolvedEmail(
  to: string,
  data: import('./templates/ticket-resolved').TicketResolvedData
): Promise<void> {
  const { generateTicketResolvedEmail } = await import('./templates/ticket-resolved');
  const { html, text, subject } = generateTicketResolvedEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}

// ============================================================================
// E9-S16: Partner Support Ticket Email Notifications
// ============================================================================

export interface PartnerTicketNotificationData {
  ticketId: string;
  subject: string;
  partnerName: string;
  partnerEmail: string;
  priority: string;
}

/**
 * Send notification to admin when partner creates a new support ticket
 */
export async function sendPartnerTicketNotification(data: PartnerTicketNotificationData): Promise<void> {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'hello@pickleballpassport.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com';

  const priorityColors: Record<string, string> = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#ef4444',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003D5C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Partner Support Ticket</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb;">
        <p style="margin-bottom: 16px;">A partner has submitted a new support ticket:</p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px;"><strong>Partner:</strong> ${data.partnerName}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.partnerEmail}</p>
          <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${data.subject}</p>
          <p style="margin: 0;">
            <strong>Priority:</strong>
            <span style="background: ${priorityColors[data.priority] || '#6b7280'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${data.priority}
            </span>
          </p>
        </div>

        <a href="${appUrl}/dashboard/admin/partner-tickets/${data.ticketId}"
           style="display: inline-block; background: #D4AF37; color: #003D5C; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          View Ticket
        </a>
      </div>
      <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Pickleball Passport Partner Support</p>
      </div>
    </div>
  `;

  const text = `
New Partner Support Ticket

Partner: ${data.partnerName}
Email: ${data.partnerEmail}
Subject: ${data.subject}
Priority: ${data.priority}

View ticket: ${appUrl}/dashboard/admin/partner-tickets/${data.ticketId}
  `.trim();

  await sendEmail({
    to: adminEmail,
    subject: `[Partner Support] ${data.priority === 'HIGH' ? '🔴 HIGH PRIORITY - ' : ''}${data.subject}`,
    html,
    text,
    replyTo: data.partnerEmail,
  });
}

export interface PartnerTicketReplyNotificationData {
  ticketId: string;
  subject: string;
  partnerName: string;
  partnerEmail: string;
}

/**
 * Send notification to partner when admin replies to their support ticket
 */
export async function sendPartnerTicketReplyNotification(data: PartnerTicketReplyNotificationData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003D5C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Reply on Your Support Ticket</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb;">
        <p>Hi ${data.partnerName},</p>

        <p>Our support team has replied to your ticket:</p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Subject:</strong> ${data.subject}</p>
        </div>

        <a href="${appUrl}/dashboard/partner/support/${data.ticketId}"
           style="display: inline-block; background: #D4AF37; color: #003D5C; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          View Conversation
        </a>

        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
          If you have any questions, you can reply directly in the ticket portal.
        </p>
      </div>
      <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Pickleball Passport Partner Support</p>
      </div>
    </div>
  `;

  const text = `
Hi ${data.partnerName},

Our support team has replied to your ticket:

Subject: ${data.subject}

View the conversation: ${appUrl}/dashboard/partner/support/${data.ticketId}

If you have any questions, you can reply directly in the ticket portal.

Pickleball Passport Partner Support
  `.trim();

  await sendEmail({
    to: data.partnerEmail,
    subject: `Re: ${data.subject} - Pickleball Passport Support`,
    html,
    text,
  });
}

export interface PartnerTestimonialApprovedData {
  partnerEmail: string;
  partnerName: string;
}

/**
 * Send notification to partner when their testimonial is approved
 */
export async function sendPartnerTestimonialApproved(data: PartnerTestimonialApprovedData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003D5C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">Your Testimonial Has Been Approved!</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb;">
        <p>Hi ${data.partnerName},</p>

        <p>Great news! Your testimonial has been reviewed and approved by our team.</p>

        <div style="background: white; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0;">Thank you for sharing your experience with the Pickleball Passport Partner Program. Your feedback helps other potential partners learn about the benefits of our program.</p>
        </div>

        <a href="${appUrl}/dashboard/partner/testimonials"
           style="display: inline-block; background: #D4AF37; color: #003D5C; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          View Your Testimonials
        </a>

        <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
          Your testimonial may be featured on our marketing materials and partner page.
        </p>
      </div>
      <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Pickleball Passport Partner Program</p>
      </div>
    </div>
  `;

  const text = `
Hi ${data.partnerName},

Great news! Your testimonial has been reviewed and approved by our team.

Thank you for sharing your experience with the Pickleball Passport Partner Program. Your feedback helps other potential partners learn about the benefits of our program.

View your testimonials: ${appUrl}/dashboard/partner/testimonials

Your testimonial may be featured on our marketing materials and partner page.

Pickleball Passport Partner Program
  `.trim();

  await sendEmail({
    to: data.partnerEmail,
    subject: 'Your Testimonial Has Been Approved - Pickleball Passport',
    html,
    text,
  });
}
