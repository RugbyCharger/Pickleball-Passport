/**
 * Clerk Authentication Middleware
 *
 * This middleware protects routes and enforces authentication + role-based access control.
 * - Public routes: accessible without authentication
 * - Protected routes: require authentication, redirect to sign-in if not authenticated
 * - Role-based routes: require specific user roles
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Protect all non-public routes - require authentication
  await auth.protect()

  // If no userId, auth.protect() should have already redirected
  if (!userId) {
    return NextResponse.next()
  }

  // Check role-based access for protected routes
  const pathname = request.nextUrl.pathname

  // Skip role check for API routes and non-dashboard routes
  if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
    return NextResponse.next()
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

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
