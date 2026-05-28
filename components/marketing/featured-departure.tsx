import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedDeparture() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#B08D55]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-stretch gap-0 bg-[#FDF8F3] rounded-2xl border border-[#B08D55]/15 overflow-hidden shadow-sm">

          {/* BK photo */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <Image
              src="/bk-karunakaran-coaching.jpeg"
              alt='BK Karunakaran'
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#B08D55] mb-2">
              Featured Departure — July 16
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1D2D44] mb-2 leading-snug">
              Joined by BK Karunakaran,<br className="hidden sm:block" /> PPR Certified Pro Coach
            </h2>
            <p className="text-sm text-[#1D2D44]/60 leading-relaxed mb-5 max-w-md">
              The July 16–24 Bangkok + Hua Hin departure is the only summer trip with a headlining pro coach. BK joins coached sessions throughout 9 days in Bangkok and Hua Hin.
            </p>
            <Link
              href="/trips/bangkok-hua-hin/july-16-2026"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors self-start"
            >
              See the trip
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
