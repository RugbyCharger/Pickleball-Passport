/**
 * Partner Monthly Summary Email Template
 * E11-S9: Partner Notification System
 *
 * Sent monthly with performance summary
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerMonthlySummaryData {
  partnerName: string;
  partnerEmail: string;
  month: string; // e.g., "January 2025"

  // Previous month stats
  stats: {
    totalClicks: number;
    applications: number;
    bookings: number;
    pointsEarned: number;
  };

  // Year-to-date stats
  ytdStats: {
    totalBookings: number;
    totalPoints: number;
  };

  // Current status
  currentTier: string;
  currentBalance: number;
  leaderboardPosition?: number; // Optional - if they opted in

  // Marketing tip
  marketingTip?: string;

  dashboardUrl?: string;
}

function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

export function generatePartnerMonthlySummaryEmail(data: PartnerMonthlySummaryData): {
  html: string;
  text: string;
  subject: string;
} {
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/dashboard`;

  const subject = `📊 Your ${data.month} Partner Performance Summary`;

  const html = baseEmailTemplate({
    preheader: `Your ${data.month} performance summary is ready`,
    title: `📊 ${data.month} Performance Summary`,
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Here's a summary of your partner performance for ${data.month}.
      </p>

      <!-- Previous Month Stats -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #003D5C; font-size: 18px; margin-bottom: 20px;">${data.month} Highlights</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px 0; color: #666; font-size: 14px;">Referral Link Clicks</td>
            <td style="padding: 12px 0; color: #003D5C; font-size: 20px; font-weight: 700; text-align: right;">${data.stats.totalClicks}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px 0; color: #666; font-size: 14px;">Applications Submitted</td>
            <td style="padding: 12px 0; color: #003D5C; font-size: 20px; font-weight: 700; text-align: right;">${data.stats.applications}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px 0; color: #666; font-size: 14px;">Bookings Confirmed</td>
            <td style="padding: 12px 0; color: #003D5C; font-size: 20px; font-weight: 700; text-align: right;">${data.stats.bookings}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666; font-size: 14px;">Points Earned</td>
            <td style="padding: 12px 0; color: #D4AF37; font-size: 20px; font-weight: 700; text-align: right;">+${formatPoints(data.stats.pointsEarned)}</td>
          </tr>
        </table>
      </div>

      <!-- YTD Stats -->
      <div style="background-color: #003D5C; color: white; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: white; font-size: 18px; margin-bottom: 20px;">Year-to-Date</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: rgba(255,255,255,0.8); font-size: 14px;">Total Bookings</td>
            <td style="padding: 12px 0; color: white; font-size: 20px; font-weight: 700; text-align: right;">${data.ytdStats.totalBookings}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: rgba(255,255,255,0.8); font-size: 14px;">Total Points Earned</td>
            <td style="padding: 12px 0; color: #D4AF37; font-size: 20px; font-weight: 700; text-align: right;">${formatPoints(data.ytdStats.totalPoints)}</td>
          </tr>
        </table>
      </div>

      <!-- Current Status -->
      <div style="display: flex; gap: 16px; margin: 24px 0;">
        <div style="flex: 1; background-color: #f0f8ff; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase;">Current Tier</p>
          <p style="margin: 0; color: #003D5C; font-size: 24px; font-weight: 700;">${data.currentTier}</p>
        </div>
        <div style="flex: 1; background-color: #f0f8ff; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase;">Points Balance</p>
          <p style="margin: 0; color: #D4AF37; font-size: 24px; font-weight: 700;">${formatPoints(data.currentBalance)}</p>
        </div>
      </div>

      ${data.leaderboardPosition ? `
        <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0; color: #856404; font-size: 16px;">
            🏆 You're ranked <strong>#${data.leaderboardPosition}</strong> on the leaderboard this month!
          </p>
        </div>
      ` : ''}

      ${data.marketingTip ? `
        <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; color: #003D5C; font-weight: 600;">💡 Marketing Tip for Next Month</p>
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
            ${data.marketingTip}
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          View Full Dashboard
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px; text-align: center;">
        Thank you for being an amazing partner! 🙌
      </p>
    `,
    footerText: 'You\'re receiving this monthly summary because you\'re a valued Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    📊 YOUR ${data.month.toUpperCase()} PERFORMANCE SUMMARY

    Hi ${data.partnerName},

    Here's a summary of your partner performance for ${data.month}.

    ${data.month.toUpperCase()} HIGHLIGHTS
    ${'-'.repeat(data.month.length + 11)}
    Referral Link Clicks: ${data.stats.totalClicks}
    Applications Submitted: ${data.stats.applications}
    Bookings Confirmed: ${data.stats.bookings}
    Points Earned: +${formatPoints(data.stats.pointsEarned)}

    YEAR-TO-DATE
    ------------
    Total Bookings: ${data.ytdStats.totalBookings}
    Total Points Earned: ${formatPoints(data.ytdStats.totalPoints)}

    CURRENT STATUS
    --------------
    Current Tier: ${data.currentTier}
    Points Balance: ${formatPoints(data.currentBalance)}

    ${data.leaderboardPosition ? `🏆 You're ranked #${data.leaderboardPosition} on the leaderboard this month!` : ''}

    ${data.marketingTip ? `💡 MARKETING TIP FOR NEXT MONTH\n${data.marketingTip}` : ''}

    View Full Dashboard: ${dashboardUrl}

    Thank you for being an amazing partner! 🙌

    --
    Pickleball Passport
    You're receiving this monthly summary because you're a valued partner.
  `);

  return { html, text, subject };
}
