/**
 * Gift Decline Confirmation Email Template (Recipient)
 *
 * Sent to recipient after they decline the gift
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GiftDeclineConfirmationRecipientData {
  // Recipient details
  recipientFirstName: string;
  recipientEmail: string;

  // Purchaser details
  purchaserFirstName: string;
  purchaserLastName: string;

  // Booking details
  bookingReference: string;
  packageName: string;
  declineReason?: string;
}

export function generateGiftDeclineConfirmationRecipientEmail(data: GiftDeclineConfirmationRecipientData): {
  html: string;
  text: string;
  subject: string;
} {
  const declineReasonHtml = data.declineReason
    ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #9ca3af;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Your message:</p>
      <p style="margin: 0; color: #4b5563; font-size: 14px; font-style: italic;">"${data.declineReason}"</p>
    </div>
    `
    : '';

  const content = `
    <div style="text-align: center; margin: 0 0 32px 0;">
      <div style="font-size: 64px; margin: 0 0 16px 0;">&#9993;</div>
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Gift Declined</h1>
    </div>

    <p style="font-size: 18px; text-align: center; color: #4b5563; margin: 0 0 32px 0;">
      Hi ${data.recipientFirstName},
    </p>

    <p style="font-size: 16px; color: #4b5563; line-height: 1.7; text-align: center; margin: 0 0 24px 0;">
      We've received your request to decline the gift from <strong>${data.purchaserFirstName} ${data.purchaserLastName}</strong>.
    </p>

    <div style="margin: 24px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #6b7280;">
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.7;">
        The purchaser has been notified and a full refund will be processed to their original payment method.
      </p>
    </div>

    ${declineReasonHtml}

    <div style="margin: 32px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.packageName}</td>
        </tr>
      </table>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
      If you have any questions, please contact our support team at
      <a href="mailto:support@thepickleballpassport.org" style="color: #2563eb;">support@thepickleballpassport.org</a>.
    </p>

    <p style="color: #111827; font-weight: 600; margin: 24px 0 0 0;">
      The Pickleball Passport Team
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Gift Declined - Confirmation',
    content,
    preheader: 'Your gift decline has been processed.',
    footerText: 'You received this email because you declined a gift booking with The Pickleball Passport.',
  });

  const text = generatePlainText(html);

  const subject = 'Gift Declined - Confirmation';

  return { html, text, subject };
}
