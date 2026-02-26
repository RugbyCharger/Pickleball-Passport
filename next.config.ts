import type { NextConfig } from 'next'

/**
 * Security Headers Configuration
 *
 * CSP deployed in Report-Only mode for initial monitoring.
 * Switch to Content-Security-Policy after validation period.
 */

// Third-party domains required by the application
const CLERK_DOMAINS = [
  'https://*.clerk.com',
  'https://*.clerk.dev',
  'https://img.clerk.com',
  'https://challenges.cloudflare.com', // Clerk uses Cloudflare Turnstile
];

const STRIPE_DOMAINS = [
  'https://js.stripe.com',
  'https://api.stripe.com',
  'https://hooks.stripe.com',
  'https://m.stripe.network', // Stripe fraud detection
];

const SUPABASE_DOMAINS = [
  'https://*.supabase.co',
];

const GOOGLE_DOMAINS = [
  'https://www.google.com', // reCAPTCHA
  'https://www.gstatic.com', // reCAPTCHA assets
];

const MUX_DOMAINS = [
  'https://stream.mux.com',
  'https://image.mux.com',
];

// Build CSP directives
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js, Clerk widget
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []), // Only in dev
    ...CLERK_DOMAINS,
    ...STRIPE_DOMAINS,
    ...GOOGLE_DOMAINS,
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind, component libraries
    ...CLERK_DOMAINS,
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    ...CLERK_DOMAINS,
    ...SUPABASE_DOMAINS,
    ...MUX_DOMAINS,
    'https://*.googleusercontent.com', // Google profile images
    'https://images.unsplash.com', // Destination photography
  ],
  'font-src': [
    "'self'",
    'data:',
    ...CLERK_DOMAINS,
  ],
  'connect-src': [
    "'self'",
    ...CLERK_DOMAINS,
    ...STRIPE_DOMAINS,
    ...SUPABASE_DOMAINS,
    ...GOOGLE_DOMAINS,
    ...MUX_DOMAINS,
  ],
  'frame-src': [
    "'self'",
    ...CLERK_DOMAINS,
    ...STRIPE_DOMAINS, // Stripe Elements uses iframes
    ...GOOGLE_DOMAINS, // reCAPTCHA uses iframes
  ],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
};

// Convert directives object to CSP string
function buildCsp(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

const cspHeader = buildCsp(cspDirectives);

/**
 * CSP ENFORCEMENT MIGRATION GUIDE
 *
 * Current status: Report-Only mode
 * Target: Full enforcement after validation period
 *
 * Migration steps:
 * 1. Deploy with Report-Only header (current state)
 * 2. Monitor browser console for CSP violations on staging/production
 * 3. Add any missing domains to the whitelist arrays above
 * 4. Once no violations reported for 7+ days, switch to enforcement:
 *
 *    Change:
 *      key: 'Content-Security-Policy-Report-Only',
 *    To:
 *      key: 'Content-Security-Policy',
 *
 * Common violations to watch for:
 * - Inline scripts from third-party widgets (add domain to script-src)
 * - External images (add domain to img-src)
 * - Font files (add domain to font-src)
 * - WebSocket connections (add wss:// domain to connect-src)
 *
 * To add CSP violation reporting (optional):
 * Add to cspDirectives:
 *   'report-uri': ['/api/csp-report'],
 *   'report-to': ['csp-endpoint'],
 *
 * Then create /api/csp-report endpoint to log violations.
 */

// Security headers to apply to all routes
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Prevent clickjacking
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Opt-out of FLoC (deprecated but harmless)
    key: 'Permissions-Policy',
    value: 'interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
}

export default nextConfig
