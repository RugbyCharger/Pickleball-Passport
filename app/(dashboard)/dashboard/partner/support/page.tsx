/**
 * Partner Support Tickets Page
 * E9-S16: Partner Support Ticketing System
 *
 * Features:
 * - Ticket list with status, priority, and last reply
 * - Create new ticket form
 * - Filter by status
 * - Click to view full conversation
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Tickets' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-700',
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

export default function PartnerSupportPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 20;

  // Create ticket modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM' as Priority,
  });

  // Query tickets
  const { data, isLoading, error, refetch } = trpc.partner.getTickets.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    limit,
    offset: page * limit,
  });

  // Create ticket mutation
  const createTicket = trpc.partner.createTicket.useMutation({
    onSuccess: () => {
      toast.success('Support ticket created successfully');
      setShowCreateModal(false);
      setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create ticket');
    },
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(newTicket);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading tickets: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Support</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
            <p className="mt-1 text-slate-600">
              Get help from our partner support team
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(0);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {data && (
            <span className="text-sm text-slate-600">
              {data.total} ticket{data.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Ticket List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : data?.tickets && data.tickets.length > 0 ? (
            <>
              <div className="divide-y divide-slate-200">
                {data.tickets.map((ticket: typeof data.tickets[number]) => {
                  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
                  return (
                    <Link
                      key={ticket.id}
                      href={`/dashboard/partner/support/${ticket.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className={cn(
                              'h-4 w-4 flex-shrink-0',
                              ticket.status === 'OPEN' && 'text-amber-600',
                              ticket.status === 'IN_PROGRESS' && 'text-blue-600',
                              ticket.status === 'RESOLVED' && 'text-emerald-600',
                              ticket.status === 'CLOSED' && 'text-slate-400',
                            )} />
                            <h3 className="font-medium text-slate-900 truncate">
                              {ticket.subject}
                            </h3>
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
                              {ticket.priority}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {ticket.replyCount} replies
                            </span>
                            <span>
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {ticket.lastReply && (
                          <div className="text-right text-xs text-slate-500">
                            <p>Last reply</p>
                            <p className="font-medium">
                              {new Date(ticket.lastReply.createdAt).toLocaleDateString()}
                            </p>
                            {ticket.lastReply.isStaff && (
                              <span className="text-emerald-600">From Staff</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {data.total > limit && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <div className="text-sm text-slate-600">
                    Showing {page * limit + 1} to{' '}
                    {Math.min((page + 1) * limit, data.total)} of {data.total}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!data.hasMore}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No tickets found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {statusFilter !== 'ALL'
                  ? 'Try adjusting your filter'
                  : "Need help? Create a support ticket and we'll get back to you."}
              </p>
              {statusFilter === 'ALL' && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Create Support Ticket</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-full p-1 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value as Priority })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="LOW">Low - General question</option>
                    <option value="MEDIUM">Medium - Need help soon</option>
                    <option value="HIGH">High - Urgent issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Please describe your issue in detail..."
                    rows={5}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    maxLength={5000}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {newTicket.description.length}/5000 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTicket.isPending || !newTicket.subject || !newTicket.description}
                  >
                    {createTicket.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Ticket'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
