# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
Pickleball-Passport/
├── app/                          # Next.js App Router (v16)
│   ├── (auth)/                   # Auth-related routes (group)
│   ├── (dashboard)/              # Authenticated dashboard routes (group)
│   │   ├── admin/                # Admin-only pages
│   │   ├── dashboard/            # Guest dashboard
│   │   └── partner/              # Partner dashboard
│   ├── (marketing)/              # Public marketing pages (group)
│   ├── api/                      # API routes and webhooks
│   │   ├── trpc/                 # tRPC handler
│   │   ├── webhooks/             # Stripe, Clerk, SendGrid, WhatsApp
│   │   ├── cron/                 # Scheduled jobs
│   │   └── receipts/             # Payment receipt downloads
│   ├── booking/                  # Booking flow routes
│   │   ├── configure/            # Multi-step booking form
│   │   ├── review/               # Review booking
│   │   ├── payment/              # Stripe payment
│   │   ├── confirmation/         # Booking confirmation
│   │   └── modify/               # Modify existing booking
│   ├── apply/                    # Partner application
│   ├── gift/                     # Gift booking system
│   ├── packages/                 # Package browsing
│   ├── partners/                 # Partner landing page
│   ├── unsubscribe/              # Newsletter unsubscribe
│   ├── layout.tsx                # Root layout (Clerk, Providers)
│   ├── globals.css               # Global styles (Tailwind)
│   └── page.tsx                  # Homepage
│
├── components/                   # React components (by feature)
│   ├── ui/                       # Reusable UI components (shadcn/radix)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ... (19 total)
│   ├── marketing/                # Homepage and marketing components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── hero-section.tsx
│   │   └── medical-cost-calculator.tsx
│   ├── booking/                  # Booking flow components (38 files)
│   │   ├── package-selector.tsx
│   │   ├── accommodation-chooser.tsx
│   │   ├── payment-plan-selector.tsx
│   │   └── ... (feature-specific)
│   ├── dashboard/                # Guest dashboard components
│   ├── admin/                    # Admin components
│   ├── partner/                  # Partner portal components
│   ├── payments/                 # Stripe/payment components
│   ├── email-editor/             # Email template editor
│   ├── cms/                      # CMS admin components
│   ├── testimonials/             # Testimonial display/management
│   ├── itinerary/                # Trip itinerary display
│   ├── guest/                    # Guest profile components
│   ├── forms/                    # Reusable form components
│   ├── auth/                     # Auth flows (onboarding)
│   ├── bookings/                 # Booking display/management
│   ├── settings/                 # Preference/settings components
│   └── analytics-provider.tsx    # Analytics integration
│
├── lib/                          # Server & shared utilities
│   ├── trpc/                     # tRPC configuration
│   │   ├── client.ts             # Client setup with React Query
│   │   └── server/
│   │       ├── trpc.ts           # Context, procedures, middleware
│   │       ├── root.ts           # Root router (combines all routers)
│   │       └── routers/          # 27 domain routers
│   │           ├── booking.ts    # Booking CRUD, payment intent
│   │           ├── partner.ts    # Partner portal, commissions
│   │           ├── admin.ts      # Admin operations
│   │           ├── payment.ts    # Payment records
│   │           ├── user.ts       # User profile, role management
│   │           ├── email.ts      # Email sending
│   │           ├── email-template.ts
│   │           ├── whatsapp.ts   # WhatsApp group management
│   │           ├── gift.ts       # Gift booking system
│   │           ├── package.ts    # Package queries
│   │           ├── analytics.ts  # Dashboard analytics
│   │           ├── cms.ts        # CMS (pages, sections)
│   │           ├── blog.ts       # Blog posts
│   │           ├── faq.ts        # FAQ management
│   │           ├── media.ts      # Media/image upload
│   │           ├── itinerary.ts  # Trip itinerary
│   │           └── ... (11 more)
│   ├── db/
│   │   ├── index.ts              # Prisma singleton
│   │   └── transactions.ts       # Transaction helpers
│   ├── stores/
│   │   └── booking-store.ts      # Zustand store for booking flow
│   ├── services/
│   │   └── currency.ts           # Multi-currency support
│   ├── auth/
│   │   └── permissions.ts        # Role-based permission checks
│   ├── email/
│   │   ├── send-email.ts         # SendGrid integration
│   │   ├── templates/            # Email templates (Handlebars)
│   │   │   ├── booking-confirmation.ts
│   │   │   ├── payment-receipt.ts
│   │   │   ├── guest-referral-code.ts
│   │   │   └── ... (10+ templates)
│   │   └── email-template-renderer.ts
│   ├── payments/
│   │   ├── stripe-client.ts      # Stripe SDK initialization
│   │   └── payment-utils.ts      # Payment helper functions
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── webhooks.ts           # Stripe event handlers
│   │   └── ... (additional stripe utilities)
│   ├── notifications/
│   │   ├── send-notification.ts
│   │   └── notification-queue.ts
│   ├── sms/
│   │   └── twilio-client.ts      # Twilio SMS
│   ├── whatsapp/
│   │   ├── twilio-client.ts      # Twilio WhatsApp
│   │   └── message-templates.ts
│   ├── mux/
│   │   └── mux-client.ts         # Video upload/streaming
│   ├── pdf/
│   │   ├── receipt-generator.ts  # React PDF for receipts
│   │   └── itinerary-pdf.ts
│   ├── gift/
│   │   ├── gift-logic.ts         # Gift state machine
│   │   └── gift-validation.ts
│   ├── storage/
│   │   └── s3-client.ts          # AWS S3 file storage
│   ├── jobs/
│   │   └── job-queue.ts          # Background job handling
│   ├── preferences/
│   │   ├── notification-preferences.ts
│   │   └── preference-utils.ts
│   ├── rate-limit/
│   │   └── upstash-limiter.ts    # Rate limiting
│   ├── logger/
│   │   └── pino-logger.ts        # Logging
│   ├── config/
│   │   ├── business-constants.ts # Pricing, tiers, capacity
│   │   └── __tests__/
│   ├── data/
│   │   └── ... (seed data, fixtures)
│   ├── mocks/
│   │   └── ... (test mocks)
│   ├── utils/
│   │   ├── installment-calculator.ts # Payment plan math
│   │   ├── analytics.ts           # Event tracking
│   │   ├── csv-export.ts
│   │   ├── html-escape.ts
│   │   ├── date-validation.ts
│   │   └── __tests__/
│   ├── hooks/
│   │   └── use-booking-progress.ts # Custom hook for booking
│   ├── config.ts                 # Global config
│   ├── env.ts                    # Environment validation
│   └── stripe.ts                 # Stripe configuration
│
├── prisma/
│   ├── schema.prisma             # Database schema (PostgreSQL)
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
│
├── tests/
│   ├── unit/                     # Unit tests (Vitest)
│   │   └── installment-calculator.spec.ts
│   │   └── email-template-renderer.spec.ts
│   ├── component/                # React component tests
│   │   └── PaymentPlanSelector.test.tsx
│   ├── api/                      # API integration tests
│   │   ├── stripe-integration.api.spec.ts
│   │   └── booking-create-installment.api.spec.ts
│   ├── e2e/                      # End-to-end tests (Playwright)
│   │   ├── example.spec.ts
│   │   └── installment-payment-flows.spec.ts
│   └── support/
│       └── fixtures/
│           └── factories/        # Test data factories
│               ├── user.factory.ts
│               ├── booking.factory.ts
│               ├── payment.factory.ts
│               └── stripe.factory.ts
│
├── content/                      # Markdown content
│   └── legal/                    # Legal documents (ToS, Privacy)
│
├── public/                       # Static assets
│   ├── og-images/               # OpenGraph images for SEO
│   └── ... (favicons, logos)
│
├── docs/                         # Documentation
│   └── plans/                   # Implementation plans
│
├── scripts/                      # Build/utility scripts
│   └── ralph/                    # Custom CLI tools
│
├── .planning/                    # GSD planning documents (generated)
│   └── codebase/                # Codebase analysis
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
│
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── .env.example                  # Environment variables template
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router - all routes and pages
- Contains: Server and client components, layouts, page files
- Key pattern: Route groups using parentheses `(name)/` for organization without URL impact

**app/(auth)/:**
- Purpose: Authentication flows (signup, signin, onboarding)
- Contains: Clerk integration pages, role selection

**app/(dashboard)/:**
- Purpose: Authenticated user dashboards
- Contains: Guest dashboard, partner dashboard, admin dashboard with role-based access

**app/(marketing)/:**
- Purpose: Public-facing content pages
- Contains: Landing pages, FAQ, contact, legal pages (no auth required)

**app/api/:**
- Purpose: Backend API endpoints
- Key routes:
  - `/api/trpc/[trpc]` - tRPC handler
  - `/api/webhooks/stripe` - Payment confirmations
  - `/api/webhooks/clerk` - User sync
  - `/api/webhooks/sendgrid/events` - Email delivery status
  - `/api/cron/` - Scheduled jobs

**app/booking/:**
- Purpose: Multi-step booking flow
- Flow: `/configure` (steps) → `/review` → `/payment` → `/confirmation`
- State: Zustand store maintains state across steps
- Key pattern: Each step has own `/page.tsx` for progressive disclosure

**components/:**
- Purpose: Reusable React components (feature-organized)
- Pattern: Components are feature-scoped, not generic
- UI components: shadcn + Radix primitives from `components/ui/`

**lib/:**
- Purpose: Shared utilities, services, and business logic
- Structure: By feature domain (trpc, db, email, payments, etc.)
- Key principle: Never import from `app/` - lib is independent

**lib/trpc/server/routers/:**
- Purpose: API endpoint definitions
- Pattern: One router per domain, all mounted in `root.ts`
- Each file: ~10-100 procedures, using protectedProcedure/adminProcedure

**lib/stores/:**
- Purpose: Client-side state with persistence
- Currently: Only `booking-store.ts` using Zustand
- Pattern: Persisted to localStorage, survives page refresh

**lib/email/templates/:**
- Purpose: Email content templates
- Format: Handlebars (.hbs-like), rendered with data context
- Usage: Called by email router, SendGrid API sends

**prisma/:**
- Purpose: Database schema and migrations
- Schema: 35+ models covering users, bookings, payments, partners, etc.
- Migrations: Auto-generated by `prisma db push`

**tests/:**
- Purpose: Test suites by type
- Structure:
  - `unit/`: Pure function tests (Vitest)
  - `component/`: React component tests (Testing Library)
  - `api/`: Integration tests via tRPC client
  - `e2e/`: User flows (Playwright)
  - `support/fixtures/factories/`: Reusable test data builders

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root layout, initializes Clerk, tRPC, React Query
- `app/page.tsx` - Homepage landing page
- `app/providers.tsx` - Provider wrapping (GoogleReCAPTCHA, tRPC, React Query)

**Configuration:**
- `lib/config/business-constants.ts` - Pricing, capacity, accommodation tiers
- `lib/env.ts` - Environment variable validation (Zod)
- `lib/config.ts` - Global app configuration
- `tailwind.config.ts` - CSS configuration
- `tsconfig.json` - TypeScript paths: `@/*` → `./` root

**Core Logic:**
- `lib/trpc/server/trpc.ts` - tRPC context, procedure builders
- `lib/trpc/server/root.ts` - Router composition (27 routers combined)
- `lib/db/index.ts` - Prisma singleton
- `lib/stores/booking-store.ts` - Booking flow state (Zustand)

**Testing:**
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `tests/support/fixtures/factories/` - Test data builders

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- Error boundaries: `error.tsx`
- Server-only utilities: `*.server.ts`
- Client-only utilities: `*.client.ts`
- Components: `ComponentName.tsx` (PascalCase)
- Utilities: `function-name.ts` (kebab-case)
- Tests: `*.spec.ts` or `*.test.tsx` (Vitest/Testing Library convention)

**Directories:**
- Feature domains: lowercase plural `components/booking/`, `lib/email/`
- Utilities: lowercase `lib/utils/`, `lib/config/`
- API routes: lowercase with intent `app/api/webhooks/`, `app/api/cron/`

**Components:**
- Export name matches filename: `function.tsx` exports `function`
- Compound components: `ComponentName.tsx` is parent, children like `ComponentName.Item.tsx` or nested subcomponent
- Props interface: `ComponentName + Props` (e.g., `PaymentFormProps`)

**Functions:**
- Handlers: `handle{Action}` or `on{Event}` (e.g., `handleSubmit`, `onClick`)
- Query functions: `get{Resource}`, `fetch{Resource}`
- Mutation functions: `create{Resource}`, `update{Resource}`, `delete{Resource}`
- Utilities: Verb-noun pattern (e.g., `calculateTotal`, `formatCurrency`)

**Types:**
- PascalCase for interfaces/types
- Enums: SCREAMING_SNAKE_CASE (from Prisma)
- Brand types: `{Type}WithId`, `{Type}Paginated`

**tRPC Routers:**
- File naming: lowercase plural noun (`user.ts`, `bookings.ts`, `email-templates.ts`)
- Procedure naming: camelCase verb-noun (`createPaymentIntent`, `getByBookingId`)
- Input validation schemas: Input type per procedure

## Where to Add New Code

**New Feature (e.g., Referral System):**
1. Database model: `prisma/schema.prisma` (add Referral model, enums)
2. Migration: Run `npm run db:generate` → creates migration file
3. Backend API: Create `lib/trpc/server/routers/referral.ts` with procedures
4. Register router: Add import and entry to `lib/trpc/server/root.ts`
5. Frontend components: Create `components/referral/` with React components
6. Page routing: Add `app/referral/` with page.tsx files
7. Tests: Create `tests/unit/referral.spec.ts` or `tests/api/referral.api.spec.ts`

**New Page (e.g., Landing Page):**
1. Create `app/(marketing)/new-page/page.tsx`
2. Create components: `components/marketing/new-page-section.tsx`
3. Add to layout if needed: Use existing `app/layout.tsx` or create `layout.tsx` in directory
4. Update navigation: Add link in `components/marketing/header.tsx` or relevant nav

**New API Endpoint (REST, not tRPC):**
1. Create `app/api/[feature]/[action]/route.ts`
2. Handle GET/POST/PUT methods
3. Use Prisma for data access
4. Add webhook signature validation if from external service
5. Logging via `lib/logger/`

**New Component:**
1. Determine feature domain: `components/{feature}/ComponentName.tsx`
2. Create file with `export function ComponentName(props: ComponentNameProps) { ... }`
3. Create `.test.tsx` in same directory if testable
4. Document props with JSDoc comments

**New Utility/Helper:**
1. Create `lib/{domain}/function-name.ts`
2. Export named function (not default)
3. Add unit tests in `lib/{domain}/__tests__/function-name.spec.ts`

**New Email Template:**
1. Create `lib/email/templates/template-name.ts`
2. Export `generateTemplateNameEmail(data: TemplateData)` function
3. Returns object with subject, html, text, plainText
4. Register in `email.ts` router as endpoint
5. Test via `/booking/configure/trip` page with error boundary

**Scheduled Job (Cron):**
1. Create `app/api/cron/job-name/route.ts`
2. Export `POST` handler (or `GET` for testing)
3. Validate Cron header: `x-forwarded-proto: https` and secret
4. Use Prisma transactions if state-changing
5. Return JSON with success/error status

## Special Directories

**lib/mocks/:**
- Purpose: Mock data for development and testing
- Generated: No
- Committed: Yes
- Usage: Imported in tests, development API calls

**lib/data/:**
- Purpose: Seed data and reference data
- Generated: No
- Committed: Yes
- Usage: Database seeding script, static lookups

**.next/:**
- Purpose: Build output and caching
- Generated: Yes (by Next.js build)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Package dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**prisma/migrations/:**
- Purpose: Database migration history
- Generated: Yes (by `prisma db push` or manual creation)
- Committed: Yes (track schema evolution)

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD orchestrator)
- Committed: Yes (reference for implementation)

**tests/support/:**
- Purpose: Test fixtures, factories, helpers
- Generated: No
- Committed: Yes
- Pattern: Not imported by production code

---

*Structure analysis: 2026-01-25*
