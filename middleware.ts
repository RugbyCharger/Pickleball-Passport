import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkRateLimit, getIpAddress, getRateLimitHeaders } from '@/lib/rate-limit'
import { validateOrigin, isMutationMethod } from '@/lib/security/origin-validation'

// Route matchers for different protection levels
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)', '/api/admin(.*)'])
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)'])
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

// Webhook and cron routes exempt from rate limiting (they use signature verification)
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/stripe(.*)',
  '/api/webhooks/sendgrid(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/webhooks/whatsapp(.*)',
  '/api/cron(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Skip rate limiting for webhooks (they use signature verification)
  if (isWebhookRoute(request)) {
    return NextResponse.next()
  }

  // Global rate limiting (100 req/min per IP)
  const ip = getIpAddress(request.headers)
  const globalLimit = await checkRateLimit('global', ip)

  if (globalLimit && !globalLimit.success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(globalLimit),
        },
      }
    )
  }

  // CSRF Protection: Origin validation for mutation requests
  if (isMutationMethod(request.method) && !validateOrigin(request)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Cross-origin request blocked. Invalid origin.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Admin routes: require authentication, then check role via Clerk metadata
  // Note: Database role check moved to tRPC adminProcedure (Prisma can't run in Edge Runtime)
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      if (isAdminApiRoute(request)) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        )
      }
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check Clerk metadata for admin role (lightweight, no DB call)
    // The authoritative DB role check happens in tRPC adminProcedure
    const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
    if (role !== 'ADMIN') {
      if (isAdminApiRoute(request)) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  // All dashboard routes (non-admin): require authentication
  if (isDashboardRoute(request)) {
    const { userId } = await auth()

    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

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
