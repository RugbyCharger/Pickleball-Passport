# Phase 5: Gift Purchase Flow - Research

**Researched:** 2026-01-27
**Domain:** Gift booking integration in existing booking flow
**Confidence:** HIGH

## Summary

Phase 5 focuses on enabling purchasers to buy trips as gifts for others. The critical finding is that **significant infrastructure already exists** - the database schema, state machine, email templates, UI components, and tRPC mutation are all built. The primary gap is **wiring the existing components into the booking flow** so that gift mode actually triggers the `createGift` mutation instead of the standard `createPaymentIntent` mutation.

The existing infrastructure includes:
- Complete `booking.createGift` tRPC mutation (lib/trpc/server/routers/booking.ts, lines 2441-2835)
- Gift state machine with PENDING -> SENT -> ACCEPTED/DECLINED/EXPIRED flow
- All UI components: GiftSection, GiftToggle, GiftRecipientForm, GiftMessageField, GiftDeliveryDateSelector
- Email templates for purchaser confirmation and recipient notification
- Cron jobs for scheduled delivery and expiration

**Primary recommendation:** Wire the payment-client.tsx to detect `isGift` from the booking store and call `booking.createGift` instead of `booking.createPaymentIntent` when gift mode is enabled.

## Standard Stack

The phase uses the existing stack - no new libraries needed:

### Core (Already in Place)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Zustand | 5.x | Booking store (already has gift fields) | COMPLETE |
| tRPC | 11.8.1 | createGift mutation exists | COMPLETE |
| SendGrid | - | Email delivery | COMPLETE |
| Stripe | - | Payment processing | COMPLETE |
| Prisma | 5.22.0 | Gift fields in schema | COMPLETE |

### No Additional Libraries Required
All necessary infrastructure is built. This phase is integration work, not new feature development.

## Architecture Patterns

### What's Already Built

```
lib/stores/booking-store.ts          # Gift state fields: isGift, giftRecipient, giftMessage, etc.
lib/trpc/server/routers/booking.ts   # createGift mutation (lines 2441-2835)
lib/trpc/server/routers/gift.ts      # getByToken, acceptGift, declineGift
lib/gift/gift-state-machine.ts       # State transitions
lib/gift/gift-transition-service.ts  # Side effects (emails, refunds)
components/booking/gift-*.tsx        # All UI components (6 components)
lib/email/templates/gift-*.ts        # All email templates (4 templates)
app/api/cron/send-scheduled-gifts/   # Scheduled delivery cron
app/api/cron/expire-gifts/           # Expiration cron
```

### What's Missing

```
app/booking/payment/payment-client.tsx   # Needs to detect isGift and call createGift
app/booking/review/review-client.tsx     # Needs gift validation before payment
```

### Pattern: Gift Flow Branching

The payment flow needs a branch based on `isGift`:

```typescript
// Current flow (payment-client.tsx line 74)
const result = await createPaymentIntentMutation.mutateAsync({
  packageId: selectedPackage.id,
  // ...
})

// Needed flow
if (isGift) {
  const result = await createGiftMutation.mutateAsync({
    packageId: selectedPackage.id,
    giftRecipient: {
      firstName: giftRecipient.firstName,
      lastName: giftRecipient.lastName,
      email: giftRecipient.email,
      phone: giftRecipient.phone,
    },
    giftMessage: giftMessage || undefined,
    giftDeliveryDate: giftDeliveryOption === 'scheduled' && giftDeliveryDate
      ? giftDeliveryDate.toISOString()
      : undefined,
    // ...standard booking fields
  })
} else {
  // Existing createPaymentIntent flow
}
```

### Anti-Patterns to Avoid
- **Don't duplicate validation:** The `createGift` mutation already validates recipient email, delivery date, etc.
- **Don't modify the createGift mutation:** It's complete and tested
- **Don't add new gift UI components:** They all exist in components/booking/

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gift state management | Custom state logic | lib/gift/gift-state-machine.ts | Already handles all transitions |
| Gift validation | Manual field checking | booking store validateGiftBooking() | Already exists (lines 681-758) |
| Acceptance tokens | Manual UUID generation | crypto.randomUUID() in createGift | Already implemented |
| Email sending | Custom email logic | Existing templates + transition service | Side effects handled automatically |
| Scheduled delivery | Custom scheduler | app/api/cron/send-scheduled-gifts | Already implemented |

**Key insight:** This phase is 90% wiring, 10% implementation. The infrastructure is built; it just needs to be connected.

## Common Pitfalls

### Pitfall 1: Calling Wrong Mutation
**What goes wrong:** Using `createPaymentIntent` for gift bookings loses all gift data
**Why it happens:** The payment flow was built for standard bookings
**How to avoid:** Check `isGift` from booking store BEFORE creating payment intent
**Warning signs:** Gift bookings work but have no recipient info

### Pitfall 2: Forgetting Gift Validation
**What goes wrong:** Users proceed to payment with invalid gift data
**Why it happens:** Review page doesn't check gift validation
**How to avoid:** Call `validateGiftBooking()` in review-client.tsx before enabling payment button
**Warning signs:** Empty recipient name/email in database

### Pitfall 3: Date Serialization Issues
**What goes wrong:** Scheduled delivery dates arrive as null or wrong timezone
**Why it happens:** Date objects don't serialize to JSON properly
**How to avoid:** Use `toISOString()` when passing to createGift mutation
**Warning signs:** Gifts scheduled for wrong date or sent immediately

### Pitfall 4: Gift vs Companion Mutual Exclusion
**What goes wrong:** User enables both gift mode and companion mode
**Why it happens:** UI might not enforce exclusivity
**How to avoid:** Store already handles this (toggleGift disables companion, line 660-666)
**Warning signs:** N/A - already handled in store

## Code Examples

### Example 1: Detecting Gift Mode in Payment Flow
```typescript
// In payment-client.tsx
const {
  isGift,
  giftRecipient,
  giftMessage,
  giftDeliveryOption,
  giftDeliveryDate,
  validateGiftBooking,
  // ... existing store fields
} = useBookingStore()

// Before payment
if (isGift) {
  const validation = validateGiftBooking()
  if (!validation.isValid) {
    setError(validation.errors.join(', '))
    return
  }
}
```

### Example 2: Calling createGift Mutation
```typescript
// In payment-client.tsx
const createGiftMutation = trpc.booking.createGift.useMutation()

if (isGift && giftRecipient) {
  const result = await createGiftMutation.mutateAsync({
    packageId: selectedPackage.id,
    tripId: selectedTripId || undefined,
    duration,
    accommodationTier,
    addOnIds: selectedAddOns.map((a) => a.id),
    referralCode: referralCode || undefined,
    giftRecipient: {
      firstName: giftRecipient.firstName,
      lastName: giftRecipient.lastName,
      email: giftRecipient.email,
      phone: giftRecipient.phone || undefined,
      dateOfBirth: giftRecipient.dateOfBirth || undefined,
    },
    giftMessage: giftMessage || undefined,
    giftDeliveryDate: giftDeliveryOption === 'scheduled' && giftDeliveryDate
      ? giftDeliveryDate.toISOString()
      : undefined,
  })

  setClientSecret(result.clientSecret)
  setBookingReference(result.bookingReference)
}
```

### Example 3: GiftSection Already Integrated
```tsx
// app/booking/configure/add-ons/page.tsx - ALREADY DONE (line 67)
<GiftSection />
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Manual gift toggle | useBookingStore toggleGift() | State already managed |
| Manual validation | validateGiftBooking() | Validation already built |
| Custom emails | Gift email templates | Templates already exist |

**What's current:**
- Gift state machine pattern (PENDING -> SENT -> ACCEPTED/DECLINED/EXPIRED)
- Zustand store with gift fields persisted to localStorage
- tRPC mutation with all validation and side effects

**Not deprecated:** Everything in this phase uses current patterns.

## Open Questions

1. **Currency support for gift bookings**
   - What we know: `createGift` uses USD hardcoded (line 2628)
   - What's unclear: Should gift bookings support multi-currency like standard bookings?
   - Recommendation: Accept as-is for Phase 5, add currency support if needed later

2. **Installment plans for gifts**
   - What we know: `createGift` doesn't support installment plans
   - What's unclear: Is this intentional?
   - Recommendation: Gift bookings are typically one-time payments; installment support is lower priority

## Implementation Checklist

Based on research, here's what needs to be done:

### Required Changes

1. **payment-client.tsx** - Branch on isGift to call createGift
   - Import gift-related fields from booking store
   - Add createGift mutation
   - Conditionally call createGift when isGift is true
   - Handle createGift response (has different shape than createPaymentIntent)

2. **review-client.tsx** - Validate gift booking
   - Import validateGiftBooking from booking store
   - Add validation check before enabling payment button
   - Show validation errors if gift data is incomplete

### Already Complete (No Changes Needed)

- GiftSection in add-ons page (already integrated)
- GiftToggle component
- GiftRecipientForm component
- GiftMessageField component
- GiftDeliveryDateSelector component
- GiftBookingSummary on review page
- All email templates
- createGift mutation
- Gift state machine and transition service
- Database schema
- Cron jobs for scheduled delivery and expiration

## Sources

### Primary (HIGH confidence)
- `/Users/grantcharge/Pickleball-Passport/lib/stores/booking-store.ts` - Gift fields (lines 78-84, 155-161, 645-758)
- `/Users/grantcharge/Pickleball-Passport/lib/trpc/server/routers/booking.ts` - createGift mutation (lines 2441-2835)
- `/Users/grantcharge/Pickleball-Passport/lib/gift/gift-state-machine.ts` - State transitions
- `/Users/grantcharge/Pickleball-Passport/components/booking/gift-*.tsx` - All UI components
- `/Users/grantcharge/Pickleball-Passport/app/booking/configure/add-ons/page.tsx` - GiftSection integration (line 67)

### Secondary (MEDIUM confidence)
- `/Users/grantcharge/Pickleball-Passport/app/booking/payment/payment-client.tsx` - Current payment flow
- `/Users/grantcharge/Pickleball-Passport/app/booking/review/review-client.tsx` - Current review flow

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All infrastructure is built and verified
- Architecture: HIGH - Clear patterns from existing code
- Pitfalls: MEDIUM - Inferred from code structure, not runtime testing

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable codebase)
