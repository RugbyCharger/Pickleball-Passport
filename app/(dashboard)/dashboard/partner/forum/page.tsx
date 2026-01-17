/**
 * Partner Forum Page (Directors Circle)
 * E9-S13: Partner Community Forum
 *
 * Features:
 * - Thread list with filtering and sorting
 * - Create new thread
 * - Search threads
 * - Category filtering
 * - Pinned announcements
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  MessageSquare,
  Loader2,
  Plus,
  Search,
  Heart,
  HeartFill,
  Pin,
  TrendingUp,
  FileText,
  HelpCircle,
  Users,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ForumCategory } from '@prisma/client';

type SortBy = 'recent' | 'popular' | 'most_replies';

const CATEGORY_LABELS: Record<ForumCategory, { label: string; icon: any }> = {
  BEST_PRACTICES: { label: 'Best Practices', icon: TrendingUp },
  SUCCESS_STORIES: { label: 'Success Stories', icon: Users },
  Q_AND_A: { label: 'Q&A', icon: HelpCircle },
  ANNOUNCEMENTS: { label: 'Announcements', icon: Megaphone },
};

export default function PartnerForumPage() {
  const router = useRouter();
  const [category, setCategory] = useState<ForumCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();

  const { data: threadsData, isLoading } = trpc.forum.getThreads.useQuery({
    category: category !== 'all' ? category : undefined,
    search: searchQuery || undefined,
    sortBy,
    limit,
    offset: page * limit,
  });

  const createThreadMutation = trpc.forum.createThread.useMutation({
    onSuccess: (data) => {
      utils.forum.getThreads.invalidate();
      setShowCreateForm(false);
      router.push(`/dashboard/partner/forum/${data.id}`);
    },
  });

  const toggleLikeMutation = trpc.forum.toggleThreadLike.useMutation({
    onSuccess: () => {
      utils.forum.getThreads.invalidate();
    },
  });

  const handleCreateThread = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as ForumCategory;
    const content = formData.get('content') as string;

    if (!title || !category || !content) return;

    await createThreadMutation.mutateAsync({
      title,
      category,
      content,
    });
  };

  const handleToggleLike = async (threadId: string) => {
    await toggleLikeMutation.mutateAsync({ threadId });
  };

  const categories: (ForumCategory | 'all')[] = [
    'all',
    'BEST_PRACTICES',
    'SUCCESS_STORIES',
    'Q_AND_A',
    'ANNOUNCEMENTS',
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Liked' },
    { value: 'most_replies', label: 'Most Replies' },
  ];

  if (isLoading && !threadsData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const allThreads = [
    ...(threadsData?.pinnedThreads || []),
    ...(threadsData?.threads || []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Directors Circle</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Directors Circle</h1>
            <p className="mt-1 text-slate-600">
              Connect with other partners and share best practices
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Thread
          </Button>
        </div>

        {/* Create Thread Form */}
        {showCreateForm && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Create New Thread</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Thread Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  maxLength={200}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="What's your question or topic?"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select a category</option>
                  <option value="BEST_PRACTICES">Best Practices</option>
                  <option value="SUCCESS_STORIES">Success Stories</option>
                  <option value="Q_AND_A">Q&A</option>
                </select>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={6}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Share your question, tips, or story..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createThreadMutation.isPending}
                  className="gap-2"
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Thread
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
            {categories.map((cat) => {
              const isAll = cat === 'all';
              const label = isAll ? 'All' : CATEGORY_LABELS[cat].label;
              const Icon = isAll ? FileText : CATEGORY_LABELS[cat].icon;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(0);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                    category === cat
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortBy);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Thread List */}
        <div className="space-y-4">
          {allThreads.length > 0 ? (
            <>
              {allThreads.map((thread) => {
                const CategoryIcon = CATEGORY_LABELS[thread.category].icon;

                return (
                  <Link
                    key={thread.id}
                    href={`/dashboard/partner/forum/${thread.id}`}
                    className="block"
                  >
                    <div
                      className={cn(
                        'rounded-lg border p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md',
                        thread.isPinned
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            {thread.isPinned && (
                              <Pin className="h-4 w-4 text-amber-600" />
                            )}
                            {thread.isAnnouncement && (
                              <Megaphone className="h-4 w-4 text-purple-600" />
                            )}
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-medium text-slate-500">
                                {CATEGORY_LABELS[thread.category].label}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {thread.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                            {thread.content}
                          </p>
                          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                            <span>By {thread.authorName}</span>
                            <span>•</span>
                            <span>{thread.replyCount} replies</span>
                            <span>•</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleLike(thread.id);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                          >
                            <Heart className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">{thread.likeCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No threads yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery || category !== 'all'
                  ? 'No threads match your filters. Try adjusting your search.'
                  : 'Be the first to start a discussion!'}
              </p>
              {!searchQuery && category === 'all' && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Thread
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {threadsData && threadsData.pagination.hasMore && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setPage(page + 1)}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
