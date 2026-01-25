# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase implementation, strict mode enabled
- JavaScript - Node.js runtime and build tooling

**Secondary:**
- SQL - PostgreSQL database queries via Prisma ORM
- HTML/CSS - Markup and styling (Tailwind CSS 4)

## Runtime

**Environment:**
- Node.js 20+ (specified in package.json devDependencies)
- Next.js 16.1.1 - Full-stack React framework with API routes

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- Node modules managed with pnpm-style linking in node_modules

## Frameworks

**Core:**
- Next.js 16.1.1 - React framework with server/client components, API routes, and file-based routing
- React 19.2.3 - UI components and hooks
- React DOM 19.2.3 - React rendering

**API & State Management:**
- tRPC 11.8.1 - End-to-end typesafe API layer (`@trpc/client`, `@trpc/next`, `@trpc/react-query`, `@trpc/server`)
- TanStack React Query 5.90.12 - Data fetching and caching state management

**Forms & Validation:**
- React Hook Form 7.69.0 - Lightweight form state management
- Zod 4.2.1 - TypeScript-first schema validation
- @hookform/resolvers 5.2.2 - Zod integration with React Hook Form

**UI Components & Styling:**
- Radix UI - Headless component library for accessible primitives:
  - @radix-ui/react-accordion, checkbox, dialog, dropdown-menu, label, radio-group, select, separator, slot, switch, tooltip
- Tailwind CSS 4 - Utility-first CSS framework with @tailwindcss/typography and @tailwindcss/postcss
- Lucide React 0.562.0 - Icon library
- Sonner 2.0.7 - Toast notifications
- Framer Motion 12.23.26 - Animation library
- class-variance-authority 0.7.1 - CSS variant composition
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Intelligent Tailwind CSS merge

**Testing:**
- Vitest 4.0.17 - Unit testing framework (ESM-native, faster than Jest)
- @vitest/ui 4.0.17 - Vitest UI dashboard
- @testing-library/react 16.3.1 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM matchers
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 27.4.0 - DOM implementation for testing
- Playwright 1.57.0 - E2E browser automation testing
- @playwright/test 1.57.0 - Playwright test runner

**Build/Dev Tools:**
- TypeScript 5.9.3 - Type checking
- ESLint 9 - Linting
- eslint-config-next 16.1.1 - Next.js ESLint rules
- Prisma 5.22.0 - Database ORM and migrations (`prisma generate` and `prisma db push` scripts)
- tsx 4.21.0 - TypeScript executor for Node scripts
- Vite 5.x - Used by Vitest and @vitejs/plugin-react
- @vitejs/plugin-react 5.1.2 - React plugin for Vite

**Rich Text & Content:**
- TipTap 3.16.0 - Headless rich text editor:
  - @tiptap/react, @tiptap/starter-kit, @tiptap/extension-color, extension-highlight, extension-image, extension-link, extension-placeholder, extension-text-align, extension-text-style, extension-underline, @tiptap/pm
- React Markdown 10.1.0 - Markdown rendering
- Remark GFM 4.0.1 - GitHub Flavored Markdown support
- Gray Matter 4.0.3 - Front matter parser

**Data & Utilities:**
- Date-fns 4.1.0 - Date manipulation and formatting
- Nanoid 5.1.6 - Unique ID generation
- SuperJSON 2.2.6 - JSON serialization with type support
- Handlebars 4.7.8 - Template rendering for email
- HTML-to-Text 9.0.5 - HTML to plain text conversion
- axios 1.13.2 - HTTP client
- use-debounce 10.0.6 - Debounce hook
- zustand 5.0.9 - Lightweight state management (alternative to Redux)

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Drag and drop primitives
- @dnd-kit/sortable 10.0.0 - Sortable list addon
- @dnd-kit/utilities 3.2.2 - Utility functions

**Media & PDF:**
- @react-pdf/renderer 4.3.2 - PDF generation from React components
- QR Code React 4.2.0 - QR code generation
- Recharts 3.6.0 - Charts and data visualization
- @mux/mux-player-react 3.10.2 - Mux video player component

**Theme & Dark Mode:**
- next-themes 0.4.6 - Theme provider for Next.js

**Logging:**
- Pino 10.2.0 - Structured logging library

**Faker & Mocking:**
- @faker-js/faker 10.2.0 - Test data generation

**Other Utilities:**
- next-sitemap 4.2.3 - Sitemap generation

## Key Dependencies

**Critical - Payment Processing:**
- stripe 20.1.0 - Stripe server-side SDK for payment processing, refunds, and Connect
- @stripe/stripe-js 8.6.0 - Stripe client library for frontend payment forms
- @stripe/react-stripe-js 5.4.1 - React Stripe Elements components

**Critical - Authentication & Authorization:**
- @clerk/nextjs 6.36.5 - Clerk authentication provider for user management and sessions

**Critical - Database:**
- @prisma/client 5.22.0 - Prisma client for database operations
- prisma 5.22.0 - Prisma CLI for migrations and generation

**Infrastructure:**
- @aws-sdk/client-s3 3.972.0 - AWS S3 client for file storage
- @aws-sdk/s3-request-presigner 3.972.0 - S3 presigned URL generation
- @supabase/supabase-js 2.89.0 - Supabase client (PostgreSQL + Storage)
- @upstash/redis 1.36.1 - Upstash Redis client for caching/sessions
- @upstash/ratelimit 2.0.7 - Rate limiting using Upstash Redis

**Communications:**
- @sendgrid/mail 8.1.6 - SendGrid email service SDK
- twilio 5.11.2 - Twilio SMS service SDK
- @mux/mux-node 12.8.1 - Mux video API SDK
- svix 1.82.0 - Svix webhook management (for Stripe or custom webhooks)

**Security & Validation:**
- react-google-recaptcha-v3 1.11.0 - Google reCAPTCHA v3 protection

## Configuration

**Environment:**
- `.env` - Local development environment variables
- `.env.test` - Test environment configuration
- `.env.staging` - Staging environment configuration
- `.env.vercel` - Vercel deployment variables
- `tsconfig.json` - TypeScript compiler options with path alias `@/*` for root imports
- `vitest.config.ts` - Vitest test runner configuration
- `playwright.config.ts` - Playwright E2E test configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS 4
- `components.json` - Shadcn/UI component configuration (if used)
- `next-sitemap.config.js` - Sitemap generation config
- `vercel.json` - Vercel deployment config with cron jobs

**Build:**
- `package.json` - npm scripts and dependency management:
  - `npm run dev` - Next.js dev server
  - `npm run build` - Prisma generate + Next.js production build
  - `npm run start` - Next.js production server
  - `npm run lint` - ESLint validation
  - `npm run db:push` - Push schema changes to database
  - `npm run db:studio` - Prisma Studio visual editor
  - `npm run db:generate` - Generate Prisma client
  - `npm run db:seed` - Seed database with `tsx prisma/seed.ts`
  - `npm test` - Run unit tests with vitest
  - `npm run test:e2e` - Run Playwright E2E tests
  - `npm run test:e2e:report` - View test report

## Platform Requirements

**Development:**
- Node.js 20+
- npm/pnpm package manager
- PostgreSQL database (local or remote)
- Environment variables configured in `.env.test` or `.env`

**Production:**
- Vercel (primary hosting platform based on `vercel.json`)
- PostgreSQL database (Supabase recommended based on `prisma/schema.prisma`)
- AWS S3 for file storage (or Supabase Storage)
- Stripe account for payments
- Clerk account for authentication
- SendGrid account for email
- Twilio account for SMS (optional)
- Mux account for video (optional)
- Upstash Redis for rate limiting and caching
- Google reCAPTCHA v3 API key

**Optional Services:**
- Sentry error tracking (DSN in `.env.sentry-build-plugin`)

---

*Stack analysis: 2026-01-25*
