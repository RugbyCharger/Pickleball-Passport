'use client';

import Image from 'next/image';
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
  Linkedin,
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-20 sm:py-28">
        <Image
          src="/images/chinatown-jaron-ryan.jpg"
          alt="Jaron and Ryan in Bangkok's Chinatown"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-[#B08D55]" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              From a Backyard Rink in Colorado to Pickleball Courts in Bangkok
            </h1>
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

      {/* Our Story Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Photos */}
            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4]">
                <Image
                  src="/images/ryan-wat-pho.jpg"
                  alt="Jaron and Ryan at Wat Pho, Bangkok"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
                <Image
                  src="/frogandkhali.jpeg"
                  alt="Frog and Khali"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-[#1D2D44]/50 italic text-center px-2">
                Meet the mascots: Khali &amp; Frog. They don&apos;t play pickleball yet, but they&apos;re very much part of the family.
              </p>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55]/10 text-[#1D2D44] text-sm font-medium mb-6">
                <Sun className="w-4 h-4 text-[#B08D55]" />
                Our Story
              </div>

              <div className="space-y-6 text-lg text-[#1D2D44]/70 leading-relaxed">
                <p>
                  The Pickleball Passport was built by two cousins who took the long way around to get here. Jaron and Ryan grew up together in Colorado Springs. Hockey, snowboarding, pickup games of whatever was in season. They went separate ways. Ryan spent 15+ years in energy and construction. Jaron went into finance. When COVID hit, they bought a house in the Colorado mountains, rebuilt it with their own hands, and partnered with a local non-profit to turn it into a sober living home for young men in recovery. That experience taught them something they carry into everything now: transformation happens when you combine community, movement, and genuine care for people.
                </p>
                <p>
                  Jaron eventually moved to Thailand, discovered pickleball during early Bangkok mornings, and found a door he didn&apos;t expect. That&apos;s The Pickleball Passport. Every itinerary, every hotel, every restaurant, every court. They&apos;ve walked it, played it, eaten there. This isn&apos;t planned from a desk in the States. It&apos;s built on the ground by two people who believe the best version of yourself shows up when you step outside your routine, pick up a paddle, and say yes to something bigger.
                </p>
              </div>

              {/* Founder Attribution */}
              <div className="mt-12 pt-8 border-t border-[#B08D55]/20">
              <p className="text-xl font-serif font-bold text-[#1D2D44] mb-1">
                Jaron Shoptaugh &amp; Ryan Magill
              </p>
              <p className="text-[#B08D55] font-medium mb-4">Co-Founders</p>
              <p className="text-sm text-[#1D2D44]/60 mb-2">
                Based in Bangkok, Thailand 🇹🇭 &nbsp;|&nbsp; Colorado Springs roots 🏔️
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href="mailto:hello@thepickleballpassport.org"
                  className="flex items-center gap-1.5 text-[#1D2D44]/60 hover:text-[#B08D55] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@thepickleballpassport.org
                </a>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <a
                  href="https://www.linkedin.com/in/jaron-shoptaugh-ab675574/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#1D2D44]/60 hover:text-[#B08D55] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  Jaron on LinkedIn
                </a>
                <a
                  href="https://www.linkedin.com/in/ryan-magill-a407502b8/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#1D2D44]/60 hover:text-[#B08D55] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  Ryan on LinkedIn
                </a>
              </div>
            </div>
          </div>
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
              We do things differently, and that&apos;s the point.
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

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Ready to Play the World?
          </h2>
          <p className="text-xl text-[#1D2D44]/70 mb-10 max-w-2xl mx-auto">
            Our flagship Thailand experiences launch May 2026. Be part of
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
