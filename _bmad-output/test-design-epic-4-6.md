# Test Design: Epic 4-6 - Installment Payment Plans

**Date:** 2026-01-13
**Author:** Grant
**Epic:** E4-S6
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 4-6: Installment Payment Plans

**Risk Summary:**

- Total risks identified: 12
- High-priority risks (≥6): 4
- Critical categories: SEC (Security), DATA (Data Integrity), BUS (Business Impact), PERF (Performance)

**Coverage Summary:**

- P0 scenarios: 15 (30 hours)
- P1 scenarios: 22 (22 hours)
- P2/P3 scenarios: 28 (17 hours)
- **Total effort**: 69 hours (~9 days)

**Test Levels Distribution:**
- E2E: 12 scenarios (critical payment flows, user journeys)
- API: 28 scenarios (business logic, Stripe integration)
- Component: 18 scenarios (UI components, accessibility)
- Unit: 7 scenarios (calculation utilities, edge cases)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-001 | DATA | Installment rounding errors cause payment total mismatch | 3 | 3 | 9 | Comprehensive unit tests for all rounding scenarios; validate sum equals exact total in cents | DEV | Before release |
| R-002 | SEC | Stripe customer creation fails, payment method not saved for future charges | 2 | 3 | 6 | Retry logic with exponential backoff; graceful fallback to FULL payment; user notification | DEV | Before release |
| R-003 | BUS | 2% discount not applied correctly, causing user complaints and refunds | 2 | 3 | 6 | Unit tests for discount calculation; E2E tests verify discount in UI, database, and email | QA | Before release |
| R-004 | DATA | Payment records not created atomically, leaving orphaned bookings or payments | 2 | 3 | 6 | Wrap booking + payments in database transaction; test rollback scenarios | DEV | Before release |

### Medium-Priority Risks (Score 3-5)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-005 | TECH | 70-day validation bypassed, allowing installments for near-term trips | 2 | 2 | 4 | Server-side validation in tRPC mutation; client-side validation for UX; test edge cases (exactly 70 days, 69 days, timezone) | DEV |
| R-006 | BUS | Gift bookings allow installments, violating business rule | 1 | 3 | 3 | Disable installment option when `isGift=true`; test gift booking flow | DEV |
| R-007 | SEC | Payment method saved without user authorization | 1 | 3 | 3 | Required authorization checkbox; validate consent before saving method; accessibility for screen readers | DEV |
| R-008 | PERF | Stripe API calls slow down booking flow, causing user drop-off | 2 | 2 | 4 | Monitor Stripe API latency; implement loading states; timeout handling; test with Stripe test mode delays | DEV |
| R-009 | OPS | Email confirmation missing installment schedule, causing user confusion | 2 | 2 | 4 | Test email template with both FULL and INSTALLMENT_4 plans; verify schedule accuracy | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------ |
| R-010 | OPS | Dashboard payment schedule display breaks on mobile | 1 | 2 | 2 | Mobile responsiveness testing; test on real devices |
| R-011 | BUS | Companion bookings with different payment plans cause confusion | 1 | 2 | 2 | Test companion flow; ensure independent payment plan selection works |
| R-012 | TECH | Date calculations incorrect for leap years or timezones | 1 | 2 | 2 | Use date-fns library; test leap year dates; test multiple timezones |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| Installment amount calculation (50/25/15/10%) | Unit | R-001 | 5 | DEV | Test small amounts ($10), large amounts ($15,385.67), odd totals, verify sum equals exact total |
| 2% discount calculation for FULL payment | Unit | R-003 | 3 | DEV | Test various amounts, verify rounding, check display vs database |
| Stripe customer creation with retry logic | API | R-002 | 3 | DEV | Test success, single failure with retry, multiple failures with fallback |
| Atomic booking + payment record creation | API | R-004 | 2 | DEV | Test rollback on payment failure, verify no orphaned records |
| FULL payment E2E flow with discount | E2E | R-003 | 1 | QA | Select FULL → verify 2% discount → complete payment → check database |
| INSTALLMENT_4 E2E flow with schedule | E2E | R-002, R-004 | 1 | QA | Select INSTALLMENT_4 → verify schedule → complete payment → check 4 payment records + customer |

**Total P0**: 15 tests, 30 hours (2 hours per test avg)

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-5) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 70-day trip validation (client + server) | API | R-005 | 4 | DEV | Test 69 days (reject), 70 days (allow), 100 days (allow), timezone edge cases |
| Gift booking installment restriction | API | R-006 | 2 | DEV | Test isGift=true disables installments, verify FULL payment only |
| Payment method authorization checkbox | Component | R-007 | 3 | DEV | Test checkbox required, ARIA labels, error message when unchecked |
| Stripe API timeout handling | API | R-008 | 2 | DEV | Mock slow Stripe response, verify timeout, loading state |
| Email confirmation with payment schedule | API | R-009 | 2 | QA | Test FULL plan email (shows discount), INSTALLMENT_4 email (shows schedule) |
| Payment plan selector UI component | Component | - | 3 | DEV | Test selection, keyboard nav, default state, disabled financing option |
| Installment schedule display component | Component | - | 3 | DEV | Test date formatting, amount display, status icons, mobile layout |
| Dashboard payment schedule view | E2E | R-010 | 1 | QA | View booking → verify schedule displays correctly → test mobile |
| Companion booking independent plans | E2E | R-011 | 1 | QA | Primary selects FULL, companion selects INSTALLMENT_4, verify independence |
| Date calculation edge cases | Unit | R-012 | 1 | DEV | Test leap year (Feb 29), timezone boundaries, DST transitions |

**Total P1**: 22 tests, 22 hours (1 hour per test avg)

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| Payment plan selector accessibility | Component | - | 4 | DEV | Test screen reader, keyboard nav, ARIA attributes, color contrast |
| Payment plan selector mobile responsiveness | Component | - | 3 | DEV | Test vertical stack on <768px, touch targets ≥48px, scroll behavior |
| Installment schedule mobile card layout | Component | - | 3 | DEV | Test card layout on mobile, readable amounts, status icons |
| Payment form installment display | Component | - | 2 | DEV | Test "First Installment" display, authorization text, help text |
| Payment form full payment display | Component | - | 2 | DEV | Test discount display, "Total due today" formatting |
| Booking review page payment options | E2E | - | 2 | QA | Test payment options section displays, integration with booking store |
| Dashboard booking list badges | Component | - | 2 | DEV | Test "Installment Plan" badge, "Paid in Full" badge, progress bar |
| Error handling: Stripe customer creation fails | API | - | 2 | DEV | Test fallback to FULL payment, user notification |
| Error handling: First payment declined | API | - | 2 | DEV | Test error message, allow retry, don't create booking |
| Error handling: Trip date changed < 70 days | API | - | 2 | DEV | Test revalidation, invalidate installment selection, show warning |
| Validation: Trip not selected | API | - | 2 | DEV | Test disabled installment option, error message |
| Validation: Payment method cannot be saved | API | - | 2 | DEV | Test prepaid card rejection, force FULL payment, error message |

**Total P2**: 28 tests, 14 hours (0.5 hours per test avg)

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Edge cases

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| Pricing summary discount display | Component | 2 | DEV | Test discount section shows in pricing summary, formatting |
| Booking confirmation email rendering | Component | 2 | QA | Test HTML email renders correctly in various email clients |
| Payment schedule display with different statuses | Component | 2 | DEV | Test PAID/PENDING/FAILED icons, color coding |
| Load testing: Multiple bookings with Stripe | PERF | 1 | QA | Test Stripe API rate limits, concurrent bookings |

**Total P3**: 7 tests, 3 hours (0.25-0.5 hours per test)

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Import installment calculator utility (30s)
- [ ] Calculate 50/25/15/10 split for $10,000 total (30s)
- [ ] Calculate 2% discount for $10,000 (30s)
- [ ] Render PaymentPlanSelector component without errors (1min)
- [ ] Render PaymentScheduleDisplay component without errors (1min)

**Total**: 5 scenarios, ~4 minutes

### P0 Tests (<10 min)

**Purpose**: Critical path validation - payment calculations and flows

- [ ] Unit: Installment calculation small amount ($10.00) (E2E)
- [ ] Unit: Installment calculation large amount ($15,385.67) (Unit)
- [ ] Unit: Installment sum equals exact total (Unit)
- [ ] Unit: 2% discount calculation accuracy (Unit)
- [ ] API: Stripe customer creation success (API)
- [ ] API: Stripe customer retry on failure (API)
- [ ] API: Atomic booking + payment creation (API)
- [ ] API: Rollback on payment failure (API)
- [ ] E2E: FULL payment flow with discount (E2E)
- [ ] E2E: INSTALLMENT_4 flow with 4 payment records (E2E)

**Total**: 10 scenarios, ~10 minutes (automated unit/API), ~20 minutes (E2E)

### P1 Tests (<30 min)

**Purpose**: Important feature coverage - validations, UI components, edge cases

- [ ] API: 70-day validation rejects 69 days (API)
- [ ] API: 70-day validation allows 70 days (API)
- [ ] API: 70-day validation allows 100 days (API)
- [ ] API: Gift booking disables installments (API)
- [ ] Component: Authorization checkbox required (Component)
- [ ] Component: Authorization checkbox ARIA labels (Component)
- [ ] API: Stripe timeout handling (API)
- [ ] API: Email with FULL plan shows discount (API)
- [ ] API: Email with INSTALLMENT_4 shows schedule (API)
- [ ] Component: Payment plan selector - selection (Component)
- [ ] Component: Payment plan selector - keyboard nav (Component)
- [ ] Component: Installment schedule - date formatting (Component)
- [ ] Component: Installment schedule - mobile layout (Component)
- [ ] E2E: Dashboard payment schedule displays (E2E)
- [ ] E2E: Companion booking independent plans (E2E)
- [ ] Unit: Date calculation leap year (Unit)

**Total**: 16 scenarios, ~30 minutes

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage - accessibility, mobile, error scenarios

- [ ] Component: Screen reader announces payment options (Component)
- [ ] Component: Keyboard navigation complete flow (Component)
- [ ] Component: Color contrast meets WCAG AA (Component)
- [ ] Component: Mobile vertical stack <768px (Component)
- [ ] Component: Touch targets ≥48px (Component)
- [ ] Component: Installment schedule mobile cards (Component)
- [ ] Component: Payment form installment display (Component)
- [ ] Component: Payment form full payment display (Component)
- [ ] E2E: Booking review page integration (E2E)
- [ ] Component: Dashboard badges display (Component)
- [ ] API: Error - Stripe customer creation fails (API)
- [ ] API: Error - First payment declined (API)
- [ ] API: Error - Trip date changed <70 days (API)
- [ ] API: Validation - Trip not selected (API)
- [ ] API: Validation - Payment method cannot be saved (API)
- [ ] Component: Pricing summary discount (Component)
- [ ] Component: Email rendering in clients (Component)
- [ ] Component: Payment schedule status icons (Component)
- [ ] PERF: Stripe API rate limits (PERF)

**Total**: 19 scenarios, ~60 minutes

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 15 | 2.0 | 30 | Complex setup, Stripe mocking, financial calculations |
| P1 | 22 | 1.0 | 22 | Standard coverage, component tests, validations |
| P2 | 28 | 0.5 | 14 | Simple scenarios, error paths, accessibility |
| P3 | 7 | 0.5 | 3 | Exploratory, edge cases, visual testing |
| **Total** | **72** | **-** | **69** | **~9 days** (assuming 1 engineer) |

### Prerequisites

**Test Data:**
- Booking factory with configurable payment plans (faker-based, auto-cleanup)
- Trip factory with configurable start dates (70+ days, <70 days)
- User factory for guest accounts
- Stripe test customer IDs and payment method tokens

**Tooling:**
- Vitest for unit tests (calculator functions)
- Playwright for E2E tests (payment flows, UI components)
- React Testing Library for component tests
- Stripe test mode and mock server
- @seontechnologies/playwright-utils (if configured)

**Environment:**
- Local dev environment with Stripe test keys
- Test database with clean state per test
- Email service mock (for confirmation emails)
- Date/time mocking (for trip date validations)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions - payment calculations must be exact)
- **P1 pass rate**: ≥95% (waivers required for failures, must document)
- **P2/P3 pass rate**: ≥90% (informational, track trends)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥80% (payment flows, calculations)
- **Security scenarios**: 100% (authorization, customer creation)
- **Business logic**: ≥70% (validations, rules)
- **Edge cases**: ≥50% (error handling, boundaries)

### Non-Negotiable Requirements

- [ ] All P0 tests pass (15/15)
- [ ] No high-risk (≥6) items unmitigated (4 risks addressed)
- [ ] Financial calculations verified exact (R-001)
- [ ] Stripe integration tested with mocks and test mode (R-002)
- [ ] 2% discount verified in UI, DB, and email (R-003)
- [ ] Atomic transactions tested with rollback (R-004)

---

## Mitigation Plans

### R-001: Installment Rounding Errors (Score: 9)

**Mitigation Strategy:**
1. Implement comprehensive unit tests covering:
   - Small amounts: $10.00 → [$5.00, $2.50, $1.50, $1.00]
   - Large amounts: $15,385.67 → [calculate and verify sum]
   - Odd totals: $10,003.47 → [verify last installment adjusts]
   - Extreme amounts: $0.04, $999,999.99
2. Add assertion in calculation function: `sum(installments) === total`
3. Use cents throughout (multiply by 100, round, adjust last installment)
4. Property-based testing: generate random amounts, verify sum always equals total

**Owner:** DEV
**Timeline:** Before release (Sprint 0)
**Status:** Planned
**Verification:** Run test suite, manual testing with edge case amounts

### R-002: Stripe Customer Creation Fails (Score: 6)

**Mitigation Strategy:**
1. Implement retry logic with exponential backoff:
   - First attempt fails → wait 1s → retry
   - Second attempt fails → wait 2s → retry
   - All retries fail → fall back to FULL payment
2. Show user-friendly error: "We couldn't set up installments. Please pay in full or try again."
3. Log failure to Sentry for monitoring
4. Test with Stripe mock server (simulate failures)

**Owner:** DEV
**Timeline:** Before release
**Status:** Planned
**Verification:** API tests with mocked Stripe failures, manual test with network interruption

### R-003: 2% Discount Not Applied Correctly (Score: 6)

**Mitigation Strategy:**
1. Unit tests for discount calculation function
2. E2E tests verifying discount in:
   - Payment plan selector UI (visual display)
   - Pricing summary component
   - Database booking record
   - Confirmation email
3. Test various amounts: $10, $100, $10,000, $15,385.67
4. Verify rounding: discount should round to nearest cent

**Owner:** QA
**Timeline:** Before release
**Status:** Planned
**Verification:** Automated test suite + manual testing with real Stripe test mode

### R-004: Non-Atomic Payment Records (Score: 6)

**Mitigation Strategy:**
1. Wrap booking + payment creation in database transaction:
   ```typescript
   await prisma.$transaction(async (tx) => {
     const booking = await tx.booking.create(...)
     const payments = await Promise.all([
       tx.payment.create(...),
       tx.payment.create(...),
       // ...
     ])
   })
   ```
2. Test rollback scenarios:
   - Payment record creation fails → booking not created
   - Stripe payment fails → booking + payments rolled back
3. Monitor database for orphaned records

**Owner:** DEV
**Timeline:** Before release
**Status:** Planned
**Verification:** API tests simulating failures, database inspection after failed attempts

---

## Assumptions and Dependencies

### Assumptions

1. Stripe test mode is available and configured with test API keys
2. Date-fns library is already integrated for date calculations
3. Existing Payment model supports installment tracking (isInstallment, installmentNumber fields)
4. Booking store (Zustand) is already implemented and testable
5. Email service supports template testing and mock mode
6. Trip dates in test data can be set programmatically (70+ days from today)

### Dependencies

1. Stripe test keys configured in `.env.local` - Required before P0 tests
2. Test database seeded with test data - Required before all tests
3. Email mock service operational - Required before P1 tests (email validation)
4. Date/time mocking library (e.g., MockDate or Vitest fake timers) - Required before date validation tests
5. Component testing setup (React Testing Library + Vitest) - Required before Component tests

### Risks to Plan

- **Risk**: Stripe test mode rate limits hit during test execution
  - **Impact**: Tests fail intermittently, CI/CD unreliable
  - **Contingency**: Use Stripe mock server (stripe-mock) instead of live test mode; cache test customer IDs

- **Risk**: Date/time mocking conflicts with date-fns library
  - **Impact**: Date calculation tests fail unpredictably
  - **Contingency**: Use dependency injection for date provider; mock at date-fns level

- **Risk**: 9 days test development exceeds sprint capacity
  - **Impact**: Tests incomplete at release
  - **Contingency**: Prioritize P0/P1 only for initial release; defer P2/P3 to post-release

---

## Follow-on Workflows (Manual)

After test design is approved, execute these workflows in order:

1. **Run `bmad:bmm:workflows:testarch-framework`** (if not done yet)
   - Initialize test framework architecture
   - Set up Playwright/Vitest configuration
   - Create fixture patterns

2. **Run `bmad:bmm:workflows:testarch-atdd`** (Acceptance Test-Driven Development)
   - Generate failing tests for P0 scenarios before implementation
   - Ensures tests are written before code (red-green-refactor)

3. **Implement feature** (Tasks 1-16 from story)
   - P0 tests should pass as implementation progresses

4. **Run `bmad:bmm:workflows:testarch-automate`** (after implementation)
   - Expand coverage to P1/P2/P3 tests
   - Automate remaining scenarios

5. **Run `bmad:bmm:workflows:testarch-trace`** (before release)
   - Generate requirements-to-tests traceability matrix
   - Validate coverage meets quality gate
   - Make PASS/CONCERNS/FAIL decision

6. **Run `bmad:bmm:workflows:testarch-ci`** (Sprint 0)
   - Set up CI/CD pipeline integration
   - Configure test execution order (smoke → P0 → P1)

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: __________ Date: __________
- [ ] Tech Lead: __________ Date: __________
- [ ] QA Lead: __________ Date: __________

**Comments:**

_[Space for approval comments and feedback]_

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework (6 categories, scoring)
- `probability-impact.md` - Risk scoring methodology (P × I matrix)
- `test-levels-framework.md` - Test level selection (E2E vs API vs Component vs Unit)
- `test-priorities-matrix.md` - P0-P3 prioritization criteria

### Related Documents

- **Story**: `_bmad-output/implementation/4-6-installment-payment-plans.md`
- **Epic**: E4 - Payment & Financial Management (Story 6)
- **Architecture**: `_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md`
- **Epics & Stories**: `_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md`

### Implementation Files (from story)

**Key Files:**
- `lib/utils/installment-calculator.ts` - Calculation utilities (50/25/15/10%, 2% discount)
- `lib/stripe/create-customer.ts` - Stripe customer creation with retry
- `components/booking/payment-plan-selector.tsx` - Payment option selector UI
- `components/booking/payment-schedule-display.tsx` - Installment schedule display
- `lib/trpc/server/routers/booking.ts` - Booking creation mutation with payment plans

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
**Date**: 2026-01-13

