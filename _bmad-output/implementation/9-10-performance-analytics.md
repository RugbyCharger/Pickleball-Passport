# Story 9-10: Performance Analytics

Status: done

## Story

As a partner,
I want to view detailed performance analytics with charts and trends,
So that I can understand my referral performance over time and optimize my efforts.

## Acceptance Criteria

### AC-1: Performance Analytics Page

- [ ] Page: `/dashboard/partner/analytics`
- [ ] Link from partner dashboard
- [ ] Breadcrumb navigation

### AC-2: Time Period Filters

- [ ] Filter by: Last 7 days, Last 30 days, Last 90 days, Last 12 months, All time
- [ ] Custom date range picker (optional for MVP)
- [ ] Apply filter updates all charts

### AC-3: Key Metrics Overview

- [ ] Summary cards:
  - Total referrals
  - Conversion rate
  - Total revenue
  - Average booking value
  - Points earned
- [ ] Period-over-period comparison (e.g., vs last period)

### AC-4: Referrals Over Time Chart

- [ ] Line chart showing referrals per day/week/month
- [ ] Show trend line
- [ ] Hover tooltips with exact values
- [ ] Optional: Compare with previous period

### AC-5: Conversion Funnel

- [ ] Visual funnel showing:
  - Referrals sent (clicks)
  - Applications submitted
  - Bookings confirmed
  - Completed trips
- [ ] Conversion percentage at each stage
- [ ] Highlight drop-off points

### AC-6: Revenue Trends

- [ ] Line or bar chart showing revenue over time
- [ ] Monthly/quarterly breakdown
- [ ] Revenue by package type (optional for MVP)

### AC-7: Performance Comparison

- [ ] Month-over-month comparison table
- [ ] Key metrics comparison (referrals, conversions, revenue)
- [ ] Show percentage change (up/down arrows)

## Tasks / Subtasks

- [ ] Task 1: Create analytics page route
- [ ] Task 2: Add time period filters
- [ ] Task 3: Implement referrals over time chart
- [ ] Task 4: Create conversion funnel visualization
- [ ] Task 5: Add revenue trends chart
- [ ] Task 6: Add performance comparison table
- [ ] Task 7: Add tRPC query for analytics data
- [ ] Task 8: Add link from partner dashboard

## Dev Notes

### Chart Library

Use `recharts` (already installed):
```typescript
import { LineChart, BarChart, FunnelChart } from 'recharts';
```

### Analytics Data Query

Create tRPC query `partner.getPerformanceAnalytics` that returns:
- Time-series data for referrals
- Funnel metrics
- Revenue trends
- Period comparisons

### Data Aggregation

Group referrals by date for time-series charts:
- Daily aggregation for <90 days
- Weekly aggregation for 90 days - 1 year
- Monthly aggregation for >1 year

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Completed:** 2026-01-16

**Files Created:**
1. `app/(dashboard)/dashboard/partner/analytics/page.tsx` - Performance analytics page with charts

**Files Modified:**
1. `lib/trpc/server/routers/partner.ts` - Added `getPerformanceAnalytics` query
2. `app/(dashboard)/dashboard/partner/page.tsx` - Added "Analytics" quick action card
3. `_bmad-output/implementation/sprint-status.yaml` - Updated status to done

**Features Implemented:**
- Time period filters (7d, 30d, 90d, 12m, all)
- Summary metrics cards with period-over-period comparison
- Referrals over time line chart (referrals + bookings)
- Revenue trends bar chart
- Conversion funnel visualization (referrals → applications → bookings → completed)
- Performance comparison table (current vs previous period)
- Trend indicators (up/down arrows with percentages)
- Responsive charts using recharts library

**Analytics Data:**
- Time-series data grouped by day/week/month based on period
- Funnel metrics with conversion rates at each stage
- Period comparisons (vs previous period)
- Revenue and bookings trends

**Note:** Uses recharts library (already installed). Charts are responsive and include tooltips and legends.

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/analytics/page.tsx`

**Files to Modify:**
1. `lib/trpc/server/routers/partner.ts` - Add `getPerformanceAnalytics` query
2. `app/(dashboard)/dashboard/partner/page.tsx` - Add link
3. `_bmad-output/implementation/sprint-status.yaml` - Update status
