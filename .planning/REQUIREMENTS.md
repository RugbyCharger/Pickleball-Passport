# Requirements: v2.2 Security Hardening

**Milestone:** v2.2 Security Hardening
**Created:** 2026-01-31
**Source:** Six Hats Council codebase review (Black Hat analysis)
**Core Value:** Platform is secure enough for paying customers and partner financial data

## v2.2 Requirements

### Authentication & Authorization (CRITICAL)

- [x] **SEC-01**: Admin routes reject non-admin users with 403 Forbidden
  - All `/dashboard/admin/*` pages check user role via middleware
  - All tRPC admin procedures validate admin role
  - Unauthorized access logged for security audit via authLogger

### Data Encryption (CRITICAL)

- [x] **SEC-02**: Partner bank account data encrypted at rest
  - Verified: No plaintext bank fields in database
  - Stripe Connect handles all partner payout data externally
  - PII auto-redacted in logs via pino redaction paths

### Webhook Security (CRITICAL)

- [x] **SEC-03**: Webhook endpoints verify signatures before processing
  - Stripe webhooks validate `stripe-signature` header via verifyWebhookSignature
  - SendGrid webhooks validate signature via official SDK
  - Invalid signatures rejected with 400/401
  - Signature failures logged for security monitoring

### Production Hygiene (HIGH)

- [x] **SEC-04**: No sensitive data in console.log statements
  - All API route console.log statements migrated to pino structured logging
  - PII fields (email, phone, accountNumber, ssn, cardNumber) auto-redacted
  - ESLint no-console rule enforced at error level

## Success Criteria

**Phase 18 is complete when ALL are TRUE:**

1. Any non-admin user accessing `/dashboard/admin/*` gets redirected to unauthorized page
2. `prisma studio` shows encrypted (unreadable) values for bank account fields
3. Forged Stripe webhook (missing signature) returns 400 error
4. `grep -r "console.log" src/` returns 0 matches in production paths (or all are redacted)
5. Security penetration test by Claude finds 0 critical vulnerabilities

## Previous v2.1 Requirements (Archived)

See: `.planning/milestones/v2.1-REQUIREMENTS.md` (to be archived after v2.2 ships)

### Email Sequences (Complete)
- [x] **COMM-01**: Payment reminder emails
- [x] **COMM-02**: Pre-trip nurture sequence
- [x] **COMM-03**: Post-trip follow-up emails

### SMS Notifications (Complete)
- [x] **SMS-01**: Twilio integration
- [x] **SMS-02**: Urgent update SMS

### Testimonial Workflow (Complete)
- [x] **TEST-01**: Testimonial submission
- [x] **TEST-02**: Admin review workflow
- [x] **TEST-03**: Public display

## Future Requirements

Deferred to v2.3 or later:

### Security Enhancements (P2)
- **SEC-05**: Rate limiting on all public endpoints
- **SEC-06**: CSRF protection on mutation endpoints
- **SEC-07**: Content Security Policy headers
- **SEC-08**: Security audit logging to external SIEM

### Communication (P2) - From v2.1
- **COMM-04**: Email preference management
- **COMM-05**: Broadcast messaging
- **COMM-06**: NPS surveys

## Out of Scope

| Feature | Reason |
|---------|--------|
| SOC 2 compliance | Too early, requires audit process |
| PCI DSS Level 1 | Stripe handles card data, we don't store it |
| HIPAA compliance | Not handling medical records |
| Bug bounty program | Need stable security baseline first |

## Traceability

| Requirement | Phase | Plan | Status |
|-------------|-------|------|--------|
| SEC-01 | Phase 18 | 18-03-PLAN.md | Complete |
| SEC-02 | Phase 18 | 18-03-PLAN.md | Complete (verified) |
| SEC-03 | Phase 18 | 18-03-PLAN.md | Complete (verified) |
| SEC-04 | Phase 18 | 18-01, 18-02, 18-04 | Complete |

**Coverage:**
- v2.2 requirements: 4 total
- Complete: 4 ✓
- Incomplete: 0 ✓

---
*Requirements defined: 2026-01-31*
*Requirements completed: 2026-02-01*
*Source: Six Hats Council Black Hat analysis*
