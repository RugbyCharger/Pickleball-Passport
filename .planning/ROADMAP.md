# Roadmap: Pickleball Passport Phase 1 MVP Completion

## Overview

This roadmap takes the existing 85%-complete booking platform to go-to-market readiness across 4 phases. Security hardening comes first (launch blockers), followed by payment failure recovery with data integrity guarantees, partner portal completion for the distribution channel, and finally email system wiring. All 19 v1 requirements map to exactly one phase with observable success criteria.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions if needed (marked with INSERTED)

- [x] **Phase 1: Security Hardening** - Protect admin routes, verify webhooks, secure sensitive data
- [x] **Phase 2: Payment Recovery & Data Integrity** - Failed payment flows and atomic capacity checks
- [ ] **Phase 3: Partner Portal** - Real-time dashboards and referral link functionality
- [ ] **Phase 4: Email System** - Booking cancellation email wiring

## Phase Details

### Phase 1: Security Hardening
**Goal**: Admin routes are protected, webhooks are verified, and sensitive data is secured
**Depends on**: Nothing (first phase, P0 launch blockers)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. Admin user can access /dashboard/admin/* routes when authenticated with ADMIN role
  2. Non-admin user attempting /dashboard/admin/* is redirected to /dashboard
  3. SendGrid webhook requests without valid signatures are rejected with 401
  4. Email token verification fails when EMAIL_TOKEN_SECRET env var is missing (no fallback) - ALREADY SATISFIED
  5. Document upload page displays current authenticated user's documents, not hardcoded test user - ALREADY SATISFIED
**Plans**: 3 plans (all Wave 1 - parallel execution)

Plans:
- [x] 01-01-PLAN.md — Admin route middleware protection (SEC-01, SEC-02)
- [x] 01-02-PLAN.md — SendGrid webhook SDK verification (SEC-03)
- [x] 01-03-PLAN.md — Bank data removal for Stripe Connect exclusive (SEC-06)

**Note**: SEC-04 and SEC-05 were verified as already satisfied during research phase. See 01-RESEARCH.md for details.

### Phase 2: Payment Recovery & Data Integrity
**Goal**: Guests can recover from payment failures and overbooking is prevented
**Depends on**: Phase 1
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, DAT-01, DAT-02, DAT-03
**Success Criteria** (what must be TRUE):
  1. Guest receives email within 5 minutes when checkout payment fails
  2. Guest with failed installment can click "Update Payment Method" in dashboard and enter new card
  3. Failed payment email contains clickable link that opens payment method update modal
  4. Booking confirmation is rejected when trip capacity is already at maximum
  5. Admin receives notification when overbooking prevention triggers
**Plans**: 3 plans (all Wave 1 - parallel execution)

Plans:
- [x] 02-01-PLAN.md — Payment failure email flow with direct link (PAY-01, PAY-04)
- [x] 02-02-PLAN.md — Verify existing payment method update UI (PAY-02, PAY-03)
- [x] 02-03-PLAN.md — Overbooking admin alert and wiring (DAT-01, DAT-02, DAT-03)

**Note**: Research found 80-90% of infrastructure already exists. PAY-02/PAY-03 are already implemented (UpdatePaymentMethodModal). DAT-01/DAT-02 atomic capacity checks already exist. Work focuses on wiring existing components and adding admin alerts.

### Phase 3: Partner Portal
**Goal**: Partners can view their referral performance and share tracking links
**Depends on**: Phase 1 (security must be in place before partner data exposure)
**Requirements**: PTR-01, PTR-02, PTR-03, PTR-04
**Success Criteria** (what must be TRUE):
  1. Partner dashboard shows current referral count that updates when new referral is attributed
  2. Partner dashboard displays separate "pending" and "available" commission amounts
  3. Partner can click copy button next to referral link and paste working URL
  4. Copied referral link includes utm_source, utm_medium, utm_campaign parameters
**Plans**: 2 plans (all Wave 1 - parallel execution)

Plans:
- [ ] 03-01-PLAN.md — Pending/available commission display (PTR-01 verify, PTR-02)
- [ ] 03-02-PLAN.md — Referral link copy with UTM params (PTR-03, PTR-04)

**Note**: Research found extensive infrastructure already exists. PTR-01 (referral count) is already implemented via getDashboardStats. Work focuses on adding pending/available commission split and UTM parameters to link copy functionality.

### Phase 4: Email System
**Goal**: Guests receive cancellation notifications via email
**Depends on**: Phase 1 (email token security must be in place)
**Requirements**: EML-01, EML-02
**Success Criteria** (what must be TRUE):
  1. Guest receives email when their booking is cancelled (by admin or self)
  2. Cancellation email includes booking reference, trip name, and cancellation date
**Plans**: TBD

Plans:
- [ ] 04-01: Cancellation email wiring (EML-01, EML-02)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Hardening | 3/3 | Complete | 2026-01-26 |
| 2. Payment Recovery & Data Integrity | 3/3 | Complete | 2026-01-26 |
| 3. Partner Portal | 0/2 | Planned | - |
| 4. Email System | 0/1 | Not started | - |

---
*Roadmap created: 2026-01-26*
*Total phases: 4*
*Total plans: 9*
*Total v1 requirements: 19*
