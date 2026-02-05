'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Heart,
  Globe,
  Users,
  Award,
  Target,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Star,
  Shield,
} from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Patient-First Care',
    description: 'Every decision we make starts with what is best for our guests. Your health, comfort, and satisfaction are our top priorities.',
    color: 'from-[#E07A5F] to-[#B08D55]',
  },
  {
    icon: Globe,
    title: 'Global Excellence',
    description: 'We partner only with JCI-accredited facilities and internationally trained specialists who meet the highest standards of care.',
    color: 'from-[#7587A5] to-[#1D2D44]',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description: 'We believe in the power of pickleball to bring people together. Our programs foster lasting friendships and support networks.',
    color: 'from-[#2D5A3D] to-[#7587A5]',
  },
  {
    icon: Award,
    title: 'Transparency',
    description: 'No hidden costs, no surprises. We provide clear pricing and honest communication throughout your journey.',
    color: 'from-[#B08D55] to-[#CFB78D]',
  },
];

const team = [
  {
    name: 'Dr. James Chen',
    role: 'Medical Director',
    bio: 'Board-certified with 20+ years in medical tourism. Ensures all partner facilities meet international standards.',
    avatar: 'JC',
  },
  {
    name: 'Sarah Thompson',
    role: 'Guest Experience Director',
    bio: 'Former luxury hospitality executive. Creates seamless, memorable experiences for every guest.',
    avatar: 'ST',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Pickleball Program Director',
    bio: 'USAPA certified coach. Designs programs for all skill levels and recovery stages.',
    avatar: 'MR',
  },
];

const stats = [
  { value: '500+', label: 'Guests Served' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '5+', label: 'Years Experience' },
  { value: '20+', label: 'Partner Facilities' },
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
              About Pickleball Passport
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              We are on a mission to make world-class healthcare accessible and enjoyable.
              By combining medical excellence with the joy of pickleball, we have created
              a new way to transform your health.
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#FDF8F3"/>
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55]/10 text-[#1D2D44] text-sm font-medium mb-6">
                <Sun className="w-4 h-4 text-[#B08D55]" />
                The Beginning
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-8">
                Our Story
              </h2>
              <div className="space-y-5 text-[#1D2D44]/70 leading-relaxed">
                <p>
                  Pickleball Passport was born from a simple observation: too many Americans
                  were putting off essential medical and dental procedures due to high costs
                  and long wait times.
                </p>
                <p>
                  Our founders, avid pickleball players themselves, discovered the incredible
                  quality and value of healthcare in Thailand. They also noticed something
                  remarkable during their own recovery experiences&mdash;the positive impact
                  of gentle physical activity and community connection.
                </p>
                <p>
                  By combining JCI-accredited medical facilities with structured pickleball
                  programs and luxury hospitality, we created a transformative experience
                  that addresses not just physical health, but overall wellbeing.
                </p>
                <p className="font-medium text-[#1D2D44]">
                  Today, we have helped hundreds of guests achieve their health goals while
                  enjoying the experience of a lifetime in beautiful Thailand.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 border border-[#B08D55]/10">
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#F5E6D3]/50 to-white">
                    <div className="text-4xl sm:text-5xl font-bold text-[#1D2D44] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[#1D2D44]/60 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 relative overflow-hidden border border-[#B08D55]/10 group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1D2D44] to-[#7587A5]" />
              <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-32 h-32 text-[#1D2D44]" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center mb-6 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1D2D44] mb-4">Our Mission</h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  To make world-class healthcare accessible and enjoyable by combining
                  exceptional medical care with the joy of pickleball and the beauty of Thailand.
                  We believe everyone deserves quality healthcare without financial barriers.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 relative overflow-hidden border border-[#B08D55]/10 group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#B08D55] to-[#CFB78D]" />
              <div className="absolute top-8 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-32 h-32 text-[#B08D55]" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="h-8 w-8 text-[#1D2D44]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1D2D44] mb-4">Our Vision</h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  To become the leading medical tourism company that transforms healthcare
                  from a stressful necessity into an enriching life experience. We envision
                  a world where healing includes happiness, community, and adventure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Our Values
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              These principles guide everything we do at Pickleball Passport.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                    <value.icon className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">{value.title}</h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
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
              Leadership Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Our experienced team brings together expertise in healthcare, hospitality, and athletics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/20 transition-colors group"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center mx-auto mb-6 text-[#1D2D44] text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">{member.name}</h3>
                <p className="text-[#B08D55] font-medium mb-4">{member.role}</p>
                <p className="text-white/70 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 border border-[#B08D55]/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#1D2D44]/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-[#1D2D44]" />
                </div>
                <div className="text-lg font-bold text-[#1D2D44]">JCI Accredited</div>
                <div className="text-sm text-[#1D2D44]/60">Partner Facilities</div>
              </div>
              <div className="p-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#B08D55]/10 flex items-center justify-center">
                  <Star className="w-7 h-7 text-[#B08D55]" />
                </div>
                <div className="text-lg font-bold text-[#1D2D44]">4.9 Rating</div>
                <div className="text-sm text-[#1D2D44]/60">Guest Reviews</div>
              </div>
              <div className="p-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center">
                  <Award className="w-7 h-7 text-[#2D5A3D]" />
                </div>
                <div className="text-lg font-bold text-[#1D2D44]">Licensed</div>
                <div className="text-sm text-[#1D2D44]/60">Medical Tourism</div>
              </div>
              <div className="p-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#E07A5F]/10 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-[#E07A5F]" />
                </div>
                <div className="text-lg font-bold text-[#1D2D44]">60-70%</div>
                <div className="text-sm text-[#1D2D44]/60">Cost Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Join the Pickleball Passport Family
          </h2>
          <p className="text-xl text-[#1D2D44]/70 mb-10 max-w-2xl mx-auto">
            Discover why hundreds of guests have trusted us with their transformation journey.
            Your path to better health starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Journey
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
