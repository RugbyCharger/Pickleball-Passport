/**
 * Guest Referral Booking Notification Email Template
 * Epic 10 - US-003: Referral Attribution at Booking
 *
 * Sent when a guest's referral completes a booking
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GuestReferralBookingData {
  // Referrer details
  referrerName: string;
  referrerEmail: string;

  // Guest details
  guestName: string;
  guestInitials?: string; // Optional fallback if name not available

  // Booking details
  bookingReference: string;
  packageName: string;
  tripDates: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  totalValue: number; // In cents

  // Referrer earnings
  pointsEarned: number;
  newPointsBalance: number;

  // Links
  dashboardUrl?: string;
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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

export function generateGuestReferralBookingEmail(data: GuestReferralBookingData): {
  html: string;
  text: string;
  subject: string;
} {
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/referrals`;

  const displayName = data.guestName || data.guestInitials || 'Your referral';
  const tripStart = formatDate(data.tripDates.start);
  const tripEnd = formatDate(data.tripDates.end);
  const totalValue = formatCurrency(data.totalValue);
  const pointsEarned = formatPoints(data.pointsEarned);
  const newBalance = formatPoints(data.newPointsBalance);

  const subject = `Your Referral Just Booked! You Earned ${pointsEarned} Points`;

  const html = baseEmailTemplate({
    preheader: `Congratulations! Your referral booked ${data.packageName}`,
    title: 'Your Referral Just Booked!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.referrerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Great news! <strong>${displayName}</strong> just completed their booking for a Pickleball Passport experience using your referral code. Thank you for spreading the word!
      </p>

      <!-- Booking Details Card -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #059669; font-size: 18px;">Booking Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Guest:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${displayName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Booking Reference:</td>
            <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${data.bookingReference}</td>
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
            <td style="padding: 8px 0; border-top: 2px solid #ddd; color: #666; font-size: 14px; padding-top: 16px;">Booking Value:</td>
            <td style="padding: 8px 0; border-top: 2px solid #ddd; color: #059669; font-size: 18px; font-weight: 700; text-align: right; padding-top: 16px;">${totalValue}</td>
          </tr>
        </table>
      </div>

      <!-- Points Earned Card -->
      <div style="background-color: #059669; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 20px; margin-bottom: 12px;">Points Earned</h3>
        <p style="font-size: 36px; font-weight: 700; color: #ffffff; margin: 8px 0;">+${pointsEarned}</p>
        <p style="font-size: 14px; color: #ffffff; margin: 8px 0;">Referral Points</p>
        <p style="font-size: 16px; color: #ffffff; margin-top: 16px;">
          New Balance: <strong>${newBalance} points</strong>
        </p>
      </div>

      <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #166534; font-weight: 600;">
          Keep sharing your referral link to earn more points and rewards!
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        Your referrals help grow our pickleball community, and we appreciate you being an ambassador for Pickleball Passport!
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
    footerText: 'You\'re receiving this email because you\'re a Pickleball Passport alumni with an active referral code.'
  });

  const text = generatePlainText(`
    YOUR REFERRAL JUST BOOKED!

    Hi ${data.referrerName},

    Great news! ${displayName} just completed their booking for a Pickleball Passport experience using your referral code. Thank you for spreading the word!

    BOOKING DETAILS
    ----------------
    Guest: ${displayName}
    Booking Reference: ${data.bookingReference}
    Package: ${data.packageName}
    Trip Dates: ${tripStart} - ${tripEnd}
    Booking Value: ${totalValue}

    POINTS EARNED
    -------------
    Points Earned: +${pointsEarned} Referral Points
    New Balance: ${newBalance} points

    Keep sharing your referral link to earn more points and rewards!

    Your referrals help grow our pickleball community, and we appreciate you being an ambassador for Pickleball Passport!

    View Your Referral Dashboard: ${dashboardUrl}

    Questions about your referral rewards? Reply to this email and we'll be happy to help!

    --
    Pickleball Passport
    You're receiving this email because you're a Pickleball Passport alumni with an active referral code.
  `);

  return {
    html,
    text,
    subject
  };
}
