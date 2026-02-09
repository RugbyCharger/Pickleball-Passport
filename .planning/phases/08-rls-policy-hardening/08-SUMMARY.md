# Phase 8 Summary: RLS Policy Hardening

## Completed: 2026-01-27

## What Was Built

Dropped all 24 overly permissive RLS policies ("Dev Access" and "Allow all for development") from the Supabase database, implementing defense-in-depth security.

## Key Decisions

1. **Service role only pattern**: App uses Prisma which connects via Supabase service role, not anon key. Service role automatically bypasses RLS.

2. **No replacement policies needed**: Instead of creating complex user-based policies, we rely on the fact that:
   - RLS enabled + no policies = deny all by default
   - Service role bypasses RLS automatically
   - Clerk handles authentication
   - tRPC protectedProcedure handles authorization

3. **INFO advisories are expected**: The "RLS Enabled No Policy" advisories (INFO level) are correct — they indicate tables are locked down to service role only.

## Artifacts

| File | Purpose |
|------|---------|
| `prisma/migrations/20260127_drop_permissive_rls_policies/migration.sql` | Migration that drops all permissive policies |

## Verification Results

**Security Advisor:**
- Before: 24 WARN (RLS Policy Always True)
- After: 0 WARN, 21 INFO (RLS Enabled No Policy)

**App Functionality:**
- Production URL: https://www.thepickleballpassport.org
- HTTP Status: 200 OK
- Service role access: Working (Prisma continues to function)

## Requirements Completed

- [x] RLS-01a-d: Core Business Tables (Booking, Payment, BookingAddOn, RefundLog)
- [x] RLS-02a-c: User & Profile Tables (User, GuestProfile, PartnerProfile)
- [x] RLS-03a-b: Partner Tables (PartnerReferral, Application)
- [x] RLS-04a-e: Content Tables (Package, Trip, AddOn, Itinerary, Testimonial)
- [x] RLS-05a-c: Communication Tables (Message, Notification, NewsletterSubscriber)
- [x] RLS-06a-b: Document & Support Tables (Document, SupportTicket)
- [x] RLS-07a-b: System Tables (WebhookEvent, ReminderHistory)
- [x] RLS-08a: Verify 0 WARN in Supabase advisor ✓
- [x] RLS-08b: Verify app functionality ✓

## Next Steps

v1.2 milestone complete. Options:
- `/gsd:complete-milestone` to archive v1.2
- Address INFO advisories (optional, expected behavior)
- Plan v1.3 features
