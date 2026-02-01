# Roadmap: Pickleball Passport

## Milestones

- ✅ **v1.0 MVP** - Phases 1-4 (shipped 2026-01-26)
- ✅ **v1.1 Gift Booking** - Phases 5-7 (shipped 2026-01-27)
- ✅ **v1.2 RLS Security** - Phase 8 (shipped 2026-01-27)
- ✅ **v1.3 Gift Enhancements** - Phase 9 (shipped 2026-01-28)
- ✅ **v2.0 Mobile App** - Phases 10-14 (shipped 2026-01-28)
- ✅ **v2.1 Communication & Content** - Phases 15-17 (shipped 2026-01-30)
- ✅ **v2.2 Security Hardening** - Phase 18 (shipped 2026-02-01)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-26</summary>

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Gift Booking (Phases 5-7) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 RLS Security (Phase 8) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Gift Enhancements (Phase 9) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v2.0 Mobile App (Phases 10-14) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v2.0-ROADMAP.md`

</details>

### ✅ v2.1 Communication & Content (Complete)

**Milestone Goal:** Operators can communicate with guests throughout the trip lifecycle via automated email sequences, urgent SMS notifications, and curated testimonials.

#### Phase 15: Email Infrastructure
**Goal**: Guests receive post-trip follow-up emails at key moments (COMM-01 and COMM-02 already implemented)
**Depends on**: Phase 14 (existing SendGrid integration)
**Requirements**: COMM-01 (existing), COMM-02 (existing), COMM-03 (to implement)
**Success Criteria** (what must be TRUE):
  1. Guest receives payment reminder email 7 days before scheduled installment (COMM-01 - existing)
  2. Guest receives pre-trip emails at 60/30/14/7/1 days before departure (COMM-02 - existing)
  3. Guest receives post-trip emails at 3/7/14/30/60 days after return (COMM-03 - this phase)
  4. Scheduled email jobs run reliably via cron or queue system
  5. Post-trip emails respect user notification preferences
**Plans**: 1 plan

Plans:
- [x] 15-01-PLAN.md — Post-trip follow-up email sequence (COMM-03)

#### Phase 16: SMS Integration
**Goal**: Guests receive urgent SMS notifications for time-sensitive updates
**Depends on**: Phase 15
**Requirements**: SMS-01, SMS-02
**Success Criteria** (what must be TRUE):
  1. System can send SMS via Twilio (infrastructure works)
  2. Guest receives SMS for flight delays within minutes of notification
  3. Guest receives SMS for urgent itinerary changes
  4. Guest receives SMS for emergency broadcasts
  5. Admin can trigger urgent SMS from admin panel
**Plans**: 1 plan

Plans:
- [x] 16-01-PLAN.md — Complete SMS admin procedures and integrate UI

#### Phase 17: Testimonial Workflow
**Goal**: Guests can share their transformation stories, admin can curate content, website displays approved testimonials
**Depends on**: Phase 16
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Guest can submit testimonial (video URL, written text, or photo) via web or mobile
  2. Admin can view pending testimonials in admin panel
  3. Admin can approve, reject, or request edits on testimonials
  4. Approved testimonials display on public testimonials page
  5. Testimonial submission links to existing booking/guest record
**Plans**: 1 plan

Plans:
- [x] 17-01-PLAN.md — Verify testimonial workflow integration and complete file uploads

## Progress

**Execution Order:** Phases 15 → 16 → 17

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-4 | v1.0 MVP | 9/9 | Complete | 2026-01-26 |
| 5-7 | v1.1 Gift | 8/8 | Complete | 2026-01-27 |
| 8 | v1.2 RLS | 2/2 | Complete | 2026-01-27 |
| 9 | v1.3 Gift Enhancements | 1/1 | Complete | 2026-01-28 |
| 10-14 | v2.0 Mobile | 22/22 | Complete | 2026-01-28 |
| 15. Email Infrastructure | v2.1 | 1/1 | Complete | 2026-01-30 |
| 16. SMS Integration | v2.1 | 1/1 | Complete | 2026-01-30 |
| 17. Testimonial Workflow | v2.1 | 1/1 | Complete | 2026-01-30 |

---

### ✅ v2.2 Security Hardening (Complete)

**Milestone Goal:** Fix critical security vulnerabilities identified by Six Hats Council codebase review before onboarding paying customers.

#### Phase 18: Security Hardening
**Goal**: Close critical security holes identified by research: console.log audit (SEC-04), admin 403 responses (SEC-01), and verify existing webhook/encryption implementations (SEC-02, SEC-03)
**Depends on**: Phase 17 (current production state)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):
  1. Admin routes reject non-admin users with 403 Forbidden (SEC-01)
  2. Bank account numbers encrypted at rest, never exposed in logs (SEC-02 - verified complete)
  3. Stripe webhooks verify signature before processing (SEC-03 - verified complete)
  4. SendGrid webhooks verify signature before processing (SEC-03 - verified complete)
  5. No console.log statements containing sensitive data in production (SEC-04)
  6. Security audit passes with 0 critical findings
**Plans**: 4 plans

Plans:
- [x] 18-01-PLAN.md — Console.log audit and Pino migration (SEC-04) + PII redaction + ESLint enforcement
- [x] 18-02-PLAN.md — Cron job logging migration to structured pino (SEC-04)
- [x] 18-03-PLAN.md — Admin 403 responses (SEC-01) + SEC-02/SEC-03 verification
- [x] 18-04-PLAN.md — Gap closure: remaining console.log migration (SEC-04)

**Details:**
Based on 18-RESEARCH.md findings:
- **SEC-04 (HIGHEST PRIORITY)**: 485+ console.log statements across 123 files; pino infrastructure exists but not consistently used
- **SEC-01 (HIGH PRIORITY)**: Middleware redirects unauthorized users instead of returning 403 for API routes
- **SEC-02 (COMPLETE)**: PartnerPayoutMethod removed in Phase 01; Stripe Connect handles all bank data
- **SEC-03 (COMPLETE)**: Both Stripe and SendGrid webhooks already verify signatures

**Wave Structure:**
- Wave 1: 18-01 and 18-02 (parallel - independent logging migrations)
- Wave 2: 18-03 (depends on 18-01 for authLogger availability)

---

## Progress

**Execution Order:** Phase 18

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-4 | v1.0 MVP | 9/9 | Complete | 2026-01-26 |
| 5-7 | v1.1 Gift | 8/8 | Complete | 2026-01-27 |
| 8 | v1.2 RLS | 2/2 | Complete | 2026-01-27 |
| 9 | v1.3 Gift Enhancements | 1/1 | Complete | 2026-01-28 |
| 10-14 | v2.0 Mobile | 22/22 | Complete | 2026-01-28 |
| 15-17 | v2.1 Communication | 3/3 | Complete | 2026-01-30 |
| 18. Security Hardening | v2.2 | 4/4 | Complete | 2026-02-01 |

---
*Roadmap updated: 2026-02-01*
*Milestone: v2.2 Security Hardening — SHIPPED*
