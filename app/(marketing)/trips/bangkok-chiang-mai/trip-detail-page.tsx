'use client';

import Link from 'next/link';
import { MapPin, Calendar, Trophy, ArrowRight, Leaf, ExternalLink } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContentChiangMai } from '@/components/trips/trip-section-content-chiang-mai';

/* ─────────────────────── DEPARTURE DATA ─────────────────────── */

type DepartureStatus = 'live' | 'open' | 'special';

interface Departure {
  dates: string;
  year: string;
  price: number | null;
  season: string;
  status: DepartureStatus;
  phuket?: boolean;
  specialHref?: string;
}

const departures: Departure[] = [
  { dates: 'Jul 30 – Aug 7', year: '2026', price: 3888, season: 'Standard Season', status: 'live' },
  { dates: 'Aug 27 – Sep 4', year: '2026', price: 3888, season: 'Standard Season', status: 'open' },
  { dates: 'Sep 24 – Oct 2', year: '2026', price: 3888, season: 'Standard Season', status: 'open' },
  { dates: 'Oct 22 – Oct 30', year: '2026', price: 3888, season: 'Standard Season', status: 'open' },
  { dates: 'Nov 22–26', year: '2026', price: null, season: 'Loy Krathong Festival', status: 'special', specialHref: '/loy-krathong' },
  { dates: 'Dec 17 – Dec 25', year: '2026', price: 4860, season: 'High Season', status: 'open' },
  { dates: 'Jan 14 – Jan 22', year: '2027', price: 4860, season: 'High Season', status: 'open', phuket: true },
];

export function BangkokChiangMaiPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Trip Header */}
      <section className="relative overflow-hidden bg-[#0F1A2A] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Calendar className="w-4 h-4 text-[#B08D55]" />
              May through January
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Bangkok + Chiang Mai
            </h1>

            {/* Subline */}
            <p className="text-xl sm:text-2xl text-white/80 mb-2">
              9 Days / 8 Nights
            </p>
            <p className="text-lg text-white/60 mb-6">
              The Peninsula Bangkok &middot; Anantara Chiang Mai Resort &middot; The Peninsula Bangkok
            </p>

            {/* Trip summary badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Multiple 2026 Departures
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities, 2 Five-Star Hotels
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Trophy className="h-4 w-4 text-[#B08D55]" />
                4 Pickleball Sessions
              </div>
            </div>
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

      {/* Seasonal Pricing */}
      <section className="py-10 sm:py-14 bg-[#FDF8F3] border-b border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44] mb-1">Pricing by Season</h2>
            <p className="text-sm text-[#1D2D44]/50">All prices per person, double occupancy. Single supplement $600.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-5 shadow-sm">
              <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#1D2D44]/40 mb-1">Standard Season</div>
              <div className="text-xs text-[#1D2D44]/50 mb-3">May – October</div>
              <div className="text-3xl font-bold text-[#1D2D44]">$3,888<span className="text-sm font-normal text-[#1D2D44]/40 ml-1">/person</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-[#B08D55]/20 p-5 shadow-sm">
              <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#B08D55] mb-1">High Season</div>
              <div className="text-xs text-[#1D2D44]/50 mb-3">November – January</div>
              <div className="text-3xl font-bold text-[#1D2D44]">$4,860<span className="text-sm font-normal text-[#1D2D44]/40 ml-1">/person</span></div>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#1D2D44]/40 max-w-xl">
            For our special Loy Krathong Festival departure (Nov 22–26), see{' '}
            <Link href="/loy-krathong" className="text-[#B08D55] hover:underline font-medium inline-flex items-center gap-0.5">
              our dedicated event page <ExternalLink className="w-3 h-3" />
            </Link>.
          </p>
        </div>
      </section>

      {/* Upcoming Departures */}
      <section className="py-10 sm:py-14 bg-white border-b border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44] mb-1">2026–27 Departures</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departures.map((dep) => (
              <div
                key={`${dep.dates}-${dep.year}`}
                className={`rounded-2xl border p-5 flex flex-col gap-3 ${
                  dep.status === 'special'
                    ? 'bg-[#FDF8F3] border-[#B08D55]/30'
                    : 'bg-[#FDF8F3] border-[#B08D55]/10'
                }`}
              >
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    dep.season === 'High Season' ? 'text-[#B08D55]' :
                    dep.season === 'Loy Krathong Festival' ? 'text-[#8D7144]' :
                    'text-[#1D2D44]/40'
                  }`}>
                    {dep.season}
                  </div>
                  <div className="text-base font-serif font-bold text-[#1D2D44]">
                    {dep.dates}, {dep.year}
                  </div>
                  {dep.phuket && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] text-xs font-semibold mt-1.5">
                      + Phuket Extension available
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  {dep.price ? (
                    <div className="text-sm font-bold text-[#1D2D44]">
                      ${dep.price.toLocaleString()}<span className="font-normal text-xs text-[#1D2D44]/40 ml-1">/person</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#1D2D44]/50 italic">See dedicated event page</div>
                  )}
                </div>
                {dep.status === 'live' ? (
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D2D44] text-white text-xs font-semibold hover:bg-[#1D2D44]/80 transition-colors"
                  >
                    Reserve your place
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : dep.status === 'special' && dep.specialHref ? (
                  <Link
                    href={dep.specialHref}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#B08D55]/30 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/5 transition-colors"
                  >
                    View Loy Krathong departure
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#B08D55]/30 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/5 transition-colors"
                  >
                    Request availability
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Smoke season note */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10">
            <Leaf className="w-4 h-4 text-[#2D5A3D] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
              Chiang Mai trips run May through January. February–April departures are not available due to regional air quality during the dry season burning period. For travel during those months, consider{' '}
              <Link href="/trips/bangkok-hua-hin" className="text-[#B08D55] hover:underline font-medium">
                Route A — Bangkok + Hua Hin
              </Link>{' '}
              which operates year-round.
            </p>
          </div>
        </div>
      </section>

      {/* Main content with sidebar navigation */}
      <TripDetailLayout
        tripName="Bangkok + Chiang Mai"
        cities="The Peninsula Bangkok · Anantara Chiang Mai Resort"
        dates="Multiple 2026–27 departures"
        price={3888}
        depositLink="https://buy.stripe.com/eVqbJ12O7fQPh0N1ZX2cg06"
        fullLink="https://buy.stripe.com/eVq5kD1K33435i5fQN2cg09"
        spotsLeft={16}
        totalSpots={16}
        ContentComponent={TripSectionContentChiangMai}
      />

      {/* Cross-link to Hua Hin route */}
      <section className="py-12 bg-[#0F1A2A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70 text-base mb-3">Prefer the beach over the mountains? Route A visits Hua Hin on Thailand's Gulf Coast and runs year-round, including February through April.</p>
          <Link
            href="/trips/bangkok-hua-hin"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#CFB78D] font-semibold transition-colors"
          >
            Explore the Bangkok + Hua Hin Route
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
