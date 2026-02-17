/**
 * Partner Tier Change Notification Email Template
 * E11-S9: Partner Notification System
 *
 * Sent when a partner reaches a new tier
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface PartnerTierChangeData {
  // Partner details
  partnerName: string;
  partnerEmail: string;

  // Tier details
  newTier: string; // e.g., "SILVER", "GOLD", "PLATINUM"
  previousTier: string;

  // Tier benefits
  newCommissionRate: string; // e.g., "$750/player"
  tierBenefits: string[]; // List of benefits
  nextTierGoal?: string; // Optional - if not at Platinum

  // Links
  tiersUrl?: string;
  dashboardUrl?: string;
}

/**
 * Get tier display name
 */
function getTierDisplayName(tier: string): string {
  const tierMap: Record<string, string> = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    PLATINUM: 'Platinum'
  };
  return tierMap[tier] || tier;
}

/**
 * Get tier color
 */
function getTierColor(tier: string): string {
  const colorMap: Record<string, string> = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#D4AF37',
    PLATINUM: '#E5E4E2'
  };
  return colorMap[tier] || '#003D5C';
}

/**
 * Get tier emoji
 */
function getTierEmoji(tier: string): string {
  const emojiMap: Record<string, string> = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
    PLATINUM: '👑'
  };
  return emojiMap[tier] || '⭐';
}

export function generatePartnerTierChangeEmail(data: PartnerTierChangeData): {
  html: string;
  text: string;
  subject: string;
} {
  const tiersUrl = data.tiersUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/tiers`;
  const dashboardUrl = data.dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pickleballpassport.com'}/partners/dashboard`;

  const newTierDisplay = getTierDisplayName(data.newTier);
  const tierColor = getTierColor(data.newTier);
  const tierEmoji = getTierEmoji(data.newTier);

  const subject = `${tierEmoji} Congratulations! You've Reached ${newTierDisplay} Tier`;

  // Build benefits list HTML
  const benefitsHtml = data.tierBenefits
    .map(benefit => `
      <li style="padding: 8px 0; color: #333; font-size: 14px; line-height: 1.6;">
        ✓ ${benefit}
      </li>
    `)
    .join('');

  const html = baseEmailTemplate({
    preheader: `You've unlocked ${newTierDisplay} tier benefits!`,
    title: `${tierEmoji} Congratulations, ${data.partnerName}!`,
    content: `
      <!-- Hero Section -->
      <div style="background: linear-gradient(135deg, ${tierColor} 0%, #003D5C 100%); border-radius: 12px; padding: 40px 24px; margin: 24px 0; text-align: center; color: white;">
        <h2 style="font-size: 32px; margin: 0 0 16px 0; color: white;">
          You've Reached ${newTierDisplay} Tier!
        </h2>
        <p style="font-size: 48px; margin: 16px 0;">
          ${tierEmoji}
        </p>
        <p style="font-size: 18px; margin: 16px 0; opacity: 0.9;">
          Your hard work and dedication are paying off
        </p>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        Hi ${data.partnerName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 24px;">
        We're thrilled to inform you that you've been promoted from <strong>${getTierDisplayName(data.previousTier)}</strong> to <strong>${newTierDisplay}</strong> tier in The Pickleball Passport Partner Program!
      </p>

      <!-- New Commission Rate Card -->
      <div style="background-color: #f0f8ff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="font-size: 14px; color: #666; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
          Your New Commission Rate
        </p>
        <p style="font-size: 36px; font-weight: 700; color: #003D5C; margin: 8px 0;">
          ${data.newCommissionRate}
        </p>
        <p style="font-size: 14px; color: #666; margin: 8px 0;">
          per booked player
        </p>
      </div>

      <!-- Tier Benefits -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #003D5C; font-size: 18px; margin-bottom: 16px;">
          ${newTierDisplay} Tier Benefits
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${benefitsHtml}
        </ul>
      </div>

      ${data.nextTierGoal ? `
        <div style="background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #003D5C; font-size: 14px;">
            <strong>Next Goal:</strong> ${data.nextTierGoal}
          </p>
        </div>
      ` : ''}

      <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 24px 0;">
        Thank you for being such an important part of The Pickleball Passport community. Your passion for pickleball and commitment to sharing these life-changing experiences is making a real difference!
      </p>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${tiersUrl}" style="display: inline-block; background-color: #003D5C; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 8px;">
          Explore Your Benefits
        </a>
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #D4AF37; color: #003D5C; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 8px;">
          View Dashboard
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 32px; text-align: center;">
        Keep up the amazing work! 🎉
      </p>
    `,
    footerText: 'You\'re receiving this email because you\'re a valued The Pickleball Passport partner.'
  });

  const text = generatePlainText(`
    ${tierEmoji} CONGRATULATIONS! YOU'VE REACHED ${newTierDisplay.toUpperCase()} TIER!

    Hi ${data.partnerName},

    We're thrilled to inform you that you've been promoted from ${getTierDisplayName(data.previousTier)} to ${newTierDisplay} tier in The Pickleball Passport Partner Program!

    YOUR NEW COMMISSION RATE
    -------------------------
    ${data.newCommissionRate} per booked player

    ${newTierDisplay.toUpperCase()} TIER BENEFITS
    ${'-'.repeat(newTierDisplay.length + 13)}
    ${data.tierBenefits.map(benefit => `✓ ${benefit}`).join('\n')}

    ${data.nextTierGoal ? `NEXT GOAL: ${data.nextTierGoal}` : ''}

    Thank you for being such an important part of The Pickleball Passport community. Your passion for pickleball and commitment to sharing these life-changing experiences is making a real difference!

    Explore Your Benefits: ${tiersUrl}
    View Dashboard: ${dashboardUrl}

    Keep up the amazing work! 🎉

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
