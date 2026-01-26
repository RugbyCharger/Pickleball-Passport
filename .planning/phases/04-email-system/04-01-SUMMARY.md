---
phase: 04-email-system
plan: 01
subsystem: email
tags: [email, notifications, sendgrid, cancellation, guest-communication]
depends_on:
  requires: []
  provides: [guest-cancellation-email, sendBookingCancellationGuest]
  affects: []
tech-stack:
  added: []
  patterns: [non-blocking-email, dynamic-import, template-pattern]
key-files:
  created:
    - lib/email/templates/booking-cancellation-guest.ts
  modified:
    - lib/email/sendgrid.ts
    - lib/trpc/server/routers/booking.ts
    - lib/trpc/server/routers/admin.ts
decisions:
  - id: EML-01
    choice: "Guest receives email on all cancellation paths"
    rationale: "Both self-cancellation and admin-initiated cancellation trigger guest email"
  - id: EML-02
    choice: "Include booking reference, trip name, cancellation date in email"
    rationale: "EML-02 requirement - guests need key details for their records"
  - id: COMPANION-EMAIL
    choice: "Companion guest receives separate cancellation email"
    rationale: "When cancelBothBookings=true, companion has different guestEmail on their booking record"
metrics:
  duration: 4 min
  completed: 2026-01-26
---

# Phase 04 Plan 01: Guest Cancellation Email Summary

**One-liner:** Guest cancellation email template with SendGrid helper, wired to both self-cancellation and admin-initiated paths

## What Was Done

### Task 1: Guest Cancellation Email Template
Created `lib/email/templates/booking-cancellation-guest.ts`:
- `BookingCancellationGuestData` interface with required fields (firstName, email, bookingReference, packageName, tripName, cancellationDate)
- Optional refund fields (refundAmount, refundPercentage)
- `generateBookingCancellationGuestEmail()` function returning {html, text, subject}
- Guest-friendly sympathetic tone ("We're sorry to see you go")
- Refund section with 5-10 business days timeline when applicable
- Uses `baseEmailTemplate()` and `generatePlainText()` from base.ts

### Task 2: SendGrid Helper Function
Added to `lib/email/sendgrid.ts`:
- `sendBookingCancellationGuest(to, data)` async function
- Dynamic import of template for code splitting
- Follows existing pattern used by other send helpers

### Task 3: Wiring to Booking and Admin Routers

**In booking.ts (guest self-cancellation):**
- Line 1745-1758: Primary guest receives cancellation email with refund details if applicable
- Line 1761-1774: Companion guest receives separate email when `cancelBothBookings=true`
- Non-blocking `.catch()` pattern - mutation never fails due to email error
- Removed TODO comment that was placeholder for this implementation

**In admin.ts (admin-initiated cancellation):**
- Line 768-781: CANCELLED status uses proper template instead of inline HTML
- CONFIRMED and COMPLETED statuses continue using generic email format
- Added `trip` include to booking query for tripName field

## Key Artifacts

| File | Type | Purpose |
|------|------|---------|
| `lib/email/templates/booking-cancellation-guest.ts` | Created | Guest cancellation email template |
| `lib/email/sendgrid.ts` | Modified | Added sendBookingCancellationGuest helper |
| `lib/trpc/server/routers/booking.ts` | Modified | Wired email to guest self-cancellation |
| `lib/trpc/server/routers/admin.ts` | Modified | Wired email to admin-initiated cancellation |

## Commits

| Hash | Message |
|------|---------|
| f538b8e | feat(04-01): add guest booking cancellation email template |
| d48c600 | feat(04-01): add sendBookingCancellationGuest helper to sendgrid.ts |
| 82be987 | feat(04-01): wire cancellation emails to booking and admin routers |

## Verification Results

- TypeScript compilation: PASSED
- Template file exists: PASSED
- Send function exported: PASSED (line 696 in sendgrid.ts)
- Wiring in booking.ts: PASSED (lines 1745, 1762)
- Wiring in admin.ts: PASSED (lines 768, 770)
- TODO comment removed: PASSED

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Met

- [x] EML-01: Guest receives email notification when booking is cancelled (both self and admin paths)
- [x] EML-02: Cancellation email includes booking reference, trip name, and cancellation date
- [x] Non-blocking email sends (mutation never fails due to email error)
- [x] Companion bookings handled when cancelBothBookings=true

## Next Phase Readiness

Phase 4 (Email System) is complete. All email requirements addressed:
- Guest cancellation email implemented and wired

The project is now ready for final verification and deployment.
