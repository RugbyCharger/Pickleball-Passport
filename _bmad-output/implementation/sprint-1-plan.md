# Sprint 1 Implementation Plan
**Project:** Pickleball Passport
**Sprint:** 1 of ~10-12 (MVP Phase)
**Duration:** 2 weeks
**Goal:** Project scaffolding, database setup, and authentication foundation
**Target Points:** 20

---

## Sprint Goal

Establish the technical foundation for Pickleball Passport by:
1. Creating a production-ready Next.js application structure
2. Designing and implementing the complete database schema
3. Integrating Clerk authentication with role-based access control
4. Setting up core infrastructure (tRPC, Prisma, Tailwind)

**Success Criteria:**
- ✅ Next.js app running locally with TypeScript
- ✅ Database schema created and migrated
- ✅ Users can sign up, log in, and be assigned roles (Guest/Partner/Admin)
- ✅ Protected routes enforce authentication
- ✅ tRPC API layer functional

---

## Stories in Sprint 1

### Foundation Stories (Infrastructure)

#### **FOUNDATION-1: Next.js Project Scaffolding** (3 points)
**Status:** Ready for dev
**Priority:** P0

**Tasks:**
1. Initialize Next.js 14+ app with App Router
   ```bash
   npx create-next-app@latest pickleball-passport --typescript --tailwind --app --no-src-dir
   cd pickleball-passport
   ```
2. Configure TypeScript strict mode (`tsconfig.json`)
3. Set up project folder structure:
   ```
   /app
     /api
     /(auth)
       /sign-up
       /sign-in
     /(marketing)
       /page.tsx (homepage)
       /packages
       /testimonials
     /(dashboard)
       /guest
       /partner
       /admin
     /layout.tsx
   /components
     /ui (shadcn components)
     /marketing
     /dashboard
   /lib
     /db (Prisma client)
     /trpc
     /utils
   /prisma
     /schema.prisma
   /public
     /images
     /videos
   ```
4. Add scripts to `package.json`:
   - `dev`, `build`, `start`, `lint`, `db:push`, `db:studio`
5. Initialize Git repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Next.js scaffolding"
   ```

**Acceptance Criteria:**
- [ ] `npm run dev` starts the app on `http://localhost:3000`
- [ ] TypeScript compilation has no errors
- [ ] Folder structure matches architecture document
- [ ] Git repository initialized with proper `.gitignore`

---

#### **FOUNDATION-2: Database Schema Design** (5 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-1

**Tasks:**
1. Review architecture document for all entities
2. Create `prisma/schema.prisma` with complete schema:
   - **User** (Clerk integration: id, email, role, createdAt)
   - **GuestProfile** (personal info, pickleball background)
   - **PartnerProfile** (club info, referral code, tier)
   - **Package** (name, description, basePrice, duration options)
   - **Trip** (dates, destination, capacity, currentBookings)
   - **Booking** (guest, trip, package, status, totalPrice)
   - **AddOn** (type, category, thPrice, usPrice)
   - **BookingAddOn** (join table: booking + addon)
   - **Payment** (booking, amount, status, stripePaymentIntentId)
   - **Application** (guest applications, status)
   - **Testimonial** (guest, video, muxPlaybackId)
   - **Notification** (user, type, content, readAt)
   - **PartnerReferral** (partner, booking, pointsEarned)
3. Define relationships (one-to-many, many-to-many)
4. Add indexes for performance (email, bookingId, etc.)
5. Add enums:
   ```prisma
   enum Role { GUEST, PARTNER, ADMIN }
   enum BookingStatus { DRAFT, PENDING_PAYMENT, CONFIRMED, CANCELLED, COMPLETED }
   enum PaymentStatus { PENDING, SUCCEEDED, FAILED, REFUNDED }
   enum ApplicationStatus { SUBMITTED, REVIEWING, APPROVED, REJECTED }
   ```
6. Document schema with comments

**Acceptance Criteria:**
- [ ] Schema includes all entities from architecture document
- [ ] Relationships correctly defined (foreign keys, cascades)
- [ ] Enums cover all possible states
- [ ] Schema passes `prisma validate`
- [ ] Schema documented with inline comments

**Schema Reference:**
See [architecture-Pickleball-Passport-2025-12-28.md](_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md) - Data Model section

---

#### **FOUNDATION-3: Prisma Setup & Migrations** (3 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-2

**Tasks:**
1. Install Prisma dependencies:
   ```bash
   npm install prisma @prisma/client
   npm install -D prisma
   ```
2. Configure Prisma for PostgreSQL (Supabase):
   - Create Supabase project (free tier for development)
   - Add `DATABASE_URL` to `.env` (connection string)
   - Configure `schema.prisma` datasource
3. Create initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Create Prisma client singleton (`lib/db.ts`):
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

   export const prisma = globalForPrisma.prisma || new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```
6. Test database connection:
   ```bash
   npx prisma studio
   ```

**Acceptance Criteria:**
- [ ] Prisma successfully connects to Supabase PostgreSQL
- [ ] Migration applied (`prisma/migrations/` folder created)
- [ ] Prisma Studio opens and shows empty tables
- [ ] `lib/db.ts` exports working Prisma client
- [ ] No connection errors in logs

---

#### **FOUNDATION-4: tRPC Setup** (3 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-1, FOUNDATION-3

**Tasks:**
1. Install tRPC dependencies:
   ```bash
   npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query
   npm install zod
   ```
2. Create tRPC router structure:
   ```
   /lib/trpc
     /server
       /routers
         /user.ts
         /package.ts
         /booking.ts
         /payment.ts
         /application.ts
       /trpc.ts (context, middleware)
       /root.ts (appRouter)
     /client.ts (client-side tRPC)
   ```
3. Configure tRPC context with Clerk auth:
   ```typescript
   // lib/trpc/server/trpc.ts
   import { currentUser } from '@clerk/nextjs/server'

   export const createTRPCContext = async (opts: { headers: Headers }) => {
     const user = await currentUser()
     return { user, db: prisma }
   }
   ```
4. Create root router (`lib/trpc/server/root.ts`)
5. Set up tRPC API route (`app/api/trpc/[trpc]/route.ts`)
6. Configure React Query provider (`app/providers.tsx`)
7. Create example router (user):
   ```typescript
   // lib/trpc/server/routers/user.ts
   export const userRouter = router({
     getProfile: protectedProcedure.query(async ({ ctx }) => {
       return ctx.db.user.findUnique({ where: { id: ctx.user.id } })
     }),
   })
   ```

**Acceptance Criteria:**
- [ ] tRPC client successfully calls server procedures
- [ ] Test query returns data from database
- [ ] TypeScript autocompletion works for tRPC calls
- [ ] Protected procedures enforce authentication
- [ ] React Query devtools show tRPC queries

---

#### **FOUNDATION-5: Tailwind CSS & Component Library** (2 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-1

**Tasks:**
1. Verify Tailwind CSS is configured (should be from `create-next-app`)
2. Install Shadcn UI:
   ```bash
   npx shadcn-ui@latest init
   ```
3. Add base components:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add form
   npx shadcn-ui@latest add toast
   ```
4. Configure theme colors in `tailwind.config.ts`:
   - Primary: Luxury blue (#1E3A8A)
   - Secondary: Gold accent (#D97706)
   - Background: Off-white (#FAFAF9)
5. Add custom fonts (Google Fonts):
   - Headings: Playfair Display (luxury serif)
   - Body: Inter (clean sans-serif)
6. Create layout components:
   - `components/ui/container.tsx` (max-width wrapper)
   - `components/ui/section.tsx` (spacing utility)

**Acceptance Criteria:**
- [ ] Tailwind compiles without errors
- [ ] Shadcn components render correctly
- [ ] Custom theme colors applied
- [ ] Fonts load from Google Fonts
- [ ] Test page shows styled components

---

#### **FOUNDATION-6: Environment Variables & Config** (1 point)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-1

**Tasks:**
1. Create `.env` file (add to `.gitignore`):
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
   CLERK_SECRET_KEY=""
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
   STRIPE_SECRET_KEY=""
   STRIPE_WEBHOOK_SECRET=""

   # SendGrid
   SENDGRID_API_KEY=""
   SENDGRID_FROM_EMAIL="hello@pickleballpassport.com"

   # Mux (video)
   MUX_TOKEN_ID=""
   MUX_TOKEN_SECRET=""

   # App Config
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
2. Create `.env.example` (template for team):
   - Same structure but empty values
3. Add runtime config validation (`lib/config.ts`):
   ```typescript
   import { z } from 'zod'

   const envSchema = z.object({
     DATABASE_URL: z.string().url(),
     CLERK_SECRET_KEY: z.string().min(1),
     // ... etc
   })

   export const env = envSchema.parse(process.env)
   ```

**Acceptance Criteria:**
- [ ] `.env` file created and populated (development values)
- [ ] `.env.example` committed to Git
- [ ] `.env` in `.gitignore`
- [ ] Config validation throws errors for missing vars
- [ ] All required environment variables documented

---

### Authentication Stories (Epic 2)

#### **E2-S1: Clerk Integration Setup** (3 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** FOUNDATION-1, FOUNDATION-6

**Tasks:**
1. Create Clerk account (https://clerk.com)
2. Create new Clerk application
3. Copy API keys to `.env`
4. Install Clerk SDK:
   ```bash
   npm install @clerk/nextjs
   ```
5. Wrap app with `ClerkProvider` (`app/layout.tsx`):
   ```typescript
   import { ClerkProvider } from '@clerk/nextjs'

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>{children}</body>
         </html>
       </ClerkProvider>
     )
   }
   ```
6. Create `middleware.ts` for route protection:
   ```typescript
   import { authMiddleware } from '@clerk/nextjs'

   export default authMiddleware({
     publicRoutes: ["/", "/packages", "/testimonials", "/api/webhooks(.*)"],
   })

   export const config = {
     matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
   }
   ```
7. Create sign-in and sign-up pages:
   - `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
   - `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

**Acceptance Criteria:**
- [ ] Clerk SDK installed and configured
- [ ] ClerkProvider wraps application
- [ ] Middleware protects dashboard routes
- [ ] Sign-in page renders Clerk UI
- [ ] Sign-up page renders Clerk UI
- [ ] Public routes accessible without auth
- [ ] Protected routes redirect to sign-in

---

#### **E2-S2: User Sign-Up Flow** (5 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** E2-S1, FOUNDATION-3

**Tasks:**
1. Configure Clerk sign-up settings:
   - Enable email/password
   - Enable Google OAuth
   - Enable Apple OAuth
   - Require email verification
2. Create Clerk webhook endpoint (`app/api/webhooks/clerk/route.ts`):
   ```typescript
   import { Webhook } from 'svix'
   import { headers } from 'next/headers'
   import { prisma } from '@/lib/db'

   export async function POST(req: Request) {
     const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
     const headerPayload = headers()
     const svix_id = headerPayload.get("svix-id")
     const svix_timestamp = headerPayload.get("svix-timestamp")
     const svix_signature = headerPayload.get("svix-signature")

     const body = await req.json()
     const wh = new Webhook(WEBHOOK_SECRET)

     let evt
     try {
       evt = wh.verify(JSON.stringify(body), {
         "svix-id": svix_id,
         "svix-timestamp": svix_timestamp,
         "svix-signature": svix_signature,
       })
     } catch (err) {
       return new Response('Webhook verification failed', { status: 400 })
     }

     if (evt.type === 'user.created') {
       await prisma.user.create({
         data: {
           id: evt.data.id,
           email: evt.data.email_addresses[0].email_address,
           role: 'GUEST', // Default role
         },
       })
     }

     return new Response('Webhook processed', { status: 200 })
   }
   ```
3. Configure webhook in Clerk dashboard:
   - Endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Create onboarding flow (`app/(auth)/onboarding/page.tsx`):
   - Ask: "Are you a guest or partner?"
   - Update user role in database
   - Redirect to appropriate dashboard
5. Send welcome email after signup (SendGrid):
   ```typescript
   import sgMail from '@sendgrid/mail'

   await sgMail.send({
     to: user.email,
     from: 'hello@pickleballpassport.com',
     subject: 'Welcome to Pickleball Passport!',
     html: '<p>Welcome! Your transformation journey starts here.</p>',
   })
   ```

**Acceptance Criteria:**
- [ ] User can sign up with email/password
- [ ] User can sign up with Google
- [ ] User can sign up with Apple
- [ ] Email verification required
- [ ] Webhook creates user in database
- [ ] User redirected to onboarding
- [ ] User can select role (Guest/Partner)
- [ ] Welcome email sent to new users
- [ ] User record synced between Clerk and database

---

#### **E2-S3: User Login Flow** (3 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** E2-S1, E2-S2

**Tasks:**
1. Configure Clerk sign-in page (`app/(auth)/sign-in/[[...sign-in]]/page.tsx`):
   ```typescript
   import { SignIn } from '@clerk/nextjs'

   export default function SignInPage() {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <SignIn
           appearance={{
             elements: {
               formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
             },
           }}
         />
       </div>
     )
   }
   ```
2. Implement role-based redirect logic:
   - Create `lib/auth/redirects.ts`:
     ```typescript
     export function getRoleRedirect(role: string) {
       switch (role) {
         case 'GUEST': return '/dashboard/guest'
         case 'PARTNER': return '/dashboard/partner'
         case 'ADMIN': return '/dashboard/admin'
         default: return '/onboarding'
       }
     }
     ```
   - Use in Clerk `afterSignIn` callback
3. Add "Remember me" option (handled by Clerk automatically)
4. Test session persistence across tabs

**Acceptance Criteria:**
- [ ] User can log in with email/password
- [ ] User can log in with Google
- [ ] User can log in with Apple
- [ ] User can log in with magic link
- [ ] After login, user redirected based on role
- [ ] Session persists across browser tabs
- [ ] "Remember me" keeps user logged in
- [ ] Invalid credentials show error message

---

#### **E2-S4: Role-Based Access Control** (5 points)
**Status:** Ready for dev
**Priority:** P0
**Dependencies:** E2-S2, E2-S3, FOUNDATION-4

**Tasks:**
1. Add role to database schema (already in FOUNDATION-2):
   ```prisma
   model User {
     id    String @id // Clerk user ID
     email String @unique
     role  Role   @default(GUEST)
     createdAt DateTime @default(now())
   }

   enum Role { GUEST, PARTNER, ADMIN }
   ```
2. Create tRPC middleware for role checking:
   ```typescript
   // lib/trpc/server/trpc.ts
   const enforceRole = (allowedRoles: Role[]) =>
     t.middleware(async ({ ctx, next }) => {
       if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

       const dbUser = await ctx.db.user.findUnique({
         where: { id: ctx.user.id },
       })

       if (!dbUser || !allowedRoles.includes(dbUser.role)) {
         throw new TRPCError({ code: 'FORBIDDEN' })
       }

       return next({ ctx: { ...ctx, role: dbUser.role } })
     })

   export const guestProcedure = t.procedure.use(enforceRole(['GUEST']))
   export const partnerProcedure = t.procedure.use(enforceRole(['PARTNER']))
   export const adminProcedure = t.procedure.use(enforceRole(['ADMIN']))
   ```
3. Update middleware to enforce routes:
   ```typescript
   // middleware.ts
   export default authMiddleware({
     publicRoutes: ["/", "/packages", "/testimonials"],
     afterAuth(auth, req) {
       // Custom role-based redirect logic
       if (req.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
         return Response.redirect(new URL('/unauthorized', req.url))
       }
     },
   })
   ```
4. Create dashboard placeholder pages:
   - `app/(dashboard)/dashboard/guest/page.tsx`
   - `app/(dashboard)/dashboard/partner/page.tsx`
   - `app/(dashboard)/dashboard/admin/page.tsx`
5. Test role enforcement:
   - Guest cannot access partner portal
   - Partner cannot access admin dashboard
   - Admin can access all areas

**Acceptance Criteria:**
- [ ] User role stored in database
- [ ] tRPC procedures enforce role checks
- [ ] Middleware blocks unauthorized route access
- [ ] Guest role: Access booking, member portal
- [ ] Partner role: Access partner portal
- [ ] Admin role: Access admin dashboard
- [ ] Unauthorized access shows 403 error
- [ ] Role-based redirect after login works

---

## Sprint 1 Task Breakdown (Development Sequence)

### Week 1: Foundation & Infrastructure

**Day 1-2: Project Setup**
1. ✅ FOUNDATION-1: Next.js scaffolding (3 points)
2. ✅ FOUNDATION-6: Environment variables (1 point)
3. ✅ FOUNDATION-5: Tailwind & Shadcn UI (2 points)

**Day 3-4: Database**
4. ✅ FOUNDATION-2: Database schema design (5 points)
5. ✅ FOUNDATION-3: Prisma setup & migrations (3 points)

**Day 5: API Layer**
6. ✅ FOUNDATION-4: tRPC setup (3 points)

**Week 1 Total:** 17 points

---

### Week 2: Authentication

**Day 6-7: Clerk Integration**
7. ✅ E2-S1: Clerk integration setup (3 points)
8. ✅ E2-S2: User sign-up flow (5 points)

**Day 8: Login & RBAC**
9. ✅ E2-S3: User login flow (3 points)
10. ✅ E2-S4: Role-based access control (5 points)

**Week 2 Total:** 16 points

---

## Sprint 1 Total Points: 33 points

**Note:** Original target was 20 points, but foundation stories add significant value. Adjust if velocity is lower than expected.

---

## Definition of Done (DoD)

Each story is considered "done" when:
- ✅ All acceptance criteria met
- ✅ Code reviewed (self-review for solo dev)
- ✅ TypeScript compiles without errors
- ✅ No ESLint warnings
- ✅ Tested locally (manual testing)
- ✅ Git commit with descriptive message
- ✅ Pushed to repository

---

## Sprint 1 Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database schema changes mid-sprint | Medium | High | Design comprehensive schema upfront, review architecture doc |
| Clerk webhook delays | Low | Medium | Test webhook locally with ngrok, have fallback |
| Prisma migration issues | Low | Medium | Use Prisma Studio to verify migrations, keep backups |
| Solo developer burnout | Medium | High | Set realistic daily goals, take breaks, timebox tasks |

---

## Sprint 1 Success Metrics

By end of Sprint 1, the project should have:
- ✅ Working Next.js app with production-ready structure
- ✅ Complete database schema deployed to Supabase
- ✅ Users can sign up and log in via Clerk
- ✅ Role-based access control enforced
- ✅ tRPC API ready for feature development
- ✅ No TypeScript errors, clean codebase

**Next Sprint Preview:**
Sprint 2 will focus on **Marketing Website Core Pages** (E1-S1, E1-S2, E1-S3) - Homepage, package explorer, and package detail pages.

---

## Notes

- This is a **solo development sprint** - estimates are conservative
- If velocity is higher, pull in E1-S1 (Homepage Hero) to Sprint 1
- If velocity is lower, defer E2-S4 (RBAC) to Sprint 2
- Update `sprint-status.yaml` daily with story progress
- Run retrospective at end of sprint to measure actual velocity
