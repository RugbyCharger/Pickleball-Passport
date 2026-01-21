/**
 * Admin Blog Categories Page
 * Story 12-3: Blog Posts
 *
 * Features:
 * - List all blog categories
 * - Create, edit, delete categories
 * - Color coding for categories
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FolderTree,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function BlogCategoriesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#9333ea');

  // Fetch categories
  const { data: categories, isLoading, refetch } = trpc.blog.getCategories.useQuery({
    includePostCount: true,
  });

  // Mutations
  const createMutation = trpc.blog.createCategory.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
    onError: (error) => {
      alert(error.message || 'Failed to create category');
    },
  });

  const updateMutation = trpc.blog.updateCategory.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
    },
    onError: (error) => {
      alert(error.message || 'Failed to update category');
    },
  });

  const deleteMutation = trpc.blog.deleteCategory.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      alert(error.message || 'Failed to delete category');
    },
  });

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#9333ea');
  };

  const handleEdit = (category: NonNullable<typeof categories>[0]) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setColor(category.color || '#9333ea');
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    const data = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      color: color || undefined,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (confirm(`Delete category "${categoryName}"? This cannot be undone.`)) {
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

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
                <span>Categories</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Blog Categories</h1>
              <p className="mt-2 text-slate-600">
                Organize your blog posts into categories
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
              New Category
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) {
                        setSlug(generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="category-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this category"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-16 rounded border border-slate-200 cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#9333ea"
                    className="w-32 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {categories?.length || 0} categor{(categories?.length || 0) === 1 ? 'y' : 'ies'}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {categories.map((category) => (
                <div key={category.id} className="px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#9333ea' }}
                      >
                        <FolderTree className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        <p className="text-sm text-slate-500 font-mono">{category.slug}</p>
                        {category.description && (
                          <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">
                        {(category as any)._count?.posts || 0} posts
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderTree className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No categories yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create your first category to organize your blog posts
              </p>
              <Button
                className="mt-4 gap-2"
                onClick={() => {
                  resetForm();
                  setIsCreating(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
