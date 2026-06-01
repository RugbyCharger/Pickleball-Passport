'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Star } from 'lucide-react';

/* ─────────────────────── DATA ─────────────────────── */

const routeA = [
  { num: 1, depart: 'Thu Jun 18', ret: 'Fri Jun 26', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
  { num: 3, depart: 'Thu Jul 16', ret: 'Fri Jul 24', price: 3888, status: 'Featured: BK', href: '/trips/bangkok-hua-hin/july-16-2026', featured: true },
  { num: 5, depart: 'Thu Aug 13', ret: 'Fri Aug 21', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
  { num: 7, depart: 'Thu Sep 10', ret: 'Fri Sep 18', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
  { num: 9, depart: 'Thu Oct 8', ret: 'Fri Oct 16', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
  { num: 11, depart: 'Thu Nov 5', ret: 'Fri Nov 13', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
  { num: 13, depart: 'Thu Dec 3', ret: 'Fri Dec 11', price: 3888, status: 'Open', href: '/trips/bangkok-hua-hin' },
];

const routeB = [
  { num: 2, depart: 'Thu Jul 2', ret: 'Fri Jul 10', price: 3888, status: 'Open', href: '/trips/bangkok-chiang-mai' },
  { num: 4, depart: 'Thu Jul 30', ret: 'Fri Aug 7', price: 3888, status: 'Open', href: '/trips/bangkok-chiang-mai' },
  { num: 6, depart: 'Thu Aug 27', ret: 'Fri Sep 4', price: 3888, status: 'Open', href: '/trips/bangkok-chiang-mai' },
  { num: 8, depart: 'Thu Sep 24', ret: 'Fri Oct 2', price: 3888, status: 'Open', href: '/trips/bangkok-chiang-mai' },
  { num: 10, depart: 'Thu Oct 22', ret: 'Fri Oct 30', price: 3888, status: 'Open', href: '/trips/bangkok-chiang-mai' },
  { num: 12, depart: 'Thu Nov 19', ret: 'Fri Nov 27', price: 5688, status: 'Loy Krathong', href: '/trips/loy-krathong', special: true },
  { num: 14, depart: 'Thu Dec 17', ret: 'Fri Dec 25', price: 4860, status: 'Peak Season', href: '/trips/bangkok-chiang-mai' },
  { num: 15, depart: 'Wed Jan 14', ret: 'Wed Jan 22', price: 4860, status: '8 spots left', href: '/trips/bangkok-chiang-mai/january-14-2027' },
];

const segments = [
  { product: 'Bangkok Weekend', price: 1488, dates: 'Jul 16–19 / Aug 13–16 / Sep 10–13 / Oct 8–11 / Nov 5–8 / Dec 3–6', href: '/trips/bangkok-weekend' },
  { product: 'Hua Hin Escape', price: 2488, dates: 'Jul 19–23 / Aug 16–20 / Sep 13–17 / Oct 11–15 / Nov 8–12 / Dec 6–10', href: '/trips/hua-hin-escape' },
];

const clinicDates = [
  { date: 'Fri Jul 17', venue: 'Sterling / Papaya, Bangkok', spots: 20 },
  { date: 'Sat Jul 18', venue: 'Peninsula Bangkok (Arise)', spots: 10 },
  { date: 'Mon Jul 20', venue: 'Sports Life Hua Hin', spots: 20 },
  { date: 'Wed Jul 22', venue: 'Sports Life Hua Hin', spots: 20 },
];

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
            Every departure, every product. Full trips, segment options, and day clinics in one place.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">

        {/* ── Route A ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Route A: Bangkok + Hua Hin</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">9 days / 8 nights · Peninsula Bangkok + Anantara Hua Hin · from $3,888/person</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#B08D55]/15">
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Depart</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Return</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Price</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Status</th>
                  <th className="py-2.5" />
                </tr>
              </thead>
              <tbody>
                {routeA.map((row) => (
                  <tr key={row.num} className={`border-b border-[#B08D55]/10 ${row.featured ? 'bg-[#B08D55]/5' : ''}`}>
                    <td className="py-3 pr-4 font-medium text-[#1D2D44]">
                      {row.featured && <Star className="w-3 h-3 text-[#B08D55] inline mr-1.5 -mt-0.5" />}
                      {row.depart}
                    </td>
                    <td className="py-3 pr-4 text-[#1D2D44]/60">{row.ret}</td>
                    <td className="py-3 pr-4 font-semibold text-[#1D2D44]">${row.price.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.featured ? 'bg-[#B08D55] text-white' : 'bg-[#1D2D44]/8 text-[#1D2D44]/60'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={row.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Route B ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Route B: Bangkok + Chiang Mai</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">9 days / 8 nights · Peninsula Bangkok + Anantara Chiang Mai · price varies by season</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#B08D55]/15">
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Depart</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Return</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Price</th>
                  <th className="text-left py-2.5 pr-4 text-xs font-semibold text-[#1D2D44]/40 uppercase tracking-wider">Status</th>
                  <th className="py-2.5" />
                </tr>
              </thead>
              <tbody>
                {routeB.map((row) => (
                  <tr key={row.num} className={`border-b border-[#B08D55]/10 ${row.special ? 'bg-[#B08D55]/5' : ''}`}>
                    <td className="py-3 pr-4 font-medium text-[#1D2D44]">{row.depart}</td>
                    <td className="py-3 pr-4 text-[#1D2D44]/60">{row.ret}</td>
                    <td className="py-3 pr-4 font-semibold text-[#1D2D44]">${row.price.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.special ? 'bg-[#B08D55] text-white' :
                        row.status === '8 spots left' ? 'bg-amber-100 text-amber-700' :
                        row.status === 'Peak Season' ? 'bg-[#1D2D44]/10 text-[#1D2D44]/70' :
                        'bg-[#1D2D44]/8 text-[#1D2D44]/60'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={row.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Segment options ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Segment Options</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">Join just Bangkok or just Hua Hin. Dates align with the full trip legs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {segments.map((s) => (
              <div key={s.product} className="bg-white rounded-2xl border border-[#B08D55]/10 p-5">
                <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">{s.product}</p>
                <p className="text-2xl font-bold text-[#1D2D44] mb-2">${s.price.toLocaleString()} <span className="text-sm font-normal text-[#1D2D44]/40">/person</span></p>
                <p className="text-xs text-[#1D2D44]/50 mb-4">{s.dates}</p>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
                >
                  View details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#1D2D44] rounded-xl px-5 py-4">
            <p className="text-white/60 text-sm">Bangkok ($1,488) + Hua Hin ($2,488) = <span className="line-through text-white/30">$3,976</span>. &nbsp;The full 9-day trip is <span className="text-[#B08D55] font-bold">$3,888</span> and includes more.</p>
          </div>
        </div>

        {/* ── Day Clinics ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44]">Day Clinics: July 2026</h2>
            <p className="text-[#1D2D44]/50 text-sm mt-0.5">Drop-in sessions with BK. $100 per session. No trip required.</p>
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
                  <Link
                    href="/clinics"
                    className="text-xs font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
                  >
                    Book · $100 →
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
