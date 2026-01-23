'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  MapPin,
  Heart,
  Sparkles,
} from 'lucide-react';

const packages = [
  {
    name: 'Smile & Play',
    slug: 'smile-and-play',
    duration: '7 Days',
    description: 'Transform your smile with world-class dental work while enjoying daily pickleball sessions.',
    highlights: [
      'Full dental assessment & treatment',
      'Daily pickleball sessions',
      'Luxury accommodation',
      '5-star dining experiences',
    ],
    featured: true,
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
  },
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Transformation Packages
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover our curated wellness experiences that combine world-class medical care,
              pickleball training, and luxury hospitality in beautiful Thailand.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#D4AF37]" />
                <span>JCI Accredited Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#D4AF37]" />
                <span>60-70% Cost Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                <span>All-Inclusive Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Choose Your Journey
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Each package is fully customizable to match your specific needs and goals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.slug}
                className={`hover:shadow-xl transition-shadow duration-300 ${
                  pkg.featured ? 'border-2 border-[#D4AF37] relative' : ''
                }`}
              >
                {pkg.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl font-serif text-center text-gray-900">
                    {pkg.name}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Thailand
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-6">{pkg.description}</p>
                  <ul className="space-y-3 mb-6">
                    {pkg.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/packages/${pkg.slug}`}>
                    <Button
                      className={`w-full ${
                        pkg.featured
                          ? 'bg-[#D4AF37] hover:bg-[#C19A2E] text-gray-900'
                          : 'bg-[#003D5C] hover:bg-[#002B42]'
                      }`}
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">
            Need Something Custom?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Every transformation journey is unique. Work with our team to create a
            personalized package that perfectly matches your goals, timeline, and preferences.
          </p>
          <Link href="/apply">
            <Button
              size="lg"
              className="bg-[#003D5C] hover:bg-[#002B42] px-8 py-6 text-lg"
            >
              Start Your Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-12 text-center">
            What's Included in Every Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Medical Care',
                description: 'JCI-accredited facilities with internationally trained specialists',
              },
              {
                title: 'Accommodation',
                description: '4-5 star hotels or luxury resorts with recovery amenities',
              },
              {
                title: 'Pickleball',
                description: 'Daily sessions with certified instructors at premium courts',
              },
              {
                title: 'Concierge',
                description: '24/7 personal concierge for all your needs throughout the trip',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
