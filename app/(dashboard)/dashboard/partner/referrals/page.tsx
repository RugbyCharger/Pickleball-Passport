/**
 * Partner Referrals Page
 * E9-S2: Referral Tracking Table
 *
 * Features:
 * - Full referrals table with all columns
 * - Filtering by status and date range
 * - Sorting by date, points, value
 * - Pagination
 * - Referral details modal
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Users,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Filter,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type SortBy = 'date' | 'points' | 'value';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

interface ReferralDetails {
  id: string;
  bookingId: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestFirstName: string | null;
  guestLastName: string | null;
  packageName: string;
  packageDescription: string | null;
  status: string;
  totalPrice: number;
  pointsEarned: number;
  isRedeemed: boolean;
  createdAt: Date;
  bookingCreatedAt: Date;
  tripStartDate: Date | null;
  tripEndDate: Date | null;
  tripDestination: string | null;
}

export default function PartnerReferralsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Sort state
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modal state
  const [selectedReferral, setSelectedReferral] = useState<ReferralDetails | null>(null);

  // Build query input
  const queryInput = {
    limit,
    offset: page * limit,
    statusFilter: statusFilter as StatusFilter,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo + 'T23:59:59') : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error } = trpc.partner.getMyReferrals.useQuery(queryInput);

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(0); // Reset to first page on sort change
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const hasActiveFilters = statusFilter !== 'ALL' || dateFrom || dateTo;

  const SortIcon = ({ column }: { column: SortBy }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 text-emerald-600" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-emerald-600" />
    );
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading referrals: {error.message}</p>
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
            <li className="font-medium text-slate-900">Referrals</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Referrals</h1>
            <p className="mt-1 text-slate-600">
              Track all your referrals and their booking status
            </p>
          </div>
          {data?.pagination && (
            <div className="text-sm text-slate-600">
              {data.pagination.total} total referral{data.pagination.total !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            {/* Status Filter */}
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

            {/* Date From */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(0);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(0);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
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
                {dateFrom && ` • From: ${dateFrom}`}
                {dateTo && ` • To: ${dateTo}`}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : data?.referrals && data.referrals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Guest</th>
                      <th className="px-6 py-3">Package</th>
                      <th className="px-6 py-3">Status</th>
                      <th
                        className="cursor-pointer px-6 py-3 hover:bg-slate-100"
                        onClick={() => handleSort('value')}
                      >
                        <div className="flex items-center">
                          Value
                          <SortIcon column="value" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-6 py-3 hover:bg-slate-100"
                        onClick={() => handleSort('points')}
                      >
                        <div className="flex items-center">
                          Points
                          <SortIcon column="points" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-6 py-3 hover:bg-slate-100"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          <SortIcon column="date" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.referrals.map((referral) => (
                      <tr
                        key={referral.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedReferral(referral as ReferralDetails)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{referral.guestName}</p>
                            <p className="text-sm text-slate-500">{referral.bookingReference}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {referral.packageName}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                              STATUS_COLORS[referral.status] || 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {referral.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          ${(referral.totalPrice / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-emerald-600">
                            +{referral.pointsEarned}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReferral(referral as ReferralDetails);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.total > limit && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {page * limit + 1} to{' '}
                    {Math.min((page + 1) * limit, data.pagination.total)} of{' '}
                    {data.pagination.total} referrals
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
                      Page {page + 1} of {Math.ceil(data.pagination.total / limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!data.pagination.hasMore}
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
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No referrals found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Start sharing your referral code to earn rewards!'}
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

        {/* Referral Details Modal */}
        {selectedReferral && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedReferral(null)}
          >
            <div
              className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Referral Details</h2>
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="rounded-full p-1 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* Guest Info */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-500">Guest Information</h3>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{selectedReferral.guestName}</p>
                    <p className="text-sm text-slate-600">{selectedReferral.guestEmail}</p>
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-500">Booking Details</h3>
                  <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reference</span>
                      <span className="font-medium text-slate-900">
                        {selectedReferral.bookingReference}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Package</span>
                      <span className="font-medium text-slate-900">
                        {selectedReferral.packageName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status</span>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                          STATUS_COLORS[selectedReferral.status] || 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {selectedReferral.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Value</span>
                      <span className="font-medium text-slate-900">
                        ${(selectedReferral.totalPrice / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Booking Date</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedReferral.bookingCreatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                {selectedReferral.tripStartDate && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-500">Trip Information</h3>
                    <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Destination</span>
                        <span className="font-medium text-slate-900">
                          {selectedReferral.tripDestination || 'Thailand'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Dates</span>
                        <span className="font-medium text-slate-900">
                          {new Date(selectedReferral.tripStartDate).toLocaleDateString()} -{' '}
                          {selectedReferral.tripEndDate
                            ? new Date(selectedReferral.tripEndDate).toLocaleDateString()
                            : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Points Earned */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-500">Your Earnings</h3>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-700">Points Earned</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        +{selectedReferral.pointsEarned}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-emerald-600">Referral Date</span>
                      <span className="text-emerald-700">
                        {new Date(selectedReferral.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedReferral(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
