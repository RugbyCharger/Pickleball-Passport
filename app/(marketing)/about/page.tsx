'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Heart,
  Globe,
  MapPin,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Star,
  Mail,
} from 'lucide-react';

const differentiators = [
  {
    icon: Globe,
    title: 'Multi-City Itineraries',
    description:
      'Every experience spans multiple cities, each with its own personality, courts, cuisine, and culture.',
    color: 'from-[#7587A5] to-[#1D2D44]',
  },
  {
    icon: Star,
    title: 'Handpicked, Not Franchised',
    description:
      'No chains, no corporate lobbies. Locally owned boutique properties that reflect the character of each destination.',
    color: 'from-[#B08D55] to-[#CFB78D]',
  },
  {
    icon: Heart,
    title: 'Play + Culture + Wellness',
    description:
      'Temple tours, cooking classes, elephant sanctuaries, street food, Michelin dinners, onsen recovery, speedboat adventures.',
    color: 'from-[#E07A5F] to-[#B08D55]',
  },
  {
    icon: MapPin,
    title: 'Based in Thailand',
    description:
      'Our team lives on the ground in Bangkok. We walk the streets, eat at the restaurants, and play at the courts we recommend.',
    color: 'from-[#2D5A3D] to-[#7587A5]',
  },
];

const founders = [
  {
    name: 'Jaron Shoptaugh',
    role: 'Founder',
    avatar: 'JS',
    email: 'jaron@thepickleballpassport.org',
    bio: 'Jaron spent years in high-ticket sales and consulting before a transformative journey through South America shifted his perspective on what travel could be. He realized the best experiences aren\u2019t about where you go \u2014 they\u2019re about the community you build and the wellness you cultivate along the way. That insight became Pickleball Passport. Today, Jaron leads the company\u2019s vision from Bangkok, where he\u2019s hands-on with every itinerary, hotel relationship, and on-the-ground detail.',
  },
  {
    name: 'Ryan Magill',
    role: 'Chief Growth Officer',
    avatar: 'RM',
    email: 'ryan@thepickleballpassport.org',
    bio: 'Ryan brings 15+ years of experience leading large-scale operations across energy, construction, and emerging tech. He\u2019s managed complex teams, navigated high-stakes environments, and built the kind of high-trust relationships that make ambitious projects happen. At Pickleball Passport, Ryan focuses on scaling international programs and the partner network \u2014 expanding global pathways for players, clubs, and brands to connect through unforgettable pickleball experiences.',
  },
];

export default function AboutPage() {
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
              <Heart className="w-4 h-4 text-[#B08D55]" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Built by Players, for Players
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Pickleball Passport was founded on a simple idea: the best travel
              experiences combine community, competition, and culture. We&apos;re
              building the world&apos;s premier international pickleball travel
              company &mdash; one unforgettable trip at a time.
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55]/10 text-[#1D2D44] text-sm font-medium mb-6">
              <Sun className="w-4 h-4 text-[#B08D55]" />
              Why We Exist
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-8">
              The Sport Deserves Better Travel
            </h2>
            <p className="text-lg text-[#1D2D44]/70 leading-relaxed">
              Pickleball is the fastest-growing sport in America, but the travel
              options haven&apos;t kept up. Most pickleball trips are
              cookie-cutter resort packages with a few courts bolted on. We
              think players deserve more. We curate multi-city journeys that
              blend world-class pickleball with deep cultural immersion,
              incredible food, ethical adventures, and wellness recovery &mdash;
              all handled for you.
            </p>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              What Sets Us Apart
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              We do things differently &mdash; and that&apos;s the point.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founders */}
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
              Meet the Founders
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              The people behind the passport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {founders.map((member, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-colors group"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center mb-4 text-[#1D2D44] text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#B08D55] font-medium">{member.role}</p>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {member.bio}
                </p>
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-[#B08D55] transition-colors"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Ready to Play the World?
          </h2>
          <p className="text-xl text-[#1D2D44]/70 mb-10 max-w-2xl mx-auto">
            Our flagship Thailand experience launches May 15, 2026. Be part of
            the first group.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips/thailand">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Thailand
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white font-semibold px-10 py-7 text-lg rounded-xl"
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
