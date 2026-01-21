/**
 * Admin Blog Posts List
 * Story 12-3: Blog Posts
 *
 * Features:
 * - View all blog posts with filtering by status/category/tag
 * - Search by title, excerpt, content
 * - Quick actions for publish, schedule, archive, delete
 * - Featured image thumbnails
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
  Calendar,
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
import Image from 'next/image';

type BlogPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const STATUS_ICONS: Record<BlogPostStatus, React.ReactNode> = {
  DRAFT: <Clock className="h-3 w-3" />,
  SCHEDULED: <Calendar className="h-3 w-3" />,
  PUBLISHED: <CheckCircle className="h-3 w-3" />,
  ARCHIVED: <XCircle className="h-3 w-3" />,
};

const STATUS_COLORS: Record<BlogPostStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

export default function BlogPostsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch posts
  const {
    data,
    isLoading,
    refetch,
  } = trpc.blog.getPosts.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
    search: searchQuery || undefined,
    includeDeleted: showDeleted,
  });

  // Fetch categories for filter
  const { data: categories } = trpc.blog.getCategories.useQuery({ includePostCount: false });

  // Mutations
  const duplicateMutation = trpc.blog.duplicatePost.useMutation({
    onSuccess: (newPost) => {
      router.push(`/dashboard/admin/cms/blog/posts/${newPost.id}`);
    },
    onError: (error) => {
      alert(error.message || 'Failed to duplicate post');
    },
  });

  const publishMutation = trpc.blog.publishPost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to publish'),
  });

  const unpublishMutation = trpc.blog.unpublishPost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to unpublish'),
  });

  const archiveMutation = trpc.blog.archivePost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to archive'),
  });

  const deleteMutation = trpc.blog.deletePost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete'),
  });

  const restoreMutation = trpc.blog.restorePost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to restore'),
  });

  const permanentDeleteMutation = trpc.blog.permanentlyDeletePost.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to delete permanently'),
  });

  const handleDuplicate = async (id: string) => {
    if (confirm('Create a copy of this post?')) {
      await duplicateMutation.mutateAsync({ id });
    }
  };

  const handlePublish = async (id: string) => {
    await publishMutation.mutateAsync({ id });
  };

  const handleUnpublish = async (id: string) => {
    if (confirm('Unpublish this post? It will be set to draft status.')) {
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

  const posts = data?.posts || [];
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
                <Link href="/dashboard/admin/cms/blog" className="hover:text-slate-700">Blog</Link>
                <span>/</span>
                <span>Posts</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
              <p className="mt-2 text-slate-600">
                Create and manage content marketing articles
              </p>
            </div>
            <Link href="/dashboard/admin/cms/blog/posts/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BlogPostStatus | 'ALL')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
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

        {/* Post List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {total} post{total !== 1 ? 's' : ''}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : posts.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {posts.map((post) => {
                const isDeleted = !!post.deletedAt;
                return (
                  <div
                    key={post.id}
                    className={cn(
                      'px-6 py-4 transition-colors',
                      isDeleted ? 'bg-slate-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Featured Image Thumbnail */}
                      {post.featuredImage && (
                        <div className="relative h-20 w-32 flex-shrink-0 rounded overflow-hidden bg-slate-100">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            'text-lg font-semibold',
                            isDeleted ? 'text-slate-400 line-through' : 'text-slate-900'
                          )}>
                            {post.title}
                          </h3>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            STATUS_COLORS[post.status as BlogPostStatus]
                          )}>
                            {STATUS_ICONS[post.status as BlogPostStatus]}
                            {STATUS_LABELS[post.status as BlogPostStatus]}
                          </span>
                          {isDeleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-1 text-xs font-medium">
                              <Trash2 className="h-3 w-3" />
                              Deleted
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500 font-mono">/blog/{post.slug}</p>

                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          {post.category && (
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: post.category.color ? `${post.category.color}20` : '#f3e8ff',
                                color: post.category.color || '#9333ea',
                              }}
                            >
                              {post.category.name}
                            </span>
                          )}
                          {post.tags.length > 0 && (
                            <div className="flex gap-1">
                              {post.tags.slice(0, 3).map((t) => (
                                <span key={t.tag.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  {t.tag.name}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-slate-400">+{post.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Updated {new Date(post.updatedAt).toLocaleDateString()}
                          {post.publishedAt && post.status === 'PUBLISHED' && (
                            <> | Published {new Date(post.publishedAt).toLocaleDateString()}</>
                          )}
                          {post.scheduledAt && post.status === 'SCHEDULED' && (
                            <> | Scheduled for {new Date(post.scheduledAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isDeleted ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(post.id)}
                              disabled={restoreMutation.isPending}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(post.id, post.title)}
                              disabled={permanentDeleteMutation.isPending}
                              title="Delete permanently"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link href={`/dashboard/admin/cms/blog/posts/${post.id}`}>
                              <Button variant="outline" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {post.status === 'PUBLISHED' && (
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <Button variant="outline" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}

                            {post.status === 'DRAFT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(post.id)}
                                disabled={publishMutation.isPending}
                                title="Publish"
                              >
                                <Send className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}

                            {post.status === 'PUBLISHED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnpublish(post.id)}
                                disabled={unpublishMutation.isPending}
                                title="Unpublish"
                              >
                                <Clock className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(post.id)}
                              disabled={duplicateMutation.isPending}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {post.status !== 'ARCHIVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchive(post.id, post.title)}
                                disabled={archiveMutation.isPending}
                                title="Archive"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(post.id, post.title)}
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
              <h3 className="mt-4 text-lg font-medium text-slate-900">No posts found</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first blog post'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && categoryFilter === 'ALL' && (
                <Link href="/dashboard/admin/cms/blog/posts/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Post
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
