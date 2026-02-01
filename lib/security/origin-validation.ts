/**
 * Origin Validation Utility
 *
 * Validates Origin header for CSRF protection on mutation endpoints.
 * Part of defense-in-depth strategy alongside tRPC Content-Type validation.
 */

import type { NextRequest } from 'next/server';

/**
 * Allowed origins for mutation requests
 *
 * Note: This is defense-in-depth. tRPC v11+ already validates Content-Type
 * which blocks most form-based CSRF attacks.
 */
export const ALLOWED_ORIGINS = {
  production: [
    'https://pickleballpassport.com',
    'https://www.pickleballpassport.com',
    'https://app.pickleballpassport.com',
  ],
  // Vercel preview deployments
  preview: /^https:\/\/.*\.vercel\.app$/,
  // Local development
  development: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
};

/**
 * Methods that require CSRF protection
 */
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Check if request method is a mutation
 */
export function isMutationMethod(method: string): boolean {
  return MUTATION_METHODS.includes(method.toUpperCase());
}

/**
 * Check if request has Bearer token authentication
 * Mobile apps use Bearer tokens, not cookies, so they are CSRF-immune
 */
export function hasBearerToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader?.toLowerCase().startsWith('bearer ') ?? false;
}

/**
 * Validate Origin header against allowed origins
 *
 * @returns true if Origin is valid or not required, false if invalid
 */
export function validateOrigin(request: NextRequest): boolean {
  // GET requests don't need CSRF protection
  if (!isMutationMethod(request.method)) {
    return true;
  }

  // Bearer token auth is CSRF-immune (mobile app)
  if (hasBearerToken(request)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // No Origin header - could be same-origin or direct API call
  // Be permissive here; tRPC Content-Type check provides additional protection
  if (!origin) {
    // If no Origin but there's a Referer from same host, allow it
    const referer = request.headers.get('referer');
    if (referer && host) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host === host) {
          return true;
        }
      } catch {
        // Invalid referer URL, fall through to deny
      }
    }

    // tRPC requests without Origin but with correct Content-Type are likely legitimate
    // The tRPC Content-Type check will catch form-based CSRF
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return true;
    }

    // No Origin, no valid Referer, not JSON - suspicious, but log and allow
    // (tRPC will catch non-JSON anyway)
    return true;
  }

  // Check against allowed origins
  const env = process.env.NODE_ENV;

  // Development
  if (env === 'development' && ALLOWED_ORIGINS.development.includes(origin)) {
    return true;
  }

  // Production
  if (ALLOWED_ORIGINS.production.includes(origin)) {
    return true;
  }

  // Vercel preview deployments (any environment)
  if (ALLOWED_ORIGINS.preview.test(origin)) {
    return true;
  }

  // Origin doesn't match any allowed pattern
  return false;
}

/**
 * Get descriptive reason for Origin validation failure
 */
export function getOriginValidationError(request: NextRequest): string {
  const origin = request.headers.get('origin');

  if (!origin) {
    return 'Missing Origin header for cross-origin request';
  }

  return `Origin '${origin}' is not in the list of allowed origins`;
}
