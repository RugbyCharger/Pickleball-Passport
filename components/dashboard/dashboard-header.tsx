'use client'

/**
 * Dashboard Header
 *
 * Header component for the dashboard showing page title and user profile
 * Features:
 * - Responsive design
 * - User avatar and quick profile access
 * - Page context
 */

import { User } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
  user: User
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/bookings': 'My Bookings',
  '/dashboard/payments': 'Payments',
  '/dashboard/documents': 'Documents',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  // Get page title from pathname, or extract from dynamic routes
  let pageTitle = pageTitles[pathname] || 'Dashboard'
  if (pathname.startsWith('/dashboard/bookings/') && pathname !== '/dashboard/bookings') {
    pageTitle = 'Booking Details'
  }

  const greeting = getGreeting()
  const firstName = user.firstName || 'Guest'

  return (
    <header className="sticky top-0 z-30 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        {/* Page Title & Greeting */}
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-primary">
            {pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {greeting}, {firstName}!
          </p>
        </div>

        {/* User Profile Button (Clerk) */}
        <div className="flex items-center gap-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}

/**
 * Get time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
