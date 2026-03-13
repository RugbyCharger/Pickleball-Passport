'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Palmtree, Sun, Calendar, MapPin, Clock, ArrowRight, ChevronDown, ChevronUp, Plane, Heart, Leaf } from 'lucide-react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';

/* ─────────────────────── CONFIG ─────────────────────── */

/* ─────────────────────── UPCOMING DATES ─────────────────────── */

interface UpcomingDate {
  dateRange: string;
  route: string;
  badge?: string;
}

const upcomingEssentialDates: UpcomingDate[] = [
  { dateRange: 'Jun 16–23, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Aug 14–21, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Sep 26–Oct 3, 2026', route: 'Bangkok + Hua Hin' },
];

const upcomingUltimateDates: UpcomingDate[] = [
  { dateRange: 'May 31–Jun 12, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Jun 27–Jul 9, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Jul 13–25, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Jul 29–Aug 10, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Aug 25–Sep 6, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Sep 10–22, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Oct 14–26, 2026', route: 'Bangkok + Hua Hin' },
  { dateRange: 'Nov 10–22, 2026', route: 'Bangkok + Chiang Mai', badge: 'Cool Season' },
  { dateRange: 'Dec 1–13, 2026', route: 'Bangkok + Phuket', badge: 'Dry Season' },
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
    description: 'Pick the route and duration that fits your schedule. Our year-round Bangkok + Hua Hin trip is the perfect starting point.',
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
    description: 'Head home with improved skills, new friendships, and the inside track on our seasonal routes. Come once. Come back for the rest.',
    icon: Heart,
    gradient: 'from-[#E07A5F] to-[#F09B8A]',
  },
];

/* ─────────────────────── HERO TRIP CARD (with toggle) ─────────────────────── */

function HeroTripCard({
  onReserve,
}: {
  onReserve: (tripName: string) => void;
}) {
  const [selectedDuration, setSelectedDuration] = useState<'ultimate' | 'essential'>('ultimate');

  const trips = {
    ultimate: {
      label: '15-Day Ultimate',
      duration: '15 Days / 14 Nights',
      dateRange: 'May 15 - May 29, 2026',
      price: '$5,497',
      split: '5 nights Peninsula BKK / 8 nights Dusit Thani HH / 1 night Peninsula BKK',
      detailHref: '/trips/bangkok-hua-hin-ultimate',
      tripName: 'Bangkok + Hua Hin Ultimate (May 15 - May 29)',
    },
    essential: {
      label: '9-Day Essential',
      duration: '9 Days / 8 Nights',
      dateRange: 'June 1 - June 9, 2026',
      price: '$3,488',
      split: '3 nights Peninsula BKK / 4 nights Dusit Thani HH / 1 night Peninsula BKK',
      detailHref: '/trips/bangkok-hua-hin-essential',
      tripName: 'Bangkok + Hua Hin Essential (June 1 - June 9)',
    },
  };

  const trip = trips[selectedDuration];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
      {/* Hero image */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"
          alt="Bangkok + Hua Hin"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 66vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Year-round badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <Sun className="w-3.5 h-3.5 text-[#B08D55]" />
            Year-Round
          </span>
        </div>

        {/* Destination overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white">Bangkok + Hua Hin</h3>
          <p className="text-white/70 text-sm mt-1">The Peninsula Bangkok &middot; Dusit Thani Hua Hin</p>
        </div>
      </div>

      {/* Duration toggle */}
      <div className="px-6 pt-5">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSelectedDuration('ultimate')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
              selectedDuration === 'ultimate'
                ? 'bg-white text-[#1D2D44] shadow-sm'
                : 'text-[#1D2D44]/50 hover:text-[#1D2D44]/70'
            }`}
          >
            15-Day Ultimate
          </button>
          <button
            type="button"
            onClick={() => setSelectedDuration('essential')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
              selectedDuration === 'essential'
                ? 'bg-white text-[#1D2D44] shadow-sm'
                : 'text-[#1D2D44]/50 hover:text-[#1D2D44]/70'
            }`}
          >
            9-Day Essential
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 pt-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#1D2D44]">{trip.duration}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#B08D55]">{trip.dateRange}</span>
        </div>
        <p className="text-xs text-[#1D2D44]/50 mb-3">{trip.split}</p>
        <div className="text-2xl font-bold text-[#1D2D44] mb-5">
          From {trip.price}<span className="text-base font-normal text-[#1D2D44]/60">/person</span>
        </div>

        <div className="flex gap-3">
          <Link
            href={trip.detailHref}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
          >
            View Trip Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => onReserve(trip.tripName)}
            className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-[#1D2D44] text-[#1D2D44] font-bold text-sm hover:bg-[#1D2D44] hover:text-white transition-all"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── SEASONAL ROUTE CARD ─────────────────────── */

function SeasonalRouteCard({
  title,
  season,
  seasonIcon: SeasonIcon,
  hotel,
  imageUrl,
  detailHref,
  onReserve,
}: {
  title: string;
  season: string;
  seasonIcon: React.ComponentType<{ className?: string }>;
  hotel: string;
  imageUrl: string;
  detailHref: string;
  onReserve: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
      {/* Hero image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <SeasonIcon className="w-3.5 h-3.5 text-[#B08D55]" />
            {season}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            Waitlist
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">{title}</h3>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#1D2D44]">15 Days / 14 Nights</span>
        </div>
        <p className="text-xs text-[#1D2D44]/50 mb-2">{hotel}</p>
        <div className="text-lg font-semibold text-[#1D2D44]/60 mb-5">
          Pricing Coming Soon
        </div>

        <div className="mt-auto flex gap-3">
          <Link
            href={detailHref}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onReserve}
            className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-[#1D2D44] text-[#1D2D44] font-bold text-sm hover:bg-[#1D2D44] hover:text-white transition-all"
          >
            Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── UPCOMING DATES SECTION ─────────────────────── */

function UpcomingDatesSection({
  onReserve,
}: {
  onReserve: (tripName: string) => void;
}) {
  const [essentialExpanded, setEssentialExpanded] = useState(false);
  const [ultimateExpanded, setUltimateExpanded] = useState(false);

  return (
    <section className="py-12 sm:py-20 bg-white border-t border-[#B08D55]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-3">
            Upcoming Dates
          </h2>
          <p className="text-[#1D2D44]/60 text-base max-w-2xl mx-auto">
            Bangkok + Hua Hin runs year-round. Seasonal routes to Chiang Mai and Phuket
            open when conditions are ideal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Essential dates */}
          <div className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-6">
            <h3 className="font-serif text-lg font-bold text-[#1D2D44] mb-1">9-Day Essential</h3>
            <p className="text-xs text-[#1D2D44]/50 mb-4">Bangkok + Hua Hin</p>
            <button
              type="button"
              onClick={() => setEssentialExpanded(!essentialExpanded)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white text-sm font-semibold text-[#1D2D44] hover:bg-slate-50 transition-colors"
            >
              <span>View Available Dates ({upcomingEssentialDates.length})</span>
              {essentialExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {essentialExpanded && (
              <div className="mt-2 space-y-2">
                {upcomingEssentialDates.map((date) => (
                  <div key={date.dateRange} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-100">
                    <div>
                      <div className="text-sm font-medium text-[#1D2D44]">{date.dateRange}</div>
                      <div className="text-xs text-gray-500">{date.route}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onReserve(`Essential 9-Day (${date.dateRange})`)}
                      className="ml-3 px-3 py-1.5 rounded-lg bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/20 transition-colors flex-shrink-0"
                    >
                      Reserve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ultimate dates */}
          <div className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-6">
            <h3 className="font-serif text-lg font-bold text-[#1D2D44] mb-1">15-Day Ultimate</h3>
            <p className="text-xs text-[#1D2D44]/50 mb-4">Bangkok + Hua Hin / Seasonal Routes</p>
            <button
              type="button"
              onClick={() => setUltimateExpanded(!ultimateExpanded)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white text-sm font-semibold text-[#1D2D44] hover:bg-slate-50 transition-colors"
            >
              <span>View Available Dates ({upcomingUltimateDates.length})</span>
              {ultimateExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {ultimateExpanded && (
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {upcomingUltimateDates.map((date) => (
                  <div key={date.dateRange} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1D2D44] flex items-center gap-2">
                        {date.dateRange}
                        {date.badge && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-[#B08D55]/20 text-[#B08D55] text-xs font-semibold">
                            {date.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{date.route}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onReserve(`Ultimate 15-Day (${date.dateRange}) - ${date.route}`)}
                      className="ml-3 px-3 py-1.5 rounded-lg bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/20 transition-colors flex-shrink-0"
                    >
                      Reserve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export function TripsListingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyDestination, setNotifyDestination] = useState('');

  const openWaitlist = (tripName: string) => {
    setSelectedTrip(tripName);
    setWaitlistOpen(true);
  };

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
              Our Thailand Routes
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Three routes across Thailand, each built around five-star accommodations, daily pickleball,
              and cultural immersion. Start with our year-round Bangkok + Hua Hin route.
              Come back for the seasonal experiences in Chiang Mai and Phuket.
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

      {/* Trip Cards */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured: Bangkok + Hua Hin */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
              Year-Round: Bangkok + Hua Hin
            </h2>
            <p className="text-[#1D2D44]/60 text-sm">
              Our bread-and-butter route. The Peninsula Bangkok and Dusit Thani Hua Hin, available all year.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-16">
            <HeroTripCard onReserve={openWaitlist} />
          </div>

          {/* Seasonal Routes */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
              Seasonal Routes
            </h2>
            <p className="text-[#1D2D44]/60 text-sm">
              Exclusive routes that run only when conditions are perfect. Same bookend structure, different destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <SeasonalRouteCard
              title="Bangkok + Chiang Mai"
              season="Nov - Jan"
              seasonIcon={Leaf}
              hotel="The Peninsula Bangkok / Anantara Chiang Mai Resort"
              imageUrl="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80"
              detailHref="/trips/bangkok-chiang-mai"
              onReserve={() => openWaitlist('Bangkok + Chiang Mai - 15 Days (Nov-Jan)')}
            />
            <SeasonalRouteCard
              title="Bangkok + Phuket"
              season="Dec - Apr"
              seasonIcon={Sun}
              hotel="The Peninsula Bangkok / Sole Mio Boutique Hotel & Wellness"
              imageUrl="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80"
              detailHref="/trips/bangkok-phuket"
              onReserve={() => openWaitlist('Bangkok + Phuket - 15 Days (Dec-Apr)')}
            />
          </div>
        </div>
      </section>

      {/* Upcoming Dates */}
      <UpcomingDatesSection onReserve={openWaitlist} />

      {/* Your Journey in 4 Simple Steps */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3] border-t border-[#B08D55]/10">
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
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#1D2D44] via-[#B08D55] to-[#2D5A3D] -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {journeySteps.map((step) => (
                <div key={step.number} className="relative z-10 group">
                  <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#B08D55]/10 h-full">
                    {/* Step number badge */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#F5E6D3] flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-[#1D2D44]" />
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#1D2D44]/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Destinations */}
      <section className="py-12 sm:py-20 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-3">
              Coming Soon
            </h2>
            <p className="text-[#1D2D44]/60 text-base max-w-2xl mx-auto">
              New destinations launching based on demand. Sign up to be notified
              when booking opens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comingSoonDestinations.map((dest) => (
              <ComingSoonCard
                key={dest.destination}
                destination={dest.destination}
                imageUrl={dest.imageUrl}
                onNotifyClick={() => {
                  setNotifyDestination(dest.destination);
                  setNotifyOpen(true);
                }}
              />
            ))}
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

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        tripName={selectedTrip}
      />

      <WaitlistModal
        open={notifyOpen}
        onOpenChange={setNotifyOpen}
        tripName={notifyDestination}
        isNotifyMe
      />
    </main>
  );
}
