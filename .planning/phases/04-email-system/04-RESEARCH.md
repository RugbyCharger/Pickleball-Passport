# Phase 4: Email System - Research

**Researched:** 2026-01-26
**Domain:** Booking cancellation email notifications (SendGrid)
**Confidence:** HIGH

## Summary

Research reveals that 90% of the infrastructure needed for guest cancellation emails already exists. The codebase has a mature email system built on SendGrid with standardized template patterns, base template utilities, and established conventions for both transactional and admin notification emails. Critically, the admin cancellation email template and alert system are already implemented (Story 11-8) - what's missing is the corresponding **guest** cancellation email template and its integration into the cancellation flow.

The booking cancellation action in `lib/trpc/server/routers/booking.ts` (lines 1486-1773) already sends admin alerts but has a TODO comment (line 1743-1744) explicitly marking where guest email sending should be added. The pattern is clear: create a `booking-cancellation-guest.ts` template following existing conventions, add a `sendBookingCancellationGuest` function to `sendgrid.ts`, and wire it into the cancel mutation.

**Primary recommendation:** Create a guest cancellation email template mirroring the admin template structure, export a sendBookingCancellationGuest function, and wire it into the existing TODO location in the booking.cancel mutation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sendgrid/mail | existing | Email delivery API | Already integrated and working |
| lib/email/sendgrid.ts | N/A | Core send functions | Project's SendGrid wrapper |
| lib/email/templates/base.ts | N/A | HTML email structure | baseEmailTemplate() and generatePlainText() |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lib/email/admin-alerts.ts | N/A | Admin notification pattern | Reference for non-blocking email sends |
| lib/logger | N/A | Error logging for email failures | logError() pattern for email errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New template | Reuse refund-confirmation.ts | Cancellation has different messaging needs |
| Direct sendEmail() | Helper function | Helper provides consistent interface |

**Installation:**
```bash
# No installation needed - all dependencies already exist
```

## Architecture Patterns

### Recommended Project Structure
```
lib/email/
├── sendgrid.ts                          # Core send functions (add sendBookingCancellationGuest)
├── templates/
│   ├── base.ts                          # Base template utilities (EXISTS)
│   ├── booking-cancellation-admin.ts    # Admin cancellation alert (EXISTS)
│   └── booking-cancellation-guest.ts    # NEW: Guest cancellation email
```

### Pattern 1: Email Template Structure
**What:** All templates follow a consistent pattern
**When to use:** Creating any new email template
**Example:**
```typescript
// Source: lib/email/templates/booking-confirmation.ts (verified in codebase)
import { baseEmailTemplate, generatePlainText } from './base';

export interface BookingCancellationGuestData {
  firstName: string;
  email: string;
  bookingReference: string;
  packageName: string;
  tripName: string;
  cancellationDate: string; // ISO date
  refundAmount?: number; // In cents
  refundPercentage?: number;
  supportUrl: string;
}

export function generateBookingCancellationGuestEmail(data: BookingCancellationGuestData): {
  html: string;
  text: string;
  subject: string;
} {
  const content = `...`;

  const html = baseEmailTemplate({
    title: 'Booking Cancelled',
    content,
    preheader: `Your booking ${data.bookingReference} has been cancelled.`,
  });

  const text = generatePlainText(content);

  return { html, text, subject: `Booking Cancelled - ${data.bookingReference}` };
}
```

### Pattern 2: SendGrid Helper Function
**What:** Typed wrapper function in sendgrid.ts for each email type
**When to use:** Every email type should have a dedicated send function
**Example:**
```typescript
// Source: lib/email/sendgrid.ts pattern (verified in codebase)
export async function sendBookingCancellationGuest(
  to: string,
  data: import('./templates/booking-cancellation-guest').BookingCancellationGuestData
): Promise<void> {
  const { generateBookingCancellationGuestEmail } = await import('./templates/booking-cancellation-guest');
  const { html, text, subject } = generateBookingCancellationGuestEmail(data);

  await sendEmail({
    to,
    subject,
    html,
    text,
  });
}
```

### Pattern 3: Non-Blocking Email in Mutations
**What:** Email sends should not block the mutation response, use .catch() pattern
**When to use:** All transactional emails in mutations
**Example:**
```typescript
// Source: lib/trpc/server/routers/booking.ts lines 1746-1763 (verified)
// Non-blocking send with error logging
sendBookingCancellationGuest(userEmail, emailData)
  .catch(err => logError(emailLogger, err, 'Failed to send cancellation email'));
```

### Anti-Patterns to Avoid
- **Blocking email sends:** Don't await email sends in the mutation flow - use .catch() pattern
- **Missing plain text:** Always include text version via generatePlainText()
- **Hardcoded URLs:** Use process.env.NEXT_PUBLIC_APP_URL for links

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML email structure | Custom HTML boilerplate | baseEmailTemplate() from base.ts | Consistent branding, responsive design, footer |
| Plain text generation | Manual text version | generatePlainText() from base.ts | HTML tag stripping, entity decoding |
| Currency formatting | Inline formatting | formatCurrency() helper (add to template) | Consistent US dollar formatting |
| Date formatting | new Date().toString() | formatDate() helper (add to template) | User-friendly date display |

**Key insight:** The existing template files contain helper functions for formatting. Mirror the patterns in booking-cancellation-admin.ts which has formatCurrency() and formatDate() utilities.

## Common Pitfalls

### Pitfall 1: Missing Email for Admin-Initiated Cancellations
**What goes wrong:** Admin changes booking status to CANCELLED via updateStatus mutation but guest doesn't get email
**Why it happens:** The admin.bookings.updateStatus mutation (line 658-760 in admin.ts) creates in-app notification but doesn't trigger email
**How to avoid:** Wire cancellation email to BOTH guest-initiated (booking.cancel) AND admin-initiated (admin.bookings.updateStatus) flows
**Warning signs:** Users cancel through admin dashboard but guest doesn't receive confirmation

### Pitfall 2: Missing Required Data in Email
**What goes wrong:** Cancellation email doesn't include required fields (booking reference, trip name, cancellation date)
**Why it happens:** Requirements EML-02 explicitly lists these fields
**How to avoid:** Interface must include bookingReference, tripName, cancellationDate; verify email content matches requirements
**Warning signs:** Success criteria check fails

### Pitfall 3: Blocking Mutation on Email Failure
**What goes wrong:** If SendGrid fails, cancellation mutation fails
**Why it happens:** Using await without .catch()
**How to avoid:** Use non-blocking pattern: sendEmail(...).catch(err => logError(...))
**Warning signs:** Cancellations failing due to email timeouts

### Pitfall 4: Companion Booking Email Omission
**What goes wrong:** When cancelBothBookings=true, companion guest doesn't receive cancellation email
**Why it happens:** Only sending email for primary booking
**How to avoid:** Check for companion booking and send separate email
**Warning signs:** Companion guests confused about booking status

## Code Examples

Verified patterns from the codebase:

### Existing Admin Cancellation Template Interface
```typescript
// Source: lib/email/templates/booking-cancellation-admin.ts (verified)
export interface BookingCancellationAdminData {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  bookingId: string;
  cancellationReason?: string;
  packageName: string;
  tripName: string;
  tripStartDate: string; // ISO date
  totalBookingValue: number; // In cents
  refundAmount: number; // In cents
  refundStatus: 'pending' | 'processing' | 'completed';
  daysUntilTrip: number;
  bookingAdminUrl: string;
}
```

### Existing Cancel Mutation Data Gathering
```typescript
// Source: lib/trpc/server/routers/booking.ts lines 1746-1763 (verified)
// This is where guest email should be wired in
sendBookingCancellationAlert({
  customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  customerEmail: user.emailAddresses?.[0]?.emailAddress || '',
  bookingReference: booking.bookingReference,
  bookingId: booking.id,
  cancellationReason: undefined,
  packageName: booking.package.name,
  tripName: booking.trip?.name || '',
  tripStartDate: booking.trip?.startDate?.toISOString() || '',
  totalBookingValue: totalPriceForRefund,
  refundAmount: refundAmount,
  refundStatus: 'pending',
  daysUntilTrip: daysUntilTrip,
  bookingAdminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`
}).catch(err => logError(emailLogger, err, 'Failed to send cancellation admin alert'))
```

### Refund Confirmation Template Pattern (for reference)
```typescript
// Source: lib/email/templates/refund-confirmation.ts (verified)
// Good pattern to mirror for guest cancellation email content style
export interface RefundConfirmationData {
  firstName: string
  email: string
  bookingReference: string
  packageName: string
  refundAmount: number // in cents
  originalAmount: number // in cents
  isPartialRefund: boolean
  refundDate: string // ISO date
  expectedTimeline: string // "5-10 business days"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A | Non-blocking email sends | Current | Mutations don't fail on email errors |
| N/A | Separate admin vs guest templates | Current | Different content for different audiences |

**Deprecated/outdated:**
- None identified - email infrastructure is current

## Implementation Checklist

Based on research, the implementation requires:

1. **Create Template** (file: `lib/email/templates/booking-cancellation-guest.ts`)
   - Interface: BookingCancellationGuestData with required fields
   - Function: generateBookingCancellationGuestEmail()
   - Return: { html, text, subject }
   - Content must include: booking reference, trip name, cancellation date

2. **Add Send Function** (file: `lib/email/sendgrid.ts`)
   - Function: sendBookingCancellationGuest(to, data)
   - Pattern: Matches existing send functions

3. **Wire to Guest Cancellation** (file: `lib/trpc/server/routers/booking.ts`)
   - Location: Line ~1744 (TODO comment)
   - Pattern: Non-blocking with .catch()
   - Handle companion booking if cancelBothBookings=true

4. **Wire to Admin Cancellation** (file: `lib/trpc/server/routers/admin.ts`)
   - Location: updateStatus mutation, CANCELLED case (~line 735)
   - Pattern: Non-blocking with .catch()
   - Fetch user email from booking.user

## Open Questions

Things that couldn't be fully resolved:

1. **Companion Booking Email Handling**
   - What we know: cancelBothBookings flag exists, companion booking is processed
   - What's unclear: Should companion guest receive same email or different variant?
   - Recommendation: Send identical email to companion guest email separately

2. **Cancellation Reason from Admin**
   - What we know: Admin updateStatus has optional notes field
   - What's unclear: Should notes be included in guest email?
   - Recommendation: Include reason if provided, gracefully omit if not

## Sources

### Primary (HIGH confidence)
- lib/email/sendgrid.ts - Core email send patterns
- lib/email/templates/base.ts - Base template utilities
- lib/email/templates/booking-cancellation-admin.ts - Admin template structure
- lib/email/templates/booking-confirmation.ts - Template pattern reference
- lib/email/templates/refund-confirmation.ts - Content style reference
- lib/trpc/server/routers/booking.ts (lines 1486-1773) - Cancel mutation implementation
- lib/trpc/server/routers/admin.ts (lines 658-760) - Admin status update

### Secondary (MEDIUM confidence)
- lib/email/admin-alerts.ts - Non-blocking email pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All infrastructure verified in codebase
- Architecture: HIGH - Patterns extracted from existing code
- Pitfalls: HIGH - Identified from actual code inspection

**Research date:** 2026-01-26
**Valid until:** 60 days (stable infrastructure)
