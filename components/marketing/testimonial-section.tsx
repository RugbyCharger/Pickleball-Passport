'use client';

import { TestimonialGallery } from '@/components/testimonials/testimonial-gallery';
import { Palmtree, Sun, Waves, Star, ArrowRight, Quote } from 'lucide-react';
import Link from 'next/link';

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5]">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <Palmtree className="w-40 h-40 text-white" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Waves className="w-48 h-48 text-white" />
      </div>
      <div className="absolute top-20 right-20 opacity-10">
        <Sun className="w-32 h-32 text-[#D4AF37]" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#4AA4B5]/20 rounded-full blur-2xl" />

      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 rotate-180">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <Star className="w-4 h-4 text-[#D4AF37]" />
            Guest Experiences
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Real Stories, Real Transformations
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
          <p className="text-lg text-white/80 leading-relaxed">
            Hear from guests who combined pickleball paradise with life-changing
            medical tourism experiences in Thailand.
          </p>
        </div>

        {/* Decorative quote icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Quote className="w-8 h-8 text-[#D4AF37]" />
          </div>
        </div>

        {/* Testimonial Gallery */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/10">
          <TestimonialGallery limit={6} showFilters={true} />
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C969] px-8 py-4 font-semibold text-[#003D5C] transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 shadow-lg shadow-[#D4AF37]/20"
          >
            Start Your Journey
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3"/>
        </svg>
      </div>
    </section>
  );
}
