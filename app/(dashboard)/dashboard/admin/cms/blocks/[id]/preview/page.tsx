/**
 * Content Block Preview
 * Story 12-1: CMS Setup
 *
 * Preview a content block before publishing
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Loader2, Edit, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/cms/rich-text-editor';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

export default function ContentBlockPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.id as string;
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const { data: block, isLoading } = trpc.cms.getBlockById.useQuery({ id: blockId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Block not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-sm font-semibold text-slate-900">
                  Preview: {block.name}
                </h1>
                <p className="text-xs text-slate-500">{block.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Viewport Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewport === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewport('desktop')}
                  className="h-8 w-8 p-0"
                  title="Desktop view"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewport === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewport('tablet')}
                  className="h-8 w-8 p-0"
                  title="Tablet view"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewport === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewport('mobile')}
                  className="h-8 w-8 p-0"
                  title="Mobile view"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              <Link href={`/dashboard/admin/cms/blocks/${blockId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center py-8 px-4">
        <div
          className={cn(
            'bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300',
            viewport === 'mobile' && 'border-[12px] border-slate-800 rounded-[32px]'
          )}
          style={{
            width: VIEWPORT_SIZES[viewport].width,
            maxWidth: '100%',
          }}
        >
          {/* Preview content */}
          <div className="p-6">
            <div className="mb-4 pb-4 border-b border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {block.type} Block
              </p>
              <h2 className="text-xl font-semibold text-slate-900">{block.name}</h2>
            </div>

            <RichTextContent content={block.content} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-600">
            <span>Status: <strong className={cn(
              block.status === 'PUBLISHED' ? 'text-emerald-600' : 'text-amber-600'
            )}>{block.status}</strong></span>
            <span>Type: {block.type}</span>
            {block.category && <span>Category: {block.category.name}</span>}
          </div>
          <span className="text-slate-500">
            Viewing: {VIEWPORT_SIZES[viewport].label}
          </span>
        </div>
      </div>
    </div>
  );
}
