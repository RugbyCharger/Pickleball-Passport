'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { NotificationToggle } from '@/components/settings/notification-toggle';
import { PreferenceCategory } from '@/components/settings/preference-category';
import { toast } from 'sonner';
import type { NotificationPreferences } from '@/lib/preferences/user-preferences';

export default function PublicPreferencesPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [email, setEmail] = useState<string>('');

  const { data, isLoading, error } = trpc.preferences.getPreferencesByToken.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  const updateMutation = trpc.preferences.updatePreferencesByToken.useMutation();
  const unsubscribeAllMutation = trpc.preferences.unsubscribeAllByToken.useMutation();

  useEffect(() => {
    if (data) {
      setEmail(data.email || '');
    }
  }, [data]);

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-gray-600 mt-4">
          This preference management link is invalid. Please use the link from your email.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">Loading preferences...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Invalid or Expired Token</h1>
        <p className="text-gray-600 mt-4">
          This preference management link has expired or is invalid. Links expire after 90 days.
        </p>
        <p className="text-gray-600 mt-4">
          Please log in to your account to manage your preferences, or contact support for
          assistance.
        </p>
      </div>
    );
  }

  const currentPreferences = localPreferences || data.preferences;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalPreferences({
      ...currentPreferences,
      [key]: value,
    });
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      await updateMutation.mutateAsync({ token, updates: localPreferences });
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
      await unsubscribeAllMutation.mutateAsync({ token });
      toast.success('Unsubscribed from all notifications');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to unsubscribe');
    }
  };

  const hasChanges = localPreferences !== null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Your Preferences</h1>
        <p className="text-gray-600 mt-2">Email: {email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Choose which communications you'd like to receive from The Pickleball Passport.
        </p>
      </div>

      {/* Same categories as authenticated page */}
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
          description="Notifications within The Pickleball Passport app"
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

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This link expires 90 days from when it was generated.
          For ongoing preference management, please log in to your account.
        </p>
      </div>
    </div>
  );
}
