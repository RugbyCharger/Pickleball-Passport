# Pickleball Passport

## What This Is

A luxury transformation travel platform combining world-class pickleball, medical tourism, and wellness experiences in Thailand. The web application enables affluent US retirees (55+) to discover, configure, and book transformation packages, while a partner portal empowers pickleball club directors to refer members and earn rewards.

## Current State

**Version:** v1.3 Gift Enhancements (in progress)

The platform is production-ready with hardened database security:
- v1.0 MVP shipped 2026-01-26
- v1.1 Gift Booking shipped 2026-01-27
- v1.2 RLS Security Hardening shipped 2026-01-27

## Current Milestone: v1.3 Gift Enhancements

**Goal:** Give purchasers control over pending gifts before delivery — cancel, edit message, or resend notification.

**Target features:**
- Cancel a pending gift before delivery (full refund)
- Edit gift message before delivery
- Resend gift notification email

<details>
<summary>Completed: v1.2 RLS Security Hardening</summary>

**Goal:** Replace overly permissive "Dev Access" RLS policies with service-role-only access for defense-in-depth security.

**Delivered features:**
- ✓ Dropped all 24 permissive RLS policies
- ✓ Service role only access pattern implemented
- ✓ Supabase security advisor: 24 WARN → 0 WARN
- ✓ App functionality verified
</details>

<details>
<summary>Completed: v1.1 Gift Booking</summary>

**Goal:** Enable guests to purchase transformation trips as gifts, with full lifecycle management from purchase through acceptance/decline/expiration.

**Delivered features:**
- ✓ Gift purchase flow (buy a trip for someone else)
- ✓ Gift notification emails (to purchaser and recipient)
- ✓ Recipient acceptance/decline UI
- ✓ Gift status tracking in dashboard
- ✓ Refund handling for declined/expired gifts
</details>

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

**v1.1 Gift Booking (shipped 2026-01-27):**
- ✓ **Gift purchase flow** — Toggle, recipient fields, delivery scheduling — v1.1
- ✓ **Gift notification emails** — Recipient notification on SENT, purchaser confirmation — v1.1
- ✓ **Gift acceptance** — Auth flow, booking ownership transfer, confirmation emails — v1.1
- ✓ **Gift decline** — Dedicated page, automatic refund, notification emails — v1.1
- ✓ **Gift expiration** — 30-day auto-expire, refund, notification email — v1.1
- ✓ **Purchaser dashboard** — View gift status and recipient response — v1.1
- ✓ **Admin gifts view** — Status filtering and counts — v1.1

### Active

<!-- v1.3 Gift Enhancements -->

- [ ] **GIFT-F01**: Purchaser can cancel pending gift before delivery (full refund)
- [ ] **GIFT-F02**: Purchaser can edit gift message before delivery
- [ ] **GIFT-F03**: Purchaser can resend gift notification email

### Out of Scope

<!-- Explicit boundaries -->

- **Mobile app** — Web app sufficient for now, consider for v2
- **SMS notifications** — Twilio stubs exist but not required
- **Dynamic pricing per trip** — Hardcoded pricing acceptable
- **Court booking system** — Mobile-only feature
- **Gift card balance system** — Not a gift card, it's a specific booking gift
- **Multiple gift recipients** — One gift = one booking = one recipient
- **Partial gift payments** — Keep it simple - fully paid or not

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

| Gift system = v1.1 | High-value gift market for luxury travel | ✓ Shipped v1.1 |
| Gift enhancements = v1.3 | Purchaser control over pending gifts | — In Progress |

---
*Last updated: 2026-01-28 after v1.3 milestone started*
