# Pickleball Passport Setup Guide

This guide will help you set up the Pickleball Passport application for local development.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Supabase)
- Clerk account for authentication
- Stripe account for payments (later)
- SendGrid account for emails (later)
- Mux account for video hosting (later)

## Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd pickleball-passport
npm install
```

## Step 2: Set Up Clerk Authentication

Clerk provides the authentication system for user sign-up, login, and session management.

### Create a Clerk Application

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application in the Clerk Dashboard
3. Select the following authentication providers:
   - Email/Password
   - Google OAuth (recommended)
   - Apple OAuth (optional)
4. Configure email verification (recommended for production)

### Get Your Clerk API Keys

1. In the Clerk Dashboard, navigate to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Add both keys to your `.env` file:

```bash
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_actual_key_here"
CLERK_SECRET_KEY="sk_test_your_actual_key_here"
```

### Configure Clerk Webhooks (E2-S2)

Webhooks sync user data from Clerk to your database.

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. For local development, use ngrok:
   ```bash
   ngrok http 3000
   ```
4. Add webhook endpoint: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the **Signing Secret** to your `.env`:
   ```bash
   CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

## Step 3: Set Up Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```bash
   createdb pickleball_passport
   ```
3. Update `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/pickleball_passport"
   ```

### Option B: Supabase (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (Pooling mode)
5. Update `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
   ```

### Run Database Migrations

```bash
npm run db:push
```

This creates all tables in your database using the Prisma schema.

### Verify Database Connection

```bash
npm run db:studio
```

This opens Prisma Studio in your browser where you can view and edit database records.

## Step 4: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test Authentication

1. Start the development server: `npm run dev`
2. Navigate to [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
3. Create a new account (email/password or OAuth)
4. Verify your email (if email verification is enabled in Clerk)
5. You should be automatically redirected to `/onboarding`
6. Select your role (Guest or Partner)
7. Click "Continue" to be redirected to your dashboard

### Testing Webhooks Locally

To test the Clerk webhook integration locally, you'll need to use ngrok:

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. In a separate terminal, run: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. In Clerk Dashboard → Webhooks, add endpoint: `https://abc123.ngrok.io/api/webhooks/clerk`
6. Subscribe to: `user.created`, `user.updated`, `user.deleted`
7. Copy the webhook signing secret to your `.env` as `CLERK_WEBHOOK_SECRET`
8. Restart your dev server
9. Create a new user account to test the webhook

## Environment Variables Reference

See `.env.example` for all required environment variables.

### Required for Sprint 1

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret

### Required for Later Sprints

- Stripe keys (Sprint 5-6)
- SendGrid keys (Sprint 3)
- Mux keys (Sprint 3)

## Troubleshooting

### "Missing publishableKey" error

- Make sure you've added valid Clerk keys to `.env`
- Restart the dev server after updating `.env`

### Database connection errors

- Verify your `DATABASE_URL` is correct
- Make sure PostgreSQL is running
- For Supabase, check that your password and project ref are correct

### Middleware errors

- Clear `.next` folder: `rm -rf .next`
- Restart the dev server: `npm run dev`

### TypeScript errors

- Run `npm run db:generate` to regenerate Prisma types
- Run `npx tsc --noEmit` to check for type errors

## Next Steps

After completing this setup:

1. ✅ FOUNDATION-1 through FOUNDATION-4 are complete
2. ✅ E2-S1: Clerk Integration is complete
3. ✅ E2-S2: User Sign-Up Flow with webhooks is complete
4. Next: Implement E2-S3 (User Login Flow with role-based redirects)
5. Next: Implement E2-S4 (Role-Based Access Control)

### Sprint 1 Progress

**Completed (14/33 points - 42%):**
- FOUNDATION-4: tRPC Setup (3 points)
- E2-S1: Clerk Integration Setup (3 points)
- E2-S2: User Sign-Up Flow (5 points)
- E2-S3: User Login Flow (3 points)

**Next Up:**
- E2-S4: Role-Based Access Control (5 points)

## Getting Help

- Clerk Documentation: [https://clerk.com/docs](https://clerk.com/docs)
- Prisma Documentation: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- tRPC Documentation: [https://trpc.io/docs](https://trpc.io/docs)
