/**
 * Dashboard Route Group Layout
 *
 * This layout covers all authenticated dashboard routes:
 * - /admin/* (admin dashboard)
 * - /partner/* (partner dashboard)
 * - /dashboard/* (guest dashboard)
 * - /onboarding/*
 * - /redirect/*
 *
 * Prevents static generation since these routes require authentication
 */

// Prevent static generation - requires auth
export const dynamic = 'force-dynamic'

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
