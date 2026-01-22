import { z } from 'zod'

// P1-005: Environment variable schema with fail-fast validation
// Critical vars are required - app will fail to start if missing
const envSchema = z.object({
  // Database - REQUIRED
  DATABASE_URL: z.string().url(),

  // Clerk - REQUIRED for authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(), // Only needed for webhook processing

  // Stripe - REQUIRED for payments
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(), // Only needed for webhook processing

  // SendGrid - REQUIRED for email functionality
  SENDGRID_API_KEY: z.string().min(1, 'SENDGRID_API_KEY is required'),
  SENDGRID_FROM_EMAIL: z.string().email('SENDGRID_FROM_EMAIL must be a valid email'),

  // Mux - Optional (video features may be disabled)
  MUX_TOKEN_ID: z.string().min(1).optional(),
  MUX_TOKEN_SECRET: z.string().min(1).optional(),

  // App - REQUIRED
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// P1-005: Parse and validate environment variables with fail-fast behavior
// In production, missing critical vars will cause immediate startup failure
// In development/test, use safeParse to allow partial configuration
const envValues = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
  MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
}

const isProduction = process.env.NODE_ENV === 'production'

// In production: strict validation - fail immediately if missing critical vars
// In development/test: warn but allow startup for partial configuration
const parseResult = envSchema.safeParse(envValues)

if (!parseResult.success) {
  const formatted = parseResult.error.format()
  const missing = Object.entries(formatted)
    .filter(([key, value]) => key !== '_errors' && value && typeof value === 'object' && '_errors' in value)
    .map(([key, value]) => `  - ${key}: ${(value as { _errors: string[] })._errors.join(', ')}`)
    .join('\n')

  if (isProduction) {
    console.error('❌ CRITICAL: Missing required environment variables:\n' + missing)
    throw new Error('Missing required environment variables. See console for details.')
  } else {
    console.warn('⚠️  Warning: Missing environment variables (non-production):\n' + missing)
  }
}

export const env = parseResult.success ? parseResult.data : (envValues as z.infer<typeof envSchema>)

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>
