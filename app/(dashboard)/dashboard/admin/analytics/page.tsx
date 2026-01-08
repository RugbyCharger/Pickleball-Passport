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
  BarChart,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Calendar,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

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
// MAIN ANALYTICS DASHBOARD
// ============================================================================

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});

  // Fetch analytics data
  const { data: conversionFunnel, isLoading: loadingConversion } =
    trpc.analytics.conversion.getFunnel.useQuery(dateRange);

  const { data: statusBreakdown, isLoading: loadingStatus } =
    trpc.analytics.conversion.getStatusBreakdown.useQuery(dateRange);

  const { data: revenueOverview, isLoading: loadingRevenue } =
    trpc.analytics.revenue.getOverview.useQuery(dateRange);

  const { data: revenueByPackage, isLoading: loadingPackageRevenue } =
    trpc.analytics.revenue.getByPackage.useQuery(dateRange);

  const { data: demographics, isLoading: loadingDemographics } =
    trpc.analytics.demographics.getByRole.useQuery();

  const { data: accommodationTiers, isLoading: loadingAccommodation } =
    trpc.analytics.demographics.getAccommodationTiers.useQuery(dateRange);

  const { data: topAddOns, isLoading: loadingAddOns } =
    trpc.analytics.addOns.getTopAddOns.useQuery({ limit: 10 });

  const { data: tripUtilization, isLoading: loadingTrips } =
    trpc.analytics.tripUtilization.getAll.useQuery({ isActive: true, limit: 10 });

  const { data: partnerStats, isLoading: loadingPartners } =
    trpc.analytics.partnerReferrals.getByPartner.useQuery({ limit: 10 });

  const { data: bookingPatterns } =
    trpc.analytics.demographics.getBookingPatterns.useQuery(dateRange);

  // CSV Export mutation
  const exportMutation = trpc.analytics.export.generateCSV.useQuery(
    {
      reportType: 'bookings',
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: false }
  );

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

      {/* Date Range Filter */}
      <DateRangeFilter onChange={setDateRange} />

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
            icon={BarChart}
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
    </div>
  );
}
