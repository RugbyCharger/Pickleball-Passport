/**
 * Sign-In Page
 *
 * This page renders the Clerk SignIn component for user authentication.
 * Users can sign in with:
 * - Email/password
 * - Google OAuth
 * - Apple OAuth
 * - Magic link
 */

import { SignIn } from '@clerk/nextjs'

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
      </div>
    </div>
  )
}
