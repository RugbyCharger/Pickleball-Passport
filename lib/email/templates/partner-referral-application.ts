/**
 * Partner Referral Application Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent when a partner's referral submits an application
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerReferralApplicationData {
  // Partner details
  partnerName: string;
  partnerEmail: string;

  // Guest details (anonymized)
  guestInitials: string; // e.g., "J.S."

  // Application details
  applicationDate: string; // ISO date string
  potentialPoints: number; // Estimated points if they book (tier-based)
  currentTier: string;

  // Links
  referralsUrl?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format points with commas
 */
function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

export function generatePartnerReferralApplicationEmail(data: PartnerReferralApplicationData): {
  html: string;
  text: string;
  subject: string;
} {
  const referralsUrl = data.referralsUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/referrals`;

  const applicationDate = formatDate(data.applicationDate);
  const potentialPoints = formatPoints(data.potentialPoints);

  const subject = `📋 New Application from Your Referral (${data.guestInitials})`;

  const html = baseEmailTemplate({
    preheader: `${data.guestInitials} just submitted their application!`,
    title: '📋 New Application from Your Referral!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Exciting news! Someone you referred (<strong>${data.guestInitials}</strong>) just submitted their application to join a Pickleball Passport experience.
      </p>

      <!-- Application Details Card -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #003D5C; font-size: 18px;">Application Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Applicant:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${data.guestInitials}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Application Date:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${applicationDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td>
            <td style="padding: 8px 0; color: #F59E0B; font-size: 14px; font-weight: 600; text-align: right;">Under Review</td>
          </tr>
        </table>
      </div>

      <!-- Potential Points Card -->
      <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="font-size: 14px; color: #92400E; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Potential Earnings
        </p>
        <p style="font-size: 32px; font-weight: 700; color: #003D5C; margin: 8px 0;">
          ~${potentialPoints} points
        </p>
        <p style="font-size: 14px; color: #92400E; margin: 8px 0;">
          if they complete their booking
        </p>
      </div>

      <!-- Conversion Tip -->
      <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #003D5C; font-weight: 600; font-size: 16px;">
          💡 Conversion Tip
        </p>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
          Applications are being reviewed. This is a great time to follow up with them to answer any questions about the experience and help them feel confident about booking!
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        We'll notify you again when they complete their booking.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${referralsUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Referral Details
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px;">
        Keep sharing your referral link to continue growing your points balance!
      </p>
    `,
    footerText: 'You\'re receiving this email because you\'re a valued Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    📋 NEW APPLICATION FROM YOUR REFERRAL!

    Hi ${data.partnerName},

    Exciting news! Someone you referred (${data.guestInitials}) just submitted their application to join a Pickleball Passport experience.

    APPLICATION DETAILS
    -------------------
    Applicant: ${data.guestInitials}
    Application Date: ${applicationDate}
    Status: Under Review

    POTENTIAL EARNINGS
    ------------------
    ~${potentialPoints} points if they complete their booking

    💡 CONVERSION TIP
    Applications are being reviewed. This is a great time to follow up with them to answer any questions about the experience and help them feel confident about booking!

    We'll notify you again when they complete their booking.

    View Referral Details: ${referralsUrl}

    Keep sharing your referral link to continue growing your points balance!

    --
    Pickleball Passport
    You're receiving this email because you're a valued Pickleball Passport partner.
  `);

  return {
    html,
    text,
    subject
  };
}
