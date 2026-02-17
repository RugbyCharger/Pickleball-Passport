/**
 * Partner Referral Click Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent as daily digest when referral links are clicked
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerReferralClickData {
  partnerName: string;
  partnerEmail: string;
  clickCount: number; // Number of clicks in the past 24 hours
  totalClicks?: number; // Total all-time clicks (optional)
  clickDetails?: Array<{
    timestamp: string; // ISO date string
    location?: string; // City/country if available
  }>;
  referralsUrl?: string;
}

export function generatePartnerReferralClickEmail(data: PartnerReferralClickData): {
  html: string;
  text: string;
  subject: string;
} {
  const referralsUrl = data.referralsUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/referrals`;

  const subject = data.clickCount === 1
    ? `🔗 Someone clicked your referral link!`
    : `🔗 ${data.clickCount} people clicked your referral link today!`;

  const clickDetailsHtml = data.clickDetails && data.clickDetails.length > 0
    ? data.clickDetails.slice(0, 5).map(click => {
        const time = new Date(click.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `
          <tr>
            <td style="padding: 8px 12px; color: #666; font-size: 13px; border-bottom: 1px solid #eee;">${time}</td>
            <td style="padding: 8px 12px; color: #333; font-size: 13px; border-bottom: 1px solid #eee;">${click.location || 'Unknown location'}</td>
          </tr>
        `;
      }).join('')
    : '';

  const html = baseEmailTemplate({
    preheader: `${data.clickCount} ${data.clickCount === 1 ? 'person' : 'people'} clicked your referral link`,
    title: '🔗 Your Referral Link is Working!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Great news! ${data.clickCount === 1 ? 'Someone' : `${data.clickCount} people`} used your referral link in the past 24 hours.
      </p>

      <div style="background-color: #f0f8ff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="font-size: 48px; font-weight: 700; color: #003D5C; margin: 8px 0;">${data.clickCount}</p>
        <p style="font-size: 16px; color: #666; margin: 8px 0;">Referral Link Click${data.clickCount === 1 ? '' : 's'} (24 hours)</p>
        ${data.totalClicks ? `<p style="font-size: 14px; color: #999; margin: 16px 0 0 0;">${data.totalClicks.toLocaleString()} total clicks all-time</p>` : ''}
      </div>

      ${clickDetailsHtml ? `
        <h3 style="color: #003D5C; font-size: 16px; margin: 24px 0 12px 0;">Recent Activity</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; color: #003D5C; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Time</th>
              <th style="padding: 12px; text-align: left; color: #003D5C; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Location</th>
            </tr>
          </thead>
          <tbody>
            ${clickDetailsHtml}
          </tbody>
        </table>
      ` : ''}

      <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #003D5C; font-size: 14px; line-height: 1.6;">
          💡 <strong>Tip:</strong> Keep momentum going! Share your link on social media, email your club members, or post it at your facility to get more people interested in The Pickleball Passport.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${referralsUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Referrals Dashboard
        </a>
      </div>
    `,
    footerText: 'You\'re receiving this daily digest because you\'re a valued The Pickleball Passport partner. Manage notification preferences in your partner portal.'
  });

  const text = generatePlainText(`
    🔗 YOUR REFERRAL LINK IS WORKING!

    Hi ${data.partnerName},

    Great news! ${data.clickCount === 1 ? 'Someone' : `${data.clickCount} people`} used your referral link in the past 24 hours.

    REFERRAL LINK CLICKS: ${data.clickCount} (24 hours)
    ${data.totalClicks ? `TOTAL ALL-TIME: ${data.totalClicks.toLocaleString()}` : ''}

    💡 TIP: Keep momentum going! Share your link on social media, email your club members, or post it at your facility to get more people interested in The Pickleball Passport.

    View Referrals Dashboard: ${referralsUrl}

    --
    The Pickleball Passport
    You're receiving this daily digest because you're a valued partner.
  `);

  return { html, text, subject };
}
