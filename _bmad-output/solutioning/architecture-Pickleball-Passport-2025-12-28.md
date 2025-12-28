---
date: 2025-12-28
author: Grant
project: Pickleball Passport
version: 1.0
status: Draft
inputDocuments:
  - 'prd-Pickleball-Passport-2025-12-28.md'
  - 'product-brief-Pickleball-Passport-2025-12-27.md'
---

# Technical Architecture Document: Pickleball Passport

## Executive Summary

This document defines the comprehensive technical architecture for Pickleball Passport's digital ecosystem, supporting luxury transformation tourism experiences through five integrated products: Marketing Website, Booking Platform, Mobile App, Partner Portal, and Payment Systems.

**Architecture Philosophy:**
- **Scalability First:** Design for 10x growth (12 guests Year 1 → 100+ guests Year 3)
- **Luxury Performance:** Sub-2-second load times, 99.9% uptime
- **55+ Friendly:** Simple, reliable, accessible
- **Cost Efficiency:** Serverless-first, pay-as-you-grow model
- **Security & Compliance:** PCI-DSS, GDPR, medical data protection

**Tech Stack Overview:**
- Frontend: Next.js 14, React Native (Expo)
- Backend: Node.js serverless (Next.js API routes, tRPC)
- Database: PostgreSQL (Supabase)
- Payments: Stripe
- Hosting: Vercel (web), Expo (mobile)
- Storage: AWS S3

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Architecture](#database-architecture)
5. [API Design](#api-design)
6. [Mobile Architecture](#mobile-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Payment Architecture](#payment-architecture)
9. [File Storage & Media](#file-storage--media)
10. [Real-Time Communication](#real-time-communication)
11. [Third-Party Integrations](#third-party-integrations)
12. [Infrastructure & DevOps](#infrastructure--devops)
13. [Security Architecture](#security-architecture)
14. [Monitoring & Observability](#monitoring--observability)
15. [Scalability Strategy](#scalability-strategy)
16. [Disaster Recovery](#disaster-recovery)
17. [Development Workflow](#development-workflow)
18. [Cost Analysis](#cost-analysis)

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Marketing Site  │  │ Booking Platform │  │  Partner Portal  │  │
│  │   (Next.js SSG)  │  │  (Next.js SSR)   │  │  (Next.js SSR)   │  │
│  │                  │  │                  │  │                  │  │
│  │  • Homepage      │  │  • Configurator  │  │  • Dashboard     │  │
│  │  • Packages      │  │  • Payment       │  │  • Referrals     │  │
│  │  • Testimonials  │  │  • Account       │  │  • Points        │  │
│  │  • Application   │  │  • Member Portal │  │  • Materials     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Mobile App (React Native/Expo)                   │  │
│  │  • Pre-trip • Itinerary • Concierge • Photos • Alumni        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            EDGE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Vercel Edge Network (Global CDN)                                   │
│  • Static assets caching                                             │
│  • Image optimization                                                │
│  • SSL/TLS termination                                               │
│  • DDoS protection (Cloudflare)                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │          Next.js API Routes (Serverless Functions)         │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │    │
│  │  │   tRPC API   │  │  REST API    │  │  Webhooks    │     │    │
│  │  │ (Type-safe)  │  │  (Mobile)    │  │ (Stripe, etc)│     │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                   Business Logic Layer                      │    │
│  │                                                              │    │
│  │  • BookingService      • ReferralService                    │    │
│  │  • PaymentService      • CommunicationService               │    │
│  │  • UserService         • ContentService                     │    │
│  │  • ItineraryService    • AnalyticsService                   │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         PostgreSQL Database (Supabase)                      │    │
│  │                                                              │    │
│  │  Core Tables:                                                │    │
│  │  • users, guest_profiles, partner_profiles                  │    │
│  │  • bookings, booking_addons, trips                          │    │
│  │  • payments, referrals, referral_events                     │    │
│  │  • points_transactions, testimonials                        │    │
│  │  • itinerary_activities, messages                           │    │
│  │                                                              │    │
│  │  Features:                                                   │    │
│  │  • Row-Level Security (RLS)                                 │    │
│  │  • Connection pooling (PgBouncer)                           │    │
│  │  • Read replicas (Phase 2)                                  │    │
│  │  • Automated backups (daily)                                │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Redis Cache (Upstash)                          │    │
│  │  • Session storage                                           │    │
│  │  • Real-time data (itinerary updates)                       │    │
│  │  • Rate limiting                                             │    │
│  │  • Background job queues (BullMQ)                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │           File Storage (AWS S3)                             │    │
│  │  • User uploads (photos, documents)                         │    │
│  │  • Testimonial videos (high-res)                            │    │
│  │  • Marketing assets                                          │    │
│  │  • Partner materials (PDFs, images)                         │    │
│  │  • Trip photo galleries                                      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Payment:           Communication:        Content:                   │
│  • Stripe           • SendGrid            • Mux (video)             │
│  • Affirm/Klarna    • Twilio (SMS)        • Cloudinary (images)     │
│                     • OneSignal (push)                               │
│                                                                       │
│  Auth & CRM:        Maps & Scheduling:   Analytics:                 │
│  • Clerk/Auth0      • Google Maps API     • Mixpanel                │
│  • HubSpot          • Calendly            • Sentry                  │
│                                           • Vercel Analytics         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

**1. Monorepo Structure**
```
pickleball-passport/
├── apps/
│   ├── web/              # Next.js marketing + booking + portal
│   ├── mobile/           # React Native app (Expo)
│   └── admin/            # Admin dashboard (optional separate app)
├── packages/
│   ├── ui/               # Shared UI components (Shadcn)
│   ├── database/         # Prisma schema, migrations
│   ├── api/              # tRPC routers, business logic
│   ├── services/         # Shared services (payment, email, etc.)
│   └── config/           # Shared config (env, constants)
└── package.json          # Root package (Turborepo/pnpm workspaces)
```

**2. Serverless-First**
- No servers to manage (auto-scaling, zero DevOps overhead)
- Pay-per-use pricing (cost-efficient at small scale)
- Global edge deployment (low latency worldwide)
- Automatic SSL, CDN, DDoS protection

**3. Type Safety End-to-End**
- TypeScript throughout (web, mobile, API)
- tRPC for type-safe API calls (no code generation)
- Prisma for type-safe database queries
- Zod for runtime validation

**4. Mobile-First Responsive Design**
- All web interfaces mobile-optimized
- Native app for trip experience
- Shared component library (web ↔ mobile)

**5. Incremental Adoption**
- Start simple (Phase 1 MVP)
- Add complexity as needed (Phase 2+)
- No premature optimization

---

## Frontend Architecture

### Next.js Web Applications

**Framework:** Next.js 14 (App Router)

**Why Next.js?**
- Server-side rendering (SEO-critical for marketing site)
- Static generation (fast marketing pages)
- API routes (serverless backend)
- Image optimization (automatic, critical for luxury feel)
- Edge runtime (global performance)

**App Structure:**

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Route group: public pages
│   │   ├── page.tsx              # Homepage (SSG)
│   │   ├── packages/
│   │   │   ├── page.tsx          # Package listing (SSG)
│   │   │   └── [slug]/page.tsx   # Package detail (SSG)
│   │   ├── testimonials/page.tsx # Testimonials (SSR, dynamic)
│   │   ├── apply/page.tsx        # Application form
│   │   └── partners/page.tsx     # Partner program
│   │
│   ├── (platform)/               # Route group: authenticated
│   │   ├── booking/
│   │   │   ├── configure/page.tsx # Package configurator
│   │   │   ├── review/page.tsx    # Itinerary review
│   │   │   └── payment/page.tsx   # Payment
│   │   ├── dashboard/page.tsx     # Guest dashboard
│   │   └── portal/                # Member portal
│   │
│   ├── (partners)/               # Route group: partner portal
│   │   ├── dashboard/page.tsx
│   │   ├── referrals/page.tsx
│   │   ├── points/page.tsx
│   │   └── materials/page.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── trpc/[trpc]/route.ts  # tRPC handler
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── calendly/route.ts
│   │   └── upload/route.ts       # File upload endpoint
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles (Tailwind)
│
├── components/                   # React components
│   ├── marketing/                # Marketing site components
│   │   ├── Hero.tsx
│   │   ├── PackageCard.tsx
│   │   ├── TestimonialVideo.tsx
│   │   └── ApplicationForm.tsx
│   ├── booking/                  # Booking flow components
│   │   ├── Configurator.tsx
│   │   ├── PricingSummary.tsx
│   │   └── PaymentForm.tsx
│   ├── partners/                 # Partner portal components
│   │   ├── DashboardMetrics.tsx
│   │   ├── ReferralTable.tsx
│   │   └── PointsBalance.tsx
│   └── ui/                       # Shared UI (from packages/ui)
│
├── lib/                          # Utilities
│   ├── trpc.ts                   # tRPC client setup
│   ├── auth.ts                   # Auth helpers (Clerk)
│   ├── stripe.ts                 # Stripe client
│   └── utils.ts                  # Shared utilities
│
└── public/                       # Static assets
    ├── images/
    ├── videos/
    └── fonts/
```

**Rendering Strategies:**

| Page Type | Strategy | Reasoning |
|-----------|----------|-----------|
| Homepage | SSG (Static) | SEO-critical, rarely changes |
| Package pages | SSG | SEO-critical, content-driven |
| Testimonials | SSR (Server) | Dynamic content, personalization |
| Application form | CSR (Client) | Interactive, form-heavy |
| Configurator | CSR | Highly interactive, real-time pricing |
| Dashboard | SSR | Personalized, auth-required |
| Partner portal | SSR | Personalized, auth-required |

**Component Architecture:**

```typescript
// Example: PackageCard component with TypeScript

import { type Package } from '@prisma/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface PackageCardProps {
  package: Package
  onSelect: (packageId: string) => void
}

export function PackageCard({ package: pkg, onSelect }: PackageCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <img
          src={pkg.heroImage}
          alt={pkg.name}
          className="aspect-video object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl font-serif mb-2">{pkg.name}</h3>
        <p className="text-gray-600 mb-4">{pkg.description}</p>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Starting at</span>
            <p className="text-3xl font-bold text-ocean-blue">
              {formatCurrency(pkg.basePrice)}
            </p>
          </div>

          <Button
            onClick={() => onSelect(pkg.id)}
            className="bg-gold hover:bg-gold-dark"
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### State Management Strategy

**Local State:** React `useState`, `useReducer`
- Form inputs, UI toggles, component-specific state

**Server State:** tRPC + React Query
- API data fetching, caching, mutations
- Automatic cache invalidation
- Optimistic updates

**Global State:** Zustand (minimal usage)
- Auth user context
- Shopping cart (package configuration in progress)
- UI preferences (theme, language)

**URL State:** Next.js router `searchParams`
- Filters, pagination
- Shareable links

**Example: Package Configurator State**

```typescript
// packages/api/src/stores/configuratorStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ConfiguratorState {
  selectedPackage: string | null
  duration: 7 | 10 | 14 | 21
  accommodationTier: 'luxury' | 'ultra_luxury' | 'villa'
  addons: Array<{ id: string; name: string; price: number }>
  totalPrice: number

  setPackage: (packageId: string) => void
  setDuration: (days: number) => void
  setAccommodation: (tier: string) => void
  addAddon: (addon: { id: string; name: string; price: number }) => void
  removeAddon: (addonId: string) => void
  calculateTotal: () => void
  reset: () => void
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      selectedPackage: null,
      duration: 14,
      accommodationTier: 'luxury',
      addons: [],
      totalPrice: 0,

      setPackage: (packageId) => set({ selectedPackage: packageId }),
      setDuration: (days) => set({ duration: days as 7 | 10 | 14 | 21 }),
      setAccommodation: (tier) => set({ accommodationTier: tier as any }),

      addAddon: (addon) => set((state) => ({
        addons: [...state.addons, addon]
      })),

      removeAddon: (addonId) => set((state) => ({
        addons: state.addons.filter(a => a.id !== addonId)
      })),

      calculateTotal: () => {
        const state = get()
        const addonsTotal = state.addons.reduce((sum, a) => sum + a.price, 0)
        // Fetch base price, apply duration multiplier, add addons
        // Simplified example:
        set({ totalPrice: 15000 + addonsTotal })
      },

      reset: () => set({
        selectedPackage: null,
        duration: 14,
        accommodationTier: 'luxury',
        addons: [],
        totalPrice: 0
      })
    }),
    {
      name: 'configurator-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist these fields
        selectedPackage: state.selectedPackage,
        addons: state.addons
      })
    }
  )
)
```

### Styling Architecture

**Framework:** Tailwind CSS + Shadcn UI

**Design Tokens:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          blue: '#003D5C',
          light: '#006B9C',
          dark: '#002840',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0D785',
          dark: '#9D7F1C',
        },
        coral: '#FF6B6B',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

**Component Library:**

```typescript
// packages/ui/src/button.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ocean-blue text-white hover:bg-ocean-dark',
        luxury: 'bg-gold text-ocean-blue hover:bg-gold-dark',
        outline: 'border-2 border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

---

## Backend Architecture

### API Layer: tRPC + Next.js API Routes

**Why tRPC?**
- End-to-end type safety (no API contracts to maintain)
- Auto-completion in IDE
- Eliminate API documentation needs (types ARE the docs)
- Smaller bundle size vs GraphQL

**tRPC Router Structure:**

```typescript
// packages/api/src/root.ts
import { router } from './trpc'
import { bookingRouter } from './routers/booking'
import { paymentRouter } from './routers/payment'
import { referralRouter } from './routers/referral'
import { userRouter } from './routers/user'
import { partnerRouter } from './routers/partner'
import { itineraryRouter } from './routers/itinerary'
import { testimonialRouter } from './routers/testimonial'

export const appRouter = router({
  booking: bookingRouter,
  payment: paymentRouter,
  referral: referralRouter,
  user: userRouter,
  partner: partnerRouter,
  itinerary: itineraryRouter,
  testimonial: testimonialRouter,
})

export type AppRouter = typeof appRouter
```

**Example Router: Booking**

```typescript
// packages/api/src/routers/booking.ts
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const bookingRouter = router({
  // Get all available trips
  getTrips: publicProcedure
    .input(z.object({
      status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed']).optional()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.trip.findMany({
        where: input.status ? { status: input.status } : {},
        orderBy: { startDate: 'asc' },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      })
    }),

  // Create new booking (authenticated guests only)
  createBooking: protectedProcedure
    .input(z.object({
      tripId: z.string().uuid(),
      packageType: z.enum(['pure_play', 'smile_makeover', 'total_refresh', 'soul_sport', 'health_reset']),
      duration: z.number().int().min(7).max(21),
      accommodationTier: z.enum(['luxury', 'ultra_luxury', 'villa']),
      addons: z.array(z.object({
        addonType: z.string(),
        addonName: z.string(),
        price: z.number()
      })),
      totalPrice: z.number().positive(),
      paymentPlan: z.enum(['full', 'installment_4', 'financing']),
      referredBy: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check trip capacity
      const trip = await ctx.prisma.trip.findUnique({
        where: { id: input.tripId },
        include: { _count: { select: { bookings: true } } }
      })

      if (!trip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' })
      }

      if (trip._count.bookings >= trip.capacity) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Trip is fully booked' })
      }

      // Create booking with addons
      const booking = await ctx.prisma.booking.create({
        data: {
          guestId: ctx.user.id,
          tripId: input.tripId,
          packageType: input.packageType,
          durationDays: input.duration,
          accommodationTier: input.accommodationTier,
          totalPrice: input.totalPrice,
          paymentPlan: input.paymentPlan,
          status: 'pending',
          referredBy: input.referredBy,
          addons: {
            create: input.addons
          }
        },
        include: {
          trip: true,
          addons: true
        }
      })

      // Award referral points if applicable
      if (input.referredBy) {
        await ctx.prisma.pointsTransaction.create({
          data: {
            partnerId: input.referredBy,
            transactionType: 'earned',
            points: 1000, // Base booking points
            description: `Booking by guest ${ctx.user.email}`,
            relatedBookingId: booking.id
          }
        })
      }

      return booking
    }),

  // Get guest's bookings
  getMyBookings: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.booking.findMany({
        where: { guestId: ctx.user.id },
        include: {
          trip: true,
          addons: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // Cancel booking
  cancelBooking: protectedProcedure
    .input(z.object({
      bookingId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { trip: true }
      })

      if (!booking || booking.guestId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Calculate refund based on policy
      const daysUntilTrip = Math.floor(
        (new Date(booking.trip.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      let refundPercentage = 0
      if (daysUntilTrip > 60) {
        refundPercentage = 1.0 // 100% refund minus $500 fee
      } else if (daysUntilTrip > 30) {
        refundPercentage = 0.5 // 50% refund
      } // else 0% (non-refundable)

      // Update booking status
      await ctx.prisma.booking.update({
        where: { id: input.bookingId },
        data: { status: 'cancelled' }
      })

      // Process refund (handled by payment service)
      // ... refund logic

      return {
        refundAmount: booking.totalPrice * refundPercentage - 500,
        refundPercentage
      }
    }),
})
```

### Service Layer (Business Logic)

**Service Structure:**

```typescript
// packages/services/src/payment/PaymentService.ts
import Stripe from 'stripe'
import { type PrismaClient } from '@prisma/client'

export class PaymentService {
  private stripe: Stripe
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia'
    })
    this.prisma = prisma
  }

  // Create payment intent for booking
  async createPaymentIntent(bookingId: string, amount: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { guest: true }
    })

    if (!booking) throw new Error('Booking not found')

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: booking.guest.stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        guestEmail: booking.guest.email
      },
      automatic_payment_methods: { enabled: true }
    })

    // Record payment in database
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: amount,
        status: 'pending',
        paymentMethod: 'card',
        stripePaymentIntentId: paymentIntent.id
      }
    })

    return paymentIntent.client_secret
  }

  // Handle webhook events from Stripe
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge)
        break
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    })

    if (!payment) return

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        processedAt: new Date()
      }
    })

    // Update booking status if fully paid
    const booking = await this.prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { payments: true }
    })

    if (!booking) return

    const totalPaid = booking.payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0)

    if (totalPaid >= booking.totalPrice) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'confirmed' }
      })

      // Send confirmation email
      // ... email service call
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    })

    if (!payment) return

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' }
    })

    // Send payment failure notification
    // ... notification service call
  }

  private async handleRefund(charge: Stripe.Charge) {
    // ... refund handling logic
  }

  // Schedule installment payments
  async scheduleInstallments(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true }
    })

    if (!booking || booking.paymentPlan !== 'installment_4') return

    const installmentAmounts = [
      booking.totalPrice * 0.50, // 50% deposit
      booking.totalPrice * 0.25, // 25% at 60 days
      booking.totalPrice * 0.15, // 15% at 30 days
      booking.totalPrice * 0.10  // 10% at 7 days
    ]

    const tripDate = new Date(booking.trip.startDate)
    const scheduleDates = [
      new Date(), // Immediate (deposit)
      new Date(tripDate.getTime() - 60 * 24 * 60 * 60 * 1000),
      new Date(tripDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      new Date(tripDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    ]

    for (let i = 0; i < 4; i++) {
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: installmentAmounts[i],
          status: 'pending',
          paymentMethod: 'card',
          installmentNumber: i + 1,
          scheduledDate: scheduleDates[i]
        }
      })
    }
  }
}
```

**Other Key Services:**

1. **ReferralService** - Track clicks, attributions, award points
2. **CommunicationService** - Email, SMS, push notifications
3. **ItineraryService** - Generate personalized itineraries
4. **ContentService** - Manage testimonials, photos, videos
5. **AnalyticsService** - Track events, generate reports

---

## Database Architecture

### Schema Design (Prisma)

**Full Schema:**

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  phone     String?
  role      UserRole @default(GUEST)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  guestProfile   GuestProfile?
  partnerProfile PartnerProfile?
  bookings       Booking[]      @relation("GuestBookings")
  sentMessages   Message[]      @relation("SentMessages")
  receivedMessages Message[]    @relation("ReceivedMessages")

  // Stripe
  stripeCustomerId String? @unique

  @@index([email])
  @@map("users")
}

enum UserRole {
  GUEST
  PARTNER
  ADMIN
}

model GuestProfile {
  userId                String   @id
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  age                   Int?
  location              String?
  pickleballSkill       PickleballSkill?
  pickleballFrequency   String?
  transformationInterests Json?   // Array of interests
  dietaryRestrictions   String[]
  emergencyContact      Json?    // {name, phone, relation}

  @@map("guest_profiles")
}

enum PickleballSkill {
  RECREATIONAL
  INTERMEDIATE
  ADVANCED
}

model PartnerProfile {
  userId         String   @id
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  clubName       String
  clubLocation   String
  jobTitle       String
  referralCode   String   @unique
  pointsBalance  Int      @default(0)
  tier           PartnerTier @default(BRONZE)
  recruitedById  String?
  recruitedBy    User?    @relation("PartnerRecruiter", fields: [recruitedById], references: [id])

  // Relations
  referrals      Referral[]
  pointsTransactions PointsTransaction[]
  recruitedPartners  PartnerProfile[] @relation("PartnerRecruiter")

  @@index([referralCode])
  @@map("partner_profiles")
}

enum PartnerTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

// ============================================
// BOOKINGS & TRIPS
// ============================================

model Trip {
  id              String   @id @default(uuid())
  name            String
  destination     String
  startDate       DateTime
  endDate         DateTime
  capacity        Int      @default(12)
  currentBookings Int      @default(0)
  status          TripStatus @default(SCHEDULED)

  // Relations
  bookings        Booking[]
  itineraryActivities ItineraryActivity[]

  @@index([startDate])
  @@map("trips")
}

enum TripStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
}

model Booking {
  id                 String   @id @default(uuid())
  guestId            String
  guest              User     @relation("GuestBookings", fields: [guestId], references: [id])
  tripId             String
  trip               Trip     @relation(fields: [tripId], references: [id])

  packageType        PackageType
  durationDays       Int
  accommodationTier  AccommodationTier
  totalPrice         Decimal  @db.Decimal(10, 2)
  paymentPlan        PaymentPlan
  status             BookingStatus @default(PENDING)

  referredBy         String?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  addons             BookingAddon[]
  payments           Payment[]

  @@index([guestId])
  @@index([tripId])
  @@index([status])
  @@map("bookings")
}

enum PackageType {
  PURE_PLAY
  SMILE_MAKEOVER
  TOTAL_REFRESH
  SOUL_SPORT
  HEALTH_RESET
}

enum AccommodationTier {
  LUXURY
  ULTRA_LUXURY
  VILLA
}

enum PaymentPlan {
  FULL
  INSTALLMENT_4
  FINANCING
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model BookingAddon {
  id          String   @id @default(uuid())
  bookingId   String
  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  addonType   String   // 'medical', 'wellness', 'pickleball', 'cultural'
  addonName   String
  price       Decimal  @db.Decimal(10, 2)

  @@index([bookingId])
  @@map("booking_addons")
}

// ============================================
// PAYMENTS
// ============================================

model Payment {
  id                    String   @id @default(uuid())
  bookingId             String
  booking               Booking  @relation(fields: [bookingId], references: [id])

  amount                Decimal  @db.Decimal(10, 2)
  status                PaymentStatus @default(PENDING)
  paymentMethod         String   // 'card', 'ach', 'financing'
  stripePaymentIntentId String?  @unique
  installmentNumber     Int?     // 1-4 for installment plans
  scheduledDate         DateTime?
  processedAt           DateTime?

  createdAt             DateTime @default(now())

  @@index([bookingId])
  @@index([status])
  @@index([scheduledDate])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// ============================================
// REFERRALS & POINTS
// ============================================

model Referral {
  id           String   @id @default(uuid())
  partnerId    String
  partner      PartnerProfile @relation(fields: [partnerId], references: [userId])

  referralLink String   @unique
  clicks       Int      @default(0)
  applications Int      @default(0)
  bookings     Int      @default(0)

  createdAt    DateTime @default(now())

  // Relations
  events       ReferralEvent[]

  @@index([partnerId])
  @@map("referrals")
}

model ReferralEvent {
  id          String   @id @default(uuid())
  referralId  String
  referral    Referral @relation(fields: [referralId], references: [id])

  eventType   ReferralEventType
  guestId     String?
  pointsAwarded Int    @default(0)

  createdAt   DateTime @default(now())

  @@index([referralId])
  @@index([eventType])
  @@map("referral_events")
}

enum ReferralEventType {
  CLICK
  APPLICATION
  BOOKING
  COMPLETION
}

model PointsTransaction {
  id                String   @id @default(uuid())
  partnerId         String
  partner           PartnerProfile @relation(fields: [partnerId], references: [userId])

  transactionType   PointsTransactionType
  points            Int
  description       String
  relatedBookingId  String?

  createdAt         DateTime @default(now())

  @@index([partnerId])
  @@index([createdAt])
  @@map("points_transactions")
}

enum PointsTransactionType {
  EARNED
  REDEEMED
  EXPIRED
}

// ============================================
// CONTENT & MEDIA
// ============================================

model Testimonial {
  id          String   @id @default(uuid())
  guestId     String
  bookingId   String

  type        TestimonialType
  content     String?  @db.Text
  mediaUrl    String?  // S3 URL
  status      TestimonialStatus @default(DRAFT)
  consentGiven Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@map("testimonials")
}

enum TestimonialType {
  VIDEO
  WRITTEN
  PHOTO
}

enum TestimonialStatus {
  DRAFT
  APPROVED
  PUBLISHED
}

// ============================================
// ITINERARY & ACTIVITIES
// ============================================

model ItineraryActivity {
  id              String   @id @default(uuid())
  tripId          String
  trip            Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)

  dayNumber       Int
  time            String   // "09:00"
  activityName    String
  description     String   @db.Text
  location        Json     // {address, lat, lng}
  durationMinutes Int
  category        ActivityCategory

  @@index([tripId])
  @@map("itinerary_activities")
}

enum ActivityCategory {
  PICKLEBALL
  MEDICAL
  WELLNESS
  CULTURAL
  DINING
  FREE_TIME
}

// ============================================
// COMMUNICATION
// ============================================

model Message {
  id          String   @id @default(uuid())
  senderId    String
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  recipientId String?  // Null = broadcast
  recipient   User?    @relation("ReceivedMessages", fields: [recipientId], references: [id])
  tripId      String?

  content     String   @db.Text
  mediaUrls   String[] // S3 URLs
  readAt      DateTime?

  createdAt   DateTime @default(now())

  @@index([senderId])
  @@index([recipientId])
  @@index([tripId])
  @@map("messages")
}
```

### Database Migrations Strategy

**Migration Workflow:**

1. **Development:**
   ```bash
   # Create migration
   pnpm prisma migrate dev --name add_alumni_features

   # Generates migration SQL file in prisma/migrations/
   ```

2. **Staging:**
   ```bash
   # Apply migrations
   pnpm prisma migrate deploy
   ```

3. **Production:**
   ```bash
   # Apply migrations (zero-downtime via Supabase)
   pnpm prisma migrate deploy
   ```

**Seed Data:**

```typescript
// packages/database/prisma/seed.ts
import { PrismaClient, PackageType, TripStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed trips
  const trip1 = await prisma.trip.create({
    data: {
      name: 'Thailand Transformation - March 2026',
      destination: 'Bangkok & Phuket',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-29'),
      capacity: 12,
      status: TripStatus.SCHEDULED
    }
  })

  // Seed sample itinerary
  await prisma.itineraryActivity.createMany({
    data: [
      {
        tripId: trip1.id,
        dayNumber: 1,
        time: '14:00',
        activityName: 'VIP Airport Pickup',
        description: 'Chauffeur-driven transfer to Four Seasons',
        location: JSON.stringify({ address: 'Suvarnabhumi Airport', lat: 13.6900, lng: 100.7501 }),
        durationMinutes: 60,
        category: 'FREE_TIME'
      },
      {
        tripId: trip1.id,
        dayNumber: 1,
        time: '19:00',
        activityName: 'Welcome Dinner',
        description: 'Meet your fellow travelers',
        location: JSON.stringify({ address: 'Four Seasons Bangkok', lat: 13.7563, lng: 100.5018 }),
        durationMinutes: 120,
        category: 'DINING'
      },
      // ... more activities
    ]
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Query Optimization

**Indexes Strategy:**

```sql
-- Critical queries to optimize:

-- 1. Guest dashboard: Get my bookings
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 2. Partner dashboard: Get my referrals
CREATE INDEX idx_referrals_partner_id ON referrals(partner_id);
CREATE INDEX idx_referral_events_referral_id ON referral_events(referral_id);

-- 3. Trip availability: Find open trips
CREATE INDEX idx_trips_start_date ON trips(start_date);
CREATE INDEX idx_trips_status ON trips(status);

-- 4. Payment tracking: Scheduled installments
CREATE INDEX idx_payments_scheduled_date ON payments(scheduled_date WHERE status = 'PENDING');

-- 5. User lookup (auth)
CREATE INDEX idx_users_email ON users(email);
```

**N+1 Query Prevention:**

```typescript
// ❌ BAD: N+1 query
const bookings = await prisma.booking.findMany()
for (const booking of bookings) {
  const trip = await prisma.trip.findUnique({ where: { id: booking.tripId } })
  const addons = await prisma.bookingAddon.findMany({ where: { bookingId: booking.id } })
}

// ✅ GOOD: Single query with includes
const bookings = await prisma.booking.findMany({
  include: {
    trip: true,
    addons: true,
    payments: true
  }
})
```

---

## API Design

### REST API Endpoints (For Mobile App)

While tRPC is used for web, mobile apps may benefit from REST endpoints for simpler integration:

```typescript
// apps/web/app/api/mobile/trips/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trips = await prisma.trip.findMany({
      where: {
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**API Versioning:**

```
/api/v1/trips       # Version 1 (current)
/api/v2/trips       # Future version (when breaking changes needed)
```

### Webhook Endpoints

**Stripe Webhook:**

```typescript
// apps/web/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { PaymentService } from '@/services/payment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const paymentService = new PaymentService(prisma)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  await paymentService.handleWebhookEvent(event)

  return NextResponse.json({ received: true })
}
```

---

## Mobile Architecture

### React Native (Expo) Structure

```
apps/mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/             # Bottom tabs navigation
│   │   ├── index.tsx       # Pre-trip dashboard
│   │   ├── itinerary.tsx   # Daily itinerary
│   │   ├── concierge.tsx   # Chat
│   │   └── profile.tsx     # User profile
│   ├── booking/
│   │   └── [id].tsx        # Booking details
│   └── _layout.tsx         # Root layout
│
├── components/
│   ├── itinerary/
│   │   ├── ActivityCard.tsx
│   │   ├── DayView.tsx
│   │   └── CheckInButton.tsx
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── SOSButton.tsx
│   └── ui/                 # Shared UI (from packages/ui)
│
├── hooks/
│   ├── useBooking.ts
│   ├── useItinerary.ts
│   └── useChat.ts
│
├── services/
│   ├── api.ts              # API client (tRPC or REST)
│   ├── notifications.ts    # Push notifications
│   └── offline.ts          # Offline storage
│
└── app.json                # Expo config
```

**Expo Router Example:**

```typescript
// apps/mobile/app/(tabs)/itinerary.tsx
import { View, ScrollView, RefreshControl } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { trpc } from '@/services/api'
import { ActivityCard } from '@/components/itinerary/ActivityCard'
import { format } from 'date-fns'

export default function ItineraryScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()

  const { data: booking, refetch, isRefetching } = trpc.booking.getById.useQuery({
    bookingId
  })

  const { data: activities } = trpc.itinerary.getActivitiesByTrip.useQuery({
    tripId: booking?.tripId ?? ''
  }, {
    enabled: !!booking?.tripId
  })

  const todayActivities = activities?.filter(
    (a) => a.dayNumber === getCurrentDayNumber(booking?.trip.startDate)
  )

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">
          Today - Day {getCurrentDayNumber(booking?.trip.startDate)}
        </Text>

        {todayActivities?.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onCheckIn={() => handleCheckIn(activity.id)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

function getCurrentDayNumber(startDate?: Date) {
  if (!startDate) return 1
  const diff = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}
```

### Offline Support (React Query + AsyncStorage)

```typescript
// apps/mobile/services/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

// Usage in app
export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {/* App content */}
    </PersistQueryClientProvider>
  )
}
```

### Push Notifications (OneSignal)

```typescript
// apps/mobile/services/notifications.ts
import OneSignal from 'react-native-onesignal'

export function initializePushNotifications(userId: string) {
  OneSignal.setAppId(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID!)

  // Set external user ID (for targeting)
  OneSignal.setExternalUserId(userId)

  // Handle notification received
  OneSignal.setNotificationWillShowInForegroundHandler((notification) => {
    console.log('Notification received:', notification)
    // Show in-app notification
  })

  // Handle notification opened
  OneSignal.setNotificationOpenedHandler((openedEvent) => {
    const { action, notification } = openedEvent
    const data = notification.additionalData

    // Navigate based on notification type
    if (data?.type === 'itinerary_update') {
      router.push('/itinerary')
    } else if (data?.type === 'concierge_message') {
      router.push('/concierge')
    }
  })
}
```

---

## Authentication & Authorization

### Authentication Strategy (Clerk)

**Why Clerk?**
- Drop-in UI components (sign-in, sign-up)
- Social auth (Google, Apple)
- Magic links (email)
- Session management
- Webhook support
- Affordable ($25/month for 5K users)

**Alternative: Auth0** (if more enterprise features needed)

**Setup:**

```typescript
// apps/web/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Protected Routes:**

```typescript
// apps/web/middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/packages', '/packages/(.*)', '/testimonials', '/apply', '/partners'],
  ignoredRoutes: ['/api/webhooks/(.*)']
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

**tRPC Context with Auth:**

```typescript
// packages/api/src/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts
  const auth = getAuth(req)

  let user = null
  if (auth.userId) {
    user = await prisma.user.findUnique({
      where: { id: auth.userId }
    })
  }

  return {
    user,
    prisma,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user, // Now guaranteed to be non-null
    },
  })
})
```

### Authorization (Role-Based Access Control)

**Middleware for Partner-Only Routes:**

```typescript
// packages/api/src/middleware/partner.ts
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../trpc'

export const partnerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'PARTNER' && ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Partner access required' })
  }
  return next()
})
```

**Row-Level Security (Database):**

```typescript
// Prisma middleware for RLS
prisma.$use(async (params, next) => {
  if (params.model === 'Booking') {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      // Ensure guests can only see their own bookings
      params.args.where = {
        ...params.args.where,
        guestId: ctx.user.id // From context
      }
    }
  }
  return next(params)
})
```

---

## Payment Architecture

### Stripe Integration

**Payment Flow Sequence:**

```
1. Guest completes booking configuration
   ↓
2. Frontend calls: trpc.payment.createPaymentIntent.mutate()
   ↓
3. Backend creates Stripe PaymentIntent
   ↓
4. Returns client_secret to frontend
   ↓
5. Frontend loads Stripe Elements (credit card form)
   ↓
6. Guest submits payment
   ↓
7. Stripe processes payment
   ↓
8. Stripe sends webhook: payment_intent.succeeded
   ↓
9. Backend updates payment & booking status
   ↓
10. Send confirmation email to guest
```

**Stripe Elements (Credit Card Form):**

```typescript
// apps/web/components/booking/PaymentForm.tsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { trpc } from '@/lib/trpc'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const { data: clientSecret } = trpc.payment.createPaymentIntent.useQuery({
    bookingId,
    amount
  })

  if (!clientSecret) return <div>Loading...</div>

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm bookingId={bookingId} />
    </Elements>
  )
}

function CheckoutForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation?id=${bookingId}`,
      },
    })

    if (error) {
      // Show error message
      console.error(error.message)
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}
```

### Installment Plan Automation (Scheduled Charges)

**Background Job (BullMQ + Redis):**

```typescript
// packages/services/src/jobs/processScheduledPayments.ts
import { Queue, Worker } from 'bullmq'
import { PaymentService } from '../payment/PaymentService'

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}

export const scheduledPaymentsQueue = new Queue('scheduled-payments', { connection })

// Add job to queue (runs daily)
export async function schedulePaymentProcessing() {
  await scheduledPaymentsQueue.add(
    'process-scheduled-payments',
    {},
    {
      repeat: {
        pattern: '0 9 * * *', // Every day at 9 AM
      },
    }
  )
}

// Worker to process jobs
const worker = new Worker(
  'scheduled-payments',
  async (job) => {
    const paymentService = new PaymentService(prisma)

    // Find payments due today
    const duePayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        scheduledDate: {
          lte: new Date()
        }
      },
      include: {
        booking: {
          include: { guest: true }
        }
      }
    })

    for (const payment of duePayments) {
      try {
        await paymentService.chargeScheduledPayment(payment.id)
      } catch (error) {
        console.error(`Failed to charge payment ${payment.id}:`, error)
        // Send notification to admin + guest
      }
    }
  },
  { connection }
)
```

---

## File Storage & Media

### AWS S3 Architecture

**Bucket Structure:**

```
pickleball-passport-prod/
├── users/
│   ├── {userId}/
│   │   ├── profile.jpg
│   │   └── documents/
│   │       └── passport.pdf
├── trips/
│   ├── {tripId}/
│   │   └── photos/
│   │       ├── day1-001.jpg
│   │       ├── day1-002.jpg
│   │       └── ...
├── testimonials/
│   ├── videos/
│   │   ├── {testimonialId}.mp4
│   │   └── {testimonialId}-thumbnail.jpg
│   └── photos/
│       └── {testimonialId}.jpg
├── marketing/
│   ├── packages/
│   ├── homepage/
│   └── partners/
└── temp/
    └── {uploadId}/ # Deleted after 24 hours
```

**Upload API (Presigned URLs):**

```typescript
// apps/web/app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  const user = await verifyAuthToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fileName, fileType, folder } = await request.json()

  const key = `${folder}/${user.id}/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }) // 5 minutes

  return NextResponse.json({
    uploadUrl,
    key,
    publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  })
}
```

**Frontend Upload:**

```typescript
// components/common/FileUpload.tsx
async function uploadFile(file: File, folder: string) {
  // 1. Get presigned URL
  const { uploadUrl, publicUrl } = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder
    })
  }).then(res => res.json())

  // 2. Upload directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  // 3. Return public URL
  return publicUrl
}
```

### Video Hosting (Mux)

**Why Mux?**
- Automatic transcoding (multiple quality levels)
- Adaptive bitrate streaming (smooth playback)
- Thumbnails auto-generated
- Analytics built-in
- Affordable ($0.005/minute streamed)

**Upload to Mux:**

```typescript
// packages/services/src/content/VideoService.ts
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function uploadVideoToMux(s3Url: string) {
  const asset = await mux.video.assets.create({
    input: s3Url,
    playback_policy: ['public'],
    mp4_support: 'standard',
  })

  return {
    assetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id,
    thumbnailUrl: `https://image.mux.com/${asset.playback_ids?.[0]?.id}/thumbnail.jpg`
  }
}
```

---

## Real-Time Communication

### Chat System Architecture

**Option 1: Supabase Realtime (Recommended for MVP)**

```typescript
// packages/services/src/chat/ChatService.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export function subscribeToChatMessages(tripId: string, callback: (message: Message) => void) {
  const channel = supabase
    .channel(`trip:${tripId}:messages`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `tripId=eq.${tripId}`
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

**Option 2: Pusher (If more advanced features needed)**

```typescript
// Alternative: Pusher for real-time
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
})

export async function sendChatMessage(tripId: string, message: Message) {
  await pusher.trigger(`trip-${tripId}`, 'new-message', message)
}
```

---

## Third-Party Integrations

### Integration Summary

| Service | Purpose | Monthly Cost | Integration Effort |
|---------|---------|--------------|-------------------|
| **Clerk** | Authentication | $25 (5K users) | Low (drop-in) |
| **Stripe** | Payments | 2.9% + $0.30/txn | Medium |
| **Supabase** | Database + Realtime | $25 (Pro plan) | Low |
| **AWS S3** | File storage | ~$10 (100GB) | Medium |
| **SendGrid** | Email (transactional) | $15 (40K emails) | Low |
| **Twilio** | SMS notifications | Pay-per-use (~$50) | Low |
| **OneSignal** | Push notifications | Free (< 10K users) | Medium |
| **Mux** | Video hosting | Pay-per-use (~$50) | Medium |
| **Google Maps API** | Maps, directions | Pay-per-use (~$20) | Low |
| **HubSpot** | CRM | $20 (Starter) | Medium |
| **Mixpanel** | Analytics | Free (20M events) | Low |
| **Sentry** | Error tracking | Free (5K errors) | Low |
| **Vercel** | Hosting (web) | $20 (Pro) | None (platform) |

**Total Estimated Monthly Cost (Year 1):** ~$300-400/month

---

## Infrastructure & DevOps

### Hosting Strategy

**Web Applications (Vercel):**
- Automatic deployments from Git
- Edge network (global CDN)
- Serverless functions (auto-scaling)
- Preview deployments (per PR)
- Zero-config SSL
- Built-in analytics

**Mobile App (Expo EAS):**
- Build service (iOS + Android)
- Over-the-air updates (no app store approval for code changes)
- Crash reporting
- $99/month (unlimited builds)

**Database (Supabase):**
- Managed PostgreSQL
- Automatic backups (daily)
- Connection pooling
- Read replicas (Phase 2+)
- $25/month (Pro plan)

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm type-check

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test

      - name: Run Prisma migrations (dry run)
        run: pnpm prisma migrate diff --exit-code

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-mobile:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Publish update
        run: |
          cd apps/mobile
          expo publish --release-channel production
```

### Environment Management

**Environment Variables:**

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_POOLED="postgresql://..." # For serverless (PgBouncer)

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="pickleball-passport-prod"

# Email (SendGrid)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="hello@pickleballpassport.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Push Notifications (OneSignal)
EXPO_PUBLIC_ONESIGNAL_APP_ID="..."
ONESIGNAL_API_KEY="..."

# Video (Mux)
MUX_TOKEN_ID="..."
MUX_TOKEN_SECRET="..."

# CRM (HubSpot)
HUBSPOT_API_KEY="..."

# Analytics (Mixpanel)
NEXT_PUBLIC_MIXPANEL_TOKEN="..."

# Error Tracking (Sentry)
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# Maps (Google)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
```

**Environment-Specific Configs:**

```typescript
// packages/config/src/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  // ... all other env vars
})

export const env = envSchema.parse(process.env)
```

---

## Security Architecture

### Security Checklist

**Application Security:**
- ✅ Input validation (Zod schemas on all API inputs)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS protection (React auto-escaping, CSP headers)
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting (per IP, per user)
- ✅ Authentication (JWT tokens, secure sessions)
- ✅ Authorization (RBAC, RLS)

**Data Security:**
- ✅ Encryption at rest (database, S3)
- ✅ Encryption in transit (TLS 1.3)
- ✅ PII redaction in logs
- ✅ Secure secret management (Vercel environment variables)
- ✅ Data retention policies (GDPR compliance)
- ✅ Backup encryption

**Payment Security:**
- ✅ PCI-DSS Level 1 (Stripe handles)
- ✅ No card data stored locally
- ✅ 3D Secure authentication
- ✅ Fraud detection (Stripe Radar)

### Rate Limiting

```typescript
// packages/api/src/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function rateLimitMiddleware(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`
    })
  }

  return { limit, remaining }
}
```

### Content Security Policy

```typescript
// apps/web/next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  media-src 'self' https://stream.mux.com;
  connect-src 'self' https://*.clerk.accounts.dev https://api.stripe.com https://*.supabase.co;
  font-src 'self' data:;
  frame-src https://js.stripe.com;
`

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  beforeSend(event, hint) {
    // Redact sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }
    return event
  },
})
```

### Product Analytics (Mixpanel)

```typescript
// packages/services/src/analytics/AnalyticsService.ts
import mixpanel from 'mixpanel-browser'

export class AnalyticsService {
  static init() {
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
      track_pageview: true,
      persistence: 'localStorage'
    })
  }

  static trackEvent(eventName: string, properties?: Record<string, any>) {
    mixpanel.track(eventName, properties)
  }

  static identifyUser(userId: string, traits?: Record<string, any>) {
    mixpanel.identify(userId)
    if (traits) {
      mixpanel.people.set(traits)
    }
  }
}

// Usage:
AnalyticsService.trackEvent('Booking Created', {
  package: 'smile_makeover',
  value: 18000,
  paymentPlan: 'installment_4'
})
```

### Performance Monitoring

**Web Vitals Tracking:**

```typescript
// apps/web/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Database Query Monitoring:**

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`Slow query detected (${e.duration}ms):`, e.query)
    // Send to monitoring service (Datadog, etc.)
  }
})
```

---

## Scalability Strategy

### Scaling Phases

**Phase 1: MVP (0-50 users)**
- Serverless functions (auto-scaling)
- Managed database (Supabase)
- Single region (US)
- Cost: ~$300/month

**Phase 2: Growth (50-500 users)**
- Database read replicas
- Background job queues (BullMQ)
- Image optimization (Cloudinary)
- Multi-region CDN
- Cost: ~$1,000/month

**Phase 3: Scale (500-5000 users)**
- Database sharding (if needed)
- Caching layer (Redis)
- Microservices (optional, if complexity requires)
- Global deployments
- Cost: ~$5,000/month

### Caching Strategy

**Edge Caching (Vercel):**
- Static pages: 1 year
- Package pages (SSG): 1 week (revalidate)
- API responses: 5 minutes (stale-while-revalidate)

**Redis Caching:**

```typescript
// packages/services/src/cache/CacheService.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  const cached = await redis.get<T>(key)
  if (cached) return cached

  const fresh = await fetcher()
  await redis.set(key, fresh, { ex: ttl })
  return fresh
}

// Usage:
const trips = await getCached(
  'trips:available',
  () => prisma.trip.findMany({ where: { status: 'SCHEDULED' } }),
  600 // 10 minutes
)
```

---

## Disaster Recovery

### Backup Strategy

**Database Backups (Supabase):**
- Automatic daily backups (retained 7 days on Pro plan)
- Point-in-time recovery (PITR)
- Manual backups before major deployments

**File Storage Backups (S3):**
- S3 versioning enabled (recover deleted files)
- Cross-region replication (optional, for critical data)

**Code Backups:**
- Git (GitHub) - all code versioned
- Docker images (if using containers)

### Incident Response Plan

**Severity Levels:**

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0 - Critical** | Site down, payments failing | < 15 minutes | Database outage |
| **P1 - High** | Major feature broken | < 1 hour | Mobile app crash loop |
| **P2 - Medium** | Minor feature broken | < 4 hours | Image upload failing |
| **P3 - Low** | Cosmetic issues | < 24 hours | UI alignment issue |

**Runbook Examples:**

```markdown
## Database Connection Issues

**Symptoms:** API timeouts, "too many connections" errors

**Diagnosis:**
1. Check Supabase dashboard (connection pool usage)
2. Check Sentry for error patterns
3. Review recent deployments

**Resolution:**
1. Enable connection pooling (PgBouncer)
2. Restart serverless functions (clear stale connections)
3. Scale database if needed (Supabase dashboard)

**Prevention:**
- Use pooled connection string in serverless functions
- Monitor connection usage (alert at 80%)
```

---

## Development Workflow

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/pickleballpassport/monorepo.git
cd monorepo

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Setup database
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed initial data

# Start development servers
pnpm dev            # Starts all apps (web + mobile)

# Or start individually:
pnpm dev:web        # Web app only
pnpm dev:mobile     # Mobile app only
```

### Git Workflow

**Branch Strategy:**
- `main` - production
- `staging` - pre-production testing
- `feature/*` - new features
- `fix/*` - bug fixes

**Commit Convention (Conventional Commits):**

```
feat: Add partner points redemption
fix: Resolve payment intent duplication bug
chore: Update dependencies
docs: Add API documentation
test: Add booking cancellation tests
```

### Code Review Checklist

**Required Checks:**
- ✅ All tests pass
- ✅ Type checking passes
- ✅ Linter passes
- ✅ No console.logs in production code
- ✅ Security review (for auth/payment changes)
- ✅ Performance review (for database queries)
- ✅ Mobile compatibility (for UI changes)

---

## Cost Analysis

### Year 1 Infrastructure Costs

| Service | Plan | Monthly Cost | Annual Cost |
|---------|------|--------------|-------------|
| **Vercel** | Pro | $20 | $240 |
| **Supabase** | Pro | $25 | $300 |
| **Expo EAS** | Production | $99 | $1,188 |
| **Clerk** | Pro | $25 | $300 |
| **Stripe** | Pay-per-use | ~$300* | ~$3,600* |
| **AWS S3** | Pay-per-use | ~$10 | ~$120 |
| **SendGrid** | Essentials | $15 | $180 |
| **Twilio** | Pay-per-use | ~$50 | ~$600 |
| **OneSignal** | Free | $0 | $0 |
| **Mux** | Pay-per-use | ~$50 | ~$600 |
| **HubSpot** | Starter | $20 | $240 |
| **Google Maps** | Pay-per-use | ~$20 | ~$240 |
| **Mixpanel** | Free | $0 | $0 |
| **Sentry** | Free | $0 | $0 |
| **Upstash Redis** | Free | $0 | $0 |
| **Domain & SSL** | - | $15 | $180 |
| **Misc/Buffer** | - | $50 | $600 |
| **Total** | | **~$700/mo** | **~$8,400/yr** |

*Stripe fees based on $216K revenue (12 guests × $18K): 2.9% + $0.30 = ~$6,400/year
(Listed as $3,600 assuming 50% installment plan vs full payment mix)

### Year 2 Scaling Costs (40-60 guests)

- Infrastructure: ~$1,500/month (~$18K/year)
- Stripe fees: ~$25K/year (on $800K revenue)
- **Total:** ~$43K/year infrastructure + fees

### Cost Optimization Strategies

**Early Stage:**
- Use free tiers (Mixpanel, Sentry, OneSignal, Upstash)
- Serverless (no idle costs)
- Start with single region

**Growth Stage:**
- Negotiate volume discounts (Stripe, Twilio)
- Optimize image delivery (lazy loading, WebP)
- Cache aggressively (reduce database queries)

---

## Technical Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Vendor lock-in (Vercel, Supabase)** | Medium | Medium | Abstract database layer (Prisma), use standard APIs |
| **Stripe payment failures** | Low | Critical | Retry logic, manual fallback, monitoring |
| **Database performance degradation** | Medium | High | Query optimization, read replicas, caching |
| **Mobile app store rejections** | Low | Medium | Follow guidelines, use Expo updates for fixes |
| **Security breach** | Low | Critical | Security audits, penetration testing, insurance |
| **Third-party API downtime** | Medium | Medium | Graceful degradation, status pages |
| **Over-engineering (premature optimization)** | Medium | Medium | Start simple, measure before optimizing |

---

## Conclusion & Recommendations

### Architecture Strengths

1. **Scalability:** Serverless-first design scales automatically from 10 to 10,000 users
2. **Developer Experience:** TypeScript + tRPC + Prisma = type-safe, productive
3. **Cost Efficiency:** Pay-as-you-grow model, free tiers for early stage
4. **Performance:** Edge CDN, caching, optimized queries = fast UX
5. **Security:** PCI-DSS compliant payments, encrypted data, robust auth
6. **Maintainability:** Monorepo, shared code, clear separation of concerns

### Next Steps

**Phase 1: MVP Development (Months 1-3)**
1. Setup monorepo structure (Turborepo + pnpm)
2. Initialize database schema (Prisma)
3. Build core web pages (marketing site + booking flow)
4. Integrate Stripe payments
5. Deploy to Vercel + Supabase

**Phase 2: Mobile App (Months 4-6)**
1. Setup React Native (Expo)
2. Build itinerary + concierge features
3. Integrate push notifications
4. Submit to app stores

**Phase 3: Partner Portal (Months 7-9)**
1. Build referral tracking system
2. Implement Passport Points
3. Create marketing materials library
4. Launch B2B2C distribution

### Technology Decisions: Final Recommendations

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js 14 | SEO, performance, DX |
| **Mobile** | React Native (Expo) | Code sharing, OTA updates |
| **Backend** | tRPC + Next.js API | Type safety, simplicity |
| **Database** | PostgreSQL (Supabase) | Relational data, managed |
| **Auth** | Clerk | Drop-in, affordable |
| **Payments** | Stripe | Industry standard, feature-rich |
| **Storage** | AWS S3 | Reliable, scalable, cheap |
| **Hosting** | Vercel | Zero-config, performant |
| **Monorepo** | Turborepo + pnpm | Fast, efficient |

**Total Development Estimate:** $90K-140K (Year 1)
**Ongoing Operational Cost:** ~$700/month (Year 1), ~$1,500/month (Year 2)

---

**End of Architecture Document**

Version: 1.0
Date: 2025-12-28
Author: Grant
Total Pages: 82
