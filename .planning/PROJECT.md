# Pickleball Passport

## What This Is

A luxury transformation travel platform combining world-class pickleball, medical tourism, and wellness experiences in Thailand. The web application enables affluent US retirees (55+) to discover, configure, and book transformation packages, while a partner portal empowers pickleball club directors to refer members and earn rewards.

## Current State

**Version:** v1.0 MVP (shipped 2026-01-26)

The platform is go-to-market ready with:
- Secure admin routes protected via Clerk middleware
- Payment failure recovery with guest emails and update modal
- Partner portal with commission tracking and UTM-enabled referral links
- Complete email system including booking cancellations

## Core Value

**Guests can book a transformation trip and partners can refer members.** Everything else supports these two flows. If booking doesn't work, there's no business. If partner referrals don't work, there's no distribution channel.

## Requirements

### Validated

<!-- Shipped and confirmed working -->

**Pre-existing (before v1.0):**
- ✓ **Marketing website** — Homepage, packages, testimonials, contact, partner program page
- ✓ **User authentication** — Clerk integration, signup/login, role-based access (GUEST/PARTNER/ADMIN)
- ✓ **Multi-step booking configurator** — Package, duration, accommodation, add-ons, wellness, profile
- ✓ **Booking review and confirmation** — Review page, confirmation page, PDF receipts
- ✓ **Stripe payment integration** — Payment intents, card processing, webhook handling
- ✓ **Installment payment plans** — 4-payment schedule, auto-charge cron job
- ✓ **Partner portal foundation** — Dashboard, referral links, points tracking, tiers, materials
- ✓ **Admin dashboard foundation** — Booking management, guest management, CMS, email templates
- ✓ **Email system foundation** — SendGrid integration, booking confirmation, payment receipts
- ✓ **WhatsApp integration** — Group management, message templates

**v1.0 MVP (shipped 2026-01-26):**
- ✓ **Admin route protection** — Clerk middleware with ADMIN role checking — v1.0
- ✓ **SendGrid webhook verification** — Official SDK signature verification — v1.0
- ✓ **Email token security** — Required secret, no fallback in production — v1.0
- ✓ **Document upload security** — Authenticated user ID from Clerk — v1.0
- ✓ **Stripe Connect exclusive** — Bank account fields removed — v1.0
- ✓ **Payment failure recovery** — Guest email with update payment link — v1.0
- ✓ **Payment method update** — Stripe Elements modal in dashboard — v1.0
- ✓ **Overbooking prevention** — Atomic capacity check with admin alerts — v1.0
- ✓ **Partner commission breakdown** — Pending vs available based on booking status — v1.0
- ✓ **Referral link UTM tracking** — utm_source, utm_medium, utm_campaign — v1.0
- ✓ **Guest cancellation emails** — Both self and admin-initiated paths — v1.0

### Active

<!-- Next milestone scope — to be defined -->

(No active requirements — run `/gsd:new-milestone` to define next milestone)

### Out of Scope

<!-- Explicit boundaries -->

- **Mobile app** — Web app sufficient for now, consider for v2
- **Gift booking system** — Existing implementation dormant
- **SMS notifications** — Twilio stubs exist but not required
- **Dynamic pricing per trip** — Hardcoded pricing acceptable
- **Court booking system** — Mobile-only feature

## Context

**Tech Stack:**
- Next.js 16.1.1 with App Router
- tRPC 11.8.1
- Prisma 5.22.0
- Clerk authentication
- Stripe payments + Stripe Connect
- SendGrid email
- Supabase PostgreSQL
- Vercel deployment

**Business Context:**
- v1.0 MVP shipped — ready for first bookings
- Partner distribution channel live (club directors)
- Both B2C (direct guests) and B2B2C (partner referrals) channels active

## Constraints

- **Tech stack**: Continue with existing stack — no rewrites
- **Quality bar**: All security requirements must be met before customer-facing
- **Budget**: Solo developer capacity — prioritize highest-impact work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Partner Portal = Phase 1 | Key distribution channel | ✓ Shipped v1.0 |
| Gift system deprioritized | Not critical for go-to-market | ✓ Confirmed |
| Security before launch | Cannot ship known vulnerabilities | ✓ All SEC requirements met |
| Mobile app = Phase 2 | Web app sufficient for MVP | ✓ Confirmed |
| Use sessionClaims.metadata.role for ADMIN | Clerk-native approach | ✓ Implemented |
| Redirect non-admin to /dashboard | Better UX than 403 | ✓ Implemented |
| Official SendGrid SDK | Custom crypto had ECDSA issues | ✓ Implemented |
| Remove PartnerPayoutMethod | Stripe Connect exclusive | ✓ Model removed |
| Available = COMPLETED bookings | Clear business rule | ✓ Implemented |
| UTM standard params | Industry standard tracking | ✓ Implemented |

---
*Last updated: 2026-01-26 after v1.0 milestone*
