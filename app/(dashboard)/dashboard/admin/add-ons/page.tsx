/**
 * Admin Add-On Management Interface
 * A3-S1: Package & Add-On Management (5 pts)
 *
 * Features:
 * - View all add-ons (active and inactive)
 * - Create new add-ons
 * - Edit existing add-ons
 * - Toggle add-on active/inactive status
 * - Delete add-ons (if not in bookings)
 * - Filter by category
 * - See booking count per add-on
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Tag,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddOnCategory } from '@prisma/client';

const CATEGORY_LABELS: Record<AddOnCategory, string> = {
  DENTAL: 'Dental',
  FACIAL_COSMETIC: 'Facial & Cosmetic',
  BODY: 'Body',
  HEALTH_SCREENING: 'Health Screening',
  SPA: 'Spa & Wellness',
  YOGA_MEDITATION: 'Yoga & Meditation',
  CULTURAL: 'Cultural Experiences',
  PICKLEBALL: 'Pickleball',
};

const CATEGORY_COLORS: Record<AddOnCategory, string> = {
  DENTAL: 'bg-blue-100 text-blue-700',
  FACIAL_COSMETIC: 'bg-purple-100 text-purple-700',
  BODY: 'bg-pink-100 text-pink-700',
  HEALTH_SCREENING: 'bg-red-100 text-red-700',
  SPA: 'bg-emerald-100 text-emerald-700',
  YOGA_MEDITATION: 'bg-indigo-100 text-indigo-700',
  CULTURAL: 'bg-amber-100 text-amber-700',
  PICKLEBALL: 'bg-orange-100 text-orange-700',
};

export default function AdminAddOnsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | 'ALL'>('ALL');

  // Fetch all add-ons (admin view)
  const { data: addOns, isLoading, refetch } = trpc.addOn.adminGetAll.useQuery();

  // Mutations
  const toggleActiveMutation = trpc.addOn.adminToggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.addOn.adminDelete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this add-on?`)) {
      try {
        await toggleActiveMutation.mutateAsync({
          id,
          isActive: !currentStatus,
        });
      } catch (error) {
        console.error('Failed to toggle add-on status:', error);
        alert('Failed to update add-on status');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error: unknown) {
        console.error('Failed to delete add-on:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete add-on. It may be in existing bookings.';
        alert(message);
      }
    }
  };

  const filteredAddOns = addOns?.filter((addOn) => {
    const matchesSearch =
      addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || addOn.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = addOns?.reduce((acc, addOn) => {
    acc[addOn.category] = (acc[addOn.category] || 0) + 1;
    return acc;
  }, {} as Record<AddOnCategory, number>);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add-On Management</h1>
              <p className="mt-2 text-slate-600">
                Create and manage add-ons for the booking flow
              </p>
            </div>
            <Link href="/dashboard/admin/add-ons/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Add-On
              </Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="mt-6 flex gap-4">
            <Input
              placeholder="Search add-ons by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AddOnCategory | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} {categoryCounts?.[key as AddOnCategory] ? `(${categoryCounts[key as AddOnCategory]})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <Tag className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Add-Ons</p>
                <p className="text-2xl font-bold text-slate-900">{addOns?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Add-Ons</p>
                <p className="text-2xl font-bold text-slate-900">
                  {addOns?.filter((a) => a.isActive).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-100 p-3">
                <Filter className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Categories</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.keys(CATEGORY_LABELS).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add-On List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {categoryFilter === 'ALL' ? 'All Add-Ons' : CATEGORY_LABELS[categoryFilter]}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredAddOns && filteredAddOns.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredAddOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {addOn.name}
                        </h3>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', CATEGORY_COLORS[addOn.category])}>
                          {CATEGORY_LABELS[addOn.category]}
                        </span>
                        {addOn.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {addOn.description && (
                        <p className="mt-1 text-sm text-slate-600">{addOn.description}</p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          Thailand: ${(addOn.thPrice / 100).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <DollarSign className="h-4 w-4" />
                          US Comparison: ${(addOn.usPrice / 100).toLocaleString()}
                        </div>
                        <div className="text-slate-600">
                          {addOn._count.bookingAddOns} booking{addOn._count.bookingAddOns !== 1 ? 's' : ''}
                        </div>
                        <div className="text-emerald-600 font-medium">
                          Save {Math.round(((addOn.usPrice - addOn.thPrice) / addOn.usPrice) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/admin/add-ons/${addOn.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(addOn.id, addOn.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {addOn.isActive ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(addOn.id, addOn.name)}
                        disabled={deleteMutation.isPending || addOn._count.bookingAddOns > 0}
                        className={cn(
                          addOn._count.bookingAddOns > 0 && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No add-ons found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || categoryFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first add-on'}
              </p>
              {!searchQuery && categoryFilter === 'ALL' && (
                <Link href="/dashboard/admin/add-ons/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Add-On
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
