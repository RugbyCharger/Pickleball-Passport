/**
 * Admin CMS Packages List
 * Story 12-2: Package Content Editing
 *
 * Features:
 * - View all packages for CMS content management
 * - Quick status indicators for CMS content
 * - Search and filter packages
 * - Navigate to package content editor
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Edit,
  Loader2,
  Package,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PackagesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // Fetch packages
  const { data, isLoading } = trpc.packageCms.getPackagesForCms.useQuery({
    search: searchQuery || undefined,
    isActive: activeFilter,
  });

  const packages = data?.packages || [];
  const total = data?.total || 0;

  // Helper to check if package has CMS content
  const hasCmsContent = (pkg: typeof packages[0]) => {
    return !!(pkg.cmsDescription || pkg.cmsPricingText || pkg.cmsDurationText || pkg._count.contentBlocks > 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/dashboard/admin/cms" className="hover:text-slate-700">CMS</Link>
                <span>/</span>
                <span>Packages</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Package Content</h1>
              <p className="mt-2 text-slate-600">
                Edit package descriptions, images, and content through the CMS
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={activeFilter === undefined ? 'ALL' : activeFilter ? 'ACTIVE' : 'INACTIVE'}
              onChange={(e) => {
                if (e.target.value === 'ALL') setActiveFilter(undefined);
                else setActiveFilter(e.target.value === 'ACTIVE');
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Packages</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Package List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {total} package{total !== 1 ? 's' : ''}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : packages.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {packages.map((pkg) => {
                const hasContent = hasCmsContent(pkg);
                return (
                  <div
                    key={pkg.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        {/* Hero Image Thumbnail */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {pkg.heroImageUrl ? (
                            <img
                              src={pkg.heroImageUrl}
                              alt={pkg.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Package Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {pkg.name}
                            </h3>
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                              pkg.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            )}>
                              {pkg.isActive ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                              hasContent
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            )}>
                              <FileText className="h-3 w-3" />
                              {hasContent ? 'Has CMS Content' : 'No CMS Content'}
                            </span>
                          </div>

                          {pkg.tagline && (
                            <p className="mt-1 text-sm text-slate-600">{pkg.tagline}</p>
                          )}

                          <p className="mt-1 text-sm text-slate-500 font-mono">/{pkg.slug}</p>

                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            <span>${(pkg.basePrice / 100).toLocaleString()} base price</span>
                            <span>{pkg.durationOptions.join(', ')} days</span>
                            <span>{pkg._count.contentBlocks} linked blocks</span>
                            <span>{pkg._count.bookings} bookings</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/admin/cms/packages/${pkg.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Content
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/cms/packages/${pkg.id}/preview`}>
                          <Button variant="outline" size="sm" title="Preview">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No packages found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Packages need to be created before CMS content can be added'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
