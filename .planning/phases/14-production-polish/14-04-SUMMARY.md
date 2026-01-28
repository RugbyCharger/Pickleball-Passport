---
phase: 14-production-polish
plan: 04
subsystem: infra
tags: [expo, eas, ios, android, app-store, google-play, build-profiles]

# Dependency graph
requires:
  - phase: 14-01
    provides: OneSignal plugin in app.json
provides:
  - EAS Build configuration with development/preview/production profiles
  - Production-ready app.json with versioning and privacy manifest
  - Submit configuration for App Store Connect and Google Play
affects: [14-05-app-store-submission]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - EAS Build three-profile pattern (development/preview/production)
    - Version management via buildNumber (iOS) and versionCode (Android)

key-files:
  created:
    - mobile/eas.json
  modified:
    - mobile/app.json

key-decisions:
  - "APP_STORE_CONNECT_APP_ID_PLACEHOLDER in eas.json for user to fill after Apple setup"
  - "APPLE_TEAM_ID_PLACEHOLDER in app.json devTeam for user to configure"
  - "google-service-account.json path for Android submission credentials"
  - "autoIncrement: true for production builds to auto-bump version numbers"

patterns-established:
  - "Three build profiles: development (simulator), preview (internal testing), production (store submission)"
  - "iOS uses medium resourceClass for optimized build times"
  - "Android uses AAB format for production (required by Play Store)"

# Metrics
duration: 3min
completed: 2026-01-28
---

# Phase 14 Plan 04: EAS Build Configuration Summary

**EAS Build profiles for development, preview, and production with app store submit configuration and versioning**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-28T17:00:00Z
- **Completed:** 2026-01-28T17:03:00Z
- **Tasks:** 2 auto tasks (checkpoint auto-approved)
- **Files modified:** 2

## Accomplishments

- Created eas.json with three build profiles (development, preview, production)
- Configured submit section for App Store Connect and Google Play
- Updated app.json with production versioning (buildNumber, versionCode)
- Added iOS privacy manifest for App Store compliance
- All placeholders clearly marked for user configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create eas.json with build profiles** - `fe702e8` (feat)
2. **Task 2: Update app.json with production-ready config** - `134d109` (feat)
3. **Task 3: Checkpoint (human-verify)** - Auto-approved (no commit)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified

- `mobile/eas.json` - EAS Build configuration with development, preview, production profiles and submit config
- `mobile/app.json` - Updated with version 1.0.0, buildNumber 1, versionCode 1, devTeam placeholder, privacy manifest

## Decisions Made

- **Placeholder approach:** Using clear placeholders (APPLE_TEAM_ID_PLACEHOLDER, APP_STORE_CONNECT_APP_ID_PLACEHOLDER) instead of empty strings so they're visible and searchable
- **autoIncrement:** Enabled for production to auto-bump build numbers on each build
- **Resource class:** Medium for iOS production builds (balance of speed and cost)
- **AAB format:** Android production uses Android App Bundle as required by Play Store since 2021

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**Before running production builds, the following must be configured:**

### Apple (iOS)

1. **Get Team ID:** Apple Developer -> Membership -> Team ID
2. **Create App ID:** Certificates, IDs & Profiles -> Identifiers -> New App ID
3. **Create App:** App Store Connect -> My Apps -> New App
4. **Update placeholder:** In `mobile/app.json`, replace `APPLE_TEAM_ID_PLACEHOLDER` with your Team ID
5. **Update placeholder:** In `mobile/eas.json`, replace `APP_STORE_CONNECT_APP_ID_PLACEHOLDER` with numeric App Store Connect App ID
6. **Update AASA:** In `public/.well-known/apple-app-site-association`, replace `TEAM_ID` with your Team ID

### Google (Android)

1. **Create App:** Google Play Console -> Create app
2. **Create Service Account:** Google Cloud Console -> IAM -> Service Accounts
3. **Grant Access:** Google Play Console -> Setup -> API access -> Grant service account access
4. **Download Key:** Place JSON key file at `mobile/google-service-account.json`

### Verification

```bash
cd mobile && npx eas credentials
```

## Next Phase Readiness

- EAS Build configuration complete with placeholders
- Ready for 14-05 app store submission after user configures credentials
- All profiles tested via JSON validation

**Blockers for 14-05:**
- User must configure Apple Developer account and replace placeholders
- User must configure Google Play Console and download service account JSON

---
*Phase: 14-production-polish*
*Completed: 2026-01-28*
