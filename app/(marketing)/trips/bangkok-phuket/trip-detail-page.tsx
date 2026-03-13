'use client';

import { useState } from 'react';
import { Sparkles, MapPin, Calendar, Users, Trophy, Sun } from 'lucide-react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';

export function BangkokPhuketPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Trip Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-16 sm:py-24">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sun className="w-4 h-4 text-[#B08D55]" />
              Seasonal Route: December - April
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Bangkok + Phuket
            </h1>

            <p className="text-xl sm:text-2xl text-white/80 mb-2">
              15 Days / 14 Nights
            </p>
            <p className="text-lg text-white/60 mb-8">
              The Peninsula Bangkok &middot; Sole Mio Boutique Hotel &amp; Wellness &middot; The Peninsula Bangkok
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Calendar className="h-4 w-4 text-[#B08D55]" />
                Dry Season Only
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 text-[#B08D55]" />
                2 Cities, 2 Five-Star Hotels
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Users className="h-4 w-4 text-[#B08D55]" />
                12 Guests Max
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Trophy className="h-4 w-4 text-[#B08D55]" />
                6+ Pickleball Sessions
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-base shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              Join the Waitlist
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3" />
          </svg>
        </div>
      </section>

      {/* Route Overview */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#1D2D44] mb-4">
              The Dry Season Route
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 leading-relaxed max-w-2xl mx-auto">
              Available exclusively from December through April, when Phuket's beaches are pristine
              and the Andaman Sea is calm. Sun, sand, and serious pickleball.
            </p>
          </div>

          {/* Bookend Structure */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1D2D44] text-white text-xs font-medium">Bangkok</span>
                <span className="text-sm font-medium text-[#1D2D44]/60">7 Nights</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1D2D44] mb-2">The Peninsula Bangkok</h4>
              <p className="text-[#1D2D44]/70 text-sm leading-relaxed">
                Five-star riverside luxury. On-site courts, spa, world-class restaurants. Your home base
                for Bangkok pickleball and cultural exploration.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-px h-8 bg-[#B08D55]/30" />
            </div>

            <div className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#B08D55] text-white text-xs font-medium">Phuket</span>
                <span className="text-sm font-medium text-[#1D2D44]/60">6 Nights</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1D2D44] mb-2">Sole Mio Boutique Hotel &amp; Wellness</h4>
              <p className="text-[#1D2D44]/70 text-sm leading-relaxed">
                Adults-only five-star boutique in Bang Tao. Wellness and detox focus, rooftop pool,
                and direct access to Phuket's pickleball courts.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-px h-8 bg-[#B08D55]/30" />
            </div>

            <div className="bg-white rounded-2xl border border-[#B08D55]/15 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1D2D44] text-white text-xs font-medium">Bangkok</span>
                <span className="text-sm font-medium text-[#1D2D44]/60">1 Night (Farewell)</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-[#1D2D44] mb-2">The Peninsula Bangkok</h4>
              <p className="text-[#1D2D44]/70 text-sm leading-relaxed">
                Return to The Peninsula for a farewell dinner and final night before departure.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-[#1D2D44]/60 text-sm mb-4">
              Dates for Dec 2026 / Jan 2027 will be announced once confirmed.
            </p>
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-base shadow-lg shadow-[#B08D55]/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Join the Waitlist
            </button>
          </div>
        </div>
      </section>

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        tripName="Bangkok + Phuket - 15 Days / 14 Nights (Dec-Apr)"
      />
    </main>
  );
}
