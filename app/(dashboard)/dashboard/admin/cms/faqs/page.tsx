/**
 * Admin FAQ Management Page
 * Story 12-4: FAQ Management
 *
 * Features:
 * - View all FAQs organized by category
 * - Create, edit, delete FAQs
 * - Drag-and-drop reordering
 * - Rich text editing with TipTap
 * - Category management
 * - Publish/unpublish workflow
 */

'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  HelpCircle,
  FolderTree,
  Eye,
  EyeOff,
  GripVertical,
  Copy,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { RichTextEditor } from '@/components/cms/rich-text-editor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQ {
  id: string;
  question: string;
  answer: unknown;
  answerPlain: string | null;
  sortOrder: number;
  isPublished: boolean;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: { faqs: number };
}

// Sortable FAQ Item Component
function SortableFAQItem({
  faq,
  onEdit,
  onDelete,
  onTogglePublish,
  onDuplicate,
  isDeleting,
}: {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string, question: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onDuplicate: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'px-4 py-3 bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors',
        isDragging && 'shadow-lg'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900 truncate">
              {faq.question}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                faq.isPublished
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}
            >
              {faq.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          {faq.answerPlain && (
            <p className="text-sm text-slate-500 truncate">
              {faq.answerPlain.slice(0, 100)}
              {faq.answerPlain.length > 100 && '...'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePublish(faq.id, !faq.isPublished)}
            title={faq.isPublished ? 'Unpublish' : 'Publish'}
          >
            {faq.isPublished ? (
              <EyeOff className="h-4 w-4 text-slate-500" />
            ) : (
              <Eye className="h-4 w-4 text-slate-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(faq.id)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(faq)}
            title="Edit"
          >
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(faq.id, faq.question)}
            disabled={isDeleting}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FAQManagementPage() {
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['uncategorized']));
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ form state
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState<unknown>(null);
  const [faqCategoryId, setFaqCategoryId] = useState<string | null>(null);
  const [faqIsPublished, setFaqIsPublished] = useState(false);

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch FAQs and categories
  const {
    data: faqsData,
    isLoading: faqsLoading,
    refetch: refetchFAQs,
  } = trpc.faq.getFAQs.useQuery({ search: searchQuery || undefined });

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = trpc.faq.getCategories.useQuery({ includeCount: true });

  const { data: stats } = trpc.faq.getStats.useQuery();

  const utils = trpc.useUtils();

  // FAQ Mutations
  const createFAQMutation = trpc.faq.createFAQ.useMutation({
    onSuccess: () => {
      refetchFAQs();
      refetchCategories();
      resetFAQForm();
      setShowFAQForm(false);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create FAQ');
    },
  });

  const updateFAQMutation = trpc.faq.updateFAQ.useMutation({
    onSuccess: () => {
      refetchFAQs();
      resetFAQForm();
      setEditingFAQ(null);
    },
    onError: (error) => {
      alert(error.message || 'Failed to update FAQ');
    },
  });

  const deleteFAQMutation = trpc.faq.deleteFAQ.useMutation({
    onSuccess: () => {
      refetchFAQs();
      refetchCategories();
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete FAQ');
    },
  });

  const publishFAQMutation = trpc.faq.publishFAQ.useMutation({
    onSuccess: () => refetchFAQs(),
  });

  const unpublishFAQMutation = trpc.faq.unpublishFAQ.useMutation({
    onSuccess: () => refetchFAQs(),
  });

  const duplicateFAQMutation = trpc.faq.duplicateFAQ.useMutation({
    onSuccess: () => {
      refetchFAQs();
      refetchCategories();
    },
  });

  const reorderFAQsMutation = trpc.faq.reorderFAQs.useMutation({
    onSuccess: () => refetchFAQs(),
  });

  // Category Mutations
  const createCategoryMutation = trpc.faq.createCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
      resetCategoryForm();
      setShowCategoryForm(false);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create category');
    },
  });

  const updateCategoryMutation = trpc.faq.updateCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
      resetCategoryForm();
      setEditingCategory(null);
    },
    onError: (error) => {
      alert(error.message || 'Failed to update category');
    },
  });

  const deleteCategoryMutation = trpc.faq.deleteCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
    },
    onError: (error) => {
      alert(error.message || 'Failed to delete category');
    },
  });

  // Form handlers
  const resetFAQForm = () => {
    setFaqQuestion('');
    setFaqAnswer(null);
    setFaqCategoryId(null);
    setFaqIsPublished(false);
    setEditingFAQ(null);
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setCategorySlug('');
    setCategoryDescription('');
    setEditingCategory(null);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategoryId(faq.categoryId);
    setFaqIsPublished(faq.isPublished);
    setShowFAQForm(true);
    setShowCategoryForm(false);
  };

  const handleEditCategory = (category: FAQCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
    setCategoryDescription(category.description || '');
    setShowCategoryForm(true);
    setShowFAQForm(false);
  };

  const handleDeleteFAQ = async (id: string, question: string) => {
    if (confirm(`Delete FAQ "${question}"? This cannot be undone.`)) {
      await deleteFAQMutation.mutateAsync({ id });
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"? This cannot be undone.`)) {
      await deleteCategoryMutation.mutateAsync({ id });
    }
  };

  const handleTogglePublish = async (id: string, publish: boolean) => {
    if (publish) {
      await publishFAQMutation.mutateAsync({ id });
    } else {
      await unpublishFAQMutation.mutateAsync({ id });
    }
  };

  const handleDuplicateFAQ = async (id: string) => {
    await duplicateFAQMutation.mutateAsync({ id });
  };

  const handleCreateFAQ = async () => {
    if (!faqQuestion.trim()) {
      alert('Question is required');
      return;
    }

    await createFAQMutation.mutateAsync({
      question: faqQuestion,
      answer: faqAnswer || { type: 'doc', content: [] },
      categoryId: faqCategoryId || undefined,
      isPublished: faqIsPublished,
    });
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ || !faqQuestion.trim()) {
      alert('Question is required');
      return;
    }

    await updateFAQMutation.mutateAsync({
      id: editingFAQ.id,
      question: faqQuestion,
      answer: faqAnswer,
      categoryId: faqCategoryId,
      isPublished: faqIsPublished,
    });
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categorySlug.trim()) {
      alert('Name and slug are required');
      return;
    }

    await createCategoryMutation.mutateAsync({
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription || undefined,
    });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim() || !categorySlug.trim()) {
      alert('Name and slug are required');
      return;
    }

    await updateCategoryMutation.mutateAsync({
      id: editingCategory.id,
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription || undefined,
    });
  };

  const handleCategoryNameChange = (value: string) => {
    setCategoryName(value);
    if (!editingCategory) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setCategorySlug(generatedSlug);
    }
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle drag end for FAQ reordering
  const handleDragEnd = useCallback(
    async (event: DragEndEvent, categoryId: string | null) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const categoryFAQs = faqsData?.faqs.filter(
          (f) => f.categoryId === categoryId
        ) || [];

        const oldIndex = categoryFAQs.findIndex((f) => f.id === active.id);
        const newIndex = categoryFAQs.findIndex((f) => f.id === over.id);

        const reorderedFAQs = arrayMove(categoryFAQs, oldIndex, newIndex);
        const faqIds = reorderedFAQs.map((f) => f.id);

        await reorderFAQsMutation.mutateAsync({
          faqIds,
          categoryId,
        });
      }
    },
    [faqsData, reorderFAQsMutation]
  );

  // Group FAQs by category
  const faqsByCategory = faqsData?.faqs.reduce(
    (acc, faq) => {
      const key = faq.categoryId || 'uncategorized';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>
  ) || {};

  const isLoading = faqsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/dashboard/admin/cms" className="hover:text-slate-700">
                  CMS
                </Link>
                <span>/</span>
                <span>FAQs</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">FAQ Management</h1>
              <p className="mt-2 text-slate-600">
                Manage frequently asked questions and organize them by category
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(true);
                  setShowFAQForm(false);
                }}
                className="gap-2"
              >
                <FolderTree className="h-4 w-4" />
                New Category
              </Button>
              <Button
                onClick={() => {
                  resetFAQForm();
                  setShowFAQForm(true);
                  setShowCategoryForm(false);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New FAQ
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Total FAQs</p>
              <p className="text-2xl font-bold text-slate-900">{stats.faqs.total}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.faqs.published}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Drafts</p>
              <p className="text-2xl font-bold text-amber-600">{stats.faqs.draft}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900">{stats.categories}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Form */}
        {showCategoryForm && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="categoryName" className="text-sm text-slate-700">
                  Name *
                </Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="General Questions"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="categorySlug" className="text-sm text-slate-700">
                  Slug *
                </Label>
                <Input
                  id="categorySlug"
                  value={categorySlug}
                  onChange={(e) =>
                    setCategorySlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    )
                  }
                  placeholder="general-questions"
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="categoryDescription" className="text-sm text-slate-700">
                  Description
                </Label>
                <Input
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Description of this category"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                disabled={
                  createCategoryMutation.isPending || updateCategoryMutation.isPending
                }
              >
                {(createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* FAQ Form */}
        {showFAQForm && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingFAQ ? 'Edit FAQ' : 'Create FAQ'}
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="faqQuestion" className="text-sm text-slate-700">
                  Question *
                </Label>
                <Input
                  id="faqQuestion"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="What is your question?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm text-slate-700">Answer *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={faqAnswer}
                    onChange={setFaqAnswer}
                    placeholder="Enter the answer to this question..."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="faqCategory" className="text-sm text-slate-700">
                    Category
                  </Label>
                  <select
                    id="faqCategory"
                    value={faqCategoryId || ''}
                    onChange={(e) => setFaqCategoryId(e.target.value || null)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Uncategorized</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="faqPublished"
                    checked={faqIsPublished}
                    onChange={(e) => setFaqIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="faqPublished" className="text-sm text-slate-700">
                    Publish immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={editingFAQ ? handleUpdateFAQ : handleCreateFAQ}
                disabled={createFAQMutation.isPending || updateFAQMutation.isPending}
              >
                {(createFAQMutation.isPending || updateFAQMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetFAQForm();
                  setShowFAQForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* FAQs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Categories */}
            {categories?.map((category) => {
              const categoryFAQs = faqsByCategory[category.id] || [];
              const isExpanded = expandedCategories.has(category.id);

              return (
                <div
                  key={category.id}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <FolderTree className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{category.name}</span>
                      <span className="text-sm text-slate-500">
                        ({categoryFAQs.length} FAQs)
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        disabled={
                          deleteCategoryMutation.isPending || categoryFAQs.length > 0
                        }
                        title={
                          categoryFAQs.length > 0
                            ? 'Cannot delete category with FAQs'
                            : 'Delete category'
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Category FAQs */}
                  {isExpanded && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, category.id)}
                    >
                      <SortableContext
                        items={categoryFAQs.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {categoryFAQs.length > 0 ? (
                          categoryFAQs.map((faq) => (
                            <SortableFAQItem
                              key={faq.id}
                              faq={faq}
                              onEdit={handleEditFAQ}
                              onDelete={handleDeleteFAQ}
                              onTogglePublish={handleTogglePublish}
                              onDuplicate={handleDuplicateFAQ}
                              isDeleting={deleteFAQMutation.isPending}
                            />
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-500">
                            <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p>No FAQs in this category</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => {
                                resetFAQForm();
                                setFaqCategoryId(category.id);
                                setShowFAQForm(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add FAQ
                            </Button>
                          </div>
                        )}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              );
            })}

            {/* Uncategorized FAQs */}
            {(faqsByCategory['uncategorized']?.length > 0 ||
              (categories?.length === 0 && faqsData?.faqs.length === 0)) && (
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                {/* Uncategorized Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => toggleCategoryExpanded('uncategorized')}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {expandedCategories.has('uncategorized') ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">Uncategorized</span>
                    <span className="text-sm text-slate-500">
                      ({faqsByCategory['uncategorized']?.length || 0} FAQs)
                    </span>
                  </button>
                </div>

                {/* Uncategorized FAQs */}
                {expandedCategories.has('uncategorized') && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, null)}
                  >
                    <SortableContext
                      items={(faqsByCategory['uncategorized'] || []).map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {faqsByCategory['uncategorized']?.length > 0 ? (
                        faqsByCategory['uncategorized'].map((faq) => (
                          <SortableFAQItem
                            key={faq.id}
                            faq={faq}
                            onEdit={handleEditFAQ}
                            onDelete={handleDeleteFAQ}
                            onTogglePublish={handleTogglePublish}
                            onDuplicate={handleDuplicateFAQ}
                            isDeleting={deleteFAQMutation.isPending}
                          />
                        ))
                      ) : (
                        <div className="px-4 py-12 text-center text-slate-500">
                          <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                          <h3 className="text-lg font-medium text-slate-900">No FAQs yet</h3>
                          <p className="mt-1 text-sm">
                            Create your first FAQ to help users find answers
                          </p>
                          <Button
                            className="mt-4 gap-2"
                            onClick={() => {
                              resetFAQForm();
                              setShowFAQForm(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Create First FAQ
                          </Button>
                        </div>
                      )}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preview Link */}
        <div className="mt-8 text-center">
          <Link
            href="/faq"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <Eye className="h-4 w-4" />
            Preview public FAQ page
          </Link>
        </div>
      </div>
    </div>
  );
}
