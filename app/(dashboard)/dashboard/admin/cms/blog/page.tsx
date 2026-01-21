/**
 * Admin Blog Dashboard
 * Story 12-3: Blog Posts
 *
 * Main dashboard for blog management featuring:
 * - Overview statistics for posts, categories, and tags
 * - Recent posts list
 * - Quick navigation to blog content types
 * - Create new post shortcut
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import {
  FileText,
  FolderTree,
  Tag,
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  Archive,
  Calendar,
  TrendingUp,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const STATUS_COLORS = {
  DRAFT: 'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
};

const STATUS_ICONS = {
  DRAFT: Clock,
  SCHEDULED: Calendar,
  PUBLISHED: CheckCircle,
  ARCHIVED: Archive,
};

export default function BlogDashboardPage() {
  // Fetch blog stats
  const { data: stats, isLoading: statsLoading } = trpc.blog.getStats.useQuery();

  // Fetch recent posts
  const { data: recentPosts, isLoading: postsLoading } = trpc.blog.getRecentActivity.useQuery({ limit: 5 });

  const isLoading = statsLoading || postsLoading;

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
                <span>Blog</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
              <p className="mt-2 text-slate-600">
                Create and manage blog posts for content marketing
              </p>
            </div>
            <Link href="/dashboard/admin/cms/blog/posts/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </Link>
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
              {/* Blog Posts */}
              <Link href="/dashboard/admin/cms/blog/posts" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-blue-100 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Blog Posts</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.posts.total || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 text-xs flex-wrap">
                    <span className="text-emerald-600">{stats?.posts.published || 0} published</span>
                    <span className="text-amber-600">{stats?.posts.draft || 0} draft</span>
                    {(stats?.posts.scheduled || 0) > 0 && (
                      <span className="text-blue-600">{stats?.posts.scheduled} scheduled</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Categories */}
              <Link href="/dashboard/admin/cms/blog/categories" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-purple-100 p-3">
                      <FolderTree className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Categories</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.categories || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    Organize your posts
                  </div>
                </div>
              </Link>

              {/* Tags */}
              <Link href="/dashboard/admin/cms/blog/tags" className="block">
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-amber-100 p-3">
                      <Tag className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tags</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.tags || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    Tag your content
                  </div>
                </div>
              </Link>

              {/* Published */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Published</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stats?.posts.published || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Live on website
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              {/* Manage Posts */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Blog Posts</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Create and publish content marketing articles
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/blog/posts">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/blog/posts/new">
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
                  <div className="rounded-full bg-purple-100 p-3">
                    <FolderTree className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Organize posts into categories
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/blog/categories">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/blog/categories/new">
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Tags */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 p-3">
                    <Tag className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">Tags</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Tag posts for better discoverability
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link href="/dashboard/admin/cms/blog/tags">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                      <Link href="/dashboard/admin/cms/blog/tags/new">
                        <Button size="sm" className="gap-1">
                          <Plus className="h-3 w-3" />
                          Create
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Posts</h2>
                <Link href="/dashboard/admin/cms/blog/posts">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {recentPosts && recentPosts.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {recentPosts.map((post) => {
                    const StatusIcon = STATUS_ICONS[post.status as keyof typeof STATUS_ICONS];
                    return (
                      <div key={post.id} className="px-6 py-4 hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          {/* Featured Image Thumbnail */}
                          {post.featuredImage && (
                            <div className="relative h-16 w-24 flex-shrink-0 rounded overflow-hidden bg-slate-100">
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
                              <span className="font-medium text-slate-900 truncate">
                                {post.title}
                              </span>
                              <span className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                STATUS_COLORS[post.status as keyof typeof STATUS_COLORS]
                              )}>
                                <StatusIcon className="h-3 w-3" />
                                {post.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {post.category && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                  {post.category.name}
                                </span>
                              )}
                              <p className="text-sm text-slate-500">
                                Updated {new Date(post.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/dashboard/admin/cms/blog/posts/${post.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {post.status === 'PUBLISHED' && (
                              <Link href={`/blog/${post.slug}`} target="_blank">
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
                <div className="px-6 py-12 text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="font-medium">No blog posts yet</p>
                  <p className="mt-1 text-sm">Get started by creating your first post</p>
                  <Link href="/dashboard/admin/cms/blog/posts/new">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Create First Post
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
