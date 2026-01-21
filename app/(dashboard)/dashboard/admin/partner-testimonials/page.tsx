/**
 * Admin Partner Testimonials Page
 * E9-S18: Partner Testimonials System
 *
 * Features:
 * - View all testimonials with filtering (pending/approved/featured)
 * - Approve, feature, or delete testimonials
 * - See partner info and statistics
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  Award,
  Trash2,
  Clock,
  CheckCircle2,
  MessageSquare,
  Building2,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'FEATURED';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Testimonials' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'FEATURED', label: 'Featured' },
];

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-700',
  SILVER: 'bg-slate-100 text-slate-700',
  GOLD: 'bg-yellow-100 text-yellow-700',
  PLATINUM: 'bg-purple-100 text-purple-700',
};

export default function AdminPartnerTestimonialsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 20;

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Build query filters
  const queryFilters = {
    ...(statusFilter === 'PENDING' && { isApproved: false }),
    ...(statusFilter === 'APPROVED' && { isApproved: true, isFeatured: false }),
    ...(statusFilter === 'FEATURED' && { isFeatured: true }),
    limit,
    offset: page * limit,
  };

  // Query testimonials
  const { data, isLoading, error, refetch } = trpc.admin.getTestimonials.useQuery(queryFilters);

  // Query stats
  const { data: stats } = trpc.admin.getTestimonialStats.useQuery();

  // Mutations
  const approveTestimonial = trpc.admin.approveTestimonial.useMutation({
    onSuccess: () => {
      toast.success('Testimonial approved');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve testimonial');
    },
  });

  const featureTestimonial = trpc.admin.featureTestimonial.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isFeatured ? 'Testimonial featured' : 'Testimonial unfeatured');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update testimonial');
    },
  });

  const deleteTestimonial = trpc.admin.deleteTestimonial.useMutation({
    onSuccess: () => {
      toast.success('Testimonial deleted');
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete testimonial');
    },
  });

  const getStatusBadge = (testimonial: { isApproved: boolean; isFeatured: boolean }) => {
    if (testimonial.isFeatured) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
          <Award className="h-3 w-3" />
          Featured
        </span>
      );
    }
    if (testimonial.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error loading testimonials: {error.message}</p>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/admin" className="text-slate-600 hover:text-slate-900">
                Admin Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Partner Testimonials</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Partner Testimonials</h1>
          <p className="mt-1 text-slate-600">
            Review and manage partner testimonials
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-600">Pending</p>
              <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-600">Approved</p>
              <p className="text-2xl font-bold text-emerald-900">{stats.approved}</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-600">Featured</p>
              <p className="text-2xl font-bold text-purple-900">{stats.featured}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-600">Avg Rating</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                <Star className="ml-1 inline h-5 w-5 fill-amber-400 text-amber-400" />
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(0);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : data && data.testimonials.length > 0 ? (
          <div className="space-y-4">
            {data.testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(testimonial)}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= testimonial.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!testimonial.isApproved && (
                      <Button
                        size="sm"
                        onClick={() => approveTestimonial.mutate({ id: testimonial.id })}
                        disabled={approveTestimonial.isPending}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    {testimonial.isApproved && (
                      <Button
                        size="sm"
                        variant={testimonial.isFeatured ? 'outline' : 'default'}
                        onClick={() =>
                          featureTestimonial.mutate({
                            id: testimonial.id,
                            isFeatured: !testimonial.isFeatured,
                          })
                        }
                        disabled={featureTestimonial.isPending}
                        className="gap-1"
                      >
                        <Award className="h-4 w-4" />
                        {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(testimonial.id)}
                      className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <p className="mb-4 text-slate-700">{testimonial.content}</p>

                {/* Partner Info */}
                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{testimonial.partner.clubName}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', TIER_COLORS[testimonial.partner.tier])}>
                      {testimonial.partner.tier}
                    </span>
                  </div>
                  {testimonial.partner.clubLocation && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {testimonial.partner.clubLocation}
                    </div>
                  )}
                  <span className="text-sm text-slate-500">
                    {testimonial.partner.user.email}
                  </span>
                </div>

                {/* Dates */}
                <div className="mt-2 text-sm text-slate-500">
                  Submitted on {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {testimonial.approvedAt && (
                    <> &middot; Approved on {new Date(testimonial.approvedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}</>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, data.total)} of {data.total} testimonials
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!data.hasMore}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-900">No testimonials found</h3>
            <p className="text-slate-600">
              {statusFilter === 'PENDING'
                ? 'There are no testimonials waiting for review.'
                : statusFilter === 'APPROVED'
                ? 'No approved testimonials yet.'
                : statusFilter === 'FEATURED'
                ? 'No featured testimonials yet.'
                : 'Partners have not submitted any testimonials yet.'}
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-lg font-bold text-slate-900">Delete Testimonial?</h3>
              <p className="mb-4 text-slate-600">
                Are you sure you want to delete this testimonial? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteTestimonial.mutate({ id: deleteId })}
                  disabled={deleteTestimonial.isPending}
                >
                  {deleteTestimonial.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
