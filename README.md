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

**Current Sprint: Sprint 13** (December 2025)

### Sprint 13 Progress (13/18 points - 72%)

✅ **Completed:**
- E3-S4: Medical Add-Ons Configurator (8 pts)
- E3-S5: Wellness Add-Ons Configurator (5 pts) - **In Review**

📝 **Ready for Development:**
- E3-S8: Trip Selection - Choose Departure Date (5 pts)

🎯 **Remaining Capacity:** 5 points

### Major Epics Status

| Epic | Name | Status | Stories | Progress |
|------|------|--------|---------|----------|
| **E1** | Marketing Website | 🟡 In Progress | 6/15 | 40% |
| **E2** | User Authentication | ✅ Done | 4/8 | 100% |
| **E3** | Booking System | 🟡 In Progress | 8/18 | 72% |
| **E4** | Payment Processing | 🟡 In Progress | 5/12 | 42% |
| **E5** | Admin Dashboard | ✅ Done | 10/10 | 100% |
| **E9** | Partner Portal | 🟡 In Progress | 1/20 | 5% |
| **E11** | Communication System | 🟡 In Progress | 2/12 | 17% |

### Recent Milestones

**Sprint 12 (Completed):**
- ✅ Admin Dashboard - Testing & Polish
- ✅ Email Template Management
- ✅ Scheduled Trip Reminders
- ✅ Bulk Notifications

**Sprint 11 (Completed):**
- ✅ Analytics Dashboard
- ✅ Package & Add-On Management
- ✅ Trip Management
- ✅ Guest Management

## 🎨 Key Features

### Booking System (Epic 3)
- ✅ Multi-step package configurator
  - Package selection (5 options)
  - Duration selection (7, 10, 14, 21 days)
  - Accommodation tier (Luxury/Ultra-Luxury/Villa)
  - Medical/Cosmetic add-ons (4 categories)
  - Wellness & Cultural add-ons (4 categories)
  - Real-time pricing with Thailand vs US comparison
- ✅ Booking review page with itinerary
- ✅ Guest dashboard with booking management
- ✅ Booking details page with payment tracking
- 📝 Trip date selection (In Development)

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

### Payment Processing (Epic 4)
- ✅ Stripe integration setup
- ✅ Payment Intent creation
- ✅ Payment form UI with Stripe Elements
- ✅ Payment failure handling
- 📝 Webhook handler (Pending)
- 📝 Receipt generation (Pending)

### Communication System (Epic 11)
- ✅ SendGrid integration
- ✅ Booking confirmation emails
- ✅ Transactional email templates
- 📝 Pre-trip email sequences (Planned)
- 📝 Payment receipt emails (Planned)

### Marketing Website (Epic 1)
- ✅ Homepage hero section
- ✅ Package explorer grid
- ✅ Package detail pages
- ✅ Testimonial video gallery
- ✅ Multi-step application form
- ✅ Mobile navigation
- ✅ Footer
- 📝 Medical tourism cost calculator (Planned)
- 📝 Trust & safety section (Planned)

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
- **[SPRINT_12_SUMMARY.md](SPRINT_12_SUMMARY.md)** - Latest sprint summary
- **[Architecture](_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md)** - System architecture
- **[PRD](_bmad-output/planning/prd-Pickleball-Passport-2025-12-28.md)** - Product requirements

### Development Tracking
- **[Sprint Status](_bmad-output/implementation/sprint-status.yaml)** - Real-time progress tracking
- **[Epics & Stories](_bmad-output/solutioning/epics-and-stories-Pickleball-Passport-2025-12-28.md)** - All user stories
- **[Implementation Stories](_bmad-output/implementation/)** - Detailed story files

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

### December 29, 2025
- ✅ E3-S5: Wellness Add-Ons Configurator completed
- ✅ E3-S4: Medical Add-Ons Configurator completed
- 📝 E3-S8: Trip Selection story created (ready-for-dev)
- 📊 Sprint 13: 72% complete (13/18 points)

### December 28, 2025
- ✅ Sprint 12: Admin Dashboard completed
- ✅ Email template management
- ✅ Scheduled trip reminders (30/7/1 day automation)
- ✅ Bulk notifications system

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
