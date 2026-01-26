---
phase: 02-payment-recovery
plan: 01
subsystem: payments
tags: [stripe, sendgrid, email, webhook, payment-recovery]

# Dependency graph
requires:
  - phase: 01-security-hardening
    provides: secure webhook signature verification
provides:
  - Payment failure guest email template with recovery link
  - Webhook handler sends email on payment_intent.payment_failed
  - Admin alerts for installment payment failures
affects: [02-02, 02-03, phase-4-email-system]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Email template with user-friendly Stripe error code mapping
    - Non-blocking email sending in webhook handlers (try/catch)

key-files:
  created:
    - lib/email/templates/payment-failure-guest.ts
  modified:
    - app/api/webhooks/stripe/route.ts

key-decisions:
  - "Use amber/warning styling for payment failure emails (not red) to avoid panic"
  - "Map Stripe error codes to user-friendly messages for better UX"
  - "Wrap email sending in try/catch to ensure webhook never fails on email error"

patterns-established:
  - "Payment failure emails: always include updatePaymentUrl pointing to /dashboard/bookings/{id}"
  - "Webhook email sending: always non-blocking with proper error logging"

# Metrics
duration: 3min
completed: 2026-01-26
---

# Phase 02 Plan 01: Payment Failure Guest Email Summary

**Payment failure email notification wired into Stripe webhook with recovery link to dashboard booking page**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-26T10:33:31Z
- **Completed:** 2026-01-26T10:36:51Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created payment failure email template with all required fields (PaymentFailureEmailData interface)
- Wired email sending into handlePaymentFailure webhook handler
- Guest receives email with direct link to update payment method
- Admin alert sent for installment payment failures
- User-friendly Stripe error code mapping for common decline reasons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create payment failure guest email template** - `a7d1686` (feat)
2. **Task 2: Wire email sending into handlePaymentFailure webhook handler** - `1c43540` (feat)

## Files Created/Modified
- `lib/email/templates/payment-failure-guest.ts` - Payment failure email template with PaymentFailureEmailData interface and generatePaymentFailureEmail function
- `app/api/webhooks/stripe/route.ts` - handlePaymentFailure now sends guest email and admin alert for installments

## Decisions Made
- Used amber/warning color scheme (#fef3c7, #f59e0b) for the alert box to convey urgency without causing panic
- Mapped 16 common Stripe error codes to user-friendly messages (card_declined, insufficient_funds, expired_card, etc.)
- Wrapped all email sending in try/catch blocks - email failures are logged but never fail the webhook
- Added emailLogger for tracking email send events (success and failure)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- TypeScript check with tsc --noEmit failed on path aliases (@/) - used npm run build instead which handles path resolution correctly
- Build initially failed due to EMAIL_TOKEN_SECRET env var check (Phase 1 security hardening) - verified with env var set

## User Setup Required

None - no external service configuration required. Uses existing SendGrid and Stripe configurations.

## Next Phase Readiness
- Payment failure emails are now being sent to guests
- Recovery link points to /dashboard/bookings/{id} where UpdatePaymentMethodModal exists
- Ready for 02-02 (manual payment retry endpoint) and 02-03 (data integrity)
- Admin team will receive alerts for installment failures

---
*Phase: 02-payment-recovery*
*Completed: 2026-01-26*
