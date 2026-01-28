---
phase: 14-production-polish
plan: 02
subsystem: mobile
tags: [deep-linking, universal-links, app-links, push-notifications, onesignal, expo-router]

# Dependency graph
requires:
  - phase: 14-01
    provides: OneSignal SDK initialization and notification click handler scaffold
provides:
  - iOS Universal Links via AASA file
  - Android App Links via assetlinks.json
  - Notification tap navigation to correct screens
  - Contextual notification permission prompt
affects: [14-05 app store submission, future notification features]

# Tech tracking
tech-stack:
  added: []
  patterns: [additionalData for notification payloads, MMKV for prompt state]

key-files:
  created:
    - public/.well-known/apple-app-site-association
    - public/.well-known/assetlinks.json
    - mobile/components/NotificationPrompt.tsx
  modified:
    - mobile/app.json
    - mobile/lib/onesignal.ts
    - mobile/app/(app)/trip/[tripId]/index.tsx

key-decisions:
  - "Use additionalData not Launch URL for notification payloads (iOS cold-start compatibility)"
  - "MMKV for prompt shown state (consistent with existing cache storage)"
  - "NotificationPrompt in trip overview screen (contextual, not intrusive)"
  - "Placeholder credentials in AASA/assetlinks (user adds real values before deploy)"

patterns-established:
  - "Deep link verification: AASA + assetlinks.json in public/.well-known/"
  - "Notification data structure: { deepLink?, tripId?, screen? }"
  - "Contextual permission prompts: Show once per install via MMKV flag"

# Metrics
duration: 3min
completed: 2026-01-28
---

# Phase 14 Plan 02: Deep Linking and Notifications Summary

**iOS Universal Links, Android App Links, and push notification navigation with contextual permission prompt**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-28T11:26:17Z
- **Completed:** 2026-01-28T11:29:46Z
- **Tasks:** 4
- **Files modified:** 6

## Accomplishments
- Created AASA and assetlinks.json for verified deep links (iOS/Android)
- Configured app.json with associatedDomains and intentFilters
- Implemented notification click handler with expo-router navigation
- Created contextual NotificationPrompt component in trip overview

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AASA and assetlinks.json** - `0fa5eec` (feat)
2. **Task 2: Update app.json with deep link config** - `f0c6bf1` (feat)
3. **Task 3: Add notification click handler** - `e9aaac6` (feat)
4. **Task 4: Create NotificationPrompt component** - `519dc7a` (feat)

## Files Created/Modified
- `public/.well-known/apple-app-site-association` - iOS Universal Links verification
- `public/.well-known/assetlinks.json` - Android App Links verification
- `mobile/app.json` - associatedDomains and intentFilters configuration
- `mobile/lib/onesignal.ts` - Notification click handler with router.push
- `mobile/components/NotificationPrompt.tsx` - Contextual permission request UI
- `mobile/app/(app)/trip/[tripId]/index.tsx` - Integrated NotificationPrompt

## Decisions Made
- **additionalData for payloads:** iOS has known issue where Linking.getInitialURL() returns null for cold-start notifications with Launch URL. additionalData is reliable.
- **MMKV storage:** Used existing storage instance for consistency with cache layer
- **Trip overview placement:** Contextual prompt when user is engaged with their trip, not intrusive on app launch
- **Placeholder credentials:** TEAM_ID and SHA256_FINGERPRINT need to be replaced by user before deployment

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**Before deployment:**
1. Replace `TEAM_ID` in apple-app-site-association with actual Apple Team ID
2. Replace `SHA256_FINGERPRINT_PLACEHOLDER` in assetlinks.json with EAS build signing key fingerprint
3. Replace `APPLE_TEAM_ID_PLACEHOLDER` in app.json onesignal-expo-plugin config

**Verification after deployment:**
- iOS: `curl -I https://pickleballpassport.com/.well-known/apple-app-site-association` should return JSON
- Android: `adb shell pm get-app-links com.pickleballpassport.app` should show verified status

## Next Phase Readiness
- Deep link files ready for deployment
- app.json configured for both platforms
- Custom URL scheme (pickleballpassport://) still works as fallback
- NotificationPrompt ready to request permissions contextually
- Ready for EAS build configuration (14-04) and app store submission (14-05)

---
*Phase: 14-production-polish*
*Completed: 2026-01-28*
