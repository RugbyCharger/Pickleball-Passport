/**
 * Push Notification Service
 *
 * Uses OneSignal API to send push notifications to mobile users.
 * Users are targeted by external ID (Clerk user ID).
 */

import * as OneSignal from '@onesignal/node-onesignal';

// OneSignal client configuration
const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY || '',
});

const client = new OneSignal.DefaultApi(configuration);
const appId = process.env.ONESIGNAL_APP_ID || '';

/**
 * Generic push notification options
 */
export interface PushNotificationOptions {
  /** Target user IDs (Clerk user IDs) */
  userIds: string[];
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** Optional additional data for deep linking */
  data?: Record<string, string | number | boolean>;
}

/**
 * Send a push notification to one or more users
 *
 * @param options - Push notification configuration
 * @returns OneSignal notification response or null if failed/not configured
 */
export async function sendPushNotification(
  options: PushNotificationOptions
): Promise<OneSignal.CreateNotificationSuccessResponse | null> {
  const { userIds, title, message, data } = options;

  // Skip if OneSignal not configured
  if (!appId || !process.env.ONESIGNAL_REST_API_KEY) {
    console.warn('[Push] OneSignal not configured, skipping notification');
    return null;
  }

  // Skip if no target users
  if (!userIds.length) {
    console.warn('[Push] No target users, skipping notification');
    return null;
  }

  try {
    const notification = new OneSignal.Notification();
    notification.app_id = appId;
    notification.include_aliases = {
      external_id: userIds,
    };
    notification.target_channel = 'push';
    notification.headings = { en: title };
    notification.contents = { en: message };

    // Add deep link data if provided
    if (data) {
      notification.data = data;
    }

    const response = await client.createNotification(notification);
    console.log('[Push] Notification sent:', response.id);
    return response;
  } catch (error) {
    console.error('[Push] Failed to send notification:', error);
    return null;
  }
}

/**
 * Send a trip countdown reminder notification
 *
 * @param userId - Target user's Clerk ID
 * @param tripId - Trip ID for deep linking
 * @param tripName - Trip name for display
 * @param daysUntil - Days until trip starts
 */
export async function sendTripCountdownReminder(
  userId: string,
  tripId: string,
  tripName: string,
  daysUntil: number
): Promise<OneSignal.CreateNotificationSuccessResponse | null> {
  const title = daysUntil === 1 ? 'Trip Tomorrow!' : `${daysUntil} Days Until Your Trip`;
  const message =
    daysUntil === 1
      ? `${tripName} starts tomorrow! Make sure you're packed and ready.`
      : `${tripName} is coming up in ${daysUntil} days. Time to get excited!`;

  return sendPushNotification({
    userIds: [userId],
    title,
    message,
    data: {
      tripId,
      screen: 'trip-overview',
      deepLink: `/trip/${tripId}`,
    },
  });
}

/**
 * Send an activity reminder notification
 *
 * @param userId - Target user's Clerk ID
 * @param tripId - Trip ID for deep linking
 * @param activityName - Activity name for display
 * @param startsIn - Human-readable time until activity (e.g., "30 minutes")
 */
export async function sendActivityReminder(
  userId: string,
  tripId: string,
  activityName: string,
  startsIn: string
): Promise<OneSignal.CreateNotificationSuccessResponse | null> {
  return sendPushNotification({
    userIds: [userId],
    title: 'Activity Reminder',
    message: `${activityName} starts in ${startsIn}. Don't miss it!`,
    data: {
      tripId,
      screen: 'itinerary',
      deepLink: `/trip/${tripId}/itinerary`,
    },
  });
}

/**
 * Send an SOS alert confirmation notification
 *
 * @param userId - Target user's Clerk ID
 * @param tripId - Trip ID for deep linking
 */
export async function sendSOSConfirmation(
  userId: string,
  tripId: string
): Promise<OneSignal.CreateNotificationSuccessResponse | null> {
  return sendPushNotification({
    userIds: [userId],
    title: 'SOS Alert Received',
    message: 'Help is on the way. Stay calm and stay where you are.',
    data: {
      tripId,
      screen: 'sos',
      deepLink: `/trip/${tripId}/sos`,
    },
  });
}

/**
 * Send a message notification
 *
 * @param userId - Target user's Clerk ID
 * @param tripId - Trip ID for deep linking
 * @param senderName - Name of message sender
 */
export async function sendMessageNotification(
  userId: string,
  tripId: string,
  senderName: string
): Promise<OneSignal.CreateNotificationSuccessResponse | null> {
  return sendPushNotification({
    userIds: [userId],
    title: 'New Message',
    message: `${senderName} sent you a message`,
    data: {
      tripId,
      screen: 'chat',
      deepLink: `/trip/${tripId}/chat`,
    },
  });
}
