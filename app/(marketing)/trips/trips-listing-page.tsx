'use client';

import { Sparkles, Palmtree, Sun } from 'lucide-react';
import { TripCard } from '@/components/trips/trip-card';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';

export function TripsListingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-16 sm:py-24">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Sun className="w-24 h-24 text-[#B08D55]" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#B08D55]" />
              Curated Pickleball Travel
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Upcoming Trips
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Explore our curated lineup of international pickleball travel experiences.
              Each trip blends competitive play, cultural immersion, and wellness —
              designed for players who want more than just a vacation.
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Trip Cards Grid */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Thailand 13-Day - Active */}
            <TripCard
              destination="THAILAND"
              subtitle="Bangkok &bull; Chiang Mai &bull; Phuket"
              dates="May 15 – 27, 2026"
              price="From $3,999"
              badge="13 Days / 12 Nights"
              href="/trips/thailand"
              status="available"
            />

            {/* Thailand 8-Day - Active */}
            <TripCard
              destination="THAILAND"
              subtitle="Bangkok &bull; Chiang Mai"
              dates="May 15 – 22, 2026"
              price="From $2,888"
              badge="8 Days / 7 Nights"
              href="/trips/thailand-8-day"
              status="available"
            />

            {/* Bali - Coming Soon */}
            <ComingSoonCard
              destination="BALI"
              subtitle="Ubud &bull; Seminyak &bull; Uluwatu"
            />

            {/* Vietnam - Coming Soon */}
            <ComingSoonCard
              destination="VIETNAM"
              subtitle="Ho Chi Minh City &bull; Hoi An &bull; Hanoi"
            />

            {/* Malaysia - Coming Soon */}
            <ComingSoonCard
              destination="MALAYSIA"
              subtitle="Kuala Lumpur &bull; Langkawi &bull; Penang"
            />

            {/* Japan - Coming Soon */}
            <ComingSoonCard
              destination="JAPAN"
              subtitle="Tokyo &bull; Kyoto &bull; Osaka"
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1D2D44]/60 text-sm leading-relaxed">
            New destinations are added based on demand. Want to see a specific
            destination? Email us at{' '}
            <a
              href="mailto:jaron@thepickleballpassport.org"
              className="text-[#B08D55] hover:underline font-medium"
            >
              jaron@thepickleballpassport.org
            </a>{' '}
            and let us know where you want to play next.
          </p>
        </div>
      </section>
    </main>
  );
}
