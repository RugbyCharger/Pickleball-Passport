'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Calendar, MapPin, Users, Trophy, ExternalLink } from 'lucide-react';
import { TripDetailLayout } from '@/components/trips/trip-detail-layout';
import { TripSectionContentHuaHin } from '@/components/trips/trip-section-content-hua-hin';
import { useReserveHref } from '@/lib/hooks/use-reserve-href';

/* ─────────────────────── CREDENTIALS ─────────────────────── */

const credentials = [
  '5.5 DUPR',
  'Level 1 PPR Certified Pro',
  'DUPR Certified Coach',
  'Inaugural Champion, All Florida Pro League (Ft. Myers Flamingos)',
  '20+ Pro Moneyball Tournament wins',
  'Wins vs. Anna Bright, Parris Todd',
  'Wins vs. multiple Top 100 PPA Pros & Top 20 APP Pros',
  'Qualified for APP Main Draw',
  'BS Sport Management, NC State University',
  'USTA National Coordinator (3 years)',
  'Featured on Tennis Channel, ESPN, Amazon, Freevee',
];

const coachingHighlights = [
  'Four coached sessions with BK across the 9 days',
  'Drills, strategy, and live match-play feedback',
  'Open play and an optional friendly tournament',
];

/* ─────────────────────── COMPONENT ─────────────────────── */

export function July16Page() {
  const reserveHref = useReserveHref();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0F1A2A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left column — copy */}
            <div>
              {/* Eyebrow */}
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-4">
                July 16–24, 2026 · Bangkok + Hua Hin · Exclusive
              </p>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Train with a PPR Certified Pro
              </h1>

              {/* Sub-hero */}
              <p className="text-lg italic text-[#B08D55] mb-6">
                Bharat "BK" Karunakaran joins this departure as headlining coach.
              </p>

              {/* Body */}
              <p className="text-white/70 text-base leading-relaxed mb-8">
                The July 16 departure is the only summer trip joined by BK Karunakaran — Professional Pickleball Player, Content Creator, and PPR Certified Pro Coach. Across nine days in Bangkok and Hua Hin, BK leads every coached session: drills, strategy, and live feedback alongside open play and an optional friendly tournament.
              </p>

              {/* Coaching highlights checklist */}
              <ul className="space-y-3 mb-10">
                {coachingHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Trip badges */}
              <div className="flex flex-wrap gap-3 mb-10">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#B08D55]" />
                  Jul 16 – Jul 24, 2026
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#B08D55]" />
                  2 Cities · 2 Five-Star Hotels
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <Users className="h-4 w-4 text-[#B08D55]" />
                  16 Spaces Available
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <Trophy className="h-4 w-4 text-[#B08D55]" />
                  4 Coached Sessions
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={reserveHref}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
                >
                  Reserve your place
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={reserveHref}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  Request availability
                </Link>
              </div>
            </div>

            {/* Right column — BK photo */}
            <div className="flex flex-col items-center gap-6">
              {/* Silhouette / dynamic treatment */}
              <div className="relative w-full max-w-sm mx-auto">
                <div className="relative h-[480px] rounded-2xl overflow-hidden">
                  <Image
                    src="/bk-karunakaran.jpeg"
                    alt='Bharat "BK" Karunakaran'
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                  {/* Gold accent overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2A]/80 via-transparent to-transparent" />
                </div>
                {/* Caption */}
                <p className="mt-3 text-xs text-white/40 text-center">
                  Bharat "BK" Karunakaran · BK Pickleball · Pro Player & Content Creator
                </p>
              </div>
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

      {/* ── BK Bio Block ── */}
      <section className="py-14 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Bio — 2/3 */}
            <div className="lg:col-span-2">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-2">About BK</p>
              <div className="prose prose-lg max-w-none text-[#1D2D44]/80 leading-relaxed space-y-4">
                <p>
                  Bharat "BK" Karunakaran is a Professional Pickleball Player and Content Creator based in Orlando — and the headlining coach on the July 16 TPP departure. Originally from Chennai, India, BK came up in tennis and badminton from age five, studied Sport Management at NC State, and spent three years with the USTA as National Coordinator of Junior Programs before going full-time pickleball pro in 2024.
                </p>
                <p>
                  A Level 1 PPR Certified Pro with a 5.5 DUPR, BK has tournament wins over Anna Bright, Parris Todd, and multiple Top 100 PPA pros.
                </p>
              </div>
            </div>

            {/* Credentials sidebar — 1/3 */}
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-6 shadow-sm h-fit">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-4">Credentials</p>
              <ul className="space-y-2.5">
                {credentials.map((cred) => (
                  <li key={cred} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B08D55] flex-shrink-0 mt-2" />
                    <span className="text-sm text-[#1D2D44]/80 leading-snug">{cred}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-5 border-t border-[#B08D55]/10">
                <Link
                  href="https://www.instagram.com/bk_pickleball"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
                >
                  Follow BK at @bk_pickleball
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#B08D55]/10" />

      {/* ── Standard Route A Trip Details ── */}
      <TripDetailLayout
        tripName="Bangkok + Hua Hin (Jul 16–24)"
        cities="The Peninsula Bangkok · Anantara Hua Hin Resort"
        dates="Jul 16–24, 2026"
        price={3888}
        depositAmount={1163}
        depositLink="https://buy.stripe.com/eVqbJ12O7fQPh0N1ZX2cg06"
        fullLink="https://buy.stripe.com/eVq5kD1K33435i5fQN2cg09"
        spotsLeft={16}
        totalSpots={16}
        ContentComponent={TripSectionContentHuaHin}
      />

    </main>
  );
}
