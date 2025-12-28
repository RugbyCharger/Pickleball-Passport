/**
 * Profile Settings Page
 *
 * Allows guests to manage their profile settings including:
 * - Personal information (Clerk managed)
 * - Email preferences
 * - Phone number
 * - Emergency contact
 */

import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'

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
        <h2 className="text-xl font-semibold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Profile Information */}
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

          {/* Clerk Profile Link */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              To update your name, email, or add a phone number, please use the user profile menu in the top-right corner.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#" onClick={(e) => {
                e.preventDefault()
                const userButton = document.querySelector('[data-clerk-user-button]') as HTMLElement
                userButton?.click()
              }}>
                Open Profile Settings
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-sm text-muted-foreground">
              Email preferences will be fully customizable in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            This information will only be used in case of emergency during your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Contact Name</p>
              <p className="font-medium text-muted-foreground">Not configured</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Contact Phone</p>
              <p className="font-medium text-muted-foreground">Not configured</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Relationship</p>
              <p className="font-medium text-muted-foreground">Not configured</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Emergency contact management will be available in a future update.
              </p>
              <Button variant="outline" size="sm" disabled>
                Add Emergency Contact
              </Button>
            </div>
          </div>
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
            <p className="font-medium mb-1">Password</p>
            <p className="text-sm text-muted-foreground mb-3">
              Use the profile menu to change your password or enable two-factor authentication.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#" onClick={(e) => {
                e.preventDefault()
                const userButton = document.querySelector('[data-clerk-user-button]') as HTMLElement
                userButton?.click()
              }}>
                Manage Security Settings
              </a>
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

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Button variant="outline" size="sm" disabled className="mr-2">
              Download My Data
            </Button>
            <span className="text-sm text-muted-foreground">Coming soon</span>
          </div>
          <div>
            <Button variant="outline" size="sm" disabled className="mr-2">
              Delete Account
            </Button>
            <span className="text-sm text-muted-foreground">Contact support for account deletion</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
