/**
 * Admin Package Content Editor
 * Story 12-2: Package Content Editing
 *
 * Features:
 * - Rich text editing with TipTap for descriptions
 * - Image upload/management for hero images
 * - Edit pricing display text and duration options text
 * - Preview changes before publishing
 * - Link packages to CMS content blocks
 * - Audit log of package content changes
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
  History,
  RotateCcw,
  Image as ImageIcon,
  Plus,
  X,
  Link as LinkIcon,
  Unlink,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/cms/rich-text-editor';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ContentBlockType = 'TEXT' | 'HERO' | 'FEATURE' | 'TESTIMONIAL' | 'CTA' | 'FAQ' | 'GALLERY' | 'VIDEO' | 'CUSTOM';

const TYPE_COLORS: Record<ContentBlockType, string> = {
  TEXT: 'bg-blue-100 text-blue-700',
  HERO: 'bg-purple-100 text-purple-700',
  FEATURE: 'bg-indigo-100 text-indigo-700',
  TESTIMONIAL: 'bg-pink-100 text-pink-700',
  CTA: 'bg-orange-100 text-orange-700',
  FAQ: 'bg-cyan-100 text-cyan-700',
  GALLERY: 'bg-green-100 text-green-700',
  VIDEO: 'bg-red-100 text-red-700',
  CUSTOM: 'bg-slate-100 text-slate-700',
};

export default function PackageContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  // Form state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [cmsDescription, setCmsDescription] = useState<unknown>({ type: 'doc', content: [] });
  const [cmsPricingText, setCmsPricingText] = useState('');
  const [cmsDurationText, setCmsDurationText] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // UI state
  const [showVersions, setShowVersions] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'blocks' | 'seo'>('content');

  // Fetch package data
  const { data: packageData, isLoading, refetch } = trpc.packageCms.getPackageContent.useQuery(
    { id: packageId }
  );

  // Fetch available blocks for linking
  const { data: availableBlocks } = trpc.packageCms.getAvailableBlocks.useQuery(
    { packageId },
    { enabled: showBlockSelector }
  );

  // Mutations
  const updateMutation = trpc.packageCms.updatePackageContent.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      alert(error.message || 'Failed to save');
    },
  });

  const restoreVersionMutation = trpc.packageCms.restorePackageVersion.useMutation({
    onSuccess: () => {
      refetch();
      setShowVersions(false);
    },
    onError: (error) => alert(error.message || 'Failed to restore version'),
  });

  const linkBlockMutation = trpc.packageCms.linkBlockToPackage.useMutation({
    onSuccess: () => {
      refetch();
      setShowBlockSelector(false);
    },
    onError: (error) => alert(error.message || 'Failed to link block'),
  });

  const unlinkBlockMutation = trpc.packageCms.unlinkBlockFromPackage.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(error.message || 'Failed to unlink block'),
  });

  // Load package data into form
  useEffect(() => {
    if (packageData) {
      setName(packageData.name);
      setTagline(packageData.tagline || '');
      setDescription(packageData.description);
      setCmsDescription(packageData.cmsDescription || { type: 'doc', content: [] });
      setCmsPricingText(packageData.cmsPricingText || '');
      setCmsDurationText(packageData.cmsDurationText || '');
      setHeroImageUrl(packageData.heroImageUrl || '');
      setImageUrls(packageData.imageUrls || []);
      setMetaTitle(packageData.metaTitle || '');
      setMetaDescription(packageData.metaDescription || '');
    }
  }, [packageData]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: packageId,
      name,
      tagline: tagline || null,
      description,
      cmsDescription,
      cmsPricingText: cmsPricingText || null,
      cmsDurationText: cmsDurationText || null,
      heroImageUrl: heroImageUrl || null,
      imageUrls,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      changesSummary: 'Content updated via CMS',
    });
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (confirm(`Restore to version ${versionNumber}? Current content will be saved first.`)) {
      await restoreVersionMutation.mutateAsync({
        packageId,
        versionNumber,
      });
    }
  };

  const handleLinkBlock = async (blockId: string) => {
    await linkBlockMutation.mutateAsync({
      blockId,
      packageId,
    });
  };

  const handleUnlinkBlock = async (blockId: string) => {
    if (confirm('Unlink this content block from the package?')) {
      await unlinkBlockMutation.mutateAsync({ blockId });
    }
  };

  const handleAddGalleryImage = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl('');
      setHasChanges(true);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleFieldChange = () => {
    setHasChanges(true);
  };

  const isSaving = updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Package not found</p>
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
              <Link href="/dashboard/admin/cms/packages">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Edit Package Content
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-slate-500">{packageData.name}</span>
                  {lastSaved && (
                    <span className="text-xs text-slate-500">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {hasChanges && (
                    <span className="text-xs text-amber-600">Unsaved changes</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>

              <Link href={`/dashboard/admin/cms/packages/${packageId}/preview`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>

              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
              {(['content', 'images', 'blocks', 'seo'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Basic Information</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm text-slate-700">Package Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="Pure Play"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline" className="text-sm text-slate-700">Tagline</Label>
                      <Input
                        id="tagline"
                        value={tagline}
                        onChange={(e) => {
                          setTagline(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="Your perfect pickleball getaway"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm text-slate-700">Plain Text Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="Basic description for SEO and fallback..."
                        className="mt-1"
                        rows={3}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Markdown description used for SEO. The rich text below is for visual display.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rich Text Description */}
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                    Rich Text Description
                  </Label>
                  <p className="text-xs text-slate-500 mb-3">
                    Use the rich text editor for formatted content displayed on the website.
                  </p>
                  <RichTextEditor
                    content={cmsDescription}
                    onChange={(content) => {
                      setCmsDescription(content);
                      handleFieldChange();
                    }}
                    placeholder="Write a compelling description..."
                  />
                </div>

                {/* Pricing & Duration Text */}
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Pricing & Duration Display</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cmsPricingText" className="text-sm text-slate-700">
                        Custom Pricing Display Text
                      </Label>
                      <Textarea
                        id="cmsPricingText"
                        value={cmsPricingText}
                        onChange={(e) => {
                          setCmsPricingText(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="Starting from $X,XXX including all activities, meals, and accommodation..."
                        className="mt-1"
                        rows={2}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Override the default pricing display with custom text.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cmsDurationText" className="text-sm text-slate-700">
                        Duration Options Text
                      </Label>
                      <Textarea
                        id="cmsDurationText"
                        value={cmsDurationText}
                        onChange={(e) => {
                          setCmsDurationText(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="Choose between 7, 10, 14, or 21-day experiences..."
                        className="mt-1"
                        rows={2}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Describe the duration options available for this package.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Hero Image */}
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Hero Image</h3>

                  <div className="space-y-4">
                    {heroImageUrl && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={heroImageUrl}
                          alt="Hero preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setHeroImageUrl('');
                            handleFieldChange();
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="heroImageUrl" className="text-sm text-slate-700">Hero Image URL</Label>
                      <Input
                        id="heroImageUrl"
                        value={heroImageUrl}
                        onChange={(e) => {
                          setHeroImageUrl(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Gallery Images</h3>

                  <div className="space-y-4">
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveGalleryImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryImage();
                          }
                        }}
                      />
                      <Button variant="outline" onClick={handleAddGalleryImage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Blocks Tab */}
            {activeTab === 'blocks' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Linked Content Blocks</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Reusable content blocks associated with this package
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBlockSelector(true)}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Link Block
                    </Button>
                  </div>

                  {packageData.contentBlocks.length > 0 ? (
                    <div className="space-y-3">
                      {packageData.contentBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900">{block.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                  TYPE_COLORS[block.type as ContentBlockType]
                                )}>
                                  {block.type}
                                </span>
                                <span className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                  block.status === 'PUBLISHED'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                )}>
                                  {block.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/admin/cms/blocks/${block.id}`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnlinkBlock(block.id)}
                              disabled={unlinkBlockMutation.isPending}
                            >
                              <Unlink className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      <LinkIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p>No content blocks linked</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowBlockSelector(true)}
                      >
                        Link First Block
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">SEO Settings</h3>

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
                        placeholder="Package Name | Pickleball Passport"
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="metaDescription" className="text-sm text-slate-700">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => {
                          setMetaDescription(e.target.value);
                          handleFieldChange();
                        }}
                        placeholder="A compelling description for search engines..."
                        className="mt-1"
                        rows={3}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {metaDescription.length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Info Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Package Details</h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Base Price</dt>
                  <dd className="font-medium text-slate-900">
                    ${(packageData.basePrice / 100).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Duration Options</dt>
                  <dd className="font-medium text-slate-900">
                    {packageData.durationOptions.join(', ')} days
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      packageData.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    )}>
                      {packageData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Linked Blocks</dt>
                  <dd className="font-medium text-slate-900">
                    {packageData.contentBlocks.length}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Version History */}
            {showVersions && packageData.contentVersions.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </h3>

                <div className="space-y-3">
                  {packageData.contentVersions.map((version) => (
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

      {/* Block Selector Modal */}
      {showBlockSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Link Content Block</h2>
              <button
                onClick={() => setShowBlockSelector(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableBlocks && availableBlocks.length > 0 ? (
                <div className="space-y-3">
                  {availableBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{block.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            TYPE_COLORS[block.type as ContentBlockType]
                          )}>
                            {block.type}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{block.slug}</span>
                          {block.package && (
                            <span className="text-xs text-slate-400">
                              (currently linked to {block.package.name})
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLinkBlock(block.id)}
                        disabled={linkBlockMutation.isPending}
                      >
                        Link
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <p>No available content blocks</p>
                  <Link href="/dashboard/admin/cms/blocks/new">
                    <Button variant="outline" size="sm" className="mt-3">
                      Create New Block
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
