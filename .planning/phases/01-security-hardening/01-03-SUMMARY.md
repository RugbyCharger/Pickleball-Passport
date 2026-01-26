---
phase: 01-security-hardening
plan: 03
subsystem: payments
tags: [stripe-connect, pci-compliance, security, prisma, trpc]

# Dependency graph
requires:
  - phase: none
    provides: Existing Stripe Connect integration
provides:
  - Removed PartnerPayoutMethod model (security risk)
  - Stripe Connect exclusive payout system
  - Updated partner payouts UI
affects: [partner-portal, payments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stripe Connect exclusive for partner payouts"
    - "No direct bank account storage"

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - lib/trpc/server/routers/partner.ts
    - app/(dashboard)/dashboard/partner/payouts/page.tsx

key-decisions:
  - "Removed PartnerPayoutMethod model entirely rather than deprecating"
  - "Updated requestPayout to require Stripe Connect payouts enabled"
  - "Changed payout eligibility from bank account to Stripe Connect status"

patterns-established:
  - "Partner payouts use Stripe Connect exclusively"
  - "No plaintext bank account storage in database"

# Metrics
duration: 6min
completed: 2026-01-26
---

# Phase 01 Plan 03: Bank Data Removal Summary

**Removed legacy PartnerPayoutMethod model storing plaintext bank data in favor of exclusive Stripe Connect payout processing**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-26T10:02:27Z
- **Completed:** 2026-01-26T10:08:44Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Removed PartnerPayoutMethod model from Prisma schema (security risk: stored plaintext bank account numbers)
- Removed getPayoutSettings and updatePayoutSettings tRPC procedures
- Updated payouts page to use Stripe Connect status for payout eligibility
- Updated requestPayout procedure to require Stripe Connect payouts enabled

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove PartnerPayoutMethod model from schema** - `6896458` (feat)
2. **Task 2: Remove bank account procedures from partner router** - `c538f0e` (feat)
3. **Task 3: Update payouts page UI to remove bank form** - `e51be52` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Removed PartnerPayoutMethod model and relation from PartnerProfile
- `lib/trpc/server/routers/partner.ts` - Removed getPayoutSettings/updatePayoutSettings, updated requestPayout
- `app/(dashboard)/dashboard/partner/payouts/page.tsx` - Removed bank form, updated eligibility to Stripe Connect

## Decisions Made
- **Removal over deprecation:** Removed PartnerPayoutMethod entirely rather than deprecating - no existing production data
- **Stripe Connect exclusive:** All partner payouts now require Stripe Connect with payouts enabled
- **Processing time updated:** Changed payout processing time from "3-5 business days" to "1-2 business days via Stripe"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build verification failed due to unrelated EMAIL_TOKEN_SECRET environment variable check (pre-existing issue)
- Lint error for unescaped apostrophe - fixed by changing "you're" to "you are"

## User Setup Required

None - no external service configuration required. Stripe Connect was already configured.

## Next Phase Readiness
- Partner payouts now exclusively use Stripe Connect
- Legacy bank account code fully removed
- SEC-06 security requirement satisfied
- Database migration to drop PartnerPayoutMethod table should be run in production (table may be empty)

---
*Phase: 01-security-hardening*
*Completed: 2026-01-26*
