'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Palmtree, Sun, Calendar, MapPin, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';

/* ─────────────────────── CONFIG ─────────────────────── */

/** Toggle early-bird promo banner on live cards */
const SHOW_EARLY_BIRD_PROMO = true;

/* ─────────────────────── STRIPE PAYMENT LINKS ─────────────────────── */

const STRIPE_LINKS = {
  '8day': {
    deposit: 'https://buy.stripe.com/8x29ATagz5cb4e19sp2cg03',
    full: 'https://buy.stripe.com/7sYaEXcoHgUTh0N7kh2cg02',
    depositAmount: 722,
    fullAmount: 2888,
  },
  '13day': {
    deposit: 'https://buy.stripe.com/eVq5kDfATgUT8uh3412cg00',
    full: 'https://buy.stripe.com/14AeVdgEX1ZZ7qdeMJ2cg01',
    depositAmount: 1065,
    fullAmount: 4250,
  },
} as const;

/* ─────────────────────── UPCOMING DATES ─────────────────────── */

interface UpcomingDate {
  dateRange: string;
  cities: string;
  badge?: string;
}

const upcoming8DayDates: UpcomingDate[] = [
  { dateRange: 'Jun 16–23, 2026', cities: 'Bangkok + Chiang Mai' },
  { dateRange: 'Aug 14–21, 2026', cities: 'Bangkok + Chiang Mai' },
  { dateRange: 'Sep 26–Oct 3, 2026', cities: 'Bangkok + Chiang Mai' },
  { dateRange: 'Nov 2–9, 2026', cities: 'Bangkok + Chiang Mai' },
];

const upcoming13DayDates: UpcomingDate[] = [
  { dateRange: 'May 31–Jun 12, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Jun 27–Jul 9, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Jul 13–25, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Jul 29–Aug 10, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Aug 25–Sep 6, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Sep 10–22, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Oct 14–26, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Nov 10–22, 2026', cities: 'BKK + CNX + HKT' },
  { dateRange: 'Dec 1–13, 2026', cities: 'BKK + CNX + HKT', badge: 'Cool Season' },
];

/* ─────────────────────── COMING SOON ─────────────────────── */

const comingSoonDestinations = [
  {
    destination: 'BALI',
    subtitle: 'Ubud • Seminyak • Uluwatu',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  },
  {
    destination: 'VIETNAM',
    subtitle: 'Ho Chi Minh City • Hoi An • Da Nang',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
  },
  {
    destination: 'JAPAN',
    subtitle: 'Tokyo • Kyoto • Osaka',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    destination: 'MALAYSIA',
    subtitle: 'Kuala Lumpur • Langkawi • Penang',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  },
];

/* ─────────────────────── LIVE BOOKING CARD ─────────────────────── */

function LiveTripCard({
  duration,
  dateRange,
  cities,
  price,
  imageUrl,
  stripeKey,
}: {
  duration: '8day' | '13day';
  dateRange: string;
  cities: string;
  price: string;
  imageUrl: string;
  stripeKey: '8day' | '13day';
}) {
  const [occupancy, setOccupancy] = useState('');
  const [pickleball, setPickleball] = useState('');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');

  const links = STRIPE_LINKS[stripeKey];
  const allSelected = occupancy !== '' && pickleball !== '';

  const durationLabel = duration === '13day' ? '13 Days / 12 Nights' : '8 Days / 7 Nights';

  const handleBookNow = () => {
    if (!allSelected) return;
    const url = paymentType === 'deposit' ? links.deposit : links.full;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
      {/* Hero image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Thailand ${durationLabel}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#B08D55]" />
            {durationLabel}
          </span>
        </div>

        {SHOW_EARLY_BIRD_PROMO && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B08D55] text-white text-xs font-semibold">
              Early Bird Pricing
            </span>
          </div>
        )}

        {/* Destination overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-3xl font-serif font-bold text-white">THAILAND</h3>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-[#1D2D44]/70 text-sm mb-1 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#B08D55]" />
          {cities}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#B08D55]">{dateRange}</span>
        </div>
        <div className="text-xl font-bold text-[#1D2D44] mb-5">
          {price}
        </div>

        {/* Booking Dropdowns */}
        <div className="space-y-3 mb-5">
          {/* 1. Tour Dates */}
          <div>
            <label className="block text-xs font-bold text-[#1D2D44]/60 uppercase tracking-wider mb-1">
              1. Tour Dates
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
              {dateRange}
            </div>
          </div>

          {/* 2. Hotel Room Occupancy */}
          <div>
            <label className="block text-xs font-bold text-[#1D2D44]/60 uppercase tracking-wider mb-1">
              2. Hotel Room Occupancy
            </label>
            <select
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none"
            >
              <option value="">Select occupancy...</option>
              <option value="double">Double Occupancy</option>
              <option value="twin">Twin Occupancy</option>
              <option value="single">Single Occupancy</option>
            </select>
          </div>

          {/* 3. Pickleball */}
          <div>
            <label className="block text-xs font-bold text-[#1D2D44]/60 uppercase tracking-wider mb-1">
              3. Will You Be Playing Pickleball?
            </label>
            <select
              value={pickleball}
              onChange={(e) => setPickleball(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none"
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Payment Toggle */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-[#1D2D44]/60 uppercase tracking-wider mb-2">
            Payment Option
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType('deposit')}
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                paymentType === 'deposit'
                  ? 'border-[#B08D55] bg-[#B08D55]/10 text-[#1D2D44]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase">Pay Deposit</div>
              <div className="text-lg font-bold mt-1">${links.depositAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">25% of total</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('full')}
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                paymentType === 'full'
                  ? 'border-[#B08D55] bg-[#B08D55]/10 text-[#1D2D44]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-semibold uppercase">Pay in Full</div>
              <div className="text-lg font-bold mt-1">${links.fullAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Full amount</div>
            </button>
          </div>
        </div>

        {/* Book Now Button */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={handleBookNow}
            disabled={!allSelected}
            className={`flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              allSelected
                ? 'bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] shadow-lg shadow-[#B08D55]/30 hover:shadow-xl cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </button>
          {!allSelected && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Select all options above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── UPCOMING TRIP CARD ─────────────────────── */

function UpcomingTripCard({
  durationLabel,
  cities,
  imageUrl,
  dates,
  onReserve,
}: {
  durationLabel: string;
  cities: string;
  imageUrl: string;
  dates: UpcomingDate[];
  onReserve: (tripName: string) => void;
}) {
  const [datesExpanded, setDatesExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
      {/* Hero image */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Thailand ${durationLabel}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#B08D55]" />
            {durationLabel}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            Upcoming
          </span>
        </div>

        {/* Destination overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-3xl font-serif font-bold text-white">THAILAND</h3>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-[#1D2D44]/70 text-sm mb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#B08D55]" />
          {cities}
        </p>
        <div className="text-lg font-semibold text-[#1D2D44]/60 mb-4">
          Pricing Coming Soon
        </div>

        {/* Expandable dates */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setDatesExpanded(!datesExpanded)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-slate-50 text-sm font-semibold text-[#1D2D44] hover:bg-slate-100 transition-colors"
          >
            <span>View Available Dates ({dates.length})</span>
            {datesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {datesExpanded && (
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {dates.map((date) => (
                <div
                  key={date.dateRange}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#1D2D44] flex items-center gap-2">
                      {date.dateRange}
                      {date.badge && (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-[#B08D55]/20 text-[#B08D55] text-xs font-semibold">
                          {date.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{date.cities}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onReserve(`Thailand – ${durationLabel} (${date.dateRange})`)
                    }
                    className="ml-3 px-3 py-1.5 rounded-lg bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/20 transition-colors flex-shrink-0"
                  >
                    Reserve Your Spot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Reserve Button */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onReserve(`Thailand – ${durationLabel}`)}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
          >
            Reserve Your Spot
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
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
              Upcoming Trips
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Explore our curated lineup of international pickleball travel experiences.
              Each trip blends competitive play, cultural immersion, and wellness.
              Designed for players who want more than just a vacation.
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

      {/* Trip Cards — 2x2 Grid */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 — LIVE 8-Day */}
            <LiveTripCard
              duration="8day"
              dateRange="May 6–13, 2026"
              cities="Bangkok • Chiang Mai"
              price="From $2,888/person"
              imageUrl="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"
              stripeKey="8day"
            />

            {/* Card 2 — LIVE 13-Day */}
            <LiveTripCard
              duration="13day"
              dateRange="May 15–27, 2026"
              cities="Bangkok • Chiang Mai • Phuket"
              price="From $4,250/person"
              imageUrl="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80"
              stripeKey="13day"
            />

            {/* Card 3 — UPCOMING 8-Day */}
            <UpcomingTripCard
              durationLabel="8 Days / 7 Nights"
              cities="Bangkok • Chiang Mai"
              imageUrl="https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80"
              dates={upcoming8DayDates}
              onReserve={openWaitlist}
            />

            {/* Card 4 — UPCOMING 13-Day */}
            <UpcomingTripCard
              durationLabel="13 Days / 12 Nights"
              cities="Bangkok • Chiang Mai • Phuket"
              imageUrl="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80"
              dates={upcoming13DayDates}
              onReserve={openWaitlist}
            />
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
