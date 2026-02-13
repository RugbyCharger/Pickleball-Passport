'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  tooltip?: string;
}

interface StatBarProps {
  items: StatItem[];
}

export function StatBar({ items }: StatBarProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative bg-white rounded-xl border border-[#B08D55]/20 p-4 sm:p-5 text-center shadow-sm"
        >
          <div className="text-2xl sm:text-3xl font-bold text-[#1D2D44]">
            {item.value}
          </div>
          <div className="text-xs sm:text-sm text-[#1D2D44]/60 font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            {item.label}
            {item.tooltip && (
              <button
                type="button"
                className="inline-flex"
                onClick={() =>
                  setActiveTooltip(activeTooltip === idx ? null : idx)
                }
                onMouseEnter={() => setActiveTooltip(idx)}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={`More info about ${item.label}`}
              >
                <Info className="w-3.5 h-3.5 text-[#B08D55]" />
              </button>
            )}
          </div>
          {item.tooltip && activeTooltip === idx && (
            <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#1D2D44] text-white text-xs rounded-lg p-3 shadow-lg">
              {item.tooltip}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D2D44] rotate-45" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
