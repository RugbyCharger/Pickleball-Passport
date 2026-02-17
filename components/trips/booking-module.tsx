'use client';

import { useState } from 'react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';

interface BookingModuleProps {
  tripName?: string;
}

export function BookingModule({ tripName = 'Thailand - 13 Days / 12 Nights' }: BookingModuleProps) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 bg-white overflow-hidden">
        {/* Photo Carousel Placeholder */}
        <div className="relative h-[180px] bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] rounded-t-2xl flex flex-col items-center justify-center">
          <h3 className="font-serif text-2xl text-white font-semibold tracking-wide">
            Thailand
          </h3>
          <p className="text-white/70 text-sm mt-1">
            Bangkok &bull; Chiang Mai &bull; Phuket
          </p>
          {/* Dot indicators */}
          <div className="absolute bottom-3 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B08D55]" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4">
          {/* Price Display */}
          <div className="pt-2 pb-1 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B08D55] mb-1">Early Bird Pricing</p>
            <p className="font-serif text-xl font-semibold text-[#1D2D44]">Coming Soon</p>
          </div>

          {/* Info Text */}
          <p className="text-center text-xs text-[#1D2D44]/60 leading-relaxed">
            Join the waitlist to be the first to know when pricing and booking open.
          </p>

          {/* CTA Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              className="block w-full h-12 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-semibold text-sm uppercase tracking-wider flex items-center justify-center shadow-lg shadow-[#B08D55]/25 hover:shadow-xl hover:shadow-[#B08D55]/30 transition-all hover:-translate-y-0.5"
            >
              Reserve Your Spot &rarr;
            </button>
          </div>
        </div>
      </div>

      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
        tripName={tripName}
      />
    </>
  );
}
