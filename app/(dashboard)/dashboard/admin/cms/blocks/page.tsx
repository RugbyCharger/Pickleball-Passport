/**
 * Admin Content Blocks List
 * Story 12-1: CMS Setup
 *
 * Features:
 * - View all content blocks with filtering by status/type
 * - Create, edit, duplicate, archive, delete blocks
 * - Search by name, slug, content
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
  FileText,
  Copy,
  Archive,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RotateCcw,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type ContentBlockType = 'TEXT' | 'HERO' | 'FEATURE' | 'TESTIMONIAL' | 'CTA' | 'FAQ' | 'GALLERY' | 'VIDEO' | 'CUSTOM';

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

const TYPE_LABELS: Record<ContentBlockType, string> = {
  TEXT: 'Text',
  HERO: 'Hero Section',
  FEATURE: 'Feature',
  TESTIMONIAL: 'Testimonial',
  CTA: 'Call to Action',
  FAQ: 'FAQ',
  GALLERY: 'Gallery',
  VIDEO: 'Video',
  CUSTOM: 'Custom',
};

const TYPE_COLORS: Record<ContentBlockType, string> = {
  TEXT: 'bg-blue-100 text-blue-700',
  HERO: 'bg-purple-100 text-purple-700',
  FEATURE: 'bg-indigo-100 text-indigo-700',
  TESTIMONIAL: 'bg-pink-100 text-pink-700',
  CTA: 'bg-orange-100 text-orange-700',
  FAQ: 'bg-cyan-100 text-cyan-700',
  GALLERY: 'bg-green-100 text-green-700',
  VIDEO: 'bg-red-100 text-red-700',
  CUSTOM: 'bg-slate-100 text-slate-700',
};

export default function ContentBlocksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ContentBlockType | 'ALL'>('ALL');
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch blocks
  const {
    data,
    isLoading,
    refetch,
  } = trpc.cms.getBlocks.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    search: searchQuery || undefined,
    includeDeleted: showDeleted,
  });

  // Mutations
  const duplicateMutation = trpc.cms.duplicateBlock.useMutation({
    onSuccess: (newBlock) => {
      router.push(`/dashboard/admin/cms/blocks/${newBlock.id}`);
    },
    onError: (error) => {
      alert(error.message || 'Failed to duplicate block');
    },
  });

  const publishMutation = trpc.cms.publishBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to publish'),
  });

  const unpublishMutation = trpc.cms.unpublishBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to unpublish'),
  });

  const archiveMutation = trpc.cms.archiveBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to archive'),
  });

  const deleteMutation = trpc.cms.deleteBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete'),
  });

  const restoreMutation = trpc.cms.restoreBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to restore'),
  });

  const permanentDeleteMutation = trpc.cms.permanentlyDeleteBlock.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete permanently'),
  });

  const handleDuplicate = async (id: string) => {
    if (confirm('Create a copy of this block?')) {
      await duplicateMutation.mutateAsync({ id });
    }
  };

  const handlePublish = async (id: string) => {
    await publishMutation.mutateAsync({ id });
  };

  const handleUnpublish = async (id: string) => {
    if (confirm('Unpublish this block? It will be set to draft status.')) {
      await unpublishMutation.mutateAsync({ id });
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (confirm(`Archive "${name}"?`)) {
      await archiveMutation.mutateAsync({ id });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Move "${name}" to trash? You can restore it later.`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync({ id });
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (confirm(`Permanently delete "${name}"? This cannot be undone.`)) {
      await permanentDeleteMutation.mutateAsync({ id });
    }
  };

  const blocks = data?.blocks || [];
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
                <span>Content Blocks</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Content Blocks</h1>
              <p className="mt-2 text-slate-600">
                Reusable content components for your pages
              </p>
            </div>
            <Link href="/dashboard/admin/cms/blocks/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Block
              </Button>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search blocks..."
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

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ContentBlockType | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Types</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
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

        {/* Block List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {total} block{total !== 1 ? 's' : ''}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : blocks.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {blocks.map((block) => {
                const isDeleted = !!block.deletedAt;
                return (
                  <div
                    key={block.id}
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
                            {block.name}
                          </h3>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            TYPE_COLORS[block.type as ContentBlockType]
                          )}>
                            {TYPE_LABELS[block.type as ContentBlockType]}
                          </span>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            STATUS_COLORS[block.status as ContentStatus]
                          )}>
                            {STATUS_ICONS[block.status as ContentStatus]}
                            {STATUS_LABELS[block.status as ContentStatus]}
                          </span>
                          {isDeleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-1 text-xs font-medium">
                              <Trash2 className="h-3 w-3" />
                              Deleted
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 font-mono">{block.slug}</p>

                        {block.category && (
                          <p className="mt-1 text-sm text-slate-600">
                            Category: {block.category.name}
                          </p>
                        )}

                        {block.page && (
                          <p className="mt-1 text-sm text-slate-600">
                            Page: {block.page.title}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Updated {new Date(block.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isDeleted ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(block.id)}
                              disabled={restoreMutation.isPending}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(block.id, block.name)}
                              disabled={permanentDeleteMutation.isPending}
                              title="Delete permanently"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href={`/dashboard/admin/cms/blocks/${block.id}`}>
                              <Button variant="outline" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Link href={`/dashboard/admin/cms/blocks/${block.id}/preview`}>
                              <Button variant="outline" size="sm" title="Preview">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {block.status === 'DRAFT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(block.id)}
                                disabled={publishMutation.isPending}
                                title="Publish"
                              >
                                <Send className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}

                            {block.status === 'PUBLISHED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnpublish(block.id)}
                                disabled={unpublishMutation.isPending}
                                title="Unpublish"
                              >
                                <Clock className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(block.id)}
                              disabled={duplicateMutation.isPending}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {block.status !== 'ARCHIVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchive(block.id, block.name)}
                                disabled={archiveMutation.isPending}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(block.id, block.name)}
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
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No blocks found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first content block'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && typeFilter === 'ALL' && (
                <Link href="/dashboard/admin/cms/blocks/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Block
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
