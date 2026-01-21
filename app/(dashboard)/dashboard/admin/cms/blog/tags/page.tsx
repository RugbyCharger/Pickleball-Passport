/**
 * Admin Blog Tags Page
 * Story 12-3: Blog Posts
 *
 * Features:
 * - List all blog tags
 * - Create and delete tags
 * - Search tags
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Trash2,
  Loader2,
  Tag,
  Search,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function BlogTagsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tags
  const { data: tags, isLoading, refetch } = trpc.blog.getTags.useQuery({
    search: searchQuery || undefined,
    includePostCount: true,
  });

  // Mutations
  const createMutation = trpc.blog.createTag.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
    onError: (error) => {
      alert(error.message || 'Failed to create tag');
    },
  });

  const deleteMutation = trpc.blog.deleteTag.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      alert(error.message || 'Failed to delete tag');
    },
  });

  const resetForm = () => {
    setIsCreating(false);
    setName('');
    setSlug('');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    await createMutation.mutateAsync({
      name: name.trim(),
      slug: slug.trim() || undefined,
    });
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (confirm(`Delete tag "${tagName}"? This will remove it from all posts.`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const isSaving = createMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/dashboard/admin/cms" className="hover:text-slate-700">CMS</Link>
                <span>/</span>
                <Link href="/dashboard/admin/cms/blog" className="hover:text-slate-700">Blog</Link>
                <span>/</span>
                <span>Tags</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Blog Tags</h1>
              <p className="mt-2 text-slate-600">
                Tag your blog posts for better discoverability
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsCreating(true);
              }}
              className="gap-2"
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">New Tag</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="Tag name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="tag-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="gap-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Create
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tags List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {tags?.length || 0} tag{(tags?.length || 0) === 1 ? '' : 's'}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : tags && tags.length > 0 ? (
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-2 transition-colors"
                  >
                    <Tag className="h-4 w-4 text-slate-600" />
                    <span className="font-medium text-slate-900">{tag.name}</span>
                    <span className="text-xs text-slate-500">
                      ({(tag as any)._count?.posts || 0})
                    </span>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Tag className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first tag to categorize your blog posts'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4 gap-2"
                  onClick={() => {
                    resetForm();
                    setIsCreating(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Tag
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
