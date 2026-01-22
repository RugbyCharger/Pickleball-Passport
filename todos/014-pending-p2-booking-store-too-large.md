# Booking Store Too Large (799 Lines)

---
status: pending
priority: p2
issue_id: "014"
tags: [code-review, architecture, maintainability]
dependencies: []
---

## Problem Statement

The Zustand booking store at 799 lines manages too many concerns: booking state, companion bookings, gift bookings, payment plans, currency conversion, and validation. This makes testing and maintenance difficult.

**Why it matters:** Large monolithic stores are hard to test, prone to bugs, and create coupling between unrelated features.

## Findings

**Source:** Pattern Recognition + Code Simplicity Agents

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/stores/booking-store.ts`

**Concerns Mixed:**
- Package/duration/accommodation selection
- Companion booking management
- Gift booking configuration
- Payment plan handling
- Currency conversion
- Validation logic

## Proposed Solutions

### Option 1: Split into Focused Stores (Recommended)

```typescript
// lib/stores/
booking-core-store.ts      // ~300 LOC - Package, duration, accommodation
booking-companion-store.ts // ~150 LOC - Companion management
booking-gift-store.ts      // ~100 LOC - Gift configuration
booking-pricing-store.ts   // ~100 LOC - Currency, pricing calculations
```

**Pros:** Better separation, easier testing
**Cons:** May need to coordinate between stores
**Effort:** Medium
**Risk:** Medium (needs careful coordination)

## Acceptance Criteria

- [ ] Booking store split into 4+ focused stores
- [ ] Each store < 300 lines
- [ ] Stores can be tested independently
- [ ] Booking flow still works correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during pattern review | 799-line monolithic store |
