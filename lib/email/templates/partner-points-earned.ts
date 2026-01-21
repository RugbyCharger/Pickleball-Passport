/**
 * Partner Points Earned Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent when partner earns points (bonus, milestone, etc.)
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerPointsEarnedData {
  partnerName: string;
  partnerEmail: string;
  pointsEarned: number;
  reason: string; // e.g., "Bonus points awarded by admin", "Tier milestone bonus"
  newBalance: number;
  redemptionSuggestion?: string; // Optional redemption suggestion
  rewardsUrl?: string;
}

function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

export function generatePartnerPointsEarnedEmail(data: PartnerPointsEarnedData): {
  html: string;
  text: string;
  subject: string;
} {
  const rewardsUrl = data.rewardsUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/rewards`;
  const pointsEarned = formatPoints(data.pointsEarned);
  const newBalance = formatPoints(data.newBalance);

  const subject = `🎁 You Earned ${pointsEarned} Passport Points!`;

  const html = baseEmailTemplate({
    preheader: `${data.reason}`,
    title: '🎁 Points Added to Your Account!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Great news! You've earned <strong>${pointsEarned} Passport Points</strong>.
      </p>

      <div style="background-color: #D4AF37; background: linear-gradient(135deg, #D4AF37 0%, #F4E5AC 100%); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #003D5C; margin: 8px 0;">+${pointsEarned}</p>
        <p style="font-size: 14px; color: #003D5C; margin: 8px 0; font-weight: 600;">${data.reason}</p>
        <p style="font-size: 16px; color: #003D5C; margin-top: 16px;">
          New Balance: <strong>${newBalance} points</strong>
        </p>
      </div>

      ${data.redemptionSuggestion ? `
        <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #003D5C; font-size: 14px; line-height: 1.6;">
            💡 ${data.redemptionSuggestion}
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${rewardsUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          Redeem Your Points
        </a>
      </div>
    `,
    footerText: 'You\'re receiving this email because you\'re a valued Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    🎁 POINTS ADDED TO YOUR ACCOUNT!

    Hi ${data.partnerName},

    Great news! You've earned ${pointsEarned} Passport Points.

    POINTS EARNED: +${pointsEarned}
    REASON: ${data.reason}
    NEW BALANCE: ${newBalance} points

    ${data.redemptionSuggestion ? `💡 ${data.redemptionSuggestion}` : ''}

    Redeem Your Points: ${rewardsUrl}

    --
    Pickleball Passport
  `);

  return { html, text, subject };
}
