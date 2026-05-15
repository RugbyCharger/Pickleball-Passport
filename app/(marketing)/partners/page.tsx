import { Sun, Globe } from 'lucide-react';
import Link from 'next/link';

interface Partner {
  name: string;
  handle: string;
  category: string;
  bio: string;
  siteUrl: string;
  siteName: string;
  imagePlaceholder: string;
}

const partners: Partner[] = [
  {
    name: 'Bharat "BK" Karunakaran',
    handle: '@bk_pickleball',
    category: 'Pro Player & Content Creator',
    bio: 'BK is a Professional Pickleball Player and Content Creator based in Orlando, FL — originally from Chennai, India. A former USTA National Coordinator turned full-time pro, he competes on the APP and PPA circuits, won the inaugural All Florida Pro League, and runs the instructional channel BK Pickleball. He joins us for the July 16 Bangkok + Hua Hin trip.',
    siteUrl: 'https://www.bk-pickleball.com',
    siteName: 'bk-pickleball.com',
    imagePlaceholder: 'BK',
  },
  {
    name: 'Neil',
    handle: 'The Dinking Dad',
    category: 'Content Creator',
    bio: 'Bio coming soon — check back for the full story on Neil and his connection to The Pickleball Passport.',
    siteUrl: '#',
    siteName: 'The Dinking Dad',
    imagePlaceholder: 'Neil',
  },
  {
    name: 'Travis',
    handle: 'Mind Your Pickle',
    category: 'Content Creator',
    bio: 'Bio coming soon — check back for the full story on Travis and his connection to The Pickleball Passport.',
    siteUrl: '#',
    siteName: 'Mind Your Pickle',
    imagePlaceholder: 'Travis',
  },
];

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 overflow-hidden flex flex-col">
      {/* Photo / Logo area */}
      <div className="h-56 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] flex items-center justify-center">
        <span className="text-5xl font-serif font-bold text-white/40">
          {partner.imagePlaceholder}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Category tag */}
        <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold uppercase tracking-wide mb-3">
          {partner.category}
        </span>

        {/* Name + handle */}
        <h3 className="text-2xl font-serif font-bold text-[#1D2D44] leading-tight">{partner.name}</h3>
        <p className="text-sm font-medium text-[#1D2D44]/50 mb-3">{partner.handle}</p>

        {/* Bio */}
        <p className="text-[#1D2D44]/70 text-sm leading-relaxed flex-1 mb-5">{partner.bio}</p>

        {/* Link */}
        {partner.siteUrl !== '#' && (
          <Link
            href={partner.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
          >
            <Globe className="w-4 h-4" />
            {partner.siteName}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sun className="w-4 h-4 text-[#B08D55]" />
              The Pickleball Passport Partners
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Our Partners
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              The creators, pros, and personalities who bring The Pickleball Passport to their communities around the world.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Partner grid */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {partners.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
