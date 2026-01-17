/**
 * Partner Commission Reports Page
 * E9-S5: Commission Reports
 *
 * Features:
 * - Revenue and commission summary
 * - Time period filtering
 * - Revenue breakdown table
 * - Monthly data visualization
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  DollarSign,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
  Download,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Period = 'month' | 'quarter' | 'year' | 'all';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'year', label: 'This Year' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'month', label: 'This Month' },
];

export default function PartnerCommissionsPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  const { data, isLoading, error } = trpc.partner.getCommissionReport.useQuery({
    period: useCustomRange ? undefined : period,
    startDate: useCustomRange && customStartDate ? new Date(customStartDate) : undefined,
    endDate: useCustomRange && customEndDate ? new Date(customEndDate + 'T23:59:59') : undefined,
  });

  const handleExportCSV = () => {
    if (!data?.bookings) return;

    const headers = ['Booking Reference', 'Guest Name', 'Package', 'Date', 'Value', 'Points', 'Status'];
    const rows = data.bookings.map((b) => [
      b.bookingReference,
      b.guestName,
      b.packageName,
      new Date(b.bookingDate).toLocaleDateString(),
      `$${(b.bookingValue / 100).toLocaleString()}`,
      b.pointsEarned.toString(),
      b.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commission-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading commission report: {error.message}</p>
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
            <li className="font-medium text-slate-900">Commission Reports</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Commission Reports</h1>
            <p className="mt-1 text-slate-600">
              Track your revenue and earnings from referrals
            </p>
          </div>
          {data && data.bookings.length > 0 && (
            <Button onClick={handleExportCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Period Filter */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Time Period
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useCustomRange}
                  onChange={(e) => setUseCustomRange(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">Custom date range</span>
              </div>
            </div>

            {!useCustomRange ? (
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">From</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">To</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Revenue</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      ${(data.summary.totalRevenue / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Points Earned</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {data.summary.totalPointsEarned.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-100 p-3">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Current Balance</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {data.summary.currentPointsBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Confirmed Bookings</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {data.summary.confirmedBookings}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg Booking Value</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      ${(data.summary.averageBookingValue / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Table */}
            {data.monthlyData.length > 0 && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">Monthly Summary</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-6 py-3">Month</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                        <th className="px-6 py-3 text-right">Points</th>
                        <th className="px-6 py-3 text-right">Bookings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.monthlyData.map((month) => (
                        <tr key={month.month} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                            ${(month.revenue / 100).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {month.points.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {month.bookings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue Breakdown Table */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Revenue Breakdown</h2>
              </div>
              {data.bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-6 py-3">Booking Reference</th>
                        <th className="px-6 py-3">Guest</th>
                        <th className="px-6 py-3">Package</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Value</th>
                        <th className="px-6 py-3 text-right">Points</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.bookings.map((booking) => (
                        <tr key={booking.bookingReference} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-900">
                              {booking.bookingReference}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{booking.guestName}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {booking.packageName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                            ${(booking.bookingValue / 100).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-emerald-600">
                              +{booking.pointsEarned}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : booking.status === 'PENDING_PAYMENT'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {booking.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">No bookings found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Start referring guests to see your commission reports
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
