---
phase: 12-during-trip
plan: 02
subsystem: mobile, ui
tags: [expo-location, gps, sos, stream-chat, concierge, emergency]

# Dependency graph
requires:
  - phase: 12-01
    provides: SOS tRPC router (sos.trigger, sos.getActive endpoints)
provides:
  - useLocation hook for GPS location access with permission handling
  - SOSButton and SOSModal components for emergency alerts
  - getConciergeChannel function for 1:1 support chat
  - Concierge screen for private support messaging
affects: [12-during-trip, mobile-app]

# Tech tracking
tech-stack:
  added:
    - expo-location ~19.0.8
  patterns:
    - Location permission request with graceful fallback (works without GPS)
    - Modal confirmation before critical actions (SOS)

key-files:
  created:
    - mobile/hooks/useLocation.ts
    - mobile/components/sos/SOSButton.tsx
    - mobile/components/sos/SOSModal.tsx
    - mobile/app/(app)/trip/[tripId]/concierge.tsx
  modified:
    - mobile/package.json
    - mobile/lib/stream-chat.ts
    - mobile/app/(app)/trip/[tripId]/_layout.tsx

key-decisions:
  - "SOS works without GPS - location fields optional in trigger mutation"
  - "Concierge channel ID format: concierge-{tripId}-{userId} for per-trip uniqueness"
  - "Location uses Balanced accuracy for battery/precision tradeoff"

patterns-established:
  - "Graceful permission handling: features work with reduced functionality if permission denied"
  - "Stream Chat channel naming convention: {type}-{tripId} for trip channels, concierge-{tripId}-{userId} for 1:1"

# Metrics
duration: 8min
completed: 2026-01-28
---

# Phase 12 Plan 02: Emergency SOS and Concierge Chat Summary

**Emergency SOS button with GPS location capture and 1:1 concierge chat screen for 24/7 guest support**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-28T06:15:00Z
- **Completed:** 2026-01-28T06:23:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Created useLocation hook with full permission handling
- Built SOSButton and SOSModal components with location integration
- Extended Stream Chat client with getConciergeChannel for 1:1 support
- Added concierge chat screen with Stream Chat integration
- SOS works gracefully when GPS permission denied

## Task Commits

Each task was committed atomically:

1. **Task 1: Install expo-location and create location hook** - `deee87c` (feat)
2. **Task 2: Create SOS button and modal components** - `e853412` (feat)
3. **Task 3: Extend Stream Chat for concierge, create concierge screen** - `4b978fd` (feat)

## Files Created/Modified
- `mobile/package.json` - Added expo-location ~19.0.8
- `mobile/hooks/useLocation.ts` - GPS location hook with permission handling
- `mobile/components/sos/SOSButton.tsx` - Red emergency button component
- `mobile/components/sos/SOSModal.tsx` - SOS confirmation modal with location status
- `mobile/lib/stream-chat.ts` - Added getConciergeChannel for 1:1 support
- `mobile/app/(app)/trip/[tripId]/concierge.tsx` - Concierge chat screen
- `mobile/app/(app)/trip/[tripId]/_layout.tsx` - Added concierge route

## Decisions Made
- SOS designed to work without GPS location (fields optional in mutation)
- Concierge channel uses tripId + userId in channel ID for per-user uniqueness
- Location uses Balanced accuracy (tradeoff between precision and battery)
- Concierge screen includes welcome banner explaining 24/7 availability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required. Stream Chat env vars already configured in 11-01.

## Next Phase Readiness
- SOS components ready to be added to trip screens
- Concierge accessible via trip layout navigation
- Backend sos.trigger endpoint ready to receive alerts
- Ready for 12-03 (court booking) or 12-04 (photo upload)

---
*Phase: 12-during-trip*
*Completed: 2026-01-28*
