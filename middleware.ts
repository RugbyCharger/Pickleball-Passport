/**
 * Next.js Middleware - DISABLED FOR DEBUGGING
 *
 * Temporarily disabled to isolate MIDDLEWARE_INVOCATION_FAILED error
 */

import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()
}

// Disable middleware completely for debugging
export const config = {
  matcher: [],
}
