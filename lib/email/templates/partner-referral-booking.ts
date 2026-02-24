/**
 * Partner Referral Booking Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent when a partner's referral completes a booking
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerReferralBookingData {
  // Partner details
  partnerName: string;
  partnerEmail: string;

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

  // Partner earnings
  pointsEarned: number;
  newPointsBalance: number;
  currentTier: string; // e.g., "Bronze", "Silver", "Gold", "Platinum"
  bookingsUntilNextTier?: number; // Optional - if they haven't reached Platinum
  nextTier?: string; // Optional - e.g., "Gold"

  // Links
  dashboardUrl?: string;
}

/**
 * Format currency in USD
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

export function generatePartnerReferralBookingEmail(data: PartnerReferralBookingData): {
  html: string;
  text: string;
  subject: string;
} {
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org'}/partners/dashboard`;

  const displayName = data.guestName || data.guestInitials || 'Your referral';
  const tripStart = formatDate(data.tripDates.start);
  const tripEnd = formatDate(data.tripDates.end);
  const totalValue = formatCurrency(data.totalValue);
  const pointsEarned = formatPoints(data.pointsEarned);
  const newBalance = formatPoints(data.newPointsBalance);

  // Tier progress message
  let tierProgressHtml = '';
  if (data.bookingsUntilNextTier && data.nextTier) {
    tierProgressHtml = `
      <div style="background-color: #f0f8ff; border-left: 4px solid #003D5C; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #003D5C; font-weight: 600;">
          🎯 You're ${data.bookingsUntilNextTier} booking${data.bookingsUntilNextTier === 1 ? '' : 's'} away from ${data.nextTier} tier!
        </p>
      </div>
    `;
  } else if (data.currentTier === 'PLATINUM') {
    tierProgressHtml = `
      <div style="background-color: #f0f8ff; border-left: 4px solid #D4AF37; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #003D5C; font-weight: 600;">
          👑 You've reached the highest tier - Platinum! Keep up the amazing work!
        </p>
      </div>
    `;
  }

  const subject = `🎉 ${displayName} Just Booked! You Earned ${pointsEarned} Points`;

  const html = baseEmailTemplate({
    preheader: `Congratulations! Your referral booked ${data.packageName}`,
    title: '🎉 Your Referral Just Booked!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Great news! <strong>${displayName}</strong> just completed their booking for The Pickleball Passport experience. Thank you for making this connection!
      </p>

      <!-- Booking Details Card -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #003D5C; font-size: 18px;">Booking Details</h3>

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
            <td style="padding: 8px 0; border-top: 2px solid #ddd; color: #003D5C; font-size: 18px; font-weight: 700; text-align: right; padding-top: 16px;">${totalValue}</td>
          </tr>
        </table>
      </div>

      <!-- Points Earned Card -->
      <div style="background-color: #D4AF37; background: linear-gradient(135deg, #D4AF37 0%, #F4E5AC 100%); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #003D5C; font-size: 20px; margin-bottom: 12px;">Points Earned</h3>
        <p style="font-size: 36px; font-weight: 700; color: #003D5C; margin: 8px 0;">+${pointsEarned}</p>
        <p style="font-size: 14px; color: #003D5C; margin: 8px 0;">Passport Points</p>
        <p style="font-size: 16px; color: #003D5C; margin-top: 16px;">
          New Balance: <strong>${newBalance} points</strong>
        </p>
      </div>

      ${tierProgressHtml}

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        Keep up the great work! Every referral brings you closer to exclusive rewards and benefits.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Your Dashboard
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px;">
        Questions about your partner program? Reply to this email and we'll be happy to help!
      </p>
    `,
    footerText: 'You\'re receiving this email because you\'re a valued The Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    🎉 YOUR REFERRAL JUST BOOKED!

    Hi ${data.partnerName},

    Great news! ${displayName} just completed their booking for The Pickleball Passport experience. Thank you for making this connection!

    BOOKING DETAILS
    ----------------
    Guest: ${displayName}
    Booking Reference: ${data.bookingReference}
    Package: ${data.packageName}
    Trip Dates: ${tripStart} - ${tripEnd}
    Booking Value: ${totalValue}

    POINTS EARNED
    -------------
    Points Earned: +${pointsEarned} Passport Points
    New Balance: ${newBalance} points

    ${data.bookingsUntilNextTier && data.nextTier
      ? `🎯 You're ${data.bookingsUntilNextTier} booking${data.bookingsUntilNextTier === 1 ? '' : 's'} away from ${data.nextTier} tier!`
      : ''}

    Keep up the great work! Every referral brings you closer to exclusive rewards and benefits.

    View Your Dashboard: ${dashboardUrl}

    Questions about your partner program? Reply to this email and we'll be happy to help!

    --
    The Pickleball Passport
    You're receiving this email because you're a valued The Pickleball Passport partner.
  `);

  return {
    html,
    text,
    subject
  };
}
