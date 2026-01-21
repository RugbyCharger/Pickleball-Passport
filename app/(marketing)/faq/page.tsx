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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#003D5C] to-[#005A82] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-6">
            Find answers to common questions about Pickleball Passport
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg bg-white text-slate-900 border-0 rounded-full shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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
        <div className="max-w-4xl mx-auto">
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategoryId === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                  className="rounded-full"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({category._count?.faqs || 0})
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#003D5C]" />
            </div>
          )}

          {/* No Results State */}
          {showNoResults && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No results found
              </h2>
              <p className="text-slate-600 mb-6">
                We couldn&apos;t find any FAQs matching &quot;{searchQuery}&quot;
              </p>
              <Button onClick={clearSearch} variant="outline">
                Clear search
              </Button>
            </div>
          )}

          {/* FAQs by Category */}
          {!isLoading && hasResults && (
            <div className="space-y-8">
              {Object.entries(groupedFAQs).map(([categoryId, { name, faqs: categoryFaqs }]) => (
                <div key={categoryId}>
                  {/* Category Header */}
                  {(selectedCategoryId === null || searchQuery) && (
                    <div className="flex items-center gap-2 mb-4">
                      <FolderOpen className="h-5 w-5 text-[#003D5C]" />
                      <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                      <span className="text-sm text-slate-500">
                        ({categoryFaqs.length} questions)
                      </span>
                    </div>
                  )}

                  {/* FAQ Accordion */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFaqs.map((faq, index) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className={cn(
                            index === categoryFaqs.length - 1 && 'border-b-0'
                          )}
                        >
                          <AccordionTrigger className="px-6 py-4 text-left hover:bg-slate-50 [&[data-state=open]]:bg-slate-50">
                            <span className="text-base font-medium text-slate-900 pr-4">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="prose prose-sm max-w-none text-slate-600">
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
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No FAQs yet
              </h2>
              <p className="text-slate-600 mb-6">
                Check back soon for frequently asked questions.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-12 px-4 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-[#003D5C]" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our team is here to help.
            Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-[#003D5C] hover:bg-[#002B42]">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
