'use client';

import { StatBar } from '@/components/trips/stat-bar';

interface Session {
  number: number;
  city: string;
  venue: string;
  time: string;
  description: string;
}

const sessions: Session[] = [
  {
    number: 1,
    city: 'Bangkok',
    venue: 'SukSpace',
    time: 'Morning',
    description:
      'Assessment, warm-up, round-robin \u2014 meet the group and find your level',
  },
  {
    number: 2,
    city: 'Bangkok',
    venue: 'SukSpace',
    time: 'Evening',
    description:
      'Structured doubles, skill mixing \u2014 play with different partners',
  },
  {
    number: 3,
    city: 'Bangkok',
    venue: 'SukSpace',
    time: 'Morning',
    description:
      'Tournament day \u2014 king of the court, competitive brackets',
  },
  {
    number: 4,
    city: 'Chiang Mai',
    venue: 'BokBok',
    time: 'Afternoon',
    description:
      'Skill clinics \u2014 dinking, third-shot drops, stacking strategy',
  },
  {
    number: 5,
    city: 'Chiang Mai',
    venue: 'BokBok',
    time: 'Morning',
    description: 'Competitive bracket tournament',
  },
  {
    number: 6,
    city: 'Phuket',
    venue: 'Peak Racquet Park',
    time: 'Morning',
    description: 'Final championship, awards ceremony, group photo',
  },
];

const statItems = [
  { value: '6', label: 'Total Sessions' },
  { value: '~15 hrs', label: 'Total Court Time' },
  { value: '8\u201310 hrs', label: 'Instruction' },
  { value: '8\u201312 hrs', label: 'Social Play' },
];

function getCityColor(city: string): string {
  switch (city) {
    case 'Bangkok':
      return 'bg-[#1D2D44] text-white';
    case 'Chiang Mai':
      return 'bg-[#B08D55] text-white';
    case 'Phuket':
      return 'bg-emerald-600 text-white';
    default:
      return 'bg-[#1D2D44] text-white';
  }
}

export function PickleballSection() {
  return (
    <div className="space-y-10">
      {/* Intro */}
      <p className="text-[#1D2D44]/70 text-base leading-relaxed max-w-3xl">
        6 sessions across 3 cities. Each session blends structured instruction
        with social play, so you&apos;re improving your game and meeting your
        travel crew at the same time.
      </p>

      {/* Stat Bar */}
      <StatBar items={statItems} />

      {/* Session Breakdown */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-[#1D2D44] mb-6">
          Session Breakdown
        </h3>
        <div className="space-y-3">
          {sessions.map((session) => (
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
                    {session.time}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[#1D2D44]/75 leading-relaxed sm:border-l sm:border-[#B08D55]/15 sm:pl-5">
                {session.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
