/**
 * Admin Trip Reminders Interface
 * A3-S2: Scheduled Trip Reminders (3 pts)
 *
 * Features:
 * - View upcoming trips requiring reminders (30/7/1 day)
 * - Manual trigger for reminders
 * - Track sent reminders to avoid duplicates
 * - View reminder history per booking
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Bell,
  Calendar,
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  Mail,
  Clock,
  User,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time ago
 */
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

export default function AdminRemindersPage() {
  const [selectedTab, setSelectedTab] = useState<'30_DAY' | '7_DAY' | '1_DAY'>('7_DAY');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Fetch upcoming trips
  const { data: reminders, isLoading, refetch } = trpc.reminder.getUpcomingTrips.useQuery();

  // Send single reminder mutation
  const sendReminderMutation = trpc.reminder.sendReminder.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Send bulk reminders mutation
  const sendBulkMutation = trpc.reminder.sendBulkReminders.useMutation({
    onSuccess: (result) => {
      refetch();
      const message = `Sent ${result.successful.length} reminders successfully. ${result.failed.length} failed.`;
      alert(message);
    },
  });

  const handleSendReminder = async (bookingId: string, reminderType: '30_DAY' | '7_DAY' | '1_DAY') => {
    if (confirm('Are you sure you want to send this reminder email?')) {
      try {
        await sendReminderMutation.mutateAsync({
          bookingId,
          reminderType,
        });
        alert('Reminder sent successfully!');
      } catch (error: any) {
        console.error('Failed to send reminder:', error);
        alert(error.message || 'Failed to send reminder');
      }
    }
  };

  const handleSendBulk = async (reminderType: '30_DAY' | '7_DAY' | '1_DAY') => {
    const bookings = getBookingsForTab(reminderType);
    if (!bookings || bookings.length === 0) {
      alert('No bookings to send reminders for');
      return;
    }

    if (confirm(`Send ${reminderType.replace('_', '-').toLowerCase()} reminders to ${bookings.length} guest(s)?`)) {
      try {
        await sendBulkMutation.mutateAsync({
          reminderType,
          bookingIds: bookings.map(b => b.id),
        });
      } catch (error: any) {
        console.error('Failed to send bulk reminders:', error);
        alert(error.message || 'Failed to send bulk reminders');
      }
    }
  };

  const getBookingsForTab = (tab: '30_DAY' | '7_DAY' | '1_DAY') => {
    if (!reminders) return [];
    switch (tab) {
      case '30_DAY':
        return reminders.thirtyDay;
      case '7_DAY':
        return reminders.sevenDay;
      case '1_DAY':
        return reminders.oneDay;
    }
  };

  const currentBookings = getBookingsForTab(selectedTab);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Trip Reminders</h1>
              <p className="mt-2 text-slate-600">
                Send automated reminders to guests before their trips
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-600">
                {(reminders?.thirtyDay.length || 0) + (reminders?.sevenDay.length || 0) + (reminders?.oneDay.length || 0)} pending
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setSelectedTab('30_DAY')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              selectedTab === '30_DAY'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            30-Day Reminders
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {reminders?.thirtyDay.length || 0}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('7_DAY')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              selectedTab === '7_DAY'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            7-Day Reminders
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {reminders?.sevenDay.length || 0}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('1_DAY')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              selectedTab === '1_DAY'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            )}
          >
            1-Day Reminders
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
              {reminders?.oneDay.length || 0}
            </span>
          </button>
        </div>

        {/* Bulk Actions */}
        {currentBookings.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">
                  {currentBookings.length} reminder{currentBookings.length !== 1 ? 's' : ''} ready to send
                </span>
              </div>
              <Button
                onClick={() => handleSendBulk(selectedTab)}
                disabled={sendBulkMutation.isPending}
                className="gap-2"
              >
                {sendBulkMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send All {selectedTab.replace('_', '-').toLowerCase()} Reminders
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {currentBookings.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No reminders pending
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              All {selectedTab.replace('_', '-').toLowerCase()} reminders have been sent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking) => {
              const isExpanded = expandedBooking === booking.id;
              const hasSentReminders = booking.reminderHistory.length > 0;

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Booking Reference */}
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-emerald-100 px-2 py-1 text-sm font-mono font-semibold text-emerald-700">
                            {booking.bookingReference}
                          </span>
                          {hasSentReminders && (
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              {booking.reminderHistory.length} reminder{booking.reminderHistory.length !== 1 ? 's' : ''} sent
                            </span>
                          )}
                        </div>

                        {/* Guest Info */}
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{booking.user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.trip ? formatDate(booking.trip.startDate) : 'No trip assigned'}</span>
                          </div>
                          {booking.trip && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{booking.trip.destination}</span>
                            </div>
                          )}
                        </div>

                        {/* Package Info */}
                        <div className="mt-2 text-sm text-slate-900">
                          <strong>{booking.package.name}</strong> - {booking.accommodationTier}
                        </div>

                        {/* Add-ons */}
                        {booking.bookingAddOns.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {booking.bookingAddOns.map((ba) => (
                              <span
                                key={ba.id}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                              >
                                {ba.quantity > 1 ? `${ba.quantity}x ` : ''}{ba.addOn.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {booking.reminderHistory.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          >
                            {isExpanded ? 'Hide' : 'View'} History
                          </Button>
                        )}
                        <Button
                          onClick={() => handleSendReminder(booking.id, selectedTab)}
                          disabled={sendReminderMutation.isPending}
                          size="sm"
                          className="gap-2"
                        >
                          {sendReminderMutation.isPending ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3" />
                              Send Reminder
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Reminder History */}
                    {isExpanded && booking.reminderHistory.length > 0 && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <h4 className="mb-3 text-sm font-semibold text-slate-900">
                          Reminder History
                        </h4>
                        <div className="space-y-2">
                          {booking.reminderHistory.map((reminder) => (
                            <div
                              key={reminder.id}
                              className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-900">
                                  {reminder.reminderType.replace('_', '-')} Reminder
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-3 w-3" />
                                <span>{timeAgo(reminder.sentAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">How Trip Reminders Work</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• <strong>30-Day:</strong> Sent 28-30 days before trip - General preparation checklist</li>
                <li>• <strong>7-Day:</strong> Sent 6-7 days before trip - Final preparations and packing tips</li>
                <li>• <strong>1-Day:</strong> Sent 0-1 days before trip - Last-minute reminders and arrival info</li>
                <li>• Each reminder is tracked to prevent duplicates</li>
                <li>• Emails include trip details, add-ons, and preparation checklists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
