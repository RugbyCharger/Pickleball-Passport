'use client';

import { motion } from 'framer-motion';
import { Palmtree, Waves, Sun, Sparkles, ArrowRight, Clock, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const pickleballPackages = [
  {
    id: '9-day-essential',
    name: '9-Day Essential Experience',
    tagline: 'The Essential Experience',
    duration: '9 Days',
    basePrice: 3488,
    highlights: [
      'Daily curated open play & clinics',
      'Premier 4-5 star accommodation',
      'Airport VIP fast-track & transfers',
      'Welcome dinner & cultural tour',
      'Dedicated concierge support'
    ],
    heroImageUrl: '/images/pickleball-court.jpg' // Placeholder
  },
  {
    id: '9-day-ultimate',
    name: '9-Day Ultimate Experience',
    tagline: 'The Complete Journey',
    duration: '9 Days',
    basePrice: 3488,
    highlights: [
      'Extended coast-to-coast play',
      'Multiple tournament opportunities',
      'Island excursions & premier stay',
      'Full wellness recovery day',
      'Private pro coaching sessions'
    ],
    heroImageUrl: '/images/pickleball-resort.jpg' // Placeholder
  }
];

export function PackageGrid() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
      {pickleballPackages.map((pkg) => (
        <div
          key={pkg.id}
          className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#1D2D44]/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-[#B08D55]/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Palmtree className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-bold mb-2">{pkg.name}</h3>
              <p className="text-[#B08D55] font-medium mb-4">{pkg.tagline}</p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#B08D55]" />
                  {pkg.duration}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#B08D55]" />
                  Thailand
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 flex flex-col">
             {/* Highlights */}
             <ul className="space-y-4 mb-8 flex-1">
              {pkg.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B08D55]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-[#B08D55]" />
                  </div>
                  <span className="text-[#1D2D44]/80 text-sm">{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Price & CTA */}
            <div className="mt-auto pt-6 border-t border-[#B08D55]/10">
               <div className="flex items-end justify-between mb-6">
                 <div>
                   <span className="text-sm text-[#1D2D44]/60 block mb-1">Starting from</span>
                   <span className="text-3xl font-bold text-[#1D2D44]">${pkg.basePrice}</span>
                 </div>
               </div>
               
               <Link href="/pickleball" className="block">
                 <Button className="w-full bg-[#1D2D44] hover:bg-[#002B42] text-white h-12 rounded-xl text-base font-medium">
                   View Itinerary
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * PackageSection Component
 * Full section wrapper for the package explorer
 */
export function PackageSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF8F3] to-white py-24">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 opacity-[0.07]">
        <Palmtree className="w-48 h-48 text-[#1D2D44]" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-[0.07]">
        <Waves className="w-56 h-56 text-[#1D2D44]" />
      </div>
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#B08D55]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-[#7587A5]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2D44]/5 text-[#1D2D44] text-sm font-medium mb-6">
            <Sun className="w-4 h-4 text-[#B08D55]" />
            Curated Pickleball Tours
          </div>
          <h2 className="mb-4 text-4xl font-serif font-bold text-[#1D2D44] sm:text-5xl">
            Choose Your Adventure
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
          <p className="mx-auto max-w-2xl text-lg text-[#1D2D44]/70 leading-relaxed">
            Join a community of enthusiasts for the trip of a lifetime. 
            Experience daily play, total relaxation, and the beauty of Thailand.
          </p>
        </motion.div>

        {/* Package Grid */}
        <PackageGrid />

        {/* CTA Below Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-br from-[#F5E6D3]/50 to-white rounded-2xl p-8 border border-[#B08D55]/20 shadow-xl shadow-[#1D2D44]/5 max-w-2xl mx-auto">
            <p className="mb-6 text-[#1D2D44]/70 text-lg">
              Want to customize your trip even further?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1D2D44] px-8 py-4 font-semibold text-[#1D2D44] transition-all hover:bg-[#1D2D44] hover:text-white"
            >
              <Sparkles className="h-5 w-5" />
              <span>Get in Touch</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 53.3C120 46.7 240 33.3 360 26.7C480 20 600 20 720 23.3C840 26.7 960 33.3 1080 36.7C1200 40 1320 40 1380 40L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
