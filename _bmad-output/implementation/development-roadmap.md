# Pickleball Passport - Development Roadmap
**Project:** Pickleball Passport
**Created:** 2025-12-28
**Project Type:** Greenfield - Luxury Transformation Tourism Platform
**Team:** Solo Developer (Grant)
**Estimated Timeline:** 12-16 weeks to MVP

---

## Executive Summary

This roadmap outlines the implementation plan for Pickleball Passport, a luxury transformation tourism platform combining pickleball, wellness, and medical tourism in Thailand. The project is broken into **3 phases** with **~10-12 sprints** (2 weeks each) to reach MVP.

**Key Milestones:**
- ✅ **Phase 0-2 Complete:** Discovery, Planning, Solutioning (PRD, Architecture, Epics)
- 🔄 **Phase 3 In Progress:** Implementation (Sprint 1 starting)
- ⏳ **Phase 4 Future:** Testing, Launch, Iteration

---

## Phase 3: Implementation Overview

### Sprint Allocation (MVP Scope - P0 Stories Only)

| Sprint | Focus Area | Stories | Points | Cumulative |
|--------|-----------|---------|--------|------------|
| **Sprint 1** | Foundation & Auth | 10 stories (6 foundation + 4 auth) | 33 | 33 |
| **Sprint 2** | Marketing Website Core | 5 stories (homepage, packages, nav) | 21 | 54 |
| **Sprint 3** | Application & Testimonials | 3 stories (form, videos, email) | 23 | 77 |
| **Sprint 4** | Booking Configurator (Part 1) | 4 stories (package, duration, accommodation, add-ons) | 19 | 96 |
| **Sprint 5** | Booking Configurator (Part 2) | 4 stories (wellness, price calc, review, trip selection) | 18 | 114 |
| **Sprint 6** | Guest Experience | 3 stories (profile, confirmation, dashboard) | 21 | 135 |
| **Sprint 7** | Payment Integration (Part 1) | 4 stories (Stripe setup, intent, form, webhook) | 21 | 156 |
| **Sprint 8** | Payment Integration (Part 2) | 3 stories (failure handling, installments, scheduling) | 24 | 180 |
| **Sprint 9-10** | Buffer & Polish | Bug fixes, UI polish, testing | 20 | 200 |

**Total P0 Points:** ~200 points
**Estimated Duration:** 10-12 sprints (20-24 weeks at 15-20 points/sprint)

---

## Detailed Sprint Breakdown

### 🚀 Sprint 1: Foundation & Authentication (Weeks 1-2)
**Goal:** Technical foundation and user authentication
**Points:** 33

**Stories:**
1. ✅ FOUNDATION-1: Next.js Project Scaffolding (3 pts)
2. ✅ FOUNDATION-2: Database Schema Design (5 pts)
3. ✅ FOUNDATION-3: Prisma Setup & Migrations (3 pts)
4. ✅ FOUNDATION-4: tRPC Setup (3 pts)
5. ✅ FOUNDATION-5: Tailwind CSS & Component Library (2 pts)
6. ✅ FOUNDATION-6: Environment Variables & Config (1 pt)
7. ✅ E2-S1: Clerk Integration Setup (3 pts)
8. ✅ E2-S2: User Sign-Up Flow (5 pts)
9. ✅ E2-S3: User Login Flow (3 pts)
10. ✅ E2-S4: Role-Based Access Control (5 pts)

**Deliverables:**
- Next.js app with TypeScript, tRPC, Prisma
- Complete database schema on Supabase
- Clerk authentication (signup, login, RBAC)
- Foundation for future development

---

### 🎨 Sprint 2: Marketing Website Core (Weeks 3-4)
**Goal:** Public-facing marketing pages
**Points:** 21

**Stories:**
1. E1-S1: Homepage Hero Section (5 pts)
2. E1-S2: Package Explorer Grid (3 pts)
3. E1-S3: Package Detail Pages (8 pts)
4. E1-S12: Mobile Navigation (3 pts)
5. E1-S14: Footer (2 pts)

**Deliverables:**
- Luxury homepage with video hero
- Package listing and detail pages
- Mobile-responsive navigation
- Professional footer

**Dependencies:**
- Database seed data for packages
- S3 bucket for images/videos
- Mux account for video hosting (or fallback)

---

### 📝 Sprint 3: Application Flow & Testimonials (Weeks 5-6)
**Goal:** User acquisition and social proof
**Points:** 23

**Stories:**
1. E1-S4: Testimonial Video Gallery (8 pts)
2. E1-S6: Application Form (Multi-Step) (13 pts)
3. E11-S1: SendGrid Integration (2 pts)

**Deliverables:**
- Multi-step application form with validation
- Video testimonial gallery (Mux integration)
- Email confirmation system (SendGrid)

**Dependencies:**
- Mux account setup
- SendGrid account and templates
- HubSpot CRM (optional webhook)

---

### 🛒 Sprint 4: Booking Configurator Part 1 (Weeks 7-8)
**Goal:** Package configuration
**Points:** 19

**Stories:**
1. E3-S1: Package Selection (5 pts)
2. E3-S2: Duration Selection (3 pts)
3. E3-S3: Accommodation Tier Selection (3 pts)
4. E3-S4: Medical Add-Ons Selection (8 pts)

**Deliverables:**
- Booking configurator (steps 1-4)
- Dynamic pricing engine
- Add-on selection with medical cost calculator

**Dependencies:**
- Package and add-on seed data
- Zustand state management setup

---

### 🧘 Sprint 5: Booking Configurator Part 2 (Weeks 9-10)
**Goal:** Complete booking flow
**Points:** 18

**Stories:**
1. E3-S5: Wellness Add-Ons Selection (5 pts)
2. E3-S6: Real-Time Price Calculator (3 pts)
3. E3-S7: Booking Review Page (5 pts)
4. E3-S8: Trip Selection (5 pts)

**Deliverables:**
- Wellness add-on selection
- Sticky price calculator (sidebar/bottom bar)
- Booking review and summary
- Trip selection from available dates

**Dependencies:**
- Trip data seeded in database
- Booking draft creation API

---

### 👤 Sprint 6: Guest Experience (Weeks 11-12)
**Goal:** Post-booking guest journey
**Points:** 21

**Stories:**
1. E3-S9: Guest Profile Completion (5 pts)
2. E3-S10: Booking Confirmation Page (8 pts)
3. E3-S11: Guest Dashboard - Booking List (5 pts)
4. E3-S12: Guest Dashboard - Booking Details (8 pts) *(Deferred if over capacity)*

**Deliverables:**
- Guest profile form (dietary restrictions, emergency contact)
- Booking confirmation page with PDF download
- Guest dashboard with booking list
- Detailed booking view

**Dependencies:**
- PDF generation library (Puppeteer or react-pdf)
- SendGrid booking confirmation template

---

### 💳 Sprint 7: Payment Integration Part 1 (Weeks 13-14)
**Goal:** Stripe payment processing
**Points:** 21

**Stories:**
1. E4-S1: Stripe Integration Setup (3 pts)
2. E4-S2: Payment Intent Creation (5 pts)
3. E4-S3: Payment Form UI (8 pts)
4. E4-S4: Webhook Handler (5 pts)

**Deliverables:**
- Stripe account configured
- Payment Intent API
- Stripe Elements payment form
- Webhook for payment success

**Dependencies:**
- Stripe account (test mode)
- SSL certificate for webhooks (production)

---

### 🔄 Sprint 8: Payment Integration Part 2 (Weeks 15-16)
**Goal:** Advanced payment features
**Points:** 24

**Stories:**
1. E4-S5: Payment Failure Handling (3 pts)
2. E4-S6: Installment Payment Plans (8 pts)
3. E4-S7: Scheduled Payment Processing (13 pts)

**Deliverables:**
- Payment failure handling and retries
- 4-installment payment option
- Background job for scheduled payments (BullMQ)

**Dependencies:**
- BullMQ setup for job processing
- Redis instance (Upstash free tier)
- Stripe saved payment methods

---

### 🎯 Sprint 9-10: Polish & Testing (Weeks 17-20)
**Goal:** Bug fixes, testing, launch prep
**Points:** 20

**Focus Areas:**
- Manual testing of all user flows
- Bug fixes from testing
- Performance optimization (Lighthouse >90)
- Mobile responsiveness refinement
- Error handling edge cases
- Production deployment to Vercel
- Domain setup and SSL
- Final content review

**Deliverables:**
- Production-ready MVP
- All P0 user flows tested and working
- Public launch-ready application

---

## Post-MVP Roadmap (Phase 2 - Scale)

After MVP launch, focus shifts to **P1 stories** and advanced features:

### Phase 2 Epics (Estimated 12-15 additional sprints)
1. **E5: Admin Dashboard** (10 stories, 34 pts)
   - Manage bookings, guests, trips, content
2. **E6-E8: Mobile App** (35 stories, 157 pts)
   - Pre-trip, during-trip, alumni experience
3. **E9: Partner Portal** (20 stories, 89 pts)
   - Referral tracking, point redemption, analytics
4. **E10: Referral System** (10 stories, 55 pts)
   - Passport Points, tier progression, rewards

---

## Technology Stack Summary

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Shadcn UI
- tRPC (type-safe APIs)
- React Hook Form + Zod

**Backend:**
- Next.js API Routes
- tRPC
- Prisma ORM
- PostgreSQL (Supabase)

**Authentication:**
- Clerk (OAuth, email/password)

**Payments:**
- Stripe (PaymentIntents, Webhooks)
- BullMQ (scheduled payments)

**Media:**
- Mux (video hosting)
- S3 / Cloudinary (images)

**Communication:**
- SendGrid (transactional email)
- Twilio (SMS, future)

**Infrastructure:**
- Vercel (hosting)
- Supabase (database)
- Upstash (Redis)
- GitHub (version control)

---

## Risk Management

### High-Priority Risks

| Risk | Mitigation Strategy |
|------|---------------------|
| Solo developer velocity slower than estimated | Adjust sprint goals after Sprint 1 actual velocity measurement |
| Third-party API complexity (Mux, Stripe) | Prototype integrations early, allocate buffer time |
| Database schema changes mid-sprint | Design comprehensive schema upfront (already done in Sprint 1) |
| Scope creep on complex stories | Timebox implementation, break into sub-tasks |
| Payment integration bugs | Extensive testing in Stripe test mode before production |

---

## Success Criteria (MVP Launch)

**Functional Requirements:**
✅ Guest can apply to join Pickleball Passport
✅ Guest can configure and book a custom package
✅ Guest can pay via Stripe (one-time or installments)
✅ Guest receives booking confirmation and can access dashboard
✅ Marketing website converts visitors to applicants
✅ Admin can manage bookings via database (manual for MVP)

**Non-Functional Requirements:**
✅ Lighthouse score >90 (performance, SEO, accessibility)
✅ Mobile-responsive across all pages
✅ Secure authentication and payment processing
✅ Error handling for all critical paths
✅ Professional, luxury UI/UX

**Business Metrics (Post-Launch):**
- Application conversion rate: >15%
- Booking completion rate: >60%
- Payment success rate: >95%
- Average time on site: >3 minutes

---

## Next Steps (Immediate)

1. ✅ Review and approve Sprint 1 plan
2. 🔄 Begin Sprint 1 implementation:
   - Day 1: FOUNDATION-1 (Next.js scaffolding)
   - Day 2: FOUNDATION-6 (Environment setup)
   - Day 3: FOUNDATION-2 (Database schema)
3. ⏳ Daily stand-ups (self):
   - What did I complete yesterday?
   - What am I working on today?
   - Any blockers?
4. ⏳ Update [`sprint-status.yaml`](_bmad-output/implementation/sprint-status.yaml) daily

**Ready to start Sprint 1?** 🚀

See detailed tasks in [`sprint-1-plan.md`](_bmad-output/implementation/sprint-1-plan.md)
