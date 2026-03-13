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
  { value: '12', label: 'Max Group Size' },
  {
    value: '6/10',
    label: 'Activity Level',
    tooltip:
      '6/10: Moderate. Pickleball sessions are the most physically active part. Cultural activities, boat tours, and wellness days keep the overall pace accessible to all fitness levels.',
  },
  { value: '8-12', label: 'Hrs. Instruction' },
  { value: '8-14', label: 'Hrs. Social Play' },
];

const includedItems = [
  '14 nights at two five-star hotels (The Peninsula Bangkok + Dusit Thani Hua Hin)',
  'Daily breakfast at both properties (14 breakfasts)',
  '8-9 group dinners: welcome, farewell, and 6-7 curated group dinners',
  'Private ground transfer Bangkok to Hua Hin (3-hr scenic drive)',
  'Private ground transfer Hua Hin back to The Peninsula Bangkok (farewell night)',
  'All private ground transportation (air-con vans, airport transfers)',
  '8+ pickleball sessions with court fees, equipment, and structured programming',
  'Guided Chinatown street food walk (all tastings included)',
  'Wat Pho guided temple tour (Reclining Buddha)',
  'Thai cooking class (half day with market tour)',
  'Temple tour, cultural excursions in both cities',
  'National park or water sports excursion in Hua Hin',
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
  // ── BANGKOK: 5 NIGHTS (Days 1-5) ──
  {
    day: 1,
    title: 'Arrival Day',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Land, breathe, bond',
    icon: 'sparkles',
    slots: [
      { label: 'Daytime', description: 'Staggered airport arrivals. Private van transfer from Suvarnabhumi (~30 min). Check-in, room assignments, property orientation.' },
      { label: '2:00\u20135:00 PM', description: 'Free time to decompress, explore Peninsula grounds.' },
      { label: '5:30 PM', description: 'Group meet in lobby, trip overview from host.' },
      { label: '7:30 PM', description: 'WELCOME DINNER (included) at The Peninsula.' },
    ],
  },
  {
    day: 2,
    title: 'First Paddles + River',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Shake off the rust, then explore the river',
    icon: 'trophy',
    slots: [
      { label: '7:00\u20139:00 AM', description: 'Breakfast at The Peninsula (included daily).' },
      { label: '9:30 AM\u201312:00 PM', description: 'PICKLEBALL SESSION 1 at Peninsula Bangkok. Warm-up drills, skill-level mixing, light round-robin.' },
      { label: '12:30 PM', description: 'Lunch (own expense).' },
      { label: '1:30\u20133:30 PM', description: 'Free time / pool / spa.' },
      { label: '4:30\u20136:30 PM', description: 'PRIVATE LONG-TAIL BOAT SUNSET CRUISE (included). Thonburi canals, Grand Palace, Wat Arun at dusk.' },
      { label: '7:00 PM', description: 'DINNER (included). Riverside restaurant, Wat Arun backdrop.' },
    ],
  },
  {
    day: 3,
    title: 'Temple + Street Food + Pickleball',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'One temple done right, then eat everything',
    icon: 'landmark',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast.' },
      { label: '9:30\u201311:00 AM', description: 'GUIDED WAT PHO TOUR (included). Reclining Buddha, licensed English guide. Optional: Thai massage at Wat Pho massage school (~300\u2013500 THB).' },
      { label: '11:30 AM\u20131:30 PM', description: 'GUIDED CHINATOWN STREET FOOD WALK (included). This IS lunch.' },
      { label: '2:30\u20134:30 PM', description: 'Free time / pool.' },
      { label: '5:00\u20137:00 PM', description: 'PICKLEBALL SESSION 2 at Peninsula Bangkok. Evening session, structured doubles, skill clinics.' },
      { label: '7:30 PM', description: 'Dinner (own expense, free night). CHOOSE YOUR ADVENTURE: Rooftop bar, night market (Jodd Fairs or Rod Fai), or rest at The Peninsula.' },
    ],
  },
  {
    day: 4,
    title: 'Full Pickleball + Bangkok Exploration',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Tournament day, then explore',
    icon: 'trophy',
    slots: [
      { label: '9:00 AM\u201312:00 PM', description: 'PICKLEBALL SESSION 3 at Peninsula Bangkok. Tournament-style: mixed doubles round-robin, king of the court.' },
      { label: '1:30\u20135:30 PM', description: 'Free afternoon. CHOOSE YOUR ADVENTURE: Peninsula Spa, ICONSIAM, Muay Thai, Jim Thompson House, pool/rest.' },
      { label: '7:30 PM', description: 'GROUP DINNER (included).' },
    ],
  },
  {
    day: 5,
    title: 'Bangkok Deep Dive + Farewell',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Last Bangkok paddles, then celebrate',
    icon: 'sparkles',
    slots: [
      { label: '9:00\u201311:00 AM', description: 'PICKLEBALL SESSION 4 at Peninsula Bangkok. Competitive doubles, skill refinement.' },
      { label: '1:00\u20135:00 PM', description: 'Free afternoon. CHOOSE YOUR ADVENTURE: Golden Mount, Chatuchak Market, Thai massage, art centre, pack for Hua Hin.' },
      { label: '7:30 PM', description: 'BANGKOK FAREWELL DINNER (included).' },
    ],
  },
  // ── HUA HIN: 8 NIGHTS (Days 6-13) ──
  {
    day: 6,
    title: 'Drive to Hua Hin',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Road trip, beach, settle in',
    icon: 'ship',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast at Peninsula, check out.' },
      { label: '9:00 AM', description: 'Check out, load van.' },
      { label: '9:30 AM', description: 'Scenic 3-hour drive to Hua Hin, comfort stop midway.' },
      { label: '12:30 PM', description: 'Arrive Dusit Thani, check-in.' },
      { label: '1:00\u20132:00 PM', description: 'Lunch (own expense).' },
      { label: '2:30\u20135:30 PM', description: 'Free afternoon. Beach, pool (#2 in Thailand), Devarana Wellness.' },
      { label: '7:00 PM', description: 'HUA HIN WELCOME DINNER (included). Beachfront seafood.' },
    ],
  },
  {
    day: 7,
    title: 'Pickleball + Group Dinner',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Welcome to Hua Hin courts',
    icon: 'trophy',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast at Dusit Thani.' },
      { label: '9:00\u201311:30 AM', description: 'PICKLEBALL SESSION 5 at Sports Life Hua Hin. Social play with expat community, welcome session.' },
      { label: '12:00 PM', description: 'Lunch (own expense).' },
      { label: '1:00\u20135:00 PM', description: 'Free afternoon. Beach, pool, spa, explore town.' },
      { label: '7:00 PM', description: 'GROUP DINNER (included).' },
    ],
  },
  {
    day: 8,
    title: 'National Park',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Explore nature',
    icon: 'landmark',
    slots: [
      { label: '7:00\u20138:00 AM', description: 'Early breakfast.' },
      { label: '8:30 AM', description: 'Van to Khao Sam Roi Yot (~45 min).' },
      { label: '9:30 AM\u201312:30 PM', description: 'KHAO SAM ROI YOT NATIONAL PARK (included). Limestone hills, Phraya Nakhon Cave, royal pavilion.' },
      { label: '1:00 PM', description: 'Return, lunch (own expense).' },
      { label: '2:00\u20136:00 PM', description: 'Free afternoon. Beach, pool, spa.' },
      { label: '7:00 PM', description: 'Dinner (own expense).' },
    ],
  },
  {
    day: 9,
    title: 'Pickleball + Exploration',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Skill work, then explore',
    icon: 'trophy',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast at Dusit Thani.' },
      { label: '9:00\u201311:30 AM', description: 'PICKLEBALL SESSION 6 at Sports Life Hua Hin. Skill development, dinking drills, strategy work.' },
      { label: '12:00 PM', description: 'Lunch (own expense).' },
      { label: '1:00\u20136:00 PM', description: 'Free afternoon. CHOOSE YOUR ADVENTURE: Beach, Devarana Wellness (own expense), golf (own expense), explore town.' },
      { label: '7:00 PM', description: 'Dinner (own expense).' },
    ],
  },
  {
    day: 10,
    title: 'Vineyard + Pickleball',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Wine country, then social play',
    icon: 'ship',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast at Dusit Thani.' },
      { label: '9:00 AM\u201312:00 PM', description: 'VINEYARD VISIT (included). Hua Hin Hills or Monsoon Valley.' },
      { label: '12:30 PM', description: 'Lunch (own expense).' },
      { label: '3:00\u20135:00 PM', description: 'PICKLEBALL SESSION 7 at Sports Life Hua Hin. Relaxed play, social doubles, mixed pairings.' },
      { label: '7:00 PM', description: 'GROUP DINNER (included).' },
    ],
  },
  {
    day: 11,
    title: 'Free Day + Night Market',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Your day, your pace',
    icon: 'sparkles',
    slots: [
      { label: 'Full Day', description: 'CHOOSE YOUR ADVENTURE: Beach/pool, Cicada Market (if Fri/Sat), floating market, kitesurfing, cooking class.' },
      { label: '6:30\u20139:00 PM', description: 'NIGHT MARKET TOUR (guided). Street food crawl, this IS dinner.' },
    ],
  },
  {
    day: 12,
    title: 'Final Tournament',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Compete, then celebrate',
    icon: 'trophy',
    slots: [
      { label: '7:00\u20138:30 AM', description: 'Breakfast at Dusit Thani.' },
      { label: '9:00\u201311:30 AM', description: 'PICKLEBALL SESSION 8 (FINAL) at Sports Life Hua Hin. Tournament, awards, group photo.' },
      { label: '12:00\u20136:00 PM', description: 'Free afternoon.' },
      { label: '7:30 PM', description: 'HUA HIN FAREWELL DINNER (included). Private beachfront setup.' },
    ],
  },
  {
    day: 13,
    title: 'Free Morning + Pack',
    city: 'Hua Hin',
    hotel: 'Dusit Thani Hua Hin',
    vibe: 'Wind down',
    icon: 'sparkles',
    slots: [
      { label: '7:00\u20139:00 AM', description: 'Breakfast at Dusit Thani.' },
      { label: 'Morning', description: 'Free morning. Optional casual play at Sports Life Hua Hin. Pack.' },
      { label: '7:00 PM', description: 'Dinner (own expense).' },
    ],
  },
  // ── BANGKOK FAREWELL: 1 NIGHT (Day 14) + DEPARTURE (Day 15) ──
  {
    day: 14,
    title: 'Return to Bangkok + Farewell',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'One last night together',
    icon: 'sparkles',
    slots: [
      { label: '7:00\u20139:00 AM', description: 'Final breakfast at Dusit Thani.' },
      { label: '10:00 AM', description: 'Depart for Bangkok, 3-hour drive.' },
      { label: '1:00 PM', description: 'Arrive Peninsula, check-in.' },
      { label: '1:30\u20135:00 PM', description: 'Free afternoon.' },
      { label: '6:00 PM', description: 'Sunset cocktails.' },
      { label: '7:30 PM', description: 'FAREWELL DINNER (included). Trip recap, awards, toasts.' },
    ],
  },
  {
    day: 15,
    title: 'Departure Day',
    city: 'Bangkok',
    hotel: 'The Peninsula Bangkok',
    vibe: 'Hugs, promises to come back',
    icon: 'plane',
    slots: [
      { label: '7:00\u20139:00 AM', description: 'Final breakfast.' },
      { label: 'Check out', description: 'Private van to Suvarnabhumi.' },
    ],
  },
];

/* ─────────────────────── PICKLEBALL DATA ─────────────────────── */

const pickleballSessions = [
  { number: 1, city: 'Bangkok', venue: 'Peninsula Bangkok', day: 'Day 2', time: '9:30 AM\u201312:00 PM', focus: 'Assessment, warm-up drills, round-robin' },
  { number: 2, city: 'Bangkok', venue: 'Peninsula Bangkok', day: 'Day 3', time: '5:00\u20137:00 PM', focus: 'Structured doubles, evening session, skill clinics' },
  { number: 3, city: 'Bangkok', venue: 'Peninsula Bangkok', day: 'Day 4', time: '9:00 AM\u201312:00 PM', focus: 'Tournament-style: mixed doubles round-robin, king of the court' },
  { number: 4, city: 'Bangkok', venue: 'Peninsula Bangkok', day: 'Day 5', time: '9:00\u201311:00 AM', focus: 'Competitive doubles, skill refinement' },
  { number: 5, city: 'Hua Hin', venue: 'Sports Life Hua Hin', day: 'Day 7', time: '9:00\u201311:30 AM', focus: 'Social play with expat community, welcome session' },
  { number: 6, city: 'Hua Hin', venue: 'Sports Life Hua Hin', day: 'Day 9', time: '9:00\u201311:30 AM', focus: 'Skill development, dinking drills, strategy work' },
  { number: 7, city: 'Hua Hin', venue: 'Sports Life Hua Hin', day: 'Day 10', time: '3:00\u20135:00 PM', focus: 'Relaxed play, social doubles, mixed pairings' },
  { number: 8, city: 'Hua Hin', venue: 'Sports Life Hua Hin', day: 'Day 12', time: '9:00\u201311:30 AM', focus: 'Final tournament, awards, group photo' },
];

/* ─────────────────────── ACCOMMODATIONS DATA ─────────────────────── */

const hotels = [
  {
    name: 'The Peninsula Bangkok',
    city: 'Bangkok',
    location: 'Riverside, Charoenkrung Road',
    duration: '5 Nights + 1 Farewell Night',
    highlights: [
      'Five-star riverside luxury on the Chao Phraya River',
      'On-site Peninsula courts, spa, world-class restaurants',
      'Daily breakfast included',
      'Outdoor riverside pool and fitness center',
      'On-site pickleball courts at The Peninsula',
      'Your Bangkok home base for the bookend experience: arrive here, return here',
    ],
  },
  {
    name: 'Dusit Thani Hua Hin',
    city: 'Hua Hin',
    location: 'Beachfront, Hua Hin',
    duration: '8 Nights',
    highlights: [
      'Five-star beachfront resort with direct beach access',
      'Devarana Wellness center: spa, wellness treatments, and relaxation',
      'Rated #2 pool in Thailand',
      'Daily breakfast included',
      'Short drive to Sports Life Hua Hin pickleball courts',
      'Beachfront dining and lounge areas',
      '8 nights gives you time to truly settle in and explore at your own pace',
    ],
  },
];

/* ─────────────────────── DINING DATA ─────────────────────── */

const groupDinners = [
  { city: 'Bangkok', label: 'Bangkok Welcome', restaurant: 'The Peninsula or riverside restaurant', description: 'Welcome dinner on the river' },
  { city: 'Bangkok', label: 'River Dinner', restaurant: 'Riverside dining experience', description: 'Group dinner along the Chao Phraya' },
  { city: 'Bangkok', label: 'Bangkok Farewell', restaurant: 'Curated fine dining', description: 'Farewell to Bangkok before heading south' },
  { city: 'Hua Hin', label: 'Hua Hin Welcome', restaurant: 'Beachside seafood restaurant', description: 'Fresh catch of the day, oceanfront' },
  { city: 'Hua Hin', label: 'Hua Hin Dinners (x3)', restaurant: 'Curated local restaurants', description: '3 curated group dinners across 8 nights' },
  { city: 'Hua Hin', label: 'Hua Hin Farewell', restaurant: 'Curated beachside dining', description: 'Farewell to Hua Hin' },
  { city: 'Bangkok', label: 'Trip Farewell', restaurant: 'Curated fine dining', description: 'Final night celebration at The Peninsula' },
];

const michelinUpgrades = [
  { name: 'Canvas', detail: '1 star, Bangkok', description: '18-course tasting menu.', priceTHB: '~4,500 THB', priceUSD: '~$130' },
  { name: 'S\u00fchring', detail: '2 stars, Bangkok', description: 'Modern German by twin chefs in a garden villa.', priceTHB: '~6,000 THB', priceUSD: '~$175' },
  { name: 'Gaa', detail: '2 stars, Bangkok', description: 'Indian-Thai fusion by Chef Garima Arora.', priceTHB: '~5,000 THB', priceUSD: '~$145' },
  { name: 'Hua Hin beachfront seafood', detail: 'Local favorite, Hua Hin', description: 'Fresh seafood right on the beach.', priceTHB: '~800 THB', priceUSD: '~$23' },
];

/* ─────────────────────── HELPERS ─────────────────────── */

function getCityColor(city: string): string {
  if (city.includes('Hua Hin')) return 'bg-[#B08D55] text-white';
  return 'bg-[#1D2D44] text-white';
}

/* ─────────────────────── SECTION COMPONENTS ─────────────────────── */

function TripDetailsUltimate() {
  return (
    <div className="space-y-10">
      <StatBar items={statItems} />

      {/* Bookend Structure Visual */}
      <div className="bg-gradient-to-r from-[#1D2D44] to-[#495F87] rounded-2xl p-6 text-white">
        <h3 className="font-serif text-lg font-bold mb-4">The Bookend Experience</h3>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white/20 font-medium">The Peninsula Bangkok (5 nights)</span>
          <span className="text-[#B08D55]">&rarr;</span>
          <span className="px-3 py-1.5 rounded-full bg-[#B08D55]/30 font-medium">Dusit Thani Hua Hin (8 nights)</span>
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
          15 days across Bangkok and Hua Hin, with a farewell night back at The Peninsula. Click any day to see the full schedule.
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
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${isExpanded ? 'bg-[#1D2D44] text-white' : 'bg-[#1D2D44]/10 text-[#1D2D44]'}`}>
                    {day.day}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-semibold text-[#1D2D44] truncate">{day.title}</h3>
                  </div>
                  <span className="hidden sm:inline-flex flex-shrink-0 items-center rounded-full bg-[#B08D55]/10 px-3 py-1 text-xs font-medium text-[#B08D55]">
                    {day.city}
                  </span>
                  <Icon className="h-4 w-4 flex-shrink-0 text-[#B08D55]/60" />
                </div>
                <ChevronDown className={`ml-3 h-5 w-5 flex-shrink-0 text-[#1D2D44]/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
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
                            <span className="flex-shrink-0 w-20 text-xs font-semibold uppercase tracking-wide text-[#B08D55] pt-0.5">{slot.label}</span>
                            <p className="text-sm text-[#1D2D44]/80 leading-relaxed">{slot.description}</p>
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

function AccommodationsUltimate() {
  return (
    <div className="space-y-8">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Two five-star properties selected for their location, wellness amenities, and proximity
        to our pickleball venues. You start and finish at The Peninsula Bangkok, with
        8 nights at Dusit Thani Hua Hin as your beachfront destination in between.
      </p>

      <div className="space-y-6">
        {hotels.map((hotel, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8">
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
                <li key={hIdx} className="flex items-start gap-3 text-sm text-[#1D2D44]/75 leading-relaxed">
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

function PickleballUltimate() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        8+ sessions across 2 cities over 15 days. Each session blends structured instruction with social
        play, so you&apos;re improving your game and building friendships at the same time.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { value: '8+', label: 'Total Sessions' },
          { value: '~24 hrs', label: 'Total Court Time' },
          { value: '10-14 hrs', label: 'Instruction' },
          { value: '10-16 hrs', label: 'Social Play' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#B08D55]/20 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#1D2D44]">{item.value}</div>
            <div className="text-xs text-[#1D2D44]/60 font-medium uppercase tracking-wider mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">Session Breakdown</h3>
        <div className="space-y-3">
          {pickleballSessions.map((session) => (
            <div key={session.number} className="bg-white rounded-xl border border-[#B08D55]/15 shadow-sm p-4 sm:p-5 overflow-hidden">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="w-10 h-10 rounded-full bg-[#1D2D44] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{session.number}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCityColor(session.city)}`}>
                      {session.city} &middot; {session.venue}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5E6D3] text-[#1D2D44] text-xs font-medium">
                      {session.day}, {session.time}
                    </span>
                  </div>
                  <p className="text-sm text-[#1D2D44]/75 leading-relaxed">{session.focus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiningUltimate() {
  return (
    <div className="space-y-10">
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Thailand has 43 Michelin-starred restaurants. Over 15 days, we&apos;ll introduce you to the best,
        from 200-baht street food legends to Michelin-star tasting menus. 8-9 group dinners
        are included; optional upgrades available.
      </p>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">Included Group Dinners</h3>
        <div className="space-y-4">
          {groupDinners.map((dinner, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#1D2D44]">{dinner.label}:</span>
                  <span className="text-sm text-[#1D2D44]/80">{dinner.restaurant}</span>
                  <span className="text-xs text-[#1D2D44]/50">- {dinner.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">Optional Michelin Dining Upgrades</h3>
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
                <span className="text-xs font-medium text-[#1D2D44]/40">{upgrade.priceTHB} / {upgrade.priceUSD}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10 p-5">
        <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
          Several evenings are designated as free nights. Your trip host will share curated
          recommendations for Bangkok and Hua Hin, from night markets and rooftop bars to
          hidden local spots.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN EXPORT ─────────────────────── */

export function TripSectionContentUltimate({ activeSection }: { activeSection: TripSection }) {
  switch (activeSection) {
    case 'details':
      return <TripDetailsUltimate />;
    case 'itinerary':
      return <ItineraryAccordion />;
    case 'accommodations':
      return <AccommodationsUltimate />;
    case 'pickleball':
      return <PickleballUltimate />;
    case 'dining':
      return <DiningUltimate />;
    case 'faq':
      return <TripFAQ />;
    case 'cancellation':
      return <CancellationSection />;
    case 'insurance':
      return <TravelInsuranceSection />;
    default:
      return <TripDetailsUltimate />;
  }
}
