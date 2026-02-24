/**
 * Guest Referral Completion Bonus Notification Email Template
 * Epic 10 - US-005: Post-Trip Completion Bonus
 *
 * Sent when a referred guest completes their trip
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GuestReferralCompletionData {
  // Referrer details
  referrerName: string;
  referrerEmail: string;

  // Guest details
  guestName: string;
  guestInitials?: string; // Optional fallback if name not available

  // Trip details
  packageName: string;
  tripDates: {
    start: string; // ISO date string
    end: string; // ISO date string
  };

  // Bonus earnings
  bonusPointsEarned: number;
  newPointsBalance: number;

  // Links
  dashboardUrl?: string;
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

export function generateGuestReferralCompletionEmail(data: GuestReferralCompletionData): {
  html: string;
  text: string;
  subject: string;
} {
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/dashboard/referrals`;

  const displayName = data.guestName || data.guestInitials || 'Your referral';
  const tripStart = formatDate(data.tripDates.start);
  const tripEnd = formatDate(data.tripDates.end);
  const bonusPoints = formatPoints(data.bonusPointsEarned);
  const newBalance = formatPoints(data.newPointsBalance);

  const subject = `Trip Complete! You Earned ${bonusPoints} Bonus Points`;

  const html = baseEmailTemplate({
    preheader: `Congratulations! Your referral completed their ${data.packageName} trip`,
    title: 'Trip Complete - Bonus Points Earned!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.referrerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Great news! <strong>${displayName}</strong> has just completed their The Pickleball Passport trip. As a thank you for your referral, you've earned a completion bonus!
      </p>

      <!-- Trip Details Card -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #059669; font-size: 18px;">Trip Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Guest:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${displayName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Package:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${data.packageName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Trip Dates:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${tripStart} - ${tripEnd}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">✓ Completed</td>
          </tr>
        </table>
      </div>

      <!-- Bonus Points Card -->
      <div style="background-color: #d4af37; background: linear-gradient(135deg, #d4af37 0%, #f5d675 100%); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #1a1a1a; font-size: 20px; margin-bottom: 12px;">Completion Bonus</h3>
        <p style="font-size: 36px; font-weight: 700; color: #1a1a1a; margin: 8px 0;">+${bonusPoints}</p>
        <p style="font-size: 14px; color: #1a1a1a; margin: 8px 0;">Bonus Points</p>
        <p style="font-size: 16px; color: #1a1a1a; margin-top: 16px;">
          New Balance: <strong>${newBalance} points</strong>
        </p>
      </div>

      <div style="background-color: #fef3c7; border-left: 4px solid #d4af37; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">
          You now have ${newBalance} referral points. Keep sharing your referral link to earn even more!
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        Thank you for being an amazing ambassador for The Pickleball Passport! Your referrals help bring more pickleball enthusiasts to experience transformative trips.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Your Referral Dashboard
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px;">
        Questions about your referral rewards? Reply to this email and we'll be happy to help!
      </p>
    `,
    footerText: 'You\'re receiving this email because you\'re The Pickleball Passport alumni with an active referral code.'
  });

  const text = generatePlainText(`
    TRIP COMPLETE - BONUS POINTS EARNED!

    Hi ${data.referrerName},

    Great news! ${displayName} has just completed their The Pickleball Passport trip. As a thank you for your referral, you've earned a completion bonus!

    TRIP DETAILS
    ------------
    Guest: ${displayName}
    Package: ${data.packageName}
    Trip Dates: ${tripStart} - ${tripEnd}
    Status: Completed

    COMPLETION BONUS
    ----------------
    Bonus Points Earned: +${bonusPoints}
    New Balance: ${newBalance} points

    You now have ${newBalance} referral points. Keep sharing your referral link to earn even more!

    Thank you for being an amazing ambassador for The Pickleball Passport! Your referrals help bring more pickleball enthusiasts to experience transformative trips.

    View Your Referral Dashboard: ${dashboardUrl}

    Questions about your referral rewards? Reply to this email and we'll be happy to help!

    --
    The Pickleball Passport
    You're receiving this email because you're The Pickleball Passport alumni with an active referral code.
  `);

  return {
    html,
    text,
    subject
  };
}
