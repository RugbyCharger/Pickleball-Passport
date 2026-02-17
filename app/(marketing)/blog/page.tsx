/**
 * Public Blog Listing Page
 * Story 12-3: Blog Posts System
 *
 * Features:
 * - Grid display of published blog posts
 * - Category and tag filtering
 * - Search functionality
 * - Pagination
 * - Responsive design
 * - SEO optimized
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  Loader2,
  FileText,
  Calendar,
  ArrowRight,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Helper functions to update filters and reset page
  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const updateCategorySlug = (slug: string | null) => {
    setSelectedCategorySlug(slug);
    setPage(0);
  };

  const updateTagSlug = (slug: string | null) => {
    setSelectedTagSlug(slug);
    setPage(0);
  };

  // Fetch posts
  const { data, isLoading, isFetching } = trpc.blog.getPublishedPosts.useQuery({
    categorySlug: selectedCategorySlug || undefined,
    tagSlug: selectedTagSlug || undefined,
    search: searchQuery || undefined,
    limit: POSTS_PER_PAGE,
    offset: page * POSTS_PER_PAGE,
  });

  // Fetch categories for filtering
  const { data: categories } = trpc.blog.getPublicCategories.useQuery();

  // Fetch tags for filtering
  const { data: tags } = trpc.blog.getPublicTags.useQuery();

  const posts = data?.posts || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const hasResults = posts.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategorySlug(null);
    setSelectedTagSlug(null);
    setPage(0);
  };

  const showNoResults = !isLoading && (searchQuery || selectedCategorySlug || selectedTagSlug) && !hasResults;
  const showEmpty = !isLoading && !searchQuery && !selectedCategorySlug && !selectedTagSlug && !hasResults;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1D2D44] to-[#005A82] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The Pickleball Passport Blog
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto">
            Stories, tips, and insights from the world of pickleball wellness travel
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg bg-white text-slate-900 border-0 rounded-full shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => updateSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategorySlug === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateCategorySlug(null)}
                  className="rounded-full"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategorySlug === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      updateCategorySlug(category.slug);
                      setSelectedTagSlug(null);
                    }}
                    className="rounded-full"
                    style={
                      selectedCategorySlug === category.slug && category.color
                        ? { backgroundColor: category.color, borderColor: category.color }
                        : undefined
                    }
                  >
                    {category.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({category._count?.posts || 0})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Filter */}
          {tags && tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      updateTagSlug(selectedTagSlug === tag.slug ? null : tag.slug);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors',
                      selectedTagSlug === tag.slug
                        ? 'bg-[#1D2D44] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchQuery || selectedCategorySlug || selectedTagSlug) && (
            <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">
                  Search: {searchQuery}
                  <button onClick={() => updateSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategorySlug && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">
                  Category: {categories?.find(c => c.slug === selectedCategorySlug)?.name}
                  <button onClick={() => updateCategorySlug(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedTagSlug && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm">
                  Tag: {tags?.find(t => t.slug === selectedTagSlug)?.name}
                  <button onClick={() => updateTagSlug(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1D2D44]" />
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No articles found
              </h2>
              <p className="text-slate-600 mb-6">
                We couldn&apos;t find any articles matching your criteria.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          )}

          {/* Empty State (no posts at all) */}
          {showEmpty && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Coming Soon
              </h2>
              <p className="text-slate-600 mb-6">
                We&apos;re working on some great content. Check back soon!
              </p>
            </div>
          )}

          {/* Blog Posts Grid */}
          {!isLoading && hasResults && (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      {/* Featured Image */}
                      <div className="relative aspect-[16/10] bg-slate-100">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.featuredImageAlt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-slate-300" />
                          </div>
                        )}
                        {post.category && (
                          <span
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: post.category.color || '#1D2D44' }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1D2D44] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-slate-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {post.publishedAt && formatDate(post.publishedAt.toString())}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[#1D2D44] font-medium group-hover:gap-2 transition-all">
                            Read more
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((t) => (
                              <span
                                key={t.tag.id}
                                className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                              >
                                {t.tag.name}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-slate-400">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0 || isFetching}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        disabled={isFetching}
                        className="w-10"
                      >
                        {pageNum + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1 || isFetching}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Results count */}
              <p className="mt-4 text-center text-sm text-slate-500">
                Showing {page * POSTS_PER_PAGE + 1}-{Math.min((page + 1) * POSTS_PER_PAGE, total)} of {total} articles
              </p>
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 px-4 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Stay Updated
          </h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Get the latest stories and travel tips delivered to your inbox.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-[#1D2D44] hover:bg-[#002B42]">
              Subscribe to Newsletter
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
