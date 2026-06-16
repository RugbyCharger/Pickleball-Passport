'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Calendar, MapPin, Sparkles, Star } from 'lucide-react';

const included = [
  '8 nights accommodation (Bangkok riverside hotel 3+1 nights · Our 5-Star Chiang Mai Resort 4 nights)',
  'Daily breakfast',
  '4 pickleball sessions with BK (~8–10 hrs total)',
  'Private van and driver for the full trip',
  'Welcome dinner at the riverside restaurant',
  '3–4 curated group dinners',
  'Spa session (60 min)',
  'Sunset long-tail boat cruise on the Chao Phraya',
  'Guided Wat Pho tour + Chinatown street food walk',
  'Loy Krathong festival experience in Chiang Mai',
  'All airport and inter-city transfers',
  'Dedicated local guide and host support',
];

export default function LoyKrathongPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0F1A2A] text-white py-20 sm:py-28">
        <Image
          src="https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1600&q=80"
          alt="Loy Krathong festival, Chiang Mai"
          fill
          className="object-cover object-center opacity-40"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A2A]/70 via-transparent to-[#0F1A2A]/90" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Event badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55] text-white text-xs font-bold mb-5">
            <Star className="w-3.5 h-3.5" />
            SPECIAL EVENT · NOV 19–27, 2026
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Loy Krathong<br className="hidden sm:block" /> Thailand Camp
          </h1>
          <p className="text-xl text-white/75 mb-2">Bangkok + Chiang Mai · 9 Days / 8 Nights</p>
          <p className="text-white/50 mb-6">Our 5-Star Bangkok riverside hotel · Our 5-Star Chiang Mai Riverside Resort</p>

          <p className="text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
            One night a year, thousands of candlelit lanterns rise over the Mae Ping River in Chiang Mai.
            The November 19 departure is timed to put you there for Loy Krathong, Thailand's most
            spectacular festival, while you're already playing pickleball with BK.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Calendar className="h-4 w-4 text-[#B08D55]" />
              Nov 19–27, 2026
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <MapPin className="h-4 w-4 text-[#B08D55]" />
              Bangkok + Chiang Mai
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-[#B08D55]" />
              Loy Krathong Festival Included
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div>
              <p className="text-white/40 text-sm mb-0.5">Special event pricing</p>
              <p className="text-4xl font-bold text-white">$5,688 <span className="text-xl font-normal text-white/50">/person</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#stripe-loy-5688"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all"
              >
                Book This Departure · $5,688
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
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32C840 34 960 40 1080 43C1200 46 1320 46 1380 46L1440 46V60H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* ── Why this departure ── */}
      <section className="py-12 sm:py-16 bg-[#FDF8F3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#B08D55]/10 flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-[#B08D55]" />
              </div>
              <h3 className="font-serif font-bold text-[#1D2D44] mb-2">The Festival</h3>
              <p className="text-[#1D2D44]/60 text-sm leading-relaxed">
                Loy Krathong falls on the full moon of the 12th Thai lunar month. In Chiang Mai, it becomes Yi Peng, with thousands of sky lanterns released simultaneously over the city.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#B08D55]/10 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-[#B08D55]" />
              </div>
              <h3 className="font-serif font-bold text-[#1D2D44] mb-2">The Location</h3>
              <p className="text-[#1D2D44]/60 text-sm leading-relaxed">
                You'll be staying at our 5-Star Chiang Mai riverside resort on the Mae Ping River, the same river the lanterns float down. Front-row seat without planning anything yourself.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#B08D55]/10 p-6">
              <div className="w-10 h-10 rounded-xl bg-[#B08D55]/10 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-[#B08D55]" />
              </div>
              <h3 className="font-serif font-bold text-[#1D2D44] mb-2">One Night a Year</h3>
              <p className="text-[#1D2D44]/60 text-sm leading-relaxed">
                This isn't a standing trip feature. It only happens once. The Nov 19 departure is the only TPP trip that aligns with Loy Krathong in 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] mb-6">
            What's Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#B08D55] flex-shrink-0 mt-0.5" />
                <span className="text-[#1D2D44]/75 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#1D2D44]/40 mt-6">
            Not included: international flights, travel insurance, lunches, alcohol, visa fees, single supplement ($600).
          </p>
        </div>
      </section>

      {/* ── Pricing note ── */}
      <section className="py-10 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0F1A2A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#B08D55] text-xs font-bold tracking-widest uppercase mb-2">Loy Krathong pricing</p>
              <p className="text-white font-serif font-bold text-2xl mb-1">$5,688 / person</p>
              <p className="text-white/50 text-sm">
                Standard Bangkok + Chiang Mai departures are $3,888. The $1,800 premium covers the Loy Krathong festival experience, peak-season hotel rates, and the guided Yi Peng lantern program.
              </p>
            </div>
            <a
              href="#stripe-loy-5688"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#0F1A2A] font-bold text-sm whitespace-nowrap shrink-0 shadow-lg"
            >
              Book This Departure
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Cross-link ── */}
      <section className="py-8 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[#1D2D44]/60 text-sm">Looking at the standard Bangkok + Chiang Mai route instead?</p>
          <Link
            href="/trips/bangkok-chiang-mai"
            className="inline-flex items-center gap-2 text-[#B08D55] hover:text-[#8D7144] font-semibold text-sm transition-colors"
          >
            View all Bangkok + Chiang Mai departures
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </main>
  );
}
