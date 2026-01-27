---
phase: 06-gift-recipient-experience
plan: 03
subsystem: email
tags: [email-templates, gift-decline, refund-notification]

dependency-graph:
  requires: ["06-01"]
  provides: ["decline-email-templates", "styled-decline-notifications"]
  affects: []

tech-stack:
  added: []
  patterns: ["email-template-pattern"]

key-files:
  created:
    - lib/email/templates/gift-decline-confirmation-recipient.ts
    - lib/email/templates/gift-decline-notification-purchaser.ts
  modified:
    - lib/gift/gift-transition-service.ts

decisions: []

metrics:
  duration: "4 min"
  completed: 2026-01-27
---

# Phase 6 Plan 03: Decline Email Templates Summary

**One-liner:** Professional styled email templates for gift decline notifications replacing inline HTML in transition service.

## What Was Built

### 1. Recipient Decline Confirmation Template

**File:** `lib/email/templates/gift-decline-confirmation-recipient.ts`

Created a styled email template sent to recipients after they decline a gift:

- **Interface:** `GiftDeclineConfirmationRecipientData` with recipient/purchaser details and optional decline reason
- **Function:** `generateGiftDeclineConfirmationRecipientEmail()` returning `{ html, text, subject }`
- **Styling:** Neutral/muted tones (grays, not reds or greens) - professional, empathetic
- **Content:** Confirmation message, refund notification to purchaser, optional decline reason display
- **Subject:** "Gift Declined - Confirmation"
- **Preheader:** "Your gift decline has been processed."

### 2. Purchaser Decline Notification Template

**File:** `lib/email/templates/gift-decline-notification-purchaser.ts`

Created a styled email template sent to purchasers when recipient declines:

- **Interface:** `GiftDeclineNotificationPurchaserData` with all booking/refund details
- **Function:** `generateGiftDeclineNotificationPurchaserEmail()` returning `{ html, text, subject }`
- **Refund Display:** Prominent green-bordered box with large refund amount (reassuring)
- **Content:** Decline notification, refund amount, 5-10 day processing note, booking details table
- **Optional:** Decline reason in subtle info box
- **Subject:** "Gift Declined - Refund Processed - {bookingReference}"
- **Preheader:** "Your gift to {recipientFirstName} has been declined. Full refund processed."

### 3. Transition Service Integration

**File:** `lib/gift/gift-transition-service.ts`

Updated `handleDeclinedTransition` to use proper templates:

- Added imports for both new template functions and interfaces
- Replaced inline HTML email sending with template calls
- Purchaser email now uses `GiftDeclineNotificationPurchaserData` with full booking details
- Recipient email now uses `GiftDeclineConfirmationRecipientData` with purchaser info
- Removed ~30 lines of inline HTML, added ~35 lines of clean template calls

## Verification

- [x] Both template files exist and export correct functions
- [x] Templates follow acceptance template patterns (imports, structure, return types)
- [x] `handleDeclinedTransition` imports and uses new templates
- [x] No inline HTML remains in decline email sending
- [x] `npm run build` passes
- [x] `npm run lint` passes for modified files

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1454081 | feat | Create recipient decline confirmation email template |
| b4b97e1 | feat | Create purchaser decline notification email template |
| b07895a | refactor | Wire decline email templates into transition service |

## Deviations from Plan

None - plan executed exactly as written.

## Next Plan Readiness

Plan 06-04 can proceed. Email infrastructure for decline flow is complete.
