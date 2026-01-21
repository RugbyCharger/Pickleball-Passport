import { db } from '@/lib/db';

export interface NotificationPreferences {
  // Email categories
  emailPreTripSequence: boolean;
  emailPostTripFollowUp: boolean;
  emailAlumniEvents: boolean;
  emailMarketing: boolean;
  emailNewsletter: boolean;

  // Channel toggles
  smsEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailPreTripSequence: true,
  emailPostTripFollowUp: true,
  emailAlumniEvents: true,
  emailMarketing: false,
  emailNewsletter: false,
  smsEnabled: true,
  inAppEnabled: true,
  whatsappEnabled: true,
};

/**
 * Get user notification preferences with defaults
 */
export async function getUserPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Merge stored preferences with defaults
  const storedPrefs = user.notificationPreferences as Partial<NotificationPreferences> | null;
  return { ...DEFAULT_PREFERENCES, ...storedPrefs };
}

/**
 * Check if a specific notification can be sent to user
 */
export async function canSendNotification(
  userId: string,
  type: keyof NotificationPreferences
): Promise<boolean> {
  const preferences = await getUserPreferences(userId);
  return preferences[type];
}

/**
 * Update user notification preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const currentPreferences = await getUserPreferences(userId);
  const updatedPreferences = { ...currentPreferences, ...updates };

  await db.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: updatedPreferences,
      preferenceUpdatedAt: new Date(),
    },
  });
}

/**
 * Unsubscribe user from all optional notifications
 */
export async function unsubscribeFromAll(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: {
        emailPreTripSequence: false,
        emailPostTripFollowUp: false,
        emailAlumniEvents: false,
        emailMarketing: false,
        emailNewsletter: false,
        smsEnabled: false,
        inAppEnabled: false,
        whatsappEnabled: false,
      },
      preferenceUpdatedAt: new Date(),
    },
  });
}
