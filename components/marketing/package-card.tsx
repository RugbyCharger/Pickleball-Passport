'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface PackageCardProps {
  slug: string;
  name: string;
  tagline: string | null;
  basePrice: number;
  durationOptions: number[];
  heroImageUrl: string | null;
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
 * PackageCard Component
 * Displays a single package with luxury styling
 */
export function PackageCard({
  slug,
  name,
  tagline,
  basePrice,
  durationOptions,
  heroImageUrl,
}: PackageCardProps) {
  const minDuration = Math.min(...durationOptions);
  const maxDuration = Math.max(...durationOptions);
  const durationText =
    minDuration === maxDuration
      ? `${minDuration} days`
      : `${minDuration}-${maxDuration} days`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <Link
        href={`/packages/${slug}`}
        className="block overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
          {heroImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${heroImageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-24 w-24 text-emerald-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Package Name */}
          <h3 className="mb-2 text-2xl font-bold text-gray-900 transition-colors group-hover:text-emerald-600">
            {name}
          </h3>

          {/* Tagline */}
          {tagline && (
            <p className="mb-4 text-sm italic text-gray-600">{tagline}</p>
          )}

          {/* Metadata */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{durationText}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Thailand</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Starting at</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(basePrice)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-medium transition-all group-hover:gap-3">
              <span>Learn More</span>
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
