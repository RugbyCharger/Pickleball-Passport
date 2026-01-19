/**
 * Partner Notification Helpers
 * E11-S9: Partner Notification System
 *
 * Creates email and in-app notifications for partner events:
 * - Referral clicks
 * - Referral applications
 * - Referral bookings
 * - Points earned
 * - Tier changes
 * - Commission available
 */

import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';
import { sendEmail } from '@/lib/email/sendgrid';
import { emailLogger, logError } from '@/lib/logger';

// Import partner email templates
import { generatePartnerReferralClickEmail, type PartnerReferralClickData } from '@/lib/email/templates/partner-referral-click';
import { generatePartnerReferralApplicationEmail, type PartnerReferralApplicationData } from '@/lib/email/templates/partner-referral-application';
import { generatePartnerReferralBookingEmail, type PartnerReferralBookingData } from '@/lib/email/templates/partner-referral-booking';
import { generatePartnerPointsEarnedEmail, type PartnerPointsEarnedData } from '@/lib/email/templates/partner-points-earned';
import { generatePartnerTierChangeEmail, type PartnerTierChangeData } from '@/lib/email/templates/partner-tier-change';
import { generatePartnerCommissionAvailableEmail, type PartnerCommissionAvailableData } from '@/lib/email/templates/partner-commission-available';

/**
 * Default partner notification preferences
 */
const DEFAULT_NOTIFICATION_PREFERENCES = {
  // Email notifications
  emailReferralClicks: true,
  emailApplications: true,
  emailBookings: true,
  emailPointsEarned: true,
  emailTierChanges: true,
  emailCommissionAvailable: true,
  emailMonthlySummary: true,

  // In-app notifications
  inAppApplications: true,
  inAppBookings: true,
  inAppPointsEarned: true,
  inAppTierChanges: true,
  inAppCommissionAvailable: true,

  // Frequency
  referralClickFrequency: 'daily', // instant, daily, weekly
};

/**
 * Get partner notification preferences
 */
async function getPartnerNotificationPreferences(partnerId: string) {
  const partner = await prisma.partnerProfile.findUnique({
    where: { id: partnerId },
    select: { notificationPreferences: true },
  });

  if (!partner?.notificationPreferences) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  // Merge with defaults to handle new preferences
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(partner.notificationPreferences as Record<string, any>),
  };
}

/**
 * Create in-app notification for partner
 */
async function createPartnerNotification(
  userId: string,
  type: NotificationType,
  title: string,
  content: string,
  linkUrl?: string,
  linkText?: string
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        linkUrl,
        linkText,
      },
    });
  } catch (error) {
    logError(emailLogger, error, 'Failed to create partner in-app notification', {
      userId,
      type,
    });
    // Non-blocking - don't throw
  }
}

/**
 * Send email to partner (with preference checking)
 */
async function sendPartnerEmail(
  partnerId: string,
  partnerEmail: string,
  preferenceKey: string,
  generateEmail: () => { html: string; text: string; subject: string }
): Promise<void> {
  try {
    const preferences = await getPartnerNotificationPreferences(partnerId);

    if (!preferences[preferenceKey as keyof typeof preferences]) {
      emailLogger.info(
        { partnerId, preferenceKey },
        'Partner email notification skipped due to preferences'
      );
      return;
    }

    const { html, text, subject } = generateEmail();

    await sendEmail({
      to: partnerEmail,
      subject,
      html,
      text,
    });

    emailLogger.info({ partnerId, subject }, 'Partner notification email sent');
  } catch (error) {
    logError(emailLogger, error, 'Failed to send partner email notification', {
      partnerId,
      preferenceKey,
    });
    // Non-blocking - don't throw
  }
}

/**
 * Send notification when referral link is clicked
 * Note: This should be batched and sent as daily digest to avoid spam
 */
export async function sendPartnerReferralClickNotification(
  data: PartnerReferralClickData
): Promise<void> {
  // Note: In production, batch these and send as daily digest
  // For now, send instant email if enabled
  await sendPartnerEmail(
    '', // partnerId would be needed
    data.partnerEmail,
    'emailReferralClicks',
    () => generatePartnerReferralClickEmail(data)
  );
}

/**
 * Send notification when referred guest submits application
 */
export async function sendPartnerApplicationNotification(
  partnerId: string,
  userId: string,
  data: PartnerReferralApplicationData
): Promise<void> {
  const preferences = await getPartnerNotificationPreferences(partnerId);

  // Send email if enabled
  if (preferences.emailApplications) {
    await sendPartnerEmail(
      partnerId,
      data.partnerEmail,
      'emailApplications',
      () => generatePartnerReferralApplicationEmail(data)
    );
  }

  // Create in-app notification if enabled
  if (preferences.inAppApplications) {
    await createPartnerNotification(
      userId,
      NotificationType.REFERRAL_APPLICATION,
      `New Application from Your Referral!`,
      `${data.guestInitials} just submitted their application. You could earn ~${data.potentialPoints.toLocaleString()} points if they book!`,
      '/partners/referrals',
      'View Referrals'
    );
  }
}

/**
 * Send notification when referred guest completes booking
 */
export async function sendPartnerBookingNotification(
  partnerId: string,
  userId: string,
  data: PartnerReferralBookingData
): Promise<void> {
  const preferences = await getPartnerNotificationPreferences(partnerId);

  // Send email if enabled
  if (preferences.emailBookings) {
    await sendPartnerEmail(
      partnerId,
      data.partnerEmail,
      'emailBookings',
      () => generatePartnerReferralBookingEmail(data)
    );
  }

  // Create in-app notification if enabled
  if (preferences.inAppBookings) {
    const guestDisplay = data.guestName || data.guestInitials || 'Your referral';
    await createPartnerNotification(
      userId,
      NotificationType.REFERRAL_BOOKING,
      `Referral Booked! You Earned ${data.pointsEarned.toLocaleString()} Points`,
      `${guestDisplay} just booked ${data.packageName}. You've earned ${data.pointsEarned.toLocaleString()} Passport Points!`,
      '/partners/dashboard',
      'View Dashboard'
    );
  }
}

/**
 * Send notification when partner earns points
 */
export async function sendPartnerPointsEarnedNotification(
  partnerId: string,
  userId: string,
  data: PartnerPointsEarnedData
): Promise<void> {
  const preferences = await getPartnerNotificationPreferences(partnerId);

  // Send email if enabled
  if (preferences.emailPointsEarned) {
    await sendPartnerEmail(
      partnerId,
      data.partnerEmail,
      'emailPointsEarned',
      () => generatePartnerPointsEarnedEmail(data)
    );
  }

  // Create in-app notification if enabled
  if (preferences.inAppPointsEarned) {
    await createPartnerNotification(
      userId,
      NotificationType.POINTS_EARNED,
      `You Earned ${data.pointsEarned.toLocaleString()} Points!`,
      `${data.reason}. New balance: ${data.newBalance.toLocaleString()} points.`,
      '/partners/rewards',
      'Redeem Points'
    );
  }
}

/**
 * Send notification when partner reaches new tier
 */
export async function sendPartnerTierChangeNotification(
  partnerId: string,
  userId: string,
  data: PartnerTierChangeData
): Promise<void> {
  const preferences = await getPartnerNotificationPreferences(partnerId);

  // Send email if enabled
  if (preferences.emailTierChanges) {
    await sendPartnerEmail(
      partnerId,
      data.partnerEmail,
      'emailTierChanges',
      () => generatePartnerTierChangeEmail(data)
    );
  }

  // Create in-app notification if enabled
  if (preferences.inAppTierChanges) {
    const tierEmojis: Record<string, string> = {
      BRONZE: '🥉',
      SILVER: '🥈',
      GOLD: '🥇',
      PLATINUM: '👑',
    };
    const emoji = tierEmojis[data.newTier] || '⭐';

    await createPartnerNotification(
      userId,
      NotificationType.TIER_CHANGE,
      `${emoji} Congratulations! You've Reached ${data.newTier.charAt(0) + data.newTier.slice(1).toLowerCase()} Tier`,
      `You've been promoted! New commission rate: ${data.newCommissionRate}`,
      '/partners/tiers',
      'Explore Benefits'
    );
  }
}

/**
 * Send notification when partner can redeem commission/rewards
 */
export async function sendPartnerCommissionNotification(
  partnerId: string,
  userId: string,
  data: PartnerCommissionAvailableData
): Promise<void> {
  const preferences = await getPartnerNotificationPreferences(partnerId);

  // Send email if enabled
  if (preferences.emailCommissionAvailable) {
    await sendPartnerEmail(
      partnerId,
      data.partnerEmail,
      'emailCommissionAvailable',
      () => generatePartnerCommissionAvailableEmail(data)
    );
  }

  // Create in-app notification if enabled
  if (preferences.inAppCommissionAvailable) {
    await createPartnerNotification(
      userId,
      NotificationType.COMMISSION_AVAILABLE,
      `Your Rewards Are Ready to Redeem!`,
      `You have ${data.availableBalance.toLocaleString()} points available. Redeem for rewards now!`,
      '/partners/rewards',
      'Redeem Now'
    );
  }
}

/**
 * Helper: Get partner tier display name
 */
export function getTierDisplayName(tier: string): string {
  const tierMap: Record<string, string> = {
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
    PLATINUM: 'Platinum',
  };
  return tierMap[tier] || tier;
}

/**
 * Helper: Get tier commission rate
 */
export function getTierCommissionRate(tier: string): string {
  const rateMap: Record<string, string> = {
    BRONZE: '$500/player',
    SILVER: '$750/player',
    GOLD: '$1,000/player',
    PLATINUM: '$1,500/player',
  };
  return rateMap[tier] || '$500/player';
}

/**
 * Helper: Get tier benefits
 */
export function getTierBenefits(tier: string): string[] {
  const benefitsMap: Record<string, string[]> = {
    BRONZE: [
      '$500 per booked player',
      '50% off your own trip',
      'Access to marketing materials',
      'Partner dashboard and analytics',
    ],
    SILVER: [
      '$750 per booked player',
      'FREE solo trip (after 5 bookings)',
      'Priority partner support',
      'Co-branded landing page',
      'Quarterly partner calls',
    ],
    GOLD: [
      '$1,000 per booked player',
      'FREE trip + spouse (after 10 bookings)',
      'Dedicated success manager',
      'VIP partner events',
      'Early access to new packages',
      'Custom marketing materials',
    ],
    PLATINUM: [
      '$1,500 per booked player',
      'FREE trip + spouse + equity opportunity',
      'Executive partner status',
      'Annual strategy session',
      'Speaking opportunities',
      'Revenue share potential',
    ],
  };
  return benefitsMap[tier] || benefitsMap.BRONZE;
}

/**
 * Helper: Calculate bookings until next tier
 */
export function calculateBookingsUntilNextTier(currentBookings: number, currentTier: string): {
  bookingsNeeded: number;
  nextTier: string;
} | null {
  const tiers = [
    { name: 'BRONZE', min: 0, max: 4 },
    { name: 'SILVER', min: 5, max: 9 },
    { name: 'GOLD', min: 10, max: 19 },
    { name: 'PLATINUM', min: 20, max: Infinity },
  ];

  const currentTierIndex = tiers.findIndex(t => t.name === currentTier);
  if (currentTierIndex === -1 || currentTierIndex === tiers.length - 1) {
    return null; // Invalid tier or already at Platinum
  }

  const nextTier = tiers[currentTierIndex + 1];
  return {
    bookingsNeeded: nextTier.min - currentBookings,
    nextTier: getTierDisplayName(nextTier.name),
  };
}
