'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, MapPin, Calendar, Trophy, ArrowRight, Sun, Star } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContentHuaHin } from '@/components/trips/trip-section-content-hua-hin';
import { FeaturedPartnerSection } from '@/components/trips/featured-partner-section';

/* ─────────────────────── DEPARTURE DATA ─────────────────────── */

const departures = [
  { dates: 'Jul 16–24', year: '2026', price: 3888, featured: true, featuredLabel: 'With BK Karunakaran', href: '/trips/bangkok-hua-hin/july-16-2026' },
  { dates: 'Aug 13–21', year: '2026', price: 3888, featured: false, href: null },
  { dates: 'Sep 10–18', year: '2026', price: 3888, featured: false, href: null },
  { dates: 'Oct 8–16', year: '2026', price: 3888, featured: false, href: null },
  { dates: 'Nov 5–13', year: '2026', price: 3888, featured: false, href: null },
  { dates: 'Dec 3–11', year: '2026', price: 3888, featured: false, href: null },
];

export function BangkokHuaHinPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Trip Header */}
      <section className="relative overflow-hidden text-white py-16 sm:py-20">
        {/* Background photo */}
        <Image
          src="/images/peninsula-pool.jpg"
          alt="The Peninsula Bangkok pool"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium">
                <Sun className="w-4 h-4 text-[#B08D55]" />
                Available Year-Round
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55]/30 backdrop-blur-sm text-white text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-[#CFB78D]" />
                July 16  ·  Featuring BK Karunakaran
              </div>
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
              The Peninsula Bangkok &middot; Anantara Hua Hin Resort &middot; The Peninsula Bangkok
            </p>

            {/* Trip summary badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Departures Jun–Jan
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

      {/* Featured Partner */}
      <FeaturedPartnerSection
        name='Bharat "BK" Karunakaran'
        title="Pro Pickleball Player & Content Creator · @bk_pickleball"
        bio="BK joins the July 16 departure as our featured partner. An APP/PPA circuit pro, inaugural All Florida Pro League champion, and one of pickleball's top instructional creators  ·  he'll be on the court with you every day in Bangkok and Hua Hin."
        siteUrl="https://www.bk-pickleball.com"
        siteName="bk-pickleball.com"
        photoSrc="/bk-karunakaran.jpeg"
        photoAlt="Bharat BK Karunakaran"
      />

      {/* Upcoming Departures */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-1">
              2026 Departures
            </h2>
            <p className="text-sm text-[#1D2D44]/50">
              From $3,888/person, double occupancy. Single supplement $600. Available year-round  ·  including February through April when Chiang Mai trips are paused for smoke season.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departures.map((dep) => (
              <div
                key={dep.dates}
                className={`rounded-2xl border p-5 flex flex-col gap-3 ${
                  dep.featured
                    ? 'bg-[#0F1A2A] border-[#B08D55]/40'
                    : 'bg-[#FDF8F3] border-[#B08D55]/10'
                }`}
              >
                <div>
                  {dep.featured && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B08D55] text-white text-xs font-semibold mb-2">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  <div className={`text-base font-serif font-bold ${dep.featured ? 'text-white' : 'text-[#1D2D44]'}`}>
                    {dep.dates}, {dep.year}
                  </div>
                  {dep.featuredLabel && (
                    <div className="text-xs text-[#B08D55] font-medium mt-0.5">{dep.featuredLabel}</div>
                  )}
                </div>
                <div className={`text-sm font-bold mt-auto ${dep.featured ? 'text-white' : 'text-[#1D2D44]'}`}>
                  ${dep.price.toLocaleString()}<span className={`font-normal text-xs ml-1 ${dep.featured ? 'text-white/50' : 'text-[#1D2D44]/40'}`}>/person</span>
                </div>
                {dep.href ? (
                  <Link
                    href={dep.href}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] text-xs font-bold transition-all hover:shadow-md"
                  >
                    View this departure
                    <ArrowRight className="w-3.5 h-3.5" />
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
        </div>
      </section>

      {/* ── Value comparison + segment upsells ── */}
      <section className="py-8 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Value banner */}
          <div className="bg-[#1D2D44] rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-white/70 text-sm">
              Bangkok Weekend ($1,488) + Hua Hin Escape ($2,488) separately = <span className="line-through text-white/30">$3,976</span>.{' '}
              <span className="text-white font-semibold">The full 9-day trip is <span className="text-[#B08D55] font-bold">$3,888</span>  ·  less money, both cities, more included.</span>
            </p>
          </div>
          {/* Segment cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#B08D55] mb-0.5">Just Bangkok</p>
                <p className="font-serif font-bold text-[#1D2D44]">Bangkok Weekend  ·  $1,488</p>
                <p className="text-[#1D2D44]/50 text-xs mt-0.5">3 nights · Peninsula Bangkok · 2 sessions</p>
              </div>
              <Link
                href="/trips/bangkok-weekend"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#B08D55]/30 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/5 transition-colors whitespace-nowrap shrink-0"
              >
                View details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-[#B08D55] mb-0.5">Just Hua Hin</p>
                <p className="font-serif font-bold text-[#1D2D44]">Hua Hin Escape  ·  $2,488</p>
                <p className="text-[#1D2D44]/50 text-xs mt-0.5">4 nights · Anantara Hua Hin · 2 sessions + ProAM</p>
              </div>
              <Link
                href="/trips/hua-hin-escape"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#B08D55]/30 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/5 transition-colors whitespace-nowrap shrink-0"
              >
                View details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main content with sidebar navigation */}
      <TripDetailLayout
        tripName="Bangkok + Hua Hin"
        cities="The Peninsula Bangkok · Anantara Hua Hin Resort"
        dates="Multiple 2026 departures"
        price={3888}
        hidePaymentPlan={true}
        fullLink="https://buy.stripe.com/eVq5kD1K33435i5fQN2cg09"
        spotsLeft={16}
        totalSpots={16}
        ContentComponent={TripSectionContentHuaHin}
      />

      {/* Cross-link to Chiang Mai route */}
      <section className="py-12 bg-[#0F1A2A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70 text-base mb-3">Prefer a mountain city over the coast? Explore our Chiang Mai route  ·  same format, ancient temples and elephants instead of beaches.</p>
          <Link
            href="/trips/bangkok-chiang-mai"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#CFB78D] font-semibold transition-colors"
          >
            Explore the Bangkok + Chiang Mai Route
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
