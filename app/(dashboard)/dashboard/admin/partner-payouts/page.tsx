/**
 * Admin Partner Payouts Page
 * E4-S14: Stripe Connect Partner Payouts
 *
 * Features:
 * - View all partner payout requests
 * - Filter by status
 * - Process payouts via Stripe Connect
 * - Show Stripe Connect status for each partner
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-700',
};

const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  PENDING: Clock,
  PROCESSING: Loader2,
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  CANCELLED: XCircle,
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-orange-100 text-orange-700',
  SILVER: 'bg-slate-200 text-slate-700',
  GOLD: 'bg-amber-100 text-amber-700',
  PLATINUM: 'bg-cyan-100 text-cyan-700',
};

const PAYOUT_METHOD_LABELS: Record<string, string> = {
  stripe_connect: 'Stripe Connect',
  manual: 'Manual',
};

export default function AdminPartnerPayoutsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 50;

  // Track which payout is being processed
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  // Query payouts
  const { data, isLoading, error, refetch } = trpc.admin.getPartnerPayouts.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    limit,
    offset: page * limit,
  });

  // Query stats
  const { data: stats } = trpc.admin.getPartnerPayoutStats.useQuery();

  // Process payout mutation
  const processPayoutMutation = trpc.admin.processStripeConnectPayout.useMutation({
    onSuccess: (result) => {
      toast.success(`Payout processed successfully! Transfer ID: ${result.transfer.id}`);
      setProcessingPayoutId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to process payout: ${error.message}`);
      setProcessingPayoutId(null);
    },
  });

  const hasActiveFilters = statusFilter !== 'ALL';

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setPage(0);
  };

  const handleProcessPayout = (payoutId: string) => {
    setProcessingPayoutId(payoutId);
    processPayoutMutation.mutate({ payoutId });
  };

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInCents / 100);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading payouts: {error.message}</p>
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
            <li className="font-medium text-slate-900">Partner Payouts</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Partner Payouts</h1>
          <p className="mt-1 text-slate-600">
            Manage and process partner payout requests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
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
                Showing filtered results - Status: {statusFilter}
              </span>
            </div>
          )}
        </div>

        {/* Payout List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : data?.payouts && data.payouts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Partner</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Points</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Transfer ID</th>
                      <th className="px-6 py-3">Requested</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.payouts.map((payout) => {
                      const StatusIcon = STATUS_ICONS[payout.status] || AlertCircle;
                      const canProcessViaStripe =
                        payout.status === 'PENDING' &&
                        payout.partner.stripeConnectAccountId &&
                        payout.partner.stripeConnectPayoutsEnabled;
                      const isProcessing = processingPayoutId === payout.id;

                      // Determine why Stripe processing is disabled
                      let disabledReason = '';
                      if (payout.status !== 'PENDING') {
                        disabledReason = `Cannot process: status is ${payout.status}`;
                      } else if (!payout.partner.stripeConnectAccountId) {
                        disabledReason = 'Partner has not connected a Stripe account';
                      } else if (!payout.partner.stripeConnectPayoutsEnabled) {
                        disabledReason = 'Partner has not completed Stripe onboarding';
                      }

                      return (
                        <tr key={payout.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {payout.partner.clubName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'text-xs px-1.5 py-0.5 rounded',
                                      TIER_COLORS[payout.partner.tier]
                                    )}
                                  >
                                    {payout.partner.tier}
                                  </span>
                                  {payout.partner.stripeConnectPayoutsEnabled && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      Stripe
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <span className="font-medium text-slate-900">
                                {formatCurrency(payout.amountInCents)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {payout.pointsRedeemed.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                                STATUS_COLORS[payout.status]
                              )}
                            >
                              <StatusIcon
                                className={cn(
                                  'h-3 w-3',
                                  payout.status === 'PROCESSING' && 'animate-spin'
                                )}
                              />
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {payout.payoutMethod
                              ? PAYOUT_METHOD_LABELS[payout.payoutMethod] || payout.payoutMethod
                              : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {payout.stripeTransferId ? (
                              <span className="font-mono text-xs text-slate-600">
                                {payout.stripeTransferId}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(payout.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {payout.status === 'PENDING' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleProcessPayout(payout.id)}
                                        disabled={!canProcessViaStripe || isProcessing}
                                        className="bg-[#635BFF] hover:bg-[#5851DB] disabled:bg-slate-300 disabled:cursor-not-allowed"
                                      >
                                        {isProcessing ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Process via Stripe
                                          </>
                                        )}
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!canProcessViaStripe && disabledReason && (
                                    <TooltipContent>
                                      <p>{disabledReason}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {payout.status === 'FAILED' && payout.stripeError && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs text-red-600 cursor-help underline decoration-dotted">
                                      View Error
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{payout.stripeError}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {payout.status === 'COMPLETED' && payout.stripeTransferId && (
                              <a
                                href={`https://dashboard.stripe.com/connect/transfers/${payout.stripeTransferId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                View in Stripe
                                <ExternalLink className="h-3 w-3" />
                              </a>
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
              <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No payouts found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'No partner payout requests have been submitted yet.'}
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
