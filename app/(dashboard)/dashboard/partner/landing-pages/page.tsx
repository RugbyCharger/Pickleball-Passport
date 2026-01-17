/**
 * Partner Landing Pages List Page
 * E9-S8: Co-Branded Landing Pages
 *
 * Features:
 * - List all landing pages for the partner
 * - Create new landing page
 * - Edit/delete existing pages
 * - View analytics (views, clicks, conversions)
 * - Copy landing page link
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PartnerLandingPagesPage() {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: landingPages, isLoading } = trpc.partner.getMyLandingPages.useQuery();
  const { data: profile } = trpc.partner.getMyProfile.useQuery();

  const deleteMutation = trpc.partner.deleteLandingPage.useMutation({
    onSuccess: () => {
      utils.partner.getMyLandingPages.invalidate();
    },
  });

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to delete landing page:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
            <li className="font-medium text-slate-900">Landing Pages</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Co-Branded Landing Pages</h1>
            <p className="mt-1 text-slate-600">
              Create custom landing pages with your club branding to share with members
            </p>
          </div>
          <Link href="/dashboard/partner/landing-pages/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Landing Page
            </Button>
          </Link>
        </div>

        {/* Landing Pages Grid */}
        {landingPages && landingPages.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {landingPages.map((page) => (
              <div
                key={page.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{page.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      /p/{page.slug}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      page.isPublished
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Analytics */}
                <div className="mb-4 grid grid-cols-3 gap-4 rounded-lg bg-slate-50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-900">
                      <Eye className="h-4 w-4 text-slate-500" />
                      {page.viewCount}
                    </div>
                    <p className="text-xs text-slate-600">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-900">
                      <MousePointerClick className="h-4 w-4 text-slate-500" />
                      {page.clickCount}
                    </div>
                    <p className="text-xs text-slate-600">Clicks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-900">
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                      {page.conversionCount}
                    </div>
                    <p className="text-xs text-slate-600">Conversions</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {page.isPublished && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(page.slug)}
                      className="flex-1 gap-2"
                    >
                      {copiedSlug === page.slug ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  )}
                  {page.isPublished && (
                    <Link href={`/p/${page.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/partner/landing-pages/${page.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id, page.name)}
                    className="gap-2 text-red-600 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 p-3">
                <Plus className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No landing pages yet
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Create your first co-branded landing page to share with your members
              </p>
              <Link href="/dashboard/partner/landing-pages/new" className="mt-6 inline-block">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Landing Page
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
