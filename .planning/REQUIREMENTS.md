# Requirements: Pickleball Passport Phase 1 MVP Completion

**Project:** Pickleball Passport
**Milestone:** Phase 1 MVP — Go-to-Market Readiness
**Created:** 2026-01-26
**Source:** User scoping session + research synthesis

---

## v1 Requirements

### Security (SEC)

- [ ] **SEC-01**: Admin can only access admin routes when authenticated with ADMIN role via Clerk middleware
- [ ] **SEC-02**: Non-admin users are redirected to dashboard when attempting to access admin routes
- [ ] **SEC-03**: SendGrid webhook endpoint verifies signatures using official @sendgrid/eventwebhook SDK
- [ ] **SEC-04**: Email token HMAC uses required environment secret with no fallback in production
- [ ] **SEC-05**: Document upload page uses authenticated user ID instead of hardcoded test ID
- [ ] **SEC-06**: Partner bank account data fields removed from database in favor of Stripe Connect exclusive

### Payment (PAY)

- [ ] **PAY-01**: Guest receives email notification when initial checkout payment fails
- [ ] **PAY-02**: Guest can update payment method from dashboard when installment payment fails
- [ ] **PAY-03**: Payment method update modal integrates with Stripe for secure card replacement
- [ ] **PAY-04**: Failed payment email includes direct link to update payment method

### Partner Portal (PTR)

- [ ] **PTR-01**: Partner dashboard displays real-time referral count and conversion data
- [ ] **PTR-02**: Partner dashboard shows pending vs available commission balance
- [ ] **PTR-03**: Partner can copy their referral link with one-click copy button
- [ ] **PTR-04**: Referral link includes UTM parameters for tracking

### Email System (EML)

- [ ] **EML-01**: Guest receives email notification when booking is cancelled
- [ ] **EML-02**: Booking cancellation email uses existing template with booking details

### Data Integrity (DAT)

- [ ] **DAT-01**: Trip capacity is checked atomically during payment confirmation
- [ ] **DAT-02**: Overbooking is prevented by rejecting payment confirmation when capacity exceeded
- [ ] **DAT-03**: Admin receives alert when overbooking would have occurred (logged + notification)

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
| SEC-01 | TBD | TBD | Pending |
| SEC-02 | TBD | TBD | Pending |
| SEC-03 | TBD | TBD | Pending |
| SEC-04 | TBD | TBD | Pending |
| SEC-05 | TBD | TBD | Pending |
| SEC-06 | TBD | TBD | Pending |
| PAY-01 | TBD | TBD | Pending |
| PAY-02 | TBD | TBD | Pending |
| PAY-03 | TBD | TBD | Pending |
| PAY-04 | TBD | TBD | Pending |
| PTR-01 | TBD | TBD | Pending |
| PTR-02 | TBD | TBD | Pending |
| PTR-03 | TBD | TBD | Pending |
| PTR-04 | TBD | TBD | Pending |
| EML-01 | TBD | TBD | Pending |
| EML-02 | TBD | TBD | Pending |
| DAT-01 | TBD | TBD | Pending |
| DAT-02 | TBD | TBD | Pending |
| DAT-03 | TBD | TBD | Pending |

---

*Requirements defined: 2026-01-26*
*Total v1 requirements: 19*
*Categories: Security (6), Payment (4), Partner (4), Email (2), Data Integrity (3)*
