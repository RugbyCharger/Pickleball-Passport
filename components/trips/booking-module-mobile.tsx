'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BookingModuleMobileProps {
  tripName?: string;
  price?: number;
  depositAmount?: number;
  depositLink?: string;
  fullLink?: string;
  spotsLeft?: number;
}

export function BookingModuleMobile({
  price = 3488,
  depositAmount = 872,
  depositLink,
  fullLink,
  spotsLeft,
}: BookingModuleMobileProps) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  return (
    <>
      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#B08D55]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="py-3 px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif font-bold text-[#1D2D44] text-sm">
              From ${price.toLocaleString()}/person
            </p>
            <p className="text-xs text-[#1D2D44]/50">
              25% deposit: ${depositAmount.toLocaleString()}
            </p>
            {spotsLeft !== undefined && (
              <p className={`text-xs font-semibold ${spotsLeft <= 4 ? 'text-red-600' : 'text-emerald-600'}`}>
                {spotsLeft === 0 ? 'Sold Out' : spotsLeft <= 4 ? `Only ${spotsLeft} spots left!` : `${spotsLeft} spots available`}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/reserve"
              className="px-4 py-2.5 rounded-xl border-2 border-[#1D2D44] text-[#1D2D44] font-bold text-xs"
            >
              Reserve
            </Link>
            {depositLink ? (
              <button
                type="button"
                onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-xs shadow-lg shadow-[#B08D55]/25"
              >
                Book Now
              </button>
            ) : (
              <Link
                href="/reserve"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold text-xs shadow-lg shadow-[#B08D55]/25"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>

        {/* Expandable payment options */}
        {showPaymentOptions && depositLink && fullLink && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2 border-t border-[#B08D55]/10 pt-3">
            <a
              href={depositLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-[#B08D55] p-2.5 text-center hover:bg-[#B08D55]/10 transition-colors"
            >
              <span className="text-xs font-semibold uppercase text-[#1D2D44]">Pay Deposit</span>
              <span className="text-sm font-bold text-[#1D2D44]">${depositAmount.toLocaleString()}</span>
            </a>
            <a
              href={fullLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-[#B08D55] p-2.5 text-center hover:bg-[#B08D55]/10 transition-colors"
            >
              <span className="text-xs font-semibold uppercase text-[#1D2D44]">Pay in Full</span>
              <span className="text-sm font-bold text-[#1D2D44]">${price.toLocaleString()}</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
