---
phase: 03-partner-portal
plan: 02
subsystem: partner-portal
tags: [utm, referral, clipboard, qr-code]

dependency-graph:
  requires: []
  provides: [utm-tracking-links, copy-link-button]
  affects: [analytics, marketing-attribution]

tech-stack:
  added: []
  patterns: [utm-parameters, clipboard-api]

key-files:
  created: []
  modified:
    - app/(dashboard)/dashboard/partner/page.tsx
    - app/(dashboard)/dashboard/partner/referral-links/page.tsx

decisions:
  - id: UTM-PARAMS
    choice: "Standard UTM parameter naming (utm_source=partner, utm_medium=referral, utm_campaign={code})"
    rationale: "Industry standard for marketing attribution tracking"
  - id: COPY-LINK-PRIMARY
    choice: "Place Copy Link button before Copy Code button"
    rationale: "Full URL with UTM is the primary action for marketing attribution"
  - id: CAMPAIGN-SLUG
    choice: "Custom campaign UTM uses format {referralCode}-{campaign-slug}"
    rationale: "Keeps referral code identifiable while adding campaign context"

metrics:
  duration: 2 min
  completed: 2026-01-26
---

# Phase 3 Plan 2: UTM Referral Link Copy Summary

**One-liner:** Added Copy Link button with UTM tracking parameters to partner dashboard and referral links page.

## What Was Built

### Task 1: Copy Link Button on Main Dashboard
**Commit:** 71437e2

Added a "Copy Link" button to the main partner dashboard that copies the full referral URL with UTM parameters:

```typescript
const handleCopyLink = async () => {
  const params = new URLSearchParams({
    utm_source: 'partner',
    utm_medium: 'referral',
    utm_campaign: profile.referralCode,
  });
  const fullLink = `${baseUrl}/r/${profile.referralCode}?${params.toString()}`;
  await navigator.clipboard.writeText(fullLink);
};
```

**Example output:**
```
https://pickleballpassport.com/r/CLUB123?utm_source=partner&utm_medium=referral&utm_campaign=CLUB123
```

### Task 2: UTM Params in Referral Links Page
**Commit:** d29cb7d

Updated the referral links page to include UTM parameters in:

1. **Default link** - Now includes full UTM tracking
2. **QR code** - Encodes URL with UTM params (uses defaultLink)
3. **Custom campaign links** - Include campaign-specific UTM tracking

**Custom campaign URL format:**
```
https://pickleballpassport.com/r/CLUB123?utm_source=partner&utm_medium=referral&utm_campaign=CLUB123-spring-2024
```

## Requirements Satisfied

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| PTR-03: One-click referral link copy | COMPLETE | Copy Link button on main dashboard |
| PTR-04: UTM parameters in referral link | COMPLETE | All links include utm_source, utm_medium, utm_campaign |

## Files Modified

| File | Changes |
|------|---------|
| `app/(dashboard)/dashboard/partner/page.tsx` | +34 lines: copiedLink state, handleCopyLink function, Copy Link button |
| `app/(dashboard)/dashboard/partner/referral-links/page.tsx` | +8/-2 lines: UTM params in defaultLink and handleCreateCustomLink |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. Main dashboard Copy Link button: Copies URL with `?utm_source=partner&utm_medium=referral&utm_campaign={code}`
2. Referral links page default link: Includes UTM parameters
3. QR code: Encodes URL with UTM parameters
4. Custom campaign links: Include UTM with campaign-specific `utm_campaign` value

## Next Phase Readiness

**Phase 3 Status:** Plan 2/2 complete
**Ready for:** Phase 3 verification or Phase 4 (Email System)
