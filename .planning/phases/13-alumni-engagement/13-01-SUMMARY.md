---
phase: 13
plan: 01
subsystem: backend/alumni-engagement
tags: [prisma, trpc, alumni, stamps, backend]
dependency-graph:
  requires: [12-01] # During-Trip Backend Foundation
  provides: [alumni-router, stamps-router, passport-stamp-models, alumni-discount-config]
  affects: [13-02, 13-03, 13-04] # Mobile app screens will use these endpoints
tech-stack:
  added: []
  patterns:
    - Passport stamp achievement system with unlockCriteria JSON
    - Opt-in alumni directory with privacy controls
    - Trigger-based stamp awarding (trip completion, referral, etc.)
key-files:
  created:
    - lib/trpc/server/routers/alumni.ts
    - lib/trpc/server/routers/stamps.ts
  modified:
    - prisma/schema.prisma
    - lib/trpc/server/root.ts
    - lib/config/business-constants.ts
decisions:
  - id: "13-01-001"
    title: "Stamp criteria stored as JSON"
    rationale: "Flexible unlockCriteria allows different trigger types without schema changes"
  - id: "13-01-002"
    title: "Alumni directory opt-in via showInAlumniDirectory"
    rationale: "Privacy-first approach, guests must explicitly enable directory visibility"
  - id: "13-01-003"
    title: "Stamps awarded via trigger-based checkAndAward"
    rationale: "Mobile app can trigger stamp checks after relevant actions complete"
metrics:
  duration: 6 min
  completed: 2026-01-28
---

# Phase 13 Plan 01: Alumni Backend Foundation Summary

**One-liner:** Alumni/stamps tRPC routers with Prisma models for passport stamps, directory opt-in, and 10% alumni discount config.

## What Was Built

### 1. Prisma Schema Extensions

**User model additions:**
- `showInAlumniDirectory` (Boolean, default false) - Opt-in for alumni directory
- `alumniProfileBio` (Text, optional) - Bio for directory display
- `passportStamps` (relation) - Earned stamps

**New models:**
- `PassportStampDefinition` - Defines earnable stamps with code, name, category, unlockCriteria
- `UserPassportStamp` - Junction table tracking which users earned which stamps

### 2. Alumni tRPC Router (`lib/trpc/server/routers/alumni.ts`)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getStatus` | query | guest | Returns alumni status, totalTrips, completedBookings |
| `directory` | query | protected | Searchable alumni directory with opt-in filter |
| `updateProfile` | mutation | guest | Toggle directory visibility and update bio |
| `getJourneySummary` | query | guest | Journey data with photos, check-ins, metrics |

### 3. Stamps tRPC Router (`lib/trpc/server/routers/stamps.ts`)

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getDefinitions` | query | public | List all active stamp definitions |
| `getMyStamps` | query | guest | User's earned stamps with details |
| `checkAndAward` | mutation | guest | Evaluate eligibility and award new stamps |

### 4. Business Constants

```typescript
ALUMNI_DISCOUNT_CONFIG = {
  DISCOUNT_RATE: 0.10,  // 10% discount
  COOLDOWN_DAYS: 0,     // No cooldown
  STACKS_WITH_PARTNER_DISCOUNT: false,
}

PASSPORT_STAMPS_CONFIG = {
  STAMPS: {
    FIRST_TRIP,      // 1 completed trip
    REPEAT_TRAVELER, // 2 completed trips
    REFERRAL_CHAMPION, // 1 referral completed
    STORYTELLER,     // 1 approved testimonial
    MEMORY_MAKER,    // 10+ photos uploaded
  }
}
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 68651c2 | feat | Add Prisma models for alumni/stamps |
| 55b665a | feat | Create alumni tRPC router |
| 5446f56 | feat | Create stamps router and merge into root |

## Verification Results

- [x] `npx prisma generate` - Schema valid, client generated
- [x] `npm run build` - Build passes
- [x] Alumni router has 4 procedures (getStatus, directory, updateProfile, getJourneySummary)
- [x] Stamps router has 3 procedures (getDefinitions, getMyStamps, checkAndAward)
- [x] Business constants include ALUMNI_DISCOUNT_CONFIG and PASSPORT_STAMPS_CONFIG
- [x] Both routers merged into root.ts

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 13-02:** Alumni Profile and Journey Screen

The backend foundation provides all endpoints needed for:
- Alumni status check on profile screen
- Journey summary with photos, activities, metrics
- Passport stamps collection display
- Alumni directory listing and search

**Mobile app can now:**
- Call `alumni.getStatus` to show alumni badge
- Call `stamps.getMyStamps` to display earned stamps
- Call `alumni.getJourneySummary` for post-trip journey visualization
- Trigger `stamps.checkAndAward` after completing trips, referrals, etc.
