'use client'

/**
 * Dashboard Sidebar
 *
 * Main navigation sidebar for the guest dashboard
 * Features:
 * - Fixed desktop sidebar
 * - Mobile responsive with slide-out menu
 * - Active route highlighting
 * - User profile section
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@clerk/nextjs/server'
import { cn } from '@/lib/utils'
import {
  Home,
  Calendar,
  CreditCard,
  Settings,
  FileText,
  Bell,
  HelpCircle,
  Menu,
  X,
  UserCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  user: User
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    exact: true,
  },
  {
    name: 'My Bookings',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    name: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    name: 'Support',
    href: '/dashboard/support',
    icon: HelpCircle,
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: UserCircle,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-playfair text-xl font-bold text-primary">
          Pickleball Passport
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link
              href="/dashboard"
              className="font-playfair text-2xl font-bold text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pickleball Passport
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || 'Guest'
                  }
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Spacer */}
      <div className="lg:hidden h-[57px]" />
    </>
  )
}
