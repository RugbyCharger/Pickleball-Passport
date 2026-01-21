'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { NotificationToggle } from '@/components/settings/notification-toggle';
import { PreferenceCategory } from '@/components/settings/preference-category';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/lib/preferences/user-preferences';

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = trpc.preferences.getMyPreferences.useQuery();
  const updateMutation = trpc.preferences.updatePreferences.useMutation();
  const unsubscribeAllMutation = trpc.preferences.unsubscribeAll.useMutation();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  // Use local state if available, otherwise use server data
  const currentPreferences = localPreferences || preferences;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPreferences({
      ...currentPreferences!,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updateMutation.mutateAsync(localPreferences);
      toast.success('Preferences saved successfully');
      setLocalPreferences(null);
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all notifications?')) {
      return;
    }

    try {
      await unsubscribeAllMutation.mutateAsync();
      toast.success('Unsubscribed from all notifications');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading preferences...</div>;
  }

  if (!currentPreferences) {
    return <div className="p-8">Failed to load preferences</div>;
  }

  const hasChanges = localPreferences !== null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-600 mt-2">
          Manage how and when you receive communications from Pickleball Passport.
        </p>
      </div>

      <PreferenceCategory
        title="Booking & Account"
        description="Essential notifications about your bookings and account (cannot be disabled)"
      >
        <div className="p-4 text-sm text-gray-500">
          <p className="font-medium text-gray-900 mb-2">
            Always Enabled (Transactional):
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Booking confirmations</li>
            <li>Payment receipts and reminders</li>
            <li>Trip modifications and cancellations</li>
            <li>Account security alerts</li>
          </ul>
        </div>
      </PreferenceCategory>

      <PreferenceCategory
        title="Pre-Trip Communications"
        description="Helpful emails leading up to your trip"
      >
        <NotificationToggle
          id="emailPreTripSequence"
          label="Pre-Trip Email Sequence"
          description="Trip preparation emails at 60, 30, 14, 7, and 1 day before departure"
          enabled={currentPreferences.emailPreTripSequence}
          onChange={(value) => handleToggle('emailPreTripSequence', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Post-Trip & Alumni"
        description="Stay connected after your trip"
      >
        <NotificationToggle
          id="emailPostTripFollowUp"
          label="Post-Trip Follow-Up"
          description="Share your experience and photos after your trip"
          enabled={currentPreferences.emailPostTripFollowUp}
          onChange={(value) => handleToggle('emailPostTripFollowUp', value)}
        />
        <NotificationToggle
          id="emailAlumniEvents"
          label="Alumni Events"
          description="Invitations to special events and reunions for past travelers"
          enabled={currentPreferences.emailAlumniEvents}
          onChange={(value) => handleToggle('emailAlumniEvents', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Marketing & Promotions"
        description="Deals, news, and updates about new trips"
      >
        <NotificationToggle
          id="emailMarketing"
          label="Marketing Emails"
          description="Special offers, new trip announcements, and exclusive deals"
          enabled={currentPreferences.emailMarketing}
          onChange={(value) => handleToggle('emailMarketing', value)}
        />
        <NotificationToggle
          id="emailNewsletter"
          label="Newsletter"
          description="Monthly newsletter with travel tips and destination guides"
          enabled={currentPreferences.emailNewsletter}
          onChange={(value) => handleToggle('emailNewsletter', value)}
        />
      </PreferenceCategory>

      <PreferenceCategory
        title="Channel Preferences"
        description="Choose how you want to be notified"
      >
        <NotificationToggle
          id="smsEnabled"
          label="SMS Notifications"
          description="Text message reminders about your upcoming trips"
          enabled={currentPreferences.smsEnabled}
          onChange={(value) => handleToggle('smsEnabled', value)}
        />
        <NotificationToggle
          id="inAppEnabled"
          label="In-App Notifications"
          description="Notifications within the Pickleball Passport app"
          enabled={currentPreferences.inAppEnabled}
          onChange={(value) => handleToggle('inAppEnabled', value)}
        />
        <NotificationToggle
          id="whatsappEnabled"
          label="WhatsApp Groups"
          description="Invitations to trip-specific WhatsApp groups"
          enabled={currentPreferences.whatsappEnabled}
          onChange={(value) => handleToggle('whatsappEnabled', value)}
        />
      </PreferenceCategory>

      <div className="flex items-center justify-between mt-8 pt-8 border-t">
        <Button
          variant="outline"
          onClick={handleUnsubscribeAll}
          disabled={unsubscribeAllMutation.isPending}
        >
          Unsubscribe from All
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
