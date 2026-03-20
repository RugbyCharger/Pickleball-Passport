'use client';

import { MapPin, Clock } from 'lucide-react';

interface Hotel {
  name: string;
  city: string;
  location: string;
  duration: string;
  highlights: string[];
}

const hotels: Hotel[] = [
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
    duration: '4 Nights',
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

export function AccommodationsSection() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        Every property is independently owned, locally rooted, and handpicked
        for its character, wellness amenities, and proximity to our pickleball
        venues. No chains. No corporate lobbies. These are places you can&apos;t
        find at home.
      </p>

      {/* Hotel Cards */}
      <div className="space-y-6">
        {hotels.map((hotel, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#1D2D44]">
                  {hotel.name}
                </h4>
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

            {/* Highlights */}
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
