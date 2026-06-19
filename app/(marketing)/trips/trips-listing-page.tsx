'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Calendar, Clock, ArrowRight, Plane, Heart, Users, MapPin } from 'lucide-react';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';
import { useReserveHref } from '@/lib/hooks/use-reserve-href';

/* ─────────────────────── PRODUCTS ─────────────────────── */

const products = [
  {
    label: 'Day Clinic',
    price: '$125',
    duration: '3 hours',
    description: 'Coaching, drills, and you play alongside BK. Drop in, no trip required.',
    badge: null,
    href: '/clinics',
    dark: false,
  },
  {
    label: 'Bangkok Weekend',
    price: '$1,488',
    duration: '3 nights / 4 days',
    description: 'Our 5-Star Bangkok riverside hotel. 2 sessions with BK. Boat cruise. Temples. Street food.',
    badge: 'START HERE',
    href: '/trips/bangkok-weekend',
    dark: true,
  },
  {
    label: 'Hua Hin Escape',
    price: '$2,488',
    duration: '4 nights / 5 days',
    description: 'Our 5-Star Hua Hin Resort. 2 sessions with BK. Beach, culture, ProAM tournament.',
    badge: null,
    href: '/trips/hua-hin-escape',
    dark: false,
  },
  {
    label: 'Full 9-Day Trip',
    price: '$3,888',
    duration: '9 days / 8 nights',
    description: 'Both cities. 4 sessions with BK. Bangkok riverside hotel + Our 5-Star Hua Hin Resort.',
    badge: 'BEST VALUE',
    href: '/trips/bangkok-hua-hin',
    dark: false,
  },
];

/* ─────────────────────── TRIP SCHEDULE ─────────────────────── */

const upcomingDepartures = [
  { month: 'July 2026', route: 'Bangkok + Hua Hin', price: 3888, note: 'Jul 16–24 · With BK Karunakaran', href: '/trips/bangkok-hua-hin/july-16-2026', featured: true },
  { month: 'August 2026', route: 'Bangkok + Chiang Mai', price: 3888, note: null, href: null, featured: false },
  { month: 'September 2026', route: 'Bangkok + Hua Hin', price: 3888, note: null, href: null, featured: false },
  { month: 'October 2026', route: 'Bangkok + Chiang Mai', price: 3888, note: null, href: null, featured: false },
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
  month,
  route,
  price,
  note,
  href,
  featured,
}: {
  month: string;
  route: string;
  price: number;
  note: string | null;
  href: string | null;
  featured: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${featured ? 'bg-[#0F1A2A] border-[#B08D55]/40' : 'bg-white border-[#B08D55]/10 shadow-sm'}`}>
      <div>
        {featured && (
          <div className="text-xs font-semibold text-[#B08D55] uppercase tracking-wide mb-1">Featured Departure</div>
        )}
        <div className={`text-base font-serif font-bold ${featured ? 'text-white' : 'text-[#1D2D44]'}`}>{month}</div>
        <div className={`text-sm mt-0.5 ${featured ? 'text-white/60' : 'text-[#1D2D44]/60'}`}>{route}</div>
        {note && (
          <div className="text-xs text-[#B08D55] mt-1">{note}</div>
        )}
        {!note && (
          <div className={`text-xs mt-1 ${featured ? 'text-white/30' : 'text-[#1D2D44]/30'}`}>Dates set once your spot is reserved</div>
        )}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-sm font-bold ${featured ? 'text-white' : 'text-[#1D2D44]'}`}>
          ${price.toLocaleString()}<span className={`font-normal text-xs ml-1 ${featured ? 'text-white/40' : 'text-[#1D2D44]/40'}`}>/person</span>
        </span>
        {href ? (
          <Link
            href={href}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] text-xs font-semibold hover:shadow-md transition-all"
          >
            View trip
          </Link>
        ) : (
          <a
            href="https://wa.me/15125648522"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-[#B08D55]/30 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/5 transition-colors"
          >
            I'm interested
          </a>
        )}
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
          src="/images/bangkok-skyline.jpg"
          alt="Bangkok skyline"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient  ·  dark at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <a
          href="https://www.instagram.com/micahphotography1"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-10 text-white/40 hover:text-white/70 transition-colors text-xs tracking-wide"
        >
          Aerial footage: @micahphotography1
        </a>

        {/* Content */}
        <div className="relative z-10 w-full pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B08D55] text-white text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              START HERE · BANGKOK WEEKEND
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white mb-3 leading-tight">
              Bangkok Weekend
            </h1>

            <p className="text-xl sm:text-2xl text-white/75 mb-1">3 Nights / 4 Days</p>
            <p className="text-base text-white/50 mb-8">
              Our 5-Star Bangkok Riverside Hotel
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                3 Nights · 4 Days
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                Bangkok · 5-Star Riverside Hotel
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Users className="h-4 w-4 text-[#B08D55]" />
                2 Sessions with BK
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
                <Clock className="h-4 w-4 text-[#B08D55]" />
                Boat Cruise + Street Food
              </div>
            </div>

            {/* Price + CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="text-white">
                <span className="text-4xl font-bold">$1,488</span>
                <span className="text-white/60 text-lg ml-1">/person</span>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/trips/bangkok-weekend"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
                >
                  View Bangkok Weekend
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/trips/bangkok-hua-hin/july-16-2026"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/30 text-white font-bold text-sm backdrop-blur-sm hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  See July 16 departure
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
                src="/images/bk2.jpg"
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
                5.5 DUPR · APP/PPA circuit pro · Wins over Anna Bright, Parris Todd, and multiple Top 100 PPA pros. BK joins coached sessions throughout the July 16 departure: drills, strategy, and live match-play feedback.
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

      {/* ── Products ── */}
      <section className="py-14 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-1">
              Choose Your Experience
            </h2>
            <p className="text-[#1D2D44]/50 text-sm">
              Drop-in clinic to full immersion. Bangkok. Hua Hin. Your call.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className={`rounded-2xl border p-5 flex flex-col hover:shadow-md transition-all group ${
                  p.dark
                    ? 'bg-[#0F1A2A] border-[#B08D55]/40 hover:border-[#B08D55]/70'
                    : 'bg-white border-[#B08D55]/10 hover:border-[#B08D55]/30'
                }`}
              >
                {p.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B08D55] text-white text-xs font-bold mb-3 self-start">
                    {p.badge}
                  </span>
                )}
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${p.dark ? 'text-[#B08D55]' : 'text-[#B08D55]'}`}>
                  {p.duration}
                </p>
                <p className={`font-serif font-bold text-lg mb-2 ${p.dark ? 'text-white' : 'text-[#1D2D44]'}`}>
                  {p.label}
                </p>
                <p className={`text-sm leading-relaxed mb-4 flex-1 ${p.dark ? 'text-white/50' : 'text-[#1D2D44]/50'}`}>
                  {p.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`font-bold text-xl ${p.dark ? 'text-white' : 'text-[#1D2D44]'}`}>
                    {p.price}
                  </span>
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${p.dark ? 'text-[#B08D55]' : 'text-[#B08D55]'}`} />
                </div>
              </Link>
            ))}
          </div>

          {/* Value comparison */}
          <div className="mt-5 bg-[#1D2D44] rounded-xl px-5 py-4">
            <p className="text-white/60 text-sm text-center">
              Bangkok ($1,488) + Hua Hin ($2,488) booked separately = <span className="line-through text-white/30">$3,976</span>.{' '}
              <span className="text-white font-semibold">The full 9-day trip is <span className="text-[#B08D55] font-bold">$3,888</span> and includes more.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Upcoming Departures ── */}
      <section className="py-10 sm:py-14 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44] mb-0.5">
                Upcoming Departures
              </h2>
              <p className="text-[#1D2D44]/50 text-sm">Alternating routes every two weeks.</p>
            </div>
            <Link
              href="/trips/calendar"
              className="text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors hidden sm:flex items-center gap-1"
            >
              Full calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingDepartures.map((d) => (
              <UpcomingDepartureCard key={d.month} {...d} />
            ))}
          </div>
          <div className="mt-4 sm:hidden">
            <Link
              href="/trips/calendar"
              className="text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors flex items-center gap-1"
            >
              See full calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
