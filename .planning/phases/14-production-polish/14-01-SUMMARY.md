---
phase: 14
plan: 01
subsystem: mobile-push
tags: [onesignal, push-notifications, mobile, trpc]
dependency-graph:
  requires: [10-02, 11-01]
  provides: [push-notification-infrastructure]
  affects: [14-02, scheduled-jobs]
tech-stack:
  added: [react-native-onesignal, onesignal-expo-plugin, "@onesignal/node-onesignal"]
  patterns: [external-id-targeting, notification-click-handling]
key-files:
  created:
    - mobile/lib/onesignal.ts
    - lib/push/index.ts
    - lib/trpc/server/routers/push.ts
  modified:
    - mobile/package.json
    - mobile/app.json
    - mobile/lib/auth.tsx
    - mobile/app/_layout.tsx
    - lib/trpc/server/root.ts
    - package.json
decisions:
  - id: onesignal-first-plugin
    choice: "OneSignal plugin must be FIRST in app.json plugins array"
    reason: "Required for iOS push capability - modifies build configuration"
  - id: external-id-targeting
    choice: "Use Clerk user ID as OneSignal external_id"
    reason: "Enables server to send targeted push to specific users"
  - id: no-permission-prompt
    choice: "Do not request notification permission in onesignal.ts"
    reason: "Permission should be requested contextually in app flow (Plan 14-02)"
metrics:
  duration: "6 min"
  completed: "2026-01-28"
---

# Phase 14 Plan 01: OneSignal Push Notifications Summary

OneSignal SDK initialized on app launch with user targeting via Clerk ID for backend push delivery.

## What Was Built

### Mobile Client (mobile/lib/onesignal.ts)
- `initializeOneSignal()` - SDK initialization on app launch
- `setOneSignalExternalId(userId)` - Associate device with user on auth
- `clearOneSignalUser()` - Clear association on logout
- Notification click handler ready for deep link implementation (Plan 14-02)

### Auth Integration (mobile/lib/auth.tsx)
- `OneSignalUserSync` component inside ClerkLoaded
- Automatically syncs user ID to OneSignal on sign in
- Clears OneSignal user on sign out

### Root Layout Integration (mobile/app/_layout.tsx)
- OneSignal initialized after fonts load, before splash hide
- Single initialization point for entire app lifecycle

### Backend Push Service (lib/push/index.ts)
- `sendPushNotification({ userIds, title, message, data })` - Generic send
- `sendTripCountdownReminder(userId, tripId, tripName, daysUntil)` - Trip reminders
- `sendActivityReminder(userId, tripId, activityName, startsIn)` - Activity reminders
- `sendSOSConfirmation(userId, tripId)` - SOS acknowledgment
- `sendMessageNotification(userId, tripId, senderName)` - Chat notifications

### tRPC Router (lib/trpc/server/routers/push.ts)
- `testPush` - Admin-only: send test notification to self
- `sendCountdownReminder` - Admin-only: manually trigger countdown
- `getStatus` - Check if push notifications are configured

## Configuration Required

Environment variables needed:
```bash
# Server
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-rest-api-key

# Mobile
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
```

OneSignal Dashboard Setup:
1. Create app at onesignal.com
2. Configure iOS APNs (Settings -> Apple iOS)
3. Configure Android FCM (Settings -> Google Android)

## Technical Details

### app.json Configuration
```json
{
  "plugins": [
    ["onesignal-expo-plugin", { "mode": "production" }],
    "expo-router",
    "expo-secure-store"
  ],
  "extra": {
    "oneSignalAppId": "${EXPO_PUBLIC_ONESIGNAL_APP_ID}"
  },
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]
    }
  }
}
```

### Notification Data Structure
```typescript
{
  tripId: string,
  screen: 'trip-overview' | 'itinerary' | 'sos' | 'chat',
  deepLink: '/trip/{tripId}' | '/trip/{tripId}/itinerary' | ...
}
```

## Commits

| Commit | Description |
|--------|-------------|
| 53f694a | Install OneSignal packages and configure app.json |
| 5387373 | Create OneSignal client initialization and auth integration |
| 1b34c41 | Create backend push notification service and tRPC router |

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

### Created
- `mobile/lib/onesignal.ts` - SDK initialization and user association
- `lib/push/index.ts` - Backend push notification service
- `lib/trpc/server/routers/push.ts` - tRPC push router

### Modified
- `mobile/package.json` - Added onesignal-expo-plugin, react-native-onesignal
- `mobile/app.json` - OneSignal plugin config, iOS infoPlist
- `mobile/lib/auth.tsx` - OneSignalUserSync component
- `mobile/app/_layout.tsx` - initializeOneSignal call
- `lib/trpc/server/root.ts` - pushRouter merge
- `package.json` - Added @onesignal/node-onesignal

## Next Phase Readiness

Push infrastructure ready for:
- **Plan 14-02**: Deep link navigation from notification clicks
- **Scheduled Jobs**: Trip countdown reminders, activity reminders
- **SOS Integration**: Confirmation notifications after alert trigger

Blockers: None. OneSignal env vars must be configured by user before testing.
