/**
 * Auth Layout
 *
 * Layout wrapper for authentication pages (sign-in, sign-up)
 * Provides consistent styling and structure for auth flows
 */

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
