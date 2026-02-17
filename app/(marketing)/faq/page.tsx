/**
 * Public FAQ Page
 * Story 12-4: FAQ Management
 *
 * Features:
 * - Accordion UI for FAQs
 * - Category filtering
 * - Search functionality
 * - Responsive design
 */

'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/cms/rich-text-editor';
import {
  Search,
  X,
  Loader2,
  HelpCircle,
  MessageCircle,
  FolderOpen,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch FAQs
  const { data: faqs, isLoading: faqsLoading } = trpc.faq.getPublicFAQs.useQuery({
    categoryId: selectedCategoryId || undefined,
    search: searchQuery || undefined,
  });

  // Fetch categories for filtering
  const { data: categories, isLoading: categoriesLoading } =
    trpc.faq.getPublicCategories.useQuery();

  const isLoading = faqsLoading || categoriesLoading;

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    if (!faqs) return {};

    return faqs.reduce(
      (acc, faq) => {
        const categoryName = faq.category?.name || 'General';
        const categoryId = faq.category?.id || 'uncategorized';

        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: categoryName,
            faqs: [],
          };
        }
        acc[categoryId].faqs.push(faq);
        return acc;
      },
      {} as Record<string, { name: string; faqs: typeof faqs }>
    );
  }, [faqs]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

  const hasResults = faqs && faqs.length > 0;
  const showNoResults = !isLoading && searchQuery && !hasResults;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-20 sm:py-28">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Waves className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4 text-[#B08D55]" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about The Pickleball Passport
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1D2D44]/50" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-14 py-7 text-lg bg-white text-[#1D2D44] border-0 rounded-2xl shadow-xl focus:ring-2 focus:ring-[#B08D55] placeholder:text-[#1D2D44]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1D2D44]/40 hover:text-[#1D2D44]/60 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant={selectedCategoryId === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    'rounded-full px-6 py-2 font-medium transition-all',
                    selectedCategoryId === null
                      ? 'bg-gradient-to-r from-[#1D2D44] to-[#495F87] text-white shadow-lg'
                      : 'border-[#1D2D44]/20 text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white'
                  )}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      'rounded-full px-6 py-2 font-medium transition-all',
                      selectedCategoryId === category.id
                        ? 'bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] shadow-lg'
                        : 'border-[#1D2D44]/20 text-[#1D2D44] hover:bg-[#B08D55] hover:text-[#1D2D44] hover:border-[#B08D55]'
                    )}
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-70">
                      ({category._count?.faqs || 0})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <p className="text-[#1D2D44]/60">Loading FAQs...</p>
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F5E6D3] flex items-center justify-center">
                <HelpCircle className="h-10 w-10 text-[#B08D55]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-3">
                No results found
              </h2>
              <p className="text-[#1D2D44]/60 mb-6">
                We couldn&apos;t find any FAQs matching &quot;{searchQuery}&quot;
              </p>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white rounded-xl px-6"
              >
                Clear search
              </Button>
            </div>
          )}

          {/* FAQs by Category */}
          {!isLoading && hasResults && (
            <div className="space-y-10">
              {Object.entries(groupedFAQs).map(([categoryId, { name, faqs: categoryFaqs }]) => (
                <div key={categoryId}>
                  {/* Category Header */}
                  {(selectedCategoryId === null || searchQuery) && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[#1D2D44]">{name}</h2>
                        <span className="text-sm text-[#1D2D44]/60">
                          {categoryFaqs.length} {categoryFaqs.length === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FAQ Accordion */}
                  <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFaqs.map((faq, index) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className={cn(
                            'border-b border-[#B08D55]/10',
                            index === categoryFaqs.length - 1 && 'border-b-0'
                          )}
                        >
                          <AccordionTrigger className="px-6 py-5 text-left hover:bg-[#FDF8F3] [&[data-state=open]]:bg-[#FDF8F3] transition-colors">
                            <span className="text-base font-medium text-[#1D2D44] pr-4">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div className="prose prose-sm max-w-none text-[#1D2D44]/70 leading-relaxed">
                              <RichTextContent content={faq.answer} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State (no FAQs at all) */}
          {!isLoading && !searchQuery && (!faqs || faqs.length === 0) && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F5E6D3] flex items-center justify-center">
                <HelpCircle className="h-10 w-10 text-[#B08D55]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-3">
                No FAQs yet
              </h2>
              <p className="text-[#1D2D44]/60 mb-6">
                Check back soon for frequently asked questions.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 md:p-14 border border-[#B08D55]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#B08D55]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1D2D44]/5 rounded-full blur-2xl" />

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-4">
                Still have questions?
              </h2>
              <p className="text-[#1D2D44]/70 mb-8 max-w-xl mx-auto">
                Can&apos;t find what you&apos;re looking for? Our team is here to help.
                Reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-4">
            Explore More
          </h2>
          <p className="text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
            Learn more about our transformation packages and how we can help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/how-it-works">
              <Button
                size="lg"
                className="bg-[#1D2D44] hover:bg-[#002B42] text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                How It Works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                View Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
