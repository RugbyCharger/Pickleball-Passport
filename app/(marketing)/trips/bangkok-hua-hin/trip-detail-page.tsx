'use client';

import Link from 'next/link';
import { Sparkles, MapPin, Calendar, Users, Trophy, ArrowRight, Sun } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContentHuaHin } from '@/components/trips/trip-section-content-hua-hin';

export function BangkokHuaHinPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Trip Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-16 sm:py-20 navy-texture">
        {/* Decorative orbs */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sun className="w-4 h-4 text-[#B08D55]" />
              Available Year-Round
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Bangkok + Hua Hin
            </h1>

            {/* Subline */}
            <p className="text-xl sm:text-2xl text-white/80 mb-2">
              9 Days / 8 Nights
            </p>
            <p className="text-lg text-white/60 mb-6">
              The Peninsula Bangkok &middot; Dusit Thani Hua Hin &middot; The Peninsula Bangkok
            </p>

            {/* Trip summary badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Jun 18 – Jun 26, 2026
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities, 2 Five-Star Hotels
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Users className="h-4 w-4 text-[#B08D55]" />
                16 Guests Max
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

      {/* Main content with sidebar navigation */}
      <TripDetailLayout
        tripName="Bangkok + Hua Hin (Jun 18 - Jun 26)"
        cities="The Peninsula Bangkok · Dusit Thani Hua Hin"
        dates="Jun 18 – Jun 26, 2026"
        price={3488}
        depositAmount={872}
        depositLink="STRIPE_DEPOSIT_LINK_TBD"
        fullLink="STRIPE_FULL_PAYMENT_LINK_TBD"
        ContentComponent={TripSectionContentHuaHin}
      />

      {/* Cross-link to Chiang Mai route */}
      <section className="py-12 bg-gradient-to-br from-[#1D2D44] to-[#495F87]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80 text-lg mb-3">Want to extend your trip? Add extra days in Chiang Mai after your 9-day experience. Contact us for add-on pricing.</p>
          <Link
            href="/trips/bangkok-chiang-mai"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#CFB78D] font-semibold text-xl transition-colors"
          >
            Explore the Bangkok + Chiang Mai Route
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
