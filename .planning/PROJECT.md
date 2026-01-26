# Pickleball Passport — Phase 1 MVP Completion

## What This Is

A luxury transformation travel platform combining world-class pickleball, medical tourism, and wellness experiences in Thailand. The web application enables affluent US retirees (55+) to discover, configure, and book transformation packages, while a partner portal empowers pickleball club directors to refer members and earn rewards. This milestone focuses on completing the MVP to go-to-market readiness.

## Core Value

**Guests can book a transformation trip and partners can refer members.** Everything else supports these two flows. If booking doesn't work, there's no business. If partner referrals don't work, there's no distribution channel.

## Requirements

### Validated

<!-- Shipped and confirmed working — inferred from existing codebase -->

- ✓ **Marketing website** — Homepage, packages, testimonials, contact, partner program page — existing
- ✓ **User authentication** — Clerk integration, signup/login, role-based access (GUEST/PARTNER/ADMIN) — existing
- ✓ **Multi-step booking configurator** — Package, duration, accommodation, add-ons, wellness, profile — existing
- ✓ **Booking review and confirmation** — Review page, confirmation page, PDF receipts — existing
- ✓ **Stripe payment integration** — Payment intents, card processing, webhook handling — existing
- ✓ **Installment payment plans** — 4-payment schedule, auto-charge cron job — existing
- ✓ **Partner portal foundation** — Dashboard, referral links, points tracking, tiers, materials — existing
- ✓ **Admin dashboard foundation** — Booking management, guest management, CMS, email templates — existing
- ✓ **Email system foundation** — SendGrid integration, booking confirmation, payment receipts — existing
- ✓ **WhatsApp integration** — Group management, message templates — existing

### Active

<!-- Current scope — building toward these for go-to-market -->

**Security (Pre-Launch Critical):**
- [ ] Admin role authorization enforced on all admin routes
- [ ] SendGrid webhook signature verification
- [ ] Email token secret enforcement (remove fallback)
- [ ] Hardcoded test user ID replaced with actual user

**Partner Portal Completion:**
- [ ] Partner referral redemption system (points → rewards)
- [ ] Partner payout processing (commission payouts)
- [ ] Partner bank account encryption

**Payment Flow Hardening:**
- [ ] Failed payment recovery flow (retry logic, notifications)
- [ ] Payment reminder emails working end-to-end
- [ ] Installment charging cron job verified in production

**Email System Completion:**
- [ ] Booking cancellation emails
- [ ] Booking modification emails
- [ ] Admin alert emails (failed payments, overbooking)

**Test Coverage (Critical Paths):**
- [ ] Admin authorization tests
- [ ] Payment failure recovery tests
- [ ] Webhook idempotency tests

### Out of Scope

<!-- Explicit boundaries — excluded from this milestone -->

- **Mobile app (E6, E7, E8)** — Deferred to Phase 2; web app sufficient for MVP launch
- **Gift booking system** — Deprioritized; existing implementation can remain dormant
- **Advanced analytics (E13)** — Partial implementation sufficient for MVP
- **SMS notifications** — Twilio stubs exist but not required for launch
- **Dynamic pricing per trip** — Hardcoded pricing acceptable for first trips
- **Court booking system** — Mobile-only feature, out of scope

## Context

**Existing Codebase:**
- Next.js 16.1.1 with App Router, tRPC 11.8.1, Prisma 5.22.0
- 27+ tRPC routers covering all major domains
- ~85% feature completion across most epics
- Deployed to Vercel, Supabase PostgreSQL, Clerk auth, Stripe payments

**Business Context:**
- Phase 1 MVP — proving the model with first trip
- No trips booked yet, going to market
- Partner distribution channel critical (club directors referring members)
- Both B2C (direct guests) and B2B2C (partner referrals) channels

**Known Issues (from CONCERNS.md):**
- Security: Admin auth missing, webhook verification incomplete
- Technical debt: 54+ console.log statements, large monolithic routers
- Missing features: Email sending stubbed in multiple places
- Test gaps: Authorization, payment failure, webhook handling untested

## Constraints

- **Tech stack**: Must use existing stack (Next.js, tRPC, Prisma, Clerk, Stripe) — no rewrites
- **Timeline**: ASAP — no hard deadline but want to move fast
- **Quality bar**: Security fixes required before launch — cannot ship known vulnerabilities
- **Budget**: Solo developer capacity — prioritize highest-impact work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Partner Portal = Phase 1 | Key distribution channel, both channels launching simultaneously | — Pending |
| Gift system deprioritized | Not critical for initial go-to-market | — Pending |
| Security before launch | Cannot ship known vulnerabilities to paying customers | — Pending |
| Mobile app = Phase 2 | Web app sufficient for MVP, mobile adds complexity | — Pending |

---
*Last updated: 2026-01-26 after GSD initialization*
