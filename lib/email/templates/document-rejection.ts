/**
 * Document Rejection Email Template
 *
 * Sent to guests when their document is rejected by admin with clear action items
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface DocumentRejectionData {
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

  // Rejection reason (required)
  reason: string;

  // Common issues to help guide the user
  commonIssues?: string[];

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

export function generateDocumentRejectionEmail(data: DocumentRejectionData): {
  html: string;
  text: string;
  subject: string;
} {
  const portalUrl = data.portalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/documents`;

  const content = `
    <h1>Document Update Required 📄</h1>

    <p>
      Hi ${data.firstName},
    </p>

    <p>
      Thank you for uploading your <strong>${data.documentTypeFriendly}</strong>. After reviewing it,
      we need you to upload a new version to ensure we have the correct documentation for your trip.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b; text-align: center;">
      <p style="color: #f59e0b; font-size: 48px; margin: 0 0 16px 0;">
        ⚠️
      </p>
      <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
        Action Required
      </p>
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        Please upload a new ${data.documentTypeFriendly}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Why This Happened</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626;">
      <p style="margin: 0 0 8px 0; color: #991b1b; font-weight: 600;">
        Reason for Update Request:
      </p>
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        ${data.reason}
      </p>
    </div>

    ${data.commonIssues && data.commonIssues.length > 0 ? `
    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Common Requirements</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600;">
        Please make sure your document:
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
        ${data.commonIssues.map(issue => `
          <li style="margin: 8px 0;">${issue}</li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🔄 How to Upload a New Document</h2>

    <div style="margin: 16px 0;">
      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">1. Log into Your Member Portal</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Click the button below to access your dashboard.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">2. Go to Documents Section</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Navigate to the Documents tab where you'll see the status of all your uploads.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">3. Upload the Updated Document</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Click "Upload New Version" next to your ${data.documentTypeFriendly} and select the corrected file.
        </p>
      </div>

      <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #111827; font-weight: 600;">4. We'll Review It Quickly</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Our team typically reviews documents within 24 hours. You'll receive an email once approved.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}" class="button">
        Upload New Document
      </a>
    </p>

    <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600;">
        💡 Quick Tips for Document Uploads
      </p>
      <ul style="margin: 8px 0; padding-left: 20px; color: #78350f; font-size: 14px;">
        <li style="margin: 4px 0;">Take photos in good lighting to ensure text is readable</li>
        <li style="margin: 4px 0;">Make sure the entire document is visible in the frame</li>
        <li style="margin: 4px 0;">Avoid glare or shadows that obscure information</li>
        <li style="margin: 4px 0;">Upload in common formats: PDF, JPG, or PNG</li>
        <li style="margin: 4px 0;">File size should be under 10MB</li>
      </ul>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📋 Document Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Document Type:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.documentTypeFriendly}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Original Upload:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.uploadedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Reviewed:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${formatDate(data.reviewedDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status:</td>
          <td style="padding: 8px 0; color: #f59e0b; font-weight: 600; text-align: right;">⚠️ Update Required</td>
        </tr>
        ${data.bookingReference ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking Reference:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${data.bookingReference}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <p>
      <strong>Need help?</strong> If you have questions about this review or need clarification on what's required,
      please don't hesitate to reply to this email or contact us through your member portal. We're here to help!
    </p>

    <p>
      Thank you for your cooperation!<br>
      <strong>The Pickleball Passport Team</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Document Update Required - Pickleball Passport',
    content,
    preheader: `Action required: Please upload a new ${data.documentTypeFriendly}`,
    footerText: `You received this email regarding your Pickleball Passport documentation.`,
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `⚠️ Document Update Required - ${data.documentTypeFriendly}`,
  };
}
