# Roadmap: Pickleball Passport

## Milestones

- v1.0 MVP - Phases 1-4 (shipped 2026-01-26)
- v1.1 Gift Booking - Phases 5-7 (shipped 2026-01-27)
- v1.2 RLS Security - Phase 8 (shipped 2026-01-27)
- v1.3 Gift Enhancements - Phase 9 (shipped 2026-01-28)
- v2.0 Mobile App - Phases 10-14 (shipped 2026-01-28)
- v2.1 Communication & Content - Phases 15-17 (shipped 2026-01-30)
- v2.2 Security Hardening - Phase 18 (shipped 2026-02-01)
- v2.3 API Security - Phase 19 (shipped 2026-02-01)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-4) - SHIPPED 2026-01-26</summary>

See: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>v1.1 Gift Booking (Phases 5-7) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>v1.2 RLS Security (Phase 8) - SHIPPED 2026-01-27</summary>

See: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>v1.3 Gift Enhancements (Phase 9) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>v2.0 Mobile App (Phases 10-14) - SHIPPED 2026-01-28</summary>

See: `.planning/milestones/v2.0-ROADMAP.md`

</details>

<details>
<summary>v2.1 Communication & Content (Phases 15-17) - SHIPPED 2026-01-30</summary>

See: `.planning/milestones/v2.1-ROADMAP.md`

</details>

<details>
<summary>v2.2 Security Hardening (Phase 18) - SHIPPED 2026-02-01</summary>

See: `.planning/milestones/v2.2-ROADMAP.md`

</details>

---

### v2.3 API Security (SHIPPED 2026-02-01)

**Milestone Goal:** Harden public API endpoints with rate limiting, CSRF protection, and Content Security Policy headers to protect against abuse and injection attacks.

#### Phase 19: API Security
**Goal**: Public API endpoints are protected against abuse (rate limiting), cross-site request forgery (CSRF), and cross-site scripting (CSP headers)
**Depends on**: Phase 18 (existing middleware and logging infrastructure)
**Requirements**: SEC-05-01, SEC-05-02, SEC-05-03, SEC-05-04, SEC-05-05, SEC-06-01, SEC-06-02, SEC-06-03, SEC-06-04, SEC-07-01, SEC-07-02, SEC-07-03, SEC-07-04
**Success Criteria** (what must be TRUE):
  1. Unauthenticated endpoint returns 429 Too Many Requests after exceeding rate limit (with Retry-After header)
  2. Authenticated endpoint rate limits by user ID, not just IP (mobile app users on carrier NAT not blocked)
  3. Webhook endpoints (Stripe, SendGrid, Clerk, WhatsApp) process requests without rate limit blocks
  4. Cross-origin POST without proper Origin header returns 403 Forbidden
  5. Mobile app API calls succeed (Bearer token auth bypasses CSRF checks)
  6. Browser dev tools show CSP header on all pages (no console violations for Clerk, Stripe, Supabase)
**Plans**: 3 plans (2 waves)

**Wave Structure:**
- Wave 1: 19-01 (Rate Limiting - foundational)
- Wave 2: 19-02, 19-03 (CSRF + CSP - parallel, modify different files)

Plans:
- [x] 19-01-PLAN.md — Rate limiting middleware (SEC-05-01 through SEC-05-05)
- [x] 19-02-PLAN.md — CSRF protection and Origin validation (SEC-06-01 through SEC-06-04)
- [x] 19-03-PLAN.md — Content Security Policy headers (SEC-07-01 through SEC-07-04)

**Critical Pitfalls to Avoid (from research):**
- RL-C1: Exempt `/api/webhooks/*` and `/api/cron/*` from rate limiting
- RL-C2: Use userId as primary identifier for authenticated traffic (IP only for unauthenticated)
- CS-C2: Skip CSRF checks for `Authorization: Bearer` requests (mobile app)
- CSP-C2: Add `*.clerk.com`, `challenges.cloudflare.com` to CSP
- CSP-C3: Add `js.stripe.com`, `api.stripe.com`, `hooks.stripe.com` to CSP

---

## Progress

**Execution Order:** Phase 19

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-4 | v1.0 MVP | 9/9 | Complete | 2026-01-26 |
| 5-7 | v1.1 Gift | 8/8 | Complete | 2026-01-27 |
| 8 | v1.2 RLS | 2/2 | Complete | 2026-01-27 |
| 9 | v1.3 Gift Enhancements | 1/1 | Complete | 2026-01-28 |
| 10-14 | v2.0 Mobile | 22/22 | Complete | 2026-01-28 |
| 15-17 | v2.1 Communication | 3/3 | Complete | 2026-01-30 |
| 18 | v2.2 Security Hardening | 4/4 | Complete | 2026-02-01 |
| 19. API Security | v2.3 | 3/3 | Complete | 2026-02-01 |

---
*Roadmap updated: 2026-02-01*
*Milestone: v2.3 API Security — SHIPPED*
