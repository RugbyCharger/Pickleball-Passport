/**
 * Admin CMS Dashboard
 * Story 12-1: CMS Setup
 *
 * Main dashboard for content management featuring:
 * - Overview statistics for blocks, pages, and categories
 * - Recent activity feed
 * - Quick navigation to content types
 * - Create new content shortcuts
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import {
  FileText,
  Layout,
  FolderTree,
  Plus,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  Archive,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  DRAFT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

const STATUS_ICONS = {
  DRAFT: Clock,
  PUBLISHED: CheckCircle,
  ARCHIVED: Archive,
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Text',
  HERO: 'Hero',
  FEATURE: 'Feature',
  TESTIMONIAL: 'Testimonial',
  CTA: 'Call to Action',
  FAQ: 'FAQ',
  GALLERY: 'Gallery',
  VIDEO: 'Video',
  CUSTOM: 'Custom',
};

export default function CMSDashboardPage() {
  // Fetch CMS stats
  const { data: stats, isLoading: statsLoading } = trpc.cms.getStats.useQuery();

  // Fetch recent activity
  const { data: activity, isLoading: activityLoading } = trpc.cms.getRecentActivity.useQuery({ limit: 5 });

  const isLoading = statsLoading || activityLoading;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
              <p className="mt-2 text-slate-600">
                Manage website content, pages, and reusable content blocks
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/admin/cms/blocks/new">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Block
                </Button>
              </Link>
              <Link href="/dashboard/admin/cms/pages/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Page
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Content Blocks */}
              <Link href="/dashboard/admin/cms/blocks" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-100 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Content Blocks</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.blocks.total || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 text-xs">
                    <span className="text-emerald-600">{stats?.blocks.published || 0} published</span>
                    <span className="text-amber-600">{stats?.blocks.draft || 0} draft</span>
                  </div>
                </div>
              </Link>

              {/* Content Pages */}
              <Link href="/dashboard/admin/cms/pages" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-purple-100 p-3">
                      <Layout className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Content Pages</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.pages.total || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 text-xs">
                    <span className="text-emerald-600">{stats?.pages.published || 0} published</span>
                    <span className="text-amber-600">{stats?.pages.draft || 0} draft</span>
                  </div>
                </div>
              </Link>

              {/* Categories */}
              <Link href="/dashboard/admin/cms/categories" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-amber-100 p-3">
                      <FolderTree className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Categories</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.categories || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    Organize your content
                  </div>
                </div>
              </Link>

              {/* Published Content */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Published</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(stats?.blocks.published || 0) + (stats?.pages.published || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Live on website
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-6 lg:grid-cols-4">
              {/* Manage Blocks */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Content Blocks</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Reusable content components that can be placed on pages
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/blocks">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/blocks/new">
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Pages */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Layout className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Content Pages</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Full pages with SEO settings and content blocks
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/pages">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/pages/new">
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Categories */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-3">
                    <FolderTree className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Organize content with hierarchical categories
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/categories">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/categories/new">
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Packages (Story 12-2) */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Packages</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Edit package content, descriptions, and images
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/packages">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Blocks */}
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Blocks</h2>
                  <Link href="/dashboard/admin/cms/blocks">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                {activity?.blocks && activity.blocks.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {activity.blocks.map((block) => {
                      const StatusIcon = STATUS_ICONS[block.status as keyof typeof STATUS_ICONS];
                      return (
                        <div key={block.id} className="px-6 py-4 hover:bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 truncate">
                                  {block.name}
                                </span>
                                <span className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                  STATUS_COLORS[block.status as keyof typeof STATUS_COLORS]
                                )}>
                                  <StatusIcon className="h-3 w-3" />
                                  {block.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-0.5">
                                {BLOCK_TYPE_LABELS[block.type] || block.type} - Updated {new Date(block.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/dashboard/admin/cms/blocks/${block.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p>No content blocks yet</p>
                    <Link href="/dashboard/admin/cms/blocks/new">
                      <Button variant="outline" size="sm" className="mt-3 gap-1">
                        <Plus className="h-3 w-3" />
                        Create First Block
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Pages */}
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Pages</h2>
                  <Link href="/dashboard/admin/cms/pages">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                {activity?.pages && activity.pages.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {activity.pages.map((page) => {
                      const StatusIcon = STATUS_ICONS[page.status as keyof typeof STATUS_ICONS];
                      return (
                        <div key={page.id} className="px-6 py-4 hover:bg-slate-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 truncate">
                                  {page.title}
                                </span>
                                <span className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                  STATUS_COLORS[page.status as keyof typeof STATUS_COLORS]
                                )}>
                                  <StatusIcon className="h-3 w-3" />
                                  {page.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                                /{page.slug} - Updated {new Date(page.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/dashboard/admin/cms/pages/${page.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {page.status === 'PUBLISHED' && (
                                <Link href={`/${page.slug}`} target="_blank">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    <Layout className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p>No content pages yet</p>
                    <Link href="/dashboard/admin/cms/pages/new">
                      <Button variant="outline" size="sm" className="mt-3 gap-1">
                        <Plus className="h-3 w-3" />
                        Create First Page
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
