'use client';

import { CheckCircle, Plus } from 'lucide-react';
import { StatBar } from '@/components/trips/stat-bar';

const includedItems = [
  '12 nights at handpicked boutique hotels (3 unique properties, 3 cities)',
  'Daily breakfast at all hotels (12 breakfasts)',
  '5 group dinners: welcome dinner in each city + Bangkok farewell + Phuket closing dinner',
  '2 domestic flights (Bangkok \u2192 Chiang Mai \u2192 Phuket)',
  'All private ground transportation (air-con vans, airport transfers in all cities)',
  '7 pickleball sessions with court fees, equipment, and structured programming',
  'Thai cooking class (half day with market tour)',
  'Elephant Nature Park visit (ethical sanctuary \u2014 no riding, no chains)',
  'Private long-tail boat sunset cruise on the Chao Phraya River',
  'Wat Pho guided temple tour (Reclining Buddha)',
  'Guided Chinatown street food walk (all tastings included)',
  'Wiang Kum Kam archaeological site bicycle exploration',
  'Private speedboat charter \u2014 Phang Nga Bay (James Bond Island, kayaking, snorkeling)',
  'Hotel wellness amenities: onsen, pools, saunas, steam rooms',
  'Hotel shuttles to beaches, BTS stations, and night markets',
  'Dedicated trip host throughout',
];

const extrasItems = [
  'International airfare to/from Bangkok (BKK)',
  'Travel and medical insurance',
  'Michelin dining upgrades (optional group outings to starred restaurants)',
  'Optional spa treatments and massage beyond hotel amenities',
  'Optional activities: Muay Thai viewing, Doi Suthep temple hike, shopping excursions',
  'Beach club day beds and loungers (Catch Beach Club, Caf\u00e9 del Mar)',
  'Alcoholic beverages beyond group dinner inclusions',
  'Meals on designated free nights',
  'Personal shopping and souvenirs',
  'Gratuities for guides, drivers, and hotel staff',
];

const statItems = [
  { value: '16', label: 'Max Group Size' },
  {
    value: '6/10',
    label: 'Activity Level',
    tooltip:
      '6/10 \u2014 Moderate. Pickleball sessions are the most physically active part. Cultural activities, boat tours, and wellness days keep the overall pace accessible to all fitness levels.',
  },
  { value: '10\u201312', label: 'Hrs. of Instruction' },
  { value: '10\u201314', label: 'Hrs. of Social Play' },
];

export function TripDetailsSection() {
  return (
    <div className="space-y-10">
      {/* Stat Bar */}
      <StatBar items={statItems} />

      {/* What's Included */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          What&apos;s Included
        </h3>
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
      </div>

      {/* Extras (Not Included) */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Extras (Not Included)
        </h3>
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
      </div>
    </div>
  );
}
