/**
 * Sign-Up Page
 *
 * This page renders the Clerk SignUp component for new user registration.
 * Users can sign up with:
 * - Email/password
 * - Google OAuth
 * - Apple OAuth
 *
 * After successful signup, users are redirected to the onboarding flow
 * where they select their role (Guest or Partner).
 */

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-4xl font-bold text-primary mb-2">
            Join The Pickleball Passport
          </h1>
          <p className="text-muted-foreground">
            Start your transformation journey in Thailand
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
          localization={{
            unstable__errors: {
              form_password_pwned: 'This password has appeared in a known data breach. For your security, please choose a different password.',
            },
          }}
          routing="path"
          path="/sign-up"
          forceRedirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}
