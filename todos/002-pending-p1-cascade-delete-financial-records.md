# Cascading Delete Destroys Financial Audit Trail

---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, data-integrity, compliance, critical]
dependencies: []
---

## Problem Statement

The `Payment` and `RefundLog` models have `onDelete: Cascade` from `Booking`. Deleting a booking will cascade delete all payment and refund records, violating financial record retention requirements and destroying audit trails.

**Why it matters:** Financial records must be retained for auditing, tax compliance, and dispute resolution. Cascade deletes could make it impossible to reconstruct transaction history.

## Findings

**Source:** Data Integrity Guardian Agent

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:614-653` - Payment model
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:1193-1207` - RefundLog model

**Evidence:**
```prisma
model Payment {
  booking   Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model RefundLog {
  payment   Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)
}
```

## Proposed Solutions

### Option 1: Change to Restrict + Soft Delete (Recommended)
Change cascade behavior to `Restrict` and implement soft delete for bookings.

**Pros:** Preserves all financial records, maintains referential integrity
**Cons:** Requires soft delete migration
**Effort:** Medium
**Risk:** Low

### Option 2: Orphan Financial Records
Change to `SetNull` allowing payments to exist without booking reference.

**Pros:** Simple change
**Cons:** Complicates queries, orphaned records harder to understand
**Effort:** Small
**Risk:** Medium

## Acceptance Criteria

- [ ] Payment records cannot be cascade deleted
- [ ] RefundLog records cannot be cascade deleted
- [ ] Booking deletion is soft delete only
- [ ] Financial audit trail is preserved indefinitely
- [ ] Migration handles existing data safely

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during data integrity review | Cascade delete destroys audit trail |

## Resources

- IRS Record Retention: 7 years for financial records
- GDPR vs Financial Compliance balancing
