'use client';

import Link from 'next/link';
import { Sparkles, MapPin, Calendar, Users, Trophy, ArrowRight } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContent8Day } from '@/components/trips/trip-section-content-8day';

export function Thailand8DayTripPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* ══════════ TRIP HEADER ══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-16 sm:py-20">
        {/* Decorative orbs */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#B08D55]" />
              The Essential Experience
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              8-Day Pickleball Paradise
            </h1>

            {/* Subline */}
            <p className="text-xl sm:text-2xl text-white/80 mb-6 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-[#B08D55]" />
                Bangkok
              </span>
              <span className="text-[#B08D55]">&bull;</span>
              <span>Hua Hin</span>
            </p>

            {/* Trip summary badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                8 Days / 7 Nights
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Users className="h-4 w-4 text-[#B08D55]" />
                2 Boutique Hotels
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

      {/* ══════════ TABBED CONTENT + SIDEBAR ══════════ */}
      <TripDetailLayout
        tripName="Thailand - 8 Days / 7 Nights"
        cities="Bangkok · Hua Hin"
        dates="May 6–13, 2026"
        price={2888}
        depositAmount={722}
        depositLink="https://buy.stripe.com/8x29ATagz5cb4e19sp2cg03"
        fullLink="https://buy.stripe.com/7sYaEXcoHgUTh0N7kh2cg02"
        ContentComponent={TripSectionContent8Day}
      />

      {/* ══════════ CROSS-LINK TO 13-DAY ══════════ */}
      <section className="py-12 bg-gradient-to-br from-[#1D2D44] to-[#495F87]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80 text-lg mb-3">Looking for the full experience?</p>
          <Link
            href="/trips/thailand"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#CFB78D] font-semibold text-xl transition-colors"
          >
            Check out our 13-Day Ultimate Thailand Tour
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
