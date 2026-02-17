/**
 * Guest Referral Code Email Template
 * Epic 10 - US-004: Guest Referral Code Generation
 *
 * Sent when a guest receives their referral code after completing their first trip
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface GuestReferralCodeData {
  // Guest details
  guestName: string;

  // Referral code details
  referralCode: string;
  shareableLink: string;

  // Links
  dashboardUrl?: string;
}

export function generateGuestReferralCodeEmail(data: GuestReferralCodeData): {
  html: string;
  text: string;
  subject: string;
} {
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/dashboard/referrals`;

  const subject = `Your Referral Code is Ready - Start Earning Rewards!`;

  const html = baseEmailTemplate({
    preheader: `Your unique referral code ${data.referralCode} is ready to share`,
    title: 'Welcome to the Alumni Program!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.guestName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Congratulations on completing your Pickleball Passport experience! We hope you had an amazing time.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        As a valued alumni, you now have access to our referral program. Share your unique code with friends and earn rewards when they book their own adventure!
      </p>

      <!-- Referral Code Card -->
      <div style="background-color: #059669; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your Referral Code</h3>
        <p style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 8px 0; letter-spacing: 2px;">${data.referralCode}</p>
      </div>

      <!-- Shareable Link -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #333; font-size: 16px; margin-bottom: 12px;">Your Shareable Link</h3>
        <p style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 14px; color: #059669; margin: 0; word-break: break-all;">
          ${data.shareableLink}
        </p>
      </div>

      <!-- How It Works -->
      <div style="margin: 32px 0;">
        <h3 style="color: #333; font-size: 18px; margin-bottom: 16px;">How It Works</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; vertical-align: top;">
              <div style="display: inline-block; width: 32px; height: 32px; background-color: #059669; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 12px;">1</div>
            </td>
            <td style="padding: 12px 0; vertical-align: top;">
              <strong style="color: #333;">Share Your Link</strong>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Send your referral link to friends who love pickleball</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; vertical-align: top;">
              <div style="display: inline-block; width: 32px; height: 32px; background-color: #059669; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 12px;">2</div>
            </td>
            <td style="padding: 12px 0; vertical-align: top;">
              <strong style="color: #333;">They Book a Trip</strong>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">When they book using your link, you'll be automatically credited</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; vertical-align: top;">
              <div style="display: inline-block; width: 32px; height: 32px; background-color: #059669; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold; margin-right: 12px;">3</div>
            </td>
            <td style="padding: 12px 0; vertical-align: top;">
              <strong style="color: #333;">Earn Rewards</strong>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">Earn points for applications, bookings, and completed trips</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Rewards Table -->
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #166534; font-size: 16px; margin-bottom: 12px;">Rewards You Can Earn</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #166534; font-size: 14px;">Application Submitted</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">+100 points</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534; font-size: 14px;">Booking Completed (under $15K)</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">+1,000 points</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534; font-size: 14px;">Booking Completed ($15K+)</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">+1,500 points</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534; font-size: 14px;">Trip Completed</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">+500 points</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Your Referral Dashboard
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px;">
        Questions about the referral program? Reply to this email and we'll be happy to help!
      </p>
    `,
    footerText: 'You\'re receiving this email because you completed The Pickleball Passport experience.'
  });

  const text = generatePlainText(`
    WELCOME TO THE ALUMNI PROGRAM!

    Hi ${data.guestName},

    Congratulations on completing your Pickleball Passport experience! We hope you had an amazing time.

    As a valued alumni, you now have access to our referral program. Share your unique code with friends and earn rewards when they book their own adventure!

    YOUR REFERRAL CODE
    ------------------
    ${data.referralCode}

    YOUR SHAREABLE LINK
    -------------------
    ${data.shareableLink}

    HOW IT WORKS
    ------------
    1. Share Your Link - Send your referral link to friends who love pickleball
    2. They Book a Trip - When they book using your link, you'll be automatically credited
    3. Earn Rewards - Earn points for applications, bookings, and completed trips

    REWARDS YOU CAN EARN
    --------------------
    - Application Submitted: +100 points
    - Booking Completed (under $15K): +1,000 points
    - Booking Completed ($15K+): +1,500 points
    - Trip Completed: +500 points

    View Your Referral Dashboard: ${dashboardUrl}

    Questions about the referral program? Reply to this email and we'll be happy to help!

    --
    The Pickleball Passport
    You're receiving this email because you completed The Pickleball Passport experience.
  `);

  return {
    html,
    text,
    subject
  };
}
