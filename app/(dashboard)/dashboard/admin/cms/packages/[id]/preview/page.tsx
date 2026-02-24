/**
 * Admin Package Content Preview
 * Story 12-2: Package Content Editing
 *
 * Features:
 * - Preview package content before publishing
 * - View rich text rendered content
 * - Preview linked content blocks
 * - Visual comparison between current and previous versions
 */

'use client';

import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  Loader2,
  ArrowLeft,
  Edit,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/cms/rich-text-editor';
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

export default function PackageContentPreviewPage() {
  const params = useParams();
  const packageId = params.id as string;

  // Fetch package content
  const { data: packageData, isLoading } = trpc.packageCms.getPackageContent.useQuery(
    { id: packageId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Package not found</p>
      </div>
    );
  }

  const hasRichDescription = packageData.cmsDescription &&
    typeof packageData.cmsDescription === 'object' &&
    (packageData.cmsDescription as { content?: unknown[] }).content?.length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/admin/cms/packages/${packageId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Preview: {packageData.name}
                </h1>
                <p className="text-xs text-slate-500">
                  This is how the package content will appear on the website
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                packageData.isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {packageData.isActive ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {packageData.isActive ? 'Active' : 'Inactive'}
              </span>
              <Link href={`/dashboard/admin/cms/packages/${packageId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              {packageData.isActive && (
                <Link href={`/packages/${packageData.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="mx-auto max-w-4xl py-8 px-4">
        {/* Preview Warning Banner */}
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            <strong>Preview Mode:</strong> This is a preview of how the package content will appear.
            Changes must be saved in the editor to be reflected here.
          </p>
        </div>

        {/* Package Card Preview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Hero Image */}
          {packageData.heroImageUrl ? (
            <div className="relative aspect-[21/9] w-full">
              <img
                src={packageData.heroImageUrl}
                alt={packageData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-4xl font-bold">{packageData.name}</h1>
                {packageData.tagline && (
                  <p className="text-xl mt-2 opacity-90">{packageData.tagline}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative aspect-[21/9] w-full bg-slate-200 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-slate-400 mx-auto" />
                <p className="mt-2 text-slate-500">No hero image set</p>
              </div>
            </div>
          )}

          {/* Package Content */}
          <div className="p-8">
            {/* Price & Duration Info */}
            <div className="flex flex-wrap gap-6 mb-8 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Starting from</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(packageData.basePrice / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Duration options</p>
                <p className="text-lg font-medium text-slate-900">
                  {packageData.durationOptions.join(', ')} days
                </p>
              </div>
            </div>

            {/* Custom Pricing Text */}
            {packageData.cmsPricingText && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Pricing Details
                </h3>
                <p className="text-slate-700">{packageData.cmsPricingText}</p>
              </div>
            )}

            {/* Custom Duration Text */}
            {packageData.cmsDurationText && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Duration Options
                </h3>
                <p className="text-slate-700">{packageData.cmsDurationText}</p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                About This Package
              </h3>

              {hasRichDescription ? (
                <div className="prose prose-slate max-w-none">
                  <RichTextContent content={packageData.cmsDescription} />
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <p>{packageData.description}</p>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            {packageData.imageUrls && packageData.imageUrls.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Gallery
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {packageData.imageUrls.map((url, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={url}
                        alt={`${packageData.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Content Blocks */}
            {packageData.contentBlocks && packageData.contentBlocks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Additional Content
                </h3>
                <div className="space-y-6">
                  {packageData.contentBlocks.map((block) => (
                    <div key={block.id} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          TYPE_COLORS[block.type as ContentBlockType]
                        )}>
                          {block.type}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{block.name}</span>
                        {block.status !== 'PUBLISHED' && (
                          <span className="text-xs text-amber-600">(Draft - not visible to public)</span>
                        )}
                      </div>
                      <div className="prose prose-sm prose-slate max-w-none">
                        <RichTextContent content={block.content} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itineraries Preview */}
            {packageData.itineraries && packageData.itineraries.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Available Itineraries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {packageData.itineraries.map((itinerary) => (
                    <span
                      key={itinerary.id}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {itinerary.duration} Days
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Preview */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            SEO Preview
          </h3>

          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-lg font-medium text-blue-700 hover:underline cursor-pointer">
              {packageData.metaTitle || packageData.name}
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              https://thepickleballpassport.org/packages/{packageData.slug}
            </p>
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {packageData.metaDescription || packageData.tagline || packageData.description?.substring(0, 160)}
            </p>
          </div>
        </div>

        {/* Content Statistics */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Content Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {packageData.imageUrls?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Gallery Images</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {packageData.contentBlocks?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Content Blocks</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {packageData.itineraries?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Itineraries</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {packageData.contentVersions?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Versions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
