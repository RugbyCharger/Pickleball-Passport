import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authLogger } from '@/lib/logger'
import { checkRateLimit, getIpAddress, getRateLimitHeaders } from '@/lib/rate-limit'

// Route matchers for different protection levels
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)', '/api/admin(.*)'])
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)'])
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
    authLogger.warn(
      {
        ip,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent'),
      },
      'Global rate limit exceeded'
    )
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

  // Admin routes: require authentication AND admin role from database
  // SEC-01: All admin routes check database role, API routes return 403
  if (isAdminRoute(request)) {
    const { userId } = await auth()

    // Not authenticated
    if (!userId) {
      // API routes: return 401 JSON
      if (isAdminApiRoute(request)) {
        authLogger.warn(
          {
            path: request.nextUrl.pathname,
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          },
          'Unauthenticated admin API access attempt'
        )
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        )
      }

      // Page routes: redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check database role for admin access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    const isAdmin = user?.role === 'ADMIN'

    if (!isAdmin) {
      // Log unauthorized access attempt
      authLogger.warn(
        {
          userId,
          role: user?.role || 'UNKNOWN',
          path: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
        'Unauthorized admin access attempt'
      )

      // API routes: return 403 JSON
      if (isAdminApiRoute(request)) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        )
      }

      // Page routes: redirect to dashboard
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
