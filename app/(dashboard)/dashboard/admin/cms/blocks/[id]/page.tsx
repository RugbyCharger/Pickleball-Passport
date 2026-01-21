/**
 * Admin Content Block Editor
 * Story 12-1: CMS Setup
 *
 * Features:
 * - Rich text editing with TipTap
 * - Block metadata editing (name, slug, type)
 * - Draft/Publish workflow
 * - Version history with restore
 * - Content preview
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Save,
  Loader2,
  ArrowLeft,
  Eye,
  Send,
  Clock,
  History,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/cms/rich-text-editor';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ContentBlockType = 'TEXT' | 'HERO' | 'FEATURE' | 'TESTIMONIAL' | 'CTA' | 'FAQ' | 'GALLERY' | 'VIDEO' | 'CUSTOM';

const TYPE_OPTIONS: { value: ContentBlockType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'HERO', label: 'Hero Section' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'TESTIMONIAL', label: 'Testimonial' },
  { value: 'CTA', label: 'Call to Action' },
  { value: 'FAQ', label: 'FAQ' },
  { value: 'GALLERY', label: 'Gallery' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'CUSTOM', label: 'Custom' },
];

const STATUS_COLORS = {
  DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function ContentBlockEditorPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.id as string;
  const isNew = blockId === 'new';

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<ContentBlockType>('TEXT');
  const [content, setContent] = useState<unknown>({ type: 'doc', content: [] });
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch block if editing
  const { data: block, isLoading, refetch } = trpc.cms.getBlockById.useQuery(
    { id: blockId },
    { enabled: !isNew }
  );

  // Fetch categories
  const { data: categories } = trpc.cms.getCategories.useQuery();

  // Mutations
  const createMutation = trpc.cms.createBlock.useMutation({
    onSuccess: (newBlock) => {
      setLastSaved(new Date());
      setHasChanges(false);
      router.replace(`/dashboard/admin/cms/blocks/${newBlock.id}`);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create block');
    },
  });

  const updateMutation = trpc.cms.updateBlock.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      alert(error.message || 'Failed to save');
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

  const restoreVersionMutation = trpc.cms.restoreBlockVersion.useMutation({
    onSuccess: () => {
      refetch();
      setShowVersions(false);
    },
    onError: (error) => alert(error.message || 'Failed to restore version'),
  });

  // Load block data into form
  useEffect(() => {
    if (block) {
      setName(block.name);
      setSlug(block.slug);
      setType(block.type as ContentBlockType);
      setContent(block.content);
      setCategoryId(block.categoryId);
    }
  }, [block]);

  // Auto-generate slug from name for new blocks
  useEffect(() => {
    if (isNew && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [isNew, name, slug]);

  const handleSave = async () => {
    if (!name || !slug) {
      alert('Name and slug are required');
      return;
    }

    if (isNew) {
      await createMutation.mutateAsync({
        name,
        slug,
        type,
        content,
        categoryId: categoryId || undefined,
      });
    } else {
      await updateMutation.mutateAsync({
        id: blockId,
        name,
        slug,
        type,
        content,
        categoryId,
      });
    }
  };

  const handlePublish = async () => {
    if (hasChanges) {
      await handleSave();
    }
    await publishMutation.mutateAsync({ id: blockId });
  };

  const handleUnpublish = async () => {
    if (confirm('Unpublish this block?')) {
      await unpublishMutation.mutateAsync({ id: blockId });
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (confirm(`Restore to version ${versionNumber}? Current content will be saved first.`)) {
      await restoreVersionMutation.mutateAsync({
        blockId,
        versionNumber,
      });
    }
  };

  const handleContentChange = (newContent: unknown) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleFieldChange = () => {
    setHasChanges(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
              <Link href="/dashboard/admin/cms/blocks">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {isNew ? 'Create Content Block' : 'Edit Content Block'}
                </h1>
                {!isNew && block && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
                      STATUS_COLORS[block.status as keyof typeof STATUS_COLORS]
                    )}>
                      {block.status === 'PUBLISHED' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {block.status}
                    </span>
                    {lastSaved && (
                      <span className="text-xs text-slate-500">
                        Saved {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                    {hasChanges && (
                      <span className="text-xs text-amber-600">Unsaved changes</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isNew && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              )}

              {!isNew && (
                <Link href={`/dashboard/admin/cms/blocks/${blockId}/preview`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>

              {!isNew && block?.status !== 'PUBLISHED' && (
                <Button
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
              )}

              {!isNew && block?.status === 'PUBLISHED' && (
                <Button
                  variant="outline"
                  onClick={handleUnpublish}
                  disabled={unpublishMutation.isPending}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rich Text Editor */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Content
              </Label>
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your content..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Block Settings */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Block Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm text-slate-700">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Homepage Hero"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm text-slate-700">Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                      handleFieldChange();
                    }}
                    placeholder="homepage-hero"
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Unique identifier for referencing this block
                  </p>
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm text-slate-700">Block Type</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as ContentBlockType);
                      handleFieldChange();
                    }}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm text-slate-700">Category</Label>
                  <select
                    id="category"
                    value={categoryId || ''}
                    onChange={(e) => {
                      setCategoryId(e.target.value || null);
                      handleFieldChange();
                    }}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">No category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Version History */}
            {showVersions && !isNew && block?.versions && block.versions.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </h3>

                <div className="space-y-3">
                  {block.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Version {version.versionNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </p>
                        {version.changesSummary && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {version.changesSummary}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreVersion(version.versionNumber)}
                        disabled={restoreVersionMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
