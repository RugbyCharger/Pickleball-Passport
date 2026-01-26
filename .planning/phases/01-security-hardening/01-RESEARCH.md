# Phase 1: Security Hardening - Research

**Researched:** 2026-01-26
**Domain:** Authentication, Authorization, Webhook Security, Token Security, Database Security
**Confidence:** HIGH

## Summary

This research covers the six security requirements for Phase 1: Security Hardening of the Pickleball Passport platform. The codebase has a solid foundation with Clerk authentication, Stripe Connect integration, and existing HMAC token implementation. However, several critical gaps need addressing before launch.

**Key findings:**
1. **Middleware protection is missing** - The current `middleware.ts` is a no-op that passes all requests through without any role checking
2. **SendGrid webhook uses custom crypto instead of official SDK** - This is fragile and may not correctly verify signatures
3. **Email token security is already well-implemented** - Only needs minor production enforcement improvements
4. **Documents page already uses authenticated user ID** - The concern in CONCERNS.md has been resolved
5. **Bank account data should be removed entirely** - Stripe Connect is already integrated; local bank storage is legacy

**Primary recommendation:** Implement clerkMiddleware with createRouteMatcher for admin routes, switch SendGrid to official SDK, and remove PartnerBankAccount fields in favor of Stripe Connect.

## Current State Analysis

### SEC-01 & SEC-02: Admin Route Protection

**Current middleware.ts (lines 1-9):**
```typescript
import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()  // NO-OP - passes everything through!
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Analysis:** The middleware does nothing - it just returns `NextResponse.next()` for all requests. There is NO role-based access control at the middleware level.

**Current admin page protection (app/(dashboard)/dashboard/admin/page.tsx lines 20-36):**
```typescript
const user = await currentUser();

if (!user) {
  redirect('/sign-in');
}

// SECURITY: Verify user has ADMIN role
const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
  select: { role: true },
});

if (!dbUser || dbUser.role !== 'ADMIN') {
  redirect('/dashboard');
}
```

**Analysis:** The main admin page HAS protection, but it's implemented at the page level, not middleware. This means:
1. Each admin page must implement its own protection (50+ admin pages exist!)
2. Many admin pages are client components using tRPC (e.g., analytics, bookings)
3. Client component pages do NOT verify admin role at page level - they rely on tRPC `adminProcedure`

**Existing tRPC protection (lib/trpc/server/trpc.ts lines 96-98):**
```typescript
export const guestProcedure = t.procedure.use(enforceRole(['GUEST', 'PARTNER', 'ADMIN']))
export const partnerProcedure = t.procedure.use(enforceRole(['PARTNER', 'ADMIN']))
export const adminProcedure = t.procedure.use(enforceRole(['ADMIN']))
```

**Good news:** The tRPC layer properly enforces admin role. The gap is at the route/page level where:
- Users can access admin pages even if they can't call procedures
- This is confusing UX and exposes admin UI structure

**Files that need modification:**
- `/middleware.ts` - Implement clerkMiddleware with role checking

### SEC-03: SendGrid Webhook Signature Verification

**Current implementation (app/api/webhooks/sendgrid/events/route.ts lines 45-104):**
```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  // ... custom crypto implementation using crypto.createVerify('sha256')
  const verifier = crypto.createVerify('sha256');
  verifier.update(payloadToVerify);
  verifier.end();

  const isValid = verifier.verify(
    verificationKey,
    signature,
    'base64'
  );
  // ...
}
```

**Problem:** This uses raw Node.js crypto instead of the official `@sendgrid/eventwebhook` SDK. The custom implementation may not correctly handle SendGrid's specific ECDSA signature format.

**Verified official pattern (Context7 - @sendgrid/eventwebhook):**
```typescript
const {EventWebhook, EventWebhookHeader} = require('@sendgrid/eventwebhook');

const eventWebhook = new EventWebhook();
const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey);
const isValid = eventWebhook.verifySignature(ecPublicKey, payload, signature, timestamp);
```

**Key differences:**
- Official SDK uses `convertPublicKeyToECDSA()` to properly format the key
- Official SDK handles the signature format correctly
- Official SDK has been tested against SendGrid's actual signatures

**Files that need modification:**
- `/app/api/webhooks/sendgrid/events/route.ts` - Replace custom verification with SDK

**Installation required:**
```bash
pnpm add @sendgrid/eventwebhook
```

### SEC-04: Email Token HMAC Secret Enforcement

**Current implementation (lib/preferences/email-token.ts lines 12-34):**
```typescript
function getEmailTokenSecret(): string {
  const secret = process.env.EMAIL_TOKEN_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  // In production, require a properly configured secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SECURITY ERROR: EMAIL_TOKEN_SECRET must be set in production. ' +
        'Generate a secure 32+ character secret and add it to your environment variables.'
    );
  }

  // In development, generate a random secret and warn
  const devSecret = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[DEV ONLY] EMAIL_TOKEN_SECRET not configured. Using random secret. ' +
      'Email tokens will not persist across server restarts.'
  );
  return devSecret;
}
```

**Analysis:** This is ALREADY correctly implemented! The code:
1. Requires 32+ character secret in production (throws error if missing)
2. Only uses fallback in development
3. Uses HMAC-SHA256 for hashing
4. Uses `crypto.timingSafeEqual()` for constant-time comparison

**Status:** SEC-04 is ALREADY SATISFIED. The CONCERNS.md entry is outdated.

**Verification needed:** Confirm production environment has `EMAIL_TOKEN_SECRET` configured in Vercel/deployment.

### SEC-05: Document Upload User ID

**Current implementation (app/(dashboard)/dashboard/documents/page.tsx lines 140-154):**
```typescript
// SECURITY: Ensure user is authenticated before uploading
if (!isLoaded || !user?.id) {
  alert('Please sign in to upload documents');
  return;
}

setUploading(true);

try {
  // Get authenticated user ID from Clerk
  const userId = user.id;  // <-- Uses real user ID!

  // Upload to Supabase Storage
  const { url } = await uploadFile(file, userId, selectedType);
```

**Analysis:** This is ALREADY correctly implemented! The code:
1. Checks if user is authenticated
2. Uses `user.id` from Clerk's `useUser()` hook
3. Passes the real user ID to the upload function

**Status:** SEC-05 is ALREADY SATISFIED. The CONCERNS.md entry (mentioning hardcoded test ID at line 143) is outdated - the code has been fixed.

### SEC-06: Partner Bank Account Data Removal

**Current schema (prisma/schema.prisma lines 892-907):**
```prisma
model PartnerPayoutMethod {
  id        String         @id @default(cuid())
  partnerId String         @unique
  partner   PartnerProfile @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  // Bank Account (encrypted storage in production)
  bankName      String
  accountNumber String  // TODO: Encrypt in production
  routingNumber String  // TODO: Encrypt in production

  // Display
  accountLast4 String // Last 4 digits for display

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Current usage (lib/trpc/server/routers/partner.ts lines 1790-1837):**
```typescript
updatePayoutSettings: partnerProcedure
  .input(
    z.object({
      bankName: z.string().min(1),
      accountNumber: z.string().min(4),
      routingNumber: z.string().min(9),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // ... stores bank data in PartnerPayoutMethod
  })
```

**Stripe Connect status (lib/stripe/stripe-connect.ts and schema):**
```prisma
// PartnerProfile already has:
stripeConnectAccountId          String?
stripeConnectOnboardingComplete Boolean  @default(false)
stripeConnectAccountType        String?
stripeConnectPayoutsEnabled     Boolean  @default(false)
```

**Analysis:** The Stripe Connect integration is already built. The local `PartnerPayoutMethod` table storing bank details is legacy and should be removed entirely.

**Removal plan:**
1. Check if any PartnerPayoutMethod records exist (data migration concern)
2. Remove the `updatePayoutSettings` tRPC procedure
3. Remove the `PartnerPayoutMethod` model from schema
4. Ensure all payout flows use Stripe Connect exclusively
5. Update any UI that references bank account settings

**Files that need modification:**
- `/prisma/schema.prisma` - Remove PartnerPayoutMethod model
- `/lib/trpc/server/routers/partner.ts` - Remove updatePayoutSettings procedure
- Any partner UI components referencing bank settings (need to search)

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @clerk/nextjs | ^6.36.5 | Authentication & middleware | Already in use; provides clerkMiddleware |
| @sendgrid/eventwebhook | latest | Webhook signature verification | Official SDK; handles ECDSA correctly |

### Supporting (Already Present)

| Library | Version | Purpose | In Codebase |
|---------|---------|---------|-------------|
| crypto (Node.js built-in) | N/A | HMAC token hashing | Already used correctly |
| stripe | latest | Payments & Connect | Already integrated |

### Installation

```bash
pnpm add @sendgrid/eventwebhook
```

## Architecture Patterns

### Recommended Pattern: clerkMiddleware with createRouteMatcher

**Confidence:** HIGH (verified via Context7)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isPartnerRoute = createRouteMatcher(['/dashboard/partner(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/packages(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',  // Webhooks handle their own auth
])

export default clerkMiddleware(async (auth, request) => {
  // Admin routes: require ADMIN role
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check role from session claims OR database
    const role = sessionClaims?.metadata?.role
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // All dashboard routes require authentication
  if (isDashboardRoute(request)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Recommended Pattern: SendGrid Webhook with Official SDK

**Confidence:** HIGH (verified via Context7)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const signature = request.headers.get(EventWebhookHeader.SIGNATURE())
  const timestamp = request.headers.get(EventWebhookHeader.TIMESTAMP())
  const publicKey = process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY

  if (!publicKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('SENDGRID_WEBHOOK_VERIFICATION_KEY not configured')
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    console.warn('[DEV] Skipping SendGrid signature verification')
  } else {
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    try {
      const eventWebhook = new EventWebhook()
      const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey)
      const isValid = eventWebhook.verifySignature(ecPublicKey, rawBody, signature, timestamp)

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } catch (error) {
      console.error('Signature verification failed:', error)
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    }
  }

  // Parse and process verified payload
  const events = JSON.parse(rawBody)
  // ... process events
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SendGrid signature verification | Custom crypto.createVerify | @sendgrid/eventwebhook SDK | Handles ECDSA key format correctly |
| Partner bank storage | PartnerPayoutMethod | Stripe Connect | PCI compliance, security, maintenance |
| Admin route protection | Per-page role checks | clerkMiddleware | Centralized, consistent, can't be bypassed |

## Common Pitfalls

### Pitfall 1: Clerk Session Claims vs Database Role

**What goes wrong:** Using `sessionClaims?.metadata?.role` without database verification
**Why it happens:** Session claims may not be synced if role changes after login
**How to avoid:** For critical operations, verify role against database. For middleware (UX), session claims are acceptable.
**Warning signs:** User role changed but access not updated until re-login

### Pitfall 2: Raw Body vs Parsed JSON for Webhooks

**What goes wrong:** Signature verification fails because body was parsed as JSON first
**Why it happens:** Express/Next.js middleware may parse body before handler
**How to avoid:** Use `request.text()` BEFORE any JSON parsing; use `express.raw()` in Express
**Warning signs:** Valid webhooks rejected; signature mismatch errors in logs

### Pitfall 3: Non-Constant-Time Comparison for Tokens

**What goes wrong:** Token verification vulnerable to timing attacks
**Why it happens:** Using `===` instead of `crypto.timingSafeEqual()`
**How to avoid:** Always use timing-safe comparison for secrets
**Warning signs:** Not detectable without specialized security testing

### Pitfall 4: Missing Verification Key in Production

**What goes wrong:** Webhooks rejected or (worse) verification skipped entirely
**Why it happens:** Environment variable not set in production deployment
**How to avoid:** Fail fast with clear error message; check on app startup
**Warning signs:** Webhook failures in production; console.error about missing key

## Requirements Dependencies

**Optimal implementation order:**

```
SEC-04 (Email Token) ──┐
                       ├── Independent, can be verified first (already done!)
SEC-05 (Documents)  ───┘

SEC-01/SEC-02 (Admin Routes) ── Must be done together
                │
                └── Depends on: Understanding Clerk session claims

SEC-03 (SendGrid) ── Independent
                │
                └── Requires: pnpm add @sendgrid/eventwebhook

SEC-06 (Bank Data) ── Most impactful change
                │
                └── Requires: Database migration, UI updates, data migration consideration
```

**Recommended order:**
1. **SEC-04 & SEC-05** - Verify already fixed (no code changes needed)
2. **SEC-03** - Install SDK, replace webhook code (isolated change)
3. **SEC-01 & SEC-02** - Update middleware (foundational security)
4. **SEC-06** - Remove bank data (breaking change, needs careful rollout)

## Files Summary

### Files Needing Modification

| Requirement | File | Change |
|-------------|------|--------|
| SEC-01, SEC-02 | `/middleware.ts` | Replace no-op with clerkMiddleware |
| SEC-03 | `/app/api/webhooks/sendgrid/events/route.ts` | Use @sendgrid/eventwebhook SDK |
| SEC-06 | `/prisma/schema.prisma` | Remove PartnerPayoutMethod model |
| SEC-06 | `/lib/trpc/server/routers/partner.ts` | Remove updatePayoutSettings |

### Files Already Correct (No Changes Needed)

| Requirement | File | Status |
|-------------|------|--------|
| SEC-04 | `/lib/preferences/email-token.ts` | Already enforces 32+ char secret in production |
| SEC-05 | `/app/(dashboard)/dashboard/documents/page.tsx` | Already uses authenticated user.id |

### New Files

| Requirement | File | Purpose |
|-------------|------|---------|
| N/A | None required | All fixes are modifications to existing files |

## Open Questions

1. **Clerk Session Claims Setup**
   - What we know: Middleware can check `sessionClaims?.metadata?.role`
   - What's unclear: Is Clerk configured to sync role from database to session claims?
   - Recommendation: If not configured, check database in middleware instead

2. **Existing PartnerPayoutMethod Data**
   - What we know: The model exists and may have data
   - What's unclear: Are there any partners using legacy bank storage instead of Stripe Connect?
   - Recommendation: Query production database before removal; migrate if needed

3. **Partner UI for Bank Settings**
   - What we know: `updatePayoutSettings` procedure exists
   - What's unclear: Which UI components call this procedure?
   - Recommendation: Search for "updatePayoutSettings" and "bankName" in components

## Sources

### Primary (HIGH confidence)
- Context7 `/clerk/clerk-nextjs-app-quickstart` - clerkMiddleware patterns
- Context7 `/sendgrid/sendgrid-nodejs` - EventWebhook SDK verification
- Codebase analysis - Current implementation state

### Secondary (MEDIUM confidence)
- STACK.md research document - Comprehensive security patterns
- CONCERNS.md - Identified security issues (some outdated)

### Tertiary (LOW confidence)
- None required - all patterns verified against primary sources

## Metadata

**Confidence breakdown:**
- Admin Route Protection: HIGH - Verified against Clerk official docs via Context7
- SendGrid Verification: HIGH - Verified against SendGrid SDK via Context7
- Email Token: HIGH - Code analysis confirms correct implementation
- Documents: HIGH - Code analysis confirms already fixed
- Bank Data Removal: MEDIUM - Need to verify no active data before removal

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable security patterns)
