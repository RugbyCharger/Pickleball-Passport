---
phase: 10
plan: 02
title: "Clerk Auth + tRPC Client"
subsystem: mobile-auth
status: complete
tags: [clerk, trpc, expo, authentication, bearer-token]
created: 2026-01-28
completed: 2026-01-28

dependencies:
  requires: [10-01]
  provides: [mobile-auth, mobile-trpc-client]
  affects: [11-01, 11-02, 12-01]

tech-stack:
  added:
    - "@clerk/clerk-expo@2.19.20"
    - "expo-secure-store@15.0.8"
    - "@trpc/client@11.3.1"
    - "@trpc/react-query@11.3.1"
    - "@tanstack/react-query@5.90.20"
    - "superjson@2.2.6"
  patterns:
    - "Custom Clerk auth UI (no prebuilt components on mobile)"
    - "tRPC with Bearer token auth"
    - "expo-secure-store for token persistence"

key-files:
  created:
    - mobile/lib/auth.tsx
    - mobile/lib/trpc.ts
    - mobile/lib/api.tsx
    - mobile/.env.example
  modified:
    - mobile/app/_layout.tsx
    - mobile/app/(auth)/_layout.tsx
    - mobile/app/(auth)/sign-in.tsx
    - mobile/app/(auth)/sign-up.tsx
    - mobile/app/(app)/_layout.tsx
    - mobile/app/index.tsx
    - mobile/tsconfig.json
    - mobile/package.json

decisions:
  - id: trpc-type-any
    decision: "Use any type for tRPC router on mobile"
    rationale: "TypeScript follows type imports into web app code, causing compilation errors. Proper monorepo type sharing deferred to later phase."
    alternatives: ["Turborepo shared packages", "Separate @pickleball/api-types package", "TypeScript project references"]
  - id: tsconfig-skipLibCheck
    decision: "Enable skipLibCheck in mobile tsconfig"
    rationale: "Improves compilation speed and avoids issues with dependency type conflicts"

metrics:
  duration: "10 min"
  tasks: 3/3
  commits: 3
---

# Phase 10 Plan 02: Clerk Auth + tRPC Client Summary

Clerk auth with custom sign-in/sign-up UI and tRPC client with Bearer token headers for API calls.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install and configure Clerk | a9500e5 | lib/auth.tsx, .env.example |
| 2 | Build custom auth screens | d1bfc12 | sign-in.tsx, sign-up.tsx, index.tsx |
| 3 | Configure tRPC client | 9c3d1d5 | lib/trpc.ts, lib/api.tsx |

## Key Artifacts

### Authentication Layer
- **lib/auth.tsx**: ClerkProvider with expo-secure-store token cache
- **app/(auth)/sign-in.tsx**: Custom sign-in form with useSignIn hook
- **app/(auth)/sign-up.tsx**: Custom sign-up form with email verification
- **app/index.tsx**: Auth state routing (signed in -> tabs, not signed in -> sign-in)
- **app/(app)/_layout.tsx**: Protected route guard redirecting unauthenticated users

### API Layer
- **lib/trpc.ts**: tRPC client with httpBatchLink, Bearer token auth, superjson transformer
- **lib/api.tsx**: ApiProvider combining tRPC with React Query

### Provider Hierarchy
```
AuthProvider (Clerk)
  -> ApiProvider (tRPC + React Query)
    -> SafeAreaProvider
      -> ThemeProvider
        -> Stack Navigator
```

## Decisions Made

### tRPC Type Handling
**Decision:** Use `any` type for tRPC router instead of importing AppRouter from web app.

**Rationale:** TypeScript follows type imports, pulling in all web app router code and causing compilation errors due to missing path aliases (@/lib/*). The mobile tsconfig can't resolve web app's path aliases.

**Future Solution:** Set up proper monorepo type sharing via:
1. Turborepo/Nx with shared packages
2. Dedicated @pickleball/api-types package
3. TypeScript project references

**Impact:** No autocomplete for tRPC calls in mobile app, but runtime safety is still enforced by server-side schema validation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript import resolution for cross-project types**
- **Found during:** Task 3
- **Issue:** Importing AppRouter type from web app caused TypeScript to follow all imports, failing on @/* path aliases
- **Fix:** Used `any` type with explicit TODO comment for future proper type sharing
- **Files modified:** mobile/lib/trpc.ts
- **Commit:** 9c3d1d5

**2. [Rule 3 - Blocking] tRPC version pinning**
- **Found during:** Task 3
- **Issue:** npm installed with ^ prefix allowing semver upgrades
- **Fix:** Removed ^ prefix to pin exact version 11.3.1
- **Files modified:** mobile/package.json
- **Commit:** 9c3d1d5

## Technical Notes

### Clerk Configuration
- No prebuilt UI components for React Native - all custom forms
- Token cache uses expo-secure-store for persistence across app restarts
- Email verification flow supported with 6-digit code entry

### tRPC Configuration
- Pinned to v11.3.1 (v11.4+ has Hermes compatibility issues)
- superjson transformer for Date/BigInt serialization
- Bearer token added to every request via headers() callback
- API URL configurable via EXPO_PUBLIC_API_URL env var

## Verification Checklist

- [x] Clerk SDK installed and configured
- [x] Custom sign-in form with email/password
- [x] Custom sign-up form with email verification
- [x] Auth state routing (index.tsx redirects based on isSignedIn)
- [x] Protected routes redirect to sign-in
- [x] tRPC client with Bearer token auth
- [x] tRPC pinned to v11.3.1
- [x] TypeScript passes without errors

## Next Phase Readiness

**Ready for Phase 11 (Pre-Trip Features):**
- Authentication flow is complete
- tRPC client is configured
- Can start implementing dashboard data fetching

**Blockers:** None

**Technical Debt:**
- tRPC types need proper monorepo sharing (documented TODO)
- Mobile TypeScript doesn't have autocomplete for API calls
