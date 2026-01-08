/**
 * Admin Package Management Interface
 * A3-S1: Package & Add-On Management (5 pts)
 *
 * Features:
 * - View all packages (active and inactive)
 * - Create new packages
 * - Edit existing packages
 * - Toggle package active/inactive status
 * - Delete packages (if no bookings)
 * - See booking count per package
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPackagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all packages (admin view)
  const { data: packages, isLoading, refetch } = trpc.package.adminGetAll.useQuery();

  // Mutations
  const toggleActiveMutation = trpc.package.adminToggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.package.adminDelete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this package?`)) {
      try {
        await toggleActiveMutation.mutateAsync({
          id,
          isActive: !currentStatus,
        });
      } catch (error) {
        console.error('Failed to toggle package status:', error);
        alert('Failed to update package status');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error: unknown) {
        console.error('Failed to delete package:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete package. It may have existing bookings.';
        alert(message);
      }
    }
  };

  const filteredPackages = packages?.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Package Management</h1>
              <p className="mt-2 text-slate-600">
                Create and manage packages for the booking flow
              </p>
            </div>
            <Link href="/dashboard/admin/packages/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Package
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6">
            <Input
              placeholder="Search packages by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Packages</p>
                <p className="text-2xl font-bold text-slate-900">{packages?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Packages</p>
                <p className="text-2xl font-bold text-slate-900">
                  {packages?.filter((p) => p.isActive).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-slate-100 p-3">
                <XCircle className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Inactive Packages</p>
                <p className="text-2xl font-bold text-slate-900">
                  {packages?.filter((p) => !p.isActive).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Package List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">All Packages</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredPackages && filteredPackages.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {pkg.heroImageUrl ? (
                          <img
                            src={pkg.heroImageUrl}
                            alt={pkg.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {pkg.name}
                          </h3>
                          {pkg.isActive ? (
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

                        {pkg.tagline && (
                          <p className="mt-1 text-sm text-slate-600">{pkg.tagline}</p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${(pkg.basePrice / 100).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {pkg.durationOptions.join(', ')} days
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {pkg._count.bookings} booking{pkg._count.bookings !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Slug: {pkg.slug}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/admin/packages/${pkg.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {pkg.isActive ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        disabled={deleteMutation.isPending || pkg._count.bookings > 0}
                        className={cn(
                          pkg._count.bookings > 0 && 'opacity-50 cursor-not-allowed'
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
              <Package className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No packages found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Get started by creating your first package'}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/admin/packages/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Package
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
