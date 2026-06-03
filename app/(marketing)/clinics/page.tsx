'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, MapPin, Users, Clock, Calendar, ArrowRight, QrCode } from 'lucide-react';

/* ─────────────────────── VENUES ─────────────────────── */

const TOTAL_SPOTS = 12;

const venues = [
  {
    name: 'The Peninsula Bangkok',
    subtitle: 'Arise Pickleball',
    courts: '3 courts',
    capacity: '12 spots per session',
    note: 'Small-group coaching at a five-star hotel.',
    image: '/images/sterling-pickleball.jpg',
  },
  {
    name: 'Sterling / Papaya',
    subtitle: 'Pick-a-Court Bangkok',
    courts: 'Multiple courts',
    capacity: '12 spots per session',
    note: 'Coaching clinic in the heart of Bangkok.',
    image: '/images/jaron-sterling.jpg',
  },
  {
    name: 'Sports Life Hua Hin',
    subtitle: "Hua Hin's biggest facility",
    courts: '13 courts (8 new)',
    capacity: '12 spots per session',
    note: "Right in the expat hub. Thailand's best pickleball setup.",
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
  },
];

/* ─────────────────────── JULY DATES ─────────────────────── */

const julyDates = [
  { date: 'Fri Jul 17', venue: 'Peninsula Bangkok (Arise)', spotsLeft: 10, link: 'https://link.fastpaydirect.com/payment-link/6a1e819203b17c94f571411a' },
  { date: 'Sat Jul 18', venue: 'Sterling / Papaya, Bangkok', spotsLeft: 11, link: 'https://link.fastpaydirect.com/payment-link/6a1e80d403b17c94f5714119' },
  { date: 'Mon Jul 20', venue: 'Sports Life Hua Hin', spotsLeft: 11, link: 'https://link.fastpaydirect.com/payment-link/6a1e81c003b17c94f571411b' },
  { date: 'Wed Jul 22', venue: 'Sports Life Hua Hin', spotsLeft: 10, link: 'https://link.fastpaydirect.com/payment-link/6a1e81c003b17c94f571411b' },
];

/* ─────────────────────── WHAT'S INCLUDED ─────────────────────── */

const included = [
  'Coaching clinic: technique, strategy, and game sense',
  'Structured drills and match play',
  'ProAM: play doubles alongside BK',
  'Water and refreshments',
];

/* ─────────────────────── PAGE ─────────────────────── */

export default function ClinicsPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Hero ── */}
      <section className="bg-[#0F1A2A] text-white py-16 sm:py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — copy */}
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-3">
                Day Clinics · Bangkok & Hua Hin
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Drop-In Pickleball<br className="hidden sm:block" /> Clinics with BK
              </h1>
              <p className="text-xl text-white/70 mb-8 max-w-2xl">
                3 hours. Coaching, drills, and you play alongside a PPR Certified Pro. $125 · 12 spots per session.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <Clock className="h-4 w-4 text-[#B08D55]" />
                  3 hours per session
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#B08D55]" />
                  Bangkok &amp; Hua Hin
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                  <Users className="h-4 w-4 text-[#B08D55]" />
                  12 spots per session
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#dates"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
                >
                  See July Dates
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/15125648522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  Have Questions? Message Us
                </a>
              </div>
            </div>

            {/* Right — BK action photo */}
            <div className="relative hidden lg:block">
              <div className="relative h-[480px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/bk1.jpg"
                  alt="BK Karunakaran pickleball coaching"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 0px, 500px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2A]/60 via-transparent to-transparent" />
              </div>
              <p className="mt-2 text-xs text-white/30 text-center">Bharat "BK" Karunakaran · PPR Certified Pro Coach</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-6">
            What You Get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
                <span className="text-[#1D2D44]/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Venues ── */}
      <section className="py-12 sm:py-16 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
            Venues
          </h2>
          <p className="text-[#1D2D44]/50 text-sm mb-8">
            Sessions run at three locations. Choose based on the date and city you're in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((v) => (
              <div key={v.name} className="bg-white rounded-2xl border border-[#B08D55]/10 overflow-hidden shadow-sm">
                <div className="relative h-44">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-serif font-bold text-base leading-tight">{v.name}</p>
                    <p className="text-white/70 text-xs">{v.subtitle}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#1D2D44]/70">
                    <MapPin className="w-3.5 h-3.5 text-[#B08D55]" />
                    {v.courts}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#1D2D44]/70">
                    <Users className="w-3.5 h-3.5 text-[#B08D55]" />
                    {v.capacity}
                  </div>
                  <p className="text-sm text-[#1D2D44]/60 pt-1">{v.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── July Dates ── */}
      <section id="dates" className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
            July 2026 Dates
          </h2>
          <p className="text-[#1D2D44]/50 text-sm mb-8">
            These sessions run during the July 16–24 BK Karunakaran departure. Join for the day. No trip required.
          </p>

          <div className="space-y-3 mb-8">
            {julyDates.map((d) => {
              const taken = TOTAL_SPOTS - d.spotsLeft;
              const pct = Math.round((taken / TOTAL_SPOTS) * 100);
              return (
                <div
                  key={d.date}
                  className="bg-[#FDF8F3] rounded-xl border border-[#B08D55]/10 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#B08D55]" />
                        <span className="font-semibold text-[#1D2D44] text-sm">{d.date}</span>
                      </div>
                      <span className="text-[#1D2D44]/60 text-sm">{d.venue}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 self-start sm:self-auto">
                      <a
                        href={d.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-[#1D2D44] text-white text-xs font-semibold hover:bg-[#1D2D44]/80 transition-colors whitespace-nowrap"
                      >
                        Book · $125
                      </a>
                      <span className="text-xs text-[#1D2D44]/40">฿4,000 via PromptPay</span>
                    </div>
                  </div>
                  {/* Availability bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#1D2D44]">
                        {d.spotsLeft} of {TOTAL_SPOTS} spots remaining
                      </span>
                      {d.spotsLeft <= 4 && (
                        <span className="text-xs font-bold text-amber-600">Almost full</span>
                      )}
                    </div>
                    <div className="h-1.5 w-full bg-[#1D2D44]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#B08D55] to-[#CFB78D] rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinic Pass upsell */}
          <div className="bg-[#0F1A2A] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#B08D55] mb-1">Better value</p>
              <p className="text-white font-serif font-bold text-xl">Clinic Pass: All 4 Sessions</p>
              <p className="text-white/60 text-sm mt-1">All four July clinics for $400. Save $100 vs. booking individually.</p>
            </div>
            <a
              href="https://link.fastpaydirect.com/payment-link/6a1e830d5a9093aac76c58f0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm whitespace-nowrap shrink-0"
            >
              Get the Clinic Pass · $400
            </a>
          </div>
        </div>
      </section>

      {/* ── PromptPay QR (Thailand local payments) ── */}
      <section className="py-12 sm:py-16 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-xl bg-[#FDF8F3] border-2 border-dashed border-[#B08D55]/30">
              <QrCode className="w-10 h-10 text-[#B08D55]/40" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#B08D55] mb-1">
                Paying in Thailand? ชำระเงินในไทย
              </p>
              <h3 className="font-serif text-xl font-bold text-[#1D2D44] mb-2">
                PromptPay: No Stripe Fees
              </h3>
              <p className="text-[#1D2D44]/60 text-sm leading-relaxed mb-3">
                If you're based in Thailand, scan the QR code below to pay via PromptPay, standard Thai bank transfer, zero international fees. Screenshot it and go.
              </p>
              <p className="text-sm font-semibold text-[#1D2D44]">
                ฿4,000 per session &nbsp;·&nbsp; ฿13,000 for the Clinic Pass (all 4 sessions)
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-[#B08D55]/10 p-6 flex flex-col items-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64">
              <Image
                src="/images/promptpay-qr.jpg"
                alt="PromptPay QR code — Jaron Dhillon Shoptaugh"
                fill
                className="object-contain"
                sizes="256px"
              />
            </div>
            <p className="text-xs text-[#1D2D44]/40 mt-3">
              PromptPay · Jaron Dhillon Shoptaugh · Screenshot and scan in any Thai banking app
            </p>
          </div>
        </div>
      </section>

      {/* ── Social photo ── */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <Image
          src="/images/bk2.jpg"
          alt="BK Karunakaran in action"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </section>

      {/* ── Upsell to full experience ── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-2">
            Want the full experience?
          </h2>
          <p className="text-[#1D2D44]/60 mb-8">
            A clinic gets you on the court with BK for a day. The trips get you 3–9 days of pickleball, five-star hotels, group dinners, and cultural experiences.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/trips/bangkok-weekend"
              className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-5 hover:border-[#B08D55]/30 hover:shadow-md transition-all group"
            >
              <p className="text-xs font-bold tracking-widest uppercase text-[#B08D55] mb-1">3 Nights</p>
              <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">Bangkok Weekend</p>
              <p className="text-[#1D2D44]/50 text-sm mb-3">Peninsula Bangkok · 2 sessions with BK</p>
              <p className="font-bold text-[#1D2D44]">$1,488 <span className="text-sm font-normal text-[#1D2D44]/40">/person</span></p>
              <div className="flex items-center gap-1 mt-3 text-[#B08D55] text-sm font-semibold group-hover:gap-2 transition-all">
                View details <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/trips/hua-hin-escape"
              className="bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/10 p-5 hover:border-[#B08D55]/30 hover:shadow-md transition-all group"
            >
              <p className="text-xs font-bold tracking-widest uppercase text-[#B08D55] mb-1">4 Nights</p>
              <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">Hua Hin Escape</p>
              <p className="text-[#1D2D44]/50 text-sm mb-3">Anantara Hua Hin · 2 sessions with BK</p>
              <p className="font-bold text-[#1D2D44]">$2,488 <span className="text-sm font-normal text-[#1D2D44]/40">/person</span></p>
              <div className="flex items-center gap-1 mt-3 text-[#B08D55] text-sm font-semibold group-hover:gap-2 transition-all">
                View details <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/trips/bangkok-hua-hin/july-16-2026"
              className="bg-[#0F1A2A] rounded-2xl border border-[#B08D55]/30 p-5 hover:border-[#B08D55]/60 hover:shadow-md transition-all group"
            >
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#B08D55] text-white text-xs font-bold mb-2">
                BEST VALUE
              </div>
              <p className="font-serif font-bold text-white text-lg mb-1">Full 9-Day Trip</p>
              <p className="text-white/50 text-sm mb-3">Both cities · 4 sessions with BK · 8 nights</p>
              <p className="font-bold text-white">$3,888 <span className="text-sm font-normal text-white/40">/person</span></p>
              <div className="flex items-center gap-1 mt-3 text-[#B08D55] text-sm font-semibold group-hover:gap-2 transition-all">
                View details <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          <p className="text-xs text-[#1D2D44]/40 mt-4 text-center">
            Bangkok ($1,488) + Hua Hin ($2,488) separately = $3,976. The full 9-day trip is $3,888 and includes more.
          </p>
        </div>
      </section>

    </main>
  );
}
