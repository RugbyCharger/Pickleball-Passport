/**
 * Admin Partner Support Tickets Page
 * E9-S16: Partner Support Ticketing System (Admin View)
 *
 * Features:
 * - View all partner support tickets
 * - Filter by status, priority
 * - Reply to tickets
 * - Update ticket status
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type PriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
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

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-slate-200 text-slate-700',
  GOLD: 'bg-amber-100 text-amber-700',
  PLATINUM: 'bg-cyan-100 text-cyan-700',
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

export default function AdminPartnerTicketsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 50;

  // Query tickets
  const { data, isLoading, error } = trpc.admin.getPartnerTickets.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
    limit,
    offset: page * limit,
  });

  // Query stats
  const { data: stats } = trpc.admin.getPartnerTicketStats.useQuery();

  const hasActiveFilters = statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setPage(0);
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                Admin Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Partner Support</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Partner Support Tickets</h1>
          <p className="mt-1 text-slate-600">
            Manage support requests from partner facilities
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Open</p>
              <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
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

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as PriorityFilter);
                  setPage(0);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing filtered results
                {statusFilter !== 'ALL' && ` • Status: ${statusFilter.replace('_', ' ')}`}
                {priorityFilter !== 'ALL' && ` • Priority: ${priorityFilter}`}
              </span>
            </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Ticket</th>
                      <th className="px-6 py-3">Partner</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Replies</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.tickets.map((ticket: typeof data.tickets[number]) => {
                      const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
                      const needsAttention = ticket.status === 'OPEN' ||
                        (ticket.lastReply && !ticket.lastReply.isStaff && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED');

                      return (
                        <tr
                          key={ticket.id}
                          className={cn(
                            'hover:bg-slate-50 cursor-pointer',
                            needsAttention && 'bg-amber-50/50'
                          )}
                          onClick={() => window.location.href = `/dashboard/admin/partner-tickets/${ticket.id}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <StatusIcon className={cn(
                                'mt-0.5 h-4 w-4 flex-shrink-0',
                                ticket.status === 'OPEN' && 'text-amber-600',
                                ticket.status === 'IN_PROGRESS' && 'text-blue-600',
                                ticket.status === 'RESOLVED' && 'text-emerald-600',
                                ticket.status === 'CLOSED' && 'text-slate-400',
                              )} />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate max-w-xs">
                                  {ticket.subject}
                                </p>
                                {needsAttention && (
                                  <p className="text-xs text-amber-600 font-medium">
                                    Needs attention
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {ticket.partner.clubName}
                                </p>
                                <span className={cn(
                                  'text-xs px-1.5 py-0.5 rounded',
                                  TIER_COLORS[ticket.partner.tier]
                                )}>
                                  {ticket.partner.tier}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                STATUS_COLORS[ticket.status]
                              )}
                            >
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                PRIORITY_COLORS[ticket.priority]
                              )}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <MessageSquare className="h-4 w-4" />
                              {ticket.replyCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {ticket.lastReply ? (
                              <div>
                                <p>{new Date(ticket.lastReply.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs">
                                  {ticket.lastReply.isStaff ? 'Staff' : 'Partner'}
                                </p>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.total > limit && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
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
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'No partner support tickets have been submitted yet.'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
