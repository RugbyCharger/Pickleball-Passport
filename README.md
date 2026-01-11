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
- **Deployment**: Vercel

## 📊 Project Status

**Current Sprint: Sprint 13** (January 2026)

### Sprint 13 Progress - COMPLETE

✅ **Epic 3 (Booking System) - Completed:**
- E3-S4: Medical Add-Ons Configurator (8 pts)
- E3-S5: Wellness Add-Ons Configurator (5 pts)
- E3-S8: Trip Selection - Choose Departure Date (5 pts)
- E3-S9: Guest Profile Completion (8 pts)
- E3-S10: Booking Confirmation Page (5 pts)
- E3-S11: Guest Dashboard - My Bookings (8 pts)
- E3-S12: Booking Details Page (5 pts)
- E3-S13: Booking Cancellation Flow (5 pts)
- E3-S14: Booking Rescheduling (5 pts)

✅ **Epic 4 (Payment Processing) - Key Features:**
- E4-S4: Stripe Webhook Handler (production-ready)
- E4-S8: Receipt Generation (PDF receipts)
- E4-S9: Refund Processing (full/partial refunds)

✅ **Epic 1 (Marketing Website) - Recent:**
- E1-S7: Trust & Safety Section
- E1-S8: Partner Program Landing Page
- E1-S9: Partner Signup Form

✅ **Epic 11 (Communications):**
- E11-S5: Payment Receipt Email (automated)

### Major Epics Status

| Epic | Name | Status | Stories | Progress |
|------|------|--------|---------|----------|
| **E1** | Marketing Website | 🟡 In Progress | 9/15 | 60% |
| **E2** | User Authentication | ✅ Done | 4/8 | 100% |
| **E3** | Booking System | ✅ Done | 14/18 | 78% |
| **E4** | Payment Processing | 🟡 In Progress | 5/12 | 42% |
| **E5** | Admin Dashboard | ✅ Done | 10/10 | 100% |
| **E9** | Partner Portal | 🟡 In Progress | 1/20 | 5% |
| **E11** | Communication System | 🟡 In Progress | 3/12 | 25% |

### Recent Milestones

**Sprint 13 (Completed - January 2026):**
- ✅ Complete Booking System (E3) - Full guest booking flow
- ✅ Trip Selection with departure dates
- ✅ Guest Profile Completion workflow
- ✅ Booking Confirmation & Dashboard
- ✅ Booking Management (cancellation & rescheduling)
- ✅ Payment Processing enhancements (webhooks, receipts, refunds)
- ✅ Marketing Website updates (Trust & Safety, Partner Program)
- ✅ **Task Management System** - Priority-based task tracking for bookings
  - Guest dashboard task view with priority indicators
  - Admin task management interface
  - Task priorities: URGENT, IMPORTANT, NORMAL
  - Task statuses: PENDING, IN_PROGRESS, COMPLETED

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
- 📝 Installment payment plans (Planned)
- 📝 Scheduled payment processing (Planned)

### Communication System (Epic 11)
- ✅ SendGrid integration
- ✅ Booking confirmation emails
- ✅ Payment receipt emails (automated with PDF attachments)
- ✅ Transactional email templates
- ✅ Admin email template management
- 📝 Pre-trip email sequences (Planned)
- 📝 SMS notifications (Planned)

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

### Supporting Entities
- **Application** - Guest application workflow
- **Testimonial** - Video testimonials (Mux integration)
- **PartnerReferral** - Referral tracking and rewards
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

# Testing
npm run test         # Run tests (when implemented)
```

## 📁 Project Structure

```
pickleball-passport/
├── app/                          # Next.js App Router pages
│   ├── (marketing)/             # Public marketing site
│   │   ├── page.tsx             # Homepage
│   │   ├── packages/            # Package explorer
│   │   └── apply/               # Application form
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
│   ├── (partners)/              # Partner portal
│   │   └── dashboard/           # Partner dashboard
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
│   ├── trpc/                   # tRPC setup
│   │   ├── client.ts           # Client-side tRPC
│   │   └── server/routers/     # API routers
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
Copyright © 2025 Pickleball Passport

---

Built with ❤️ using [Next.js](https://nextjs.org), [Clerk](https://clerk.com), [Prisma](https://prisma.io), and [Stripe](https://stripe.com)

**AI-Assisted Development**: This project uses Claude Code for accelerated development with the BMAD Method.
