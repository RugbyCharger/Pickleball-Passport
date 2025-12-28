/**
 * Admin Bulk Notifications Interface
 * A3-S3: Bulk Notifications (3 pts)
 *
 * Features:
 * - Send notifications to filtered user groups
 * - Target by role, booking status, or upcoming trips
 * - Optional email notifications
 * - Preview recipient count before sending
 * - Message templates
 */

'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Bell,
  Send,
  Loader2,
  Users,
  Mail,
  CheckCircle,
  AlertCircle,
  Filter,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type TargetAudience = 'ALL' | 'ROLE' | 'BOOKING_STATUS' | 'UPCOMING_TRIP' | 'CUSTOM';
type NotificationType = 'BOOKING_CONFIRMATION' | 'PAYMENT_RECEIPT' | 'TRIP_REMINDER' | 'GENERAL';

interface NotificationTemplate {
  name: string;
  type: NotificationType;
  title: string;
  content: string;
}

const MESSAGE_TEMPLATES: NotificationTemplate[] = [
  {
    name: 'Trip Update',
    type: 'TRIP_REMINDER',
    title: 'Important Trip Update',
    content: 'We have an important update regarding your upcoming trip. Please check your booking details.',
  },
  {
    name: 'Payment Reminder',
    type: 'PAYMENT_RECEIPT',
    title: 'Payment Reminder',
    content: 'This is a friendly reminder about your upcoming payment for your Pickleball Passport booking.',
  },
  {
    name: 'Welcome Message',
    type: 'GENERAL',
    title: 'Welcome to Pickleball Passport!',
    content: 'Thank you for joining Pickleball Passport! We\'re excited to have you as part of our community.',
  },
  {
    name: 'General Announcement',
    type: 'GENERAL',
    title: 'Announcement',
    content: 'We have an exciting announcement to share with our Pickleball Passport community!',
  },
];

export default function AdminNotificationsPage() {
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [role, setRole] = useState<'GUEST' | 'PARTNER' | 'ADMIN'>('GUEST');
  const [bookingStatus, setBookingStatus] = useState<'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'>('CONFIRMED');
  const [daysUntilTrip, setDaysUntilTrip] = useState(30);

  const [notificationType, setNotificationType] = useState<NotificationType>('GENERAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [sendEmailEnabled, setSendEmailEnabled] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');

  const [recipientCount, setRecipientCount] = useState(0);

  // Get user count based on current filters
  const { data: countData, refetch: refetchCount } = trpc.notification.adminGetUserCount.useQuery(
    {
      targetAudience,
      role: targetAudience === 'ROLE' ? role : undefined,
      bookingStatus: targetAudience === 'BOOKING_STATUS' ? bookingStatus : undefined,
      daysUntilTrip: targetAudience === 'UPCOMING_TRIP' ? daysUntilTrip : undefined,
    },
    {
      enabled: targetAudience !== 'CUSTOM',
    }
  );

  // Update recipient count when data changes
  useEffect(() => {
    if (countData?.count !== undefined) {
      setRecipientCount(countData.count);
    }
  }, [countData]);

  // Refetch count when filters change
  useEffect(() => {
    if (targetAudience !== 'CUSTOM') {
      refetchCount();
    }
  }, [targetAudience, role, bookingStatus, daysUntilTrip, refetchCount]);

  // Send bulk notification mutation
  const sendBulkMutation = trpc.notification.adminSendBulk.useMutation({
    onSuccess: (data) => {
      alert(`Successfully sent ${data.notificationsSent} notifications${data.emailsSent > 0 ? ` and ${data.emailsSent} emails` : ''}!`);
      // Reset form
      setTitle('');
      setContent('');
      setLinkUrl('');
      setLinkText('');
      setEmailSubject('');
    },
    onError: (error) => {
      alert(`Failed to send notifications: ${error.message}`);
    },
  });

  const handleApplyTemplate = (template: NotificationTemplate) => {
    setNotificationType(template.type);
    setTitle(template.title);
    setContent(template.content);
    if (sendEmailEnabled && !emailSubject) {
      setEmailSubject(template.title);
    }
  };

  const handleSend = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for the notification');
      return;
    }

    if (sendEmailEnabled && !emailSubject.trim()) {
      alert('Please provide an email subject when sending emails');
      return;
    }

    if (recipientCount === 0) {
      alert('No recipients match the selected criteria');
      return;
    }

    if (confirm(`Send notification to ${recipientCount} user(s)?${sendEmailEnabled ? ' This will also send emails.' : ''}`)) {
      sendBulkMutation.mutate({
        targetAudience,
        role: targetAudience === 'ROLE' ? role : undefined,
        bookingStatus: targetAudience === 'BOOKING_STATUS' ? bookingStatus : undefined,
        daysUntilTrip: targetAudience === 'UPCOMING_TRIP' ? daysUntilTrip : undefined,
        type: notificationType,
        title,
        content,
        linkUrl: linkUrl || undefined,
        linkText: linkText || undefined,
        sendEmail: sendEmailEnabled,
        emailSubject: sendEmailEnabled ? emailSubject : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bulk Notifications</h1>
          <p className="mt-2 text-slate-600">
            Send notifications to multiple users at once
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Configuration */}
          <div className="space-y-6 lg:col-span-2">
            {/* Target Audience */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Target Audience</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="ALL">All Users</option>
                    <option value="ROLE">By User Role</option>
                    <option value="BOOKING_STATUS">By Booking Status</option>
                    <option value="UPCOMING_TRIP">Users with Upcoming Trips</option>
                  </select>
                </div>

                {targetAudience === 'ROLE' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      User Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="GUEST">Guests</option>
                      <option value="PARTNER">Partners</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                )}

                {targetAudience === 'BOOKING_STATUS' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Booking Status
                    </label>
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="DRAFT">Draft Bookings</option>
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                      <option value="CONFIRMED">Confirmed Bookings</option>
                      <option value="CANCELLED">Cancelled Bookings</option>
                      <option value="COMPLETED">Completed Trips</option>
                    </select>
                  </div>
                )}

                {targetAudience === 'UPCOMING_TRIP' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Days Until Trip (0-365)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={daysUntilTrip}
                      onChange={(e) => setDaysUntilTrip(parseInt(e.target.value) || 0)}
                      placeholder="30"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Users with trips starting within the next {daysUntilTrip} days
                    </p>
                  </div>
                )}

                {/* Recipient Count */}
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-900">Recipients</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">{recipientCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Message Content</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="GENERAL">General</option>
                    <option value="TRIP_REMINDER">Trip Reminder</option>
                    <option value="PAYMENT_RECEIPT">Payment</option>
                    <option value="BOOKING_CONFIRMATION">Booking</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Content
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Notification message"
                    rows={6}
                    maxLength={2000}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {content.length}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Link URL (Optional)
                  </label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                {linkUrl && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Link Text
                    </label>
                    <Input
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="View Details"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Email Options */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Email Notification</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmailEnabled}
                    onChange={(e) => setSendEmailEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  />
                  <label htmlFor="sendEmail" className="text-sm font-medium text-slate-700">
                    Also send as email
                  </label>
                </div>

                {sendEmailEnabled && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Subject
                    </label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject line"
                      maxLength={200}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={sendBulkMutation.isPending || recipientCount === 0 || !title || !content}
              className="w-full gap-2 py-6 text-lg"
              size="lg"
            >
              {sendBulkMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send to {recipientCount} User{recipientCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Templates */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Message Templates</h3>
              <div className="space-y-3">
                {MESSAGE_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleApplyTemplate(template)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    <div className="font-medium text-slate-900">{template.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{template.type}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Tips</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Preview recipient count before sending</li>
                    <li>• Use templates for common messages</li>
                    <li>• Email notifications are optional</li>
                    <li>• In-app notifications are always sent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
