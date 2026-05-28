'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Calendar, Clock, ArrowRight, Plane, Heart, Users, MapPin } from 'lucide-react';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';
import { useReserveHref } from '@/lib/hooks/use-reserve-href';

/* ─────────────────────── TRIP SCHEDULE ─────────────────────── */

const upcomingDepartures = [
  { route: 'Bangkok + Chiang Mai', startDate: 'Jul 30', endDate: 'Aug 7', status: 'live' as const, detailHref: '/trips/bangkok-chiang-mai' },
  { route: 'Bangkok + Hua Hin', startDate: 'Aug 13', endDate: 'Aug 21', status: 'coming_soon' as const, detailHref: '/trips/bangkok-hua-hin' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Aug 27', endDate: 'Sep 4', status: 'coming_soon' as const, detailHref: '/trips/bangkok-chiang-mai' },
];

/* ─────────────────────── COMING SOON ─────────────────────── */

const comingSoonDestinations = [
  {
    destination: 'BALI',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  },
  {
    destination: 'VIETNAM',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  },
  {
    destination: 'JAPAN',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    destination: 'DUBAI',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  },
  {
    destination: 'MALAYSIA',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  },
  {
    destination: 'PHILIPPINES',
    imageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80',
  },
];

/* ─────────────────────── JOURNEY STEPS ─────────────────────── */

const journeySteps = [
  {
    number: 1,
    title: 'Choose Your Route',
    description: 'Pick Bangkok + Hua Hin (year-round) or Bangkok + Chiang Mai (May–January). Same format, different destinations.',
    icon: Sparkles,
    gradient: 'from-[#1D2D44] to-[#7587A5]',
  },
  {
    number: 2,
    title: 'Reserve & Plan',
    description: 'Reserve your spot and our team will reach out to answer questions and help you prepare for the trip.',
    icon: Calendar,
    gradient: 'from-[#B08D55] to-[#CFB78D]',
  },
  {
    number: 3,
    title: 'Travel & Play',
    description: 'Arrive in Thailand where our on-the-ground team handles everything. Five-star hotels, daily pickleball, and cultural immersion.',
    icon: Plane,
    gradient: 'from-[#2D5A3D] to-[#3D7A52]',
  },
  {
    number: 4,
    title: 'Come Back for More',
    description: 'Head home with improved skills, new friendships, and the inside track on our next departure. Come once. Come back for the rest.',
    icon: Heart,
    gradient: 'from-[#E07A5F] to-[#F09B8A]',
  },
];

/* ─────────────────────── UPCOMING DEPARTURE CARD ─────────────────────── */

function UpcomingDepartureCard({
  route,
  startDate,
  endDate,
  status,
  detailHref,
}: {
  route: string;
  startDate: string;
  endDate: string;
  status: 'live' | 'coming_soon';
  detailHref: string;
}) {
  const reserveHref = useReserveHref();
  return (
    <div className="bg-white rounded-2xl border border-[#B08D55]/10 shadow-sm p-5 flex flex-col gap-3">
      <div>
        <div className="text-xs font-semibold text-[#B08D55] uppercase tracking-wide mb-1">
          {status === 'live' ? 'Now Open' : 'Coming Soon'}
        </div>
        <div className="text-base font-serif font-bold text-[#1D2D44]">{route}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar className="w-3.5 h-3.5 text-[#B08D55]" />
          <span className="text-sm text-[#1D2D44]/70">{startDate} – {endDate}, 2026</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto">
        {status === 'live' ? (
          <span className="text-sm font-bold text-[#1D2D44]">$3,888<span className="font-normal text-[#1D2D44]/50">/person</span></span>
        ) : (
          <span className="text-xs text-[#1D2D44]/40">Pricing Coming Soon</span>
        )}
        <div className="flex gap-2">
          <Link
            href={detailHref}
            className="text-xs font-medium text-[#1D2D44]/60 hover:text-[#1D2D44] transition-colors"
          >
            Details
          </Link>
          <Link
            href={reserveHref}
            className="px-3 py-1.5 rounded-lg bg-[#1D2D44] text-white text-xs font-semibold hover:bg-[#1D2D44]/80 transition-colors"
          >
            Reserve
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export function TripsListingPage() {
  const reserveHref = useReserveHref();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Featured Trip Hero ── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        {/* Background photo */}
        <Image
          src="/images/peninsula-bkk.jpg"
          alt="The Peninsula Bangkok"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient — dark at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        {/* Content */}
        <div className="relative z-10 w-full pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B08D55] text-white text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              FEATURED DEPARTURE · JULY 16 – 24, 2026
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white mb-3 leading-tight">
              Bangkok + Hua Hin
            </h1>

            <p className="text-xl sm:text-2xl text-white/75 mb-1">9 Days / 8 Nights</p>
            <p className="text-base text-white/50 mb-8">
              The Peninsula Bangkok · Anantara Hua Hin Resort
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Jul 16 – Jul 24, 2026
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities · 2 Five-Star Hotels
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Users className="h-4 w-4 text-[#B08D55]" />
                16 Spots Available
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Clock className="h-4 w-4 text-[#B08D55]" />
                Daily Pickleball
              </div>
            </div>

            {/* Price + CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="text-white">
                <span className="text-4xl font-bold">$3,888</span>
                <span className="text-white/60 text-lg ml-1">/person</span>
              </div>
              <div className="flex gap-3">
                <Link
                  href={reserveHref}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
                >
                  Talk to our team
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/trips/bangkok-hua-hin/july-16-2026"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/30 text-white font-bold text-sm backdrop-blur-sm hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  View trip details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32C840 34 960 40 1080 43C1200 46 1320 46 1380 46L1440 46V60H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* ── BK Callout ── */}
      <section className="bg-white border-b border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-stretch gap-0 bg-[#0F1A2A] rounded-2xl overflow-hidden shadow-lg">
            {/* Photo */}
            <div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0">
              <Image
                src="/bk-karunakaran-coaching.jpeg"
                alt="BK Karunakaran"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, 160px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F1A2A]/60 hidden sm:block" />
            </div>

            {/* Copy */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#B08D55] mb-2">
                July 16–24 · Featured Pro
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                Train with BK Karunakaran,<br className="hidden sm:block" /> PPR Certified Pro Coach
              </h2>
              <p className="text-sm text-white/55 leading-relaxed mb-5 max-w-md">
                5.5 DUPR · APP/PPA circuit pro · Wins over Anna Bright, Parris Todd, and multiple Top 100 PPA pros. BK joins coached sessions throughout the July 16 departure — drills, strategy, and live match-play feedback.
              </p>
              <Link
                href="/trips/bangkok-hua-hin/july-16-2026"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#B08D55] hover:text-[#CFB78D] transition-colors self-start"
              >
                See the July 16 departure
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Departures ── */}
      <section className="py-14 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-1">
              More 2026 Departures
            </h2>
            <p className="text-[#1D2D44]/50 text-sm">
              New departures every two weeks, alternating between routes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingDepartures.map((d) => (
              <UpcomingDepartureCard key={`${d.route}-${d.startDate}`} {...d} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Your Journey in 4 Steps ── */}
      <section className="py-12 sm:py-20 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Your Journey in 4 Simple Steps
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-3xl mx-auto">
              From initial consultation to your return home, we handle every detail so you can focus on playing and relaxing.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#1D2D44] via-[#B08D55] to-[#2D5A3D] -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {journeySteps.map((step) => (
                <div key={step.number} className="relative z-10 group">
                  <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#B08D55]/10 h-full">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#F5E6D3] flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-[#1D2D44]" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">{step.title}</h3>
                    <p className="text-[#1D2D44]/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Coming Soon Destinations ── */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-3">
              Coming Soon
            </h2>
            <p className="text-[#1D2D44]/60 text-base max-w-2xl mx-auto">
              New destinations launching based on demand. Sign up to be notified when booking opens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comingSoonDestinations.map((dest) => (
              <ComingSoonCard
                key={dest.destination}
                destination={dest.destination}
                imageUrl={dest.imageUrl}
                onNotifyClick={() => { window.location.href = '/notify'; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1D2D44]/60 text-sm leading-relaxed">
            New destinations are added based on demand. Want to see a specific destination? Email us at{' '}
            <a href="mailto:hello@thepickleballpassport.org" className="text-[#B08D55] hover:underline font-medium">
              hello@thepickleballpassport.org
            </a>{' '}
            and let us know where you want to play next.
          </p>
        </div>
      </section>

    </main>
  );
}
