/**
 * Admin Content Page Editor
 * Story 12-1: CMS Setup
 *
 * Features:
 * - Page metadata editing (title, slug, SEO)
 * - Content block management
 * - Draft/Publish workflow
 * - Version history
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
  CheckCircle,
  Home,
  Globe,
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_COLORS = {
  DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function ContentPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const isNew = pageId === 'new';

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [template, setTemplate] = useState('');
  const [isHomepage, setIsHomepage] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch page if editing
  const { data: page, isLoading, refetch } = trpc.cms.getPageById.useQuery(
    { id: pageId },
    { enabled: !isNew }
  );

  // Fetch categories
  const { data: categories } = trpc.cms.getCategories.useQuery();

  // Mutations
  const createMutation = trpc.cms.createPage.useMutation({
    onSuccess: (newPage) => {
      setLastSaved(new Date());
      setHasChanges(false);
      router.replace(`/dashboard/admin/cms/pages/${newPage.id}`);
    },
    onError: (error) => {
      alert(error.message || 'Failed to create page');
    },
  });

  const updateMutation = trpc.cms.updatePage.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      alert(error.message || 'Failed to save');
    },
  });

  const publishMutation = trpc.cms.publishPage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to publish'),
  });

  const unpublishMutation = trpc.cms.unpublishPage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to unpublish'),
  });

  // Load page data into form
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setDescription(page.description || '');
      setMetaTitle(page.metaTitle || '');
      setMetaDescription(page.metaDescription || '');
      setOgImage(page.ogImage || '');
      setTemplate(page.template || '');
      setIsHomepage(page.isHomepage);
      setCategoryId(page.categoryId);
    }
  }, [page]);

  // Auto-generate slug from title for new pages
  useEffect(() => {
    if (isNew && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [isNew, title, slug]);

  const handleSave = async () => {
    if (!title || !slug) {
      alert('Title and slug are required');
      return;
    }

    if (isNew) {
      await createMutation.mutateAsync({
        title,
        slug,
        description: description || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        ogImage: ogImage || undefined,
        template: template || undefined,
        isHomepage,
        categoryId: categoryId || undefined,
      });
    } else {
      await updateMutation.mutateAsync({
        id: pageId,
        title,
        slug,
        description: description || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        template: template || null,
        isHomepage,
        categoryId,
      });
    }
  };

  const handlePublish = async () => {
    if (hasChanges) {
      await handleSave();
    }
    await publishMutation.mutateAsync({ id: pageId });
  };

  const handleUnpublish = async () => {
    if (confirm('Unpublish this page?')) {
      await unpublishMutation.mutateAsync({ id: pageId });
    }
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
              <Link href="/dashboard/admin/cms/pages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {isNew ? 'Create Content Page' : 'Edit Content Page'}
                </h1>
                {!isNew && page && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
                      STATUS_COLORS[page.status as keyof typeof STATUS_COLORS]
                    )}>
                      {page.status === 'PUBLISHED' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {page.status}
                    </span>
                    {page.isHomepage && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
                        <Home className="h-3 w-3" />
                        Homepage
                      </span>
                    )}
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

              {!isNew && page?.status === 'PUBLISHED' && (
                <Link href={`/${page.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Live
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

              {!isNew && page?.status !== 'PUBLISHED' && (
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

              {!isNew && page?.status === 'PUBLISHED' && (
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
            {/* Basic Info */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Page Details</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm text-slate-700">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="About Us"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-sm text-slate-700">URL Slug *</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-l-md border border-r-0 border-slate-300">
                      /
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'));
                        handleFieldChange();
                      }}
                      placeholder="about-us"
                      className="rounded-l-none font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Use slashes for nested paths (e.g., about/team)
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm text-slate-700">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Brief description of the page content"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle" className="text-sm text-slate-700">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Custom page title for search engines"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {metaTitle.length}/60 characters (recommended)
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription" className="text-sm text-slate-700">Meta Description</Label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="Description shown in search results"
                    rows={2}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {metaDescription.length}/160 characters (recommended)
                  </p>
                </div>

                <div>
                  <Label htmlFor="ogImage" className="text-sm text-slate-700 flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Open Graph Image
                  </Label>
                  <Input
                    id="ogImage"
                    value={ogImage}
                    onChange={(e) => {
                      setOgImage(e.target.value);
                      handleFieldChange();
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Image shown when sharing on social media
                  </p>
                </div>
              </div>
            </div>

            {/* Content Blocks */}
            {!isNew && page?.blocks && page.blocks.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Content Blocks</h3>
                <div className="space-y-3">
                  {page.blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">{block.name}</p>
                        <p className="text-xs text-slate-500">{block.type}</p>
                      </div>
                      <Link href={`/dashboard/admin/cms/blocks/${block.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Page Settings */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Page Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="template" className="text-sm text-slate-700">Template</Label>
                  <select
                    id="template"
                    value={template}
                    onChange={(e) => {
                      setTemplate(e.target.value);
                      handleFieldChange();
                    }}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Default</option>
                    <option value="landing">Landing Page</option>
                    <option value="content">Content Page</option>
                    <option value="full-width">Full Width</option>
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHomepage"
                    checked={isHomepage}
                    onChange={(e) => {
                      setIsHomepage(e.target.checked);
                      handleFieldChange();
                    }}
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="isHomepage" className="text-sm text-slate-700 flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Set as Homepage
                  </Label>
                </div>
              </div>
            </div>

            {/* Version History */}
            {showVersions && !isNew && page?.versions && page.versions.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </h3>

                <div className="space-y-3">
                  {page.versions.map((version) => (
                    <div
                      key={version.id}
                      className="py-2 px-3 rounded-lg bg-slate-50"
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
