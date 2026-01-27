# Phase 6: Gift Recipient Experience - Research

**Researched:** 2026-01-27
**Domain:** Gift notification, acceptance, decline workflows with transactional emails
**Confidence:** HIGH

## Summary

Phase 6 focuses on the recipient-facing portion of the gift booking lifecycle. This research investigated the existing codebase to determine what's already built versus what needs to be implemented.

**Key finding:** The vast majority of Phase 6 functionality is already implemented. The transition service, email templates, cron jobs, and acceptance flow are complete and tested. The remaining work consists primarily of verification, creating the missing decline page, and creating dedicated decline email templates.

The existing architecture follows a robust state machine pattern with audit logging. All state transitions flow through `transitionGiftState()` which handles validation, database updates, side effects (emails), and audit trail creation atomically.

**Primary recommendation:** This phase is 80% complete. Focus on verification tasks, creating the missing `/gift/decline` page, and standardizing the decline email templates to match the quality of acceptance emails.

## Standard Stack

The established libraries/tools for this phase (all already integrated):

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tRPC | 11.x | API layer for gift operations | Type-safe, already used across app |
| SendGrid | @sendgrid/mail | Transactional email delivery | Already integrated, battle-tested |
| Prisma | 6.x | Database operations and state transitions | Type-safe, transaction support |
| Clerk | 6.x | Authentication for gift acceptance | Already integrated, handles SSO |
| date-fns | 4.x | Date calculations (30-day expiration) | Already used, tree-shakeable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vercel Cron | n/a | Scheduled gift sending/expiration | Already configured in vercel.json |
| Stripe | 2025-12-15 | Refund processing for declines | Already integrated for payments |

### No New Dependencies Required

All required libraries are already installed and configured. This phase requires no new npm packages.

## Architecture Patterns

### Existing Architecture (Already Implemented)

```
lib/
  gift/
    gift-state-machine.ts        # State transition validation
    gift-transition-service.ts   # Atomic transitions + side effects
  email/
    templates/
      gift-notification-recipient.ts     # SENT email to recipient
      gift-acceptance-confirmation-recipient.ts  # Accept confirmation
      gift-acceptance-notification-purchaser.ts  # Notify purchaser
      gift-confirmation-purchaser.ts     # Purchase confirmation
    sendgrid.ts                  # Email sending utility
  trpc/
    server/routers/
      gift.ts                    # getByToken, acceptGift, declineGift

app/
  api/
    cron/
      send-scheduled-gifts/route.ts  # PENDING -> SENT cron
      expire-gifts/route.ts          # SENT -> EXPIRED cron
  gift/
    accept/page.tsx              # Gift acceptance UI
```

### Pattern: State Machine with Transition Service

**What:** All gift state changes flow through `transitionGiftState()` which:
1. Validates transition using state machine
2. Updates database in transaction
3. Records audit trail in `GiftStateTransition` table
4. Executes side effects (emails, refunds) outside transaction

**When to use:** Every state change, without exception

**Example:**
```typescript
// Source: lib/gift/gift-transition-service.ts
const result = await transitionGiftState(
  booking.id,
  GiftState.DECLINED,
  'user',
  {
    declineReason: input.reason,
    customReason: input.reason
      ? `Recipient declined: ${input.reason}`
      : 'Recipient declined the gift',
  }
)
```

### Pattern: Public Procedure for Unauthenticated Access

**What:** `declineGift` uses `publicProcedure` because recipients should be able to decline without creating an account

**When to use:** When the operation must work for unauthenticated users

**Security Note:** A known issue exists (TODO #010) - the decline operation currently allows anyone with a token to decline. Email verification should be added.

### Anti-Patterns to Avoid

- **Direct database updates for state changes:** Always use `transitionGiftState()`, never `prisma.booking.update()` for giftStatus changes
- **Inline email HTML:** The decline handler uses inline HTML; proper templates should be created
- **Skipping the audit trail:** Every transition must record to `GiftStateTransition` table

## Don't Hand-Roll

Problems that already have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State validation | Custom if/else chains | `giftStateMachine.validateTransition()` | Edge cases handled, terminal states checked |
| Email sending | Direct SendGrid calls | `sendEmail()` from sendgrid.ts | Handles logging, errors, preference tokens |
| Expiration calculation | Custom date math | Transition service + date-fns | Already sets `giftExpiresAt` correctly |
| Refund processing | Direct Stripe calls | `handleDeclinedTransition()` | Handles metadata, payment status update |
| Token generation | UUID generation | Already exists in booking creation | `giftAcceptanceToken` is unique and indexed |

**Key insight:** The transition service is the single source of truth for all gift operations. It encapsulates email sending, refund processing, and audit logging.

## Common Pitfalls

### Pitfall 1: Email Template Inconsistency
**What goes wrong:** Decline emails use inline HTML while acceptance emails use proper templates
**Why it happens:** Decline was implemented quickly during the state machine phase
**How to avoid:** Create `gift-decline-confirmation-recipient.ts` and `gift-decline-notification-purchaser.ts` templates
**Warning signs:** Finding inline `<html>` or template strings in service code

### Pitfall 2: Missing Decline Page
**What goes wrong:** Acceptance page redirects to `/gift/decline?token=...` but that page doesn't exist
**Why it happens:** Acceptance flow was prioritized, decline path not yet implemented
**How to avoid:** Create `app/gift/decline/page.tsx` similar to accept page structure
**Warning signs:** 404 errors when clicking decline link

### Pitfall 3: Authentication vs. Token-Only Access
**What goes wrong:** Confusion about when auth is required vs. when token is sufficient
**Why it happens:** `acceptGift` requires auth (email match verification), `declineGift` does not
**How to avoid:** Follow existing pattern - acceptance = protected, decline = public but add email verification
**Warning signs:** Security review flagged this in TODO #010

### Pitfall 4: Cron Job Not Running
**What goes wrong:** Scheduled gifts never send, gifts never expire
**Why it happens:** Cron secrets not configured, vercel.json not deployed
**How to avoid:** Verify `CRON_SECRET` is set in environment, crons are in vercel.json
**Warning signs:** PENDING gifts with past delivery dates, SENT gifts past expiration with no state change

## Code Examples

### Existing: Gift Acceptance (Protected Procedure)
```typescript
// Source: lib/trpc/server/routers/gift.ts:171-273
acceptGift: protectedProcedure
  .input(z.object({ token: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // 1. Find booking by token
    // 2. Validate with state machine
    // 3. Verify email matches authenticated user
    // 4. Execute transition (handles email, ownership transfer)
    // 5. Return success
  })
```

### Existing: Gift Decline (Public Procedure)
```typescript
// Source: lib/trpc/server/routers/gift.ts:282-378
declineGift: publicProcedure
  .input(z.object({
    token: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Find booking by token
    // 2. Validate with state machine
    // 3. Execute transition (handles refund, emails)
    // 4. Return success
  })
```

### Existing: State Transition with Side Effects
```typescript
// Source: lib/gift/gift-transition-service.ts:114-270
export async function transitionGiftState(
  bookingId: string,
  toState: GiftState,
  triggeredBy: TransitionMetadata['triggeredBy'],
  options: TransitionOptions = {}
): Promise<TransitionResult> {
  // 1. Fetch booking with relations
  // 2. Validate transition
  // 3. Execute in transaction:
  //    - Record GiftStateTransition
  //    - Update booking.giftStatus
  //    - Set giftExpiresAt if SENT
  //    - Transfer ownership if ACCEPTED
  //    - Cancel booking if DECLINED/EXPIRED
  // 4. Execute side effects (emails, refunds)
  // 5. Log and return result
}
```

### Pattern: Email Template Structure
```typescript
// Source: lib/email/templates/gift-notification-recipient.ts
export function generateGiftNotificationRecipientEmail(data: GiftNotificationRecipientData): {
  html: string;
  text: string;
  subject: string;
} {
  // Build HTML with baseEmailTemplate()
  // Generate plain text with generatePlainText()
  // Return all three parts
}
```

## State of the Art

| Component | Status | Notes |
|-----------|--------|-------|
| State Machine | COMPLETE | `lib/gift/gift-state-machine.ts` |
| Transition Service | COMPLETE | `lib/gift/gift-transition-service.ts` |
| getByToken API | COMPLETE | `lib/trpc/server/routers/gift.ts` |
| acceptGift API | COMPLETE | Protected, email verification |
| declineGift API | COMPLETE | Public, needs email verification |
| Acceptance Page | COMPLETE | `app/gift/accept/page.tsx` |
| Decline Page | MISSING | Needs creation |
| Scheduled Send Cron | COMPLETE | `app/api/cron/send-scheduled-gifts` |
| Expiration Cron | COMPLETE | `app/api/cron/expire-gifts` |
| Notification Email | COMPLETE | `gift-notification-recipient.ts` |
| Accept Confirmation | COMPLETE | Two templates for recipient/purchaser |
| Decline Emails | PARTIAL | Inline HTML, needs templates |

**What's Actually Needed for Phase 6:**

1. **VERIFICATION**: Test that GIFT-07, 08, 09, 10, 11, 12, 13 work correctly
2. **CREATE**: Decline page at `/gift/decline`
3. **CREATE**: Proper email templates for decline notifications
4. **SECURITY**: Add email verification to decline flow (TODO #010)

## Open Questions

### 1. Email Verification for Decline
**What we know:** declineGift is a public procedure, anyone with token can decline
**What's unclear:** Should we require email confirmation, or is token-only acceptable for decline?
**Recommendation:** Add email verification - send a "confirm decline" link to recipient email

### 2. Decline Reason Display
**What we know:** Decline reason is collected and stored in metadata
**What's unclear:** Should reason be shown to purchaser in email?
**Recommendation:** Include reason if provided, skip section if not (current behavior)

### 3. Immediate vs Confirmation Flow
**What we know:** Current accept page redirects to login/signup, then auto-accepts
**What's unclear:** Should decline have a similar confirmation page?
**Recommendation:** Yes - show gift details, confirm button, optional reason field

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `lib/gift/gift-state-machine.ts` - Complete state machine implementation
- Codebase analysis: `lib/gift/gift-transition-service.ts` - Atomic transitions with side effects
- Codebase analysis: `lib/trpc/server/routers/gift.ts` - API endpoints
- Codebase analysis: `app/gift/accept/page.tsx` - Existing acceptance UI pattern
- Codebase analysis: `app/api/cron/send-scheduled-gifts/route.ts` - Cron implementation
- Codebase analysis: `lib/email/templates/gift-*.ts` - Email template patterns

### Secondary (MEDIUM confidence)
- Codebase analysis: `vercel.json` - Cron schedules configured
- Codebase analysis: `todos/010-pending-p2-gift-decline-unauthenticated.md` - Known security issue

## Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| GIFT-07 | BUILT | `handleSentTransition()` sends email |
| GIFT-08 | BUILT | `gift-notification-recipient.ts` template |
| GIFT-09 | BUILT | `send-scheduled-gifts/route.ts` cron |
| GIFT-10 | BUILT | `app/gift/accept/page.tsx` displays details |
| GIFT-11 | BUILT | Accept page has login/signup flows |
| GIFT-12 | BUILT | `handleAcceptedTransition()` transfers ownership |
| GIFT-13 | BUILT | Two email templates for accept confirmation |
| GIFT-14 | PARTIAL | API exists, page missing |
| GIFT-15 | BUILT | `handleDeclinedTransition()` processes refund |
| GIFT-16 | PARTIAL | Inline HTML, needs templates |

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already integrated and tested
- Architecture: HIGH - Complete implementation in codebase
- Pitfalls: HIGH - Based on actual code review and TODO files

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable, existing patterns)

---

## Implementation Checklist

Based on this research, Phase 6 tasks should focus on:

### Verification Tasks (V)
- [ ] V1: Verify GIFT-07 - Test scheduled gift notification email sends correctly
- [ ] V2: Verify GIFT-08 - Confirm email contains package details, message, accept link
- [ ] V3: Verify GIFT-09 - Test cron job triggers for scheduled delivery dates
- [ ] V4: Verify GIFT-10 - Test gift details display on acceptance page
- [ ] V5: Verify GIFT-11 - Test login and signup flows on acceptance page
- [ ] V6: Verify GIFT-12 - Confirm ownership transfer works correctly
- [ ] V7: Verify GIFT-13 - Test both purchaser and recipient receive acceptance emails

### Creation Tasks (C)
- [ ] C1: Create `/gift/decline` page UI (follow accept page pattern)
- [ ] C2: Create `gift-decline-confirmation-recipient.ts` email template
- [ ] C3: Create `gift-decline-notification-purchaser.ts` email template
- [ ] C4: Update `handleDeclinedTransition()` to use new templates

### Security Tasks (S)
- [ ] S1: Add email verification to decline flow (address TODO #010)
