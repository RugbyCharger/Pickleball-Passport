'use client'

/**
 * Partner Notification Preferences Page
 * E11-S9: Partner Notification System
 *
 * Allows partners to manage their notification preferences
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

export default function PartnerNotificationPreferencesPage() {
  const { data: profile } = trpc.partner.getMyProfile.useQuery()
  const utils = trpc.useUtils()

  // Default preferences
  const defaultPreferences = {
    emailReferralClicks: true,
    emailApplications: true,
    emailBookings: true,
    emailPointsEarned: true,
    emailTierChanges: true,
    emailCommissionAvailable: true,
    emailMonthlySummary: true,
    inAppApplications: true,
    inAppBookings: true,
    inAppPointsEarned: true,
    inAppTierChanges: true,
    inAppCommissionAvailable: true,
  }

  const currentPreferences = profile?.notificationPreferences
    ? { ...defaultPreferences, ...(profile.notificationPreferences as Record<string, boolean>) }
    : defaultPreferences

  const [preferences, setPreferences] = useState(currentPreferences)

  const updatePreferences = trpc.partner.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      utils.partner.getMyProfile.invalidate()
      toast.success('Preferences Updated', {
        description: 'Your notification preferences have been saved.',
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences.')
    },
  })

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleSave = () => {
    updatePreferences.mutate({ preferences })
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Manage how you receive notifications about your referrals and partner activity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Receive email updates about your partner activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailReferralClicks" className="font-medium">
                  Referral Link Clicks
                </Label>
                <p className="text-sm text-muted-foreground">
                  Daily digest when someone clicks your referral link
                </p>
              </div>
              <Switch
                id="emailReferralClicks"
                checked={preferences.emailReferralClicks}
                onCheckedChange={() => handleToggle('emailReferralClicks')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailApplications" className="font-medium">
                  Application Submitted
                </Label>
                <p className="text-sm text-muted-foreground">
                  When a referred guest submits an application
                </p>
              </div>
              <Switch
                id="emailApplications"
                checked={preferences.emailApplications}
                onCheckedChange={() => handleToggle('emailApplications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailBookings" className="font-medium">
                  Booking Confirmed
                </Label>
                <p className="text-sm text-muted-foreground">
                  When a referred guest completes their booking
                </p>
              </div>
              <Switch
                id="emailBookings"
                checked={preferences.emailBookings}
                onCheckedChange={() => handleToggle('emailBookings')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailPointsEarned" className="font-medium">
                  Points Earned
                </Label>
                <p className="text-sm text-muted-foreground">
                  When you earn Passport Points
                </p>
              </div>
              <Switch
                id="emailPointsEarned"
                checked={preferences.emailPointsEarned}
                onCheckedChange={() => handleToggle('emailPointsEarned')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailTierChanges" className="font-medium">
                  Tier Changes
                </Label>
                <p className="text-sm text-muted-foreground">
                  When you reach a new tier level
                </p>
              </div>
              <Switch
                id="emailTierChanges"
                checked={preferences.emailTierChanges}
                onCheckedChange={() => handleToggle('emailTierChanges')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailCommissionAvailable" className="font-medium">
                  Commission Available
                </Label>
                <p className="text-sm text-muted-foreground">
                  When you can redeem points for rewards
                </p>
              </div>
              <Switch
                id="emailCommissionAvailable"
                checked={preferences.emailCommissionAvailable}
                onCheckedChange={() => handleToggle('emailCommissionAvailable')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailMonthlySummary" className="font-medium">
                  Monthly Summary
                </Label>
                <p className="text-sm text-muted-foreground">
                  Monthly performance report on the 1st of each month
                </p>
              </div>
              <Switch
                id="emailMonthlySummary"
                checked={preferences.emailMonthlySummary}
                onCheckedChange={() => handleToggle('emailMonthlySummary')}
              />
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>In-App Notifications</CardTitle>
            <CardDescription>
              Receive notifications in the partner portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppApplications" className="font-medium">
                  Application Submitted
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notification for new applications
                </p>
              </div>
              <Switch
                id="inAppApplications"
                checked={preferences.inAppApplications}
                onCheckedChange={() => handleToggle('inAppApplications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppBookings" className="font-medium">
                  Booking Confirmed
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notification for confirmed bookings
                </p>
              </div>
              <Switch
                id="inAppBookings"
                checked={preferences.inAppBookings}
                onCheckedChange={() => handleToggle('inAppBookings')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppPointsEarned" className="font-medium">
                  Points Earned
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notification when you earn points
                </p>
              </div>
              <Switch
                id="inAppPointsEarned"
                checked={preferences.inAppPointsEarned}
                onCheckedChange={() => handleToggle('inAppPointsEarned')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppTierChanges" className="font-medium">
                  Tier Changes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notification for tier level changes
                </p>
              </div>
              <Switch
                id="inAppTierChanges"
                checked={preferences.inAppTierChanges}
                onCheckedChange={() => handleToggle('inAppTierChanges')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inAppCommissionAvailable" className="font-medium">
                  Commission Available
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notification when rewards are ready
                </p>
              </div>
              <Switch
                id="inAppCommissionAvailable"
                checked={preferences.inAppCommissionAvailable}
                onCheckedChange={() => handleToggle('inAppCommissionAvailable')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            size="lg"
          >
            {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  )
}
