# Roadmap: Pickleball Passport

## Current Milestone: v1.2 RLS Security Hardening

**Goal:** Replace overly permissive RLS policies with service-role-only access for defense-in-depth security.

### Phase 8: RLS Policy Hardening

**Goal:** Drop all "Dev Access" and "Allow all for development" policies, replacing with service-role-only access.

**Requirements:** RLS-01 through RLS-08 (all 24 requirements)

**Approach:**
- Create a single Supabase migration that drops all permissive policies
- RLS remains enabled but with no policies = deny all by default
- Service role bypasses RLS automatically (Supabase behavior)
- Verify via Supabase advisor (0 WARN)
- Smoke test app functionality

**Success Criteria:**
1. All 24 "Dev Access" / "Allow all for development" policies removed
2. Supabase security advisor shows 0 WARN
3. App booking flow works (uses service role via Prisma)
4. Admin dashboard works
5. Partner portal works
6. Gift flow works

**Plans:**
- `08-01-drop-permissive-policies` — Migration to drop all permissive RLS policies
- `08-02-verify-security` — Verify Supabase advisor and app functionality

---

## Archived Milestones

### v1.0 MVP (Shipped: 2026-01-26)
See: `.planning/milestones/v1.0-ROADMAP.md`

### v1.1 Gift Booking (Shipped: 2026-01-27)
See: `.planning/milestones/v1.1-ROADMAP.md`
