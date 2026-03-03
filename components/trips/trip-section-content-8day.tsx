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
  'Elephant Nature Park visit (ethical sanctuary, no riding, no chains)',
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
          'Staggered airport arrivals. Private van transfers from Suvarnabhumi (BKK) to our Bangkok hotel. Check-in + room assignments.',
      },
      {
        label: 'Free Time',
        description: 'Explore Thonglor. Coffee at The Commons or Roast Coffee.',
      },
      { label: '4:00 PM', description: 'Group meet in hotel lobby, orientation.' },
      {
        label: '5:00 PM',
        description: 'Onsen session: mineral baths, steam, cold room.',
      },
      {
        label: '7:30 PM',
        description: 'WELCOME DINNER: Supanniga Eating Room (Thonglor).',
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
      { label: '7\u20139 AM', description: 'Breakfast at hotel.' },
      {
        label: '9:30 AM',
        description:
          'PICKLEBALL SESSION 1 at our Bangkok courts: Warm-up drills, round-robin.',
      },
      { label: '12:30 PM', description: 'Lunch: local Thonglor spot.' },
      { label: '1:30 PM', description: 'Free time / recovery / onsen / pool.' },
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
      { label: '7\u20138:30 AM', description: 'Breakfast at hotel.' },
      {
        label: '9:30 AM',
        description: 'WAT PHO guided tour (Reclining Buddha, optional Thai massage).',
      },
      { label: '11:30 AM', description: 'GUIDED CHINATOWN STREET FOOD WALK.' },
      { label: '2\u20135 PM', description: 'Free time / recovery / explore Thonglor.' },
      {
        label: '5:30 PM',
        description:
          'PICKLEBALL SESSION 2 at our Bangkok courts: Structured doubles, skill clinics.',
      },
      {
        label: '8:00 PM',
        description: 'Free dinner night (rec: Canvas, 1 Michelin star, ~4,500 THB).',
      },
    ],
  },
  {
    day: 4,
    title: 'Free Day + Farewell',
    city: 'Bangkok',
    vibe: 'Explore, recharge, then celebrate',
    icon: 'sparkles',
    slots: [
      { label: '7\u20138:30 AM', description: 'Breakfast at hotel.' },
      {
        label: '9 AM\u20135 PM',
        description:
          'FREE DAY. Options: Onsen + spa, ICONSIAM shopping, Chatuchak Weekend Market, Muay Thai match, pool day.',
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
      { label: '7\u20138:30 AM', description: 'Breakfast, check out.' },
      { label: '~11 AM', description: 'Flight to Chiang Mai (~1 hr 15 min).' },
      {
        label: '12:30 PM',
        description: 'Private van to our Chiang Mai hotel (Ping River).',
      },
      {
        label: '2:00 PM',
        description: 'WIANG KUM KAM BICYCLE EXPLORATION: 700-year-old Lanna ruins.',
      },
      {
        label: '6:30 PM',
        description: 'WELCOME DINNER: Huen Muan Jai (Michelin Bib Gourmand).',
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
      { label: '7\u20138:30 AM', description: 'Breakfast at the hotel.' },
      {
        label: '9:00 AM',
        description:
          'THAI COOKING CLASS: Market tour + cook 5\u20136 dishes at organic farm.',
      },
      {
        label: '3:00 PM',
        description:
          'PICKLEBALL SESSION 3 at BokBok: Skill clinics, dinking, stacking, open play.',
      },
      {
        label: '7:00 PM',
        description: 'DINNER: Kiti Panit (Michelin-recommended, 130-year-old teak mansion).',
      },
    ],
  },
  {
    day: 7,
    title: 'Championship + Elephants',
    city: 'Chiang Mai',
    vibe: 'Compete in the morning, awe in the afternoon',
    icon: 'trophy',
    slots: [
      { label: '7\u20137:30 AM', description: 'Early breakfast.' },
      {
        label: '9:00 AM',
        description: 'PICKLEBALL SESSION 4 at BokBok: Competitive play, bracket tournament.',
      },
      {
        label: '1:30 PM',
        description:
          'ELEPHANT NATURE PARK: Feed elephants, river bathing, guided walk, lunch included.',
      },
      { label: '5:30 PM', description: 'Pool / spa / decompress.' },
      {
        label: '7:00 PM',
        description: 'DINNER: Huan Soontaree (riverside, live folk music).',
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
      { label: '7\u20139 AM', description: 'Final breakfast together.' },
      { label: '9\u201310 AM', description: 'Check out.' },
      {
        label: 'Transfers',
        description:
          'Staggered private van transfers to Chiang Mai airport (~15 min). Flights home, onward travel, or extend your stay independently.',
      },
    ],
  },
];

/* ─────────────────────── PICKLEBALL DATA ─────────────────────── */

const pickleballSessions = [
  {
    number: 1,
    city: 'Bangkok',
    venue: 'Courts',
    day: 'Day 2',
    time: '9:30 AM\u201312 PM',
    focus: 'Assessment, round-robin',
  },
  {
    number: 2,
    city: 'Bangkok',
    venue: 'Courts',
    day: 'Day 3',
    time: '5:30\u20137:30 PM',
    focus: 'Structured doubles, skill clinics',
  },
  {
    number: 3,
    city: 'Chiang Mai',
    venue: 'BokBok',
    day: 'Day 6',
    time: '3:00\u20135:30 PM',
    focus: 'Skill clinics, dinking, stacking, open play',
  },
  {
    number: 4,
    city: 'Chiang Mai',
    venue: 'BokBok',
    day: 'Day 7',
    time: '9:00 AM\u201312 PM',
    focus: 'Competitive play, bracket tournament',
  },
];

/* ─────────────────────── ACCOMMODATIONS DATA ─────────────────────── */

const hotels = [
  {
    name: 'Boutique hotel in Bangkok\u2019s vibrant Thonglor or riverside district',
    city: 'Bangkok',
    location: 'Thonglor, Bangkok\u2019s trendiest neighborhood',
    duration: '4 Nights',
    highlights: [
      'Full-floor Japanese onsen and spa: 5 mineral baths, steam room, cold room, tatami private rooms. The ultimate jet lag recovery on arrival night',
      'Outdoor sunset pool and jacuzzi with city views, modern fitness center',
      'Daily breakfast included',
      'Free tuk-tuk shuttle to Thong Lo BTS station every 20 minutes',
      'Walking distance to our pickleball courts, Eight Thonglor dining complex, The Commons, and Bangkok\u2019s best street food',
    ],
  },
  {
    name: 'Riverside boutique resort near ancient Lanna ruins',
    city: 'Chiang Mai',
    location: 'Ping River, Wiang Kum Kam',
    duration: '3 Nights',
    highlights: [
      '18-room riverside boutique on the banks of the Ping River, surrounded by 700-year-old Lanna archaeological ruins',
      'Free cooked-to-order breakfast daily (included)',
      'Outdoor pool with river and ancient pagoda views',
      'Free shuttle to downtown and Night Bazaar 3x daily',
      'Free bicycles for exploring Wiang Kum Kam ruins: temples, crumbling walls, zero tourists',
      '5 minutes from Chiang Mai airport, 5-minute drive to BokBok Pickleball courts',
    ],
  },
];

/* ─────────────────────── DINING DATA ─────────────────────── */

const groupDinners = [
  {
    city: 'Bangkok',
    label: 'Bangkok Welcome',
    restaurant: 'Supanniga Eating Room',
    description: 'Refined Thai comfort food, Thonglor',
  },
  {
    city: 'Bangkok',
    label: 'Bangkok Farewell',
    restaurant: 'Curated Michelin experience',
    description: 'S\u00fchring, Gaa, or Samrub Thai',
  },
  {
    city: 'Chiang Mai',
    label: 'Chiang Mai Welcome',
    restaurant: 'Huen Muan Jai',
    description: 'Michelin Bib Gourmand, traditional Lanna wooden house',
  },
  {
    city: 'Chiang Mai',
    label: 'Chiang Mai Signature',
    restaurant: 'Huan Soontaree',
    description: 'Riverside Northern Thai with live folk music',
  },
];

const michelinUpgrades = [
  {
    name: 'Canvas',
    detail: '1 star, Bangkok',
    description: '18-course tasting menu.',
    priceTHB: '~4,500 THB',
    priceUSD: '~$130',
  },
  {
    name: 'S\u00fchring',
    detail: '2 stars, Bangkok',
    description: 'Modern German by twin chefs in a garden villa.',
    priceTHB: '~6,000 THB',
    priceUSD: '~$175',
  },
  {
    name: 'Gaa',
    detail: '2 stars, Bangkok',
    description: 'Indian-Thai fusion by Chef Garima Arora.',
    priceTHB: '~5,000 THB',
    priceUSD: '~$145',
  },
  {
    name: 'Kiti Panit',
    detail: 'Michelin-recommended, Chiang Mai',
    description: '130-year-old teak mansion.',
    priceTHB: '~500 THB',
    priceUSD: '~$15',
  },
];

/* ─────────────────────── HELPERS ─────────────────────── */

function getCityColor(city: string): string {
  return city === 'Chiang Mai' ? 'bg-[#B08D55] text-white' : 'bg-[#1D2D44] text-white';
}

/* ─────────────────────── SECTION COMPONENTS ─────────────────────── */

function TripDetails8Day() {
  return (
    <div className="space-y-10">
      <StatBar items={statItems} />

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
          8 days across Bangkok and Chiang Mai. Click any day to see the full schedule.
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

function Accommodations8Day() {
  return (
    <div className="space-y-8">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Every property is independently owned, locally rooted, and handpicked for its
        character, wellness amenities, and proximity to our pickleball venues. No chains. No
        corporate lobbies.
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D2D44] text-white text-xs font-medium">
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

function Pickleball8Day() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        4 sessions across 2 cities. Each session blends structured instruction with social
        play, so you&apos;re improving your game and meeting your travel crew at the same time.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { value: '4', label: 'Total Sessions' },
          { value: '~10 hrs', label: 'Total Court Time' },
          { value: '5–7 hrs', label: 'Instruction' },
          { value: '5–8 hrs', label: 'Social Play' },
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
              className="bg-white rounded-xl border border-[#B08D55]/15 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
            >
              <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                <span className="w-10 h-10 rounded-full bg-[#1D2D44] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {session.number}
                </span>
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
              <p className="text-sm text-[#1D2D44]/75 leading-relaxed sm:border-l sm:border-[#B08D55]/15 sm:pl-5">
                {session.focus}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dining8Day() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Thailand has 43 Michelin-starred restaurants. We&apos;ll introduce you to the best,
        from 200-baht street food legends to Michelin-star tasting menus. Three group dinners
        are included; optional upgrades available.
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
                  <span className="text-sm text-[#1D2D44]/80">{dinner.restaurant}</span>
                  <span className="text-xs text-[#1D2D44]/50">- {dinner.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Optional Michelin Dining Upgrades
        </h3>
        <div className="space-y-4">
          {michelinUpgrades.map((upgrade, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Utensils className="w-4 h-4 text-[#B08D55]/50 flex-shrink-0 mt-1" />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div>
                  <span className="text-sm font-semibold text-[#1D2D44]">{upgrade.name}</span>
                  <span className="text-xs text-[#1D2D44]/50 ml-1.5">({upgrade.detail})</span>
                </div>
                <span className="text-xs text-[#1D2D44]/50">{upgrade.description}</span>
                <span className="text-xs font-medium text-[#1D2D44]/40">
                  {upgrade.priceTHB} / {upgrade.priceUSD}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10 p-5">
        <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
          Several evenings are designated as free nights. Your trip host will share curated
          recommendations for Bangkok and Chiang Mai, from night markets and rooftop bars to
          hidden local spots.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN EXPORT ─────────────────────── */

export function TripSectionContent8Day({ activeSection }: { activeSection: TripSection }) {
  switch (activeSection) {
    case 'details':
      return <TripDetails8Day />;
    case 'itinerary':
      return <ItineraryAccordion />;
    case 'accommodations':
      return <Accommodations8Day />;
    case 'pickleball':
      return <Pickleball8Day />;
    case 'dining':
      return <Dining8Day />;
    case 'faq':
      return <TripFAQ />;
    case 'cancellation':
      return <CancellationSection />;
    case 'insurance':
      return <TravelInsuranceSection />;
    default:
      return <TripDetails8Day />;
  }
}
