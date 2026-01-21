/**
 * Admin Content Categories
 * Story 12-1: CMS Setup
 *
 * Features:
 * - View all categories with hierarchy
 * - Create, edit, delete categories
 * - Reorder categories
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
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ContentCategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for new/edit
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState<string | null>(null);

  // Fetch categories
  const {
    data: categories,
    isLoading,
    refetch,
  } = trpc.cms.getCategories.useQuery({ includeChildren: true });

  // Mutations
  const createMutation = trpc.cms.createCategory.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
      setShowCreateForm(false);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create category');
    },
  });

  const updateMutation = trpc.cms.updateCategory.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
      setEditingId(null);
    },
    onError: (error) => {
      alert(error.message || 'Failed to update category');
    },
  });

  const deleteMutation = trpc.cms.deleteCategory.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete category');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormParentId(null);
  };

  const handleCreate = async () => {
    if (!formName || !formSlug) {
      alert('Name and slug are required');
      return;
    }

    await createMutation.mutateAsync({
      name: formName,
      slug: formSlug,
      description: formDescription || undefined,
      parentId: formParentId || undefined,
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formName || !formSlug) {
      alert('Name and slug are required');
      return;
    }

    await updateMutation.mutateAsync({
      id: editingId,
      name: formName,
      slug: formSlug,
      description: formDescription || undefined,
      parentId: formParentId,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"? This cannot be undone.`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const startEditing = (category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
  }) => {
    setEditingId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || '');
    setFormParentId(category.parentId);
    setShowCreateForm(false);
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormName(value);
    if (!editingId) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormSlug(generatedSlug);
    }
  };

  // Separate root categories and build hierarchy
  const rootCategories = categories?.filter((c) => !c.parentId) || [];

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
                <span>Categories</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Content Categories</h1>
              <p className="mt-2 text-slate-600">
                Organize your content with hierarchical categories
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
                setEditingId(null);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingId) && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? 'Edit Category' : 'Create Category'}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm text-slate-700">Name *</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Blog Posts"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-sm text-slate-700">Slug *</Label>
                <Input
                  id="slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="blog-posts"
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description" className="text-sm text-slate-700">Description</Label>
                <Input
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Description of this category"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="parent" className="text-sm text-slate-700">Parent Category</Label>
                <select
                  id="parent"
                  value={formParentId || ''}
                  onChange={(e) => setFormParentId(e.target.value || null)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">None (Root Category)</option>
                  {categories?.filter((c) => c.id !== editingId).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingId ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {categories?.length || 0} categories
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : rootCategories.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {rootCategories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderTree className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No categories yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Create categories to organize your content
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 gap-2"
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

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    children?: CategoryRowProps['category'][];
  };
  level: number;
  onEdit: (category: CategoryRowProps['category']) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

function CategoryRow({ category, level, onEdit, onDelete, isDeleting }: CategoryRowProps) {
  return (
    <>
      <div
        className="px-6 py-4 hover:bg-slate-50 transition-colors"
        style={{ paddingLeft: `${24 + level * 24}px` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {level > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
            <div>
              <p className="font-medium text-slate-900">{category.name}</p>
              <p className="text-sm text-slate-500 font-mono">{category.slug}</p>
              {category.description && (
                <p className="text-sm text-slate-600 mt-0.5">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id, category.name)}
              disabled={isDeleting || (category.children && category.children.length > 0)}
              title={
                category.children && category.children.length > 0
                  ? 'Cannot delete category with children'
                  : 'Delete category'
              }
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Render children */}
      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </>
  );
}
