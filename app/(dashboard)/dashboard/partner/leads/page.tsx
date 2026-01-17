/**
 * Partner Lead Management Page
 * E9-S6: Lead Management
 *
 * Features:
 * - Funnel visualization (clicks → applications → bookings)
 * - Leads table with applications and bookings
 * - Lead details modal
 * - Filtering and sorting
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Loader2,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LeadFilter = 'all' | 'applications' | 'bookings';

const FILTER_OPTIONS: { value: LeadFilter; label: string }[] = [
  { value: 'all', label: 'All Leads' },
  { value: 'applications', label: 'Applications Only' },
  { value: 'bookings', label: 'Bookings Only' },
];

interface Lead {
  id: string;
  type: 'application' | 'booking';
  guestName: string;
  guestEmail: string;
  applicationDate?: Date;
  applicationStatus?: string;
  bookingStatus?: string;
  bookingValue?: number;
  pointsEarned?: number;
  bookingReference?: string;
  lastActivityDate: Date;
  interests?: string[];
  preferredDuration?: string;
}

export default function PartnerLeadsPage() {
  const [filter, setFilter] = useState<LeadFilter>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data, isLoading, error } = trpc.partner.getLeads.useQuery({
    filter,
  });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading leads: {error.message}</p>
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
            <li className="font-medium text-slate-900">Lead Management</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Lead Management</h1>
          <p className="mt-1 text-slate-600">
            Track your leads from application to booking
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : data ? (
          <>
            {/* Funnel Visualization */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Conversion Funnel</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Total Clicks */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Leads</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {data.funnel.totalClicks}
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Applications */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700">Applications</p>
                      <p className="mt-1 text-2xl font-bold text-amber-900">
                        {data.funnel.totalApplications}
                      </p>
                      {data.funnel.totalClicks > 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          {Math.round(
                            (data.funnel.totalApplications / data.funnel.totalClicks) * 100
                          )}
                          % conversion
                        </p>
                      )}
                    </div>
                    <div className="rounded-full bg-amber-100 p-3">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700">Bookings</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-900">
                        {data.funnel.totalBookings}
                      </p>
                      {data.funnel.totalApplications > 0 && (
                        <p className="mt-1 text-xs text-emerald-600">
                          {data.funnel.conversionRate}% conversion
                        </p>
                      )}
                    </div>
                    <div className="rounded-full bg-emerald-100 p-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Funnel Bars */}
              <div className="mt-6 space-y-2">
                <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="flex items-center justify-center bg-blue-500 text-xs font-medium text-white transition-all"
                    style={{
                      width: `${Math.min((data.funnel.totalClicks / Math.max(data.funnel.totalClicks, 1)) * 100, 100)}%`,
                    }}
                  >
                    {data.funnel.totalClicks > 0 && data.funnel.totalClicks}
                  </div>
                </div>
                <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="flex items-center justify-center bg-amber-500 text-xs font-medium text-white transition-all"
                    style={{
                      width: `${Math.min((data.funnel.totalApplications / Math.max(data.funnel.totalClicks, 1)) * 100, 100)}%`,
                    }}
                  >
                    {data.funnel.totalApplications > 0 && data.funnel.totalApplications}
                  </div>
                </div>
                <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="flex items-center justify-center bg-emerald-500 text-xs font-medium text-white transition-all"
                    style={{
                      width: `${Math.min((data.funnel.totalBookings / Math.max(data.funnel.totalClicks, 1)) * 100, 100)}%`,
                    }}
                  >
                    {data.funnel.totalBookings > 0 && data.funnel.totalBookings}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Filter Leads</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as LeadFilter)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">All Leads</h2>
              </div>
              {data.leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-6 py-3">Guest</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Value</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{lead.guestName}</p>
                              <p className="text-sm text-slate-500">{lead.guestEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                lead.type === 'booking'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              )}
                            >
                              {lead.type === 'booking' ? 'Booking' : 'Application'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                                lead.bookingStatus === 'CONFIRMED' ||
                                  lead.applicationStatus === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : lead.bookingStatus === 'PENDING_PAYMENT' ||
                                    lead.applicationStatus === 'SUBMITTED'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {lead.bookingStatus || lead.applicationStatus || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {lead.bookingValue ? (
                              <>${(lead.bookingValue / 100).toLocaleString()}</>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(lead.lastActivityDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">No leads found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {filter !== 'all'
                      ? 'Try adjusting your filter'
                      : 'Start sharing your referral code to generate leads!'}
                  </p>
                </div>
              )}
            </div>

            {/* Lead Details Modal */}
            {selectedLead && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={() => setSelectedLead(null)}
              >
                <div
                  className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Lead Details</h2>
                      <button
                        onClick={() => setSelectedLead(null)}
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
                        <p className="font-medium text-slate-900">{selectedLead.guestName}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          {selectedLead.guestEmail}
                        </div>
                      </div>
                    </div>

                    {/* Application Info */}
                    {selectedLead.type === 'application' && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-slate-500">
                          Application Details
                        </h3>
                        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Status</span>
                            <span className="font-medium text-slate-900">
                              {selectedLead.applicationStatus || 'N/A'}
                            </span>
                          </div>
                          {selectedLead.applicationDate && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Application Date</span>
                              <span className="font-medium text-slate-900">
                                {new Date(selectedLead.applicationDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {selectedLead.interests && selectedLead.interests.length > 0 && (
                            <div>
                              <span className="text-slate-600">Interests</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {selectedLead.interests.map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                                  >
                                    {interest.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedLead.preferredDuration && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Preferred Duration</span>
                              <span className="font-medium text-slate-900">
                                {selectedLead.preferredDuration} days
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Booking Info */}
                    {selectedLead.type === 'booking' && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-slate-500">Booking Details</h3>
                        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                          {selectedLead.bookingReference && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Reference</span>
                              <span className="font-medium text-slate-900">
                                {selectedLead.bookingReference}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-600">Status</span>
                            <span className="font-medium text-slate-900">
                              {selectedLead.bookingStatus || 'N/A'}
                            </span>
                          </div>
                          {selectedLead.bookingValue && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Value</span>
                              <span className="font-medium text-slate-900">
                                ${(selectedLead.bookingValue / 100).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedLead.pointsEarned && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Points Earned</span>
                              <span className="font-semibold text-emerald-600">
                                +{selectedLead.pointsEarned}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-slate-500">Timeline</h3>
                      <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                        {selectedLead.applicationDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600">Applied:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(selectedLead.applicationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedLead.type === 'booking' && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600">Booked:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(selectedLead.lastActivityDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 px-6 py-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedLead(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
