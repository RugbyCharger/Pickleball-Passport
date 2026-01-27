# v1.2 Requirements: RLS Security Hardening

## Overview

Replace all overly permissive "Dev Access" RLS policies (`USING(true)`) with service-role-only policies. The app uses Prisma which connects via Supabase service role, not the anon key, so all database access should be restricted to service role only.

## Requirements

### RLS-01: Core Business Tables
- [ ] **RLS-01a**: Harden `Booking` table — service role only
- [ ] **RLS-01b**: Harden `Payment` table — service role only
- [ ] **RLS-01c**: Harden `BookingAddOn` table — service role only
- [ ] **RLS-01d**: Harden `RefundLog` table — service role only

### RLS-02: User & Profile Tables
- [ ] **RLS-02a**: Harden `User` table — service role only
- [ ] **RLS-02b**: Harden `GuestProfile` table — service role only
- [ ] **RLS-02c**: Harden `PartnerProfile` table — service role only

### RLS-03: Partner Tables
- [ ] **RLS-03a**: Harden `PartnerReferral` table — service role only
- [ ] **RLS-03b**: Harden `Application` table — service role only

### RLS-04: Content Tables
- [ ] **RLS-04a**: Harden `Package` table — service role only (remove both policies)
- [ ] **RLS-04b**: Harden `Trip` table — service role only (remove both policies)
- [ ] **RLS-04c**: Harden `AddOn` table — service role only
- [ ] **RLS-04d**: Harden `Itinerary` table — service role only
- [ ] **RLS-04e**: Harden `Testimonial` table — service role only

### RLS-05: Communication Tables
- [ ] **RLS-05a**: Harden `Message` table — service role only
- [ ] **RLS-05b**: Harden `Notification` table — service role only
- [ ] **RLS-05c**: Harden `NewsletterSubscriber` table — service role only

### RLS-06: Document & Support Tables
- [ ] **RLS-06a**: Harden `Document` table — service role only
- [ ] **RLS-06b**: Harden `SupportTicket` table — service role only

### RLS-07: System Tables
- [ ] **RLS-07a**: Harden `WebhookEvent` table — service role only
- [ ] **RLS-07b**: Harden `ReminderHistory` table — service role only

### RLS-08: Verification
- [ ] **RLS-08a**: Verify 0 security warnings in Supabase advisor
- [ ] **RLS-08b**: Verify app functionality (booking flow, partner portal, admin dashboard)

## Future Requirements

None identified — this milestone is focused and complete.

## Out of Scope

- **Anon key access patterns** — App doesn't use anon key, all access via Prisma service role
- **Row-level user isolation** — Not needed since Clerk handles auth, Prisma handles data access
- **Complex policy conditions** — Service role bypass is the correct pattern for this architecture

## Traceability

| Requirement | Phase |
|-------------|-------|
| RLS-01a-d | 8 |
| RLS-02a-c | 8 |
| RLS-03a-b | 8 |
| RLS-04a-e | 8 |
| RLS-05a-c | 8 |
| RLS-06a-b | 8 |
| RLS-07a-b | 8 |
| RLS-08a-b | 8 |
