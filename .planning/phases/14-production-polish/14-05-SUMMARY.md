---
phase: 14-production-polish
plan: 05
subsystem: infra
tags: [eas, expo, app-store, testflight, play-store, deployment]

# Dependency graph
requires:
  - phase: 14-04
    provides: EAS build profiles and credentials configuration
provides:
  - Complete deployment checklist for app store submission
  - Quick reference for EAS build commands
  - Credential placeholder documentation
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deployment documentation with placeholder mapping"
    - "Quick reference command sections"

key-files:
  created:
    - ".planning/phases/14-production-polish/DEPLOYMENT_CHECKLIST.md"
  modified: []

key-decisions:
  - "Documentation-only approach for deployment since actual credentials require user input"
  - "Comprehensive checklist format with placeholder-to-value mapping"
  - "Quick reference section at top for easy command access"

patterns-established:
  - "Deployment checklists: Include placeholder status, update steps, and troubleshooting"
  - "Build command documentation: Show expected duration and first-time prompts"

# Metrics
duration: 2min
completed: 2026-01-28
---

# Phase 14 Plan 05: App Store Submission Summary

**Comprehensive deployment checklist created with all EAS build commands, credential placeholders, and app store submission steps**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-28T11:34:38Z
- **Completed:** 2026-01-28T11:36:30Z
- **Tasks:** 2 (Task 3 auto-approved per user instruction)
- **Files modified:** 1

## Accomplishments
- Created comprehensive DEPLOYMENT_CHECKLIST.md with all steps for app store deployment
- Documented all credential placeholders requiring user configuration
- Added quick reference section for easy command access
- Included troubleshooting section for common deployment issues

## Task Commits

Each task was committed atomically:

1. **Task 1: Create deployment checklist** - `e5972fc` (docs)
2. **Task 2: Add quick reference build commands** - `ea959b5` (docs)
3. **Task 3: Checkpoint** - Auto-approved (no commit needed)

## Files Created

- `.planning/phases/14-production-polish/DEPLOYMENT_CHECKLIST.md` - Complete deployment guide

## Deployment Checklist Contents

The checklist documents:

### Credential Placeholders to Update
| File | Placeholder | Description |
|------|-------------|-------------|
| mobile/app.json:71 | APPLE_TEAM_ID_PLACEHOLDER | OneSignal devTeam config |
| mobile/eas.json:39 | APP_STORE_CONNECT_APP_ID_PLACEHOLDER | iOS submission target |
| public/.well-known/apple-app-site-association | TEAM_ID | iOS Universal Links |
| public/.well-known/assetlinks.json | SHA256_FINGERPRINT_PLACEHOLDER | Android App Links |
| mobile/google-service-account.json | (file needs creation) | Play Store API access |

### EAS Build Commands
```bash
# iOS Production Build (10-30 min)
cd mobile && npx eas build --platform ios --profile production

# Android Production Build (10-20 min)
cd mobile && npx eas build --platform android --profile production

# Submit iOS to TestFlight
cd mobile && npx eas submit --platform ios --latest

# Submit Android to Play Store Internal
cd mobile && npx eas submit --platform android --latest
```

### Post-Deployment Testing
- TestFlight installation and app launch verification
- Play Store internal testing installation
- Deep link testing via Messages/SMS
- Push notification delivery and navigation

## Decisions Made
- **Documentation-only approach:** Since actual credentials require user input (Apple Team ID, Google service account, etc.), created comprehensive documentation rather than attempting to run commands
- **Checkpoint auto-approved:** Per user instruction for autonomous execution without external service interaction

## Deviations from Plan

None - plan executed exactly as written with documentation approach.

## User Setup Required

**All app store submission requires manual configuration.** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for:

1. **Apple Team ID:** Get from developer.apple.com, update in app.json and AASA file
2. **App Store Connect App ID:** Create app in App Store Connect, update in eas.json
3. **Google Play Service Account:** Create in Google Cloud Console, place JSON in mobile/
4. **Android SHA256 Fingerprint:** Run `eas credentials --platform android`, update assetlinks.json
5. **OneSignal API Keys:** Configure in environment variables

After credentials configured, run the build commands in the checklist to deploy to app stores.

## Next Phase Readiness

**Phase 14 is complete with this plan.**

All v2.0 mobile app phases are now finished:
- Phase 10: Mobile App Scaffold
- Phase 11: Pre-Trip Experience
- Phase 12: During-Trip Experience
- Phase 13: Alumni Engagement
- Phase 14: Production Polish

**To deploy the app:**
1. Follow DEPLOYMENT_CHECKLIST.md to configure credentials
2. Run EAS build commands
3. Submit to TestFlight and Play Store
4. Verify deep links and push notifications

---
*Phase: 14-production-polish*
*Completed: 2026-01-28*
