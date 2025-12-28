/**
 * Partner Dashboard
 *
 * Main dashboard for partners to view referrals, track points, etc.
 * This is a placeholder for now - will be implemented in later sprints.
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function PartnerDashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="font-playfair text-4xl font-bold text-primary mb-4">
        Partner Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Hi {user.firstName || 'Partner'}! Your partner dashboard will be implemented in future sprints.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Referrals</h2>
          <p className="text-sm text-muted-foreground">
            Track your member referrals and bookings (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Passport Points</h2>
          <p className="text-sm text-muted-foreground">
            View and redeem your rewards (Coming soon)
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2">Club Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your club information (Coming soon)
          </p>
        </div>
      </div>
    </div>
  )
}
