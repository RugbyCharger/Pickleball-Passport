// Staging: Skip strict env validation

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
}

export default env
