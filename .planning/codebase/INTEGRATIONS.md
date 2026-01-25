# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**Payment Processing:**
- Stripe - Complete payment solution with Connect for partner payouts
  - SDK: `stripe` (20.1.0 server), `@stripe/stripe-js` (8.6.0 client), `@stripe/react-stripe-js` (5.4.1 React components)
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Integration files: `lib/stripe/stripe-service.ts`, `lib/stripe/stripe-connect.ts`, `lib/stripe/payment-errors.ts`, `app/api/webhooks/stripe/route.ts`
  - Used for: Payment collection, installment plans, refunds, Stripe Connect payouts for partners
  - Webhook handling: `app/api/webhooks/stripe/route.ts` - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, payment intent canceled

**Authentication & User Management:**
- Clerk - User authentication and session management
  - SDK: `@clerk/nextjs` (6.36.5)
  - Auth: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Integration files: Components auth/session-management.tsx, auth routes
  - Webhook handling: `app/api/webhooks/clerk/route.ts` - User creation/deletion/update events

**Email Communications:**
- SendGrid - Transactional and marketing email service
  - SDK: `@sendgrid/mail` (8.1.6)
  - Auth: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
  - Integration files: `lib/email/sendgrid.ts`, `lib/email/send-email.ts`, `lib/email/send-pre-trip-emails.ts`
  - Used for: Booking confirmations, payment receipts, trip reminders, pre-trip sequences, post-trip follow-ups
  - Webhook handling: `app/api/webhooks/sendgrid/events/route.ts` - Email delivery, open, click, bounce events
  - Templates: Dynamic templates with Handlebars for email personalization

**SMS & Notifications:**
- Twilio - SMS messaging service
  - SDK: `twilio` (5.11.2)
  - Auth: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - Integration files: `lib/sms/twilio.ts`
  - Used for: Pre-trip SMS notifications, payment reminders, WhatsApp integration
  - Phone number validation: E.164 format (e.g., +15551234567)

**Video Storage & Streaming:**
- Mux - Video hosting and playback for testimonials
  - SDK: `@mux/mux-node` (12.8.1), `@mux/mux-player-react` (3.10.2)
  - Auth: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
  - Used for: Guest testimonial videos, before/after video content
  - Storage: Mux asset IDs and playback IDs stored in database (`testimonial.muxAssetId`, `testimonial.muxPlaybackId`)

## Data Storage

**Databases:**
- PostgreSQL
  - Provider: Supabase (recommended, specified in schema comments)
  - Connection: `DATABASE_URL`, `DIRECT_URL` (direct connection for migrations)
  - Client: Prisma ORM 5.22.0
  - Schema: `prisma/schema.prisma` - 100+ tables covering bookings, payments, users, content, analytics
  - Features: Row-level security (RLS) policies, soft deletes for financial audit trail

**File Storage:**
- AWS S3
  - SDK: `@aws-sdk/client-s3` (3.972.0), `@aws-sdk/s3-request-presigner` (3.972.0)
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
  - Used for: Guest testimonial photos (before/after), media library assets, document uploads
  - Presigned URLs: For secure temporary access to private files

- Supabase Storage
  - SDK: `@supabase/supabase-js` (2.89.0)
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Integration files: `lib/storage/supabase-storage.ts`, `lib/storage/testimonial-storage.ts`
  - Used for: Receipt PDFs, payment documents, private authenticated file storage
  - Service role operations: Server-side admin access for file uploads

**Caching & Sessions:**
- Upstash Redis
  - SDK: `@upstash/redis` (1.36.1), `@upstash/ratelimit` (2.0.7)
  - Auth: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Used for: Rate limiting on contact forms, session caching, temporary data storage
  - Connection: REST API (no TCP required)

## Authentication & Identity

**Auth Provider:**
- Clerk (custom implementation)
  - Implementation: Next.js middleware for auth flow, session tokens, user context
  - OAuth/Social: Configured in Clerk dashboard
  - Multi-factor: Supported via Clerk dashboard settings
  - User attributes: Custom metadata for user roles (GUEST, PARTNER, ADMIN)

**Authorization Patterns:**
- Role-based access control (RBAC): User.role enum (GUEST, PARTNER, ADMIN)
- Database-level: Row-level security (RLS) on Supabase
- API-level: tRPC middleware for permission checks

## Monitoring & Observability

**Error Tracking:**
- Sentry (optional, not critical)
  - SDK: `@sentry/node` (inferred from build plugin reference)
  - Auth: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`
  - Config file: `.env.sentry-build-plugin`

**Logs:**
- Local: Pino structured logging (`pino` 10.2.0)
- Integration files: `lib/logger.ts`, `lib/logger/` directory
- Log levels: info, warn, error with structured JSON output
- Sensitive data: Masking for phone numbers, payment info, emails

**Webhooks & Callbacks:**
- Custom webhook handling in `app/api/webhooks/`
- Event types: Stripe payments, Clerk user events, SendGrid email events, WhatsApp messages

## CI/CD & Deployment

**Hosting:**
- Vercel (primary)
  - Configuration: `vercel.json`
  - Cron jobs: 5 scheduled jobs for gift expiration, payment reminders, email sequences
  - Environment: Auto-configured via Vercel integration

**CI Pipeline:**
- Not detected in codebase - likely configured in Vercel dashboard
- Test commands available: `npm test` (unit), `npm run test:e2e` (E2E)

## Environment Configuration

**Required env vars (Production):**
- Database: `DATABASE_URL`, `DIRECT_URL`
- Auth: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Payments: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Email: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- Storage: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or AWS credentials)
- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Video: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
- Caching: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Security: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- Admin alerts: `ADMIN_ALERT_EMAIL`, `ADMIN_ALERT_CC_EMAILS`

**Secrets location:**
- Development: `.env` (git-ignored)
- Test: `.env.test` (git-ignored, reference: `.env.test.example`)
- Staging: `.env.staging` (Vercel preview deployments)
- Production: Vercel environment variables (dashboard)
- Encrypted storage: Bank account numbers in database (marked as TODO: encrypt in production)

## Webhooks & Callbacks

**Incoming:**
- Stripe Webhooks: `POST /api/webhooks/stripe` - Payment events, Connect account updates, transfer completions
- Clerk Webhooks: `POST /api/webhooks/clerk` - User lifecycle events
- SendGrid Event Webhooks: `POST /api/webhooks/sendgrid/events` - Email delivery, opens, clicks, bounces
- WhatsApp Webhooks: `POST /api/webhooks/whatsapp` - Group management events

**Outgoing:**
- SendGrid: Email sending (transactional)
- Twilio: SMS sending
- Stripe: Payment intents, refunds, transfers
- Mux: Video upload and processing webhooks (if enabled)
- Google reCAPTCHA: Form submission validation

**Webhook Security:**
- Stripe: Signature verification with webhook secret (`STRIPE_WEBHOOK_SECRET`)
- Clerk: Signature verification via Clerk SDK
- SendGrid: Signed webhook events (verification implemented in route handler)

---

*Integration audit: 2026-01-25*
