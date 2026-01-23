'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Star,
  Quote,
  Play,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Heart,
  Shield,
  Users,
  MapPin,
} from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Phoenix, AZ',
    procedure: 'Dental Implants + Pickleball Training',
    rating: 5,
    quote: 'I saved over $15,000 on my dental work and got to play pickleball every day in paradise. The staff was incredible, and I came home with a brand new smile and improved my game!',
    avatar: 'S',
    gradient: 'from-[#003D5C] to-[#4AA4B5]',
  },
  {
    name: 'Robert & Linda K.',
    location: 'The Villages, FL',
    procedure: 'Couples Wellness Package',
    rating: 5,
    quote: 'We traveled as a couple and both had cosmetic procedures. The recovery was relaxed, the pickleball courts were amazing, and we made lifelong friends with other travelers.',
    avatar: 'R',
    gradient: 'from-[#D4AF37] to-[#E5C969]',
  },
  {
    name: 'Michael T.',
    location: 'San Diego, CA',
    procedure: 'Knee Replacement + Recovery',
    rating: 5,
    quote: 'After my knee replacement, I never thought I would play pickleball again. The rehab program here got me back on the court in just 3 weeks. Unbelievable care and results.',
    avatar: 'M',
    gradient: 'from-[#2D5A3D] to-[#3D7A52]',
  },
  {
    name: 'Jennifer P.',
    location: 'Scottsdale, AZ',
    procedure: 'Full Smile Makeover',
    rating: 5,
    quote: 'The dental work was world-class, but what surprised me was how much fun I had. Playing pickleball with other guests, exploring Thailand - it did not feel like a medical trip at all.',
    avatar: 'J',
    gradient: 'from-[#E07A5F] to-[#F09B8A]',
  },
  {
    name: 'David & Carol H.',
    location: 'Austin, TX',
    procedure: 'Total Wellness Retreat',
    rating: 5,
    quote: 'From airport pickup to our final day, everything was perfect. The medical facilities were better than anything we have seen in the US, and the pickleball community was so welcoming.',
    avatar: 'D',
    gradient: 'from-[#003D5C] to-[#4AA4B5]',
  },
  {
    name: 'Patricia L.',
    location: 'Denver, CO',
    procedure: 'Cosmetic Dentistry',
    rating: 5,
    quote: 'I was nervous about traveling abroad for dental work, but the Pickleball Passport team made everything so easy. Now I tell everyone about my experience!',
    avatar: 'P',
    gradient: 'from-[#D4AF37] to-[#E5C969]',
  },
];

const stats = [
  { value: '500+', label: 'Happy Guests', icon: Users },
  { value: '98%', label: 'Satisfaction Rate', icon: Heart },
  { value: '4.9/5', label: 'Average Rating', icon: Star },
  { value: '60-70%', label: 'Cost Savings', icon: Shield },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5] text-white py-20 sm:py-28">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <Waves className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#4AA4B5]/20 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              Guest Stories
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Real Stories, Real Transformations
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Hear from guests who have experienced the Pickleball Passport difference.
              Their journeys inspire us to continue delivering exceptional care.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm">4.9 Average Rating</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">500+ Happy Guests</span>
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

      {/* Stats Section */}
      <section className="py-12 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 border border-[#D4AF37]/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center group-hover:from-[#D4AF37] group-hover:to-[#E5C969] transition-all">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#003D5C]">{stat.value}</div>
                  <div className="text-[#003D5C]/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Guest Experiences
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-2xl mx-auto">
              Discover how our guests transformed their lives with pickleball and world-class care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
              >
                {/* Top accent bar */}
                <div className={`h-2 bg-gradient-to-r ${testimonial.gradient}`} />

                <div className="p-8">
                  {/* Rating stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  {/* Quote icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#F5E6D3] flex items-center justify-center mb-4">
                    <Quote className="h-5 w-5 text-[#D4AF37]" />
                  </div>

                  {/* Quote text */}
                  <p className="text-[#003D5C]/80 mb-6 italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-[#D4AF37]/10">
                    <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#003D5C]">{testimonial.name}</p>
                      <div className="flex items-center gap-1 text-sm text-[#003D5C]/60">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </div>
                      <p className="text-xs text-[#D4AF37] font-medium mt-1">{testimonial.procedure}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10">
            <Sun className="w-24 h-24 text-[#D4AF37]" />
          </div>
          <div className="absolute bottom-10 left-10">
            <Palmtree className="w-20 h-20 text-white" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Video Stories
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Watch our guests share their transformation journeys in their own words.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sarah\'s Smile Journey', duration: '3:45' },
              { name: 'Back on the Court', duration: '4:20' },
              { name: 'Our Thailand Adventure', duration: '5:12' },
            ].map((video, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all group border border-white/20 overflow-hidden relative"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#003D5C]/80 to-transparent opacity-60" />

                {/* Play button */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors shadow-xl mb-4">
                    <Play className="h-10 w-10 text-[#003D5C] ml-1" />
                  </div>
                  <span className="text-white font-medium">{video.name}</span>
                  <span className="text-white/60 text-sm">{video.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quote Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#003D5C]/10 p-10 md:p-14 border border-[#D4AF37]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#003D5C]/5 rounded-full blur-2xl" />

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center shadow-lg">
                <Quote className="w-8 h-8 text-[#003D5C]" />
              </div>

              <blockquote className="text-2xl md:text-3xl font-serif text-[#003D5C] italic mb-8 leading-relaxed">
                &ldquo;This wasn&apos;t just a medical trip—it was the adventure of a lifetime. I came back with a new smile, new friends, and a new perspective on life.&rdquo;
              </blockquote>

              <div className="flex items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  M
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#003D5C] text-lg">Margaret R.</p>
                  <p className="text-[#003D5C]/60">Naples, FL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
            Ready to Write Your Own Story?
          </h2>
          <p className="text-lg text-[#003D5C]/70 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied guests who have transformed their lives with Pickleball Passport.
            Your journey awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                View Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
