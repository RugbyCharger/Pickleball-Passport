# User Account Deletion Destroys Historical Records

---
status: pending
priority: p2
issue_id: "018"
tags: [code-review, data-integrity, compliance]
dependencies: []
---

## Problem Statement

The `deleteAccount` mutation performs hard deletes on bookings, applications, testimonials, and referrals. This violates data retention requirements and GDPR best practices (anonymize vs destroy).

**Why it matters:** Financial records must be retained. GDPR allows anonymization instead of destruction for records with legal retention requirements.

## Findings

**Source:** Data Integrity Guardian Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/user.ts:531-623`

**Destructive Pattern:**
```typescript
// Line 596-598 - Hard delete destroys financial records
await tx.booking.deleteMany({
  where: { userId },
})
```

## Proposed Solutions

### Option 1: Anonymize Instead of Delete (Recommended)

Replace PII with anonymized values:
```typescript
await tx.user.update({
  where: { id: userId },
  data: {
    email: `deleted-${userId}@anonymized.local`,
    firstName: 'Deleted',
    lastName: 'User',
    // Clear PII but keep record
  }
})
// Don't delete bookings - they have financial data
```

**Pros:** GDPR compliant, preserves financial records
**Cons:** More complex logic
**Effort:** Medium
**Risk:** Low

## Acceptance Criteria

- [ ] User PII anonymized, not deleted
- [ ] Booking and payment records preserved
- [ ] Deletion request logged for compliance
- [ ] User can no longer access account

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during data integrity review | Hard delete destroys financial records |
