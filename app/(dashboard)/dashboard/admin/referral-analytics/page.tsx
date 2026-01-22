/**
 * Admin Referral Analytics Dashboard
 * Epic 10 - US-006: Referral Analytics Admin Dashboard
 * Epic 10 - US-007: UTM Parameter Tracking
 *
 * Features:
 * - Referral funnel visualization: Clicks -> Applications -> Bookings -> Completed
 * - Conversion rates at each stage
 * - Top 10 performing referrers (partners and guests combined)
 * - Referral source breakdown chart (partner vs guest)
 * - Date range filter (last 7 days, 30 days, 90 days, all time)
 * - Total points awarded summary
 * - UTM source breakdown and filtering (US-007)
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Users,
  MousePointer,
  FileText,
  CalendarCheck,
  CheckCircle,
  Filter,
  Loader2,
  Award,
  ArrowRight,
  Building2,
  User,
  Link2,
  X,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type DateRangeFilter = {
  startDate?: Date;
  endDate?: Date;
};

// ============================================================================
// DATE RANGE FILTER COMPONENT
// ============================================================================

function DateRangeFilterComponent({
  onChange,
}: {
  onChange: (range: DateRangeFilter) => void;
}) {
  const [preset, setPreset] = useState<string>('all-time');

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);

    const now = new Date();
    let range: DateRangeFilter = {};

    switch (newPreset) {
      case 'last-7-days':
        range = {
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          endDate: now,
        };
        break;
      case 'last-30-days':
        range = {
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: now,
        };
        break;
      case 'last-90-days':
        range = {
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          endDate: now,
        };
        break;
      case 'all-time':
      default:
        range = {};
        break;
    }

    onChange(range);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all-time', label: 'All Time' },
            { value: 'last-90-days', label: 'Last 90 Days' },
            { value: 'last-30-days', label: 'Last 30 Days' },
            { value: 'last-7-days', label: 'Last 7 Days' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handlePresetChange(option.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                preset === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  loading,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  loading?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      {loading ? (
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </>
      )}
    </div>
  );
}

// ============================================================================
// FUNNEL STAGE COMPONENT
// ============================================================================

function FunnelStage({
  label,
  count,
  percentage,
  icon: Icon,
  color,
  isLast = false,
}: {
  label: string;
  count: number;
  percentage?: number;
  icon: React.ElementType;
  color: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="mt-2 text-center">
          <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
      {!isLast && (
        <div className="flex flex-col items-center mx-4">
          <ArrowRight className="h-6 w-6 text-gray-400" />
          {percentage !== undefined && (
            <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOURCE BREAKDOWN BAR COMPONENT
// ============================================================================

function SourceBreakdownBar({
  partnerPercentage,
  guestPercentage,
}: {
  partnerPercentage: number;
  guestPercentage: number;
}) {
  const unknownPercentage = Math.max(0, 100 - partnerPercentage - guestPercentage);

  return (
    <div className="w-full">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {partnerPercentage > 0 && (
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${partnerPercentage}%` }}
          >
            {partnerPercentage > 10 && `${partnerPercentage}%`}
          </div>
        )}
        {guestPercentage > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${guestPercentage}%` }}
          >
            {guestPercentage > 10 && `${guestPercentage}%`}
          </div>
        )}
        {unknownPercentage > 0 && (
          <div
            className="bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium"
            style={{ width: `${unknownPercentage}%` }}
          >
            {unknownPercentage > 10 && `${unknownPercentage}%`}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500" />
          <span className="text-sm text-gray-600">Partner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="text-sm text-gray-600">Guest</span>
        </div>
        {unknownPercentage > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-300" />
            <span className="text-sm text-gray-600">Unknown</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// UTM SOURCE FILTER COMPONENT
// ============================================================================

function UtmSourceFilter({
  sources,
  selectedSource,
  onChange,
  loading,
}: {
  sources: string[];
  selectedSource: string | null;
  onChange: (source: string | null) => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link2 className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">UTM Source:</span>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <>
          <button
            onClick={() => onChange(null)}
            className={`px-2 py-1 text-xs rounded ${
              selectedSource === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {sources.slice(0, 8).map((source) => (
            <button
              key={source}
              onClick={() => onChange(source)}
              className={`px-2 py-1 text-xs rounded ${
                selectedSource === source
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {source}
            </button>
          ))}
          {selectedSource && (
            <button
              onClick={() => onChange(null)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReferralAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [selectedUtmSource, setSelectedUtmSource] = useState<string | null>(null);

  // Fetch UTM source list for filter
  const { data: utmSources, isLoading: loadingUtmSources } =
    trpc.admin.getUtmSourceList.useQuery(dateRange);

  // Fetch analytics data - use UTM-filtered version when a source is selected
  const { data: funnelStats, isLoading: loadingFunnel } = selectedUtmSource
    ? trpc.admin.getReferralFunnelStatsByUtm.useQuery({
        ...dateRange,
        utmSource: selectedUtmSource,
      })
    : trpc.admin.getReferralFunnelStats.useQuery(dateRange);

  const { data: topReferrers, isLoading: loadingReferrers } =
    trpc.admin.getTopReferrers.useQuery({
      ...dateRange,
      limit: 10,
    });

  const { data: sourceBreakdown, isLoading: loadingBreakdown } =
    trpc.admin.getReferralSourceBreakdown.useQuery(dateRange);

  // Fetch UTM breakdown data
  const { data: utmBreakdown, isLoading: loadingUtmBreakdown } =
    trpc.admin.getUtmBreakdown.useQuery(dateRange);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track referral performance across partners and guests
        </p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilterComponent onChange={setDateRange} />

      {/* UTM Source Filter */}
      {utmSources && utmSources.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <UtmSourceFilter
            sources={utmSources || []}
            selectedSource={selectedUtmSource}
            onChange={setSelectedUtmSource}
            loading={loadingUtmSources}
          />
          {selectedUtmSource && (
            <p className="mt-2 text-sm text-blue-600">
              Showing data filtered by UTM source: <strong>{selectedUtmSource}</strong>
            </p>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* REFERRAL FUNNEL */}
      {/* ================================================================ */}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Funnel</h2>

        {loadingFunnel ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex items-start justify-center flex-wrap gap-4">
            <FunnelStage
              label="Clicks"
              count={funnelStats?.funnel.clicks ?? 0}
              icon={MousePointer}
              color="bg-blue-100 text-blue-600"
            />
            <FunnelStage
              label="Applications"
              count={funnelStats?.funnel.applications ?? 0}
              percentage={funnelStats?.conversionRates.clickToApplication}
              icon={FileText}
              color="bg-orange-100 text-orange-600"
            />
            <FunnelStage
              label="Bookings"
              count={funnelStats?.funnel.bookings ?? 0}
              percentage={funnelStats?.conversionRates.applicationToBooking}
              icon={CalendarCheck}
              color="bg-purple-100 text-purple-600"
            />
            <FunnelStage
              label="Completed"
              count={funnelStats?.funnel.completed ?? 0}
              percentage={funnelStats?.conversionRates.bookingToCompletion}
              icon={CheckCircle}
              color="bg-green-100 text-green-600"
              isLast
            />
          </div>
        )}

        {/* Conversion Rates Summary */}
        {funnelStats && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {funnelStats.conversionRates.clickToApplication}%
                </p>
                <p className="text-sm text-gray-600">Click to Application</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {funnelStats.conversionRates.applicationToBooking}%
                </p>
                <p className="text-sm text-gray-600">Application to Booking</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {funnelStats.conversionRates.bookingToCompletion}%
                </p>
                <p className="text-sm text-gray-600">Booking to Completion</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {funnelStats.conversionRates.overallConversion}%
                </p>
                <p className="text-sm text-gray-600">Overall Conversion</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SOURCE BREAKDOWN */}
      {/* ================================================================ */}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Source Breakdown</h2>

        {loadingBreakdown ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : sourceBreakdown ? (
          <div className="space-y-6">
            {/* Clicks Distribution */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Clicks by Source</h3>
              <SourceBreakdownBar
                partnerPercentage={sourceBreakdown.percentages.partner.clicks}
                guestPercentage={sourceBreakdown.percentages.guest.clicks}
              />
            </div>

            {/* Bookings Distribution */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bookings by Source</h3>
              <SourceBreakdownBar
                partnerPercentage={sourceBreakdown.percentages.partner.bookings}
                guestPercentage={sourceBreakdown.percentages.guest.bookings}
              />
            </div>

            {/* Source Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Partner Referrals</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Clicks: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.partner.clicks}</span></p>
                  <p className="text-gray-600">Applications: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.partner.applications}</span></p>
                  <p className="text-gray-600">Bookings: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.partner.bookings}</span></p>
                  <p className="text-gray-600">Completed: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.partner.completed}</span></p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Guest Referrals</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Clicks: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.guest.clicks}</span></p>
                  <p className="text-gray-600">Applications: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.guest.applications}</span></p>
                  <p className="text-gray-600">Bookings: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.guest.bookings}</span></p>
                  <p className="text-gray-600">Completed: <span className="font-medium text-gray-900">{sourceBreakdown.breakdown.guest.completed}</span></p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Total Points Awarded</h4>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {sourceBreakdown.totalPointsAwarded.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Across all referrers</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ================================================================ */}
      {/* UTM BREAKDOWN (US-007) */}
      {/* ================================================================ */}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">UTM Source Breakdown</h2>
        <p className="text-sm text-gray-600 mb-4">
          Track performance by marketing channel (utm_source parameter)
        </p>

        {loadingUtmBreakdown ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : utmBreakdown && utmBreakdown.sources.length > 0 ? (
          <div className="space-y-4">
            {/* UTM Sources Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Clicks</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Applications</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Bookings</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Completed</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Conv. Rate</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Filter</th>
                  </tr>
                </thead>
                <tbody>
                  {utmBreakdown.sources.map((source) => (
                    <tr key={source.source} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{source.source}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600">{source.clicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{source.applications.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{source.bookings.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{source.completed.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`font-medium ${source.conversionRate > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {source.conversionRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => setSelectedUtmSource(source.source)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Filter
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Show row for events without UTM */}
                  {utmBreakdown.withoutUtm.clicks > 0 && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="text-gray-500 italic">No UTM source</span>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-500">{utmBreakdown.withoutUtm.clicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-500">{utmBreakdown.withoutUtm.applications.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-500">{utmBreakdown.withoutUtm.bookings.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-500">{utmBreakdown.withoutUtm.completed.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-500">-</td>
                      <td className="text-center py-3 px-4">-</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="py-3 px-4 text-gray-700">Total (with UTM)</td>
                    <td className="text-right py-3 px-4 text-gray-700">{utmBreakdown.totals.clicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{utmBreakdown.totals.applications.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{utmBreakdown.totals.bookings.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{utmBreakdown.totals.completed.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {utmBreakdown.totals.clicks > 0
                        ? Math.round((utmBreakdown.totals.bookings / utmBreakdown.totals.clicks) * 100)
                        : 0}%
                    </td>
                    <td className="text-center py-3 px-4">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Link2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No UTM tracking data available</p>
            <p className="text-sm mt-1">UTM parameters are captured when visitors arrive with utm_source in the URL</p>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* TOP REFERRERS */}
      {/* ================================================================ */}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top 10 Performing Referrers</h2>

        {loadingReferrers ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : topReferrers && topReferrers.length > 0 ? (
          <div className="space-y-3">
            {topReferrers.map((referrer, index) => (
              <div
                key={referrer.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{referrer.name}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          referrer.type === 'partner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {referrer.type === 'partner' ? 'Partner' : 'Guest'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{referrer.referralCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{referrer.stats.clicks}</p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{referrer.stats.applications}</p>
                    <p className="text-xs text-gray-500">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{referrer.stats.bookings}</p>
                    <p className="text-xs text-gray-500">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{referrer.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No referrers found for the selected time period</p>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SUMMARY STATS */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Clicks"
          value={funnelStats?.funnel.clicks ?? 0}
          icon={MousePointer}
          color="blue"
          loading={loadingFunnel}
        />
        <StatCard
          title="Total Applications"
          value={funnelStats?.funnel.applications ?? 0}
          icon={FileText}
          color="orange"
          loading={loadingFunnel}
        />
        <StatCard
          title="Total Bookings"
          value={funnelStats?.funnel.bookings ?? 0}
          icon={CalendarCheck}
          color="purple"
          loading={loadingFunnel}
        />
        <StatCard
          title="Completed Trips"
          value={funnelStats?.funnel.completed ?? 0}
          icon={CheckCircle}
          color="green"
          loading={loadingFunnel}
        />
      </div>
    </div>
  );
}
