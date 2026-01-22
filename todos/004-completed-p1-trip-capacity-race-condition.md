# Trip Capacity Race Condition

---
status: completed
priority: p1
issue_id: "004"
tags: [code-review, data-integrity, concurrency, critical]
dependencies: []
---

## Problem Statement

Trip capacity check and booking creation are not atomic. Two concurrent users could both pass the capacity check and exceed trip capacity, resulting in overbooking.

**Why it matters:** Overbooking a trip creates operational problems and customer disappointment. This race condition is exploitable under high traffic.

## Findings

**Source:** Data Integrity Guardian Agent

**Location:** `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/booking.ts:122-148`

**Vulnerable Code Pattern:**
```typescript
// Check happens here...
if (trip.currentBookings >= trip.capacity) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'This trip is fully booked' })
}

// ...booking created later
// ...capacity incremented even later in webhook (race window!)
```

**Race Condition Scenario:**
1. User A reads capacity: 9/10
2. User B reads capacity: 9/10
3. User A creates booking (now 10/10)
4. User B creates booking (now 11/10 - OVERBOOKED!)

## Proposed Solutions

### Option 1: Atomic Capacity Check with updateMany (Recommended)

```typescript
const result = await tx.trip.updateMany({
  where: {
    id: tripId,
    currentBookings: { lt: capacity } // Atomic check
  },
  data: { currentBookings: { increment: 1 } }
})

if (result.count === 0) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Trip is fully booked' })
}
```

**Pros:** Simple, uses existing Prisma capabilities
**Cons:** None significant
**Effort:** Small
**Risk:** Low

### Option 2: Database Advisory Lock
Use PostgreSQL advisory locks during booking creation.

**Pros:** Guaranteed serialization
**Cons:** More complex, potential for deadlocks
**Effort:** Medium
**Risk:** Medium

## Acceptance Criteria

- [ ] Capacity check and increment are atomic
- [ ] Concurrent booking attempts properly serialized
- [ ] Overbooking is impossible
- [ ] Load test confirms no race condition
- [ ] Clear error message when trip is full

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-01-22 | Identified during data integrity review | TOCTOU vulnerability in booking flow |
| 2026-01-22 | Fixed with multi-pronged approach | Used $executeRaw for atomic updates, count pending+confirmed for checks |

## Resources

- PostgreSQL Advisory Locks
- Prisma Transaction Documentation
