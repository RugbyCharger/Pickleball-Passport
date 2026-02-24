/**
 * Partner Marketing Materials Page
 * E9-S4: Marketing Materials Library
 *
 * Features:
 * - Browse marketing materials by category
 * - Preview materials before download
 * - Download email templates, flyers, social media content, presentations
 * - Copy social media captions to clipboard
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Presentation,
  Mail,
  Check,
  Copy,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MARKETING_MATERIALS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type MaterialCategory,
  type MarketingMaterial,
} from '@/lib/data/marketing-materials';

export default function PartnerMaterialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<MarketingMaterial | null>(null);

  const filteredMaterials =
    selectedCategory === 'all'
      ? MARKETING_MATERIALS
      : MARKETING_MATERIALS.filter((m) => m.category === selectedCategory);

  const handleDownload = (material: MarketingMaterial) => {
    // Create download link
    const link = document.createElement('a');
    link.href = material.downloadUrl;
    link.download = material.downloadUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // TODO: Track download in database
    console.log('Downloaded:', material.id);
  };

  const handleCopyCaption = async (material: MarketingMaterial) => {
    // For social media materials, copy a sample caption
    const caption = generateSocialCaption(material);
    await navigator.clipboard.writeText(caption);
    setCopiedId(material.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSocialCaption = (material: MarketingMaterial): string => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepickleballpassport.org';
    return `🏓 Excited to share The Pickleball Passport with our club members!

${material.description}

Transform your game while experiencing exceptional wellness and adventure in beautiful Thailand. Perfect for pickleball players looking for their next trip!

Learn more: ${baseUrl}

#PickleballPassport #PickleballTravel #Thailand #WellnessTravel`;
  };

  const categories: (MaterialCategory | 'all')[] = ['all', 'email', 'flyer', 'social', 'presentation'];

  const getCategoryIcon = (category: MaterialCategory | 'all') => {
    switch (category) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'flyer':
        return <FileText className="h-4 w-4" />;
      case 'social':
        return <ImageIcon className="h-4 w-4" />;
      case 'presentation':
        return <Presentation className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Marketing Materials</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Marketing Materials Library</h1>
          <p className="mt-1 text-slate-600">
            Download ready-to-use materials to promote The Pickleball Passport at your club
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {getCategoryIcon(category)}
                {category === 'all' ? 'All Materials' : CATEGORY_LABELS[category]}
              </button>
            ))}
          </nav>
        </div>

        {/* Category Description */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-800">
              {CATEGORY_DESCRIPTIONS[selectedCategory]}
            </p>
          </div>
        )}

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="group rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Preview Image */}
                {material.previewUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-slate-100">
                    <img
                      src={material.previewUrl}
                      alt={material.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={() => setPreviewMaterial(material)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20"
                    >
                      <Eye className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-t-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                    {getCategoryIcon(material.category)}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{material.title}</h3>
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {material.fileFormat}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-slate-600">{material.description}</p>

                  {/* File Info */}
                  <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
                    {material.fileSize && <span>{material.fileSize}</span>}
                    {material.tags && material.tags.length > 0 && (
                      <div className="flex gap-1">
                        {material.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-slate-100 px-2 py-0.5 text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(material)}
                      className="flex-1 gap-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    {material.category === 'social' && (
                      <Button
                        onClick={() => handleCopyCaption(material)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {copiedId === material.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Caption
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No materials found</h3>
            <p className="mt-2 text-sm text-slate-600">
              Try selecting a different category
            </p>
          </div>
        )}

        {/* Preview Modal */}
        {previewMaterial && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setPreviewMaterial(null)}
          >
            <div
              className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {previewMaterial.previewUrl && (
                  <img
                    src={previewMaterial.previewUrl}
                    alt={previewMaterial.title}
                    className="w-full"
                  />
                )}
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                >
                  <svg
                    className="h-5 w-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900">{previewMaterial.title}</h2>
                <p className="mt-2 text-slate-600">{previewMaterial.description}</p>
                <div className="mt-4">
                  <Button onClick={() => handleDownload(previewMaterial)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download {previewMaterial.fileFormat}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
