/**
 * Document Approval Email Template
 *
 * Sent to guests when their document is approved by admin
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface DocumentApprovalData {
  // Guest details
  firstName: string;
  email: string;

  // Document details
  documentType: string; // e.g., "PASSPORT", "MEDICAL_FORM"
  documentTypeFriendly: string; // e.g., "Passport Copy"
  uploadedDate: string; // ISO date string
  reviewedDate: string; // ISO date string

  // Booking reference
  bookingReference?: string;

  // Admin notes (optional)
  notes?: string;

  // Portal link
  portalUrl?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateDocumentApprovalEmail(data: DocumentApprovalData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/documents`;

  const content = `
    <h1>Document Approved! ✅</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Great news! We've reviewed and approved your <strong>${data.documentTypeFriendly}</strong>.
      You're one step closer to your transformation journey with Pickleball Passport!
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #f0fdf4; border-radius: 12px; border-left: 4px solid #059669; text-align: center;">
      <p style="color: #059669; font-size: 48px; margin: 0 0 16px 0;">
        ✓
      </p>
      <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
        ${data.documentTypeFriendly} Approved
      </p>
      <p style="color: #166534; font-size: 14px; margin: 0;">
        Reviewed on ${formatDate(data.reviewedDate)}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Document Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Document Type:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.documentTypeFriendly}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Uploaded:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.uploadedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 600; text-align: right;">✓ Approved</td>
        </tr>
        ${data.bookingReference ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${data.notes ? `
    <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        📝 Note from Our Team
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
        ${data.notes}
      </p>
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ What's Next?</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Check Your Checklist</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Review your member portal to see if there are any other documents or tasks that need your attention.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Review Your Itinerary</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Familiarize yourself with your trip schedule, medical appointments, and activities.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Prepare for Your Journey</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Start thinking about flights, packing, and getting excited for your transformation experience!
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}" class="button">
        View All Documents
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #059669;">
      <p style="margin: 0; color: #166534; font-size: 14px;">
        💡 <strong>Quick Tip:</strong> Keep digital and physical copies of all approved documents for your trip.
        You can download them anytime from your member portal.
      </p>
    </div>

    <p>
      If you have any questions or need assistance, our team is here to help! Simply reply to this email
      or reach out through your member portal.
    </p>

    <p>
      We're excited to be part of your journey!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Document Approved - Pickleball Passport',
    content,
    preheader: `Your ${data.documentTypeFriendly} has been approved!`,
    footerText: `You received this email regarding your Pickleball Passport documentation.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `✅ ${data.documentTypeFriendly} Approved - Pickleball Passport`,
  };
}
