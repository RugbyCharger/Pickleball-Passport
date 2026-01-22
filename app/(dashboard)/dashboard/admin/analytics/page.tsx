/**
 * Admin Analytics Dashboard
 * A2-S1: Comprehensive analytics and reporting for admin users
 *
 * Features:
 * - Booking conversion metrics
 * - Revenue analytics
 * - Guest demographics
 * - Popular add-ons analysis
 * - Trip capacity utilization
 * - Partner referral analytics
 * - CSV export functionality
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { exportToCSV, generateFilename } from '@/lib/utils/csv-export';
import { toast } from 'sonner';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Activity,
  Monitor,
  ChevronDown,
  Clock,
  Home,
  Eye,
  Settings,
  FileCheck,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

type DateRangeFilter = {
  startDate?: Date;
  endDate?: Date;
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        {trend && trendLabel && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {trendLabel}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      {loading ? (
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

// ============================================================================
// DATE RANGE FILTER COMPONENT
// ============================================================================

function DateRangeFilter({
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
      case 'this-year':
        range = {
          startDate: new Date(now.getFullYear(), 0, 1),
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
            { value: 'this-year', label: 'This Year' },
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
// FUNNEL STAGE ICONS
// ============================================================================

const FUNNEL_STAGE_ICONS: Record<string, React.ElementType> = {
  HOMEPAGE: Home,
  PACKAGE_VIEW: Eye,
  CONFIGURATOR: Settings,
  REVIEW: FileCheck,
  PAYMENT: CreditCard,
  CONFIRMATION: CheckCircle,
};

const FUNNEL_STAGE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
];

// ============================================================================
// MAIN ANALYTICS DASHBOARD
// ============================================================================

type AnalyticsTab = 'overview' | 'booking-funnel';

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [funnelPackageFilter, setFunnelPackageFilter] = useState<string>('');
  const [funnelUtmSourceFilter, setFunnelUtmSourceFilter] = useState<string>('');

  // Fetch analytics data
  const { data: conversionFunnel, isLoading: loadingConversion } =
    trpc.analytics.conversion.getFunnel.useQuery(dateRange);

  const { data: statusBreakdown } =
    trpc.analytics.conversion.getStatusBreakdown.useQuery(dateRange);

  const { data: revenueOverview, isLoading: loadingRevenue } =
    trpc.analytics.revenue.getOverview.useQuery(dateRange);

  const { data: revenueByPackage } =
    trpc.analytics.revenue.getByPackage.useQuery(dateRange);

  const { data: demographics } =
    trpc.analytics.demographics.getByRole.useQuery();

  const { data: accommodationTiers } =
    trpc.analytics.demographics.getAccommodationTiers.useQuery(dateRange);

  const { data: topAddOns } =
    trpc.analytics.addOns.getTopAddOns.useQuery({ limit: 10 });

  const { data: tripUtilization } =
    trpc.analytics.tripUtilization.getAll.useQuery({ isActive: true, limit: 10 });

  const { data: partnerStats } =
    trpc.analytics.partnerReferrals.getByPartner.useQuery({ limit: 10 });

  const { data: bookingPatterns } =
    trpc.analytics.demographics.getBookingPatterns.useQuery(dateRange);

  // Event tracking metrics (E13-S1)
  const { data: eventSummary, isLoading: loadingEventSummary } =
    trpc.analytics.events.getSummary.useQuery(dateRange);

  const { data: sessionSummary, isLoading: loadingSessionSummary } =
    trpc.analytics.sessions.getSummary.useQuery(dateRange);

  // Booking Funnel Analytics (E13-S2)
  const { data: funnelData, isLoading: loadingFunnel } =
    trpc.analytics.bookingFunnel.getFunnelData.useQuery({
      ...dateRange,
      packageId: funnelPackageFilter || undefined,
      utmSource: funnelUtmSourceFilter || undefined,
    });

  const { data: funnelTimeData, isLoading: loadingFunnelTime } =
    trpc.analytics.bookingFunnel.getTimeAtStages.useQuery({
      ...dateRange,
      packageId: funnelPackageFilter || undefined,
    });

  const { data: funnelTrends, isLoading: loadingFunnelTrends } =
    trpc.analytics.bookingFunnel.getFunnelTrends.useQuery({
      period: 'day',
      ...dateRange,
    });

  const { data: filterOptions } =
    trpc.analytics.bookingFunnel.getFilterOptions.useQuery();

  // CSV Export handler
  const handleExport = async (
    reportType: 'bookings' | 'revenue' | 'addons' | 'trips' | 'referrals'
  ) => {
    try {
      toast.info('Generating CSV export...');

      // Fetch export data
      const response = await fetch(
        `/api/trpc/analytics.export.generateCSV?input=${encodeURIComponent(
          JSON.stringify({
            reportType,
            startDate: dateRange.startDate?.toISOString(),
            endDate: dateRange.endDate?.toISOString(),
          })
        )}`
      );

      if (!response.ok) {
        throw new Error('Failed to generate export');
      }

      const result = await response.json();
      const data = result.result.data;

      // Generate and download CSV
      const filename = generateFilename(reportType);
      exportToCSV(data, filename);

      toast.success(`${reportType} report exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive business intelligence and reporting
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('booking-funnel')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'booking-funnel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Booking Funnel
          </button>
        </nav>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter onChange={setDateRange} />

      {/* ================================================================ */}
      {/* BOOKING FUNNEL TAB (E13-S2) */}
      {/* ================================================================ */}

      {activeTab === 'booking-funnel' && (
        <div className="space-y-6">
          {/* Funnel Filters */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              {/* Package Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Package:</label>
                <select
                  value={funnelPackageFilter}
                  onChange={(e) => setFunnelPackageFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Packages</option>
                  {filterOptions?.packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* UTM Source Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Traffic Source:</label>
                <select
                  value={funnelUtmSourceFilter}
                  onChange={(e) => setFunnelUtmSourceFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sources</option>
                  {filterOptions?.utmSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Funnel Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Sessions"
              value={funnelData?.totalSessions ?? 0}
              icon={Users}
              loading={loadingFunnel}
            />
            <StatCard
              title="Completed Bookings"
              value={funnelData?.finalConversions ?? 0}
              icon={CheckCircle}
              loading={loadingFunnel}
            />
            <StatCard
              title="Overall Conversion Rate"
              value={`${funnelData?.overallConversionRate ?? '0.00'}%`}
              icon={TrendingUp}
              trend={Number(funnelData?.overallConversionRate ?? 0) > 0 ? 'up' : undefined}
              loading={loadingFunnel}
            />
          </div>

          {/* Funnel Visualization */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Booking Funnel
            </h3>

            {loadingFunnel ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : funnelData?.funnelData && funnelData.funnelData.length > 0 ? (
              <div className="space-y-4">
                {funnelData.funnelData.map((stage, index) => {
                  const Icon = FUNNEL_STAGE_ICONS[stage.stage] || Activity;
                  const widthPercent = funnelData.totalSessions > 0
                    ? Math.max(10, (stage.count / funnelData.totalSessions) * 100)
                    : 100;
                  const color = FUNNEL_STAGE_COLORS[index];

                  return (
                    <div key={stage.stage} className="relative">
                      {/* Stage Row */}
                      <div
                        className="flex items-center justify-between p-4 rounded-lg transition-all"
                        style={{
                          backgroundColor: `${color}15`,
                          width: `${widthPercent}%`,
                          minWidth: '300px',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}30` }}
                          >
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {stage.stageLabel}
                            </div>
                            <div className="text-sm text-gray-600">
                              {index > 0 && (
                                <>
                                  <span className="text-green-600">{stage.conversionRate}%</span>
                                  {' from previous • '}
                                  <span className="text-red-500">{stage.dropOffRate}% drop-off</span>
                                </>
                              )}
                              {index === 0 && 'Starting point'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {stage.count.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stage.overallConversionRate}% of total
                          </div>
                        </div>
                      </div>

                      {/* Arrow between stages */}
                      {index < funnelData.funnelData.length - 1 && (
                        <div className="flex justify-center my-2">
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <Activity className="h-12 w-12 mb-4 text-gray-300" />
                <p>No funnel data available for the selected filters.</p>
                <p className="text-sm mt-2">
                  Funnel events are tracked automatically as users navigate the booking flow.
                </p>
              </div>
            )}
          </div>

          {/* Time at Each Stage */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Average Time at Each Stage
            </h3>

            {loadingFunnelTime ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : funnelTimeData && funnelTimeData.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {funnelTimeData.map((stage, index) => {
                  const Icon = FUNNEL_STAGE_ICONS[stage.stage] || Activity;
                  const color = FUNNEL_STAGE_COLORS[index];

                  return (
                    <div
                      key={stage.stage}
                      className="text-center p-4 rounded-lg"
                      style={{ backgroundColor: `${color}10` }}
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {stage.averageTimeFormatted || '—'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {stage.stageLabel}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stage.sampleCount} samples
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-gray-500">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No timing data available yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Funnel Trends Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Conversion Trends
            </h3>

            {loadingFunnelTrends ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : funnelTrends && funnelTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={funnelTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="homepage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Homepage"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="packageView"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Package View"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="configurator"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Configurator"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmation"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Confirmation"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChartIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No trend data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* OVERVIEW TAB */}
      {/* ================================================================ */}

      {activeTab === 'overview' && (
        <>
      {/* ================================================================ */}
      {/* EVENT TRACKING SUMMARY (E13-S1) */}
      {/* ================================================================ */}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Event Tracking</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events"
            value={eventSummary?.totalEvents ?? 0}
            icon={Activity}
            loading={loadingEventSummary}
          />
          <StatCard
            title="Unique Users"
            value={eventSummary?.uniqueUsers ?? 0}
            icon={Users}
            loading={loadingEventSummary}
          />
          <StatCard
            title="Total Sessions"
            value={sessionSummary?.totalSessions ?? 0}
            icon={Monitor}
            loading={loadingSessionSummary}
          />
          <StatCard
            title="Session Conversion"
            value={`${sessionSummary?.conversionRate ?? '0.00'}%`}
            icon={TrendingUp}
            trend={Number(sessionSummary?.conversionRate ?? 0) > 0 ? 'up' : undefined}
            trendLabel={`${sessionSummary?.convertedSessions ?? 0} converted`}
            loading={loadingSessionSummary}
          />
        </div>

        {/* Events by Type */}
        {eventSummary?.eventsByType && eventSummary.eventsByType.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Events by Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {eventSummary.eventsByType.map((item) => (
                <div key={item.eventType} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {item.eventType.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Metrics */}
        {sessionSummary && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessionSummary.averagePageViews}
                </div>
                <div className="text-sm text-gray-600">Avg. Page Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessionSummary.averageEventCount}
                </div>
                <div className="text-sm text-gray-600">Avg. Events/Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessionSummary.convertedSessions}
                </div>
                <div className="text-sm text-gray-600">Converted Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessionSummary.conversionRate}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>

            {/* Device Breakdown */}
            {sessionSummary.sessionsByDevice && sessionSummary.sessionsByDevice.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-3">Sessions by Device</h4>
                <div className="flex gap-4 flex-wrap">
                  {sessionSummary.sessionsByDevice.map((device) => (
                    <div
                      key={device.deviceType}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      <Monitor className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700 capitalize">
                        {device.deviceType}:
                      </span>
                      <span className="text-sm font-bold text-gray-900">{device.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* CONVERSION METRICS */}
      {/* ================================================================ */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Conversion Metrics</h2>
          <button
            onClick={() => handleExport('bookings')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export Bookings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={conversionFunnel?.totalApplications ?? 0}
            icon={Users}
            loading={loadingConversion}
          />
          <StatCard
            title="Total Bookings"
            value={conversionFunnel?.totalBookings ?? 0}
            icon={Package}
            loading={loadingConversion}
          />
          <StatCard
            title="Confirmed Bookings"
            value={conversionFunnel?.confirmedBookings ?? 0}
            icon={BarChartIcon}
            loading={loadingConversion}
          />
          <StatCard
            title="Overall Conversion"
            value={`${conversionFunnel?.rates.overall ?? 0}%`}
            icon={TrendingUp}
            trend="up"
            trendLabel={`${conversionFunnel?.rates.applicationToBooking ?? 0}% app→booking`}
            loading={loadingConversion}
          />
        </div>

        {/* Status Breakdown */}
        {statusBreakdown && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Status Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statusBreakdown.breakdown.map((item) => (
                <div key={item.status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {item.status.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* REVENUE ANALYTICS */}
      {/* ================================================================ */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <button
            onClick={() => handleExport('revenue')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${((revenueOverview?.totalRevenue ?? 0) / 100).toLocaleString()}`}
            icon={DollarSign}
            loading={loadingRevenue}
          />
          <StatCard
            title="Total Payments"
            value={revenueOverview?.totalPayments ?? 0}
            icon={Package}
            loading={loadingRevenue}
          />
          <StatCard
            title="Average Payment"
            value={`$${((revenueOverview?.averagePayment ?? 0) / 100).toLocaleString()}`}
            icon={TrendingUp}
            loading={loadingRevenue}
          />
        </div>

        {/* Revenue by Package */}
        {revenueByPackage && revenueByPackage.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Package
            </h3>
            <div className="space-y-3">
              {revenueByPackage.map((pkg) => (
                <div
                  key={pkg.packageId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{pkg.packageName}</div>
                    <div className="text-sm text-gray-600">
                      {pkg.bookingCount} bookings
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${(pkg.totalRevenue / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: ${(pkg.averageBookingValue / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* GUEST DEMOGRAPHICS */}
      {/* ================================================================ */}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Demographics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Roles */}
          {demographics && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                {demographics.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">
                      {item.role.toLowerCase()}
                    </span>
                    <span className="font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accommodation Tiers */}
          {accommodationTiers && accommodationTiers.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accommodation Preferences
              </h3>
              <div className="space-y-3">
                {accommodationTiers.map((item) => (
                  <div key={item.tier} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.tier}</span>
                    <span className="font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Patterns */}
        {bookingPatterns && (
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Patterns
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bookingPatterns.uniqueGuests}
                </div>
                <div className="text-sm text-gray-600">Unique Guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bookingPatterns.totalBookings}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bookingPatterns.repeatGuests}
                </div>
                <div className="text-sm text-gray-600">Repeat Guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {bookingPatterns.repeatRate}%
                </div>
                <div className="text-sm text-gray-600">Repeat Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* TOP ADD-ONS */}
      {/* ================================================================ */}

      {topAddOns && topAddOns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Add-Ons</h2>
            <button
              onClick={() => handleExport('addons')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="space-y-3">
              {topAddOns.map((addon, index) => (
                <div
                  key={addon.addOnId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{addon.name}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {addon.category.toLowerCase().replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${(addon.totalRevenue / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {addon.bookingCount} bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TRIP CAPACITY */}
      {/* ================================================================ */}

      {tripUtilization && tripUtilization.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Trip Capacity Utilization</h2>
            <button
              onClick={() => handleExport('trips')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="space-y-4">
              {tripUtilization.map((trip) => (
                <div key={trip.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{trip.name}</div>
                      <div className="text-sm text-gray-600">{trip.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {trip.utilizationPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {trip.currentBookings}/{trip.capacity}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${trip.utilizationPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* PARTNER REFERRALS */}
      {/* ================================================================ */}

      {partnerStats && partnerStats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Top Performing Partners
            </h2>
            <button
              onClick={() => handleExport('referrals')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="space-y-3">
              {partnerStats.map((partner) => (
                <div
                  key={partner.partnerId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {partner.clubName}
                    </div>
                    <div className="text-sm text-gray-600">{partner.email}</div>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded uppercase">
                        {partner.tier}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {partner.totalReferrals} referrals
                    </div>
                    <div className="text-sm text-gray-600">
                      {partner.totalPointsEarned.toLocaleString()} points earned
                    </div>
                    <div className="text-sm text-gray-600">
                      {partner.currentPoints.toLocaleString()} current
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
