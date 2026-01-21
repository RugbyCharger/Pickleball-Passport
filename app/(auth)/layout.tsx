/**
 * Auth Layout
 *
 * Layout wrapper for authentication pages (sign-in, sign-up)
 * Provides consistent styling and structure for auth flows
 */

// Prevent static generation - requires Clerk
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50">
      {children}
    </div>
  )
}
