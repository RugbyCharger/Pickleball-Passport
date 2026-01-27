'use client';

/**
 * Notifications Center
 * E5-S7: Notifications Center (3 pts)
 *
 * Features:
 * - Notification history display
 * - Mark as read functionality
 * - Link to notification preferences in settings
 */

import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { Check, Trash2, Calendar, CreditCard, Plane, Info, Bell, MousePointer, FileText, Award, TrendingUp, DollarSign, Settings } from 'lucide-react';
import type { ComponentType } from 'react';
import { NotificationType } from '@prisma/client';

type NotificationIcon = ComponentType<{ className?: string }>;

const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: NotificationIcon; color: string }
> = {
  BOOKING_CONFIRMATION: {
    label: 'Booking Confirmation',
    icon: Calendar,
    color: 'text-blue-600 bg-blue-50',
  },
  PAYMENT_RECEIPT: {
    label: 'Payment Receipt',
    icon: CreditCard,
    color: 'text-green-600 bg-green-50',
  },
  TRIP_REMINDER: {
    label: 'Trip Reminder',
    icon: Plane,
    color: 'text-purple-600 bg-purple-50',
  },
  GENERAL: {
    label: 'General',
    icon: Info,
    color: 'text-gray-600 bg-gray-50',
  },
  REFERRAL_CLICK: {
    label: 'Referral Click',
    icon: MousePointer,
    color: 'text-emerald-600 bg-emerald-50',
  },
  REFERRAL_APPLICATION: {
    label: 'Referral Application',
    icon: FileText,
    color: 'text-emerald-600 bg-emerald-50',
  },
  REFERRAL_BOOKING: {
    label: 'Referral Booking',
    icon: Calendar,
    color: 'text-emerald-600 bg-emerald-50',
  },
  POINTS_EARNED: {
    label: 'Points Earned',
    icon: Award,
    color: 'text-amber-600 bg-amber-50',
  },
  TIER_CHANGE: {
    label: 'Tier Change',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50',
  },
  COMMISSION_AVAILABLE: {
    label: 'Commission Available',
    icon: DollarSign,
    color: 'text-green-600 bg-green-50',
  },
};

export default function NotificationsPage() {
  // tRPC queries
  const { data: notifications = [], refetch } = trpc.notification.list.useQuery({
    unreadOnly: false,
  });
  const { data: counts } = trpc.notification.getCounts.useQuery();

  // tRPC mutations
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteNotification = trpc.notification.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;

    try {
      await deleteNotification.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(date).getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">
            View and manage your notification history
          </p>
        </div>
        <Link
          href="/settings/notifications"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Manage Preferences
        </Link>
      </div>

      {/* Stats */}
      {counts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Notifications</div>
            <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-sm text-blue-800">Unread</div>
            <div className="text-2xl font-bold text-blue-900">{counts.unread}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-800">Read</div>
            <div className="text-2xl font-bold text-green-900">{counts.read}</div>
          </div>
        </div>
      )}

      {/* Notification History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Notification History
            </h2>
            {counts && counts.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ll see booking confirmations, trip reminders, and updates here
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const TypeIcon = NOTIFICATION_TYPE_CONFIG[notification.type].icon;
              const isUnread = !notification.readAt;

              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isUnread ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${NOTIFICATION_TYPE_CONFIG[notification.type].color}`}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {notification.title}
                            {isUnread && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                            {notification.content}
                          </p>
                          {notification.linkUrl && (
                            <a
                              href={notification.linkUrl}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                            >
                              {notification.linkText || 'View details'} →
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{NOTIFICATION_TYPE_CONFIG[notification.type].label}</span>
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
