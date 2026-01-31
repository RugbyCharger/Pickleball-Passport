# Compound Engineering Analysis Report
**Generated:** 2026-01-31
**Analyzed by:** Claude Code Compound Engineering

---

## Priority 1: Split Massive Booking Router
**Impact:** High | **Effort:** Medium | **Type:** Maintainability

The booking.ts tRPC router has grown to 2,883 lines with multiple unrelated concerns (payments, gifts, referrals, modifications). This creates:
- High risk of merge conflicts
- Cognitive overload for developers
- Difficult to test in isolation

**Files:**
- `lib/trpc/server/routers/booking.ts`

**Acceptance Criteria:**
- Split into sub-routers: `booking/core.ts`, `booking/payments.ts`, `booking/gifts.ts`, `booking/modifications.ts`
- Re-export from `booking/index.ts` to maintain API compatibility
- Each sub-router under 500 lines

---

## Priority 2: Standardize Error Handling with TRPCError
**Impact:** Medium | **Effort:** Low | **Type:** Reliability

Multiple files use `throw new Error()` instead of `throw new TRPCError()`, causing inconsistent error types for clients.

**Files:**
- `lib/trpc/server/routers/user.ts:92`
- `lib/trpc/server/routers/user.ts:346`
- `lib/trpc/server/routers/media.ts:59`
- And others

**Acceptance Criteria:**
- All tRPC routers use TRPCError with appropriate codes
- Error codes: BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, INTERNAL_SERVER_ERROR
- Grep confirms no `throw new Error` in routers

---

## Priority 3: Replace Console Statements with Structured Logging
**Impact:** Medium | **Effort:** Low | **Type:** Observability

28 files in `/lib/` use console.log/error/warn instead of the established Pino logger.

**Files:**
- Run: `grep -r "console\." lib/`

**Acceptance Criteria:**
- All console.* replaced with `logger.info/warn/error`
- Import logger from `@/lib/logger`
- Zero console.* statements in lib/ directory

---

## Priority 4: Add Composite Database Indexes
**Impact:** Medium | **Effort:** Low | **Type:** Performance

Missing composite indexes for common query patterns:

**File:** `prisma/schema.prisma`

**Indexes to add:**
```prisma
// On Booking model
@@index([userId, status])

// On PaymentRecord model
@@index([bookingId, status])
```

**Acceptance Criteria:**
- Migration created and applied
- Query explain shows index usage for user dashboard queries

---

## Priority 5: Split Stripe Webhook Handler
**Impact:** Medium | **Effort:** Medium | **Type:** Maintainability

The webhook handler at 1,103 lines handles multiple event types inline.

**File:** `app/api/webhooks/stripe/route.ts`

**Acceptance Criteria:**
- Extract handlers to `lib/webhooks/stripe/` per event type
- Main route.ts orchestrates, handlers implement logic
- Each handler under 200 lines

---

## Priority 6: Enforce Rate Limiting in Production
**Impact:** High | **Effort:** Low | **Type:** Security

Rate limiting is optional (falls back to no-op if Upstash not configured). Production should require it.

**File:** `lib/rate-limit/index.ts`

**Acceptance Criteria:**
- Throw error in production if UPSTASH_REDIS_REST_URL not set
- Or implement memory-based fallback for development
- Add alert/log when rate limiting is disabled

---

## Priority 7: Add Critical Path Integration Tests
**Impact:** High | **Effort:** High | **Type:** Quality

Missing integration tests for:
- Full booking payment flow
- Stripe webhook handlers
- Cron job execution

**Acceptance Criteria:**
- Test coverage for `createBookingAndPayment` flow
- Mocked Stripe webhook tests for payment_intent events
- Cron job tests verify correct bookings selected

---

## Priority 8: Create Shared Zod Schema Library
**Impact:** Low | **Effort:** Medium | **Type:** Maintainability

Inline `z.object()` definitions duplicated across routers.

**Location:** Create `lib/schemas/`

**Acceptance Criteria:**
- Common schemas extracted: booking, user, payment, trip
- Routers import from shared schemas
- Types derived from schemas using z.infer<>

---

## Summary

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| P1 | Split booking.ts router | High | Medium |
| P2 | Standardize TRPCError usage | Medium | Low |
| P3 | Replace console with logger | Medium | Low |
| P4 | Add composite DB indexes | Medium | Low |
| P5 | Split Stripe webhook | Medium | Medium |
| P6 | Enforce rate limiting | High | Low |
| P7 | Add integration tests | High | High |
| P8 | Shared Zod schemas | Low | Medium |

---

*This report feeds into the nightly auto-compound loop. Top priority will be implemented automatically tonight.*
