'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, Quote, Play } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Phoenix, AZ',
    procedure: 'Dental Implants + Pickleball Training',
    rating: 5,
    quote: 'I saved over $15,000 on my dental work and got to play pickleball every day in paradise. The staff was incredible, and I came home with a brand new smile and improved my game!',
    avatar: 'S',
  },
  {
    name: 'Robert & Linda K.',
    location: 'The Villages, FL',
    procedure: 'Couples Wellness Package',
    rating: 5,
    quote: 'We traveled as a couple and both had cosmetic procedures. The recovery was relaxed, the pickleball courts were amazing, and we made lifelong friends with other travelers.',
    avatar: 'R',
  },
  {
    name: 'Michael T.',
    location: 'San Diego, CA',
    procedure: 'Knee Replacement + Recovery',
    rating: 5,
    quote: 'After my knee replacement, I never thought I would play pickleball again. The rehab program here got me back on the court in just 3 weeks. Unbelievable care and results.',
    avatar: 'M',
  },
  {
    name: 'Jennifer P.',
    location: 'Scottsdale, AZ',
    procedure: 'Full Smile Makeover',
    rating: 5,
    quote: 'The dental work was world-class, but what surprised me was how much fun I had. Playing pickleball with other guests, exploring Thailand - it did not feel like a medical trip at all.',
    avatar: 'J',
  },
  {
    name: 'David & Carol H.',
    location: 'Austin, TX',
    procedure: 'Total Wellness Retreat',
    rating: 5,
    quote: 'From airport pickup to our final day, everything was perfect. The medical facilities were better than anything we have seen in the US, and the pickleball community was so welcoming.',
    avatar: 'D',
  },
  {
    name: 'Patricia L.',
    location: 'Denver, CO',
    procedure: 'Cosmetic Dentistry',
    rating: 5,
    quote: 'I was nervous about traveling abroad for dental work, but the Pickleball Passport team made everything so easy. Now I tell everyone about my experience!',
    avatar: 'P',
  },
];

const stats = [
  { value: '500+', label: 'Happy Guests' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '60-70%', label: 'Cost Savings' },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Real Stories, Real Transformations
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Hear from guests who have experienced the Pickleball Passport difference.
              Their journeys inspire us to continue delivering exceptional care.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#003D5C]">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Guest Experiences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#003D5C] to-[#005580] flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      <p className="text-xs text-[#D4AF37] font-medium">{testimonial.procedure}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Video Stories
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Watch our guests share their transformation journeys in their own words.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors group"
              >
                <div className="h-16 w-16 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Play className="h-8 w-8 text-[#003D5C] ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Write Your Own Story?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of satisfied guests who have transformed their lives with Pickleball Passport.
            Your journey awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#C19A2E] text-gray-900 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-8 py-6 text-lg font-semibold w-full sm:w-auto"
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
