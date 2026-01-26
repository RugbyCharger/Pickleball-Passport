---
phase: 01-security-hardening
plan: 01
subsystem: auth
tags: [clerk, middleware, rbac, admin-protection, nextjs]

# Dependency graph
requires: []
provides:
  - clerkMiddleware implementation for route protection
  - ADMIN role enforcement for /dashboard/admin/* routes
  - Authentication requirement for all /dashboard/* routes
  - Webhook passthrough for /api/webhooks/* routes
affects: [admin-ui, partner-portal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - clerkMiddleware with createRouteMatcher for route-based auth
    - sessionClaims.metadata.role for RBAC checks

key-files:
  created: []
  modified:
    - middleware.ts

key-decisions:
  - "Use sessionClaims.metadata.role for ADMIN check (requires Clerk session customization)"
  - "Redirect non-admin users to /dashboard instead of 403 error (better UX)"
  - "Allow all /api/webhooks/* routes through without auth (webhooks self-verify)"

patterns-established:
  - "Route matcher pattern: createRouteMatcher with glob patterns for route grouping"
  - "Auth redirect pattern: Include redirect_url param for return-after-login"

# Metrics
duration: 3min
completed: 2026-01-26
---

# Phase 1 Plan 1: Admin Route Protection Summary

**clerkMiddleware with role-based route protection for admin and dashboard routes, replacing no-op middleware**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-26T10:02:30Z
- **Completed:** 2026-01-26T10:05:06Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced no-op middleware with full clerkMiddleware implementation
- Admin routes (/dashboard/admin/*) now require ADMIN role from session claims
- Dashboard routes (/dashboard/*) now require authentication
- Webhook routes (/api/webhooks/*) pass through without blocking for self-verification
- Proper redirect handling with redirect_url parameter for return-after-login UX

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement clerkMiddleware with admin route protection** - `eeeb5c8` (feat)

## Files Created/Modified

- `middleware.ts` - Complete replacement of no-op middleware with clerkMiddleware implementing:
  - Route matchers for admin, dashboard, and public routes
  - ADMIN role check via sessionClaims.metadata.role
  - Authentication redirect with redirect_url preservation
  - Proper config matcher excluding static files

## Decisions Made

1. **Use sessionClaims.metadata.role for ADMIN check** - This requires Clerk to be configured to sync the role to session claims, but provides faster checks without database queries. If role is not in claims, the check safely fails (no role = not admin = redirect).

2. **Redirect non-admin users to /dashboard** - Instead of showing a 403 error page, non-admin users attempting to access admin routes are redirected to the regular dashboard with no error message. This is better UX and avoids exposing admin route structure.

3. **Allow webhooks through without middleware auth** - Webhook routes (/api/webhooks/*) are in the public route matcher. Webhooks handle their own signature verification (e.g., SendGrid ECDSA signatures, Stripe webhook secrets).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Build requires EMAIL_TOKEN_SECRET**: The `pnpm build` command runs in production mode and requires `EMAIL_TOKEN_SECRET` to be set (per SEC-04 security requirement). This is unrelated to middleware changes and was resolved by providing a temporary secret for build verification. Production deployments should have this secret configured in environment variables.

## User Setup Required

**Clerk session customization may be required.** For the ADMIN role check to work, Clerk must be configured to include the user's role in session claims metadata:

1. In Clerk Dashboard, go to Sessions > Customize session token
2. Add custom claim: `metadata.role` mapped to user's publicMetadata.role
3. Ensure user records have `role: 'ADMIN'` in their publicMetadata

Without this configuration, all users will be treated as non-admin (safe fail-closed behavior).

## Next Phase Readiness

- Middleware protection is now in place for all dashboard routes
- Admin routes are protected at middleware level, supplementing existing tRPC adminProcedure checks
- Ready for 01-02 (SendGrid webhook SDK) and 01-03 (Bank data removal) which can run in parallel

---
*Phase: 01-security-hardening*
*Completed: 2026-01-26*
