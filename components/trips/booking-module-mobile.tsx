'use client';

import { useState } from 'react';
import { WaitlistModal } from '@/components/trips/waitlist-modal';

interface BookingModuleMobileProps {
  tripName?: string;
}

export function BookingModuleMobile({ tripName = 'Thailand - 13 Days / 12 Nights' }: BookingModuleMobileProps) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <>
      {/* Collapsed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#B08D55]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        <div className="py-3 px-4 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-[#1D2D44]">Early Bird Pricing</p>
            <p className="text-xs text-[#1D2D44]/50">Coming Soon</p>
          </div>
          <button
            type="button"
            onClick={() => setWaitlistOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-sm shadow-lg shadow-[#B08D55]/25"
          >
            Reserve Your Spot &rarr;
          </button>
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
