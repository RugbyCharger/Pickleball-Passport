/**
 * Admin Dashboard
 *
 * Main dashboard for admins to manage the entire platform.
 * This is a placeholder for now - will be implemented in Epic 5.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-playfair text-4xl font-bold text-primary mb-4">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Hi {user.firstName || 'Admin'}! Your admin dashboard will be implemented in Epic 5 (Sprint 9-11).
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Bookings</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all bookings (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage guests and partners (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            View platform analytics (Coming soon)
          </p>
        </div>
      </div>
    </div>
  )
}
