/**
 * Partner Commission Available Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent when partner reaches redemption threshold
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerCommissionAvailableData {
  partnerName: string;
  partnerEmail: string;
  availableBalance: number; // Points available to redeem
  cashValue?: number; // Optional cash value in cents ($0.80/point)
  redemptionOptions: string[]; // List of what they can redeem
  rewardsUrl?: string;
  expirationDate?: string; // Optional ISO date string if points expire
}

function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generatePartnerCommissionAvailableEmail(data: PartnerCommissionAvailableData): {
  html: string;
  text: string;
  subject: string;
} {
  const rewardsUrl = data.rewardsUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/rewards`;
  const balance = formatPoints(data.availableBalance);
  const cashValue = data.cashValue ? formatCurrency(data.cashValue) : null;

  const subject = `💰 You Can Now Redeem Your ${balance} Points!`;

  const optionsHtml = data.redemptionOptions
    .map(option => `<li style="padding: 6px 0; color: #333; font-size: 14px;">✓ ${option}</li>`)
    .join('');

  const html = baseEmailTemplate({
    preheader: `Your points are ready to redeem!`,
    heading: '💰 Your Rewards Are Ready!',
    content: `
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        Congratulations! You've reached the minimum balance to redeem your Passport Points for rewards.
      </p>

      <div style="background-color: #003D5C; border-radius: 8px; padding: 32px; margin: 24px 0; text-align: center; color: white;">
        <p style="font-size: 16px; margin: 0 0 12px 0; opacity: 0.9;">Available Balance</p>
        <p style="font-size: 42px; font-weight: 700; margin: 8px 0; color: white;">${balance}</p>
        <p style="font-size: 16px; margin: 0; opacity: 0.9;">Passport Points</p>
        ${cashValue ? `<p style="font-size: 18px; margin: 16px 0 0 0; color: #D4AF37;">≈ ${cashValue} cash value</p>` : ''}
      </div>

      <h3 style="color: #003D5C; font-size: 18px; margin: 24px 0 16px 0;">Redemption Options</h3>
      <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
        ${optionsHtml}
      </ul>

      ${data.expirationDate ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            ⚠️ <strong>Note:</strong> Points expire on ${new Date(data.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Redeem before this date to avoid losing your rewards!
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${rewardsUrl}" style="display: inline-block; background-color: #D4AF37; color: #003D5C; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
          Redeem Now
        </a>
      </div>
    `,
    footerText: 'You\'re receiving this email because you\'re a valued Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    💰 YOUR REWARDS ARE READY!

    Hi ${data.partnerName},

    Congratulations! You've reached the minimum balance to redeem your Passport Points for rewards.

    AVAILABLE BALANCE: ${balance} Passport Points
    ${cashValue ? `CASH VALUE: ${cashValue}` : ''}

    REDEMPTION OPTIONS:
    ${data.redemptionOptions.map(opt => `✓ ${opt}`).join('\n')}

    ${data.expirationDate ? `⚠️ Points expire on ${new Date(data.expirationDate).toLocaleDateString('en-US')}` : ''}

    Redeem Now: ${rewardsUrl}

    --
    Pickleball Passport
  `);

  return { html, text, subject };
}
