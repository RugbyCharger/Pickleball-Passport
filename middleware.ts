/**
 * Clerk Authentication Middleware
 *
 * This middleware protects routes and enforces authentication + role-based access control.
 * - Public routes: accessible without authentication
 * - Protected routes: require authentication, redirect to sign-in if not authenticated
 * - Role-based routes: require specific user roles
 *
 * Also handles UTM parameter tracking (Epic 10 - US-007):
 * - Captures UTM params from URL and stores them in cookies
 * - Uses first-touch attribution (doesn't overwrite existing UTM cookies)
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

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
  '/onboarding(.*)',
  '/redirect(.*)',
  '/packages(.*)',
  '/testimonials(.*)',
  '/api/webhooks(.*)',
  '/flyers(.*)',
])

// Define role-specific route patterns
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/dashboard/admin(.*)'])
const isPartnerRoute = createRouteMatcher(['/partner(.*)'])
const isGuestRoute = createRouteMatcher(['/dashboard(.*)'])

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
  const { userId } = await auth()

  // Allow public routes
  if (isPublicRoute(request)) {
    const response = NextResponse.next()
    // Still capture UTM params on public routes
    return handleUtmTracking(request as unknown as NextRequest, response)
  }

  // Protect all non-public routes - require authentication
  await auth.protect()

  // If no userId, auth.protect() should have already redirected
  if (!userId) {
    const response = NextResponse.next()
    return handleUtmTracking(request as unknown as NextRequest, response)
  }

  // Check role-based access for protected routes
  const pathname = request.nextUrl.pathname

  // Skip role check for API routes and non-dashboard routes
  if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
    const response = NextResponse.next()
    return handleUtmTracking(request as unknown as NextRequest, response)
  }

  // Check if this is a role-specific route
  if (isAdminRoute(request) || isPartnerRoute(request) || isGuestRoute(request)) {
    try {
      // Fetch user role from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      // If user not in database yet, redirect to onboarding
      if (!user) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Check admin routes
      if (isAdminRoute(request) && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/redirect', request.url))
      }

      // Check partner routes
      if (isPartnerRoute(request) && user.role !== 'PARTNER' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/redirect', request.url))
      }

      // Check guest routes (guests, partners, and admins can access)
      if (isGuestRoute(request) && user.role !== 'GUEST' && user.role !== 'PARTNER' && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/redirect', request.url))
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      // On error, redirect to onboarding to be safe
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

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
