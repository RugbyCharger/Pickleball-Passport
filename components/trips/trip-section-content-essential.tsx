'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Plus,
  Trophy,
  Landmark,
  Ship,
  Sparkles,
  Plane,
  ChevronDown,
  MapPin,
  Clock,
  Utensils,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type TripSection } from './trip-sidebar-nav';
import { StatBar } from './stat-bar';
import { TripFAQ } from './trip-faq';
import { CancellationSection } from './cancellation-section';
import { TravelInsuranceSection } from './travel-insurance-section';

/* ─────────────────────── TRIP DETAILS DATA ─────────────────────── */

const statItems = [
  { value: '16', label: 'Max Group Size' },
  {
    value: '6/10',
    label: 'Activity Level',
    tooltip:
      '6/10: Moderate. Pickleball sessions are the most physically active part. Cultural activities, boat tours, and wellness days keep the overall pace accessible to all fitness levels.',
  },
  { value: '4-5', label: 'Hrs. Instruction' },
  { value: '4-5', label: 'Hrs. Social Play' },
];

const includedItems = [
  '8 nights at two five-star hotels (The Peninsula Bangkok + Anantara Hua Hin Resort)',
  'Daily breakfast at both properties (8 breakfasts)',
  '4-5 group dinners: welcome, farewell, and 2-3 curated group dinners',
  'Private ground transfer Bangkok to Hua Hin (3-hr scenic drive)',
  'Private ground transfer Hua Hin back to The Peninsula Bangkok (farewell night)',
  'All private ground transportation (air-con vans, airport transfers)',
  '4 pickleball sessions with court fees, equipment, and structured programming',
  'Guided Chinatown street food walk (all tastings included)',
  'Wat Pho guided temple tour (Reclining Buddha)',
  '1-2 cultural excursions',
  'Hotel wellness amenities: spa, pools, fitness centers',
  'Dedicated trip host throughout',
  'Welcome pack with trip essentials',
];

const extrasItems = [
  'International airfare to/from Bangkok (BKK)',
  'Travel and medical insurance',
  'Michelin dining upgrades (optional group outings to starred restaurants)',
  'Optional spa treatments beyond hotel amenities',
  'Alcoholic beverages beyond group dinner inclusions',
  'Meals on designated free nights',
  'Personal shopping and souvenirs',
  'Gratuities for guides, drivers, and hotel staff',
];

/* ─────────────────────── ITINERARY DATA ─────────────────────── */

type DayIcon = 'trophy' | 'landmark' | 'ship' | 'sparkles' | 'plane';

interface TimeSlot {
  label: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  city: string;
  hotel: string;
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
    hotel: 'The Peninsula Bangkok',
    vibe: 'Land, breathe, bond',
    icon: 'sparkles',
    slots: [
      { label: 'Highlights', description: 'Land in Bangkok, settle into The Peninsula, welcome dinner on the river.' },
    ],
  },
  {
    day: 2,
    title: 'Pickleball + River Cruise',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Shake off the rust, then explore the river',
    icon: 'trophy',
    slots: [
      { label: 'Highlights', description: 'Morning session on court at Peninsula Bangkok. Afternoon long-tail boat cruise through Bangkok\u2019s canals past the Grand Palace and Wat Arun at sunset. Group dinner on the river.' },
    ],
  },
  {
    day: 3,
    title: 'Temples, Street Food + Pickleball',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'One temple done right, then eat everything',
    icon: 'landmark',
    slots: [
      { label: 'Highlights', description: 'Guided tour of Wat Pho (Reclining Buddha), street food walk through Chinatown, afternoon pickleball session at Peninsula Bangkok. Free evening to explore night markets or rooftop bars.' },
    ],
  },
  {
    day: 4,
    title: 'Scenic Drive to Hua Hin',
    city: 'Hua Hin',
    hotel: 'Anantara Hua Hin Resort',
    vibe: 'Road trip, beach, settle in',
    icon: 'ship',
    slots: [
      { label: 'Highlights', description: 'Scenic drive to Hua Hin. Check into Anantara, explore the beachfront resort. Welcome dinner with fresh seafood by the ocean.' },
    ],
  },
  {
    day: 5,
    title: 'Pickleball + Night Market',
    city: 'Hua Hin',
    hotel: 'Anantara Hua Hin Resort',
    vibe: 'Play hard, explore harder',
    icon: 'trophy',
    slots: [
      { label: 'Highlights', description: 'Morning pickleball session at Sports Life Hua Hin. Free afternoon for beach, pool, or golf. Guided night market street food tour for dinner.' },
    ],
  },
  {
    day: 6,
    title: 'National Park + Final Pickleball',
    city: 'Hua Hin',
    hotel: 'Anantara Hua Hin Resort',
    vibe: 'Explore nature, then compete',
    icon: 'landmark',
    slots: [
      { label: 'Highlights', description: 'Morning excursion to Khao Sam Roi Yot National Park. Afternoon final pickleball session. Fun tournament, awards, and group photos. Group dinner.' },
    ],
  },
  {
    day: 7,
    title: 'Free Day',
    city: 'Hua Hin',
    hotel: 'Anantara Hua Hin Resort',
    vibe: 'Choose your own adventure',
    icon: 'sparkles',
    slots: [
      { label: 'Highlights', description: 'Full day at your own pace. Beach, spa, golf, vineyard visit, local markets, or extra pickleball. Free evening.' },
    ],
  },
  {
    day: 8,
    title: 'Return to Bangkok + Farewell',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'One last night together',
    icon: 'sparkles',
    slots: [
      { label: 'Highlights', description: 'Drive back to Bangkok, check into The Peninsula for one last night. Farewell dinner. Trip recap, awards, and toasts.' },
    ],
  },
  {
    day: 9,
    title: 'Departure Day',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Hugs, promises to come back',
    icon: 'plane',
    slots: [
      { label: 'Highlights', description: 'Final breakfast at The Peninsula. Private transfer to the airport. Head home with new friends and plans to come back.' },
    ],
  },
];

/* ─────────────────────── PICKLEBALL DATA ─────────────────────── */

const pickleballSessions = [
  {
    number: 1,
    city: 'Bangkok',
    venue: 'Peninsula Bangkok',
    day: 'Day 2',
    time: 'Morning',
    focus: 'Assessment, warm-up, coaching + round-robin',
  },
  {
    number: 2,
    city: 'Bangkok',
    venue: 'Peninsula Bangkok',
    day: 'Day 3',
    time: 'Afternoon',
    focus: 'Coaching clinic + doubles play',
  },
  {
    number: 3,
    city: 'Hua Hin',
    venue: 'Sports Life Hua Hin',
    day: 'Day 5',
    time: 'Morning',
    focus: 'Coaching clinic + round-robin',
  },
  {
    number: 4,
    city: 'Hua Hin',
    venue: 'Sports Life Hua Hin',
    day: 'Day 6',
    time: 'Afternoon',
    focus: 'Fun tournament + awards ceremony',
  },
];

/* ─────────────────────── ACCOMMODATIONS DATA ─────────────────────── */

const hotels = [
  {
    name: 'The Peninsula Bangkok',
    city: 'Bangkok',
    location: 'Riverside, Charoenkrung Road',
    duration: '3 Nights + 1 Farewell Night',
    highlights: [
      'Five-star riverside luxury on the Chao Phraya River',
      'On-site pickleball courts, spa, and world-class restaurants',
      'Outdoor riverside pool and daily breakfast included',
    ],
  },
  {
    name: 'Anantara Hua Hin Resort',
    city: 'Hua Hin',
    location: 'Beachfront, Hua Hin',
    duration: '4 Nights',
    highlights: [
      'Five-star beachfront resort with direct beach access',
      'Full-service spa and wellness facilities',
      'Resort pool, daily breakfast, and beachfront dining',
    ],
  },
];

/* ─────────────────────── DINING DATA ─────────────────────── */

const groupDinners = [
  {
    city: 'Bangkok',
    label: 'Bangkok Welcome',
    restaurant: 'The Peninsula or riverside restaurant',
    description: 'Welcome dinner on the river',
  },
  {
    city: 'Bangkok',
    label: 'River Dinner',
    restaurant: 'Riverside dining experience',
    description: 'Group dinner along the Chao Phraya',
  },
  {
    city: 'Hua Hin',
    label: 'Hua Hin Welcome',
    restaurant: 'Beachside seafood restaurant',
    description: 'Fresh catch of the day, oceanfront dining',
  },
  {
    city: 'Hua Hin',
    label: 'Hua Hin Group Dinner',
    restaurant: 'Curated Hua Hin dining experience',
    description: 'Local flavors and beachside atmosphere',
  },
  {
    city: 'Bangkok',
    label: 'Farewell Dinner',
    restaurant: 'Curated fine dining experience',
    description: 'Final night celebration back at The Peninsula',
  },
];

const michelinUpgrades: { name: string; detail: string; description: string; priceTHB: string; priceUSD: string }[] = [];

/* ─────────────────────── HELPERS ─────────────────────── */

function getCityColor(city: string): string {
  return city === 'Hua Hin' ? 'bg-[#B08D55] text-white' : 'bg-[#1D2D44] text-white';
}

/* ─────────────────────── SECTION COMPONENTS ─────────────────────── */

function TripDetailsEssential() {
  return (
    <div className="space-y-10">
      <StatBar items={statItems} />

      {/* Bookend Structure Visual */}
      <div className="bg-gradient-to-r from-[#1D2D44] to-[#495F87] rounded-2xl p-6 text-white">
        <h3 className="font-serif text-lg font-bold mb-4">The Bookend Experience</h3>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/20 font-medium">The Peninsula Bangkok (3 nights)</span>
          <span className="text-[#B08D55]">&rarr;</span>
          <span className="px-3 py-1.5 rounded-full bg-[#B08D55]/30 font-medium">Anantara Hua Hin Resort (4 nights)</span>
          <span className="text-[#B08D55]">&rarr;</span>
          <span className="px-3 py-1.5 rounded-full bg-white/20 font-medium">The Peninsula Bangkok (1 farewell night)</span>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          What&apos;s Included
        </h3>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {includedItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-[#1D2D44]/80 text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Extras (Not Included)
        </h3>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {extrasItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-[#B08D55]/70 flex-shrink-0 mt-0.5" />
              <span className="text-[#1D2D44]/60 text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItineraryAccordion() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
          Day-by-Day Itinerary
        </h2>
        <p className="text-[#1D2D44]/60 text-sm">
          9 days across Bangkok and Hua Hin, with a farewell night back at The Peninsula. Click any day to see the highlights.
        </p>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const isExpanded = expandedDay === day.day;
          const Icon = iconMap[day.icon];

          return (
            <div
              key={day.day}
              className={`overflow-hidden rounded-xl border transition-all ${
                isExpanded
                  ? 'border-[#B08D55]/40 bg-[#FDF8F3] shadow-md'
                  : 'border-[#1D2D44]/10 bg-white hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#FDF8F3]/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isExpanded ? 'bg-[#1D2D44] text-white' : 'bg-[#1D2D44]/10 text-[#1D2D44]'
                    }`}
                  >
                    {day.day}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-semibold text-[#1D2D44] truncate">
                      {day.title}
                    </h3>
                  </div>
                  <span className="hidden sm:inline-flex flex-shrink-0 items-center rounded-full bg-[#B08D55]/10 px-3 py-1 text-xs font-medium text-[#B08D55]">
                    {day.city}
                  </span>
                  <Icon className="h-4 w-4 flex-shrink-0 text-[#B08D55]/60" />
                </div>
                <ChevronDown
                  className={`ml-3 h-5 w-5 flex-shrink-0 text-[#1D2D44]/40 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

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
                      <span className="sm:hidden inline-flex items-center rounded-full bg-[#B08D55]/10 px-3 py-1 text-xs font-medium text-[#B08D55] mb-3">
                        {day.city}
                      </span>
                      <p className="text-xs text-[#1D2D44]/50 mb-1">{day.hotel}</p>
                      <p className="text-xs italic text-[#B08D55] mb-3">Vibe: {day.vibe}</p>
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
    </div>
  );
}

function AccommodationsEssential() {
  return (
    <div className="space-y-8">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Two five-star properties selected for their location, wellness amenities, and proximity
        to our pickleball venues. You start and finish at The Peninsula Bangkok, with
        Anantara Hua Hin Resort as your beachfront destination in between.
      </p>

      <div className="space-y-6">
        {hotels.map((hotel, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#1D2D44]">{hotel.name}</h4>
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[#1D2D44]/60">
                  <MapPin className="w-4 h-4 text-[#B08D55]" />
                  {hotel.location}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getCityColor(hotel.city)}`}>
                  {hotel.city}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5E6D3] text-[#1D2D44] text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#B08D55]" />
                  {hotel.duration}
                </span>
              </div>
            </div>
            <ul className="space-y-2.5">
              {hotel.highlights.map((highlight, hIdx) => (
                <li
                  key={hIdx}
                  className="flex items-start gap-3 text-sm text-[#1D2D44]/75 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55] flex-shrink-0 mt-2" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PickleballEssential() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        4 sessions across 2 cities. Each session blends structured instruction with social
        play, so you&apos;re improving your game and meeting your travel crew at the same time.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { value: '4', label: 'Total Sessions' },
          { value: '8-10 hrs', label: 'Total Court Time' },
          { value: 'Coaching', label: 'Clinics Each Session' },
          { value: '3.0–5.0+', label: 'All Skill Levels' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-[#B08D55]/20 p-4 text-center shadow-sm"
          >
            <div className="text-2xl font-bold text-[#1D2D44]">{item.value}</div>
            <div className="text-xs text-[#1D2D44]/60 font-medium uppercase tracking-wider mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Session Breakdown
        </h3>
        <div className="space-y-3">
          {pickleballSessions.map((session) => (
            <div
              key={session.number}
              className="bg-white rounded-xl border border-[#B08D55]/15 shadow-sm p-4 sm:p-5 overflow-hidden"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="w-10 h-10 rounded-full bg-[#1D2D44] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {session.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCityColor(session.city)}`}
                    >
                      {session.city} &middot; {session.venue}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5E6D3] text-[#1D2D44] text-xs font-medium">
                      {session.day}, {session.time}
                    </span>
                  </div>
                  <p className="text-sm text-[#1D2D44]/75 leading-relaxed">
                    {session.focus}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiningEssential() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        4-5 group dinners included, from riverside restaurants in Bangkok to beachfront seafood
        in Hua Hin. Daily breakfast at both hotels. Free nights give you a chance to explore
        on your own. Your trip host will share curated recommendations.
      </p>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Included Group Dinners
        </h3>
        <div className="space-y-4">
          {groupDinners.map((dinner, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#1D2D44]">
                    {dinner.label}:
                  </span>
                  <span className="text-sm text-[#1D2D44]/80">{dinner.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10 p-5">
        <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
          Optional Michelin dining upgrades available. Ask us on your consultation call for details.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN EXPORT ─────────────────────── */

export function TripSectionContentEssential({ activeSection }: { activeSection: TripSection }) {
  switch (activeSection) {
    case 'details':
      return <TripDetailsEssential />;
    case 'itinerary':
      return <ItineraryAccordion />;
    case 'accommodations':
      return <AccommodationsEssential />;
    case 'pickleball':
      return <PickleballEssential />;
    case 'dining':
      return <DiningEssential />;
    case 'faq':
      return <TripFAQ />;
    case 'cancellation':
      return <CancellationSection />;
    case 'insurance':
      return <TravelInsuranceSection />;
    default:
      return <TripDetailsEssential />;
  }
}
