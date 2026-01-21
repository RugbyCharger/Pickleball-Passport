/**
 * Partner Testimonials Page
 * E9-S18: Partner Testimonials System
 *
 * Features:
 * - Submit new testimonial with content (max 500 chars) and star rating (1-5)
 * - View submitted testimonials with status (pending/approved/featured)
 * - Edit/delete pending testimonials
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  Plus,
  X,
  Star,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PartnerTestimonialsPage() {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
  });

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Query testimonials
  const { data: testimonials, isLoading, error, refetch } = trpc.partner.getMyTestimonials.useQuery();

  // Mutations
  const submitTestimonial = trpc.partner.submitTestimonial.useMutation({
    onSuccess: () => {
      toast.success('Testimonial submitted successfully! It will be reviewed by our team.');
      closeModal();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit testimonial');
    },
  });

  const updateTestimonial = trpc.partner.updateTestimonial.useMutation({
    onSuccess: () => {
      toast.success('Testimonial updated successfully');
      closeModal();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update testimonial');
    },
  });

  const deleteTestimonial = trpc.partner.deleteTestimonial.useMutation({
    onSuccess: () => {
      toast.success('Testimonial deleted');
      setDeleteId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete testimonial');
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ content: '', rating: 5 });
  };

  const openEditModal = (testimonial: { id: string; content: string; rating: number }) => {
    setEditingId(testimonial.id);
    setFormData({ content: testimonial.content, rating: testimonial.rating });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTestimonial.mutate({ id: editingId, ...formData });
    } else {
      submitTestimonial.mutate(formData);
    }
  };

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
        Pending Review
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Testimonials</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Testimonials</h1>
            <p className="mt-1 text-slate-600">
              Share your experience with the Pickleball Passport Partner Program
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Testimonial
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
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
                  {!testimonial.isApproved && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(testimonial)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(testimonial.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-slate-700">{testimonial.content}</p>
                <p className="mt-4 text-sm text-slate-500">
                  Submitted on {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {testimonial.approvedAt && (
                    <> &middot; Approved on {new Date(testimonial.approvedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Star className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-900">No testimonials yet</h3>
            <p className="mb-4 text-slate-600">
              Share your experience with the Partner Program to help other partners
            </p>
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Write a Testimonial
            </Button>
          </div>
        )}

        {/* Submit/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-4 text-xl font-bold text-slate-900">
                {editingId ? 'Edit Testimonial' : 'Submit a Testimonial'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Rating */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'h-8 w-8',
                            star <= formData.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Your Experience
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    maxLength={500}
                    rows={5}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Share your experience with the Pickleball Passport Partner Program..."
                    required
                  />
                  <p className="mt-1 text-sm text-slate-500">
                    {formData.content.length}/500 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitTestimonial.isPending || updateTestimonial.isPending}
                  >
                    {(submitTestimonial.isPending || updateTestimonial.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingId ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </div>
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
