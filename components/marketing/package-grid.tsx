'use client';

import { trpc } from '@/lib/trpc/client';
import { PackageCard } from './package-card';
import { motion } from 'framer-motion';
import { Palmtree, Waves, Sun, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * PackageGrid Component
 * Displays the package explorer grid with all active packages
 * Fetches data from tRPC and handles loading/error states
 */
export function PackageGrid() {
  const { data: packages, isLoading, error } = trpc.package.getAll.useQuery();

  if (error) {
    return (
      <div className="rounded-2xl border border-[#E07A5F]/30 bg-gradient-to-br from-[#E07A5F]/10 to-[#F5E6D3] p-8 text-center shadow-lg">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E07A5F]/20 flex items-center justify-center">
          <Sun className="w-6 h-6 text-[#E07A5F]" />
        </div>
        <p className="text-[#003D5C] font-medium">
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
            className="h-[400px] animate-pulse rounded-2xl bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3] border border-[#D4AF37]/10 shadow-lg"
          />
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#F5E6D3]/50 to-white p-12 text-center shadow-xl shadow-[#003D5C]/5">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center shadow-lg">
          <Sparkles className="w-8 h-8 text-[#003D5C]" />
        </div>
        <p className="text-[#003D5C]/70 text-lg">
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
 * Includes heading and description with tropical resort styling
 */
export function PackageSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF8F3] to-white py-24">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 opacity-[0.07]">
        <Palmtree className="w-48 h-48 text-[#003D5C]" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-[0.07]">
        <Waves className="w-56 h-56 text-[#003D5C]" />
      </div>
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-[#4AA4B5]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003D5C]/5 text-[#003D5C] text-sm font-medium mb-6">
            <Sun className="w-4 h-4 text-[#D4AF37]" />
            Curated Experiences
          </div>
          <h2 className="mb-4 text-4xl font-serif font-bold text-[#003D5C] sm:text-5xl">
            Our Transformation Packages
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
          <p className="mx-auto max-w-2xl text-lg text-[#003D5C]/70 leading-relaxed">
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
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-br from-[#F5E6D3]/50 to-white rounded-2xl p-8 border border-[#D4AF37]/20 shadow-xl shadow-[#003D5C]/5 max-w-2xl mx-auto">
            <p className="mb-6 text-[#003D5C]/70 text-lg">
              Not sure which package is right for you?
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C969] px-8 py-4 font-semibold text-[#003D5C] transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 shadow-lg shadow-[#D4AF37]/20"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Your Application</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 53.3C120 46.7 240 33.3 360 26.7C480 20 600 20 720 23.3C840 26.7 960 33.3 1080 36.7C1200 40 1320 40 1380 40L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
