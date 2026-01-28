# Phase 14: Production Polish - Research

**Researched:** 2026-01-28
**Domain:** Mobile app production deployment (Push notifications, Deep linking, App Store submission, Offline mode)
**Confidence:** MEDIUM-HIGH

## Summary

This phase focuses on production-readiness for the Pickleball Passport mobile app: integrating OneSignal for push notifications, configuring deep linking (iOS Universal Links + Android App Links), setting up EAS Build/Submit for app store deployment, and polishing offline mode behavior.

The mobile app already has solid foundations: Expo 54 with expo-router, MMKV-backed query persistence, NetInfo-based offline detection, and the `pickleballpassport` custom URL scheme configured. The remaining work is layering OneSignal push notifications (with deep link handlers), configuring verified deep links for HTTPS URLs, creating EAS build profiles, and enhancing offline mutation handling.

**Primary recommendation:** Use OneSignal Expo plugin as the FIRST plugin in app.json, initialize in root layout, and use additionalData (not Launch URL) for reliable deep link handling from push notifications.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| onesignal-expo-plugin | latest | Expo config plugin for push | Official plugin, handles NSE setup |
| react-native-onesignal | ^5.x | OneSignal SDK for RN | Official SDK with notification listeners |
| @onesignal/node-onesignal | latest | Backend push API | Official Node.js client for server-side sending |
| eas-cli | latest | Build and submit to stores | Expo's official deployment tool |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-linking | 8.0.11 | URL handling | Already installed, use for deep link parsing |
| @react-native-community/netinfo | 11.4.1 | Network detection | Already installed, offline status |
| react-native-mmkv | 3.1.0 | Persistent storage | Already installed, query cache persistence |

### Already Installed (Leverage Existing)
- expo-router 6.0.22 - Automatic deep link routing
- expo-linking 8.0.11 - URL handling (used in rebook screen)
- @tanstack/react-query 5.90.20 - Query persistence and offline mode
- @tanstack/query-async-storage-persister 5.66.0 - MMKV-backed persistence

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OneSignal | Expo Notifications | Expo Push is simpler but lacks rich segmentation, analytics |
| OneSignal | Firebase FCM direct | More control but requires manual APNs cert handling |
| EAS Submit | Fastlane | Fastlane requires manual credential management |

**Installation:**
```bash
# In mobile directory
npx expo install onesignal-expo-plugin
npm install react-native-onesignal @onesignal/node-onesignal
```

## Architecture Patterns

### OneSignal Plugin Position (CRITICAL)

```json
// app.json - OneSignal MUST be FIRST plugin
{
  "expo": {
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "mode": "production"
        }
      ],
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

**Why first:** The OneSignal plugin modifies iOS build configuration for push capability. If placed after other plugins, it can cause header file errors and iOS build failures.

### Deep Link URL Mapping

```
App Routes → Deep Link URLs
─────────────────────────────────────────────────
/(app)/(tabs)               → pickleballpassport://home
/(app)/trip/[tripId]        → pickleballpassport://trip/{tripId}
/(app)/trip/[tripId]/chat   → pickleballpassport://trip/{tripId}/chat
/(app)/alumni               → pickleballpassport://alumni
/(app)/alumni/stamps        → pickleballpassport://alumni/stamps

Universal Links (for web domain):
https://pickleballpassport.com/app/trip/{tripId} → /(app)/trip/[tripId]
```

### OneSignal Initialization Pattern

```typescript
// mobile/lib/onesignal.ts
import { OneSignal, LogLevel } from 'react-native-onesignal';
import Constants from 'expo-constants';
import { router } from 'expo-router';

export function initializeOneSignal() {
  // Debug logging (disable in production)
  if (__DEV__) {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  }

  // Initialize with App ID from expo config
  const appId = Constants.expoConfig?.extra?.oneSignalAppId;
  if (!appId) {
    console.warn('OneSignal App ID not configured');
    return;
  }

  OneSignal.initialize(appId);

  // Handle notification clicks with additionalData (not Launch URL)
  OneSignal.Notifications.addEventListener('click', (event) => {
    const data = event.notification.additionalData as {
      deepLink?: string;
      tripId?: string;
      screen?: string;
    } | undefined;

    if (data?.deepLink) {
      // Navigate using expo-router
      router.push(data.deepLink as any);
    } else if (data?.tripId && data?.screen) {
      router.push(`/trip/${data.tripId}/${data.screen}` as any);
    } else if (data?.tripId) {
      router.push(`/trip/${data.tripId}` as any);
    }
  });
}

// Associate user with OneSignal after login
export function setOneSignalExternalId(userId: string) {
  OneSignal.login(userId);
}

// Clear on logout
export function clearOneSignalUser() {
  OneSignal.logout();
}
```

### Backend Push Notification Service

```typescript
// server/lib/push.ts
import * as OneSignal from '@onesignal/node-onesignal';

const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY!,
});

const client = new OneSignal.DefaultApi(configuration);

export async function sendPushNotification({
  userIds,
  title,
  message,
  data,
}: {
  userIds: string[];
  title: string;
  message: string;
  data?: Record<string, string>;
}) {
  const notification = new OneSignal.Notification();
  notification.app_id = process.env.ONESIGNAL_APP_ID!;
  notification.include_external_user_ids = userIds;
  notification.contents = { en: message };
  notification.headings = { en: title };
  notification.data = data; // additionalData for deep linking

  await client.createNotification(notification);
}

// Example: Trip countdown reminder
export async function sendTripCountdownReminder(
  userId: string,
  tripId: string,
  tripName: string,
  daysUntil: number
) {
  await sendPushNotification({
    userIds: [userId],
    title: `${daysUntil} days until ${tripName}!`,
    message: 'Tap to view your trip details and packing list.',
    data: {
      tripId,
      screen: 'index',
      deepLink: `/trip/${tripId}`,
    },
  });
}
```

### Offline Mutation Queue Pattern

```typescript
// For mutations that need offline support
// Extend existing useOfflineItinerary pattern

export function useOfflineMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  return useMutation({
    mutationFn,
    networkMode: 'offlineFirst', // Queue mutations when offline
    retry: 3,
    ...options,
  });
}

// Show offline indicator for pending mutations
export function useHasPendingMutations() {
  const queryClient = useQueryClient();
  const mutationCache = queryClient.getMutationCache();

  return mutationCache.getAll().some(
    (mutation) => mutation.state.isPaused
  );
}
```

### EAS Build Profile Structure

```json
// eas.json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "medium"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      },
      "android": {
        "track": "internal",
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### Anti-Patterns to Avoid

- **Using Launch URL for deep links:** iOS has known issues where `Linking.getInitialURL()` returns null when app is cold-started from push notification with Launch URL. Use `additionalData` instead.
- **Requesting notification permission on app launch:** Users decline without context. Show in-app explanation first.
- **Including https:// in associatedDomains:** Use `applinks:domain.com` not `applinks:https://domain.com`.
- **Testing deep links in Safari address bar:** iOS Universal Links don't work from Safari - test from Mail, Messages, or other apps.
- **Forgetting development SHA256 fingerprint:** Android App Links fail in development if only production fingerprint is in assetlinks.json.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Push notification delivery | Custom FCM/APNs implementation | OneSignal SDK | Certificate management, delivery tracking, segmentation |
| Offline query persistence | Custom storage adapter | TanStack Query + MMKV (already set up) | Battle-tested, handles edge cases |
| App store submission | Manual Xcode/Gradle uploads | EAS Submit | Credential management, automation |
| Universal link verification | Manual AASA hosting | Vercel/Next.js /.well-known routing | Content-type headers, HTTPS |
| Network status detection | Custom polling | NetInfo (already set up) | Platform-specific optimizations |

**Key insight:** The mobile ecosystem has complex platform-specific requirements (APNs certificates, Android signing keys, AASA validation). OneSignal and EAS abstract these away with managed services.

## Common Pitfalls

### Pitfall 1: OneSignal Plugin Order
**What goes wrong:** iOS build fails with header file errors or push notifications don't work.
**Why it happens:** OneSignal plugin must modify native configuration before other plugins.
**How to avoid:** Always place `onesignal-expo-plugin` as the FIRST entry in plugins array.
**Warning signs:** Build errors mentioning "OneSignalNotificationServiceExtension" or missing capabilities.

### Pitfall 2: iOS Universal Links Cache
**What goes wrong:** Universal links don't open app after configuration changes.
**Why it happens:** iOS caches AASA file aggressively (up to 24 hours on first fetch, weekly updates).
**How to avoid:** Delete and reinstall app after AASA changes. Test from non-Safari apps.
**Warning signs:** Links work on new devices but not on test devices.

### Pitfall 3: Deep Link Routing When App Closed (iOS)
**What goes wrong:** Notification tap opens app but doesn't navigate to intended screen.
**Why it happens:** `Linking.getInitialURL()` returns null for push notifications with Launch URL.
**How to avoid:** Use OneSignal's `additionalData` field and handle in notification click listener.
**Warning signs:** Deep links work when app is backgrounded but not when fully closed.

### Pitfall 4: Android App Links Verification Timing
**What goes wrong:** App Links work inconsistently or not at all.
**Why it happens:** Android verification can take 20+ seconds and requires exact SHA256 match.
**How to avoid:** Include both production AND development fingerprints in assetlinks.json. Rebuild after web file changes.
**Warning signs:** Links open in browser instead of app, works on some devices but not others.

### Pitfall 5: Missing EAS Build Credentials
**What goes wrong:** Production builds fail or can't be submitted.
**Why it happens:** iOS requires App Store Connect API key, Android requires Google Service Account.
**How to avoid:** Run `eas credentials` to verify before first production build.
**Warning signs:** Build succeeds but submit fails with auth errors.

### Pitfall 6: Offline Mutations Lost on App Restart
**What goes wrong:** Queued mutations disappear when user restarts app.
**Why it happens:** TanStack Query mutation cache is separate from query cache persistence.
**How to avoid:** For critical actions, store pending mutations in MMKV separately and resume on app start.
**Warning signs:** Users report lost changes made while offline.

## Code Examples

### AASA File (iOS Universal Links)

```json
// public/.well-known/apple-app-site-association
// Host at: https://pickleballpassport.com/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAM_ID.com.pickleballpassport.app"],
        "components": [
          { "/": "/app/*", "comment": "All app routes" },
          { "/": "/trip/*", "comment": "Trip deep links" }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAM_ID.com.pickleballpassport.app"]
  }
}
```

### assetlinks.json (Android App Links)

```json
// public/.well-known/assetlinks.json
// Host at: https://pickleballpassport.com/.well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.pickleballpassport.app",
      "sha256_cert_fingerprints": [
        "PRODUCTION_SHA256_FINGERPRINT",
        "DEVELOPMENT_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

### app.json Deep Link Configuration

```json
{
  "expo": {
    "scheme": "pickleballpassport",
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "mode": "production",
          "devTeam": "APPLE_TEAM_ID"
        }
      ],
      "expo-router",
      "expo-secure-store"
    ],
    "ios": {
      "bundleIdentifier": "com.pickleballpassport.app",
      "associatedDomains": [
        "applinks:pickleballpassport.com",
        "webcredentials:pickleballpassport.com"
      ],
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "package": "com.pickleballpassport.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "pickleballpassport.com",
              "pathPrefix": "/app"
            },
            {
              "scheme": "https",
              "host": "pickleballpassport.com",
              "pathPrefix": "/trip"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "extra": {
      "oneSignalAppId": "YOUR_ONESIGNAL_APP_ID"
    }
  }
}
```

### Offline Banner Component

```typescript
// mobile/components/OfflineBanner.tsx
import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/lib/offline';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-yellow-500 px-4 py-2">
      <Text className="text-yellow-900 text-center text-sm font-medium">
        You're offline. Some features may be limited.
      </Text>
    </View>
  );
}
```

### Permission Request with Context

```typescript
// mobile/components/NotificationPrompt.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function NotificationPrompt() {
  const [dismissed, setDismissed] = useState(false);

  const handleEnable = async () => {
    await OneSignal.Notifications.requestPermission(true);
    await AsyncStorage.setItem('notification_prompt_shown', 'true');
    setDismissed(true);
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem('notification_prompt_shown', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <View className="bg-blue-50 m-4 p-4 rounded-xl">
      <Text className="font-bold text-gray-900 mb-2">
        Stay Updated on Your Trip
      </Text>
      <Text className="text-gray-600 mb-4">
        Get countdown reminders, activity updates, and important trip info.
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleEnable}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Enable</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDismiss}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <Text className="text-gray-700 font-medium">Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo Push Token | OneSignal with external IDs | 2024 | Better segmentation, multi-channel support |
| Manual Fastlane | EAS Build/Submit | 2022 | Managed credentials, cloud builds |
| Launch URL for deep links | additionalData + click listener | 2023 | Reliable cold-start deep linking |
| Deep links details format | AASA components format | iOS 13 (2019) | Better path matching, comments |
| Single assetlinks fingerprint | Multiple fingerprints array | Android 12 | Development + production signing |

**Deprecated/outdated:**
- ExpoKit: Deprecated, use EAS Build instead
- expo push:android:upload: Use EAS credentials instead
- Manual APNs certificate upload: Use App Store Connect API key with EAS

## Open Questions

1. **Production domain for AASA/assetlinks**
   - What we know: Need HTTPS domain to host verification files
   - What's unclear: Is pickleballpassport.com the production domain? Need to verify Vercel hosting setup.
   - Recommendation: Confirm domain and add .well-known files to web app public directory

2. **Apple Team ID and App Store Connect App ID**
   - What we know: Required for iOS builds and submission
   - What's unclear: User needs to provide these from Apple Developer account
   - Recommendation: Document setup steps, require user input before iOS build

3. **Google Service Account for Play Store**
   - What we know: Required for automated submission to Google Play
   - What's unclear: User needs to create service account in Google Cloud Console
   - Recommendation: Include setup guide, manual first upload required

4. **Notification content and triggers**
   - What we know: Trip countdown, activity reminders, important updates mentioned in requirements
   - What's unclear: Exact trigger conditions and message templates
   - Recommendation: Define in plan, implement backend cron/scheduled jobs

## Sources

### Primary (HIGH confidence)
- [OneSignal Expo SDK Setup](https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup) - Installation, plugin config, initialization
- [Expo Deep Linking Overview](https://docs.expo.dev/linking/overview/) - Linking strategies comparison
- [Expo iOS Universal Links](https://docs.expo.dev/linking/ios-universal-links/) - AASA format, associatedDomains
- [Expo Android App Links](https://docs.expo.dev/linking/android-app-links/) - assetlinks.json, intentFilters
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/) - Build profiles, eas.json structure
- [EAS Submit](https://docs.expo.dev/submit/introduction/) - App store submission workflow

### Secondary (MEDIUM confidence)
- [OneSignal Deep Linking](https://documentation.onesignal.com/docs/en/links) - Launch URL vs additionalData
- [TanStack Query Network Mode](https://tanstack.com/query/v4/docs/framework/react/guides/network-mode) - Offline-first patterns
- [Expo App Store Best Practices](https://docs.expo.dev/distribution/app-stores/) - Privacy, screenshots

### Tertiary (LOW confidence - verify before use)
- GitHub issues on react-native-onesignal cold-start deep link issues (anecdotal but consistent)
- Community blog posts on AASA caching behavior

## Metadata

**Confidence breakdown:**
- OneSignal integration: HIGH - Official docs comprehensive, clear patterns
- Deep linking setup: HIGH - Expo docs detailed, verified with multiple sources
- EAS Build/Submit: HIGH - Official Expo tooling, well-documented
- Offline mode: MEDIUM - TanStack patterns understood, mutation persistence needs validation
- App store requirements: MEDIUM - Requirements change frequently, verify latest

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable tooling, but app store requirements can change)
