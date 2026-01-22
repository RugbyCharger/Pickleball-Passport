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
  Target,
  Globe,
  Megaphone,
  FlaskConical,
  Calendar,
  PiggyBank,
  ArrowRightLeft,
  Wallet,
  MapPin,
  Heart,
  UserCheck,
  Stethoscope,
  Repeat,
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
  BarChart,
  Bar,
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

type AnalyticsTab = 'overview' | 'booking-funnel' | 'conversion-tracking' | 'revenue-reports' | 'guest-demographics' | 'package-performance';

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [funnelPackageFilter, setFunnelPackageFilter] = useState<string>('');
  const [funnelUtmSourceFilter, setFunnelUtmSourceFilter] = useState<string>('');

  // Conversion Tracking filters (E13-S3)
  const [conversionGroupBy, setConversionGroupBy] = useState<'source' | 'medium' | 'campaign'>('source');
  const [conversionTrendPeriod, setConversionTrendPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [conversionTypeFilter, setConversionTypeFilter] = useState<'APPLICATION_SUBMITTED' | 'BOOKING_COMPLETED' | 'PAYMENT_MADE' | 'ALL'>('ALL');

  // Revenue Reports filters (E13-S4)
  const [revenueTrendPeriod, setRevenueTrendPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'quarter' | 'year'>('month');

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

  // Conversion Tracking Analytics (E13-S3)
  const { data: conversionsByType, isLoading: loadingConversionsByType } =
    trpc.analytics.conversionTracking.getConversionsByType.useQuery(dateRange);

  const { data: conversionsBySource, isLoading: loadingConversionsBySource } =
    trpc.analytics.conversionTracking.getByTrafficSource.useQuery({
      ...dateRange,
      groupBy: conversionGroupBy,
    });

  const { data: conversionTrends, isLoading: loadingConversionTrends } =
    trpc.analytics.conversionTracking.getConversionTrends.useQuery({
      period: conversionTrendPeriod,
      ...dateRange,
      conversionType: conversionTypeFilter,
    });

  const { data: topConverters, isLoading: loadingTopConverters } =
    trpc.analytics.conversionTracking.getTopConverters.useQuery({
      ...dateRange,
      limit: 10,
    });

  const { data: variantPerformance, isLoading: loadingVariants } =
    trpc.analytics.conversionTracking.getVariantPerformance.useQuery(dateRange);

  // Revenue Reports Analytics (E13-S4)
  const { data: comprehensiveRevenue, isLoading: loadingComprehensiveRevenue } =
    trpc.analytics.revenue.getComprehensiveOverview.useQuery(dateRange);

  const { data: revenueTrends, isLoading: loadingRevenueTrends } =
    trpc.analytics.revenue.getRevenueTrends.useQuery({
      period: revenueTrendPeriod,
      ...dateRange,
    });

  const { data: projectedRevenue, isLoading: loadingProjectedRevenue } =
    trpc.analytics.revenue.getProjectedRevenue.useQuery();

  // Calculate comparison dates based on selected period
  const getComparisonDates = () => {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (comparisonPeriod) {
      case 'month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = now;
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        currentEnd = now;
        previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
      case 'year':
        currentStart = new Date(now.getFullYear(), 0, 1);
        currentEnd = now;
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    return { currentStart, currentEnd, previousStart, previousEnd };
  };

  const comparisonDates = getComparisonDates();

  const { data: revenueComparison, isLoading: loadingRevenueComparison } =
    trpc.analytics.revenue.getRevenueComparison.useQuery({
      currentPeriodStart: comparisonDates.currentStart,
      currentPeriodEnd: comparisonDates.currentEnd,
      previousPeriodStart: comparisonDates.previousStart,
      previousPeriodEnd: comparisonDates.previousEnd,
    });

  const { data: revenueByAddOnCategory } =
    trpc.analytics.revenue.getByAddOnCategory.useQuery(dateRange);

  // Guest Demographics Analytics (E13-S5)
  const { data: demographicsOverview, isLoading: loadingDemographicsOverview } =
    trpc.analytics.demographics.getOverview.useQuery(dateRange);

  const { data: ageDistribution, isLoading: loadingAgeDistribution } =
    trpc.analytics.demographics.getAgeDistribution.useQuery(dateRange);

  const { data: locationDistribution, isLoading: loadingLocationDistribution } =
    trpc.analytics.demographics.getLocationDistribution.useQuery({
      ...dateRange,
      limit: 15,
    });

  const { data: packagesByDemographic, isLoading: loadingPackagesByDemographic } =
    trpc.analytics.demographics.getPackagesByDemographic.useQuery(dateRange);

  const { data: acquisitionSources, isLoading: loadingAcquisitionSources } =
    trpc.analytics.demographics.getAcquisitionSources.useQuery(dateRange);

  const { data: medicalProceduresByDemographic, isLoading: loadingMedicalProcedures } =
    trpc.analytics.demographics.getMedicalProceduresByDemographic.useQuery(dateRange);

  // Package Performance Analytics (E13-S6)
  const { data: packageOverview, isLoading: loadingPackageOverview } =
    trpc.analytics.packagePerformance.getOverview.useQuery(dateRange);

  const { data: packageComparison, isLoading: loadingPackageComparison } =
    trpc.analytics.packagePerformance.getPackageComparison.useQuery(dateRange);

  const { data: seasonalTrends, isLoading: loadingSeasonalTrends } =
    trpc.analytics.packagePerformance.getSeasonalTrends.useQuery();

  const { data: underperformingPackages, isLoading: loadingUnderperforming } =
    trpc.analytics.packagePerformance.getUnderperformingPackages.useQuery(dateRange);

  const { data: topPackageAddOns, isLoading: loadingTopPackageAddOns } =
    trpc.analytics.packagePerformance.getTopAddOns.useQuery({ ...dateRange, limit: 10 });

  const { data: packageRatings, isLoading: loadingPackageRatings } =
    trpc.analytics.packagePerformance.getPackageRatings.useQuery(dateRange);

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
          <button
            onClick={() => setActiveTab('conversion-tracking')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'conversion-tracking'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Conversion Tracking
          </button>
          <button
            onClick={() => setActiveTab('revenue-reports')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'revenue-reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Revenue Reports
          </button>
          <button
            onClick={() => setActiveTab('guest-demographics')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'guest-demographics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Guest Demographics
          </button>
          <button
            onClick={() => setActiveTab('package-performance')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'package-performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Package Performance
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
      {/* CONVERSION TRACKING TAB (E13-S3) */}
      {/* ================================================================ */}

      {activeTab === 'conversion-tracking' && (
        <div className="space-y-6">
          {/* Conversion Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Conversions"
              value={conversionsByType?.totalConversionEvents ?? 0}
              icon={Target}
              loading={loadingConversionsByType}
            />
            <StatCard
              title="Applications"
              value={conversionsByType?.databaseBased.applications ?? 0}
              icon={FileCheck}
              loading={loadingConversionsByType}
            />
            <StatCard
              title="Confirmed Bookings"
              value={conversionsByType?.databaseBased.confirmedBookings ?? 0}
              icon={CheckCircle}
              loading={loadingConversionsByType}
            />
            <StatCard
              title="Successful Payments"
              value={conversionsByType?.databaseBased.successfulPayments ?? 0}
              icon={CreditCard}
              loading={loadingConversionsByType}
            />
          </div>

          {/* Conversion by Traffic Source */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Conversion Rates by Traffic Source
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Group by:</label>
                <select
                  value={conversionGroupBy}
                  onChange={(e) =>
                    setConversionGroupBy(e.target.value as 'source' | 'medium' | 'campaign')
                  }
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="source">UTM Source</option>
                  <option value="medium">UTM Medium</option>
                  <option value="campaign">UTM Campaign</option>
                </select>
              </div>
            </div>

            {loadingConversionsBySource ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : conversionsBySource?.results && conversionsBySource.results.length > 0 ? (
              <div className="space-y-3">
                {conversionsBySource.results.slice(0, 10).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.totalSessions.toLocaleString()} sessions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {item.conversionRate}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.conversions.toLocaleString()} conversions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <Globe className="h-12 w-12 mb-4 text-gray-300" />
                <p>No traffic source data available.</p>
                <p className="text-sm mt-2">
                  UTM parameters are tracked automatically from URLs.
                </p>
              </div>
            )}
          </div>

          {/* Conversion Trends */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Trends</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Period:</label>
                  <select
                    value={conversionTrendPeriod}
                    onChange={(e) =>
                      setConversionTrendPeriod(e.target.value as 'day' | 'week' | 'month')
                    }
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Type:</label>
                  <select
                    value={conversionTypeFilter}
                    onChange={(e) =>
                      setConversionTypeFilter(
                        e.target.value as
                          | 'APPLICATION_SUBMITTED'
                          | 'BOOKING_COMPLETED'
                          | 'PAYMENT_MADE'
                          | 'ALL'
                      )
                    }
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">All Conversions</option>
                    <option value="APPLICATION_SUBMITTED">Applications</option>
                    <option value="BOOKING_COMPLETED">Bookings</option>
                    <option value="PAYMENT_MADE">Payments</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingConversionTrends ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : conversionTrends?.trends && conversionTrends.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionTrends.trends}>
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
                  {conversionTypeFilter === 'ALL' ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Applications"
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Bookings"
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="payments"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Payments"
                        dot={{ r: 3 }}
                      />
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={conversionTypeFilter.replace('_', ' ').toLowerCase()}
                      dot={{ r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChartIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No conversion trend data available for the selected period.</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Converting Sources & Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Sources */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Converting Sources
              </h3>

              {loadingTopConverters ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : topConverters?.topSources && topConverters.topSources.length > 0 ? (
                <div className="space-y-3">
                  {topConverters.topSources.map((source, index) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{source.name}</div>
                          <div className="text-xs text-gray-500">
                            {source.totalSessions.toLocaleString()} sessions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{source.conversionRate}%</div>
                        <div className="text-xs text-gray-500">
                          {source.conversions} conversions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <Globe className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No source data available.</p>
                </div>
              )}
            </div>

            {/* Top Campaigns */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Converting Campaigns
              </h3>

              {loadingTopConverters ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : topConverters?.topCampaigns && topConverters.topCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {topConverters.topCampaigns.map((campaign, index) => (
                    <div
                      key={campaign.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-500">
                            {campaign.breakdown && Object.entries(campaign.breakdown)
                              .map(([type, count]) => `${type.split('_')[0]}: ${count}`)
                              .join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          {campaign.conversions} conversions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <Megaphone className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No campaign data available.</p>
                  <p className="text-xs mt-1">Use utm_campaign parameter in URLs</p>
                </div>
              )}
            </div>
          </div>

          {/* A/B Test Variant Performance (Optional) */}
          {variantPerformance?.hasData && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  A/B Test Variant Performance
                </h3>
              </div>

              {loadingVariants ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(variantPerformance.experiments).map(([experimentId, variants]) => (
                    <div key={experimentId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Experiment: {experimentId}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {variants.map((variant, index) => (
                          <div
                            key={variant.variant}
                            className={`p-3 rounded-lg ${
                              index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {variant.variant}
                              </span>
                              {index === 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Winner
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {variant.conversionRate}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {variant.conversions} / {variant.sessions} sessions
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* REVENUE REPORTS TAB (E13-S4) */}
      {/* ================================================================ */}

      {activeTab === 'revenue-reports' && (
        <div className="space-y-6">
          {/* Revenue Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${((comprehensiveRevenue?.totalRevenue ?? 0) / 100).toLocaleString()}`}
              icon={DollarSign}
              loading={loadingComprehensiveRevenue}
            />
            <StatCard
              title="MRR"
              value={`$${((comprehensiveRevenue?.mrr ?? 0) / 100).toLocaleString()}`}
              icon={Calendar}
              loading={loadingComprehensiveRevenue}
            />
            <StatCard
              title="Average Booking Value"
              value={`$${((comprehensiveRevenue?.averageBookingValue ?? 0) / 100).toLocaleString()}`}
              icon={Wallet}
              loading={loadingComprehensiveRevenue}
            />
            <StatCard
              title="Add-Ons Revenue"
              value={`$${((comprehensiveRevenue?.addOnsRevenue ?? 0) / 100).toLocaleString()}`}
              icon={Package}
              loading={loadingComprehensiveRevenue}
            />
          </div>

          {/* Period Comparison */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Comparison</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Compare:</label>
                <select
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="month">This Month vs Last Month</option>
                  <option value="quarter">This Quarter vs Last Quarter</option>
                  <option value="year">This Year vs Last Year</option>
                </select>
              </div>
            </div>

            {loadingRevenueComparison ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : revenueComparison ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Comparison */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(revenueComparison.current.revenue / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    vs ${(revenueComparison.previous.revenue / 100).toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                    revenueComparison.changes.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueComparison.changes.revenue >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(revenueComparison.changes.revenue)}%
                  </div>
                </div>

                {/* Bookings Comparison */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {revenueComparison.current.bookings}
                  </div>
                  <div className="text-sm text-gray-500">
                    vs {revenueComparison.previous.bookings}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                    revenueComparison.changes.bookings >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueComparison.changes.bookings >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(revenueComparison.changes.bookings)}%
                  </div>
                </div>

                {/* Average Payment Comparison */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Avg. Payment</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(revenueComparison.current.averagePayment / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    vs ${(revenueComparison.previous.averagePayment / 100).toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                    revenueComparison.changes.averagePayment >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueComparison.changes.averagePayment >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(revenueComparison.changes.averagePayment)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <ArrowRightLeft className="h-8 w-8 mb-2 text-gray-300" />
                <p>No comparison data available.</p>
              </div>
            )}
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Period:</label>
                  <select
                    value={revenueTrendPeriod}
                    onChange={(e) => setRevenueTrendPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <button
                  onClick={() => handleExport('revenue')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {loadingRevenueTrends ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : revenueTrends?.trends && revenueTrends.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueTrends.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      if (revenueTrendPeriod === 'year') return value;
                      if (revenueTrendPeriod === 'month') {
                        const [year, month] = value.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      }
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
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
                    formatter={(value) => [`$${(Number(value ?? 0) / 100).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(value) => {
                      if (revenueTrendPeriod === 'year') return value;
                      if (revenueTrendPeriod === 'month') {
                        const [year, month] = value.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      }
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <BarChartIcon className="h-8 w-8 mb-2 text-gray-300" />
                <p>No revenue trend data available for the selected period.</p>
              </div>
            )}
          </div>

          {/* Revenue Breakdown by Package and Add-Ons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Package */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Package</h3>
              {revenueByPackage && revenueByPackage.length > 0 ? (
                <div className="space-y-3">
                  {revenueByPackage.map((pkg, index) => (
                    <div key={pkg.packageId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{pkg.packageName}</div>
                          <div className="text-xs text-gray-500">{pkg.bookingCount} bookings</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${(pkg.totalRevenue / 100).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Avg: ${(pkg.averageBookingValue / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <Package className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No package revenue data available.</p>
                </div>
              )}
            </div>

            {/* Revenue by Add-On Category */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Add-On Category</h3>
              {revenueByAddOnCategory && revenueByAddOnCategory.length > 0 ? (
                <div className="space-y-3">
                  {revenueByAddOnCategory.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {category.category.toLowerCase().replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-500">{category.totalCount} items sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${(category.totalRevenue / 100).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Avg: ${(category.averagePrice / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <Package className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No add-on revenue data available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Projected Revenue */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PiggyBank className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Projected Revenue</h3>
            </div>

            {loadingProjectedRevenue ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : projectedRevenue ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700 mb-1">Total Projected</div>
                    <div className="text-2xl font-bold text-green-800">
                      ${(projectedRevenue.projectedRevenue / 100).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      From {projectedRevenue.totalPendingBookings} pending bookings
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">Upcoming Trips (90d)</div>
                    <div className="text-2xl font-bold text-blue-800">
                      ${(projectedRevenue.upcomingTripsRevenue / 100).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-700 mb-1">Pending Payments</div>
                    <div className="text-2xl font-bold text-yellow-800">
                      ${(projectedRevenue.pendingPaymentsRevenue / 100).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-700 mb-1">Annualized Revenue</div>
                    <div className="text-2xl font-bold text-purple-800">
                      ${(projectedRevenue.annualizedRevenue / 100).toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Based on MRR of ${(projectedRevenue.mrr / 100).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Booking Pipeline */}
                {projectedRevenue.bookingPipeline && projectedRevenue.bookingPipeline.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Booking Pipeline</h4>
                    <div className="flex gap-4 flex-wrap">
                      {projectedRevenue.bookingPipeline.map((stage) => (
                        <div key={stage.status} className="flex-1 min-w-[150px] p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 capitalize">
                            {stage.status.toLowerCase().replace('_', ' ')}
                          </div>
                          <div className="text-xl font-bold text-gray-900">{stage.count}</div>
                          <div className="text-sm text-gray-500">
                            ${(stage.totalValue / 100).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <PiggyBank className="h-8 w-8 mb-2 text-gray-300" />
                <p>No projected revenue data available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* GUEST DEMOGRAPHICS TAB (E13-S5) */}
      {/* ================================================================ */}

      {activeTab === 'guest-demographics' && (
        <div className="space-y-6">
          {/* Demographics Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard
              title="Total Guests"
              value={demographicsOverview?.totalGuests ?? 0}
              icon={Users}
              loading={loadingDemographicsOverview}
            />
            <StatCard
              title="Avg. Age"
              value={demographicsOverview?.averageAge ?? 'N/A'}
              icon={Calendar}
              loading={loadingDemographicsOverview}
            />
            <StatCard
              title="Profile Completion"
              value={`${demographicsOverview?.profileCompletionRate ?? '0.0'}%`}
              icon={UserCheck}
              loading={loadingDemographicsOverview}
            />
            <StatCard
              title="Repeat Guests"
              value={demographicsOverview?.repeatGuestCount ?? 0}
              icon={Repeat}
              loading={loadingDemographicsOverview}
            />
            <StatCard
              title="Repeat Rate"
              value={`${demographicsOverview?.repeatGuestRate ?? '0.0'}%`}
              icon={Heart}
              trend={Number(demographicsOverview?.repeatGuestRate ?? 0) > 10 ? 'up' : undefined}
              loading={loadingDemographicsOverview}
            />
          </div>

          {/* Age Distribution and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Distribution Chart */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>

              {loadingAgeDistribution ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : ageDistribution?.distribution && ageDistribution.distribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ageDistribution.distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="bracket"
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
                        formatter={(value) => [Number(value ?? 0), 'Guests']}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Average Age: <span className="font-bold">{ageDistribution.averageAge}</span> |
                    Total with Age Data: <span className="font-bold">{ageDistribution.totalWithAge}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <Calendar className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No age distribution data available.</p>
                </div>
              )}
            </div>

            {/* Location Distribution */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Locations</h3>

              {loadingLocationDistribution ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : locationDistribution?.locations && locationDistribution.locations.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {locationDistribution.locations.map((loc, index) => (
                    <div
                      key={loc.location}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{loc.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{loc.count}</div>
                        <div className="text-xs text-gray-500">{loc.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <MapPin className="h-8 w-8 mb-2 text-gray-300" />
                  <p>No location data available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Packages by Age Group */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Packages by Age Group
            </h3>

            {loadingPackagesByDemographic ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : packagesByDemographic && packagesByDemographic.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Age Group
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        Top Packages
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagesByDemographic.map((ageData) => (
                      <tr key={ageData.ageGroup} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg">
                            {ageData.ageGroup}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ageData.packages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {ageData.packages.map((pkg) => (
                                <span
                                  key={pkg.packageId}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded"
                                >
                                  {pkg.packageName}
                                  <span className="text-xs font-bold text-gray-500">
                                    ({pkg.count})
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <Package className="h-8 w-8 mb-2 text-gray-300" />
                <p>No package preference data available.</p>
              </div>
            )}
          </div>

          {/* Guest Acquisition Sources */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guest Acquisition Sources
            </h3>

            {loadingAcquisitionSources ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : acquisitionSources ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* By Referral Source */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">By Referral Source</h4>
                  <div className="space-y-2">
                    {acquisitionSources.byReferralSource.slice(0, 8).map((source) => (
                      <div
                        key={source.source}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {source.source}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{source.count}</span>
                          <span className="text-xs text-gray-500">({source.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By UTM Source */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">By UTM Source</h4>
                  {acquisitionSources.byUtmSource.length > 0 ? (
                    <div className="space-y-2">
                      {acquisitionSources.byUtmSource.map((source) => (
                        <div
                          key={source.source}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {source.source}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{source.count}</span>
                            <span className="text-xs text-gray-500">({source.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No UTM source data</p>
                  )}
                </div>

                {/* By UTM Medium */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">By UTM Medium</h4>
                  {acquisitionSources.byUtmMedium.length > 0 ? (
                    <div className="space-y-2">
                      {acquisitionSources.byUtmMedium.map((medium) => (
                        <div
                          key={medium.medium}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {medium.medium}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{medium.count}</span>
                            <span className="text-xs text-gray-500">({medium.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No UTM medium data</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <Globe className="h-8 w-8 mb-2 text-gray-300" />
                <p>No acquisition source data available.</p>
              </div>
            )}
          </div>

          {/* Medical Procedures by Age Group */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Procedures by Age Group
              </h3>
            </div>

            {loadingMedicalProcedures ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : medicalProceduresByDemographic && medicalProceduresByDemographic.length > 0 ? (
              <div className="space-y-6">
                {medicalProceduresByDemographic.map((ageGroup) => {
                  const hasData = ageGroup.categories.some((c) => c.totalCount > 0);
                  if (!hasData) return null;

                  return (
                    <div key={ageGroup.ageGroup} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Age {ageGroup.ageGroup}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {ageGroup.categories.map((category) => {
                          if (category.totalCount === 0) return null;

                          const categoryColors: Record<string, string> = {
                            DENTAL: 'bg-blue-50 border-blue-200',
                            FACIAL_COSMETIC: 'bg-pink-50 border-pink-200',
                            BODY: 'bg-green-50 border-green-200',
                            HEALTH_SCREENING: 'bg-purple-50 border-purple-200',
                          };

                          const colorClass = categoryColors[category.category] || 'bg-gray-50 border-gray-200';

                          return (
                            <div
                              key={category.category}
                              className={`p-3 rounded-lg border ${colorClass}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 capitalize">
                                  {category.category.toLowerCase().replace('_', ' ')}
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                  {category.totalCount}
                                </span>
                              </div>
                              {category.topProcedures.length > 0 && (
                                <div className="space-y-1">
                                  {category.topProcedures.slice(0, 3).map((proc) => (
                                    <div
                                      key={proc.name}
                                      className="flex items-center justify-between text-xs text-gray-600"
                                    >
                                      <span className="truncate max-w-[120px]">{proc.name}</span>
                                      <span className="font-medium">{proc.count}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <Stethoscope className="h-8 w-8 mb-2 text-gray-300" />
                <p>No medical procedure data available.</p>
              </div>
            )}
          </div>

          {/* Skill Level Distribution */}
          {demographicsOverview?.skillLevelDistribution &&
            demographicsOverview.skillLevelDistribution.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pickleball Skill Level Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demographicsOverview.skillLevelDistribution.map((skill) => {
                    const skillColors: Record<string, string> = {
                      RECREATIONAL: 'bg-green-100 text-green-800',
                      INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
                      ADVANCED: 'bg-red-100 text-red-800',
                    };
                    const colorClass = skillColors[skill.level] || 'bg-gray-100 text-gray-800';

                    return (
                      <div
                        key={skill.level}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-3xl font-bold text-gray-900">{skill.count}</div>
                        <div
                          className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full capitalize ${colorClass}`}
                        >
                          {skill.level.toLowerCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

      {/* ================================================================ */}
      {/* PACKAGE PERFORMANCE TAB (E13-S6) */}
      {/* ================================================================ */}

      {activeTab === 'package-performance' && (
        <div className="space-y-6">
          {/* Package Overview Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Package Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Packages"
                value={packageOverview?.length ?? 0}
                icon={Package}
                loading={loadingPackageOverview}
              />
              <StatCard
                title="Total Bookings"
                value={packageOverview?.reduce((sum, p) => sum + p.totalBookings, 0) ?? 0}
                icon={Users}
                loading={loadingPackageOverview}
              />
              <StatCard
                title="Total Revenue"
                value={`$${((packageOverview?.reduce((sum, p) => sum + p.totalRevenue, 0) ?? 0) / 100).toLocaleString()}`}
                icon={DollarSign}
                loading={loadingPackageOverview}
              />
              <StatCard
                title="Avg Booking Value"
                value={`$${(((packageOverview?.reduce((sum, p) => sum + p.avgBookingValue, 0) ?? 0) / (packageOverview?.length || 1)) / 100).toLocaleString()}`}
                icon={TrendingUp}
                loading={loadingPackageOverview}
              />
            </div>
          </div>

          {/* Package Comparison Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Comparison</h3>
            {loadingPackageComparison ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Package</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Bookings</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Completed</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Testimonials</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packageComparison?.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{pkg.name}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{pkg.totalBookings}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          ${(pkg.totalRevenue / 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{pkg.completedBookings}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{pkg.testimonialCount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            pkg.satisfactionScore === 'Positive'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {pkg.satisfactionScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Add-Ons with Attach Rates */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Add-Ons by Attach Rate</h3>
            {loadingTopPackageAddOns ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Add-On</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Bookings</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Attach Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPackageAddOns?.map((addOn) => (
                      <tr key={addOn.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{addOn.name}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 capitalize">
                            {addOn.category.toLowerCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{addOn.bookingCount}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{addOn.totalQuantity}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          ${(addOn.totalRevenue / 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            Number(addOn.attachRate) >= 20 ? 'text-green-600' :
                            Number(addOn.attachRate) >= 10 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {addOn.attachRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Seasonal Trends Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Seasonal Trends ({seasonalTrends?.year || new Date().getFullYear()})
            </h3>
            {loadingSeasonalTrends ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : seasonalTrends?.months && seasonalTrends.months.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalTrends.months}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => [Number(value ?? 0), 'Bookings']}
                    />
                    <Legend />
                    {seasonalTrends.packageNames.map((name, index) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        fill={FUNNEL_STAGE_COLORS[index % FUNNEL_STAGE_COLORS.length]}
                        stackId="a"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No seasonal data available
              </div>
            )}
          </div>

          {/* Package Ratings from Testimonials */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Satisfaction (from Testimonials)</h3>
            {loadingPackageRatings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : packageRatings && packageRatings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageRatings.map((rating) => (
                  <div key={rating.packageName} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">{rating.packageName}</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">
                          {rating.testimonialCount} testimonial{rating.testimonialCount !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rating.totalViewCount.toLocaleString()} views
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded ${
                        rating.satisfactionIndicator === 'High'
                          ? 'bg-green-100 text-green-800'
                          : rating.satisfactionIndicator === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rating.satisfactionIndicator}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No testimonial data available
              </div>
            )}
          </div>

          {/* Underperforming Packages Alert */}
          {!loadingUnderperforming && underperformingPackages && underperformingPackages.length > 0 && (
            <div className="bg-amber-50 rounded-lg shadow border border-amber-200 p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Underperforming Packages
              </h3>
              <div className="space-y-4">
                {underperformingPackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 bg-white rounded-lg border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{pkg.name}</div>
                      <div className="flex gap-2">
                        {pkg.issues.map((issue) => (
                          <span
                            key={issue}
                            className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bookings:</span>{' '}
                        <span className="font-medium">{pkg.totalBookings}</span>
                        <span className={`ml-1 ${Number(pkg.bookingsVsAvg) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ({pkg.bookingsVsAvg}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue:</span>{' '}
                        <span className="font-medium">${(pkg.totalRevenue / 100).toLocaleString()}</span>
                        <span className={`ml-1 ${Number(pkg.revenueVsAvg) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ({pkg.revenueVsAvg}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversion:</span>{' '}
                        <span className="font-medium">{pkg.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
