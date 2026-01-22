/**
 * Custom Report Builder
 * E13-S10: Allow admins to build custom reports with selected metrics
 *
 * Features:
 * - Select metrics from available data points
 * - Choose visualization type (table, bar chart, line chart, pie chart)
 * - Apply filters and date ranges
 * - Save and name custom reports for reuse
 * - Export reports to CSV/PDF
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { exportToCSV, generateFilename } from '@/lib/utils/csv-export';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart2,
  Download,
  FileText,
  LineChart,
  Loader2,
  PieChart,
  Play,
  Plus,
  Save,
  Table,
  Trash2,
  X,
  Check,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

type VisualizationType = 'TABLE' | 'BAR_CHART' | 'LINE_CHART' | 'PIE_CHART';
type GroupByType = 'none' | 'daily' | 'weekly' | 'monthly' | 'package' | 'partner';
type DatePreset = 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

interface MetricInfo {
  id: string;
  name: string;
  category: string;
  type: 'count' | 'currency' | 'percentage';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VISUALIZATION_OPTIONS: { value: VisualizationType; label: string; icon: React.ElementType }[] = [
  { value: 'TABLE', label: 'Table', icon: Table },
  { value: 'BAR_CHART', label: 'Bar Chart', icon: BarChart2 },
  { value: 'LINE_CHART', label: 'Line Chart', icon: LineChart },
  { value: 'PIE_CHART', label: 'Pie Chart', icon: PieChart },
];

const GROUP_BY_OPTIONS: { value: GroupByType; label: string }[] = [
  { value: 'none', label: 'No Grouping' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'package', label: 'By Package' },
  { value: 'partner', label: 'By Partner' },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRangeFromPreset(preset: DatePreset): { startDate?: Date; endDate?: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'last7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: today,
      };
    case 'last30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: today,
      };
    case 'last90days':
      return {
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: today,
      };
    case 'thisMonth':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: today,
      };
    case 'lastMonth':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    case 'thisYear':
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: today,
      };
    default:
      return {};
  }
}

function formatMetricValue(value: unknown, type: string): string {
  if (typeof value === 'number') {
    if (type === 'currency') {
      return `$${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (type === 'percentage') {
      return `${value.toFixed(2)}%`;
    }
    return value.toLocaleString();
  }
  return String(value);
}

// ============================================================================
// METRIC SELECTOR COMPONENT
// ============================================================================

function MetricSelector({
  metrics,
  selectedMetrics,
  onToggle,
}: {
  metrics: MetricInfo[];
  selectedMetrics: string[];
  onToggle: (metricId: string) => void;
}) {
  const groupedMetrics = useMemo(() => {
    const groups: Record<string, MetricInfo[]> = {};
    metrics.forEach((m) => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [metrics]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {categoryMetrics.map((metric) => {
              const isSelected = selectedMetrics.includes(metric.id);
              return (
                <button
                  key={metric.id}
                  onClick={() => onToggle(metric.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Plus className="h-4 w-4 text-gray-400" />
                    )}
                    <span>{metric.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// RESULTS DISPLAY COMPONENT
// ============================================================================

function ResultsDisplay({
  results,
  metrics,
  visualization,
  groupBy,
}: {
  results: Record<string, unknown>;
  metrics: MetricInfo[];
  visualization: VisualizationType;
  groupBy: GroupByType;
}) {
  const selectedMetricInfo = useMemo(() => {
    const info: Record<string, MetricInfo> = {};
    metrics.forEach((m) => {
      info[m.id] = m;
    });
    return info;
  }, [metrics]);

  // Prepare chart data (must be before any conditional returns for hooks rule)
  const chartData = useMemo(() => {
    if (groupBy === 'none') {
      // Single value per metric - good for pie chart
      return Object.entries(results).map(([metricId, value]) => ({
        name: selectedMetricInfo[metricId]?.name || metricId,
        value: typeof value === 'number' ? value : 0,
      }));
    }

    // Grouped data - combine into single array
    const firstMetric = Object.values(results).find(Array.isArray);
    if (!firstMetric) return [];

    return (firstMetric as Array<{ period?: string; name?: string; value: number }>).map((item, idx) => {
      const entry: Record<string, unknown> = {
        name: item.period || item.name || `Item ${idx + 1}`,
      };
      Object.entries(results).forEach(([metricId, value]) => {
        if (Array.isArray(value)) {
          entry[selectedMetricInfo[metricId]?.name || metricId] = value[idx]?.value || 0;
        }
      });
      return entry;
    });
  }, [results, groupBy, selectedMetricInfo]);

  // For table view
  if (visualization === 'TABLE') {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {groupBy !== 'none' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {groupBy === 'package' || groupBy === 'partner' ? 'Name' : 'Period'}
                </th>
              )}
              {Object.keys(results).map((metricId) => (
                <th
                  key={metricId}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {selectedMetricInfo[metricId]?.name || metricId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groupBy === 'none' ? (
              <tr>
                {Object.entries(results).map(([metricId, value]) => (
                  <td key={metricId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMetricValue(value, selectedMetricInfo[metricId]?.type || 'count')}
                  </td>
                ))}
              </tr>
            ) : (
              // Handle grouped data
              (() => {
                // Get the first metric with array data to determine periods
                const firstArrayMetric = Object.entries(results).find(
                  ([, value]) => Array.isArray(value)
                );
                if (!firstArrayMetric) return null;

                const periods = (firstArrayMetric[1] as Array<{ period?: string; name?: string }>).map(
                  (item) => item.period || item.name || ''
                );

                return periods.map((period, idx) => (
                  <tr key={period}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {period}
                    </td>
                    {Object.entries(results).map(([metricId, value]) => {
                      const arr = value as Array<{ value: number }>;
                      return (
                        <td
                          key={metricId}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {formatMetricValue(
                            arr[idx]?.value || 0,
                            selectedMetricInfo[metricId]?.type || 'count'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (visualization === 'BAR_CHART') {
    const metricKeys = Object.keys(results).map((id) => selectedMetricInfo[id]?.name || id);
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number | undefined) => Number(value ?? 0).toLocaleString()}
            />
            <Legend />
            {groupBy === 'none'
              ? <Bar dataKey="value" fill={CHART_COLORS[0]} />
              : metricKeys.map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))
            }
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualization === 'LINE_CHART') {
    const metricKeys = Object.keys(results).map((id) => selectedMetricInfo[id]?.name || id);
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number | undefined) => Number(value ?? 0).toLocaleString()}
            />
            <Legend />
            {groupBy === 'none'
              ? <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} />
              : metricKeys.map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))
            }
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (visualization === 'PIE_CHART') {
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | undefined) => Number(value ?? 0).toLocaleString()} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

// ============================================================================
// SAVED REPORTS LIST COMPONENT
// ============================================================================

function SavedReportsList({
  onLoadReport,
}: {
  onLoadReport: (report: {
    id: string;
    name: string;
    metrics: string[];
    visualization: VisualizationType;
    groupBy?: string;
    dateRange?: Record<string, unknown>;
  }) => void;
}) {
  const { data: reports, isLoading, refetch } = trpc.analytics.customReports.list.useQuery();
  const deleteReport = trpc.analytics.customReports.delete.useMutation({
    onSuccess: () => {
      toast.success('Report deleted');
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete report');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No saved reports yet. Create your first report above!
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {reports.map((report) => (
        <div key={report.id} className="py-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{report.name}</h4>
            {report.description && (
              <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {(report.metrics as string[]).length} metrics | {report.visualization}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onLoadReport({
                  id: report.id,
                  name: report.name,
                  metrics: report.metrics as string[],
                  visualization: report.visualization as VisualizationType,
                  groupBy: report.groupBy || undefined,
                  dateRange: report.dateRange as Record<string, unknown> | undefined,
                })
              }
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              Load
            </button>
            <button
              onClick={() => deleteReport.mutate({ id: report.id })}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomReportBuilderPage() {
  // State
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [visualization, setVisualization] = useState<VisualizationType>('TABLE');
  const [groupBy, setGroupBy] = useState<GroupByType>('none');
  const [datePreset, setDatePreset] = useState<DatePreset>('last30days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Queries
  const { data: availableMetrics, isLoading: isLoadingMetrics } =
    trpc.analytics.customReports.getAvailableMetrics.useQuery();

  // Compute date range
  const dateRange = useMemo(() => {
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate ? new Date(customStartDate) : undefined,
        endDate: customEndDate ? new Date(customEndDate) : undefined,
      };
    }
    return getDateRangeFromPreset(datePreset);
  }, [datePreset, customStartDate, customEndDate]);

  // Run report query (only when metrics are selected)
  const {
    data: reportResults,
    isLoading: isRunningReport,
    refetch: runReport,
  } = trpc.analytics.customReports.runReport.useQuery(
    {
      metrics: selectedMetrics,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      groupBy,
    },
    {
      enabled: selectedMetrics.length > 0,
    }
  );

  // Save report mutation
  const saveReport = trpc.analytics.customReports.save.useMutation({
    onSuccess: () => {
      toast.success('Report saved successfully');
      setShowSaveModal(false);
      setReportName('');
    },
    onError: () => {
      toast.error('Failed to save report');
    },
  });

  // Handlers
  const handleMetricToggle = useCallback((metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId) ? prev.filter((id) => id !== metricId) : [...prev, metricId]
    );
  }, []);

  const handleSaveReport = useCallback(() => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    saveReport.mutate({
      name: reportName,
      metrics: selectedMetrics,
      visualization,
      groupBy,
      dateRange: {
        preset: datePreset,
        ...(datePreset === 'custom' && { customStartDate, customEndDate }),
      },
    });
  }, [reportName, selectedMetrics, visualization, groupBy, datePreset, customStartDate, customEndDate, saveReport]);

  const handleLoadReport = useCallback(
    (report: {
      id: string;
      name: string;
      metrics: string[];
      visualization: VisualizationType;
      groupBy?: string;
      dateRange?: Record<string, unknown>;
    }) => {
      setSelectedMetrics(report.metrics);
      setVisualization(report.visualization);
      setGroupBy((report.groupBy as GroupByType) || 'none');
      if (report.dateRange) {
        const dr = report.dateRange as { preset?: DatePreset; customStartDate?: string; customEndDate?: string };
        setDatePreset(dr.preset || 'last30days');
        if (dr.customStartDate) setCustomStartDate(dr.customStartDate);
        if (dr.customEndDate) setCustomEndDate(dr.customEndDate);
      }
      toast.success(`Loaded report: ${report.name}`);
    },
    []
  );

  const handleExportCSV = useCallback(() => {
    if (!reportResults?.results) {
      toast.error('No data to export');
      return;
    }

    const headers: string[] = [];
    const rows: (string | number)[][] = [];

    // Build headers from selected metrics
    selectedMetrics.forEach((metricId) => {
      const metric = availableMetrics?.find((m) => m.id === metricId);
      headers.push(metric?.name || metricId);
    });

    // Build row data
    if (reportResults.groupBy === 'none') {
      const row: (string | number)[] = [];
      selectedMetrics.forEach((metricId) => {
        const value = reportResults.results[metricId];
        row.push(typeof value === 'number' ? value : 0);
      });
      rows.push(row);
    } else {
      // For grouped data, add period/name column
      headers.unshift(reportResults.groupBy === 'package' || reportResults.groupBy === 'partner' ? 'Name' : 'Period');

      const firstMetric = Object.values(reportResults.results).find(Array.isArray);
      if (firstMetric && Array.isArray(firstMetric)) {
        firstMetric.forEach((item: { period?: string; name?: string; value: number }, idx: number) => {
          const row: (string | number)[] = [item.period || item.name || `Row ${idx + 1}`];
          selectedMetrics.forEach((metricId) => {
            const metricData = reportResults.results[metricId];
            if (Array.isArray(metricData)) {
              row.push((metricData as Array<{ value: number }>)[idx]?.value || 0);
            } else {
              row.push(0);
            }
          });
          rows.push(row);
        });
      }
    }

    exportToCSV({ headers, rows }, generateFilename('custom-report'));
    toast.success('Report exported to CSV');
  }, [reportResults, selectedMetrics, availableMetrics]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/analytics"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Custom Report Builder</h1>
              <p className="text-sm text-gray-500">Create and save custom analytics reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedMetrics.length > 0 && reportResults && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Report
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Metrics Selection */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Select Metrics
              </h3>
              {isLoadingMetrics ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <MetricSelector
                  metrics={(availableMetrics || []) as MetricInfo[]}
                  selectedMetrics={selectedMetrics}
                  onToggle={handleMetricToggle}
                />
              )}
              {selectedMetrics.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {selectedMetrics.length} metric(s) selected
                  </p>
                </div>
              )}
            </div>

            {/* Visualization Type */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Visualization
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {VISUALIZATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setVisualization(option.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                        visualization === option.value
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </h3>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
              {datePreset === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>

            {/* Group By */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Group By
              </h3>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GROUP_BY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Saved Reports */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved Reports
              </h3>
              <SavedReportsList onLoadReport={handleLoadReport} />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              {selectedMetrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BarChart2 className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select Metrics to Build Your Report
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Choose one or more metrics from the left panel, configure your visualization
                    preferences, and run the report to see your data.
                  </p>
                </div>
              ) : isRunningReport ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-gray-500">Running report...</p>
                </div>
              ) : reportResults ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Report Results</h3>
                    <button
                      onClick={() => runReport()}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                    >
                      <Play className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                  <ResultsDisplay
                    results={reportResults.results}
                    metrics={(availableMetrics || []) as MetricInfo[]}
                    visualization={visualization}
                    groupBy={groupBy}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save Report</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Monthly Revenue Overview"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  <strong>Metrics:</strong> {selectedMetrics.length} selected
                </p>
                <p>
                  <strong>Visualization:</strong> {visualization.replace('_', ' ')}
                </p>
                <p>
                  <strong>Group By:</strong> {groupBy}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={saveReport.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saveReport.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
