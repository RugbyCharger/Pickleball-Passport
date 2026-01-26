# Project Research Summary

**Project:** Pickleball Passport
**Domain:** Luxury travel booking platform (pickleball + medical tourism + wellness)
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

Pickleball Passport is a luxury travel booking platform with a sophisticated existing codebase that is approximately 85% complete. The platform handles high-value transactions ($15K-25K packages) with 4-payment installment plans and a partner referral program with commission payouts. Research across security, features, architecture, and pitfalls reveals that the critical gaps are concentrated in three areas: (1) security hardening for admin routes, webhooks, and data encryption; (2) payment failure recovery and customer self-service flows; and (3) partner portal completion.

The recommended approach is a phased go-to-market readiness effort. First, address critical security vulnerabilities (admin middleware, SendGrid webhook verification, Next.js CVE patch). Second, complete payment failure handling with customer-facing retry flows and admin visibility. Third, finish the partner portal with working dashboards and referral tracking. The existing Stripe and Clerk integrations provide solid foundations, but defense-in-depth patterns and proper state machine formalization are needed.

Key risks center on revenue loss from unhandled payment failures, security exposure from middleware gaps (CVE-2025-29927), and partner trust erosion from incomplete attribution and payout flows. Mitigation requires immediate attention to the pre-launch blockers identified across all research files, particularly the P0 security items and payment recovery infrastructure.

## Key Findings

### Recommended Stack

The existing stack (Next.js 15+, Prisma, Clerk, Stripe, SendGrid, Supabase) is well-chosen for a luxury travel booking platform. Research focused on security hardening patterns rather than stack changes.

**Core technologies (already in place):**
- **Clerk + clerkMiddleware:** Authentication and authorization - needs middleware upgrade for route protection
- **Stripe + Connect:** Payments and partner payouts - solid foundation, needs state machine formalization
- **SendGrid + @sendgrid/eventwebhook:** Email delivery - needs official SDK for webhook verification
- **Upstash Redis:** Distributed locks and email queue - needed for webhook idempotency and reliability

**Critical additions needed:**
- **AES-256-GCM encryption:** Field-level encryption for bank account data (or remove in favor of Stripe Connect only)
- **Data Access Layer (DAL):** Defense-in-depth pattern for role verification beyond middleware

### Expected Features

**Must have (table stakes - launch blockers):**
- Admin role enforcement on all admin routes
- SendGrid webhook signature verification (production)
- Encrypted partner bank account data (or Stripe Connect exclusive)
- Failed payment customer email (initial checkout)
- Booking cancellation email wiring
- Working partner dashboard with real data
- Referral link copy UI for partners

**Should have (critical for operations):**
- Customer-facing payment method update flow
- Admin failed payment queue view
- Overbooking admin alerts (not just logs)
- Partner payout request flow completion
- Rate limiting on email token verification

**Defer (v2+):**
- Network tokenization (4-6% higher approval rates)
- Marketing materials library for partners
- Custom referral codes
- Multi-level affiliate features
- Complex refund rules engine

### Architecture Approach

The codebase has solid foundations but needs formalization in payment state management, webhook idempotency, and email reliability. The recommended architecture adds: (1) a payment state machine with explicit transitions and audit logging; (2) Redis-based distributed locks for webhook processing; (3) an email queue with retry logic for non-critical notifications.

**Major components:**
1. **Admin Protection Layer** - clerkMiddleware + DAL for defense-in-depth role verification
2. **Payment State Machine** - Formalized state transitions (PENDING -> CHARGING -> PAID/FAILED_RETRYABLE/FAILED_PERMANENT)
3. **Webhook Idempotency System** - Redis distributed locks + DB event tracking to prevent double-processing
4. **Email Queue** - Redis Streams for reliable email delivery with retry logic
5. **Partner Payout Processor** - Batch processing cron for Stripe Connect transfers

### Critical Pitfalls

1. **P0: Admin route protection missing** - Middleware is no-op, per-page checks are inconsistent. Fix with clerkMiddleware + createRouteMatcher. CVE-2025-29927 requires Next.js 15.2.3+ upgrade.

2. **P0: SendGrid webhook vulnerable** - Manual ECDSA verification is fragile. Switch to official @sendgrid/eventwebhook package with proper signature validation.

3. **P1: Installment payment failures without recovery** - Current retry logic exists but no customer self-service card update flow, no admin visibility queue. 42% of businesses lose revenue to preventable payment failures.

4. **P1: Overbooking race conditions** - Capacity check is not atomic with payment confirmation. Current code logs error but continues processing. Implement pessimistic locking or reservation system.

5. **P1: Commission attribution disputes** - Cookie-based tracking is fragile across devices and sessions. Need server-side session storage and visible click-to-conversion funnel for partners.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Security Hardening
**Rationale:** Security gaps are launch blockers. CVE-2025-29927 is actively exploitable. Admin routes without protection expose all customer data.
**Delivers:** Protected admin routes, verified webhooks, encrypted sensitive data, secure tokens
**Addresses:** P0 security items (admin auth, webhook verification, data encryption)
**Avoids:** S1 (Admin Auth Weakness), S2 (SendGrid Webhook), P5 (Webhook Idempotency)

**Specific tasks:**
- Upgrade Next.js to 15.2.3+ (CVE patch)
- Implement clerkMiddleware with createRouteMatcher
- Add DAL layer with requireAdmin/requirePartner
- Switch SendGrid webhook to official SDK
- Implement AES-256-GCM field encryption OR remove local bank storage
- Add rate limiting to email token verification

### Phase 2: Payment Recovery
**Rationale:** Revenue is at risk without payment failure handling. Guests cannot self-service fix failed payments. Admin has no visibility into stuck payments.
**Delivers:** Complete payment failure flow from detection to recovery
**Addresses:** Payment flow gaps (failed payment email, retry UI, admin queue)
**Avoids:** P1 (Installment Failures), P2 (3DS Failures), P4 (Partial Payment Disputes)

**Specific tasks:**
- Build customer payment method update modal with Stripe Customer Portal
- Wire failed payment email to initial checkout failures (not just installments)
- Create admin failed payment queue view with one-click retry
- Formalize payment state machine with audit logging
- Implement dunning sequence (3-email progressive urgency)
- Add Stripe webhook timestamp validation

### Phase 3: Webhook Reliability
**Rationale:** Webhook idempotency gaps cause duplicate processing, double emails, and potential overbooking. Current pattern has race conditions.
**Delivers:** Bulletproof webhook processing with distributed locks and idempotent operations
**Implements:** Webhook Idempotency System from ARCHITECTURE.md
**Avoids:** P3 (Overbooking), P5 (Webhook Idempotency)

**Specific tasks:**
- Implement Redis distributed lock for webhook acquisition
- Add idempotency keys to all webhook-triggered operations
- Fix overbooking: atomic capacity increment with SELECT FOR UPDATE
- Mark webhook as processing BEFORE operations, not after
- Add idempotency to SendGrid webhooks

### Phase 4: Partner Portal Completion
**Rationale:** Partners drive distribution. Incomplete portal means no effective referral program. Trust erodes without attribution visibility.
**Delivers:** Fully functional partner experience from signup to payout
**Addresses:** Partner portal features (dashboard, referral tracking, payouts)
**Avoids:** PP1 (Attribution Disputes), PP2 (Connect Onboarding), PP3 (Tier Calculation)

**Specific tasks:**
- Complete partner dashboard with real-time referral data
- Add referral link copy button with UTM parameters
- Build visible click-to-conversion funnel for partners
- Complete Stripe Connect onboarding reminder flow
- Implement payout hold period (30 days post-trip)
- Add tier audit trail and admin override capability

### Phase 5: Email & Operations
**Rationale:** Reliable email is table stakes. Pre-trip sequences prevent no-shows. Admin notifications prevent revenue loss.
**Delivers:** Complete email infrastructure with queue, retry, and monitoring
**Implements:** Email Queue Architecture from ARCHITECTURE.md
**Avoids:** O1 (Support Escalation), O2 (Admin Notifications), O5 (Pre-Trip Emails)

**Specific tasks:**
- Implement Redis Streams email queue for non-critical emails
- Wire booking cancellation email template
- Verify admin alert email delivery end-to-end
- Complete pre-trip email sequence cron job
- Add email delivery monitoring dashboard
- Define and implement support SLAs with trip-proximity escalation

### Phase Ordering Rationale

- **Security first:** Cannot launch with exploitable vulnerabilities. P0 items must be resolved before any paying customer.
- **Payment before partners:** Revenue infrastructure must work before optimizing distribution. Failed payments cause direct revenue loss.
- **Webhooks before partners:** Partner attribution depends on reliable webhook processing for booking confirmation events.
- **Partners before email optimization:** Partner portal is table stakes for distribution; email queue is operational polish.
- **Operations last:** SLAs and monitoring are post-launch refinements once core flows work.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Payment Recovery):** May need research on Stripe Customer Portal integration specifics and 3DS2 handling for high-value transactions
- **Phase 4 (Partner Portal):** Commission attribution edge cases (device switching, cookie expiration) may need additional UX research

Phases with standard patterns (skip research-phase):
- **Phase 1 (Security):** Well-documented Clerk middleware patterns, official SDK for SendGrid
- **Phase 3 (Webhooks):** Standard Redis distributed lock pattern, Upstash documentation is comprehensive
- **Phase 5 (Email):** Redis Streams email queue is established pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against Clerk docs, Next.js 15+ security guidance, NIST 2025 standards |
| Features | HIGH | Codebase analysis shows explicit TODOs, cross-referenced with industry standards |
| Architecture | HIGH | Patterns verified against Stripe webhook best practices, Upstash documentation |
| Pitfalls | HIGH | Multiple authoritative sources (Stripe, PCI DSS 4.0, industry reports), codebase confirms gaps |

**Overall confidence:** HIGH

### Gaps to Address

- **3DS2 handling for high-value charges:** Current implementation may need explicit 3DS2 flow for $15K+ international transactions. Validate during Phase 2 planning.
- **Partial payment dispute policy:** Legal/terms question not resolvable through code research. Need business decision on dispute = cancellation policy.
- **Partner tier calculation timing:** Rolling period not clearly defined in codebase. Need business decision on qualification window.
- **Support SLA definition:** Operational decision needed on response time targets. Research suggests 4hr urgent / 24hr standard for luxury travel.

## Sources

### Primary (HIGH confidence)
- [Clerk Middleware Documentation](https://clerk.com/docs/reference/nextjs/clerk-middleware) - Route protection patterns
- [Next.js Authentication Guide](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/authentication.mdx) - DAL pattern, CVE-2025-29927
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices) - Idempotency, signature verification
- [SendGrid Event Webhook Security](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/getting-started-event-webhook-security-features) - Official SDK usage
- [NIST 2025 Encryption Standards](https://trainingcamp.com/articles/encryption-best-practices-2025-complete-guide-to-data-protection-standards-and-implementation/) - AES-256-GCM patterns

### Secondary (MEDIUM confidence)
- [Payrails Hospitality Payment Report 2025](https://www.payrails.com/blog/hospitality-payment-report) - Network tokenization approval rates
- [The Lost Booking Problem](https://thepaymentsassociation.org/article/the-lost-booking-problem-how-payment-friction-kills-travel-conversions/) - Payment failure statistics (42%)
- [PCI DSS 4.0 & VCC Security in 2026](https://antravia.com/pci-dss-40-and-vcc-security-in-2026-the-compliance-playbook-for-hotels-and-travel-agencies) - Compliance requirements

### Tertiary (validate during implementation)
- Peak season support volume increases (300-400%) - industry estimate, varies by operation
- Average data breach cost ($4.5M) - general statistic, actual exposure depends on scope

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
