# Phase 3: Partner Portal - Research

**Researched:** 2026-01-26
**Domain:** Partner dashboard data display and referral link functionality
**Confidence:** HIGH

## Summary

Phase 3 focuses on completing the partner portal's core display and sharing functionality. The existing codebase has **extensive infrastructure already built** for the partner program, including:

- Complete partner dashboard with stats (referrals, conversion, points, revenue)
- Full referral tracking system with cookie-based attribution
- Referral link generator page with QR codes and copy functionality
- Stripe Connect integration for payouts
- Commission reports with filtering and CSV export

**What exists and works:**
- `getDashboardStats` tRPC procedure returns totalReferrals, confirmedReferrals, pendingReferrals, conversionRate, totalPointsEarned, currentPoints, totalRevenue
- Dashboard page displays these stats in real-time
- Copy button for referral CODE works (copies just the code, e.g., "VILLAGES-JEN-2025")
- Referral link route `/r/[code]` handles UTM parameters from incoming links

**Gaps identified (requirements not yet met):**
1. **PTR-02 (Pending vs Available)**: Dashboard shows only "currentPoints" - no separation of pending vs available commissions
2. **PTR-03/PTR-04 (UTM Link Copy)**: Referral-links page builds URL without UTM params; user copies link manually but no auto-UTM generation

**Primary recommendation:** Add pending/available commission split to dashboard stats and enhance referral link copy to auto-include UTM parameters.

## Current State Analysis

### PTR-01: Real-time Referral Count and Conversion Data
**Status:** MOSTLY COMPLETE
**Confidence:** HIGH (verified in codebase)

The existing `getDashboardStats` procedure at `/lib/trpc/server/routers/partner.ts:97-188` returns:
- `totalReferrals` - count of all PartnerReferral records
- `confirmedReferrals` - count where booking.status === 'CONFIRMED'
- `pendingReferrals` - calculated as totalReferrals - confirmedReferrals
- `conversionRate` - percentage of confirmed vs total

Dashboard at `/app/(dashboard)/dashboard/partner/page.tsx` displays these stats in real-time via tRPC query.

**What might be missing:**
- The stats update on query refetch, but there's no websocket/real-time push
- For MVP, query refetch on page load is sufficient

**Verdict:** Requirement likely met. Verify with manual testing.

### PTR-02: Pending vs Available Commission Balance
**Status:** GAP IDENTIFIED
**Confidence:** HIGH (verified in codebase)

Current implementation:
- `passportPoints` field on PartnerProfile stores a single balance
- Points are awarded when booking is attributed (PartnerReferral created)
- No distinction between "pending" (awaiting trip completion) and "available" (ready for payout)

Missing:
- Business logic to determine when points become "available"
- Likely trigger: Trip completion (booking.status === 'COMPLETED')
- Dashboard needs to show separate totals

**Implementation approach:**
```typescript
// In getDashboardStats, add:
const pendingCommission = referrals
  .filter(r => r.booking.status !== 'COMPLETED')
  .reduce((sum, r) => sum + r.pointsEarned, 0);

const availableCommission = referrals
  .filter(r => r.booking.status === 'COMPLETED')
  .reduce((sum, r) => sum + r.pointsEarned, 0);
```

**Business decision needed:** What defines "available"? Options:
1. Trip completed (booking.status === 'COMPLETED')
2. X days after trip end date
3. Manual admin release

**Recommendation:** Use booking.status === 'COMPLETED' for MVP simplicity.

### PTR-03: One-Click Copy Referral Link
**Status:** PARTIAL - CODE EXISTS, LINK COPY NEEDS ENHANCEMENT
**Confidence:** HIGH (verified in codebase)

Current implementation in `/app/(dashboard)/dashboard/partner/page.tsx:96-102`:
```typescript
const handleCopyCode = async () => {
  if (profile?.referralCode) {
    await navigator.clipboard.writeText(profile.referralCode);
    // ...
  }
};
```

This copies the **referral code** (e.g., "VILLAGES-JEN-2025"), NOT the full URL.

In `/app/(dashboard)/dashboard/partner/referral-links/page.tsx:69-73`:
```typescript
const handleCopyLink = async (link: string) => {
  await navigator.clipboard.writeText(link);
  // ...
};
```

This copies the **full URL** (e.g., "https://example.com/r/VILLAGES-JEN-2025").

**Gap:** Main dashboard only has "Copy Code" button, not "Copy Link" button.

**Fix:** Add "Copy Link" button to main dashboard that copies the full URL.

### PTR-04: UTM Parameters in Referral Link
**Status:** GAP IDENTIFIED
**Confidence:** HIGH (verified in codebase)

Current implementation:
- `/r/[code]` route **reads** UTM params from incoming URL (lines 28-31)
- UTM params are stored in ReferralEvent table
- BUT: No automatic UTM generation when partner copies link

In referral-links page, the default link is built as:
```typescript
const defaultLink = profile?.referralCode
  ? `${baseUrl}/r/${profile.referralCode}`
  : '';
```

**Gap:** No utm_source, utm_medium, utm_campaign appended.

**Required fix:**
```typescript
const defaultLink = profile?.referralCode
  ? `${baseUrl}/r/${profile.referralCode}?utm_source=partner&utm_medium=referral&utm_campaign=${encodeURIComponent(profile.referralCode)}`
  : '';
```

## Standard Stack

### Core (Already in Use)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| tRPC | 11.x | API layer | Existing |
| React Query | via tRPC | Data fetching | Existing |
| Prisma | 5.22.0 | ORM | Existing |
| Clerk | 6.x | Auth | Existing |
| qrcode.react | - | QR code generation | Existing |

### No New Libraries Needed
All requirements can be implemented using existing patterns and libraries.

## Architecture Patterns

### Existing Pattern: Dashboard Stats Query
```typescript
// Source: /lib/trpc/server/routers/partner.ts
getDashboardStats: partnerProcedure.query(async ({ ctx }) => {
  const profile = await ctx.db.partnerProfile.findUnique({...});
  const referrals = await ctx.db.partnerReferral.findMany({...});

  // Calculate derived stats
  return {
    totalReferrals,
    confirmedReferrals,
    // ... existing stats
  };
});
```

### Pattern for Enhancement: Adding Pending/Available Split
```typescript
// Add to getDashboardStats return object:
return {
  // ... existing
  pendingCommission: referrals
    .filter(r => r.booking.status !== 'COMPLETED')
    .reduce((sum, r) => sum + r.pointsEarned, 0),
  availableCommission: referrals
    .filter(r => r.booking.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.pointsEarned, 0),
};
```

### Pattern for UTM Link Generation
```typescript
// Client-side in React component:
const generateReferralLink = (code: string) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    utm_source: 'partner',
    utm_medium: 'referral',
    utm_campaign: code,
  });
  return `${baseUrl}/r/${code}?${params.toString()}`;
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clipboard copy | Custom clipboard API wrapper | Native `navigator.clipboard.writeText()` | Already works everywhere |
| UTM generation | Server-side link builder | Client-side URLSearchParams | Simple, no API call needed |
| Real-time updates | WebSocket system | React Query refetch on focus | Sufficient for MVP |

## Common Pitfalls

### Pitfall 1: Copy Without Feedback
**What goes wrong:** User clicks copy, nothing happens visually
**Why it happens:** No state to track copy success
**How to avoid:** Already handled - existing code shows "Copied!" state for 2 seconds
**Existing pattern:** `setCopiedLink(link); setTimeout(() => setCopiedLink(null), 2000);`

### Pitfall 2: UTM Parameter Encoding
**What goes wrong:** Special characters in referral codes break URLs
**Why it happens:** Unencoded characters like spaces or symbols
**How to avoid:** Use `encodeURIComponent()` for campaign parameter
**Example:** `utm_campaign=${encodeURIComponent(code)}`

### Pitfall 3: Pending vs Available Definition Ambiguity
**What goes wrong:** Different stakeholders have different expectations
**Why it happens:** No documented business rule
**How to avoid:** Define clearly: "Available = booking.status === 'COMPLETED'"
**Documentation:** Add comment in code explaining the rule

### Pitfall 4: Clipboard API HTTPS Requirement
**What goes wrong:** Copy fails silently in development (http://localhost)
**Why it happens:** Clipboard API requires secure context in some browsers
**How to avoid:** Already handled - existing code works in local dev
**Note:** This is typically only an issue on non-localhost HTTP

## Code Examples

### Example 1: Enhanced Dashboard Stats (PTR-02)
```typescript
// Source: Add to /lib/trpc/server/routers/partner.ts getDashboardStats

// Calculate commission breakdown by status
const completedReferrals = referrals.filter(
  (r) => r.booking.status === 'COMPLETED'
);
const pendingReferrals = referrals.filter(
  (r) => r.booking.status !== 'COMPLETED'
);

const availableCommission = completedReferrals.reduce(
  (sum, r) => sum + r.pointsEarned,
  0
);
const pendingCommission = pendingReferrals.reduce(
  (sum, r) => sum + r.pointsEarned,
  0
);

return {
  // ... existing fields
  pendingCommission,
  availableCommission,
};
```

### Example 2: Dashboard UI for Pending/Available (PTR-02)
```tsx
// Source: Add to /app/(dashboard)/dashboard/partner/page.tsx Stats Grid

{/* Pending Commission */}
<div className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-600">Pending Commission</p>
      <p className="mt-2 text-3xl font-bold text-amber-600">
        {stats.pendingCommission.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Awaiting trip completion
      </p>
    </div>
    <div className="rounded-full bg-amber-100 p-3">
      <Clock className="h-6 w-6 text-amber-600" />
    </div>
  </div>
</div>

{/* Available Commission */}
<div className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-600">Available Commission</p>
      <p className="mt-2 text-3xl font-bold text-emerald-600">
        {stats.availableCommission.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Ready for payout
      </p>
    </div>
    <div className="rounded-full bg-emerald-100 p-3">
      <CheckCircle className="h-6 w-6 text-emerald-600" />
    </div>
  </div>
</div>
```

### Example 3: Copy Link with UTM Parameters (PTR-03, PTR-04)
```tsx
// Source: Add/modify in partner dashboard

const handleCopyLink = async () => {
  if (!profile?.referralCode) return;

  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    utm_source: 'partner',
    utm_medium: 'referral',
    utm_campaign: profile.referralCode,
  });
  const fullLink = `${baseUrl}/r/${profile.referralCode}?${params.toString()}`;

  await navigator.clipboard.writeText(fullLink);
  setCopiedLink(true);
  setTimeout(() => setCopiedLink(false), 2000);
};

// Button in UI
<Button onClick={handleCopyLink} variant="outline" className="gap-2">
  {copiedLink ? (
    <>
      <Check className="h-4 w-4" />
      Copied!
    </>
  ) : (
    <>
      <Copy className="h-4 w-4" />
      Copy Link
    </>
  )}
</Button>
```

## Implementation Complexity

### PTR-01: Real-time Referral Count
**Complexity:** TRIVIAL
**Reason:** Already implemented, just verify

### PTR-02: Pending vs Available Commission
**Complexity:** LOW
**Files to modify:**
1. `/lib/trpc/server/routers/partner.ts` - Add fields to getDashboardStats
2. `/app/(dashboard)/dashboard/partner/page.tsx` - Add UI cards

**Estimated effort:** 30-60 minutes

### PTR-03: One-Click Copy Referral Link
**Complexity:** LOW
**Files to modify:**
1. `/app/(dashboard)/dashboard/partner/page.tsx` - Add "Copy Link" button

**Estimated effort:** 15-30 minutes

### PTR-04: UTM Parameters in Link
**Complexity:** LOW
**Files to modify:**
1. `/app/(dashboard)/dashboard/partner/page.tsx` - Update handleCopyLink
2. `/app/(dashboard)/dashboard/partner/referral-links/page.tsx` - Update defaultLink

**Estimated effort:** 15-30 minutes

## Open Questions

1. **Pending/Available Business Rule**
   - What we know: Points are awarded on booking attribution
   - What's unclear: When exactly should points become "available"?
   - Recommendation: Use booking.status === 'COMPLETED' for MVP

2. **UTM Parameter Values**
   - What we know: utm_source, utm_medium, utm_campaign are standard
   - What's unclear: What values does marketing want?
   - Recommendation: Use partner/referral/{code} as defaults, can customize later

## Sources

### Primary (HIGH confidence)
- `/lib/trpc/server/routers/partner.ts` - Existing partner router implementation
- `/app/(dashboard)/dashboard/partner/page.tsx` - Existing dashboard page
- `/app/(dashboard)/dashboard/partner/referral-links/page.tsx` - Referral link generator
- `/app/r/[code]/route.ts` - Referral tracking route handler
- `/prisma/schema.prisma` - Database schema for PartnerProfile, PartnerReferral

### Secondary (MEDIUM confidence)
- `/.planning/REQUIREMENTS.md` - Requirements definition

## Metadata

**Confidence breakdown:**
- Current state analysis: HIGH - Direct codebase verification
- Implementation approach: HIGH - Using existing patterns
- Complexity estimates: MEDIUM - Subject to edge cases in testing

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain)

---

## Summary for Planner

**What exists:**
- Complete partner dashboard infrastructure
- Referral tracking with cookie-based attribution
- Stats queries returning all needed data (except pending/available split)
- Copy button for referral code (but not full link with UTM)

**Gaps to fill:**
1. Add `pendingCommission` and `availableCommission` to getDashboardStats
2. Add UI cards for pending/available in dashboard
3. Add "Copy Link" button to main dashboard (not just referral-links page)
4. Ensure copied link includes UTM parameters

**Total estimated effort:** 1-2 hours of coding plus testing

**Risk level:** LOW - All changes are additive, no breaking changes to existing functionality
