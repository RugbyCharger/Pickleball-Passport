/**
 * Settings Page
 *
 * Story 2-8: Session Management
 *
 * Allows guests to manage their account settings including:
 * - Personal information (Clerk managed, links to profile page)
 * - Email preferences
 * - Session management (view active sessions, sign out all devices)
 * - Security settings
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, AlertCircle, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SessionManagement } from '@/components/auth/session-management'

export default async function SettingsPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
  const primaryPhone = user.phoneNumbers.find((phone) => phone.id === user.primaryPhoneNumberId)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information - Link to Profile Page */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal details and account information
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/profile">
                Edit Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">First Name</p>
              <p className="font-medium">{user.firstName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Name</p>
              <p className="font-medium">{user.lastName || 'Not set'}</p>
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email Address</p>
            <div className="flex items-center gap-2">
              <p className="font-medium">{primaryEmail?.emailAddress || 'Not set'}</p>
              {primaryEmail?.verification?.status === 'verified' && (
                <Badge variant="default" className="text-xs">Verified</Badge>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
            <p className="font-medium">{primaryPhone?.phoneNumber || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Session Management - Story 2-8 */}
      <SessionManagement />

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preferences
          </CardTitle>
          <CardDescription>
            Manage which emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between py-2">
              <div className="flex-1">
                <p className="font-medium">Booking Confirmations</p>
                <p className="text-sm text-muted-foreground">
                  Receive emails when your bookings are confirmed
                </p>
              </div>
              <Badge variant="outline" className="ml-4">Always On</Badge>
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="flex-1">
                <p className="font-medium">Trip Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminders about upcoming trips
                </p>
              </div>
              <Badge variant="outline" className="ml-4">Always On</Badge>
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="flex-1">
                <p className="font-medium">Payment Receipts</p>
                <p className="text-sm text-muted-foreground">
                  Receive receipts for all payments
                </p>
              </div>
              <Badge variant="outline" className="ml-4">Always On</Badge>
            </div>

            <div className="flex items-start justify-between py-2 border-t">
              <div className="flex-1">
                <p className="font-medium">Marketing & Promotions</p>
                <p className="text-sm text-muted-foreground">
                  New packages, special offers, and updates
                </p>
              </div>
              <Badge variant="secondary" className="ml-4">Coming Soon</Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/notifications">
                Manage Notification Preferences
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact - Link to Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                This information will only be used in case of emergency during your trip
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">
                Edit
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Emergency contact information can be managed on your{' '}
            <Link href="/dashboard/profile" className="text-primary hover:underline">
              profile page
            </Link>.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-1">Password & Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground mb-3">
              Change your password or enable two-factor authentication for enhanced security.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">
                Manage Security Settings
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last sign-in: {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Never'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions - Link to Profile for Deletion */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Download My Data</p>
              <p className="text-sm text-muted-foreground">Export a copy of your personal data</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-t">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" asChild>
              <Link href="/dashboard/profile">
                Delete Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
