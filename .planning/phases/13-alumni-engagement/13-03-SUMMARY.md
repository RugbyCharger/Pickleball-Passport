---
phase: 13
plan: 03
subsystem: mobile/alumni-screens
tags: [react-native, expo, trpc, alumni, stamps, directory]
dependency-graph:
  requires: [13-01] # Alumni Backend Foundation
  provides: [passport-stamps-screen, alumni-directory-screen, stamps-hook, alumni-components]
  affects: [13-04] # May use these components
tech-stack:
  added: []
  patterns:
    - usePassportStamps hook with stamp definitions and earned status
    - useDeferredValue for debounced search in directory
    - Infinite scroll FlatList with pagination
    - Category-based emoji icons for stamps
key-files:
  created:
    - mobile/hooks/usePassportStamps.ts
    - mobile/components/alumni/PassportStampBadge.tsx
    - mobile/components/alumni/StampGrid.tsx
    - mobile/components/alumni/AlumniSearchBar.tsx
    - mobile/components/alumni/AlumniCard.tsx
    - mobile/app/(app)/alumni/stamps.tsx
    - mobile/app/(app)/alumni/directory.tsx
  modified: []
decisions:
  - id: "13-03-001"
    title: "Category-based emoji icons for stamps"
    rationale: "Simple visual representation without needing custom icons or images"
  - id: "13-03-002"
    title: "useDeferredValue for search debounce"
    rationale: "React 18 built-in for smooth search without external debounce library"
  - id: "13-03-003"
    title: "Earned stamps sorted first in grid"
    rationale: "Shows progress and achievement first, motivates completing locked stamps"
metrics:
  duration: 3 min
  completed: 2026-01-28
---

# Phase 13 Plan 03: Passport Stamps Collection Summary

**One-liner:** Passport stamps screen with progress tracking and alumni directory with infinite scroll search.

## What Was Built

### 1. Passport Stamps Hook (`mobile/hooks/usePassportStamps.ts`)

Data hook combining stamp definitions with earned status:

```typescript
const { stamps, earnedCount, totalCount, progress, isLoading, refetch } = usePassportStamps();
// stamps: Array of stamp definitions with isEarned flag
// progress: Percentage (0-100) of earned/total
```

### 2. Stamp Components

**PassportStampBadge.tsx:**
- Circular emoji icon based on category (TRIPS, REFERRALS, ENGAGEMENT, ACHIEVEMENTS)
- Purple styling when earned, gray when locked
- Shows earned date for unlocked stamps
- "Locked" text for unearned stamps

**StampGrid.tsx:**
- 2-column flex grid layout
- Sorts earned stamps first, then by category
- 48% width for each stamp with margin between

### 3. Stamps Collection Screen (`mobile/app/(app)/alumni/stamps.tsx`)

| Section | Content |
|---------|---------|
| Header | Purple background with title and subtitle |
| Progress Bar | White fill on purple track, earned/total count |
| Stats Cards | Earned (trophy emoji) and Locked (lock emoji) counts |
| How to Earn | Info box explaining stamp earning methods |
| Collection | StampGrid displaying all stamps |
| Footer | Motivational message or congratulations when complete |

### 4. Alumni Directory Components

**AlumniSearchBar.tsx:**
- Search icon with text input
- Clear button (X) when text entered
- Gray placeholder text

**AlumniCard.tsx:**
- Circular initials avatar in purple
- Display name from firstName/lastName or email
- Bio preview (single line truncated)
- Trip count badge

### 5. Alumni Directory Screen (`mobile/app/(app)/alumni/directory.tsx`)

| Feature | Implementation |
|---------|----------------|
| Search | useDeferredValue for performance, queries alumni.directory |
| Pagination | useInfiniteQuery with 20-item pages |
| List | FlatList with infinite scroll on end reached |
| Empty State | Different messages for no search results vs empty directory |
| Loading | ActivityIndicator in header and footer |
| Pull to Refresh | RefreshControl with manual refresh |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 9ba187d | feat | Create passport stamps hook and badge components |
| ebfd105 | feat | Create passport stamps collection screen |
| 74f9b4c | feat | Create alumni directory screen with search |

## Verification Results

- [x] `npx tsc --noEmit` - TypeScript compiles without errors
- [x] usePassportStamps hook returns stamps with isEarned status
- [x] StampGrid displays earned stamps first, then locked stamps
- [x] Stamps screen shows progress bar and stats (99 lines)
- [x] Alumni directory uses trpc.alumni.directory query
- [x] FlatList has infinite scroll pagination
- [x] directory.tsx has 135 lines (min: 70)
- [x] stamps.tsx has 99 lines (min: 60)
- [x] StampGrid.tsx has 40 lines (min: 40)
- [x] usePassportStamps exports usePassportStamps function

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 13-04:** Alumni Social Features

Mobile app now has:
- Passport stamps collection with visual progress tracking
- Searchable alumni directory with infinite scroll
- Reusable components for alumni profiles and stamps

These screens integrate with the backend built in 13-01:
- `stamps.getDefinitions` and `stamps.getMyStamps` for passport stamps
- `alumni.directory` for searchable alumni list
