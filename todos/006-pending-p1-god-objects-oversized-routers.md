# God Objects: Oversized tRPC Routers

---
status: pending
priority: p1
issue_id: "006"
tags: [code-review, architecture, maintainability, critical]
dependencies: []
---

## Problem Statement

Multiple tRPC router files exceed 2,500+ lines with dozens of procedures mixed together, violating Single Responsibility Principle. This makes code difficult to maintain, test, and reason about.

**Why it matters:** Large monolithic files increase cognitive load, make code review difficult, and increase merge conflict risk.

## Findings

**Source:** Architecture Strategist + Pattern Recognition Agents

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/admin.ts` - **3,115 lines**, 33 Zod schemas
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/partner.ts` - **3,460 lines**
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/booking.ts` - **2,754 lines** with payment, referral, booking logic mixed

**Impact:**
- Difficult to find specific procedures
- High merge conflict potential
- Hard to test in isolation
- Long build times for changes

## Proposed Solutions

### Option 1: Split into Sub-Routers (Recommended)

Follow the pattern already started for booking:
```
lib/trpc/server/routers/
  admin/
    index.ts      # Combines sub-routers
    bookings.ts   # Booking-related admin procedures
    documents.ts  # Document management
    users.ts      # User management
    trips.ts      # Trip management
    sms.ts        # SMS operations
  partner/
    index.ts
    dashboard.ts
    referrals.ts
    payouts.ts
    profile.ts
```

**Pros:** Better organization, easier testing, reduced conflicts
**Cons:** Initial refactoring effort
**Effort:** Large (but can be done incrementally)
**Risk:** Low (purely structural)

## Acceptance Criteria

- [ ] admin.ts split into 5+ focused sub-routers
- [ ] partner.ts split into 4+ focused sub-routers
- [ ] booking.ts completes migration to sub-router pattern
- [ ] No router file exceeds 500 lines
- [ ] All tests pass after refactoring
- [ ] API endpoints unchanged (no breaking changes)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during architecture review | Routers have become god objects |

## Resources

- tRPC Nested Routers Documentation
- Clean Architecture: Component Cohesion
