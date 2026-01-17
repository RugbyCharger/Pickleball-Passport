# Story 9-2: Referral Tracking Table

Status: done

## Story

As a partner,
I want to see all my referrals in a dedicated page,
So that I can track their status and filter/sort them.

## Acceptance Criteria

### AC-1: Dedicated Referrals Page

- [x] Page: `/dashboard/partner/referrals`
- [x] Link from partner dashboard to referrals page
- [x] Breadcrumb navigation

### AC-2: Table Columns

- [x] Guest Name (first + last from guestProfile, fallback to email)
- [x] Booking Reference
- [x] Package Name
- [x] Status (DRAFT, PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED)
- [x] Booking Value ($)
- [x] Points Earned
- [x] Date Referred

### AC-3: Filtering

- [x] Filter by status (dropdown: All, Pending, Confirmed, Cancelled, Completed)
- [x] Filter by date range (from/to date pickers)
- [x] Clear filters button

### AC-4: Sorting

- [x] Sort by date (default: newest first)
- [x] Sort by points earned
- [x] Sort by booking value
- [x] Visual sort indicator (ascending/descending arrows)

### AC-5: Pagination

- [x] 20 referrals per page
- [x] Page navigation (prev/next, page numbers)
- [x] Total count display

### AC-6: Referral Details

- [x] Click row → Show details in modal/sheet
- [x] Details include: full guest name, email, package details, booking date, trip dates

## Tasks / Subtasks

- [x] Task 1: Create referrals page route and layout
- [x] Task 2: Implement referrals table with all columns
- [x] Task 3: Add filter controls (status dropdown, date range)
- [x] Task 4: Add sort controls with visual indicators
- [x] Task 5: Implement pagination
- [x] Task 6: Add referral details modal
- [x] Task 7: Add link from partner dashboard

## Dev Notes

### API Endpoints (Already Exist)

```typescript
// lib/trpc/server/routers/partner.ts
partner.getMyReferrals({
  limit: 20,
  offset: 0,
})
```

### Need to Extend API

Add filtering and sorting to `getMyReferrals`:
- statusFilter: optional string
- dateFrom: optional date
- dateTo: optional date
- sortBy: 'date' | 'points' | 'value'
- sortOrder: 'asc' | 'desc'

### UI Components

- Use shadcn Table, Select, DatePicker, Button
- Modal: shadcn Dialog or Sheet

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Implementation Date:** 2026-01-16

**What was implemented:**
1. Extended `partner.getMyReferrals` API with:
   - Status filtering (ALL, DRAFT, PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED)
   - Date range filtering (from/to)
   - Sorting by date, points, or value (asc/desc)
   - Pagination with total count

2. Created `/dashboard/partner/referrals` page with:
   - Full referrals table with all columns
   - Filter controls (status dropdown, date pickers)
   - Sortable columns with visual indicators
   - Pagination (20 per page)
   - Referral details modal on row click

3. Added "View All" link from partner dashboard to referrals page

**Files created:**
- `app/(dashboard)/dashboard/partner/referrals/page.tsx`

**Files modified:**
- `lib/trpc/server/routers/partner.ts` - Extended getMyReferrals
- `app/(dashboard)/dashboard/partner/page.tsx` - Added View All link

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/referrals/page.tsx`

**Files to Modify:**
1. `lib/trpc/server/routers/partner.ts` - Extend getMyReferrals with filters
2. `app/(dashboard)/dashboard/partner/page.tsx` - Add link to referrals page
3. `_bmad-output/implementation/sprint-status.yaml` - Update status
