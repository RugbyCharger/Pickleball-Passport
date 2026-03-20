'use client';

import { CheckCircle, Utensils } from 'lucide-react';

interface GroupDinner {
  city: string;
  label: string;
  restaurant: string;
  description: string;
}

interface MichelinUpgrade {
  name: string;
  detail: string;
  description: string;
  city: string;
  priceTHB: string;
  priceUSD: string;
}

const groupDinners: GroupDinner[] = [
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
    description:
      'Michelin Bib Gourmand, traditional Lanna wooden house',
  },
  {
    city: 'Chiang Mai',
    label: 'Chiang Mai Signature',
    restaurant: 'Huan Soontaree',
    description:
      'Riverside Northern Thai with live folk music by the owner',
  },
  {
    city: 'Hua Hin',
    label: 'Hua Hin Closing',
    restaurant: 'Curated local experience',
    description:
      'Beachside dining featuring fresh Thai seafood',
  },
];

const michelinUpgrades: MichelinUpgrade[] = [
  {
    name: 'Canvas',
    detail: '1 star, Bangkok',
    description: '18-course tasting menu.',
    city: 'Bangkok',
    priceTHB: '~4,500 THB',
    priceUSD: '~$130',
  },
  {
    name: 'S\u00fchring',
    detail: '2 stars, Bangkok',
    description: 'Modern German by twin chefs in a garden villa.',
    city: 'Bangkok',
    priceTHB: '~6,000 THB',
    priceUSD: '~$175',
  },
  {
    name: 'Gaa',
    detail: '2 stars, Bangkok',
    description: 'Indian-Thai fusion by Chef Garima Arora.',
    city: 'Bangkok',
    priceTHB: '~5,000 THB',
    priceUSD: '~$145',
  },
  {
    name: 'Kiti Panit',
    detail: 'Michelin-recommended, Chiang Mai',
    description: '130-year-old teak mansion.',
    city: 'Chiang Mai',
    priceTHB: '~500 THB',
    priceUSD: '~$15',
  },
];

export function DiningSection() {
  return (
    <div className="space-y-10">
      {/* Intro */}
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Thailand has 43 Michelin-starred restaurants. We&apos;ll introduce you
        to the best, from 200-baht street food legends to Michelin-star
        tasting menus. Five group dinners are included; optional upgrades
        available.
      </p>

      {/* Included Group Dinners */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Included Group Dinners
        </h3>
        <div className="space-y-4">
          {groupDinners.map((dinner, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#1D2D44]">
                    {dinner.label}:
                  </span>
                  <span className="text-sm text-[#1D2D44]/80">
                    {dinner.restaurant}
                  </span>
                  <span className="text-xs text-[#1D2D44]/50">
                    - {dinner.description}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Michelin Dining Upgrades */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Optional Michelin Dining Upgrades
        </h3>
        <div className="space-y-4">
          {michelinUpgrades.map((upgrade, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3"
            >
              <Utensils className="w-4 h-4 text-[#B08D55]/50 flex-shrink-0 mt-1" />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <div>
                  <span className="text-sm font-semibold text-[#1D2D44]">
                    {upgrade.name}
                  </span>
                  <span className="text-xs text-[#1D2D44]/50 ml-1.5">
                    ({upgrade.detail})
                  </span>
                </div>
                <span className="text-xs text-[#1D2D44]/50">
                  {upgrade.description}
                </span>
                <span className="text-xs font-medium text-[#1D2D44]/40">
                  {upgrade.priceTHB} / {upgrade.priceUSD}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Night Note */}
      <div className="bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10 p-5">
        <p className="text-sm text-[#1D2D44]/60 leading-relaxed">
          Several evenings are designated as free nights. Your chance to
          explore on your own. Your trip host will share curated recommendations
          for every city, from night markets and rooftop bars to hidden local
          spots.
        </p>
      </div>
    </div>
  );
}
