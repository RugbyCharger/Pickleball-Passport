/**
 * Dashboard Layout
 *
 * Provides the layout structure for the guest dashboard including:
 * - Sidebar navigation
 * - User profile header
 * - Mobile responsive design
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar Navigation - Desktop */}
      <DashboardSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header with User Profile */}
        <DashboardHeader user={user} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
