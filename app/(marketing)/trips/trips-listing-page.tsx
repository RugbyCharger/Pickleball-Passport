'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Palmtree, Sun, Calendar, MapPin, Clock, ArrowRight, ChevronDown, ChevronUp, Plane, Heart } from 'lucide-react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';
import { ComingSoonCard } from '@/components/trips/coming-soon-card';

/* ─────────────────────── TRIP SCHEDULE ─────────────────────── */

interface ScheduledTrip {
  route: string;
  startDate: string;
  endDate: string;
  status: 'live' | 'coming_soon';
  crmTag: string;
}

const tripSchedule: ScheduledTrip[] = [
  { route: 'Bangkok + Hua Hin', startDate: 'Jun 17', endDate: 'Jun 25', status: 'live', crmTag: 'reserve_bkk_huahin_jun17' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Jul 1', endDate: 'Jul 9', status: 'live', crmTag: 'reserve_bkk_chiangmai_jul1' },
  { route: 'Bangkok + Hua Hin', startDate: 'Jul 15', endDate: 'Jul 23', status: 'live', crmTag: 'reserve_bkk_huahin_jul15' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Jul 29', endDate: 'Aug 6', status: 'live', crmTag: 'reserve_bkk_chiangmai_jul29' },
  { route: 'Bangkok + Hua Hin', startDate: 'Aug 12', endDate: 'Aug 20', status: 'coming_soon', crmTag: 'reserve_bkk_huahin_aug12' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Aug 26', endDate: 'Sep 3', status: 'coming_soon', crmTag: 'reserve_bkk_chiangmai_aug26' },
  { route: 'Bangkok + Hua Hin', startDate: 'Sep 9', endDate: 'Sep 17', status: 'coming_soon', crmTag: 'reserve_bkk_huahin_sep9' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Sep 23', endDate: 'Oct 1', status: 'coming_soon', crmTag: 'reserve_bkk_chiangmai_sep23' },
  { route: 'Bangkok + Hua Hin', startDate: 'Oct 7', endDate: 'Oct 15', status: 'coming_soon', crmTag: 'reserve_bkk_huahin_oct7' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Oct 21', endDate: 'Oct 29', status: 'coming_soon', crmTag: 'reserve_bkk_chiangmai_oct21' },
  { route: 'Bangkok + Hua Hin', startDate: 'Nov 4', endDate: 'Nov 12', status: 'coming_soon', crmTag: 'reserve_bkk_huahin_nov4' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Nov 18', endDate: 'Nov 26', status: 'coming_soon', crmTag: 'reserve_bkk_chiangmai_nov18' },
  { route: 'Bangkok + Hua Hin', startDate: 'Dec 2', endDate: 'Dec 10', status: 'coming_soon', crmTag: 'reserve_bkk_huahin_dec2' },
  { route: 'Bangkok + Chiang Mai', startDate: 'Dec 16', endDate: 'Dec 24', status: 'coming_soon', crmTag: 'reserve_bkk_chiangmai_dec16' },
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

/* ─────────────────────── ROUTE CARD ─────────────────────── */

function RouteCard({
  title,
  badge,
  badgeIcon: BadgeIcon,
  imageUrl,
  nextDate,
  detailHref,
  onReserve,
}: {
  title: string;
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  imageUrl: string;
  nextDate: string;
  detailHref: string;
  onReserve: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
      {/* Hero image */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <BadgeIcon className="w-3.5 h-3.5 text-[#B08D55]" />
            {badge}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white">{title}</h3>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#1D2D44]">9 Days / 8 Nights</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-[#B08D55]" />
          <span className="text-sm font-medium text-[#B08D55]">{nextDate}</span>
        </div>
        <div className="text-2xl font-bold text-[#1D2D44] mb-5">
          From $3,488<span className="text-base font-normal text-[#1D2D44]/60">/person</span>
        </div>

        <div className="mt-auto flex gap-3">
          <Link
            href={detailHref}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
          >
            View Trip Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onReserve}
            className="flex items-center justify-center px-4 py-3 rounded-xl border-2 border-[#1D2D44] text-[#1D2D44] font-bold text-sm hover:bg-[#1D2D44] hover:text-white transition-all"
          >
            Reserve
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
  const [expanded, setExpanded] = useState(false);

  const huaHinDates = tripSchedule.filter(t => t.route === 'Bangkok + Hua Hin');
  const chiangMaiDates = tripSchedule.filter(t => t.route === 'Bangkok + Chiang Mai');

  return (
    <section className="py-12 sm:py-20 bg-white border-t border-[#B08D55]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-3">
            2026 Trip Schedule
          </h2>
          <p className="text-[#1D2D44]/60 text-base max-w-2xl mx-auto">
            New departures every two weeks, alternating between routes.
            All trips depart on Wednesdays for budget-friendly international travel.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full px-6 py-4 rounded-xl bg-[#FDF8F3] border border-[#B08D55]/10 text-sm font-semibold text-[#1D2D44] hover:bg-[#F5E6D3]/50 transition-colors mb-4"
          >
            <span>View All Departure Dates ({tripSchedule.length} trips)</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hua Hin dates */}
              <div className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-6">
                <h3 className="font-serif text-lg font-bold text-[#1D2D44] mb-1">Bangkok + Hua Hin</h3>
                <p className="text-xs text-[#1D2D44]/50 mb-4">Available Year-Round</p>
                <div className="space-y-2">
                  {huaHinDates.map((trip) => (
                    <div key={trip.crmTag} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-[#1D2D44]">
                          {trip.startDate} – {trip.endDate}, 2026
                        </div>
                        {trip.status === 'live' ? (
                          <div className="text-xs text-emerald-600 font-medium">$3,488/person</div>
                        ) : (
                          <div className="text-xs text-[#1D2D44]/40">Pricing Coming Soon</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onReserve(`${trip.route} (${trip.startDate} - ${trip.endDate})`)}
                        className="ml-3 px-3 py-1.5 rounded-lg bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/20 transition-colors flex-shrink-0"
                      >
                        Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chiang Mai dates */}
              <div className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-6">
                <h3 className="font-serif text-lg font-bold text-[#1D2D44] mb-1">Bangkok + Chiang Mai</h3>
                <p className="text-xs text-[#1D2D44]/50 mb-4">May through January</p>
                <div className="space-y-2">
                  {chiangMaiDates.map((trip) => (
                    <div key={trip.crmTag} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-100">
                      <div>
                        <div className="text-sm font-medium text-[#1D2D44]">
                          {trip.startDate} – {trip.endDate}, 2026
                        </div>
                        {trip.status === 'live' ? (
                          <div className="text-xs text-emerald-600 font-medium">$3,488/person</div>
                        ) : (
                          <div className="text-xs text-[#1D2D44]/40">Pricing Coming Soon</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onReserve(`${trip.route} (${trip.startDate} - ${trip.endDate})`)}
                        className="ml-3 px-3 py-1.5 rounded-lg bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold hover:bg-[#B08D55]/20 transition-colors flex-shrink-0"
                      >
                        Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
              Two routes across Thailand, each 9 days / 8 nights, built around five-star
              accommodations, daily pickleball, and cultural immersion. Choose Bangkok + Hua Hin
              (year-round) or Bangkok + Chiang Mai (May through January).
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

      {/* Route Cards */}
      <section className="py-12 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
              Choose Your Route
            </h2>
            <p className="text-[#1D2D44]/60 text-sm">
              Same format. Same price. Different destinations. $3,488/person for 9 days / 8 nights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <RouteCard
              title="Bangkok + Hua Hin"
              badge="Available Year-Round"
              badgeIcon={Sun}
              imageUrl="https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"
              nextDate="Jun 17 – Jun 25, 2026"
              detailHref="/trips/bangkok-hua-hin"
              onReserve={() => openWaitlist('Bangkok + Hua Hin (Jun 17 - Jun 25)')}
            />
            <RouteCard
              title="Bangkok + Chiang Mai"
              badge="May through January"
              badgeIcon={Calendar}
              imageUrl="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80"
              nextDate="Jul 1 – Jul 9, 2026"
              detailHref="/trips/bangkok-chiang-mai"
              onReserve={() => openWaitlist('Bangkok + Chiang Mai (Jul 1 - Jul 9)')}
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
