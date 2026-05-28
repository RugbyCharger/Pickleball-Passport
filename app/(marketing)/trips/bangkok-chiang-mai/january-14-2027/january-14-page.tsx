'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, Calendar, MapPin, Users, TreePalm, ExternalLink } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContentChiangMai } from '@/components/trips/trip-section-content-chiang-mai';
import { useReserveHref } from '@/lib/hooks/use-reserve-href';

/* ─────────────────────── PHUKET DATA ─────────────────────── */

const phuketOptions = [
  {
    hotel: 'Banyan Tree Phuket',
    tier: 'Luxury',
    options: [
      { nights: 3, price: 1988 },
      { nights: 5, price: 2988 },
    ],
  },
  {
    hotel: 'Angsana Laguna Phuket',
    tier: 'Premium',
    options: [
      { nights: 3, price: 1488 },
      { nights: 5, price: null },
    ],
  },
];

const phuketIncludes = [
  'Hotel accommodation at your chosen property',
  'Daily breakfast',
  'Pickleball at Raccoon Pickleball Club',
  'Private airport transfer (Chiang Mai → Phuket flight not included)',
  'Trip ends in Phuket — fly home from HKT',
];

/* ─────────────────────── COMPONENT ─────────────────────── */

export function January14Page() {
  const reserveHref = useReserveHref();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0F1A2A] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-4">
              January 14–22, 2027 · Bangkok + Chiang Mai · High Season
            </p>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Bangkok + Chiang Mai
            </h1>

            <p className="text-xl text-[#B08D55] italic mb-4">
              The only departure with a Phuket Extension option.
            </p>

            <p className="text-white/70 text-base leading-relaxed mb-8 max-w-2xl">
              The January 14 departure follows the standard Route B format — 9 days across Bangkok and Chiang Mai — with one distinction: this is the only Chiang Mai departure where you can add a Phuket extension and fly home from the beach. Choose 3 or 5 nights at Banyan Tree Phuket or Angsana Laguna Phuket.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Jan 14 – Jan 22, 2027
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities + Optional Phuket
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Users className="h-4 w-4 text-[#B08D55]" />
                8 of 16 spaces remaining
              </div>
              <div className="flex items-center gap-2 bg-[#B08D55]/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
                <TreePalm className="h-4 w-4 text-[#B08D55]" />
                Phuket Extension Available
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={reserveHref}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
              >
                Talk to our team
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={reserveHref}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
              >
                Reserve your place
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32C840 34 960 40 1080 43C1200 46 1320 46 1380 46L1440 46V60H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* ── Phuket Extension ── */}
      <section className="py-14 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#B08D55] mb-2">Add-On · January 14 Departure Only</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
              Phuket Extension
            </h2>
            <p className="text-[#1D2D44]/60 text-sm max-w-2xl leading-relaxed">
              After your 9 days in Bangkok and Chiang Mai, extend into Phuket instead of flying home. Available only on this departure. Trip ends in Phuket — fly home from HKT.
            </p>
          </div>

          {/* Hotel options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            {phuketOptions.map((option) => (
              <div key={option.hotel} className="bg-white rounded-2xl border border-[#B08D55]/10 shadow-sm overflow-hidden">
                <div className="bg-[#0F1A2A] px-5 py-3">
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#B08D55]">{option.tier}</span>
                  <h3 className="text-base font-serif font-bold text-white mt-0.5">{option.hotel}</h3>
                </div>
                <div className="p-5 space-y-3">
                  {option.options.map((o) => (
                    <div key={o.nights} className="flex items-center justify-between py-2 border-b border-[#B08D55]/8 last:border-0">
                      <span className="text-sm text-[#1D2D44]/70">{o.nights} nights / {o.nights + 1} days</span>
                      {o.price ? (
                        <span className="text-sm font-bold text-[#1D2D44]">
                          +${o.price.toLocaleString()}<span className="text-xs font-normal text-[#1D2D44]/40">/person</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#1D2D44]/40 italic">Pricing on request</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* What's included */}
          <div className="bg-white rounded-2xl border border-[#B08D55]/10 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-[#1D2D44] mb-4 uppercase tracking-wide">Extension Includes</h4>
            <div className="grid sm:grid-cols-2 gap-y-2.5 gap-x-8">
              {phuketIncludes.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#1D2D44]/70 leading-snug">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[#B08D55]/10">
              <p className="text-xs text-[#1D2D44]/40 leading-relaxed">
                Chiang Mai → Phuket domestic flight not included. Extension pricing is per person, double occupancy. Single supplement available on request.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Link
              href={reserveHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
            >
              Talk to our team about the Phuket Extension
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-[#B08D55]/10" />

      {/* ── Standard Route B Details ── */}
      <TripDetailLayout
        tripName="Bangkok + Chiang Mai (Jan 14–22)"
        cities="The Peninsula Bangkok · Anantara Chiang Mai Resort"
        dates="Jan 14 – Jan 22, 2027"
        price={4860}
        depositLink="https://buy.stripe.com/eVqbJ12O7fQPh0N1ZX2cg06"
        fullLink="https://buy.stripe.com/eVq5kD1K33435i5fQN2cg09"
        spotsLeft={8}
        totalSpots={16}
        ContentComponent={TripSectionContentChiangMai}
      />

      {/* Cross-link */}
      <section className="py-12 bg-[#0F1A2A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70 text-base mb-3">Not travelling in January? View all Bangkok + Chiang Mai departures.</p>
          <Link
            href="/trips/bangkok-chiang-mai"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#CFB78D] font-semibold transition-colors"
          >
            All Chiang Mai departures
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
