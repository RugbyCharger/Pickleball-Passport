'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  MapPin,
  Heart,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Shield,
  Users,
  Utensils,
  Phone,
} from 'lucide-react';

const packages = [
  {
    name: 'Play & Explore',
    slug: 'play-and-explore',
    duration: '7 Days',
    description: 'The essential Thailand pickleball experience with daily play, cultural excursions, and premier stays.',
    highlights: [
      'Daily pickleball sessions',
      'Cultural excursions & local tours',
      'Premier accommodation',
      'Exceptional dining experiences',
    ],
    featured: true,
    icon: '😁',
  },
  {
    name: 'Total Wellness',
    slug: 'total-wellness',
    duration: '10 Days',
    description: 'Comprehensive wellness journey combining cosmetic procedures, fitness, and rejuvenation.',
    highlights: [
      'Customized wellness program',
      'Spa & recovery treatments',
      'Personalized fitness coaching',
      'Nutritional guidance',
    ],
    featured: false,
    icon: '✨',
  },
  {
    name: 'Recovery Retreat',
    slug: 'recovery-retreat',
    duration: '14 Days',
    description: 'Extended recovery program with gentle pickleball progression and holistic healing.',
    highlights: [
      'Gradual activity progression',
      'Physical therapy sessions',
      'Meditation & mindfulness',
      'Cultural excursions',
    ],
    featured: false,
    icon: '🌿',
  },
];

const includedItems = [
  {
    icon: Shield,
    title: 'Vetted Partners',
    description: 'Hand-picked local venues, hotels, and activity providers you can trust',
  },
  {
    icon: Star,
    title: 'Accommodation',
    description: '4-5 star hotels or premier resorts with recovery amenities',
  },
  {
    icon: Users,
    title: 'Pickleball',
    description: 'Daily sessions with certified instructors at premium courts',
  },
  {
    icon: Phone,
    title: 'Concierge',
    description: '24/7 personal concierge for all your needs throughout the trip',
  },
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-20 sm:py-28">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Waves className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#7587A5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-[#B08D55]" />
              All-Inclusive Experiences
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Transformation Packages
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover our curated experiences that combine world-class pickleball,
              wellness, and exceptional hospitality in beautiful Thailand.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">Vetted Partners</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">60-70% Savings</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sun className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">All-Inclusive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3"/>
          </svg>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Choose Your Journey
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              Each package is fully customizable to match your specific needs and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={pkg.slug}
                className={`relative group ${index === 0 ? 'lg:-mt-4' : ''}`}
              >
                {pkg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#B08D55]/30 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <div
                  className={`bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 h-full flex flex-col ${
                    pkg.featured ? 'border-2 border-[#B08D55] ring-4 ring-[#B08D55]/10' : 'border border-[#B08D55]/10'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-8 text-center ${pkg.featured ? 'bg-gradient-to-br from-[#F5E6D3]/50 to-white' : ''}`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center text-3xl shadow-lg">
                      {pkg.icon}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#1D2D44] mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-[#1D2D44]/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-[#B08D55]" />
                        {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-[#B08D55]" />
                        Thailand
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 pt-4 flex-1 flex flex-col">
                    <p className="text-[#1D2D44]/70 text-center mb-6">{pkg.description}</p>
                    <ul className="space-y-4 mb-8 flex-1">
                      {pkg.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-[#2D5A3D]" />
                          </div>
                          <span className="text-[#1D2D44]/80">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/packages/${pkg.slug}`} className="block">
                      <Button
                        className={`w-full h-14 rounded-xl font-semibold text-base transition-all ${
                          pkg.featured
                            ? 'bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] shadow-lg shadow-[#B08D55]/30 hover:shadow-xl'
                            : 'bg-[#1D2D44] hover:bg-[#002B42] text-white'
                        }`}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 md:p-14 border border-[#B08D55]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#B08D55]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center shadow-lg">
                <Utensils className="w-8 h-8 text-[#1D2D44]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
                Need Something Custom?
              </h2>
              <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
                Every transformation journey is unique. Work with our team to create a
                personalized package that perfectly matches your goals, timeline, and preferences.
              </p>
              <Link href="/apply">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Palmtree className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-10 right-10">
            <Sun className="w-20 h-20 text-[#B08D55]" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              What&apos;s Included in Every Package
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Every journey includes these premium features to ensure your transformation is seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {includedItems.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20 group-hover:bg-[#B08D55]/20 transition-colors">
                    <item.icon className="h-10 w-10 text-[#B08D55]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#B08D55] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#1D2D44]" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
            Take the first step toward your transformation. Our team is ready to help you plan your perfect trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-[#1D2D44] hover:bg-[#002B42] text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
