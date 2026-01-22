/**
 * Clerk Authentication Middleware
 *
 * This middleware protects routes and enforces authentication.
 * - Public routes: accessible without authentication
 * - Protected routes: require authentication, redirect to sign-in if not authenticated
 *
 * Role-based access control is handled at the page/API level via tRPC's enforceRole middleware.
 *
 * Also handles UTM parameter tracking (Epic 10 - US-007):
 * - Captures UTM params from URL and stores them in cookies
 * - Uses first-touch attribution (doesn't overwrite existing UTM cookies)
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
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

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/onboarding(.*)',
  '/redirect(.*)',
  '/packages(.*)',
  '/testimonials(.*)',
  '/api/webhooks(.*)',
  '/flyers(.*)',
])

/**
 * Helper function to capture UTM parameters from URL and set cookies
 * Uses first-touch attribution (doesn't overwrite existing UTM cookies)
 */
function handleUtmTracking(request: NextRequest, response: NextResponse): NextResponse {
  const url = new URL(request.url)

  // Check for UTM parameters in URL
  for (const param of UTM_PARAMS) {
    const value = url.searchParams.get(param)
    if (value) {
      // First-touch attribution: don't overwrite existing cookie
      const existingCookie = request.cookies.get(param)
      if (!existingCookie) {
        response.cookies.set(param, value, UTM_COOKIE_CONFIG)
      }
    }
  }

  return response
}

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    const response = NextResponse.next()
    // Still capture UTM params on public routes
    return handleUtmTracking(request as unknown as NextRequest, response)
  }

  // Protect all non-public routes - require authentication
  await auth.protect()

  const response = NextResponse.next()
  return handleUtmTracking(request as unknown as NextRequest, response)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
