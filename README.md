# Pickleball Passport

**Elite Pickleball. Unforgettable Destinations.**

Curated pickleball travel experiences — world-class pickleball, boutique hotels, cultural immersion, and wellness across Thailand. Live at [www.thepickleballpassport.org](https://www.thepickleballpassport.org).

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router) + TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: Clerk (Guest / Partner / Admin roles)
- **API**: tRPC with React Query
- **Payments**: Stripe (Payment Intents, webhooks, installments)
- **Email**: SendGrid | **SMS**: Twilio
- **State**: Zustand + localStorage persistence
- **Styling**: Tailwind CSS 4 + Radix UI
- **Monitoring**: Sentry | **Logging**: Pino
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel (auto-deploy from `main`)
- **Mobile**: Expo (React Native) + OneSignal — not yet shipped

## What's Built

### Marketing Site
- Homepage, How It Works, Pickleball overview, Partners, Contact, FAQ
- **All Trips listing** (`/trips`) with active + coming-soon cards
- **Thailand trip detail** (`/trips/thailand`) — 8 navigable sections: Details, Itinerary (13-day accordion), Accommodations (3 hotels), Pickleball (6 sessions), Dining, FAQ, Cancellation, Travel Insurance
- **Booking module** — desktop sticky sidebar + mobile bottom sheet with occupancy, pickleball toggle, payment plan

### Platform
- Multi-step booking configurator with Stripe checkout
- Guest dashboard (booking management, payment tracking, cancellation/reschedule)
- Admin dashboard (bookings, guests, trips, packages, analytics, email templates, support tickets)
- Partner portal (referrals, commissions, leads, training, landing page builder, forum)
- CMS (blog, FAQ management, testimonials, media library, itinerary templates)
- Communication system (email sequences, SMS, in-app notifications, WhatsApp)
- Guest referral system with points and attribution

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1D2D44` | Primary text, backgrounds |
| Gold | `#B08D55` | Accent, CTAs, borders |
| Cream | `#FDF8F3` / `#F5E6D3` | Page backgrounds |
| Emerald | `#10B981` | Success states |

**Fonts**: Nunito Sans (headings, `font-serif`) + Montserrat (body, `font-sans`)

## Getting Started

```bash
git clone git@github.com:RugbyCharger/pickleball-passport.git
cd pickleball-passport
npm install
cp .env.example .env   # then fill in values (see SETUP.md)
npm run db:push         # push Prisma schema to Supabase
npm run db:generate     # generate Prisma client
npm run dev             # http://localhost:3000
```

Required env vars: `DATABASE_URL`, `DIRECT_URL`, Clerk keys, Stripe keys, `SENDGRID_API_KEY`. Optional: Sentry DSN. See [SETUP.md](SETUP.md) for details.

## Key Directories

```
app/
  (marketing)/         Homepage, /trips, /trips/thailand, /pickleball, /faq, /contact
  (platform)/          Booking configurator, guest dashboard
  (dashboard)/         Partner portal, admin dashboard
components/
  trips/               14 files — trip detail sections, booking modules, sidebar nav
  marketing/           Hero, header, footer, page sections
  booking/             Booking flow components
  ui/                  Shared Radix UI components
lib/
  trpc/server/routers/ tRPC API routers (booking, partner, faq, cms, support, forum)
  config/              Business constants (pricing, refund policies, deposit config)
  stores/              Zustand stores (booking state with localStorage persistence)
prisma/
  schema.prisma        Full database schema (~2100 lines)
scripts/
  seed-faqs.ts         FAQ seeder (22 FAQs, 6 categories)
```

## Documentation

- [SETUP.md](SETUP.md) — Environment setup guide
- [Architecture](.planning/codebase/ARCHITECTURE.md) — System architecture
- [Strategy Guide](.planning/STRATEGY-DISCUSSION-GUIDE.md) — March 2026 launch analysis

## License

Private — All Rights Reserved. Copyright 2025-2026 Pickleball Passport.
