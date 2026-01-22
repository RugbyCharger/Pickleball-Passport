/**
 * Partner Performance Analytics Page
 * E9-S10: Performance Analytics
 *
 * Features:
 * - Time period filters
 * - Summary metrics with period-over-period comparison
 * - Referrals over time chart
 * - Conversion funnel visualization
 * - Revenue trends chart
 * - Performance comparison table
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  Users,
  MousePointerClick,
  FileText,
  CheckCircle,
  DollarSign,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Period = '7d' | '30d' | '90d' | '12m' | 'all';

export default function PartnerAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data: analytics, isLoading } = trpc.partner.getPerformanceAnalytics.useQuery({
    period,
  });

  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '12m', label: 'Last 12 months' },
    { value: 'all', label: 'All time' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Analytics data not available</p>
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
            <li className="font-medium text-slate-900">Analytics</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
            <p className="mt-1 text-slate-600">
              Track your referral performance over time
            </p>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  period === p.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Referrals */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Total Referrals</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.summary.totalReferrals}
                </p>
                {analytics.comparison.referrals.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {analytics.comparison.referrals.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600">
                          {Math.abs(analytics.comparison.referrals.change)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {Math.abs(analytics.comparison.referrals.change)}%
                        </span>
                      </>
                    )}
                    <span className="text-slate-500">vs previous period</span>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Bookings</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.summary.bookingsCount}
                </p>
                {analytics.comparison.bookings.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {analytics.comparison.bookings.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600">
                          {Math.abs(analytics.comparison.bookings.change)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {Math.abs(analytics.comparison.bookings.change)}%
                        </span>
                      </>
                    )}
                    <span className="text-slate-500">vs previous period</span>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ${(analytics.summary.totalRevenue / 100).toLocaleString()}
                </p>
                {analytics.comparison.revenue.change !== 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {analytics.comparison.revenue.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600">
                          {Math.abs(analytics.comparison.revenue.change)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">
                          {Math.abs(analytics.comparison.revenue.change)}%
                        </span>
                      </>
                    )}
                    <span className="text-slate-500">vs previous period</span>
                  </div>
                )}
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.summary.conversionRate}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Avg booking: ${(analytics.summary.averageBookingValue / 100).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Referrals Over Time */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Referrals Over Time</h2>
            {analytics.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="referrals"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Referrals"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Bookings"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                No data available for this period
              </div>
            )}
          </div>

          {/* Revenue Trends */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Revenue Trends</h2>
            {analytics.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 100).toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => value != null ? `$${(Number(value) / 100).toLocaleString()}` : '$0'}
                  />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-500">
                No data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Conversion Funnel</h2>
          <div className="space-y-4">
            {/* Funnel Steps */}
            <div className="relative">
              {/* Referrals */}
              <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <MousePointerClick className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Referrals Sent</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.funnel.referrals}
                </span>
              </div>

              {/* Applications */}
              <div className="mb-2 flex items-center justify-between rounded-lg bg-purple-50 p-4" style={{ width: `${analytics.funnel.applicationRate}%` }}>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-slate-900">Applications</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.funnel.applications} ({analytics.funnel.applicationRate}%)
                </span>
              </div>

              {/* Bookings */}
              <div className="mb-2 flex items-center justify-between rounded-lg bg-emerald-50 p-4" style={{ width: `${analytics.funnel.bookingRate}%` }}>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-900">Bookings</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.funnel.bookings} ({analytics.funnel.bookingRate}%)
                </span>
              </div>

              {/* Completed */}
              {analytics.funnel.completed > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-4" style={{ width: `${analytics.funnel.completionRate}%` }}>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-slate-900">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {analytics.funnel.completed} ({analytics.funnel.completionRate}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Period Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-sm font-medium text-slate-600">
                <tr>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3 text-right">Current Period</th>
                  <th className="px-4 py-3 text-right">Previous Period</th>
                  <th className="px-4 py-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Referrals</td>
                  <td className="px-4 py-3 text-right">{analytics.comparison.referrals.current}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {analytics.comparison.referrals.previous}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {analytics.comparison.referrals.change !== 0 && (
                      <span
                        className={cn(
                          'flex items-center justify-end gap-1',
                          analytics.comparison.referrals.change > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        )}
                      >
                        {analytics.comparison.referrals.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(analytics.comparison.referrals.change)}%
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Bookings</td>
                  <td className="px-4 py-3 text-right">{analytics.comparison.bookings.current}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {analytics.comparison.bookings.previous}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {analytics.comparison.bookings.change !== 0 && (
                      <span
                        className={cn(
                          'flex items-center justify-end gap-1',
                          analytics.comparison.bookings.change > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        )}
                      >
                        {analytics.comparison.bookings.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(analytics.comparison.bookings.change)}%
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Revenue</td>
                  <td className="px-4 py-3 text-right">
                    ${(analytics.comparison.revenue.current / 100).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ${(analytics.comparison.revenue.previous / 100).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {analytics.comparison.revenue.change !== 0 && (
                      <span
                        className={cn(
                          'flex items-center justify-end gap-1',
                          analytics.comparison.revenue.change > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        )}
                      >
                        {analytics.comparison.revenue.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(analytics.comparison.revenue.change)}%
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
