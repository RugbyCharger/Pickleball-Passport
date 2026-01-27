# Phase 7: Gift Operations - Research

**Researched:** 2026-01-27
**Domain:** Gift lifecycle management, dashboard visibility, cron-based expiration
**Confidence:** HIGH

## Summary

Phase 7 focuses on verifying existing gift expiration infrastructure and adding dashboard visibility for purchasers and admins. Research confirms that most of the core infrastructure already exists:

1. **Gift State Machine** (`lib/gift/gift-state-machine.ts`) - Fully implemented with PENDING -> SENT -> ACCEPTED/DECLINED/EXPIRED transitions
2. **Transition Service** (`lib/gift/gift-transition-service.ts`) - Handles refunds via Stripe and emails on state transitions including EXPIRED
3. **Expiration Cron Job** (`app/api/cron/expire-gifts/route.ts`) - Already runs daily at 12:00 UTC, finds gifts with `giftStatus=SENT` and `giftExpiresAt <= now`
4. **Purchaser Dashboard** - Partial visibility exists in `components/dashboard/bookings-list.tsx` using `GiftStatusBadge` component

The main gaps requiring implementation are:
- **GIFT-19**: Expiration notification email needs to be templatized (currently inline HTML)
- **GIFT-20/21**: Purchaser dashboard needs enhancement for gifts they purchased (currently shows received gifts better)
- **GIFT-22**: Admin dashboard needs a dedicated gift bookings view with status filtering

**Primary recommendation:** Focus on enhancing existing infrastructure rather than building new systems. Add tRPC queries for purchaser gifts, create admin gift view, and templatize the expiration email.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tRPC | 10.x | API layer | Already used for all dashboard data fetching |
| Prisma | 5.x | Database ORM | Already used for all database operations |
| Next.js App Router | 15.x | Routing/rendering | Project framework |
| Stripe SDK | 17.x | Refund processing | Already integrated in transition service |
| SendGrid | 8.x | Email delivery | Already used for all transactional emails |
| date-fns | 4.x | Date calculations | Already used for expiration calculations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.x | Input validation | All tRPC input schemas |
| lucide-react | 0.562.x | Icons | UI components |
| shadcn/ui components | Latest | UI primitives | Dashboard UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cron (Vercel) | Trigger.dev | More complex, better for long-running jobs - unnecessary for simple expiration |
| Inline HTML email | React Email | Better DX but requires migration of all templates - out of scope |

**Installation:**
No new installations needed - all dependencies already in project.

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── gift/
│   ├── gift-state-machine.ts      # State validation (EXISTS)
│   ├── gift-transition-service.ts  # Side effects (EXISTS)
│   └── gift-queries.ts             # NEW: Purchaser gift queries
lib/trpc/server/routers/
├── gift.ts                         # Gift acceptance/decline (EXISTS)
└── admin.ts                        # Add gifts section (MODIFY)
components/dashboard/
├── gift-state-timeline.tsx         # Timeline component (EXISTS)
├── gift-status-badge.tsx           # Badge component (EXISTS, part of timeline)
└── purchaser-gifts-list.tsx        # NEW: Gifts I purchased view
app/(dashboard)/dashboard/
├── gifts/                          # NEW: Purchaser gifts page
│   └── page.tsx
└── admin/bookings/
    └── gifts/                      # NEW: Admin gift bookings page
        └── page.tsx
lib/email/templates/
└── gift-expiration-purchaser.ts    # NEW: Templatized expiration email
```

### Pattern 1: Query Pattern for Purchaser's Gifts
**What:** Separate query for bookings where current user is the gift purchaser (not the booking owner)
**When to use:** Purchaser dashboard to see gifts they've sent
**Example:**
```typescript
// Source: Codebase pattern from lib/trpc/server/routers/booking.ts
// Query bookings where giftPurchaserId = currentUser.id
const giftsIPurchased = await ctx.db.booking.findMany({
  where: {
    giftPurchaserId: ctx.user.id,
    isGift: true,
  },
  include: {
    package: { select: { name: true, slug: true } },
    trip: { select: { startDate: true, endDate: true, destination: true } },
    giftStateTransitions: {
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Pattern 2: Admin Filter Pattern for Gifts
**What:** Add giftStatus filter to existing admin bookings query pattern
**When to use:** Admin gift bookings page with status filtering
**Example:**
```typescript
// Source: Existing pattern from lib/trpc/server/routers/admin.ts bookings.list
const giftFilter = input?.giftStatus
  ? { isGift: true, giftStatus: input.giftStatus }
  : input?.includeGifts === false
    ? { isGift: false }
    : {};

const bookings = await ctx.db.booking.findMany({
  where: {
    ...giftFilter,
    ...(input?.status && { status: input.status }),
  },
  // ... rest of query
});
```

### Pattern 3: Email Template Pattern
**What:** Consistent email template structure matching existing templates
**When to use:** Gift expiration notification
**Example:**
```typescript
// Source: lib/email/templates/gift-notification-recipient.ts pattern
export interface GiftExpirationPurchaserData {
  purchaserFirstName: string;
  purchaserEmail: string;
  recipientName: string;
  bookingReference: string;
  packageName: string;
  refundAmount: number;
  expirationDate: string;
}

export function generateGiftExpirationPurchaserEmail(data: GiftExpirationPurchaserData) {
  const subject = `Gift Expired - Refund Processed - ${data.bookingReference}`;
  // ... template body
  return { subject, html, text };
}
```

### Anti-Patterns to Avoid
- **Duplicating state logic:** Don't reimplement state validation - use `giftStateMachine.validateTransition()`
- **Bypassing transition service:** Always use `transitionGiftState()` for state changes to ensure audit trail
- **Separate admin gift router:** Keep gift admin functions in `admin.ts` router for consistency
- **Adding new cron jobs:** Expiration cron already exists and works - just verify it

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gift state transitions | Custom state update | `transitionGiftState()` | Handles audit trail, emails, refunds atomically |
| Expiration date calculation | Manual date math | Existing `giftExpiresAt` field | Set when transitioning to SENT state |
| Refund processing | Direct Stripe API | `handleExpiredTransition()` | Error handling, logging, payment record update |
| Email sending | Direct SendGrid | `sendEmail()` wrapper | Consistent error handling, logging |
| Admin authorization | Manual role check | `adminProcedure` | Consistent with all admin routes |
| Status badge display | Custom component | `GiftStatusBadge` | Already handles expiration countdown |

**Key insight:** The gift infrastructure is well-designed. Phase 7 is about wiring existing pieces together and adding visibility, not building new systems.

## Common Pitfalls

### Pitfall 1: Missing purchaser's gifts in dashboard
**What goes wrong:** Current bookings page shows bookings where `userId = currentUser.id`, but gifts the user purchased transfer ownership to recipient on acceptance
**Why it happens:** After acceptance, `userId` changes to recipient, so purchaser loses visibility
**How to avoid:** Query separately for `giftPurchaserId = currentUser.id` to show gifts user purchased
**Warning signs:** Purchaser asks "where did my gift booking go?" after recipient accepts

### Pitfall 2: Expiration email sent without refund
**What goes wrong:** Email confirms refund but Stripe refund failed
**Why it happens:** Email sent after refund attempt regardless of success in current code
**How to avoid:** `handleExpiredTransition()` already catches refund errors - verify email only sent on success OR email indicates "refund processing" not "refund complete"
**Warning signs:** Customer complaints about missing refunds

### Pitfall 3: Gift status confusion in admin view
**What goes wrong:** Admin can't distinguish gift booking status from overall booking status
**Why it happens:** `giftStatus` (PENDING/SENT/ACCEPTED/DECLINED/EXPIRED) vs `status` (CONFIRMED/CANCELLED) are different
**How to avoid:** Admin UI must show both booking status AND gift status for gift bookings
**Warning signs:** Admin marks gift booking as "cancelled" thinking that triggers refund (it doesn't)

### Pitfall 4: Timezone issues with expiration
**What goes wrong:** Gift expires at unexpected time from user's perspective
**Why it happens:** Cron runs at 12:00 UTC, `giftExpiresAt` stored in UTC
**How to avoid:** Document behavior clearly; expiration happens "during the day of" not at midnight user local time
**Warning signs:** User says "it said 5 days left yesterday, now it's expired"

### Pitfall 5: Admin modifying expired gift
**What goes wrong:** Admin tries to "uncancel" an expired gift
**Why it happens:** EXPIRED is a terminal state but admin sees booking status CANCELLED
**How to avoid:** UI should indicate terminal states cannot be changed; use `giftStateMachine.isTerminalState()` check
**Warning signs:** Admin frustrated they can't restore expired booking

## Code Examples

Verified patterns from the codebase:

### Purchaser's Gifts Query
```typescript
// Source: New query following patterns from booking.ts
// lib/trpc/server/routers/gift.ts - add to giftRouter

myPurchasedGifts: protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.booking.findMany({
    where: {
      giftPurchaserId: ctx.user.id,
      isGift: true,
    },
    include: {
      package: { select: { name: true, slug: true } },
      trip: { select: { startDate: true, endDate: true, destination: true } },
      giftStateTransitions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}),
```

### Admin Gifts List Query
```typescript
// Source: Following pattern from admin.ts bookings.list
// Add to admin.ts router

gifts: router({
  list: adminProcedure
    .input(
      z.object({
        giftStatus: z.enum(['PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        isGift: true,
        ...(input?.giftStatus && { giftStatus: input.giftStatus }),
      };

      const [bookings, total] = await Promise.all([
        ctx.db.booking.findMany({
          where,
          include: {
            package: { select: { name: true } },
            trip: { select: { startDate: true, destination: true } },
            user: {
              select: {
                email: true,
                guestProfile: { select: { firstName: true, lastName: true } }
              }
            },
            giftStateTransitions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input?.limit || 50,
          skip: input?.offset || 0,
        }),
        ctx.db.booking.count({ where }),
      ]);

      return { bookings, total };
    }),

  getCounts: adminProcedure.query(async ({ ctx }) => {
    const [total, pending, sent, accepted, declined, expired] = await Promise.all([
      ctx.db.booking.count({ where: { isGift: true } }),
      ctx.db.booking.count({ where: { isGift: true, giftStatus: 'PENDING' } }),
      ctx.db.booking.count({ where: { isGift: true, giftStatus: 'SENT' } }),
      ctx.db.booking.count({ where: { isGift: true, giftStatus: 'ACCEPTED' } }),
      ctx.db.booking.count({ where: { isGift: true, giftStatus: 'DECLINED' } }),
      ctx.db.booking.count({ where: { isGift: true, giftStatus: 'EXPIRED' } }),
    ]);

    return { total, pending, sent, accepted, declined, expired };
  }),
}),
```

### Expiration Email Template
```typescript
// Source: Following pattern from gift-notification-recipient.ts
// lib/email/templates/gift-expiration-purchaser.ts

export interface GiftExpirationPurchaserData {
  purchaserFirstName: string;
  purchaserEmail: string;
  recipientName: string;
  bookingReference: string;
  packageName: string;
  totalRefund: number; // in cents
}

export function generateGiftExpirationPurchaserEmail(data: GiftExpirationPurchaserData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Gift Expired - Refund Processed - ${data.bookingReference}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gift Expired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #003D5C;">Gift Expired</h1>

    <p>Hi ${data.purchaserFirstName},</p>

    <p>Unfortunately, your gift to <strong>${data.recipientName}</strong> has expired after 30 days without a response.</p>

    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
      <p style="margin: 10px 0 0;"><strong>Package:</strong> ${data.packageName}</p>
    </div>

    <p>A full refund of <strong>$${(data.totalRefund / 100).toFixed(2)}</strong> has been processed to your original payment method. It may take 5-10 business days for the refund to appear in your account.</p>

    <p>If you'd like to send another gift or have any questions, please contact us at <a href="mailto:support@pickleballpassport.com">support@pickleballpassport.com</a>.</p>

    <p>The Pickleball Passport Team</p>
  </div>
</body>
</html>
  `.trim();

  const text = `
Gift Expired - ${data.bookingReference}

Hi ${data.purchaserFirstName},

Unfortunately, your gift to ${data.recipientName} has expired after 30 days without a response.

Booking Reference: ${data.bookingReference}
Package: ${data.packageName}

A full refund of $${(data.totalRefund / 100).toFixed(2)} has been processed to your original payment method. It may take 5-10 business days for the refund to appear in your account.

If you'd like to send another gift or have any questions, please contact us at support@pickleballpassport.com.

The Pickleball Passport Team
  `.trim();

  return { subject, html, text };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline HTML email | Templated email function | Should be Phase 7 | Consistency, maintainability |
| N/A | N/A | N/A | N/A |

**Deprecated/outdated:**
- Inline HTML in `handleExpiredTransition()` should be replaced with templatized email

## Open Questions

Things that couldn't be fully resolved:

1. **Should purchaser see gifts they purchased on main bookings page OR separate gifts page?**
   - What we know: Currently bookings page shows `userId = currentUser.id`, gifts transfer ownership
   - What's unclear: UX decision - one page with tabs vs separate "My Gifts" page
   - Recommendation: Add "Gifts I Purchased" section/tab to existing bookings page, or create `/dashboard/gifts` page

2. **Should admin be able to manually expire a gift early?**
   - What we know: No manual expiration mechanism exists today
   - What's unclear: Whether this is needed for v1.1
   - Recommendation: Out of scope for v1.1 - cron handles expiration automatically

3. **Should expiration countdown be visible to recipient?**
   - What we know: `GiftStatusBadge` shows countdown for SENT gifts
   - What's unclear: Is this shown to recipient on acceptance page?
   - Recommendation: Verify acceptance page shows expiration countdown - may already be implemented

## Sources

### Primary (HIGH confidence)
- Codebase: `/Users/grantcharge/Pickleball-Passport/lib/gift/gift-state-machine.ts` - Full state machine implementation
- Codebase: `/Users/grantcharge/Pickleball-Passport/lib/gift/gift-transition-service.ts` - Transition logic with refunds
- Codebase: `/Users/grantcharge/Pickleball-Passport/app/api/cron/expire-gifts/route.ts` - Expiration cron job
- Codebase: `/Users/grantcharge/Pickleball-Passport/components/dashboard/bookings-list.tsx` - Current dashboard implementation
- Codebase: `/Users/grantcharge/Pickleball-Passport/components/dashboard/gift-state-timeline.tsx` - Gift status components
- Codebase: `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/admin.ts` - Admin patterns
- Codebase: `/Users/grantcharge/Pickleball-Passport/prisma/schema.prisma` - Data models
- Codebase: `/Users/grantcharge/Pickleball-Passport/vercel.json` - Cron configuration

### Secondary (MEDIUM confidence)
- Codebase: `/Users/grantcharge/Pickleball-Passport/app/api/cron/__tests__/expire-gifts-route.test.ts` - Test coverage verification

### Tertiary (LOW confidence)
- None - all findings from codebase analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use in codebase
- Architecture: HIGH - Following established patterns from codebase
- Pitfalls: HIGH - Derived from code analysis and domain understanding

**Research date:** 2026-01-27
**Valid until:** 60 days (stable domain, existing infrastructure)
