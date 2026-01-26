# Requirements: Pickleball Passport Phase 1 MVP Completion

**Project:** Pickleball Passport
**Milestone:** Phase 1 MVP — Go-to-Market Readiness
**Created:** 2026-01-26
**Source:** User scoping session + research synthesis

---

## v1 Requirements

### Security (SEC)

- [x] **SEC-01**: Admin can only access admin routes when authenticated with ADMIN role via Clerk middleware
- [x] **SEC-02**: Non-admin users are redirected to dashboard when attempting to access admin routes
- [x] **SEC-03**: SendGrid webhook endpoint verifies signatures using official @sendgrid/eventwebhook SDK
- [x] **SEC-04**: Email token HMAC uses required environment secret with no fallback in production
- [x] **SEC-05**: Document upload page uses authenticated user ID instead of hardcoded test ID
- [x] **SEC-06**: Partner bank account data fields removed from database in favor of Stripe Connect exclusive

### Payment (PAY)

- [x] **PAY-01**: Guest receives email notification when initial checkout payment fails
- [x] **PAY-02**: Guest can update payment method from dashboard when installment payment fails
- [x] **PAY-03**: Payment method update modal integrates with Stripe for secure card replacement
- [x] **PAY-04**: Failed payment email includes direct link to update payment method

### Partner Portal (PTR)

- [x] **PTR-01**: Partner dashboard displays real-time referral count and conversion data
- [x] **PTR-02**: Partner dashboard shows pending vs available commission balance
- [x] **PTR-03**: Partner can copy their referral link with one-click copy button
- [x] **PTR-04**: Referral link includes UTM parameters for tracking

### Email System (EML)

- [ ] **EML-01**: Guest receives email notification when booking is cancelled
- [ ] **EML-02**: Booking cancellation email uses existing template with booking details

### Data Integrity (DAT)

- [x] **DAT-01**: Trip capacity is checked atomically during payment confirmation
- [x] **DAT-02**: Overbooking is prevented by rejecting payment confirmation when capacity exceeded
- [x] **DAT-03**: Admin receives alert when overbooking would have occurred (logged + notification)

---

## v2 Requirements (Deferred)

### Security
- [ ] SendGrid webhook verification — deferred (user selected admin route protection only)
- [ ] Email token rate limiting — deferred to post-launch
- [ ] Admin action audit logging — nice to have for operations

### Payment Flow
- [ ] Admin failed payment queue view — operational polish
- [ ] Dunning sequence (3-email progressive reminders) — post-launch optimization
- [ ] Network tokenization (4-6% approval improvement) — future enhancement

### Partner Portal
- [ ] Payout request flow — partners can request payouts
- [ ] Attribution visibility (click-to-conversion funnel) — post-launch analytics
- [ ] Custom referral codes — nice to have
- [ ] Marketing materials library — v2 feature

### Email System
- [ ] Admin alert - overbooking — deferred (overbooking prevention takes priority)
- [ ] Admin alert - disputes — post-launch monitoring
- [ ] Booking modification email — nice to have
- [ ] Email queue with retry logic — infrastructure improvement

### Infrastructure
- [ ] Webhook idempotency (Redis locks) — post-launch hardening
- [ ] Email background processing queue — operational improvement

---

## Out of Scope

### Explicitly Excluded
- **Mobile app (E6, E7, E8)** — Deferred to Phase 2; web app sufficient for MVP launch
- **Gift booking system** — Deprioritized per user; existing implementation can remain dormant
- **SMS notifications** — Twilio stubs exist but not required for launch
- **Dynamic pricing per trip** — Hardcoded pricing acceptable for first trips
- **Court booking system** — Mobile-only feature, out of scope

### Anti-Features (Don't Build)
- **ACH/bank transfer payments** — Complexity doesn't fit trip booking timeline
- **Cryptocurrency payments** — Low demand in 55+ demographic
- **Multi-level affiliate (MLM)** — Complexity, legal concerns
- **Partner custom landing pages** — Too much support burden
- **Complex refund rules engine** — Manual via Stripe dashboard sufficient

---

## Traceability

| REQ-ID | Phase | Plan | Status |
|--------|-------|------|--------|
| SEC-01 | 1 | 01-01 | Complete |
| SEC-02 | 1 | 01-01 | Complete |
| SEC-03 | 1 | 01-02 | Complete |
| SEC-04 | 1 | 01-02 | Complete |
| SEC-05 | 1 | 01-03 | Complete |
| SEC-06 | 1 | 01-03 | Complete |
| PAY-01 | 2 | 02-01 | Complete |
| PAY-02 | 2 | 02-02 | Complete |
| PAY-03 | 2 | 02-02 | Complete |
| PAY-04 | 2 | 02-01 | Complete |
| PTR-01 | 3 | 03-01 | Complete |
| PTR-02 | 3 | 03-01 | Complete |
| PTR-03 | 3 | 03-02 | Complete |
| PTR-04 | 3 | 03-02 | Complete |
| EML-01 | 4 | 04-01 | Pending |
| EML-02 | 4 | 04-01 | Pending |
| DAT-01 | 2 | 02-03 | Complete |
| DAT-02 | 2 | 02-03 | Complete |
| DAT-03 | 2 | 02-03 | Complete |

---

*Requirements defined: 2026-01-26*
*Total v1 requirements: 19*
*Categories: Security (6), Payment (4), Partner (4), Email (2), Data Integrity (3)*
*Coverage: 19/19 requirements mapped to phases*
