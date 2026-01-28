---
phase: 14-production-polish
plan: 03
subsystem: ui
tags: [offline, react-native, tanstack-query, nativewind, ux]

# Dependency graph
requires:
  - phase: 11-02
    provides: Offline infrastructure with setupOfflineDetection and useNetworkStatus
provides:
  - OfflineBanner component for visual offline status
  - PendingMutationsIndicator for sync status
  - useHasPendingMutations hook for detecting paused mutations
  - useOfflineMutation utility for offline-friendly mutations
affects: [production-release, app-store-submission]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mutation cache subscription for pending state detection"
    - "Floating indicator pattern for non-blocking status display"
    - "Conditional rendering based on network/sync state"

key-files:
  created:
    - mobile/components/OfflineBanner.tsx
    - mobile/components/PendingMutationsIndicator.tsx
  modified:
    - mobile/lib/offline.ts
    - mobile/app/(app)/_layout.tsx

key-decisions:
  - "Amber color for offline banner to indicate warning without alarm"
  - "Blue color for sync indicator to show activity without concern"
  - "Floating position for PendingMutationsIndicator to avoid layout shifts"

patterns-established:
  - "Status indicators render null when not applicable (auto-hide)"
  - "Network status sourced from shared useNetworkStatus hook"

# Metrics
duration: 4min
completed: 2026-01-28
---

# Phase 14 Plan 03: Offline Mode Polish Summary

**Visual offline indicators with OfflineBanner and PendingMutationsIndicator components integrated into app layout**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-28T11:15:07Z
- **Completed:** 2026-01-28T11:19:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- OfflineBanner shows amber notification when network unavailable
- PendingMutationsIndicator displays sync status with cloud icon
- useHasPendingMutations hook subscribes to mutation cache for real-time state
- useOfflineMutation utility enables offline-first mutation pattern
- Both indicators integrated into (app) layout with proper positioning

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OfflineBanner component** - `63b0cba` (feat)
2. **Task 2: Create PendingMutationsIndicator and useHasPendingMutations hook** - `154b77d` (feat)
3. **Task 3: Integrate offline components into app layout** - `ad58efc` (feat)

## Files Created/Modified
- `mobile/components/OfflineBanner.tsx` - Shows amber banner when offline
- `mobile/components/PendingMutationsIndicator.tsx` - Shows blue sync indicator when mutations pending
- `mobile/lib/offline.ts` - Added useHasPendingMutations and useOfflineMutation utilities
- `mobile/app/(app)/_layout.tsx` - Integrated both components into app layout

## Decisions Made
- Amber styling for offline banner (warning tone without panic)
- Blue styling for sync indicator (activity without concern)
- Floating absolute position for PendingMutationsIndicator (top-right, no layout shift)
- Both components auto-hide when not needed (return null pattern)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Offline UX complete with visual indicators
- Ready for deep linking (14-02) and EAS configuration (14-04)
- All offline infrastructure now provides user feedback

---
*Phase: 14-production-polish*
*Completed: 2026-01-28*
