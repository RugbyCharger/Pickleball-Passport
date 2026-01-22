/**
 * Next.js Middleware
 *
 * Handles UTM parameter tracking for marketing attribution.
 * Authentication is handled at the page/API level via Clerk components and tRPC middleware.
 *
 * Note: clerkMiddleware is not used here due to Edge Runtime compatibility issues
 * with Vercel deployments. Auth protection is enforced via:
 * - Clerk's <SignedIn>/<SignedOut> components for pages
 * - tRPC's enforceRole middleware for API routes
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// UTM Cookie Configuration (Epic 10 - US-007)
const UTM_COOKIE_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  httpOnly: false, // Allow client-side reading for form submission
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign'] as const

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = new URL(request.url)

  // Capture UTM parameters (first-touch attribution)
  for (const param of UTM_PARAMS) {
    const value = url.searchParams.get(param)
    if (value) {
      const existingCookie = request.cookies.get(param)
      if (!existingCookie) {
        response.cookies.set(param, value, UTM_COOKIE_CONFIG)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    // Only run on marketing pages where UTM tracking matters
    '/',
    '/packages/:path*',
    '/testimonials/:path*',
    '/partners/:path*',
    '/p/:path*',
    '/r/:path*',
  ],
}
