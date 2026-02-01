# Requirements: v2.3 API Security

**Milestone:** v2.3 API Security
**Created:** 2026-02-01
**Source:** Research + Six Hats Council security audit follow-up
**Core Value:** Public API endpoints are protected against abuse, CSRF attacks, and XSS injection

## v2.3 Requirements

### Rate Limiting (SEC-05)

- [ ] **SEC-05-01**: Unauthenticated endpoints rate limited per IP address
  - Auth endpoints (login, signup, password reset): 10 requests/minute
  - Contact form: 5 requests/minute
  - Public API: 100 requests/minute
- [ ] **SEC-05-02**: Authenticated endpoints rate limited per user ID
  - Booking mutations: 20 requests/minute
  - General API: 200 requests/minute
- [ ] **SEC-05-03**: Webhook endpoints exempted from rate limiting
  - /api/webhooks/stripe
  - /api/webhooks/sendgrid
  - /api/webhooks/clerk
  - /api/webhooks/whatsapp
- [ ] **SEC-05-04**: Rate limit responses include X-RateLimit headers
  - X-RateLimit-Limit: max requests allowed
  - X-RateLimit-Remaining: requests remaining
  - X-RateLimit-Reset: seconds until reset
- [ ] **SEC-05-05**: Rate limited requests return 429 Too Many Requests with retry-after

### CSRF Protection (SEC-06)

- [ ] **SEC-06-01**: Middleware validates Origin header matches allowed origins
  - Production: pickleballpassport.com, app.pickleballpassport.com
  - Preview: *.vercel.app
  - Development: localhost:3000
- [ ] **SEC-06-02**: tRPC Content-Type validation verified active
  - Rejects requests without application/json Content-Type
  - Blocks form-based CSRF attacks
- [ ] **SEC-06-03**: CSRF validation skipped for Bearer token requests
  - Mobile app uses Authorization header, not cookies
  - Prevents false positives on mobile API calls
- [ ] **SEC-06-04**: Webhook endpoints exempted from CSRF validation
  - Same paths as SEC-05-03
  - Webhooks use signature verification instead

### Content Security Policy (SEC-07)

- [ ] **SEC-07-01**: Static CSP headers configured in next.config.ts
  - No nonce-based CSP (preserves static rendering)
  - Applied to all pages
- [ ] **SEC-07-02**: Third-party domains whitelisted
  - Clerk: *.clerk.com, *.clerk.dev, challenges.cloudflare.com
  - Stripe: js.stripe.com, api.stripe.com, hooks.stripe.com
  - Supabase: *.supabase.co (storage)
  - Google: *.google.com (reCAPTCHA if used)
- [ ] **SEC-07-03**: CSP deployed in Report-Only mode first
  - Content-Security-Policy-Report-Only header
  - Monitor for violations before enforcement
- [ ] **SEC-07-04**: CSP enforced after validation period
  - Switch from Report-Only to Content-Security-Policy
  - All pages render without CSP errors

## Success Criteria

**v2.3 is complete when ALL are TRUE:**

1. Unauthenticated endpoint returns 429 after exceeding rate limit
2. Authenticated endpoint rate limits by user ID, not IP
3. Webhook endpoints process requests without rate limit blocks
4. X-RateLimit headers present on all API responses
5. Cross-origin POST without proper Origin header returns 403
6. Mobile app API calls succeed (Bearer token auth)
7. Browser dev tools show CSP header on all pages
8. No CSP violations in console for Clerk, Stripe, Supabase features
9. Security penetration test finds 0 critical vulnerabilities

## Future Requirements

Deferred to v2.4 or later:

### Security Enhancements (P2)
- **SEC-08**: Security audit logging to external SIEM
- **SEC-09**: Admin dashboard showing rate limit violations
- **SEC-10**: CSP violation reporting endpoint
- **SEC-11**: Graduated rate limiting (slow down before block)

### Communication (P2)
- **COMM-04**: Email preference management
- **COMM-05**: Broadcast messaging
- **COMM-06**: NPS surveys

## Out of Scope

| Feature | Reason |
|---------|--------|
| WAF-level blocking | Vercel/Cloudflare handle this at edge |
| IP reputation service | Over-engineering for current scale |
| Manual CSRF tokens | Clerk + tRPC handle this automatically |
| Nonce-based CSP | Forces dynamic rendering, breaks static optimization |
| Global IP blocking | False positives from NAT/CGNAT |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-05-01 | Phase 19 | Pending |
| SEC-05-02 | Phase 19 | Pending |
| SEC-05-03 | Phase 19 | Pending |
| SEC-05-04 | Phase 19 | Pending |
| SEC-05-05 | Phase 19 | Pending |
| SEC-06-01 | Phase 19 | Pending |
| SEC-06-02 | Phase 19 | Pending |
| SEC-06-03 | Phase 19 | Pending |
| SEC-06-04 | Phase 19 | Pending |
| SEC-07-01 | Phase 19 | Pending |
| SEC-07-02 | Phase 19 | Pending |
| SEC-07-03 | Phase 19 | Pending |
| SEC-07-04 | Phase 19 | Pending |

**Coverage:**
- v2.3 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-01*
*Source: API Security research synthesis*
