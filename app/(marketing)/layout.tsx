/**
 * Marketing Route Group Layout
 *
 * Covers all marketing-related routes like:
 * - /flyers/*
 * - /contact/*
 * - /partners/*
 * - etc.
 *
 * Prevents static generation since root layout uses ClerkProvider
 * which requires valid keys during build-time prerendering.
 */

// Prevent static generation - ClerkProvider in root layout requires valid keys
export const dynamic = 'force-dynamic'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
