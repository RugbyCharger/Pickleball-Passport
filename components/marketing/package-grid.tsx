'use client';

import { trpc } from '@/lib/trpc/client';
import { PackageCard } from './package-card';
import { motion } from 'framer-motion';

/**
 * PackageGrid Component
 * Displays the package explorer grid with all active packages
 * Fetches data from tRPC and handles loading/error states
 */
export function PackageGrid() {
  const { data: packages, isLoading, error } = trpc.package.getAll.useQuery();

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">
          Unable to load packages. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[400px] animate-pulse rounded-2xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600">
          No packages available at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          slug={pkg.slug}
          name={pkg.name}
          tagline={pkg.tagline}
          basePrice={pkg.basePrice}
          durationOptions={pkg.durationOptions}
          heroImageUrl={pkg.heroImageUrl}
        />
      ))}
    </div>
  );
}

/**
 * PackageSection Component
 * Full section wrapper for the package explorer
 * Includes heading and description
 */
export function PackageSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Our Transformation Packages
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose your journey. Whether you're seeking pure pickleball bliss,
            a stunning smile makeover, or complete personal transformation,
            we have a package designed for you.
          </p>
        </motion.div>

        {/* Package Grid */}
        <PackageGrid />

        {/* CTA Below Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-gray-600">
            Not sure which package is right for you?
          </p>
          <a
            href="#application"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg"
          >
            <span>Start Your Application</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
