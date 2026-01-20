/**
 * Forum Thread Detail Page
 * E9-S13: Partner Community Forum
 *
 * Features:
 * - View full thread
 * - Reply to thread
 * - Like thread
 * - View all replies
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  MessageSquare,
  Loader2,
  ArrowLeft,
  Heart,
  Pin,
  TrendingUp,
  FileText,
  HelpCircle,
  Users,
  Megaphone,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ForumCategory } from '@prisma/client';

const CATEGORY_LABELS: Record<ForumCategory, { label: string; icon: any }> = {
  BEST_PRACTICES: { label: 'Best Practices', icon: TrendingUp },
  SUCCESS_STORIES: { label: 'Success Stories', icon: Users },
  Q_AND_A: { label: 'Q&A', icon: HelpCircle },
  ANNOUNCEMENTS: { label: 'Announcements', icon: Megaphone },
};

export default function ForumThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;

  const [replyContent, setReplyContent] = useState('');

  const utils = trpc.useUtils();

  const { data: thread, isLoading } = trpc.forum.getThread.useQuery({
    id: threadId,
  });

  const replyMutation = trpc.forum.replyToThread.useMutation({
    onSuccess: () => {
      utils.forum.getThread.invalidate({ id: threadId });
      setReplyContent('');
    },
  });

  const toggleLikeMutation = trpc.forum.toggleThreadLike.useMutation({
    onSuccess: () => {
      utils.forum.getThread.invalidate({ id: threadId });
    },
  });

  const handleReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    await replyMutation.mutateAsync({
      threadId,
      content: replyContent.trim(),
    });
  };

  const handleToggleLike = async () => {
    await toggleLikeMutation.mutateAsync({ threadId });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Thread not found</h2>
          <p className="mt-2 text-slate-600">The thread you're looking for doesn't exist.</p>
          <Link href="/dashboard/partner/forum">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = CATEGORY_LABELS[thread.category].icon;

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
            <li>
              <Link href="/dashboard/partner/forum" className="text-slate-600 hover:text-slate-900">
                Directors Circle
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Thread</li>
          </ol>
        </nav>

        {/* Back Button */}
        <Link href="/dashboard/partner/forum">
          <Button variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>

        {/* Thread */}
        <div
          className={cn(
            'mb-6 rounded-lg border p-6 shadow-sm',
            thread.isPinned
              ? 'border-amber-300 bg-amber-50'
              : 'border-slate-200 bg-white'
          )}
        >
          {/* Thread Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
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
              <h1 className="text-2xl font-bold text-slate-900">{thread.title}</h1>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                <span>By {thread.authorName}</span>
                <span>•</span>
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                {thread.updatedAt.getTime() !== thread.createdAt.getTime() && (
                  <>
                    <span>•</span>
                    <span>Edited {new Date(thread.updatedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={handleToggleLike}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                  thread.isLiked
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {thread.isLiked ? (
                  <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                <span className="font-medium">{thread.likeCount}</span>
              </button>
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-slate-700">{thread.content}</div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Replies ({thread.replyCount})
          </h2>

          {thread.replies.length > 0 ? (
            <div className="space-y-4">
              {thread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{reply.authorName}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-slate-700">{reply.content}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">No replies yet. Be the first to reply!</p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Post a Reply</h3>
          <form onSubmit={handleReply} className="space-y-4">
            <div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={6}
                required
                className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={replyMutation.isPending || !replyContent.trim()}
                className="gap-2"
              >
                {replyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
