/**
 * Partner Support Ticket Detail Page
 * E9-S16: Partner Support Ticketing System
 *
 * Features:
 * - Full conversation thread
 * - Reply to ticket
 * - Reopen resolved tickets (within 7 days)
 * - Status indicators
 */

'use client';

import { useState, useMemo } from 'react';
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
  RefreshCw,
  User,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

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

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

export default function PartnerTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [replyMessage, setReplyMessage] = useState('');

  // Query ticket
  const { data: ticket, isLoading, error, refetch } = trpc.partner.getTicket.useQuery({ id: ticketId });

  // Reply mutation
  const replyMutation = trpc.partner.replyToTicket.useMutation({
    onSuccess: () => {
      toast.success('Reply sent successfully');
      setReplyMessage('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reply');
    },
  });

  // Reopen mutation
  const reopenMutation = trpc.partner.reopenTicket.useMutation({
    onSuccess: () => {
      toast.success('Ticket reopened successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reopen ticket');
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    replyMutation.mutate({ ticketId, message: replyMessage });
  };

  const handleReopen = () => {
    reopenMutation.mutate({ ticketId });
  };

  // Check if can reopen (within 7 days of resolution)
  const canReopen = useMemo(() => {
    if (ticket?.status !== 'RESOLVED' || !ticket?.resolvedAt) {
      return false;
    }
    const daysSinceResolution = Math.floor(
      (new Date().getTime() - new Date(ticket.resolvedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceResolution <= 7;
  }, [ticket]);

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
          <Button onClick={() => router.push('/dashboard/partner/support')}>
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link href="/dashboard/partner/support" className="text-slate-600 hover:text-slate-900">
                Support
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Ticket</li>
          </ol>
        </nav>

        {/* Back Button */}
        <Link
          href="/dashboard/partner/support"
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Support
        </Link>

        {/* Ticket Header */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon className={cn(
                    'h-5 w-5',
                    ticket.status === 'OPEN' && 'text-amber-600',
                    ticket.status === 'IN_PROGRESS' && 'text-blue-600',
                    ticket.status === 'RESOLVED' && 'text-emerald-600',
                    ticket.status === 'CLOSED' && 'text-slate-400',
                  )} />
                  <h1 className="text-xl font-semibold text-slate-900">
                    {ticket.subject}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_COLORS[ticket.status]
                    )}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      PRIORITY_COLORS[ticket.priority]
                    )}
                  >
                    {ticket.priority} Priority
                  </span>
                  <span>
                    Created {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {canReopen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReopen}
                  disabled={reopenMutation.isPending}
                  className="gap-2"
                >
                  {reopenMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Reopen Ticket
                </Button>
              )}
            </div>

            {/* Original Description */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Original Request</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm mb-6">
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
                    reply.isStaff ? 'bg-slate-50' : 'bg-white'
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
                        <User className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900">
                          {reply.isStaff ? 'Support Team' : 'You'}
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
              <p>No replies yet. Our team will respond as soon as possible.</p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' && (
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-medium text-slate-900">Reply</h2>
            </div>
            <form onSubmit={handleSubmitReply} className="p-6">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
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
            </form>
          </div>
        )}

        {ticket.status === 'CLOSED' && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-600">
              This ticket is closed. If you have a new issue, please{' '}
              <Link href="/dashboard/partner/support" className="text-emerald-600 hover:underline">
                create a new ticket
              </Link>.
            </p>
          </div>
        )}

        {ticket.status === 'RESOLVED' && !canReopen && (
          <div className="rounded-lg border border-slate-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-emerald-700">
              This ticket has been resolved. The reopen window has expired.
              If you have a new issue, please{' '}
              <Link href="/dashboard/partner/support" className="text-emerald-600 hover:underline font-medium">
                create a new ticket
              </Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
