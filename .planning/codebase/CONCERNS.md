# Codebase Concerns

**Analysis Date:** 2026-01-25

## Tech Debt

**Unencrypted Bank Account Storage:**
- Issue: Bank account numbers and routing numbers stored in plaintext in database
- Files: `prisma/schema.prisma:899-900`, `lib/trpc/server/routers/partner.ts:1824-1831`
- Impact: Sensitive financial data exposed if database is compromised; violates PCI DSS compliance requirements
- Fix approach: Implement field-level encryption using library like `@noble/hashes` or move sensitive data to Stripe's encrypted storage via Stripe Connect

**Weak Email Token Secret Fallback:**
- Issue: Email token HMAC uses default secret "CHANGE_ME_IN_PRODUCTION" when environment variable not set
- Files: `lib/preferences/email-token.ts:8`, `lib/preferences/email-token.ts:10-14`
- Impact: Anyone with default configuration can forge email preference tokens; non-repudiation attack vector
- Fix approach: Enforce required environment variable at startup; fail fast if not configured
- Affected: Email unsubscribe links, newsletter preferences

**Console Logging in Production:**
- Issue: 54+ console.log/console.error statements throughout lib directory used for debugging
- Files: `lib/trpc/server/routers/admin.ts`, `lib/trpc/server/routers/booking.ts`, `app/api/webhooks/stripe/route.ts`, etc.
- Impact: Console logs may expose sensitive information in production logs; should use structured logging
- Fix approach: Replace console with structured logger (pino is already available); audit for PII exposure

**Missing Admin Role Permission Check:**
- Issue: Admin dashboard at `app/(dashboard)/dashboard/admin/page.tsx` lacks role verification
- Files: `app/(dashboard)/dashboard/admin/page.tsx:24-25`
- Impact: Any authenticated user can access admin features; privilege escalation vulnerability
- Fix approach: Add `ctx.user?.role === 'ADMIN'` check; implement RBAC middleware; add integration tests

**Hardcoded User ID in Document Upload:**
- Issue: Document page uses hardcoded test user ID instead of actual authenticated user
- Files: `app/(dashboard)/dashboard/documents/page.tsx:143`
- Impact: All uploaded documents associated with 'user_test'; data ownership violation
- Fix approach: Use actual Clerk user ID from `useUser()` hook; add integration test

## Known Bugs

**Webhook Error Handling Swallows Errors:**
- Symptoms: Critical failures in payment processing logged but not properly surfaced to monitoring
- Files: `app/api/webhooks/stripe/route.ts:135-140`, multiple catch blocks throughout
- Trigger: Any error in payment_intent.succeeded, payment_intent.payment_failed handlers
- Workaround: Check logs directly; currently no alerting on webhook failures
- Actual behavior: Errors logged to console but webhook returns 500 without detailed context

**Potential Overbooking Not Handled:**
- Symptoms: Booking confirmed even if trip capacity exceeded
- Files: `app/api/webhooks/stripe/route.ts:256`
- Trigger: Multiple simultaneous payments for same trip that exceeds capacity
- Workaround: Manual admin intervention required
- Fix: Implement proper seat reservation during payment processing, not after

## Security Considerations

**Missing SendGrid Webhook Signature Verification:**
- Risk: Webhook events could be spoofed by attackers; unsubscribe/spam reports forged
- Files: `app/api/webhooks/sendgrid/events/route.ts:46-48`
- Current mitigation: Relies on HTTPS + secret URL path (insufficient)
- Recommendations: Implement SendGrid EC signature verification using public key; validate timestamp to prevent replay attacks

**Unimplemented SMS Functionality:**
- Risk: Code paths expect SMS alerts but feature not implemented; admins unaware of critical events
- Files: `lib/trpc/server/routers/admin.ts:1357, 1405, 1451` (sendFlightDelaySMS, sendItinerarySMS, etc.)
- Current mitigation: Logs indicate feature not implemented, returns success message
- Recommendations: Either implement full Twilio SMS integration or remove feature entirely; add admin notification via email as fallback

**Missing Admin Alert Emails:**
- Risk: Critical booking events (failed payments, overbooking, disputes) not alerted to admin team
- Files: `app/api/webhooks/stripe/route.ts:256, 775, 856` (multiple TODO comments)
- Current mitigation: Events logged to console only
- Recommendations: Implement SendGrid email alerts to admin team for: overbooking, payment failures, chargebacks

**Stripe Secret Key Exposure:**
- Risk: STRIPE_SECRET_KEY used directly in multiple routers without isolation
- Files: `lib/trpc/server/routers/admin.ts`, `lib/trpc/server/routers/booking.ts`, `lib/stripe.ts`
- Current mitigation: Environment variables; not exposed in client code
- Recommendations: Centralize in single service; use Stripe API key versioning; audit key usage patterns

## Performance Bottlenecks

**Large Routers - Monolithic Architecture:**
- Problem: Individual router files are very large (3000+ lines), mixing concerns
- Files: `lib/trpc/server/routers/analytics.ts` (6057 lines), `lib/trpc/server/routers/partner.ts` (3460 lines), `lib/trpc/server/routers/admin.ts` (3115 lines)
- Cause: All procedures for a domain area bundled together without separation of concerns
- Improvement path: Split routers by capability (e.g., admin.stats, admin.users, admin.support instead of single admin router); implement nested router structure

**Unoptimized Database Queries:**
- Problem: Multiple N+1 query patterns in booking and partner routers
- Files: `lib/trpc/server/routers/booking.ts`, `lib/trpc/server/routers/partner.ts` (analytics queries)
- Cause: Iterating over arrays and making individual DB calls for related data
- Improvement path: Use Prisma includes/selects to fetch related data in single query; implement query result caching for analytics

**PDF Receipt Generation Blocking Payment Emails:**
- Problem: PDF generation happens synchronously in payment success handler
- Files: `app/api/webhooks/stripe/route.ts:279-297`
- Cause: Receipt generation can take 2+ seconds; non-blocking try-catch added but still slow
- Improvement path: Move PDF generation to background job queue; send email with receipt link once ready

## Fragile Areas

**Webhook Event Processing:**
- Files: `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/sendgrid/events/route.ts`
- Why fragile: Multiple mutation points in single transaction; retry behavior unclear; no dead-letter queue for failed events
- Safe modification: Add comprehensive logging before each state mutation; implement event sourcing pattern; add webhook event replay mechanism
- Test coverage: Basic happy-path tests exist; missing: duplicate event handling, partial failure recovery, race conditions

**Email Sending Integration:**
- Files: `lib/email/sendgrid.ts`, `lib/email/admin-alerts.ts`, multiple TODO comments throughout
- Why fragile: Email sending sprinkled throughout codebase as fire-and-forget; no retry policy; no template version control
- Safe modification: Centralize all email through single service with built-in retry and template validation; implement email audit trail
- Test coverage: No unit tests for email template rendering; integration tests use mocked responses

**Payment Processing Pipeline:**
- Files: `lib/trpc/server/routers/booking.ts`, `app/api/webhooks/stripe/route.ts`
- Why fragile: Multiple state transitions (draft → pending_payment → confirmed); no compensation logic for partial failures
- Safe modification: Implement saga pattern for payment flow; add comprehensive state machine validation; add rollback logic
- Test coverage: Unit tests for booking creation; missing: integration tests for full payment lifecycle, failure scenarios

**Admin Role Authorization:**
- Files: `lib/trpc/server/routers/admin.ts`, `app/(dashboard)/dashboard/admin/page.tsx`
- Why fragile: No consistent authorization checks; some procedures use `adminProcedure`, others don't
- Safe modification: Create middleware to enforce admin role on all admin routers; add type-safe role checking
- Test coverage: No integration tests for RBAC; missing permission denial tests

## Scaling Limits

**Database Connection Pool:**
- Current capacity: Prisma default 10 connections for PostgreSQL
- Limit: Hits pool exhaustion under 100+ concurrent webhook events during high traffic
- Scaling path: Increase DATABASE_CONNECTION_LIMIT; implement connection pooling via PgBouncer; migrate analytics to read replicas

**Email Queue:**
- Current capacity: Synchronous SendGrid API calls in webhook handlers
- Limit: SendGrid rate limits (500 msgs/sec); webhook processing blocked if email service degrades
- Scaling path: Move to async job queue (Bull, Temporal, or Inngest); implement exponential backoff retry

**Session Storage (Clerk):**
- Current capacity: Clerk JWT tokens handle stateless auth
- Limit: No issue expected for scaling; Clerk handles infrastructure
- Scaling path: Already cloud-based; monitor JWT payload size

## Dependencies at Risk

**Twilio Integration (Incomplete):**
- Risk: Package imported but SMS sending not implemented; dead code in production
- Impact: SMS features advertised but not working; admin alerts via SMS missing
- Migration plan: Either implement Twilio SMS fully or remove integration; document decision

**Mux Video Service (Minimal Usage):**
- Risk: `@mux/mux-node` dependency for video hosting; unclear what it's used for
- Impact: If service degrades, trip video playback may fail
- Migration plan: Document all Mux dependencies; implement graceful fallback for missing videos

**SendGrid at Critical Path:**
- Risk: All user-facing email depends on SendGrid; no fallback provider
- Impact: Service outage blocks all transactional emails
- Migration plan: Implement email queue; add fallback to SES or Resend; add retry logic

## Missing Critical Features

**Email Sending Not Fully Implemented:**
- Problem: Multiple booking lifecycle events (cancellation, rescheduling, modification) have email sending stubbed out
- Blocks: Users not notified of booking changes; poor customer experience
- Files: `lib/trpc/server/routers/booking.ts:1743, 2117`, `app/api/webhooks/stripe/route.ts:495`
- Priority: High - affects core customer communication

**Dynamic Pricing Per Trip:**
- Problem: Price calculations hardcoded to 0; no support for variable pricing by trip
- Blocks: Cannot implement premium trip pricing; all trips cost same
- Files: `lib/trpc/server/routers/booking.ts:1950`
- Priority: Medium - needed for revenue optimization

**Partner Referral Redemption:**
- Problem: Points earned but redemption system not built
- Blocks: Partner commission payouts incomplete; points meaningless
- Files: `lib/trpc/server/routers/partner.ts:484`
- Priority: Medium - blocks partner payout flows

## Test Coverage Gaps

**Admin Authorization Not Tested:**
- What's not tested: Role-based access control; permission denial scenarios
- Files: `lib/trpc/server/routers/admin.ts`, `app/(dashboard)/dashboard/admin/page.tsx`
- Risk: Admin features may be accessible to non-admins; privilege escalation undetected
- Priority: High

**Payment Failure Recovery:**
- What's not tested: Partial payment failures; retry logic; transaction rollback scenarios
- Files: `app/api/webhooks/stripe/route.ts:525` (catch block)
- Risk: Payment failures silently dropped; customer bookings left in inconsistent state
- Priority: High

**Webhook Idempotency:**
- What's not tested: Duplicate webhook events; concurrent event processing
- Files: `app/api/webhooks/stripe/route.ts:63-80`
- Risk: Duplicate events may cause double-charging or double-confirmation
- Priority: High - actively used in production

**Email Template Rendering:**
- What's not tested: Email template generation; variable substitution; HTML escaping
- Files: `lib/email/templates/*.ts`
- Risk: Malformed emails; XSS injection if user data not escaped
- Priority: Medium

**Booking State Transitions:**
- What's not tested: Invalid state transitions (e.g., COMPLETED → DRAFT)
- Files: `lib/trpc/server/routers/booking.ts`
- Risk: Bookings in invalid states; data corruption
- Priority: Medium

---

*Concerns audit: 2026-01-25*
