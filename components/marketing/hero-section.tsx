'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useLeadModal } from '@/components/providers/lead-modal-provider';

/* Thailand stock photos — replace with your own shots when ready */
const heroImages = [
  'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&q=80', // Wat Arun temple
  'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=80', // Long-tail boats
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=80', // Thai street food
  'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1920&q=80', // Thailand sunset beach
];

const SLIDE_DURATION = 6000; // 6 seconds per image

export function HeroSection() {
  const { openLeadModal } = useLeadModal();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden navy-texture">
      {/* Rotating background images with Ken Burns effect */}
      {heroImages.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: index === currentSlide ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover animate-ken-burns"
            sizes="100vw"
            priority={index === 0}
            style={{
              animationDelay: `${index * SLIDE_DURATION}ms`,
            }}
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-[#1B2B4B]/65" />

      {/* Hero Content */}
      <div className="container px-4 py-20 md:py-28 lg:py-36 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-[#B08D55]/40 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-white/90 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2 text-[#B08D55]" />
            Premier Pickleball Travel Experiences
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
            Play the{' '}
            <span className="relative inline-block">
              <span className="text-tropical-gradient bg-gradient-to-r from-[#B08D55] via-[#CFB78D] to-[#B08D55] bg-clip-text text-transparent">
                World
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C40 2 80 2 100 4C120 6 160 6 199 3" stroke="#B08D55" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          {/* Subline */}
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-[#F5E6D3]">
            Elite Pickleball. Unforgettable Destinations.
          </p>

          {/* Subheadline */}
          <p className="text-lg text-white/80 sm:text-xl md:text-2xl max-w-3xl leading-relaxed">
            9 days across Thailand. Two routes. Boutique hotels.
            Exceptional pickleball. From $3,488/person.
          </p>

          {/* Tagline */}
          <p className="text-lg sm:text-xl font-bold text-[#B08D55]">
            Pickleball is the passport. The experience is the destination.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Button
              size="lg"
              onClick={() => openLeadModal()}
              className="text-lg px-10 py-7 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold shadow-xl shadow-[#B08D55]/30 transition-all hover:shadow-2xl hover:shadow-[#B08D55]/40 hover:scale-105 rounded-xl"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Thailand
              <ArrowRight className="ml-2 h-5 w-5" />
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
                  <div className="text-xl md:text-3xl font-bold text-white">Daily</div>
                  <div className="text-xs md:text-sm text-white/60 mt-1">Curated Play</div>
                </div>

                <div className="text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    {/* Tuk-tuk silhouette */}
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
                  <div className="text-xl md:text-3xl font-bold text-white">Locally Led</div>
                  <div className="text-xs text-white/40 mt-0.5">Expat-Built in Thailand</div>
                </div>

                <div className="text-center group">
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-[#B08D55]" />
                  </div>
                  <div className="text-xl md:text-3xl font-bold text-white">Handpicked</div>
                  <div className="text-xs text-white/40 mt-1">Personally Vetted Hotels</div>
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
