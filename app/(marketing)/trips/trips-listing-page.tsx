'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Palmtree, Sun, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';

/* ─────────────────────── DEPARTURE DATA ─────────────────────── */

interface Departure {
  id: string;
  title: string;
  duration: number;
  cities: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  detailPath: string;
  badge?: string;
}

const departures: Departure[] = [
  {
    id: '8d-may-2026',
    title: '8-Day Thailand Experience',
    duration: 8,
    cities: 'Bangkok \u2022 Chiang Mai',
    startDate: 'May 6, 2026',
    endDate: 'May 13, 2026',
    dateRange: 'May 6 \u2013 May 13, 2026',
    detailPath: '/trips/thailand-8-day',
  },
  {
    id: '13d-may-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'May 15, 2026',
    endDate: 'May 27, 2026',
    dateRange: 'May 15 \u2013 May 27, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '13d-jun-a-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'May 31, 2026',
    endDate: 'Jun 12, 2026',
    dateRange: 'May 31 \u2013 Jun 12, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '8d-jun-2026',
    title: '8-Day Thailand Experience',
    duration: 8,
    cities: 'Bangkok \u2022 Chiang Mai',
    startDate: 'Jun 16, 2026',
    endDate: 'Jun 23, 2026',
    dateRange: 'Jun 16 \u2013 Jun 23, 2026',
    detailPath: '/trips/thailand-8-day',
  },
  {
    id: '13d-jun-b-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Jun 27, 2026',
    endDate: 'Jul 9, 2026',
    dateRange: 'Jun 27 \u2013 Jul 9, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '13d-jul-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Jul 13, 2026',
    endDate: 'Jul 25, 2026',
    dateRange: 'Jul 13 \u2013 Jul 25, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '13d-jul-b-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Jul 29, 2026',
    endDate: 'Aug 10, 2026',
    dateRange: 'Jul 29 \u2013 Aug 10, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '8d-aug-2026',
    title: '8-Day Thailand Experience',
    duration: 8,
    cities: 'Bangkok \u2022 Chiang Mai',
    startDate: 'Aug 14, 2026',
    endDate: 'Aug 21, 2026',
    dateRange: 'Aug 14 \u2013 Aug 21, 2026',
    detailPath: '/trips/thailand-8-day',
  },
  {
    id: '13d-aug-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Aug 25, 2026',
    endDate: 'Sep 6, 2026',
    dateRange: 'Aug 25 \u2013 Sep 6, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '13d-sep-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Sep 10, 2026',
    endDate: 'Sep 22, 2026',
    dateRange: 'Sep 10 \u2013 Sep 22, 2026',
    detailPath: '/trips/thailand',
  },
  {
    id: '8d-sep-2026',
    title: '8-Day Thailand Experience',
    duration: 8,
    cities: 'Bangkok \u2022 Chiang Mai',
    startDate: 'Sep 26, 2026',
    endDate: 'Oct 3, 2026',
    dateRange: 'Sep 26 \u2013 Oct 3, 2026',
    detailPath: '/trips/thailand-8-day',
  },
  {
    id: '13d-dec-2026',
    title: '13-Day Thailand Experience',
    duration: 13,
    cities: 'Bangkok \u2022 Chiang Mai \u2022 Phuket',
    startDate: 'Dec 1, 2026',
    endDate: 'Dec 13, 2026',
    dateRange: 'Dec 1 \u2013 Dec 13, 2026',
    detailPath: '/trips/thailand',
    badge: 'Cool Season',
  },
];

/* ─────────────────────── COMING SOON ─────────────────────── */

const comingSoonDestinations = [
  {
    destination: 'BALI',
    subtitle: 'Ubud \u2022 Seminyak \u2022 Uluwatu',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  },
  {
    destination: 'VIETNAM',
    subtitle: 'Ho Chi Minh City \u2022 Hoi An \u2022 Da Nang',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  },
  {
    destination: 'JAPAN',
    subtitle: 'Tokyo \u2022 Kyoto \u2022 Osaka',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    destination: 'MALAYSIA',
    subtitle: 'Kuala Lumpur \u2022 Langkawi \u2022 Penang',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  },
];

/* ─────────────────────── PAGE ─────────────────────── */

export function TripsListingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyDestination, setNotifyDestination] = useState('');

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
              Each trip blends competitive play, cultural immersion, and wellness,
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

      {/* Departure Cards Grid */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departures.map((departure) => (
              <Link
                key={departure.id}
                href={departure.detailPath}
                className="block group"
              >
                <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#B08D55]/10 h-full flex flex-col">
                  {/* Hero gradient area */}
                  <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#B08D55]/20 rounded-full blur-2xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                    {/* Duration badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#B08D55]" />
                        {departure.duration === 13
                          ? '13 Days / 12 Nights'
                          : '8 Days / 7 Nights'}
                      </span>
                      {departure.badge && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B08D55]/80 backdrop-blur-sm text-white text-xs font-semibold">
                          {departure.badge}
                        </span>
                      )}
                    </div>

                    {/* Destination overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                      <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                        THAILAND
                      </h3>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[#1D2D44]/70 text-sm mb-3 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#B08D55]" />
                      {departure.cities}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-[#B08D55]" />
                      <span className="text-sm font-medium text-[#B08D55]">
                        {departure.dateRange}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#1D2D44]/70 mb-5">
                      Early Bird Pricing Coming Soon
                    </div>

                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTrip(
                            `Thailand - ${departure.duration === 13 ? '13 Days / 12 Nights' : '8 Days / 7 Nights'} (${departure.dateRange})`
                          );
                          setWaitlistOpen(true);
                        }}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/30 group-hover:shadow-xl transition-all"
                      >
                        Reserve Your Spot
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Destinations */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3] border-t border-[#B08D55]/10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {comingSoonDestinations.map((dest) => (
              <ComingSoonCard
                key={dest.destination}
                destination={dest.destination}
                subtitle={dest.subtitle}
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
