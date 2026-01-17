# Story 9-12: Partner Tiers and Benefits

Status: done

## Story

As a partner,
I want to view detailed tier information and benefits,
So that I can understand what I'm working toward and unlock at each tier.

## Acceptance Criteria

### AC-1: Tiers Page

- [ ] Page: `/dashboard/partner/tiers`
- [ ] Link from partner dashboard
- [ ] Breadcrumb navigation

### AC-2: Current Tier Display

- [ ] Display current tier badge (large, prominent)
- [ ] Current tier name and description
- [ ] Progress to next tier
- [ ] Points needed to advance

### AC-3: Tier Structure Table

- [ ] Table showing all 4 tiers:
  - Bronze (0 points)
  - Silver (1,000 points)
  - Gold (5,000 points)
  - Platinum (15,000 points)
- [ ] Points threshold for each tier
- [ ] Commission rate per tier
- [ ] Highlights current tier

### AC-4: Benefits Per Tier

- [ ] Detailed benefits list for each tier:
  - Commission rate
  - Support level
  - Exclusive perks
  - Marketing support
  - Special events access
- [ ] Visual comparison

### AC-5: Tier Progress

- [ ] Progress bar to next tier
- [ ] "X points to go" message
- [ ] Next tier benefits preview
- [ ] How to earn points section

## Tasks / Subtasks

- [ ] Task 1: Create tiers page route
- [ ] Task 2: Display current tier badge
- [ ] Task 3: Create tier structure table
- [ ] Task 4: Add benefits comparison
- [ ] Task 5: Add tier progress section
- [ ] Task 6: Add link from partner dashboard

## Dev Notes

### Tier Information

Use existing tier data from:
- `lib/trpc/server/routers/partner.ts` - `TIER_THRESHOLDS` and `TIER_BENEFITS`
- `partner.getTierInfo` query (already exists)

### Tier Thresholds

- Bronze: 0 points
- Silver: 1,000 points
- Gold: 5,000 points
- Platinum: 15,000 points

### Commission Rates

- Bronze: 5% commission
- Silver: 7.5% commission
- Gold: 10% commission
- Platinum: 12.5% commission

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/tiers/page.tsx` - Tiers and benefits page

**Files Modified:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Added "View All Tiers" button in tier progress card
2. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Current tier display with prominent badge
- Tier structure table (all 4 tiers):
  - Bronze (0 points, 5% commission)
  - Silver (1,000 points, 7.5% commission)
  - Gold (5,000 points, 10% commission)
  - Platinum (15,000 points, 12.5% commission)
- Benefits comparison grid:
  - Shows all benefits for each tier
  - Highlights current tier
  - Visual distinction for achieved vs locked tiers
- Progress to next tier:
  - Progress bar
  - Points needed
  - "X points to go" message
- How to earn points section:
  - Referral clicks (10 points)
  - Applications (100 points)
  - Bookings (1,000-1,500 points)
  - Trip completion (500 bonus)
  - Recruit partners (2,000 points)
  - Community engagement (50-100 points)
- Link to points page

**Tier Information:**
- Uses existing `partner.getTierInfo` and `partner.getDashboardStats` queries
- Tier thresholds and benefits from `lib/trpc/server/routers/partner.ts`

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/tiers/page.tsx`

**Files to Modify:**
1. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
2. `_bmad-output/implementation/sprint-status.yaml` - Update status
