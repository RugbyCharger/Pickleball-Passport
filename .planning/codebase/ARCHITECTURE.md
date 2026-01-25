# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Full-stack Next.js application using tRPC for type-safe API layer, Zustand for client state management, and Prisma for database abstraction.

**Key Characteristics:**
- Client-server separation with tRPC bridging the gap
- Server-side authentication via Clerk integration
- Multi-role access control (GUEST, PARTNER, ADMIN)
- Modular tRPC router architecture with 27+ domain-specific routers
- Client-side state management for multi-step booking flow
- Real-time data synchronization via React Query
- Webhook integration for external services (Stripe, Clerk, SendGrid, WhatsApp, Svix)

## Layers

**Presentation Layer (Client):**
- Purpose: User interface and client-side interactions
- Location: `app/` (Next.js pages), `components/`
- Contains: React components, layouts, page routes, error boundaries
- Depends on: Zustand stores, tRPC client, React Query
- Used by: End users, browser rendering

**Application/API Layer:**
- Purpose: Type-safe RPC endpoints and business logic
- Location: `lib/trpc/server/routers/`
- Contains: 27 routers (user, booking, payment, partner, admin, etc.)
- Depends on: Prisma, authentication context, external services
- Used by: Client components via tRPC client

**Service Layer:**
- Purpose: Domain-specific business logic and integrations
- Location: `lib/` subdirectories (email, payments, storage, notifications, etc.)
- Contains: Currency conversion, email templates, PDF generation, SMS/WhatsApp handling, file storage
- Depends on: Prisma database, external APIs (Stripe, SendGrid, Twilio, AWS S3, Mux)
- Used by: Routers, other services, cron jobs

**Data Layer:**
- Purpose: Database abstraction and transactions
- Location: `lib/db/`, `prisma/schema.prisma`
- Contains: Prisma client singleton, transaction helpers, migrations
- Depends on: PostgreSQL (Supabase)
- Used by: All routers and services

**Configuration/Infrastructure:**
- Purpose: Environment setup, constants, business logic configuration
- Location: `lib/config/`, `lib/env.ts`
- Contains: Business constants (pricing, tiers), environment variables, feature flags
- Depends on: Environment files
- Used by: Services, stores, components

## Data Flow

**User Booking Flow:**

1. User arrives at `/` → Marketing page (HeroSection, PackageSection)
2. Clicks "Book Now" → redirects to `/booking/configure`
3. Multi-step configurator (each step updates Zustand booking-store):
   - Duration selection (`/booking/configure/duration`)
   - Package selection (handled in store)
   - Accommodation tier selection (`/booking/configure/accommodation`)
   - Add-ons selection (`/booking/configure/add-ons`)
   - Wellness customization (`/booking/configure/wellness`)
   - Profile/guest info (`/booking/configure/profile`)
4. Review page (`/booking/review`) → displays calculated total via booking-store
5. Payment flow (`/booking/payment`):
   - Client fetches exchange rates
   - Creates Stripe payment intent via `trpc.booking.createPaymentIntent`
   - Renders Stripe Elements form
   - On success, creates booking in database
   - Stores clerk_user_id for authorization
6. Confirmation page (`/booking/confirmation`) → displays booking details
7. Post-booking flows:
   - Dashboard access (`/(dashboard)/dashboard`)
   - Booking modification (`/booking/modify/[bookingId]`)
   - Gift acceptance (`/gift/accept`)

**Authentication & Authorization:**

1. Clerk OAuth provider (Google, email signup)
2. User record created/synced via `userRouter.syncClerkUser`
3. Role-based access control:
   - GUEST: Default role, can book trips
   - PARTNER: Referral access, commission tracking
   - ADMIN: Full system access, user management
4. tRPC context provides authenticated user: `ctx.user` from Clerk
5. Protected procedures check `ctx.user` exists
6. Role-specific procedures check `ctx.db.user.role`

**Data Mutations & Server Actions:**

1. Client calls `trpc.router.procedure.useMutation()`
2. tRPC serializes input via superjson
3. Server receives in protected/admin procedure
4. Prisma transaction (if needed) via `lib/db/transactions.ts`
5. External API calls (Stripe, SendGrid, etc.)
6. Response serialized and returned to client
7. React Query cache updated automatically

**Real-time Updates:**

1. React Query caches all tRPC data
2. Mutations invalidate related queries (manual)
3. Polling intervals set in `QueryClient` (staleTime: 60s)
4. WebSocket-like updates via Svix webhooks → Upstash Redis → Frontend

**State Management:**

- **Server State:** Prisma ORM queries
- **Client State:** Zustand (booking-store for multi-step form)
- **UI State:** React component useState/useReducer
- **Cache State:** React Query (tRPC data)
- **Persistent State:** localStorage (via Zustand persist middleware)

## Key Abstractions

**Routers:**
- Purpose: Organize RPC endpoints by domain
- Examples: `lib/trpc/server/routers/booking.ts`, `lib/trpc/server/routers/partner.ts`
- Pattern: Each router has public, protected, and admin procedures; exports from `routers/index.ts` and combined in `root.ts`

**Procedures:**
- Purpose: Define access control and validation
- Examples:
  - `publicProcedure`: Open endpoint (e.g., listing packages)
  - `protectedProcedure`: Requires authentication (e.g., user profile)
  - `adminProcedure`: Requires ADMIN role (e.g., user management)
  - Role-based: `guestProcedure`, `partnerProcedure`
- Pattern: Middleware chain validates context before executing handler

**Email Templates:**
- Purpose: Decouple email content from sending logic
- Location: `lib/email/templates/`
- Pattern: Handlebars templates with data binding, HTML generation via `lib/email/send-email.ts`

**Payment Processing:**
- Purpose: Handle Stripe integration for one-time and installment payments
- Location: `lib/payments/`, `lib/stripe/`
- Pattern:
  - Client creates payment intent (backend initiates Stripe)
  - Client submits payment via Stripe Elements
  - Webhook listener (`/api/webhooks/stripe`) handles confirmation
  - Database updated on success (PaymentRecord, Booking status)

**Notifications:**
- Purpose: Multi-channel delivery (email, SMS, WhatsApp, in-app)
- Location: `lib/notifications/`, `lib/email/`, `lib/sms/`, `lib/whatsapp/`
- Pattern: Service abstracts provider (SendGrid, Twilio, Twilio WhatsApp)

## Entry Points

**Web Application:**
- Location: `app/layout.tsx`
- Triggers: Browser load
- Responsibilities: Initialize providers (ClerkProvider, tRPC, React Query), set global styles, render root layout

**API/tRPC Routes:**
- Location: `app/api/trpc/[trpc]/route.ts`
- Triggers: `POST /api/trpc/[router].[procedure]`
- Responsibilities: Route tRPC calls to appropriate router/procedure via HTTP

**Webhooks:**
- Stripe: `app/api/webhooks/stripe/route.ts` → Payment verification
- Clerk: `app/api/webhooks/clerk/route.ts` → User sync
- SendGrid: `app/api/webhooks/sendgrid/events/route.ts` → Email delivery status
- WhatsApp: `app/api/webhooks/whatsapp/route.ts` → Message delivery
- Svix (Partner referrals): Handled via integration

**Cron Jobs:**
- Location: `app/api/cron/`
- Triggers: External scheduler (Vercel Cron, CI pipeline)
- Responsibilities:
  - Charge installments
  - Send scheduled gifts
  - Send pre-trip emails
  - Send payment reminders
  - Expire unclaimed gifts
  - Process referral completion bonuses
  - Send WhatsApp milestones

**Admin Pages:**
- Location: `app/(dashboard)/admin/`
- Triggers: Admin user navigation
- Responsibilities: User management, email templates, testimonials, task management

## Error Handling

**Strategy:** Layered approach with graceful degradation

**Patterns:**

1. **tRPC Error Handling:**
   - Server throws `TRPCError` with code (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.)
   - Automatically serialized to client
   - Client catches via React Query hook error state

2. **Component Error Boundaries:**
   - Location: `app/*/error.tsx` files
   - Example: `app/booking/configure/trip/error.tsx`
   - Shows user-friendly error with retry button
   - Logs to console (integration with Sentry planned)

3. **Validation Errors:**
   - Input validation via Zod schemas on all procedures
   - Validation errors returned as TRPCError with details
   - Client displays validation messages via form libraries (react-hook-form)

4. **Database Transaction Rollback:**
   - Prisma transactions via `lib/db/transactions.ts`
   - Automatic rollback on error

5. **External Service Fallback:**
   - Email failures: Logged but don't block booking
   - Stripe failures: Return error to user for retry
   - SMS/WhatsApp: Queued for retry via Upstash

## Cross-Cutting Concerns

**Logging:**
- Framework: Pino
- Location: `lib/logger/`
- Pattern: Named loggers for each module, info/warn/error levels
- Usage: Routers and services log key events (booking created, payment succeeded)

**Validation:**
- Framework: Zod
- Pattern: All tRPC inputs have `.input(z.object({...}))`
- Usage: Ensures type safety and runtime validation

**Authentication:**
- Framework: Clerk
- Pattern: `currentUser()` from Clerk on server, available in tRPC context
- Usage: Protects routes, enables role-based access control

**Rate Limiting:**
- Framework: Upstash Rate Limit
- Location: `lib/rate-limit/`
- Pattern: Middleware on public endpoints
- Usage: Prevent abuse on referral links, contact form, newsletter signup

**Database Access Control:**
- Pattern: Users can only see their own data via Prisma queries with `where: { userId: ctx.user.id }`
- Example: `booking.ts` filters by authenticated user

**Multi-tenancy (Partner Tier):**
- Pattern: Partners query via partner filters, not global data
- Example: `partner.ts` filters commission by partner_id

---

*Architecture analysis: 2026-01-25*
