/**
 * Partner Training Resources Page
 * E9-S7: Partner Training Resources
 *
 * Features:
 * - Training resources organized by category
 * - PDF downloads, video tutorials, articles, FAQs
 * - Search and filter functionality
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Video,
  FileText,
  CheckSquare,
  Download,
  Play,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TRAINING_RESOURCES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type ResourceCategory,
  type TrainingResource,
} from '@/lib/data/training-resources';

export default function PartnerTrainingPage() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources =
    selectedCategory === 'all'
      ? TRAINING_RESOURCES
      : TRAINING_RESOURCES.filter((r) => r.category === selectedCategory);

  const searchFiltered = searchQuery
    ? filteredResources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredResources;

  const categories: (ResourceCategory | 'all')[] = [
    'all',
    'getting-started',
    'sales',
    'tutorials',
    'faq',
  ];

  const getResourceIcon = (type: TrainingResource['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <BookOpen className="h-5 w-5" />;
      case 'checklist':
        return <CheckSquare className="h-5 w-5" />;
    }
  };

  const handleDownload = (resource: TrainingResource) => {
    if (resource.url) {
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.url.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderResourceContent = (resource: TrainingResource) => {
    if (resource.type === 'video') {
      return (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
          {resource.videoId && resource.videoId !== 'placeholder' ? (
            resource.videoProvider === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${resource.videoId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <p>Video: {resource.title}</p>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 mb-2" />
                <p>Video coming soon</p>
                <p className="text-sm text-slate-400">{resource.description}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (resource.type === 'article' || resource.type === 'checklist') {
      return (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
            {resource.content}
          </pre>
        </div>
      );
    }

    return null;
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
            <li className="font-medium text-slate-900">Training Resources</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Training Resources</h1>
          <p className="mt-1 text-slate-600">
            Guides, tutorials, and resources to help you succeed as a partner
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                }}
                className={cn(
                  'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {category === 'all' ? 'All Resources' : CATEGORY_LABELS[category]}
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

        {/* Resources Grid */}
        {searchFiltered.length > 0 ? (
          <div className="space-y-6">
            {categories
              .filter((cat) => cat !== 'all' && (selectedCategory === 'all' || selectedCategory === cat))
              .map((category) => {
                const categoryResources = searchFiltered.filter((r) => r.category === category);
                if (categoryResources.length === 0) return null;

                return (
                  <div key={category} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {CATEGORY_LABELS[category as ResourceCategory]}
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        {categoryResources.map((resource) => (
                          <div
                            key={resource.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-6"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="rounded-full bg-emerald-100 p-2">
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900">{resource.title}</h3>
                                  <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
                                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                    {resource.duration && (
                                      <span>Duration: {resource.duration}</span>
                                    )}
                                    {resource.fileSize && <span>Size: {resource.fileSize}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Resource Content */}
                            {resource.category === 'faq' ? (
                              <div className="mt-4">
                                <button
                                  onClick={() =>
                                    setExpandedFaq(expandedFaq === resource.id ? null : resource.id)
                                  }
                                  className="flex w-full items-center justify-between rounded-lg bg-white p-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
                                >
                                  <span>View Answer</span>
                                  {expandedFaq === resource.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                                {expandedFaq === resource.id && (
                                  <div className="mt-2 rounded-lg bg-white p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-slate-700">
                                      {resource.content}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {renderResourceContent(resource)}
                                <div className="mt-4">
                                  {resource.type === 'pdf' && (
                                    <Button
                                      onClick={() => handleDownload(resource)}
                                      className="w-full gap-2"
                                      size="sm"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download PDF
                                    </Button>
                                  )}
                                  {resource.type === 'video' && resource.videoId === 'placeholder' && (
                                    <Button variant="outline" className="w-full gap-2" size="sm" disabled>
                                      <Play className="h-4 w-4" />
                                      Video Coming Soon
                                    </Button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No resources found</h3>
            <p className="mt-2 text-sm text-slate-600">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Try selecting a different category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
