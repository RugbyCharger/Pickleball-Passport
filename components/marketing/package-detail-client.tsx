'use client';

import { Package, Itinerary } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ItineraryAccordion } from './itinerary-accordion';
import { PackageFAQ } from './package-faq';

interface PackageDetailClientProps {
  packageData: Package & {
    itineraries: Itinerary[];
  };
}

/**
 * Format price from cents to dollars
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * PackageDetailClient Component
 * Client-side component for package detail page with interactive features
 */
export function PackageDetailClient({ packageData }: PackageDetailClientProps) {
  const {
    name,
    tagline,
    description,
    basePrice,
    durationOptions,
    heroImageUrl,
    imageUrls,
    itineraries,
  } = packageData;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Packages
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
        {heroImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-32 w-32 text-emerald-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        )}

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto flex h-full items-end px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              {name}
            </h1>
            {tagline && (
              <p className="text-xl italic text-white/90 md:text-2xl">
                {tagline}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600 prose-strong:text-gray-900 prose-ul:text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description}
                </ReactMarkdown>
              </div>
            </motion.section>

            {/* Sample Itinerary */}
            {itineraries.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-12"
              >
                <h2 className="mb-6 text-3xl font-bold text-gray-900">
                  Sample Itinerary
                </h2>
                <ItineraryAccordion itineraries={itineraries} />
              </motion.section>
            )}

            {/* FAQ Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <PackageFAQ packageName={name} />
            </motion.section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
            >
              {/* Price */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <p className="mb-1 text-sm text-gray-600">Starting at</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {formatPrice(basePrice)}
                </p>
                <p className="mt-1 text-sm text-gray-500">per person</p>
              </div>

              {/* Duration Options */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Duration Options
                </div>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map((days) => (
                    <div
                      key={days}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                    >
                      {days} days
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {[
                    'Luxury accommodations',
                    'All meals included',
                    'Daily pickleball sessions',
                    'Airport transfers',
                    'Cultural excursions',
                    '24/7 concierge support',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-emerald-600 py-6 text-lg hover:bg-emerald-700"
              >
                <a href="#application">Apply Now</a>
              </Button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Questions? Contact us at{' '}
                <a
                  href="mailto:info@pickleballpassport.com"
                  className="text-emerald-600 hover:underline"
                >
                  info@pickleballpassport.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {imageUrls && imageUrls.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 text-center text-3xl font-bold text-gray-900"
            >
              Gallery
            </motion.h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imageUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="aspect-video overflow-hidden rounded-lg bg-gray-200"
                >
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 hover:scale-110"
                    style={{ backgroundImage: `url(${url})` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-gray-200 bg-emerald-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
          >
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Begin Your Transformation?
            </h2>
            <p className="mb-8 text-lg text-emerald-50">
              Join hundreds of guests who have experienced the trip of a lifetime
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white px-8 py-6 text-lg text-emerald-600 hover:bg-gray-100"
            >
              <a href="#application">Start Your Application</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
