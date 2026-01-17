# Story 9-3: Points Balance & Transactions

Status: done

## Story

As a partner,
I want to see my points balance and transaction history,
So that I can track my earnings and redemptions.

## Acceptance Criteria

### AC-1: Points Balance Display

- [ ] Page: `/dashboard/partner/points`
- [ ] Display current balance (large, prominent)
- [ ] Show lifetime points earned
- [ ] Show lifetime points redeemed
- [ ] Link to redemption catalog (if balance > 0)

### AC-2: Transaction History

- [ ] Table showing recent transactions (last 50)
- [ ] Columns: Date, Description, Points (earned/redeemed), Balance After
- [ ] Filter: All, Earned, Redeemed
- [ ] Sort: By date (newest first)
- [ ] Pagination (20 per page)

### AC-3: Transaction Details

- [ ] Each transaction shows:
  - Type: Earned or Redeemed
  - Description: "Referral booking: PBP-12345" or "Redeemed: Free Trip"
  - Related booking/referral link (if applicable)
  - Date and time

### AC-4: Expiration Warnings

- [ ] Display warnings if points are expiring soon
- [ ] Show expiration date and countdown
- [ ] Link to redemption catalog

## Tasks / Subtasks

- [ ] Task 1: Create points page route
- [ ] Task 2: Add tRPC query for points balance and transactions
- [ ] Task 3: Build points balance display component
- [ ] Task 4: Build transaction history table
- [ ] Task 5: Add filtering and pagination
- [ ] Task 6: Add expiration warnings (if applicable)
- [ ] Task 7: Add link from partner dashboard

## Dev Notes

### Database Schema

Points are tracked via `PartnerReferral.pointsEarned` and potentially a `PointTransaction` model for redemptions.

Current schema:
- `PartnerProfile.passportPoints` - Current balance
- `PartnerReferral.pointsEarned` - Points from each referral
- Need to track redemptions (may need new model or use existing)

### API Endpoints

```typescript
// lib/trpc/server/routers/partner.ts
partner.getPointsBalance() // Returns current balance, lifetime earned/redeemed
partner.getPointsTransactions({
  limit: 20,
  offset: 0,
  filter: 'ALL' | 'EARNED' | 'REDEEMED'
})
```

### Transaction Types

- EARNED: From referral bookings
- REDEEMED: Points used for rewards

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes

**Implementation Date:** 2026-01-16

**What was implemented:**
1. Added `partner.getPointsBalance` API:
   - Returns current balance, lifetime earned, lifetime redeemed
   - Calculated from PartnerProfile and PartnerReferral records

2. Added `partner.getPointsTransactions` API:
   - Returns transaction history with filtering (ALL, EARNED, REDEEMED)
   - Shows balance after each transaction
   - Pagination support
   - Currently shows earned transactions from referrals
   - Redemption transactions will be added when redemption system is built

3. Created `/dashboard/partner/points` page with:
   - Large current balance display
   - Lifetime earned/redeemed summary cards
   - Transaction history table with filtering
   - Pagination
   - Link to redemption catalog (when balance > 0)

4. Added clickable points card on partner dashboard

**Note:** Redemption transactions are not yet tracked in database. When redemption system (Story 9-5) is built, we'll need to add a PointRedemption model or extend the transaction query.

### File List

**Files to Create:**
1. `app/(dashboard)/dashboard/partner/points/page.tsx`

**Files to Modify:**
1. `lib/trpc/server/routers/partner.ts` - Add points queries
2. `app/(dashboard)/dashboard/partner/page.tsx` - Add link to points page
3. `_bmad-output/implementation/sprint-status.yaml` - Update status
