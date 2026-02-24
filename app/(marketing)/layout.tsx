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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
