'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Star } from 'lucide-react';

/* ─────────────────────── DATA ─────────────────────── */

const routeA = [
  { month: 'July 2026', price: 3888, label: 'With BK Karunakaran', featured: true, href: '/trips/bangkok-hua-hin/july-16-2026' },
  { month: 'August 2026', price: 3888, label: null, featured: false, href: null },
  { month: 'September 2026', price: 3888, label: null, featured: false, href: null },
  { month: 'October 2026', price: 3888, label: null, featured: false, href: null },
  { month: 'November 2026', price: 3888, label: null, featured: false, href: null },
  { month: 'December 2026', price: 3888, label: null, featured: false, href: null },
];

const routeB = [
  { month: 'July 2026', price: 3888, label: null, special: false, href: null },
  { month: 'August 2026', price: 3888, label: null, special: false, href: null },
  { month: 'September 2026', price: 3888, label: null, special: false, href: null },
  { month: 'October 2026', price: 3888, label: null, special: false, href: null },
  { month: 'November 2026', price: 5688, label: 'Loy Krathong Festival', special: true, href: '/trips/loy-krathong' },
  { month: 'December 2026', price: 4860, label: 'Peak Season', special: false, href: null },
  { month: 'January 2027', price: 4860, label: 'Phuket Extension available', special: false, href: '/trips/bangkok-chiang-mai/january-14-2027' },
];

const clinicDates = [
  { date: 'Fri Jul 17', venue: 'Sterling / Papaya, Bangkok', spots: 12 },
  { date: 'Sat Jul 18', venue: 'Peninsula Bangkok (Arise)', spots: 12 },
  { date: 'Mon Jul 20', venue: 'Sports Life Hua Hin', spots: 12 },
  { date: 'Wed Jul 22', venue: 'Sports Life Hua Hin', spots: 12 },
];

/* ─────────────────────── MONTH CARD ─────────────────────── */

function MonthCard({
  month, price, label, featured, special, href,
}: {
  month: string; price: number; label: string | null;
  featured?: boolean; special?: boolean; href: string | null;
}) {
  const highlight = featured || special;
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${highlight ? 'bg-[#FDF8F3] border-[#B08D55]/30' : 'bg-white border-[#B08D55]/10'}`}>
      <div>
        {featured && (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#B08D55] mb-1">
            <Star className="w-3 h-3" /> Featured
          </div>
        )}
        <p className="font-serif font-bold text-[#1D2D44] text-base">{month}</p>
        {label && <p className="text-xs text-[#B08D55] mt-0.5">{label}</p>}
        {!label && <p className="text-xs text-[#1D2D44]/35 mt-0.5">Dates set once your spot is reserved</p>}
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-sm font-bold text-[#1D2D44]">${price.toLocaleString()}<span className="text-xs font-normal text-[#1D2D44]/40 ml-1">/person</span></span>
        {href ? (
          <Link href={href} className="text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors flex items-center gap-1">
            Details <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <a href="https://wa.me/15125648522" target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors flex items-center gap-1">
            I'm interested <ArrowRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Header ── */}
      <section className="bg-[#0F1A2A] text-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-3">All Dates</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">2026–27 Departure Calendar</h1>
          <p className="text-white/50 text-base max-w-2xl">
            Every product, every month. Reserve your month and we'll confirm exact dates with you.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">

        {/* ── Route A ── */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Route A: Bangkok + Hua Hin</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">9 days / 8 nights · Peninsula Bangkok + Anantara Hua Hin · $3,888/person</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {routeA.map((row) => <MonthCard key={row.month} {...row} />)}
          </div>
        </div>

        {/* ── Route B ── */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Route B: Bangkok + Chiang Mai</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">9 days / 8 nights · Peninsula Bangkok + Anantara Chiang Mai · price varies by season</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {routeB.map((row) => <MonthCard key={row.month} {...row} />)}
          </div>
        </div>

        {/* ── Segment Options ── */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Segment Options</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">Join just Bangkok or just Hua Hin. Available monthly, July through December 2026.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-5">
              <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">Bangkok Weekend</p>
              <p className="text-2xl font-bold text-[#1D2D44] mb-1">$1,488 <span className="text-sm font-normal text-[#1D2D44]/40">/person</span></p>
              <p className="text-xs text-[#1D2D44]/40 mb-4">3 nights · Peninsula Bangkok · Available July–December</p>
              <Link href="/trips/bangkok-weekend" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors">
                View details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-5">
              <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">Hua Hin Escape</p>
              <p className="text-2xl font-bold text-[#1D2D44] mb-1">$2,488 <span className="text-sm font-normal text-[#1D2D44]/40">/person</span></p>
              <p className="text-xs text-[#1D2D44]/40 mb-4">4 nights · Anantara Hua Hin · Available July–December</p>
              <Link href="/trips/hua-hin-escape" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors">
                View details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="mt-4 bg-[#1D2D44] rounded-xl px-5 py-4">
            <p className="text-white/60 text-sm">Bangkok ($1,488) + Hua Hin ($2,488) = <span className="line-through text-white/30">$3,976</span>. The full 9-day trip is <span className="text-[#B08D55] font-bold">$3,888</span> and includes more.</p>
          </div>
        </div>

        {/* ── Day Clinics ── */}
        <div>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Day Clinics: July 2026</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">Drop-in sessions with BK. $125 per session. No trip required.</p>
          </div>
          <div className="space-y-3">
            {clinicDates.map((c) => (
              <div key={c.date} className="bg-white rounded-xl border border-[#B08D55]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#B08D55]" />
                    <span className="font-semibold text-[#1D2D44] text-sm">{c.date}</span>
                  </div>
                  <span className="text-[#1D2D44]/50 text-sm">{c.venue}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#1D2D44]/40">{c.spots} spots</span>
                  <Link href="/clinics" className="text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors">
                    Book · $125 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
