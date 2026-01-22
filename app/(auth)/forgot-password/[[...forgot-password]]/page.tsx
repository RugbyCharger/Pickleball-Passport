/**
 * Forgot Password Page
 *
 * Story 2-5: Password Reset Flow
 *
 * This page provides a dedicated route for password reset functionality.
 * Clerk handles the entire password reset flow:
 * 1. User enters email address
 * 2. Clerk sends password reset email
 * 3. User clicks link in email
 * 4. User sets new password
 * 5. Redirected to login after successful reset
 *
 * The SignIn component automatically shows the forgot password view
 * when initialValues.mode is set to 'forgot_password'.
 */

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-4xl font-bold text-primary mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
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
          path="/forgot-password"
          forceRedirectUrl="/sign-in"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
