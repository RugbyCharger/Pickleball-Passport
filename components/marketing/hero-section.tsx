'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/anantara-hua-hin.jpg"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/tpp-aerial-0453.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Hero Content */}
      <div className="container px-4 py-20 md:py-28 lg:py-36 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-[#B08D55]/40 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-white/90 shadow-lg">
            Your Personal Pickleball Concierge in Thailand
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
            You're not 30 anymore,{' '}
            <span className="text-[#CFB78D]">but your game doesn't have to suffer for it.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-white/80 sm:text-xl max-w-3xl leading-relaxed">
            Bad courts and avoidable injuries can ruin a trip halfway around the world. We vet every court, handle every detail, and make sure you show up, play safe, and actually enjoy it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Button
              size="lg"
              asChild
              className="text-lg px-10 py-7 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold shadow-xl shadow-[#B08D55]/30 transition-all hover:shadow-2xl hover:shadow-[#B08D55]/40 hover:scale-105 rounded-xl"
            >
              <Link href="/trips/bangkok-weekend">
                Plan My Trip
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-10 py-7 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/60 font-semibold rounded-xl transition-all"
            >
              <Link href="#why-thailand">
                Why Thailand?
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="w-full max-w-4xl mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors overflow-hidden">
                    <Image src="/Pickleball--Streamline-Plump.png" alt="Pickleball" width={40} height={40} className="object-contain" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white">Courts Vetted</div>
                  <div className="text-xs md:text-sm text-white/60 mt-1">Every venue inspected</div>
                </div>

                <div className="text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-8 md:h-8">
                      <rect x="6" y="14" width="22" height="16" rx="3" fill="#B08D55" />
                      <rect x="9" y="17" width="8" height="7" rx="1.5" fill="#1D2D44" opacity="0.4" />
                      <rect x="4" y="11" width="26" height="4" rx="2" fill="#B08D55" />
                      <rect x="28" y="20" width="10" height="10" rx="2" fill="#B08D55" />
                      <rect x="4" y="22" width="4" height="8" rx="1" fill="#B08D55" />
                      <rect x="3" y="30" width="42" height="1.5" rx="0.75" fill="#B08D55" opacity="0.3" />
                      <circle cx="35" cy="33" r="4.5" fill="#1D2D44" opacity="0.8" />
                      <circle cx="35" cy="33" r="2" fill="#B08D55" />
                      <circle cx="12" cy="33" r="4.5" fill="#1D2D44" opacity="0.8" />
                      <circle cx="12" cy="33" r="2" fill="#B08D55" />
                    </svg>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white">Logistics Handled</div>
                  <div className="text-xs text-white/40 mt-0.5">You just show up and play</div>
                </div>

                <div className="text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-[#B08D55]" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white">Injury-Aware</div>
                  <div className="text-xs text-white/40 mt-1">Scheduling & support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FDF8F3"/>
        </svg>
      </div>
    </section>
  );
}
