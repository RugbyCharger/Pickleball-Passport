import { Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Partner {
  name: string;
  credentialLine: string;
  category: string;
  bio: string;
  siteUrl: string;
  siteName: string;
  imageSrc?: string;
  imageType: 'photo' | 'logo' | 'logo-dark';
  imagePlaceholder: string;
  pullQuote?: string;
}

const partners: Partner[] = [
  {
    name: 'Bharat "BK" Karunakaran',
    credentialLine: 'Bharat "BK" Karunakaran · BK Pickleball · Pro Player & Content Creator',
    category: 'Pro Player & Content Creator',
    bio: 'Bharat "BK" Karunakaran is a Professional Pickleball Player and Content Creator based in Orlando, and a featured guest coach on TPP departures. Originally from Chennai, India, BK came up in tennis and badminton from age five, studied Sport Management at NC State, and spent three years with the USTA as National Coordinator of Junior Programs before going full-time pickleball pro in 2024. A Level 1 PPR Certified Pro with a 5.5 DUPR, BK has tournament wins over Anna Bright, Parris Todd, and multiple Top 100 PPA pros. Find him at @bk_pickleball.',
    siteUrl: 'https://www.bk-pickleball.com',
    siteName: 'bk-pickleball.com',
    imageSrc: '/bk-karunakaran.jpeg',
    imageType: 'photo',
    imagePlaceholder: 'BK',
  },
  {
    name: 'Travis Rhea',
    credentialLine: 'Travis Rhea · Mind Your Pickle · Pickleball Coach & Mental Performance Specialist',
    category: 'Coach & Mental Performance Specialist',
    bio: 'Travis Rhea is the founder of Mind Your Pickle and a 4.0 Gold Medalist with over 20 years of coaching experience across volleyball, golf, tennis, and pickleball. Raised on a farm in Northwest Kansas, his coaching is grounded in discipline, work ethic, and a deep focus on the mental side of sport. After years of watching technically gifted athletes underperform under pressure, Travis shifted his focus to mental conditioning — the visualization, routines, and self-belief that separate good players from elite ones. When Travis joins TPP departures, he leads coached sessions and mindset workshops grounded in that same philosophy.',
    pullQuote: 'The gap between good players and great ones isn\'t physical — it\'s mental.',
    siteUrl: 'https://mindyourpickle.com',
    siteName: 'mindyourpickle.com',
    imageSrc: '/Mindyourpickle.jpeg',
    imageType: 'logo-dark',
    imagePlaceholder: 'Travis',
  },
  {
    name: 'Neil Friedenberg',
    credentialLine: 'Neil Friedenberg · The Dinking Dad · Pickleball Coach & Community Builder',
    category: 'Coach & Community Builder',
    bio: 'Neil Friedenberg is the founder of The Dinking Dad, a community platform for pickleball players who take the game seriously — but not themselves. He\'s been playing and coaching since the late 1980s, with pickleball literally in his DNA: his father is Mark "Yoda" Friedenberg, USA Pickleball co-founder and inaugural Hall of Fame inductee. Equal parts family man, longtime advocate, and craft beer enthusiast, Neil built his following on the idea that pickleball is best with good company and a cold one within reach. He brings exactly that to TPP trips.',
    pullQuote: 'You can take a lot of wrong turns in life and still end up exactly where you\'re supposed to be — usually at a pickleball court.',
    siteUrl: 'https://thedinkingdad.com',
    siteName: 'thedinkingdad.com',
    imageSrc: '/dinking-dad-logo.webp',
    imageType: 'logo',
    imagePlaceholder: 'Neil',
  },
];

function PartnerCard({ partner }: { partner: Partner }) {
  const headerBg =
    partner.imageType === 'logo-dark'
      ? 'bg-[#111]'
      : partner.imageType === 'logo'
        ? 'bg-white'
        : 'bg-[#0F1A2A]';

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 overflow-hidden flex flex-col">
      {/* Image area */}
      <div className={`relative h-56 ${headerBg} flex items-center justify-center overflow-hidden`}>
        {partner.imageSrc ? (
          partner.imageType === 'photo' ? (
            <Image
              src={partner.imageSrc}
              alt={partner.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="relative w-4/5 h-4/5">
              <Image
                src={partner.imageSrc}
                alt={partner.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 80vw, 26vw"
              />
            </div>
          )
        ) : (
          <span className="text-5xl font-serif font-bold text-white/40">
            {partner.imagePlaceholder}
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Category tag */}
        <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#B08D55]/10 text-[#B08D55] text-xs font-semibold uppercase tracking-wide mb-3">
          {partner.category}
        </span>

        {/* Name */}
        <h3 className="text-2xl font-serif font-bold text-[#1D2D44] leading-tight">{partner.name}</h3>
        <p className="text-xs text-[#1D2D44]/40 mb-4 leading-snug">{partner.credentialLine}</p>

        {/* Bio */}
        <p className="text-[#1D2D44]/70 text-sm leading-relaxed flex-1 mb-4">{partner.bio}</p>

        {/* Pull quote */}
        {partner.pullQuote && (
          <blockquote className="border-l-2 border-[#B08D55] pl-3 mb-5">
            <p className="text-sm italic text-[#B08D55]">"{partner.pullQuote}"</p>
          </blockquote>
        )}

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
      <section className="relative overflow-hidden bg-[#0F1A2A] text-white py-16 sm:py-20">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              The Pickleball Passport Partners
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Our Partners
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
              The coaches, players, and community builders who bring The Pickleball Passport to their communities around the world.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3" />
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
