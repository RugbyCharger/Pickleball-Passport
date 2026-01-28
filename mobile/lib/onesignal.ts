/**
 * OneSignal Push Notification Client
 *
 * Handles OneSignal SDK initialization and user association.
 * External ID is set when user authenticates to enable targeted notifications.
 */

import { OneSignal, LogLevel, NotificationClickEvent } from 'react-native-onesignal';
import Constants from 'expo-constants';
import { router } from 'expo-router';

/**
 * Initialize OneSignal SDK
 *
 * Call this once on app launch, after fonts load but before splash hide.
 * Does NOT request notification permission - that's handled contextually.
 */
export function initializeOneSignal(): void {
  // Enable verbose logging in development only
  if (__DEV__) {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  }

  // Get app ID from Expo config
  const appId = Constants.expoConfig?.extra?.oneSignalAppId;

  if (!appId || appId === '${EXPO_PUBLIC_ONESIGNAL_APP_ID}') {
    if (__DEV__) {
      console.warn(
        '[OneSignal] App ID not configured. Set EXPO_PUBLIC_ONESIGNAL_APP_ID environment variable.'
      );
    }
    return;
  }

  // Initialize the SDK
  OneSignal.initialize(appId);

  // Set up notification click handler with deep link navigation
  OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
    if (__DEV__) {
      console.log('[OneSignal] Notification clicked:', event.notification);
    }

    // Extract deep link data from additionalData
    // Using additionalData instead of Launch URL because iOS has known issue
    // where Linking.getInitialURL() returns null for cold-start notifications
    const data = event.notification.additionalData as {
      tripId?: string;
      screen?: string;
      deepLink?: string;
    } | undefined;

    if (!data) {
      if (__DEV__) {
        console.log('[OneSignal] No additionalData in notification');
      }
      return;
    }

    // Navigate based on data payload
    if (data.deepLink) {
      // Full deep link path provided
      if (__DEV__) {
        console.log('[OneSignal] Navigating to deep link:', data.deepLink);
      }
      router.push(data.deepLink as any);
    } else if (data.tripId && data.screen) {
      // Trip + screen combination
      const path = `/trip/${data.tripId}/${data.screen}`;
      if (__DEV__) {
        console.log('[OneSignal] Navigating to trip screen:', path);
      }
      router.push(path as any);
    } else if (data.tripId) {
      // Trip overview only
      const path = `/trip/${data.tripId}`;
      if (__DEV__) {
        console.log('[OneSignal] Navigating to trip:', path);
      }
      router.push(path as any);
    }
  });

  if (__DEV__) {
    console.log('[OneSignal] Initialized with app ID:', appId);
  }
}

/**
 * Associate the current device with a user
 *
 * Call this when user successfully authenticates.
 * Uses Clerk user ID as the external ID for targeting.
 *
 * @param userId - The Clerk user ID
 */
export function setOneSignalExternalId(userId: string): void {
  if (!userId) {
    if (__DEV__) {
      console.warn('[OneSignal] Cannot set external ID: userId is empty');
    }
    return;
  }

  OneSignal.login(userId);

  if (__DEV__) {
    console.log('[OneSignal] External ID set:', userId);
  }
}

/**
 * Clear user association on logout
 *
 * Call this when user signs out to stop receiving targeted notifications.
 */
export function clearOneSignalUser(): void {
  OneSignal.logout();

  if (__DEV__) {
    console.log('[OneSignal] User logged out');
  }
}
