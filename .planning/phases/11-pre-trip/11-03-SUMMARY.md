---
# Document Metadata
phase: 11-pre-trip
plan: 03
status: complete

# Dependency Graph
requires: ["11-01", "11-02"]
provides:
  - Trip overview screen with countdown and checklist
  - PassportUpload component with camera/gallery
  - useCountdown hook with AppState awareness
  - Navigation from dashboard to trip details
affects: ["11-04", "11-05"]

# Tech Tracking
tech-stack:
  added:
    - expo-image-picker (camera/gallery access)
  patterns:
    - useCountdown hook with AppState foreground detection
    - Checklist state persistence via tRPC mutations
    - Dynamic navigation based on booking status

# File Tracking
key-files:
  created:
    - mobile/hooks/useCountdown.ts
    - mobile/components/trip/CountdownTimer.tsx
    - mobile/components/trip/PassportUpload.tsx
    - mobile/components/trip/ChecklistItem.tsx
    - mobile/app/(app)/trip/[tripId]/_layout.tsx
    - mobile/app/(app)/trip/[tripId]/index.tsx
  modified:
    - mobile/components/BookingCard.tsx
    - mobile/app/(app)/(tabs)/index.tsx
    - mobile/app/(app)/(tabs)/bookings.tsx
    - lib/trpc/server/routers/booking.ts
    - mobile/app/(app)/trip/[tripId]/packing.tsx

# Decisions
decisions:
  - key: countdown-hook-appstate
    choice: Use AppState listener to recalculate on foreground
    rationale: Ensures accurate countdown after app background
  - key: passport-local-uri
    choice: Store local file URI for passport (defer Supabase upload)
    rationale: Per v2.0 scope - offline mutations deferred
  - key: checklist-navigation
    choice: Toggle checklist item then navigate to sub-screen
    rationale: User can mark as started before viewing details

# Metrics
metrics:
  duration: 6 min
  completed: 2026-01-28
---

# Phase 11 Plan 03: Trip Overview Screen Summary

Trip overview screen with countdown timer, pre-trip checklist, and passport upload for guest trip preparation.

## What Was Built

### 1. Countdown Hook (useCountdown.ts)
- Calculates days/hours/minutes until target date
- Uses date-fns for accurate time calculations
- AppState listener recalculates when app returns to foreground
- Returns isPast and isToday flags for conditional rendering

### 2. CountdownTimer Component
- Displays countdown units (days/hours/minutes) in emerald brand colors
- Special states: "Departing Today!" and "Your trip has started!"
- Responsive layout with centered alignment

### 3. PassportUpload Component
- Camera and gallery access via expo-image-picker
- Alert-based UI for choosing upload method
- Shows upload status (uploaded/pending) with green checkmark
- Re-upload option for existing documents
- Note: Stores local URI - Supabase upload deferred per v2.0 scope

### 4. ChecklistItem Component
- Reusable checklist row with completion status
- Visual feedback: green background when complete
- Optional chevron for navigation items
- Disabled state when no onPress handler

### 5. Trip Overview Screen (index.tsx)
- Fetches trip details via `trpc.trip.getTripDetails`
- Displays countdown timer with departure date
- Pre-trip checklist with passport upload section
- Checklist items: Review Itinerary, Pack Your Bags
- Quick access: Fellow Travelers, Group Chat
- Pull-to-refresh support
- Progress indicator for checklist completion

### 6. Navigation Updates
- Trip layout (_layout.tsx) with Stack navigator
- BookingCard now navigates to trip overview for confirmed trips
- Booking type updated to include trip.id
- booking.list tRPC response now includes trip.id

## Commits

| Hash | Description |
|------|-------------|
| c8ea860 | feat(11-03): add countdown hook and timer component |
| 9a5b324 | feat(11-03): add passport upload and checklist components |
| 63249a3 | feat(11-03): add trip overview screen with navigation |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] expo-image-picker not installed**
- Found during: Task 2
- Issue: expo-image-picker package missing
- Fix: Installed via `npx expo install expo-image-picker`
- Files modified: mobile/package.json, mobile/package-lock.json

**2. [Rule 3 - Blocking] booking.list missing trip.id**
- Found during: Task 3
- Issue: booking.list tRPC response didn't include trip.id needed for navigation
- Fix: Added `id: true` to trip select in booking.list
- Files modified: lib/trpc/server/routers/booking.ts

**3. [Rule 1 - Bug] packing.tsx TypeScript error**
- Found during: Task 3 verification
- Issue: SectionList data type mismatch
- Fix: Renamed variable to avoid shadowing and typed correctly
- Files modified: mobile/app/(app)/trip/[tripId]/packing.tsx

## Technical Notes

1. **Checklist State Persistence**: Uses `checklist.toggleChecklistItem` mutation with upsert pattern
2. **Countdown Accuracy**: Recalculates on foreground via AppState listener (handles device sleep)
3. **Passport Storage**: Local URI only for v2.0 - full Supabase Storage upload deferred
4. **Navigation Pattern**: BookingCard checks status and trip existence before deciding route

## Next Phase Readiness

Ready for:
- 11-04: Group chat implementation (Stream Chat integration)
- 11-05: Pre-trip UI completion (itinerary view, packing list)

## Verification Results

- [x] All required files created
- [x] TypeScript compiles without errors
- [x] Key tRPC links verified (getTripDetails, toggleChecklistItem, document.create)
- [x] Navigation structure correct (Expo Router recognizes trip/[tripId] routes)
