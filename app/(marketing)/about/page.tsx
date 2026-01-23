'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Heart,
  Globe,
  Users,
  Award,
  Target,
  Sparkles,
} from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Patient-First Care',
    description: 'Every decision we make starts with what is best for our guests. Your health, comfort, and satisfaction are our top priorities.',
  },
  {
    icon: Globe,
    title: 'Global Excellence',
    description: 'We partner only with JCI-accredited facilities and internationally trained specialists who meet the highest standards of care.',
  },
  {
    icon: Users,
    title: 'Community Connection',
    description: 'We believe in the power of pickleball to bring people together. Our programs foster lasting friendships and support networks.',
  },
  {
    icon: Award,
    title: 'Transparency',
    description: 'No hidden costs, no surprises. We provide clear pricing and honest communication throughout your journey.',
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              About Pickleball Passport
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              We are on a mission to make world-class healthcare accessible and enjoyable.
              By combining medical excellence with the joy of pickleball, we have created
              a new way to transform your health.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Pickleball Passport was born from a simple observation: too many Americans
                  were putting off essential medical and dental procedures due to high costs
                  and long wait times.
                </p>
                <p>
                  Our founders, avid pickleball players themselves, discovered the incredible
                  quality and value of healthcare in Thailand. They also noticed something
                  remarkable during their own recovery experiences, the positive impact
                  of gentle physical activity and community connection.
                </p>
                <p>
                  By combining JCI-accredited medical facilities with structured pickleball
                  programs and luxury hospitality, we created a transformative experience
                  that addresses not just physical health, but overall wellbeing.
                </p>
                <p>
                  Today, we have helped hundreds of guests achieve their health goals while
                  enjoying the experience of a lifetime in beautiful Thailand.
                </p>
              </div>
            </div>
            <div className="bg-slate-100 rounded-lg p-8 text-center">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-bold text-[#003D5C]">500+</div>
                  <div className="text-gray-600">Guests Served</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#003D5C]">98%</div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#003D5C]">5+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#003D5C]">20+</div>
                  <div className="text-gray-600">Partner Facilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-t-4 border-t-[#003D5C]">
              <CardContent className="pt-8">
                <Target className="h-12 w-12 text-[#003D5C] mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To make world-class healthcare accessible and enjoyable by combining
                  exceptional medical care with the joy of pickleball and the beauty of Thailand.
                  We believe everyone deserves quality healthcare without financial barriers.
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#D4AF37]">
              <CardContent className="pt-8">
                <Sparkles className="h-12 w-12 text-[#D4AF37] mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become the leading medical tourism company that transforms healthcare
                  from a stressful necessity into an enriching life experience. We envision
                  a world where healing includes happiness, community, and adventure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-[#003D5C]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Leadership Team
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our experienced team brings together expertise in healthcare, hospitality, and athletics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#003D5C] to-[#005580] flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-[#D4AF37] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Join the Pickleball Passport Family
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Discover why hundreds of guests have trusted us with their transformation journey.
            Your path to better health starts here.
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
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-8 py-6 text-lg font-semibold w-full sm:w-auto"
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
