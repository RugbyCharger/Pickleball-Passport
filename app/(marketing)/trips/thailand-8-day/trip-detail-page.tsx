'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Trophy,
  CheckCircle,
  Plus,
  ChevronDown,
  Landmark,
  Ship,
  Plane,
  Info,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────── DATA ─────────────────────── */

const statItems = [
  { value: '16', label: 'Max Group Size' },
  {
    value: '5/10',
    label: 'Activity Level',
    tooltip:
      '5/10 — Moderate. Pickleball sessions are the most physically active part. Cultural activities, boat tours, and wellness days keep the overall pace accessible to all fitness levels.',
  },
  { value: '5–7', label: 'Hrs. Instruction' },
  { value: '5–8', label: 'Hrs. Social Play' },
];

const includedItems = [
  '7 nights at handpicked boutique hotels (2 unique properties, 2 cities)',
  'Daily breakfast at all hotels (7 breakfasts)',
  '3 group dinners: welcome dinner in each city + Bangkok farewell dinner',
  '1 domestic flight (Bangkok \u2192 Chiang Mai)',
  'All private ground transportation (air-con vans, airport transfers)',
  '4 pickleball sessions with court fees, equipment, and structured programming',
  'Thai cooking class (half day with market tour)',
  'Elephant Nature Park visit (ethical sanctuary \u2014 no riding, no chains)',
  'Private long-tail boat sunset cruise on the Chao Phraya River',
  'Wat Pho guided temple tour (Reclining Buddha)',
  'Guided Chinatown street food walk (all tastings included)',
  'Wiang Kum Kam archaeological site bicycle exploration',
  'Hotel wellness amenities: onsen, pools, saunas',
  'Dedicated trip host throughout',
];

const extrasItems = [
  'International airfare to/from Bangkok (BKK)',
  'Travel and medical insurance',
  'Michelin dining upgrades (optional group outings to starred restaurants)',
  'Optional spa treatments and massage beyond hotel amenities',
  'Optional activities: Muay Thai viewing, shopping excursions',
  'Alcoholic beverages beyond group dinner inclusions',
  'Meals on designated free nights',
  'Personal shopping and souvenirs',
  'Gratuities for guides, drivers, and hotel staff',
];

type DayIcon = 'trophy' | 'landmark' | 'ship' | 'sparkles' | 'plane';

interface TimeSlot {
  label: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  city: string;
  vibe: string;
  icon: DayIcon;
  slots: TimeSlot[];
}

const iconMap: Record<DayIcon, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  landmark: Landmark,
  ship: Ship,
  sparkles: Sparkles,
  plane: Plane,
};

const days: ItineraryDay[] = [
  {
    day: 1,
    title: 'Arrival Day',
    city: 'Bangkok',
    vibe: 'Land, breathe, bond',
    icon: 'sparkles',
    slots: [
      {
        label: 'Daytime',
        description:
          'Staggered airport arrivals throughout the day. Private van transfers from Suvarnabhumi (BKK) to Grande Centre Point Sukhumvit 55 (Thonglor). Check-in + room assignments.',
      },
      {
        label: 'Free Time',
        description:
          'Explore Thonglor \u2014 coffee at The Commons or Roast Coffee.',
      },
      {
        label: '4:00 PM',
        description: 'Group meet in hotel lobby, orientation.',
      },
      {
        label: '5:00 PM',
        description:
          'Onsen session (Let\u2019s Relax Spa & Onsen, 5th floor): mineral baths, steam, cold room.',
      },
      {
        label: '7:30 PM',
        description:
          'WELCOME DINNER: Supanniga Eating Room (Thonglor). No pickleball today \u2014 rest those legs.',
      },
    ],
  },
  {
    day: 2,
    title: 'First Paddles + River',
    city: 'Bangkok',
    vibe: 'Shake off the rust, then blow their minds',
    icon: 'trophy',
    slots: [
      {
        label: '7\u20139 AM',
        description: 'Breakfast at hotel.',
      },
      {
        label: '9:30 AM',
        description:
          'PICKLEBALL SESSION 1 at SukSpace: Warm-up drills, round-robin.',
      },
      {
        label: '12:30 PM',
        description: 'Lunch: local Thonglor spot.',
      },
      {
        label: '1:30 PM',
        description: 'Free time / recovery / onsen / pool.',
      },
      {
        label: '4:30 PM',
        description:
          'PRIVATE LONG-TAIL BOAT SUNSET CRUISE: canals \u2192 Wat Arun at dusk.',
      },
      {
        label: '7:00 PM',
        description: 'DINNER ON THE RIVER: Supanniga Eating Room (riverside).',
      },
    ],
  },
  {
    day: 3,
    title: 'Temple + Street Food',
    city: 'Bangkok',
    vibe: 'One temple done right, then eat everything',
    icon: 'landmark',
    slots: [
      {
        label: '7\u20138:30 AM',
        description: 'Breakfast at hotel.',
      },
      {
        label: '9:30 AM',
        description:
          'WAT PHO guided tour (Reclining Buddha, optional Thai massage).',
      },
      {
        label: '11:30 AM',
        description: 'GUIDED CHINATOWN STREET FOOD WALK.',
      },
      {
        label: '2\u20135 PM',
        description: 'Free time / recovery / explore Thonglor.',
      },
      {
        label: '5:30 PM',
        description:
          'PICKLEBALL SESSION 2 at SukSpace: Structured doubles, skill clinics.',
      },
      {
        label: '8:00 PM',
        description:
          'Free dinner night (rec: Canvas, 1 Michelin star, ~4,500 THB).',
      },
    ],
  },
  {
    day: 4,
    title: 'Pickleball + Farewell',
    city: 'Bangkok',
    vibe: 'Competition day, then celebrate',
    icon: 'trophy',
    slots: [
      {
        label: '7\u20138:30 AM',
        description: 'Breakfast at hotel.',
      },
      {
        label: '9:00 AM',
        description:
          'PICKLEBALL SESSION 3 at SukSpace: Tournament day, king of the court.',
      },
      {
        label: '12:30 PM',
        description: 'Lunch near courts.',
      },
      {
        label: '1:30 PM',
        description:
          'FREE AFTERNOON: Onsen, ICONSIAM, Muay Thai, or pool day.',
      },
      {
        label: '7:30 PM',
        description: 'BANGKOK FAREWELL DINNER: Curated Michelin experience.',
      },
    ],
  },
  {
    day: 5,
    title: 'Fly to Chiang Mai',
    city: 'Chiang Mai',
    vibe: 'Travel, settle, breathe',
    icon: 'plane',
    slots: [
      {
        label: '7\u20138:30 AM',
        description: 'Breakfast, check out.',
      },
      {
        label: '~11 AM',
        description: 'Flight to Chiang Mai (~1 hr 15 min).',
      },
      {
        label: '12:30 PM',
        description:
          'Private van to Maraya Hotel & Resort (Ping River).',
      },
      {
        label: '2:00 PM',
        description:
          'WIANG KUM KAM BICYCLE EXPLORATION: 700-year-old Lanna ruins.',
      },
      {
        label: '6:30 PM',
        description:
          'WELCOME DINNER: Huen Muan Jai (Michelin Bib Gourmand).',
      },
    ],
  },
  {
    day: 6,
    title: 'Cooking Class + Pickleball',
    city: 'Chiang Mai',
    vibe: 'Make it, then burn it off',
    icon: 'landmark',
    slots: [
      {
        label: '7\u20138:30 AM',
        description: 'Breakfast at Maraya.',
      },
      {
        label: '9:00 AM',
        description:
          'THAI COOKING CLASS: Market tour + cook 5\u20136 dishes at organic farm.',
      },
      {
        label: '3:00 PM',
        description:
          'PICKLEBALL SESSION 4 at BokBok: Skill clinics, dinking, stacking, open play.',
      },
      {
        label: '7:00 PM',
        description:
          'DINNER: Kiti Panit (Michelin-recommended, 130-year-old teak mansion).',
      },
    ],
  },
  {
    day: 7,
    title: 'Elephant Nature Park',
    city: 'Chiang Mai',
    vibe: 'The day they\u2019ll never forget',
    icon: 'sparkles',
    slots: [
      {
        label: '7\u20137:30 AM',
        description: 'Early breakfast.',
      },
      {
        label: '9:30 AM',
        description:
          'ELEPHANT NATURE PARK: Feed elephants, river bathing, guided walk, lunch included.',
      },
      {
        label: '4:30 PM',
        description: 'Pool / spa / decompress.',
      },
      {
        label: '7:00 PM',
        description:
          'DINNER: Huan Soontaree (riverside, live folk music).',
      },
    ],
  },
  {
    day: 8,
    title: 'Departure Day',
    city: 'Chiang Mai',
    vibe: 'Hugs, promises to come back, airport',
    icon: 'plane',
    slots: [
      {
        label: '7\u20139 AM',
        description: 'Final breakfast together.',
      },
      {
        label: '9\u201310 AM',
        description: 'Check out.',
      },
      {
        label: 'Transfers',
        description:
          'Staggered private van transfers to Chiang Mai airport (~15 min). Flights home, onward travel, or extend your stay independently.',
      },
    ],
  },
];

interface PickleballSession {
  number: number;
  city: string;
  venue: string;
  day: string;
  time: string;
  focus: string;
}

const pickleballSessions: PickleballSession[] = [
  {
    number: 1,
    city: 'Bangkok',
    venue: 'SukSpace',
    day: 'Day 2',
    time: '9:30 AM\u201312 PM',
    focus: 'Assessment, round-robin',
  },
  {
    number: 2,
    city: 'Bangkok',
    venue: 'SukSpace',
    day: 'Day 3',
    time: '5:30\u20137:30 PM',
    focus: 'Structured doubles, clinics',
  },
  {
    number: 3,
    city: 'Bangkok',
    venue: 'SukSpace',
    day: 'Day 4',
    time: '9:00 AM\u201312 PM',
    focus: 'Tournament / competition',
  },
  {
    number: 4,
    city: 'Chiang Mai',
    venue: 'BokBok',
    day: 'Day 6',
    time: '3:00\u20135:30 PM',
    focus: 'Skill clinics, open play',
  },
];

/* ─────────────────────── SUBCOMPONENTS ─────────────────────── */

function StatBar() {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="relative bg-white rounded-xl border border-[#B08D55]/20 p-4 sm:p-5 text-center shadow-sm"
        >
          <div className="text-2xl sm:text-3xl font-bold text-[#1D2D44]">
            {item.value}
          </div>
          <div className="text-xs sm:text-sm text-[#1D2D44]/60 font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            {item.label}
            {item.tooltip && (
              <button
                type="button"
                className="inline-flex"
                onClick={() =>
                  setActiveTooltip(activeTooltip === idx ? null : idx)
                }
                onMouseEnter={() => setActiveTooltip(idx)}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={`More info about ${item.label}`}
              >
                <Info className="w-3.5 h-3.5 text-[#B08D55]" />
              </button>
            )}
          </div>
          {item.tooltip && activeTooltip === idx && (
            <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#1D2D44] text-white text-xs rounded-lg p-3 shadow-lg">
              {item.tooltip}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D2D44] rotate-45" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DayIconComponent({
  icon,
  className,
}: {
  icon: DayIcon;
  className?: string;
}) {
  const Icon = iconMap[icon];
  return <Icon className={className} />;
}

function ItineraryAccordion() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const isExpanded = expandedDay === day.day;

        return (
          <div
            key={day.day}
            className={`overflow-hidden rounded-xl border transition-all ${
              isExpanded
                ? 'border-[#B08D55]/40 bg-[#FDF8F3] shadow-md'
                : 'border-[#1D2D44]/10 bg-white hover:shadow-sm'
            }`}
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(day.day)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#FDF8F3]/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Day Number Circle */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isExpanded
                      ? 'bg-[#1D2D44] text-white'
                      : 'bg-[#1D2D44]/10 text-[#1D2D44]'
                  }`}
                >
                  {day.day}
                </div>

                {/* Title */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-semibold text-[#1D2D44] truncate">
                    {day.title}
                  </h3>
                </div>

                {/* City Badge */}
                <span className="hidden sm:inline-flex flex-shrink-0 items-center rounded-full bg-[#B08D55]/10 px-3 py-1 text-xs font-medium text-[#B08D55]">
                  {day.city}
                </span>

                {/* Day Type Icon */}
                <DayIconComponent
                  icon={day.icon}
                  className="h-4 w-4 flex-shrink-0 text-[#B08D55]/60"
                />
              </div>

              <ChevronDown
                className={`ml-3 h-5 w-5 flex-shrink-0 text-[#1D2D44]/40 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Day Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#B08D55]/20 px-4 pb-4 pt-3">
                    {/* Mobile city badge */}
                    <span className="sm:hidden inline-flex items-center rounded-full bg-[#B08D55]/10 px-3 py-1 text-xs font-medium text-[#B08D55] mb-3">
                      {day.city}
                    </span>

                    {/* Vibe */}
                    <p className="text-xs italic text-[#B08D55] mb-3">
                      Vibe: {day.vibe}
                    </p>

                    <div className="space-y-3">
                      {day.slots.map((slot, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-20 text-xs font-semibold uppercase tracking-wide text-[#B08D55] pt-0.5">
                            {slot.label}
                          </span>
                          <p className="text-sm text-[#1D2D44]/80 leading-relaxed">
                            {slot.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function getCityColor(city: string): string {
  switch (city) {
    case 'Bangkok':
      return 'bg-[#1D2D44] text-white';
    case 'Chiang Mai':
      return 'bg-[#B08D55] text-white';
    default:
      return 'bg-[#1D2D44] text-white';
  }
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */

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
              <span>Chiang Mai</span>
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

      {/* ══════════ CONTENT ══════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* ── STAT BAR ── */}
        <StatBar />

        {/* ── WHAT'S INCLUDED ── */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-6">
            What&apos;s Included
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {includedItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[#1D2D44]/80 text-sm leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXTRAS (NOT INCLUDED) ── */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-6">
            Extras (Not Included)
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {extrasItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Plus className="w-5 h-5 text-[#B08D55]/70 flex-shrink-0 mt-0.5" />
                <span className="text-[#1D2D44]/60 text-sm leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DAY-BY-DAY ITINERARY ── */}
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
              Day-by-Day Itinerary
            </h2>
            <p className="text-[#1D2D44]/60 text-sm">
              8 days across Bangkok and Chiang Mai. Click any day to see the
              full schedule.
            </p>
          </div>
          <ItineraryAccordion />
        </section>

        {/* ── PICKLEBALL SESSIONS TABLE ── */}
        <section>
          <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-6">
            Pickleball Sessions
          </h2>
          <p className="text-[#1D2D44]/70 text-base leading-relaxed mb-8 max-w-3xl">
            4 sessions across 2 cities. Each session blends structured
            instruction with social play, so you&apos;re improving your game and
            meeting your travel crew at the same time.
          </p>

          {/* Session Cards */}
          <div className="space-y-3 mb-6">
            {pickleballSessions.map((session) => (
              <div
                key={session.number}
                className="bg-white rounded-xl border border-[#B08D55]/15 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
              >
                {/* Session Number */}
                <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                  <span className="w-10 h-10 rounded-full bg-[#1D2D44] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {session.number}
                  </span>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCityColor(session.city)}`}
                    >
                      {session.city} &middot; {session.venue}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5E6D3] text-[#1D2D44] text-xs font-medium">
                      {session.day}, {session.time}
                    </span>
                  </div>
                </div>

                {/* Focus */}
                <p className="text-sm text-[#1D2D44]/75 leading-relaxed sm:border-l sm:border-[#B08D55]/15 sm:pl-5">
                  {session.focus}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-[#1D2D44]/5 rounded-xl border border-[#1D2D44]/10 p-4 text-center">
            <p className="text-sm text-[#1D2D44]/70">
              <span className="font-semibold text-[#1D2D44]">Total:</span> 4
              sessions across 2 cities &mdash; ~10 hours of court time
            </p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="text-center">
          <div className="bg-white rounded-2xl border border-[#B08D55]/20 shadow-lg shadow-[#1D2D44]/5 p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B08D55] mb-3">
              Starting From
            </p>
            <p className="font-serif text-5xl sm:text-6xl font-bold text-[#1D2D44] mb-2">
              $2,888
            </p>
            <p className="text-[#1D2D44]/50 text-sm mb-8">per person</p>

            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-white font-semibold text-sm uppercase tracking-wider shadow-lg shadow-[#B08D55]/25 hover:shadow-xl hover:shadow-[#B08D55]/30 transition-all hover:-translate-y-0.5"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── CROSS-LINK TO 13-DAY ── */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] rounded-2xl p-8 sm:p-10">
            <p className="text-white/80 text-base mb-4">
              Looking for the full experience?
            </p>
            <Link
              href="/trips/thailand"
              className="inline-flex items-center gap-2 text-[#B08D55] font-semibold text-lg hover:text-[#CFB78D] transition-colors"
            >
              Check out our 13-Day Ultimate Thailand Tour
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
