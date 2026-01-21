/**
 * Admin Content Pages List
 * Story 12-1: CMS Setup
 *
 * Features:
 * - View all content pages with filtering by status
 * - Create, edit, duplicate, archive, delete pages
 * - Search by title, slug, description
 * - Quick actions with status management
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Layout,
  Copy,
  Archive,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RotateCcw,
  Send,
  Home,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const STATUS_ICONS: Record<ContentStatus, React.ReactNode> = {
  DRAFT: <Clock className="h-3 w-3" />,
  PUBLISHED: <CheckCircle className="h-3 w-3" />,
  ARCHIVED: <XCircle className="h-3 w-3" />,
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

export default function ContentPagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'ALL'>('ALL');
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch pages
  const {
    data,
    isLoading,
    refetch,
  } = trpc.cms.getPages.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchQuery || undefined,
    includeDeleted: showDeleted,
  });

  // Mutations
  const duplicateMutation = trpc.cms.duplicatePage.useMutation({
    onSuccess: (newPage) => {
      if (newPage) {
        router.push(`/dashboard/admin/cms/pages/${newPage.id}`);
      }
    },
    onError: (error) => {
      alert(error.message || 'Failed to duplicate page');
    },
  });

  const publishMutation = trpc.cms.publishPage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to publish'),
  });

  const unpublishMutation = trpc.cms.unpublishPage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to unpublish'),
  });

  const archiveMutation = trpc.cms.archivePage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to archive'),
  });

  const deleteMutation = trpc.cms.deletePage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete'),
  });

  const restoreMutation = trpc.cms.restorePage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to restore'),
  });

  const permanentDeleteMutation = trpc.cms.permanentlyDeletePage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete permanently'),
  });

  const handleDuplicate = async (id: string) => {
    if (confirm('Create a copy of this page?')) {
      await duplicateMutation.mutateAsync({ id });
    }
  };

  const handlePublish = async (id: string) => {
    await publishMutation.mutateAsync({ id });
  };

  const handleUnpublish = async (id: string) => {
    if (confirm('Unpublish this page? It will be set to draft status.')) {
      await unpublishMutation.mutateAsync({ id });
    }
  };

  const handleArchive = async (id: string, title: string) => {
    if (confirm(`Archive "${title}"?`)) {
      await archiveMutation.mutateAsync({ id });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Move "${title}" to trash? You can restore it later.`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync({ id });
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (confirm(`Permanently delete "${title}"? This cannot be undone.`)) {
      await permanentDeleteMutation.mutateAsync({ id });
    }
  };

  const pages = data?.pages || [];
  const total = data?.total || 0;

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
                <span>Content Pages</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Content Pages</h1>
              <p className="mt-2 text-slate-600">
                Manage website pages with SEO settings and content blocks
              </p>
            </div>
            <Link href="/dashboard/admin/cms/pages/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContentStatus | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="rounded border-slate-300"
              />
              Show deleted
            </label>
          </div>
        </div>

        {/* Page List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {total} page{total !== 1 ? 's' : ''}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : pages.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {pages.map((page) => {
                const isDeleted = !!page.deletedAt;
                return (
                  <div
                    key={page.id}
                    className={cn(
                      'px-6 py-4 transition-colors',
                      isDeleted ? 'bg-slate-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            'text-lg font-semibold',
                            isDeleted ? 'text-slate-400 line-through' : 'text-slate-900'
                          )}>
                            {page.title}
                          </h3>
                          {page.isHomepage && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium">
                              <Home className="h-3 w-3" />
                              Homepage
                            </span>
                          )}
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            STATUS_COLORS[page.status as ContentStatus]
                          )}>
                            {STATUS_ICONS[page.status as ContentStatus]}
                            {STATUS_LABELS[page.status as ContentStatus]}
                          </span>
                          {isDeleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-1 text-xs font-medium">
                              <Trash2 className="h-3 w-3" />
                              Deleted
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 font-mono">/{page.slug}</p>

                        {page.description && (
                          <p className="mt-1 text-sm text-slate-600">{page.description}</p>
                        )}

                        {page.category && (
                          <p className="mt-1 text-sm text-slate-600">
                            Category: {page.category.name}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                          <span>{page._count?.blocks || 0} blocks</span>
                          <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                          {page.publishedAt && (
                            <span>Published {new Date(page.publishedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isDeleted ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(page.id)}
                              disabled={restoreMutation.isPending}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(page.id, page.title)}
                              disabled={permanentDeleteMutation.isPending}
                              title="Delete permanently"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href={`/dashboard/admin/cms/pages/${page.id}`}>
                              <Button variant="outline" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {page.status === 'PUBLISHED' && (
                              <Link href={`/${page.slug}`} target="_blank">
                                <Button variant="outline" size="sm" title="View live">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}

                            {page.status === 'DRAFT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(page.id)}
                                disabled={publishMutation.isPending}
                                title="Publish"
                              >
                                <Send className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}

                            {page.status === 'PUBLISHED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnpublish(page.id)}
                                disabled={unpublishMutation.isPending}
                                title="Unpublish"
                              >
                                <Clock className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(page.id)}
                              disabled={duplicateMutation.isPending}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {page.status !== 'ARCHIVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchive(page.id, page.title)}
                                disabled={archiveMutation.isPending}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(page.id, page.title)}
                              disabled={deleteMutation.isPending}
                              title="Move to trash"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Layout className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No pages found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first content page'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Link href="/dashboard/admin/cms/pages/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Page
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
