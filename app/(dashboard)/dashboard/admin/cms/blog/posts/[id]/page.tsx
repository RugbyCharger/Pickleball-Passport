/**
 * Admin Blog Post Editor
 * Story 12-3: Blog Posts
 *
 * Features:
 * - TipTap rich text editor for content
 * - Featured image upload
 * - SEO fields (meta title, description, keywords)
 * - Category and tag selection
 * - Draft/schedule/publish workflow
 * - Version history
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Save,
  Loader2,
  ArrowLeft,
  Send,
  Clock,
  Eye,
  Calendar,
  Image as ImageIcon,
  X,
  History,
  RotateCcw,
  Trash2,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/cms/rich-text-editor';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function BlogPostEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState<unknown>({ type: 'doc', content: [] });
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Fetch post data if editing
  const { data: post, isLoading: postLoading } = trpc.blog.getPostById.useQuery(
    { id },
    { enabled: !isNew }
  );

  // Fetch categories and tags
  const { data: categories } = trpc.blog.getCategories.useQuery();
  const { data: tags } = trpc.blog.getTags.useQuery();

  // Mutations
  const createMutation = trpc.blog.createPost.useMutation({
    onSuccess: (newPost) => {
      router.push(`/dashboard/admin/cms/blog/posts/${newPost.id}`);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create post');
    },
  });

  const updateMutation = trpc.blog.updatePost.useMutation({
    onSuccess: () => {
      // Show success feedback without navigation
    },
    onError: (error) => {
      alert(error.message || 'Failed to update post');
    },
  });

  const publishMutation = trpc.blog.publishPost.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      alert(error.message || 'Failed to publish');
    },
  });

  const scheduleMutation = trpc.blog.schedulePost.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      alert(error.message || 'Failed to schedule');
    },
  });

  const unpublishMutation = trpc.blog.unpublishPost.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      alert(error.message || 'Failed to unpublish');
    },
  });

  const restoreVersionMutation = trpc.blog.restorePostVersion.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      alert(error.message || 'Failed to restore version');
    },
  });

  const deleteMutation = trpc.blog.deletePost.useMutation({
    onSuccess: () => {
      router.push('/dashboard/admin/cms/blog/posts');
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete');
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setFeaturedImage(post.featuredImage || '');
      setFeaturedImageAlt(post.featuredImageAlt || '');
      setCategoryId(post.categoryId || '');
      setSelectedTagIds(post.tags.map(t => t.tag.id));
      setMetaTitle(post.metaTitle || '');
      setMetaDescription(post.metaDescription || '');
      setMetaKeywords(post.metaKeywords || []);
      setOgImage(post.ogImage || '');
      if (post.scheduledAt) {
        setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
      }
    }
  }, [post]);

  // Generate slug from title
  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Auto-generate slug when title changes (only for new posts)
  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [isNew, title, slug, generateSlug]);

  // Handle save (create or update)
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const data = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      content,
      excerpt: excerpt || undefined,
      featuredImage: featuredImage || undefined,
      featuredImageAlt: featuredImageAlt || undefined,
      categoryId: categoryId || undefined,
      tagIds: selectedTagIds,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      metaKeywords,
      ogImage: ogImage || undefined,
    };

    if (isNew) {
      await createMutation.mutateAsync(data);
    } else {
      await updateMutation.mutateAsync({ id, ...data });
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (isNew) {
      // Save first, then publish
      const data = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageAlt: featuredImageAlt || undefined,
        categoryId: categoryId || undefined,
        tagIds: selectedTagIds,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords,
        ogImage: ogImage || undefined,
      };

      const newPost = await createMutation.mutateAsync(data);
      await publishMutation.mutateAsync({ id: newPost.id });
    } else {
      await handleSave();
      await publishMutation.mutateAsync({ id });
    }
  };

  // Handle schedule
  const handleSchedule = async () => {
    if (!scheduledAt) {
      alert('Please select a date and time');
      return;
    }

    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      alert('Scheduled date must be in the future');
      return;
    }

    if (isNew) {
      const data = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageAlt: featuredImageAlt || undefined,
        categoryId: categoryId || undefined,
        tagIds: selectedTagIds,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords,
        ogImage: ogImage || undefined,
      };

      const newPost = await createMutation.mutateAsync(data);
      await scheduleMutation.mutateAsync({ id: newPost.id, scheduledAt: scheduleDate });
    } else {
      await handleSave();
      await scheduleMutation.mutateAsync({ id, scheduledAt: scheduleDate });
    }
  };

  // Handle keyword add
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !metaKeywords.includes(keywordInput.trim())) {
      setMetaKeywords([...metaKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  // Handle keyword remove
  const handleRemoveKeyword = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter(k => k !== keyword));
  };

  // Handle tag toggle
  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // Handle version restore
  const handleRestoreVersion = async (versionNumber: number) => {
    if (confirm(`Restore to version ${versionNumber}? This will save your current content as a new version.`)) {
      await restoreVersionMutation.mutateAsync({ postId: id, versionNumber });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Move this post to trash?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isPublishing = publishMutation.isPending;
  const isScheduling = scheduleMutation.isPending;

  if (!isNew && postLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin/cms/blog/posts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {isNew ? 'New Blog Post' : 'Edit Blog Post'}
                </h1>
                {post && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded',
                      post.status === 'PUBLISHED' && 'bg-emerald-100 text-emerald-700',
                      post.status === 'DRAFT' && 'bg-amber-100 text-amber-700',
                      post.status === 'SCHEDULED' && 'bg-blue-100 text-blue-700',
                      post.status === 'ARCHIVED' && 'bg-slate-100 text-slate-600'
                    )}>
                      {post.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && post?.status === 'PUBLISHED' && (
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
              )}

              {!isNew && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="gap-1"
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSeoPanel(!showSeoPanel)}
                className="gap-1"
              >
                <Settings className="h-4 w-4" />
                SEO
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>

              {post?.status !== 'PUBLISHED' ? (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="gap-1"
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => unpublishMutation.mutate({ id })}
                  disabled={unpublishMutation.isPending}
                  className="gap-1"
                >
                  <Clock className="h-4 w-4" />
                  Unpublish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <Input
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-400"
              />
            </div>

            {/* Slug */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">/blog/</span>
              <Input
                placeholder="post-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 font-mono text-sm"
              />
            </div>

            {/* Content Editor */}
            <div>
              <Label className="mb-2 block">Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your blog post..."
                className="min-h-[400px]"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt" className="mb-2 block">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="A brief summary of the post (shown in listings)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            {/* SEO Panel (Collapsible) */}
            {showSeoPanel && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">SEO Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSeoPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label htmlFor="metaTitle" className="mb-2 block">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Custom title for search engines"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Defaults to post title if empty
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription" className="mb-2 block">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Description for search engine results"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Defaults to excerpt if empty. Recommended: 150-160 characters
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddKeyword}>
                      Add
                    </Button>
                  </div>
                  {metaKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {metaKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="ogImage" className="mb-2 block">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    placeholder="https://example.com/image.jpg"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Defaults to featured image if empty
                  </p>
                </div>
              </div>
            )}

            {/* Version History Panel */}
            {showVersionHistory && post?.versions && post.versions.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Version History</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVersionHistory(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {post.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          Version {version.versionNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {version.changesSummary || 'No description'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreVersion(version.versionNumber)}
                        disabled={restoreVersionMutation.isPending}
                        className="gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Featured Image</h3>

              {featuredImage ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                    <Image
                      src={featuredImage}
                      alt={featuredImageAlt || 'Featured image'}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImage('');
                        setFeaturedImageAlt('');
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Alt text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Enter image URL below</p>
                  </div>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Category</h3>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      selectedTagIds.includes(tag.id)
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
                {(!tags || tags.length === 0) && (
                  <p className="text-sm text-slate-500">No tags available</p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Schedule Publication</h3>
              <div className="space-y-3">
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Button
                  variant="outline"
                  className="w-full gap-1"
                  onClick={handleSchedule}
                  disabled={isScheduling || !scheduledAt}
                >
                  {isScheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Schedule
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            {!isNew && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-100"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Move to Trash
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
