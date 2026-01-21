/**
 * Admin Partner Support Ticket Detail Page
 * E9-S16: Partner Support Ticketing System (Admin View)
 *
 * Features:
 * - Full conversation thread
 * - Reply to ticket
 * - Update ticket status
 * - Partner information panel
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Headphones,
  Building2,
  Mail,
  MapPin,
  Award,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-slate-200 text-slate-700',
  GOLD: 'bg-amber-100 text-amber-700',
  PLATINUM: 'bg-cyan-100 text-cyan-700',
};

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

export default function AdminPartnerTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [replyMessage, setReplyMessage] = useState('');

  // Query ticket
  const { data: ticket, isLoading, error, refetch } = trpc.admin.getPartnerTicket.useQuery({ id: ticketId });

  // Reply mutation
  const replyMutation = trpc.admin.replyToPartnerTicket.useMutation({
    onSuccess: () => {
      toast.success('Reply sent successfully');
      setReplyMessage('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reply');
    },
  });

  // Status update mutation
  const statusMutation = trpc.admin.updatePartnerTicketStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate({ ticketId, message: replyMessage });
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    statusMutation.mutate({ ticketId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error?.message || 'Ticket not found'}
          </p>
          <Button onClick={() => router.push('/dashboard/admin/partner-tickets')}>
            Back to Partner Tickets
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                Admin Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link href="/dashboard/admin/partner-tickets" className="text-slate-600 hover:text-slate-900">
                Partner Support
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Ticket</li>
          </ol>
        </nav>

        {/* Back Button */}
        <Link
          href="/dashboard/admin/partner-tickets"
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Partner Tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn(
                      'h-6 w-6',
                      ticket.status === 'OPEN' && 'text-amber-600',
                      ticket.status === 'IN_PROGRESS' && 'text-blue-600',
                      ticket.status === 'RESOLVED' && 'text-emerald-600',
                      ticket.status === 'CLOSED' && 'text-slate-400',
                    )} />
                    <h1 className="text-xl font-semibold text-slate-900">
                      {ticket.subject}
                    </h1>
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                      PRIORITY_COLORS[ticket.priority]
                    )}
                  >
                    {ticket.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_COLORS[ticket.status]
                    )}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span>
                    Created {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Status Update */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-600">Update status:</span>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant={ticket.status === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(option.value)}
                        disabled={statusMutation.isPending || ticket.status === option.value}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Original Description */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Original Request</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-medium text-slate-900">
                  Conversation ({ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'})
                </h2>
              </div>

              {ticket.replies.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {ticket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        'p-6',
                        reply.isStaff ? 'bg-emerald-50/50' : 'bg-white'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex-shrink-0 rounded-full p-2',
                            reply.isStaff ? 'bg-emerald-100' : 'bg-slate-100'
                          )}
                        >
                          {reply.isStaff ? (
                            <Headphones className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Building2 className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-900">
                              {reply.isStaff ? 'Support Team' : ticket.partner.clubName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  <p>No replies yet.</p>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {ticket.status !== 'CLOSED' && (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="font-medium text-slate-900">Reply as Support</h2>
                </div>
                <form onSubmit={handleSubmitReply} className="p-6">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to the partner..."
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    maxLength={5000}
                    disabled={replyMutation.isPending}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {replyMessage.length}/5000 characters
                    </span>
                    <Button
                      type="submit"
                      disabled={replyMutation.isPending || !replyMessage.trim()}
                      className="gap-2"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Reply
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Partner will receive an email notification when you reply.
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar - Partner Info */}
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-medium text-slate-900">Partner Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{ticket.partner.clubName}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      TIER_COLORS[ticket.partner.tier]
                    )}>
                      {ticket.partner.tier} Partner
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <p className="text-slate-600">{ticket.partner.clubLocation}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <a
                    href={`mailto:${ticket.partner.user.email}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {ticket.partner.user.email}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-slate-400" />
                  <p className="text-slate-600 font-mono text-sm">
                    {ticket.partner.referralCode}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/dashboard/admin/guests?search=${encodeURIComponent(ticket.partner.user.email)}`}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    View partner profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Ticket Timeline */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="font-medium text-slate-900">Timeline</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-slate-300" />
                    <div>
                      <p className="text-slate-900">Ticket created</p>
                      <p className="text-slate-500">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-slate-900">Ticket resolved</p>
                        <p className="text-slate-500">
                          {new Date(ticket.resolvedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-slate-900">Last updated</p>
                      <p className="text-slate-500">
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
