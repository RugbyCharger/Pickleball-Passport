import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Route matchers for different protection levels
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/packages(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhooks handle their own auth
])

export default clerkMiddleware(async (auth, request) => {
  // Admin routes: require authentication AND ADMIN role
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth()

    // Not authenticated -> redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check role from session claims metadata
    // NOTE: This requires Clerk to be configured to include role in session metadata.
    // If role is not in claims, this check will safely fail (no role = not admin = redirect)
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role
    if (role !== 'ADMIN') {
      // Not admin -> redirect to regular dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Admin user -> allow access
    return NextResponse.next()
  }

  // All dashboard routes (non-admin): require authentication
  if (isDashboardRoute(request)) {
    const { userId } = await auth()

    // Not authenticated -> redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Authenticated -> allow access
    return NextResponse.next()
  }

  // Public routes and all other requests -> allow through
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
