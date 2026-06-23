'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, X, ArrowRight, Calendar, MapPin, Users, Clock } from 'lucide-react';

/* ─────────────────────── ITINERARY ─────────────────────── */

const itinerary = [
  {
    day: 'Day 1',
    label: 'Sunday',
    title: 'Bangkok → Hua Hin',
    details: 'Private van transfer from Bangkok (~3 hours). Check in to Our 5-Star Hua Hin Beachfront Resort. Afternoon at the beach.',
  },
  {
    day: 'Day 2',
    label: 'Monday',
    title: 'Pickleball + Culture',
    details: 'Pickleball Session 1 with BK at Sports Life Hua Hin (13 courts). Cultural program in the afternoon.',
  },
  {
    day: 'Day 3',
    label: 'Tuesday',
    title: 'Free Day',
    details: 'Beach, spa, explore Hua Hin, or visit the night market. No agenda, make it your own.',
  },
  {
    day: 'Day 4',
    label: 'Wednesday',
    title: 'ProAM + Farewell Dinner',
    details: 'Pickleball Session 2 with BK, including the ProAM: you play doubles alongside the pro. Farewell group dinner.',
  },
  {
    day: 'Day 5',
    label: 'Thursday',
    title: 'Check Out',
    details: 'Breakfast at the resort. Private van back to Bangkok Suvarnabhumi Airport (BKK). Fly home.',
  },
];

/* ─────────────────────── INCLUDED ─────────────────────── */

const included = [
  '4 nights at Our 5-Star Hua Hin Beachfront Resort (Garden View Room, daily breakfast)',
  '2 pickleball sessions with BK at Sports Life Hua Hin',
  'Private van transfer Bangkok → Hua Hin and return',
  'Cultural program',
  'Farewell group dinner',
  'Host support throughout',
];

const notIncluded = [
  'International flights',
  'Travel insurance',
  'Lunches',
  'Alcoholic beverages',
  'Single room supplement ($600)',
  'Bangkok accommodation (book the Bangkok Weekend or arrange your own)',
];

/* ─────────────────────── DEPARTURES ─────────────────────── */

const departures = [
  { month: 'July 2026', note: 'With BK Karunakaran', featured: true },
  { month: 'August 2026', note: null, featured: false },
  { month: 'September 2026', note: null, featured: false },
  { month: 'October 2026', note: null, featured: false },
  { month: 'November 2026', note: null, featured: false },
  { month: 'December 2026', note: null, featured: false },
];

/* ─────────────────────── PAGE ─────────────────────── */

export default function HuaHinEscapePage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/anantara-hua-hin.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/tpp-aerial-0453b.mp4" type="video/mp4" />
        </video>
        <a
          href="https://www.instagram.com/micahphotography1"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 z-10 text-white/40 hover:text-white/70 transition-colors text-xs tracking-wide"
        >
          Aerial footage: @micahphotography1
        </a>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/80" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#B08D55] mb-3">
            Hua Hin · 4 Nights / 5 Days
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Hua Hin Pickleball<br className="hidden sm:block" /> Escape
          </h1>
          <p className="text-xl text-white/75 mb-2">Our 5-Star Hua Hin Beachfront Resort · 2 Sessions with BK</p>
          <p className="text-3xl font-bold text-white mb-8">
            $2,488 <span className="text-lg font-normal text-white/50">/person</span>
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Clock className="h-4 w-4 text-[#B08D55]" />
              4 nights · 5 days
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <MapPin className="h-4 w-4 text-[#B08D55]" />
              Our 5-Star Hua Hin Beachfront Resort
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Users className="h-4 w-4 text-[#B08D55]" />
              2 sessions + ProAM
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="#itinerary"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
            >
              See What's Included
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://link.fastpaydirect.com/payment-link/6a1ed4e503b17c94f5714208"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Book Hua Hin · $2,488
            </a>
          </div>
          <p className="text-xs text-white/40 mt-3">
            Questions? <a href="https://wa.me/15125648522" target="_blank" rel="noopener noreferrer" className="text-[#B08D55] hover:underline">Message us on WhatsApp</a>
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32C840 34 960 40 1080 43C1200 46 1320 46 1380 46L1440 46V60H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* ── Coming from Bangkok Weekend? ── */}
      <section className="py-5 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F5E6D3] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#B08D55] flex-shrink-0 mt-2" />
            <p className="text-sm text-[#1D2D44]/75">
              <span className="font-semibold text-[#1D2D44]">Already booked the Bangkok Weekend?</span>{' '}
              Your van from Bangkok to Hua Hin is included. Just keep going.
            </p>
          </div>
        </div>
      </section>

      {/* ── Value comparison ── */}
      <section className="py-4 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1D2D44] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm">Bangkok ($1,488) + Hua Hin ($2,488) booked separately = <span className="line-through text-white/40">$3,976</span></p>
              <p className="text-white font-semibold mt-1">The full 9-day trip is <span className="text-[#B08D55] font-bold">$3,888</span>  ·  less money, both cities, more included.</p>
            </div>
            <Link
              href="/trips/bangkok-hua-hin/july-16-2026"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm whitespace-nowrap shrink-0"
            >
              Book Full Trip  ·  $3,888
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Itinerary ── */}
      <section id="itinerary" className="py-12 sm:py-16 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-8">
            Day by Day
          </h2>
          <div className="space-y-4">
            {itinerary.map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1D2D44] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#B08D55] text-xs font-bold">{i + 1}</span>
                  </div>
                  {i < itinerary.length - 1 && <div className="w-px flex-1 bg-[#B08D55]/20 mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#B08D55] mb-0.5">{item.day} · {item.label}</p>
                  <p className="font-serif font-bold text-[#1D2D44] text-lg mb-1">{item.title}</p>
                  <p className="text-[#1D2D44]/60 text-sm leading-relaxed">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Included / Not Included ── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <h3 className="font-serif font-bold text-[#1D2D44] text-xl mb-5">What's Included</h3>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-[#B08D55] flex-shrink-0 mt-0.5" />
                    <span className="text-[#1D2D44]/75 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#1D2D44] text-xl mb-5">Not Included</h3>
              <ul className="space-y-3">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-[#1D2D44]/30 flex-shrink-0 mt-0.5" />
                    <span className="text-[#1D2D44]/50 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Departures ── */}
      <section className="py-12 sm:py-16 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-2">
            2026 Departures
          </h2>
          <p className="text-[#1D2D44]/50 text-sm mb-6">Double occupancy. Single supplement $600.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {departures.map((dep) => (
              <div
                key={dep.month}
                className={`rounded-xl border p-4 ${dep.featured ? 'bg-[#0F1A2A] border-[#B08D55]/40' : 'bg-white border-[#B08D55]/10'}`}
              >
                <span className={`text-sm font-serif font-bold ${dep.featured ? 'text-white' : 'text-[#1D2D44]'}`}>
                  {dep.month}
                </span>
                {dep.note && <p className="text-xs text-[#B08D55] mt-0.5">{dep.note}</p>}
                {!dep.note && <p className={`text-xs mt-0.5 ${dep.featured ? 'text-white/35' : 'text-[#1D2D44]/35'}`}>Dates confirmed on booking</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Book ── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-6">Book Your Spot</h2>
          <a
            href="https://link.fastpaydirect.com/payment-link/6a1ed4e503b17c94f5714208"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-base shadow-lg shadow-[#B08D55]/25 hover:shadow-xl transition-all"
          >
            Book Hua Hin · $2,488
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-xs text-[#1D2D44]/35 mt-4">
            Questions? <a href="https://wa.me/15125648522" className="text-[#B08D55] hover:underline">Message us on WhatsApp</a>.
          </p>
        </div>
      </section>

      {/* ── Upsell to Bangkok / Full Trip ── */}
      <section className="py-10 bg-[#0F1A2A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/50 text-sm mb-1">Haven't booked Bangkok yet?</p>
            <p className="text-white font-serif font-bold text-xl">Add the Bangkok Weekend  ·  $1,488</p>
            <p className="text-white/40 text-sm">3 nights at the hotel · 2 more sessions with BK</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/trips/bangkok-weekend"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              View Bangkok Weekend
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/trips/bangkok-hua-hin/july-16-2026"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm"
            >
              Book Full 9-Day Trip  ·  $3,888
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
