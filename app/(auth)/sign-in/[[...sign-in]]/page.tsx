/**
 * Sign-In Page
 *
 * This page renders the Clerk SignIn component for user authentication.
 * Users can sign in with:
 * - Email/password
 * - Google OAuth
 * - Apple OAuth
 * - Magic link
 *
 * Story 2-5: Password Reset Flow
 * - "Forgot password?" link is available both in Clerk's component and below
 * - Links to dedicated /forgot-password route for better UX
 */

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-4xl font-bold text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your Pickleball Passport account
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
          routing="path"
          path="/sign-in"
          forceRedirectUrl="/redirect"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Trouble signing in?{' '}
            <Link href="/forgot-password" className="text-primary hover:underline font-medium">
              Reset your password
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
