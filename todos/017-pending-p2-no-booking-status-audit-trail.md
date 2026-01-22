# No Audit Trail for Booking Status Changes

---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, data-integrity, audit]
dependencies: []
---

## Problem Statement

Booking status changes (DRAFT -> PENDING_PAYMENT -> CONFIRMED -> CANCELLED) are not logged. Only `updatedAt` changes, making it impossible to determine when or who changed booking status.

**Why it matters:** Customer disputes and support investigations require knowing when status changed and by whom.

## Findings

**Source:** Data Integrity Guardian Agent

**Locations:**
- `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma:456-567` - Booking model
- Gift state changes have audit trail via `GiftStateTransition`
- Booking status changes have no equivalent

## Proposed Solutions

### Option 1: Create BookingStatusTransition Model (Recommended)

```prisma
model BookingStatusTransition {
  id         String   @id @default(cuid())
  bookingId  String
  fromStatus BookingStatus
  toStatus   BookingStatus
  reason     String?
  triggeredBy String // system, user, admin, webhook
  metadata   Json?
  createdAt  DateTime @default(now())

  booking Booking @relation(...)
}
```

**Pros:** Complete audit trail, matches gift pattern
**Cons:** Migration and code changes needed
**Effort:** Medium
**Risk:** Low

## Acceptance Criteria

- [ ] All booking status changes logged
- [ ] Logs include who triggered change
- [ ] Historical data accessible for support
- [ ] Admin can view status history

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during data integrity review | Status changes not audited |
