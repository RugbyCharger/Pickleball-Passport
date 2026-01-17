# Pickleball Passport

**Luxury Transformation Tourism in Thailand** - Where Pickleball Meets World-Class Wellness and Medical Care

A Next.js application for managing luxury pickleball tourism packages, combining sport, wellness, and medical tourism in Thailand.

## 🏗️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 + Radix UI
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Authentication**: Clerk (Role-based: Guest/Partner/Admin)
- **API Layer**: tRPC with React Query
- **State Management**: Zustand + localStorage persistence
- **Payments**: Stripe (Payment Intents + Webhooks)
- **Email**: SendGrid (Transactional emails)
- **Monitoring**: Sentry (Error tracking + Performance monitoring)
- **Logging**: Pino (Structured JSON logging)
- **Unit Testing**: Vitest (alongside Playwright for E2E)
- **Deployment**: Vercel

## 📊 Project Status

**Current Sprint: Sprint 14** (January 2026)

### Sprint 14 Progress - COMPLETE

✅ **Epic 9 (Partner Portal) - Completed:**
- E9-S1: Partner Dashboard Overview (5 pts)
- E9-S2: Referral Tracking (8 pts)
- E9-S3: Points and Rewards System (8 pts)
- E9-S4: Marketing Materials Library (5 pts)
- E9-S5: Commission Reports (8 pts)
- E9-S6: Lead Management (8 pts)
- E9-S7: Partner Training Resources (5 pts)
- E9-S8: Co-Branded Landing Pages (13 pts)
- E9-S9: Referral Link Generator (5 pts)
- E9-S10: Performance Analytics (8 pts)
- E9-S11: Payout Management (8 pts)
- E9-S12: Partner Tiers and Benefits (8 pts)
- E9-S13: Partner Community Forum (13 pts)
- E9-S14: Partner Onboarding Flow (8 pts)

### Major Epics Status

| Epic | Name | Status | Stories | Progress |
|------|------|--------|---------|----------|
| **E1** | Marketing Website | ✅ Done | 15/15 | 100% |
| **E2** | User Authentication | ✅ Done | 4/8 | 100% |
| **E3** | Booking System | ✅ Done | 18/18 | 100% |
| **E4** | Payment Processing | 🟡 In Progress | 10/14 | 71% |
| **E5** | Admin Dashboard | ✅ Done | 10/10 | 100% |
| **E9** | Partner Portal | ✅ Done | 14/14 | 100% |
| **E11** | Communication System | 🟡 In Progress | 3/12 | 25% |

### Recent Milestones

**Sprint 14 (Completed - January 2026):**
- ✅ **Complete Partner Portal (E9)** - Full partner program implementation
  - Referral tracking with custom link generation
  - Points and rewards system with tier benefits
  - Marketing materials library with asset management
  - Commission tracking and payout management
  - Lead management with conversion tracking
  - Partner training resources with certifications
  - Co-branded landing page builder
  - Performance analytics and reporting
  - Community forum with threaded discussions
  - Guided onboarding flow for new partners

**Sprint 13 (Completed - January 2026):**
- ✅ Complete Booking System (E3) - Full guest booking flow
- ✅ Trip Selection with departure dates
- ✅ Guest Profile Completion workflow
- ✅ Booking Confirmation & Dashboard
- ✅ Booking Management (cancellation & rescheduling)
- ✅ Payment Processing enhancements (webhooks, receipts, refunds)
- ✅ Marketing Website updates (Trust & Safety, Partner Program)
- ✅ **Task Management System** - Priority-based task tracking for bookings

**Sprint 12 (Completed - December 2025):**
- ✅ Admin Dashboard - Testing & Polish
- ✅ Email Template Management
- ✅ Scheduled Trip Reminders (30/7/1 day automation)
- ✅ Bulk Notifications System

## 🎨 Key Features

### Booking System (Epic 3) - ✅ COMPLETE
- ✅ Multi-step package configurator
  - Package selection (5 options)
  - Duration selection (7, 10, 14, 21 days)
  - Accommodation tier (Luxury/Ultra-Luxury/Villa)
  - Medical/Cosmetic add-ons (4 categories)
  - Wellness & Cultural add-ons (4 categories)
  - Real-time pricing with Thailand vs US comparison
- ✅ Trip date selection with departure calendar
- ✅ Guest profile completion before booking
- ✅ Booking confirmation page with itinerary
- ✅ Guest dashboard with booking management
- ✅ Booking details page with payment tracking
- ✅ Booking cancellation flow with refund processing
- ✅ Booking rescheduling with date changes

### Admin Dashboard (Epic 5)
- ✅ Role-based authentication (Admin-only access)
- ✅ Booking management with filters & search
- ✅ Guest profile management
- ✅ Trip scheduling & capacity management
- ✅ Package & add-on management
- ✅ Analytics dashboard with metrics
- ✅ Email template management
- ✅ Automated trip reminders (30/7/1 day)
- ✅ Bulk notification system
- ✅ **Task Management** - Priority-based task tracking
  - Create and assign tasks to bookings
  - Priority levels (URGENT/IMPORTANT/NORMAL)
  - Status tracking (PENDING/IN_PROGRESS/COMPLETED)
  - Due date management and filtering

### Payment Processing (Epic 4)
- ✅ Stripe integration setup
- ✅ Payment Intent creation
- ✅ Payment form UI with Stripe Elements
- ✅ Payment failure handling
- ✅ Webhook handler (production-ready with event tracking)
- ✅ Receipt generation (PDF receipts with branding)
- ✅ Refund processing (full/partial refunds with tracking)
- ✅ **Installment payment plans** (4-payment plans with 50/25/15/10% split)
  - Payment plan selector UI with authorization
  - Installment schedule display
  - 70-day minimum validation for installments
- ✅ **Scheduled payment processing** (Vercel Cron - daily 9 AM UTC)
  - Automatic charging of due installments
  - Retry logic with exponential backoff
  - Customer reminder emails on failure
  - Admin alerts for permanent failures
- ✅ **Payment history view** (/dashboard/payments)
- ✅ **Update payment method** (for installment plan customers)
  - Stripe SetupIntent flow
  - Modal UI with Stripe Elements
- 📝 Affirm/Klarna financing (Phase 2)

### Communication System (Epic 11)
- ✅ SendGrid integration
- ✅ Booking confirmation emails
- ✅ Payment receipt emails (automated with PDF attachments)
- ✅ Transactional email templates
- ✅ Admin email template management
- 📝 Pre-trip email sequences (Planned)
- 📝 SMS notifications (Planned)

### Partner Portal (Epic 9) - ✅ COMPLETE
- ✅ **Partner Dashboard** with comprehensive overview
  - Real-time metrics (referrals, commissions, leads, points)
  - Quick action cards and tier progress
  - Recent activity feed
- ✅ **Referral Tracking System**
  - Custom referral link generation with UTM parameters
  - Real-time referral status tracking
  - Conversion funnel analytics
- ✅ **Points and Rewards Program**
  - Automated points calculation (per booking, milestone bonuses)
  - Rewards marketplace with redemption
  - Points history and transaction log
- ✅ **Marketing Materials Library**
  - Asset management with categories (Brochures, Social Media, Videos)
  - Download tracking and analytics
  - Preview functionality for all asset types
- ✅ **Commission & Payout Management**
  - Detailed commission reports with filtering
  - Payout request system with tracking
  - Payment method management
  - Commission rate tiers
- ✅ **Lead Management**
  - Lead capture and status tracking
  - Conversion tracking and notes
  - Lead source attribution
- ✅ **Partner Training Resources**
  - Course library with progress tracking
  - Certification system with expiry dates
  - Training materials and documentation
- ✅ **Co-Branded Landing Pages**
  - Visual page builder with drag-and-drop
  - Template library with customization
  - Preview and publish workflow
  - Analytics integration
- ✅ **Performance Analytics**
  - Revenue charts and conversion metrics
  - Top performing links and campaigns
  - Geographic distribution of leads
  - Time-series analysis
- ✅ **Partner Tiers & Benefits**
  - 4-tier system (Bronze, Silver, Gold, Platinum)
  - Tier-based commission rates and benefits
  - Progress tracking toward next tier
- ✅ **Community Forum**
  - Threaded discussions with categories
  - Like/reply functionality
  - Search and filtering
  - Moderation tools for admins
- ✅ **Partner Onboarding Flow**
  - Guided 6-step onboarding process
  - Profile setup and agreement acceptance
  - Training completion tracking
  - Welcome resources

### Marketing Website (Epic 1)
- ✅ Homepage hero section
- ✅ Package explorer grid
- ✅ Package detail pages
- ✅ Testimonial video gallery
- ✅ Multi-step application form
- ✅ Medical tourism cost calculator
- ✅ Trust & safety section
- ✅ Partner program landing page
- ✅ Partner signup form
- ✅ Marketing flyers (Director & Guest editions)
- ✅ Mobile navigation
- ✅ Footer
- 📝 SEO optimization (Planned)
- 📝 Email capture & newsletter signup (Planned)
- 📝 Contact form (Planned)
- 📝 Privacy policy & terms of service (Planned)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Clerk account for authentication
- Stripe account for payments
- SendGrid account for emails
- Sentry account for error monitoring (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:RugbyCharger/pickleball-passport.git
   cd pickleball-passport
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
   STRIPE_SECRET_KEY="sk_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # SendGrid
   SENDGRID_API_KEY="SG..."
   SENDGRID_FROM_EMAIL="noreply@example.com"

   # Sentry (optional)
   SENTRY_AUTH_TOKEN="sntrys_..."
   NEXT_PUBLIC_SENTRY_DSN="https://..."
   ```

   See [SETUP.md](SETUP.md) for detailed configuration instructions.

4. **Set up the database**
   ```bash
   # Push the Prisma schema to your database
   npm run db:push

   # Generate Prisma Client
   npm run db:generate

   # (Optional) Seed sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

### Core Documentation
- **[SETUP.md](SETUP.md)** - Environment setup guide (Clerk, Stripe, Database)
- **[Architecture](_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md)** - System architecture & technical decisions
- **[PRD](_bmad-output/planning/prd-Pickleball-Passport-2025-12-28.md)** - Product requirements document
- **[UX Design](_bmad-output/solutioning/ux-design-Pickleball-Passport-2025-12-28.md)** - Design patterns & user experience
- **[Pickleball Culture Research](_bmad-output/research/pickleball-culture.md)** - Comprehensive guide on pickleball demographics and culture

### Development Tracking
- **[Sprint Status](_bmad-output/implementation/sprint-status.yaml)** - Real-time progress tracking (Sprint 13)
- **[Epics & Stories](_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md)** - All user stories
- **[Implementation Stories](_bmad-output/implementation/)** - Detailed story files with acceptance criteria

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL and includes:

### Core Entities
- **User** - Clerk authentication with role management
- **GuestProfile** - Extended guest information
- **PartnerProfile** - Partner program details with referral codes

### Booking System
- **Package** - Trip packages (Pure Play, Smile Makeover, etc.)
- **Trip** - Scheduled departures with capacity management
- **Booking** - Guest reservations with status tracking
- **AddOn** - Medical and wellness add-ons (8 categories)
- **BookingAddOn** - Junction table for booking-addon relationships

### Payments & Communication
- **Payment** - Stripe payment tracking with installments
- **Notification** - In-app notifications
- **ReminderHistory** - Automated reminder tracking
- **Message** - Contact form submissions

### Partner Program
- **PartnerReferral** - Referral tracking with conversion status
- **PartnerPoints** - Points transactions and balances
- **PartnerReward** - Rewards catalog and redemption tracking
- **PartnerCommission** - Commission calculations and payments
- **PartnerPayout** - Payout requests and processing
- **PartnerLead** - Lead capture and management
- **PartnerTraining** - Training courses and certifications
- **PartnerCertification** - Certification records with expiry
- **PartnerLandingPage** - Co-branded landing pages
- **ForumCategory** - Forum category organization
- **ForumThread** - Discussion threads with metadata
- **ForumReply** - Threaded replies with likes
- **MarketingAsset** - Marketing materials library
- **AssetDownload** - Download tracking analytics

### Supporting Entities
- **Application** - Guest application workflow
- **Testimonial** - Video testimonials (Mux integration)
- **Document** - File uploads (passports, medical forms)
- **SupportTicket** - Customer support system
- **Task** - Priority-based task management for bookings
  - TaskPriority: URGENT, IMPORTANT, NORMAL
  - TaskStatus: PENDING, IN_PROGRESS, COMPLETED
  - Linked to bookings with assignment and due dates

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:push      # Push Prisma schema to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:generate  # Generate Prisma Client
npm run db:seed      # Seed sample data (dev only)
npm run db:migrate   # Run database migrations (production)

# Unit Testing (Vitest)
npm run test         # Run unit tests
npm run test:unit    # Run unit tests once
npm run test:watch   # Watch mode
npm run test:ui      # Interactive UI

# E2E Testing (Playwright)
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Interactive mode
```

## 📁 Project Structure

```
pickleball-passport/
├── app/                          # Next.js App Router pages
│   ├── (marketing)/             # Public marketing site
│   │   ├── page.tsx             # Homepage
│   │   ├── packages/            # Package explorer
│   │   ├── apply/               # Application form
│   │   └── p/[slug]/            # Public partner landing pages
│   ├── (platform)/              # Authenticated guest area
│   │   ├── booking/             # Booking configurator
│   │   │   ├── configure/       # Multi-step configuration
│   │   │   │   ├── page.tsx     # Step 1: Package selection
│   │   │   │   ├── duration/    # Step 2: Duration
│   │   │   │   ├── accommodation/ # Step 3: Accommodation
│   │   │   │   ├── add-ons/     # Step 4: Medical add-ons
│   │   │   │   └── wellness/    # Step 5: Wellness add-ons
│   │   │   └── review/          # Booking review
│   │   └── dashboard/           # Guest dashboard
│   ├── (dashboard)/             # Partner portal
│   │   └── dashboard/partner/   # Partner dashboard pages
│   │       ├── page.tsx         # Dashboard overview
│   │       ├── referrals/       # Referral tracking
│   │       ├── referral-links/  # Link generator
│   │       ├── points/          # Points & rewards
│   │       ├── materials/       # Marketing materials
│   │       ├── commissions/     # Commission reports
│   │       ├── payouts/         # Payout management
│   │       ├── leads/           # Lead management
│   │       ├── training/        # Training resources
│   │       ├── landing-pages/   # Landing page builder
│   │       ├── analytics/       # Performance analytics
│   │       ├── tiers/           # Tier benefits
│   │       ├── forum/           # Community forum
│   │       └── onboarding/      # Onboarding flow
│   └── admin/                   # Admin dashboard
│       ├── bookings/            # Booking management
│       ├── guests/              # Guest management
│       ├── trips/               # Trip management
│       ├── packages/            # Package management
│       ├── analytics/           # Analytics dashboard
│       └── communications/      # Email & notifications
├── components/                  # React components
│   ├── booking/                # Booking-specific components
│   ├── dashboard/              # Dashboard components
│   └── ui/                     # Shared UI components (Radix UI)
├── lib/                        # Utilities and configuration
│   ├── config/                 # Centralized business constants
│   │   └── business-constants.ts  # Pricing, fees, refund policies
│   ├── data/                   # Static data sources
│   │   ├── marketing-materials.ts  # Partner marketing assets
│   │   └── training-resources.ts   # Partner training content
│   ├── logger/                 # Structured logging
│   │   └── index.ts            # Pino logger with module loggers
│   ├── trpc/                   # tRPC setup
│   │   ├── client.ts           # Client-side tRPC
│   │   └── server/routers/     # API routers
│   │       ├── __tests__/      # Unit tests for routers
│   │       │   ├── booking.test.ts  # 43 booking tests
│   │       │   └── gift.test.ts     # 37 gift flow tests
│   │       ├── booking/        # Modular booking sub-routers
│   │       │   ├── index.ts    # Router composition
│   │       │   ├── queries.ts  # Read operations
│   │       │   └── trips.ts    # Trip operations
│   │       ├── partner.ts      # Partner portal operations
│   │       └── forum.ts        # Community forum operations
│   ├── stores/                 # Zustand state stores
│   └── utils.ts                # Utility functions
├── prisma/                     # Database schema
│   ├── schema.prisma           # Prisma schema definition
│   └── seed.ts                 # Database seeding script
└── _bmad-output/               # BMAD Method artifacts
    ├── planning/               # PRD, architecture
    ├── solutioning/            # Epics, stories, UX
    └── implementation/         # Story files, sprint tracking
```

## 🔐 Authentication & Authorization

### Roles
- **GUEST** - Can browse packages, create bookings, manage profile
- **PARTNER** - Can access partner dashboard, track referrals
- **ADMIN** - Full access to admin dashboard and management features

### Protected Routes
```typescript
// Public routes (no auth required)
'/', '/packages', '/packages/*', '/testimonials', '/apply', '/partners'

// Authenticated routes (any logged-in user)
'/booking/*', '/dashboard'

// Role-specific routes
'/admin/*'    // ADMIN role required
'/partners/*' // PARTNER role required
```

## 🎨 Design System

### Brand Colors
- **Ocean Blue**: #003D5C (primary)
- **Gold**: #D4AF37 (accent)
- **Emerald**: #10B981 (success/CTAs)
- **Coral**: #FF6B6B (secondary accent)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Component Library
- Radix UI primitives for accessibility
- Tailwind CSS 4 for utility-first styling
- Custom components in `/components/ui/`

## 🔍 Code Quality

### Structured Logging (Pino)
- Module-specific loggers (booking, payment, email, gift, etc.)
- Automatic sensitive field redaction
- Environment-aware log levels
- Helper functions: `logError`, `logStripeError`

### Configuration Management
- Centralized in `lib/config/business-constants.ts`
- Accommodation pricing, partner discounts, refund policies
- Installment plan configurations, partner points calculations

### Type Safety
- Proper error type narrowing (no `catch (error: any)`)
- TRPCError for API error handling

### Testing Infrastructure
- **Unit Tests (Vitest)**: 80+ tests for critical tRPC routers
  - Booking router tests (43 tests)
  - Gift flow tests (37 tests)
- **E2E Tests (Playwright)**: Full user journey coverage

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Configuration

**Production:**
- Set all environment variables in Vercel dashboard
- Use production Stripe keys
- Configure SendGrid with production domain
- Enable Clerk production instance

**Database:**
- Use Supabase connection pooling (recommended)
- Configure `DATABASE_URL` with connection pooler
- Configure `DIRECT_URL` for migrations

## 📈 Development Workflow

### BMAD Method

This project uses the BMAD (Build-Measure-Adapt-Deliver) method:

1. **Planning Phase** - PRD, Architecture, Epics & Stories
2. **Implementation Phase** - Story-by-story development
3. **Review Phase** - Code review workflow
4. **Delivery Phase** - Sprint completion and retrospectives

### Git Workflow

```bash
# Feature development
git checkout -b feature/epic-story-description
# Make changes
git add .
git commit -m "feat: Story Title (EX-SY - Z pts)"
git push origin feature/epic-story-description
```

### Commit Message Format
```
feat: Medical Add-Ons Configurator (E3-S4 - 8 pts)

Complete medical add-ons selection step with category filtering.

Implementation:
✅ 4 Medical Categories with multi-select
✅ Thailand vs US pricing comparison
✅ Reusable AddOnCard component
✅ TypeScript validation (0 errors)

Files:
- app/booking/configure/add-ons/page.tsx (new)
- components/booking/medical-add-ons-selector.tsx (new)
- components/booking/add-on-card.tsx (new)

Testing:
✅ TypeScript validation passes
✅ Integration with booking store

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## 🔗 Links

- **Repository**: [github.com/RugbyCharger/pickleball-passport](https://github.com/RugbyCharger/pickleball-passport)
- **Production**: (Coming Q1 2026)
- **Staging**: (Coming soon)

## 📝 Recent Updates

### January 17, 2026
- ✅ **Epic 9: Partner Portal - COMPLETE** (100 story points)
  - 14 comprehensive user stories implemented
  - 15 new partner dashboard pages
  - Full partner program infrastructure (referrals, commissions, points)
  - Community forum with threaded discussions
  - Co-branded landing page builder with visual editor
  - Marketing materials library with download tracking
  - Performance analytics and reporting dashboards
  - Partner training resources with certification tracking
  - Guided onboarding flow for new partners
  - Added 180+ lines to Prisma schema for partner entities
  - 11,000+ lines of new TypeScript code

### January 16, 2026
- ✅ **Codebase Review Implementation** - Quality improvements
  - Added 80 unit tests for critical tRPC routers (booking, gift flows)
  - Replaced 79 console statements with Pino structured logging
  - Centralized magic numbers to business-constants.ts
  - Modularized 2500-line booking router into sub-routers
  - Improved type safety with proper error type narrowing

### January 13, 2026
- ✅ **Sentry Integration** - Production-ready error monitoring and performance tracking
  - Real-time error tracking for client, server, and edge runtimes
  - Global error boundary for React error handling
  - Performance monitoring with automatic tracing
  - Source map uploads for better debugging
  - Automatic Vercel Cron Monitor instrumentation
  - Tunnel route to bypass ad-blockers
  - Tree-shaking configuration for optimized bundle size

### January 11, 2026
- ✅ **Task Management System** - Added priority-based task tracking
  - Task model with URGENT/IMPORTANT/NORMAL priorities
  - Guest dashboard task section with visual priority indicators
  - Admin task management interface with filtering
  - tRPC API for task CRUD operations
- ✅ Created luxury digital flyers for Club Directors and Guests
- ✅ Completed comprehensive Pickleball Culture research guide
- ✅ Completed competitor analysis research (PickleballTravel.com)
- ✅ Updated middleware to support public access to marketing assets

### January 7, 2026
- ✅ E1-S8: Partner Program Landing Page completed
- ✅ E1-S9: Partner Signup Form completed
- ✅ E1-S7: Trust & Safety Section completed
- 📊 Marketing Website: 60% complete (9/15 stories)

### December 2025
- ✅ Epic 3 (Booking System): Core booking flow COMPLETE
  - Trip selection, profile completion, confirmation
  - Guest dashboard, booking details, cancellation/rescheduling
- ✅ Epic 4 (Payment Processing): Production-ready infrastructure
  - Stripe webhooks, PDF receipts, refund processing
- ✅ Epic 11 (Communications): Automated payment receipts
- ✅ Sprint 12: Admin Dashboard completed
  - Email template management, scheduled reminders, bulk notifications

## 🤝 Contributing

This is a private project. Development workflow:

1. Review sprint-status.yaml for current priorities
2. Run `/bmad:bmm:workflows:dev-story` to implement next story
3. Follow story acceptance criteria exactly
4. Run TypeScript validation before committing
5. Use standard commit message format
6. Push to GitHub when story is complete

## 📄 License

Private - All Rights Reserved
Copyright © 2025-2026 Pickleball Passport

---

Built with ❤️ using [Next.js](https://nextjs.org), [Clerk](https://clerk.com), [Prisma](https://prisma.io), and [Stripe](https://stripe.com)

**AI-Assisted Development**: This project uses Claude Code for accelerated development with the BMAD Method.
