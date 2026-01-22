# Partner Points Award Not Atomic

---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, data-integrity, transactions]
dependencies: []
---

## Problem Statement

Partner referral creation and points update are separate non-atomic operations. If the points update fails after referral creation, data becomes inconsistent.

**Why it matters:** Partners could have referral records without corresponding points, causing accounting discrepancies.

## Findings

**Source:** Data Integrity Guardian Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/booking.ts:500-517`

**Vulnerable Pattern:**
```typescript
// These should be in a transaction
await ctx.db.partnerReferral.create({...})
// If this fails, referral exists but points not awarded
await ctx.db.partnerProfile.update({
  data: { passportPoints: { increment: pointsEarned } }
})
```

## Proposed Solutions

### Option 1: Wrap in Transaction (Recommended)

```typescript
await ctx.db.$transaction(async (tx) => {
  await tx.partnerReferral.create({...})
  await tx.partnerProfile.update({...})
})
```

**Pros:** Atomic, consistent data
**Cons:** Slightly more code
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Referral creation and points update are atomic
- [ ] Failed operations roll back completely
- [ ] Points balance always matches referral records

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during data integrity review | Non-atomic operations risk inconsistency |
