/**
 * Partner Points Page
 * E9-S3: Points Balance & Transactions
 *
 * Features:
 * - Current points balance display
 * - Lifetime earned/redeemed summary
 * - Transaction history with filtering
 * - Link to redemption catalog
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Award,
  Loader2,
  TrendingUp,
  TrendingDown,
  Gift,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type TransactionFilter = 'ALL' | 'EARNED' | 'REDEEMED';

const FILTER_OPTIONS: { value: TransactionFilter; label: string }[] = [
  { value: 'ALL', label: 'All Transactions' },
  { value: 'EARNED', label: 'Earned' },
  { value: 'REDEEMED', label: 'Redeemed' },
];

export default function PartnerPointsPage() {
  const [filter, setFilter] = useState<TransactionFilter>('ALL');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: balance, isLoading: balanceLoading } =
    trpc.partner.getPointsBalance.useQuery();
  const { data: transactionsData, isLoading: transactionsLoading } =
    trpc.partner.getPointsTransactions.useQuery({
      limit,
      offset: page * limit,
      filter,
    });

  const isLoading = balanceLoading || transactionsLoading;

  if (isLoading && !balance && !transactionsData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Points</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Passport Points</h1>
          <p className="mt-1 text-slate-600">
            Track your points balance and transaction history
          </p>
        </div>

        {/* Points Balance Card */}
        <div className="mb-6 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Current Balance</p>
              <p className="mt-2 text-5xl font-bold text-emerald-900">
                {balance?.currentBalance.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-sm text-emerald-600">points</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-6">
              <Award className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white/60 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium text-slate-700">Lifetime Earned</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {balance?.lifetimeEarned.toLocaleString() || 0}
              </p>
            </div>
            <div className="rounded-lg bg-white/60 p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-slate-700">Lifetime Redeemed</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {balance?.lifetimeRedeemed.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Redeem Button */}
          {balance && balance.currentBalance > 0 && (
            <div className="mt-6">
              <Link href="/dashboard/partner/rewards">
                <Button className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Gift className="h-4 w-4" />
                  Redeem Points
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as TransactionFilter);
                    setPage(0);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Points</th>
                      <th className="px-6 py-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactionsData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {transaction.description}
                            </p>
                            {transaction.bookingReference && (
                              <p className="text-xs text-slate-500">
                                {transaction.bookingReference}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={cn(
                              'font-semibold',
                              transaction.type === 'EARNED'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            )}
                          >
                            {transaction.type === 'EARNED' ? '+' : '-'}
                            {transaction.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                          {transaction.balanceAfter.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {transactionsData.pagination.total > limit && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {page * limit + 1} to{' '}
                    {Math.min((page + 1) * limit, transactionsData.pagination.total)} of{' '}
                    {transactionsData.pagination.total} transactions
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
                    <span className="px-3 text-sm text-slate-600">
                      Page {page + 1} of{' '}
                      {Math.ceil(transactionsData.pagination.total / limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!transactionsData.pagination.hasMore}
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
              <Award className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No transactions yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                {filter !== 'ALL'
                  ? 'No transactions match your filter'
                  : 'Start earning points by referring guests!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
