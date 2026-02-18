'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Trophy,
  Landmark,
  Ship,
  Sparkles,
  Plane,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DayIcon = 'trophy' | 'landmark' | 'ship' | 'sparkles' | 'plane';

interface TimeSlot {
  label: string;
  description: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  city: string;
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
    title: 'Arrival & Onsen Recovery',
    city: 'Bangkok',
    icon: 'sparkles',
    slots: [
      {
        label: 'Afternoon',
        description:
          'Arrive Bangkok (BKK). VIP fast-track immigration. Private transfer to Grande Centre Point Sukhumvit 55.',
      },
      {
        label: 'Evening',
        description:
          'Japanese onsen session: 5 mineral baths, steam, cold room. Jet lag recovery on Night 1.',
      },
    ],
  },
  {
    day: 2,
    title: 'Sunset Cruise & Street Food',
    city: 'Bangkok',
    icon: 'ship',
    slots: [
      {
        label: 'Morning',
        description:
          'Free morning to explore Thonglor neighborhood. Optional massage.',
      },
      {
        label: 'Afternoon',
        description:
          'Private long-tail boat sunset cruise. Thonburi canals to Wat Arun (Temple of Dawn) lit up at dusk.',
      },
      {
        label: 'Evening',
        description:
          'Guided Chinatown street food walk: roasted duck, mango sticky rice, pad thai, dim sum, coconut ice cream.',
      },
    ],
  },
  {
    day: 3,
    title: 'Temples & First Pickleball',
    city: 'Bangkok',
    icon: 'trophy',
    slots: [
      {
        label: 'Morning',
        description:
          'Wat Pho guided tour. 46-meter Reclining Buddha, home of Thai massage.',
      },
      {
        label: 'Afternoon',
        description:
          'Pickleball Session 1 at SukSpace. Assessment, warm-up, round-robin.',
      },
      {
        label: 'Evening',
        description:
          'Bangkok Welcome Dinner at Supanniga Eating Room.',
      },
    ],
  },
  {
    day: 4,
    title: 'Tournament Day',
    city: 'Bangkok',
    icon: 'trophy',
    slots: [
      {
        label: 'Morning',
        description:
          'Pickleball Session 2 at SukSpace. Structured doubles, skill mixing.',
      },
      {
        label: 'Afternoon',
        description:
          'Free time. Optional: ICONSIAM shopping, Muay Thai match at Rajadamnern Stadium.',
      },
      {
        label: 'Evening',
        description:
          'Pickleball Session 3 at SukSpace. Tournament day, king of the court, competitive brackets.',
      },
    ],
  },
  {
    day: 5,
    title: 'Bangkok Farewell',
    city: 'Bangkok',
    icon: 'landmark',
    slots: [
      {
        label: 'Morning',
        description:
          'Free morning. Optional: Chatuchak Weekend Market (if Saturday/Sunday).',
      },
      {
        label: 'Afternoon',
        description:
          'Free exploration: spa, shopping, or relaxation.',
      },
      {
        label: 'Evening',
        description:
          'Bangkok Farewell Dinner. Curated Michelin experience (S\u00fchring, Gaa, or Samrub Thai).',
      },
    ],
  },
  {
    day: 6,
    title: 'Fly to Chiang Mai',
    city: 'Chiang Mai',
    icon: 'plane',
    slots: [
      {
        label: 'Morning',
        description:
          'Domestic flight Bangkok \u2192 Chiang Mai (~1.5 hours).',
      },
      {
        label: 'Afternoon',
        description:
          'Check in at Maraya Hotel & Resort. Explore Ping River area and Wiang Kum Kam ruins by bicycle.',
      },
      {
        label: 'Evening',
        description:
          'Chiang Mai Welcome Dinner at Huen Muan Jai. Michelin Bib Gourmand.',
      },
    ],
  },
  {
    day: 7,
    title: 'Cooking Class & Clinics',
    city: 'Chiang Mai',
    icon: 'landmark',
    slots: [
      {
        label: 'Morning',
        description:
          'Thai cooking class: morning market tour + cook 5\u20136 dishes at an organic farm.',
      },
      {
        label: 'Afternoon',
        description:
          'Pickleball Session 4 at BokBok. Skill clinics: dinking, third-shot drops, stacking strategy.',
      },
      {
        label: 'Evening',
        description:
          'Free night. Optional: Sunday Walking Street or Saturday Night Bazaar.',
      },
    ],
  },
  {
    day: 8,
    title: 'Elephants & Competition',
    city: 'Chiang Mai',
    icon: 'trophy',
    slots: [
      {
        label: 'Morning',
        description:
          'Pickleball Session 5 at BokBok. Competitive bracket play.',
      },
      {
        label: 'Afternoon',
        description:
          'Elephant Nature Park. Ethical sanctuary founded by conservationist Lek Chailert. No riding, no chains. Feed, observe, and walk with rescued elephants.',
      },
      {
        label: 'Evening',
        description:
          'Chiang Mai Signature Dinner at Huan Soontaree. Riverside Northern Thai with live folk music.',
      },
    ],
  },
  {
    day: 9,
    title: 'Fly to Phuket & Welcome Play',
    city: 'Phuket',
    icon: 'plane',
    slots: [
      {
        label: 'Morning',
        description:
          'Domestic flight Chiang Mai \u2192 Phuket (~2 hours).',
      },
      {
        label: 'Afternoon',
        description:
          'Arrive Phuket. Check in at Sole Mio Boutique Hotel & Wellness. Settle in and explore the property.',
      },
      {
        label: 'Evening',
        description:
          'Pickleball Session 6 at Peak Racquet Club. Welcome session, casual open play.',
      },
    ],
  },
  {
    day: 10,
    title: 'Beach & Leisure Day',
    city: 'Phuket',
    icon: 'ship',
    slots: [
      {
        label: 'Morning',
        description:
          'Free morning. Bang Tao Beach, hotel pool, or wellness circuit: sauna, steam, cold room, yoga.',
      },
      {
        label: 'Afternoon',
        description:
          'Private speedboat charter. Phang Nga Bay, James Bond Island, sea cave kayaking, snorkeling, lunch on the water.',
      },
      {
        label: 'Evening',
        description:
          'Free night. Optional: Phuket Old Town exploration, sunset rooftop cocktails.',
      },
    ],
  },
  {
    day: 11,
    title: 'Championship Day',
    city: 'Phuket',
    icon: 'trophy',
    slots: [
      {
        label: 'Morning',
        description:
          'Pickleball Session 7 at Peak Racquet Club. Final championship, awards ceremony, group photo.',
      },
      {
        label: 'Afternoon',
        description:
          'Bang Tao Beach free time. Optional: Catch Beach Club day beds.',
      },
      {
        label: 'Evening',
        description:
          "Phuket Closing Dinner at PRU at Trisara. Phuket's only Michelin-starred restaurant.",
      },
    ],
  },
  {
    day: 12,
    title: 'Free Day & Farewell',
    city: 'Phuket',
    icon: 'sparkles',
    slots: [
      {
        label: 'Morning',
        description:
          'Free morning. Optional: beach, spa, shopping, or group yoga session at Sole Mio.',
      },
      {
        label: 'Afternoon',
        description:
          'Departure preparations. Airport transfers available throughout the day.',
      },
      {
        label: 'Evening',
        description:
          'Optional: final group dinner for those staying overnight.',
      },
    ],
  },
  {
    day: 13,
    title: 'Departure',
    city: 'Phuket',
    icon: 'plane',
    slots: [
      {
        label: 'Morning',
        description:
          'Final breakfast at Sole Mio. Private transfer to Phuket International Airport (HKT).',
      },
      {
        label: 'Note',
        description:
          'Extend your stay for additional beach time or personal travel.',
      },
    ],
  },
];

function DayIcon({ icon, className }: { icon: DayIcon; className?: string }) {
  const Icon = iconMap[icon];
  return <Icon className={className} />;
}

export function ItinerarySection() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
          Day-by-Day Itinerary
        </h2>
        <p className="text-[#1D2D44]/60 text-sm">
          13 days across Bangkok, Chiang Mai, and Phuket. Click any day to see
          the full schedule.
        </p>
      </div>

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
                  <DayIcon
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
