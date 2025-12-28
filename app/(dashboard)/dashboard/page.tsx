/**
 * Guest Dashboard
 *
 * Main dashboard for guests to view bookings, manage profile, etc.
 * This is a placeholder for now - will be implemented in later sprints.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-playfair text-4xl font-bold text-primary mb-4">
        Welcome to Your Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Hi {user.firstName || 'Guest'}! Your guest dashboard will be implemented in future sprints.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">My Bookings</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your transformation packages (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal information (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Payments</h2>
          <p className="text-sm text-muted-foreground">
            View payment history and receipts (Coming soon)
          </p>
        </div>
      </div>
    </div>
  )
}
