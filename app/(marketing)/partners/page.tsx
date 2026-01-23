'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FileText,
  Trophy,
  Plane,
  Award,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Gift,
  Handshake,
} from 'lucide-react';

export default function PartnersPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

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
              <Handshake className="w-4 h-4 text-[#D4AF37]" />
              Partner Program
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Offer Your Members Life-Changing Experiences
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join our partner network and give your pickleball community access
              to transformational wellness experiences in Thailand. Earn rewards,
              free trips, and exclusive benefits while helping your members live
              their best lives.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">150+ Partner Clubs</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">98% Member Satisfaction</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                onClick={() => scrollToSection('how-it-works')}
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 px-10 py-7 text-lg rounded-xl font-semibold"
              >
                Learn More
              </Button>
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

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Why Partner with Pickleball Passport?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-3xl mx-auto">
              We make it simple and rewarding to offer your members world-class
              wellness transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Turnkey Marketing */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="h-2 bg-gradient-to-r from-[#003D5C] to-[#4AA4B5]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                  Turnkey Marketing
                </h3>
                <p className="text-[#003D5C]/70 leading-relaxed">
                  Ready-made co-branded flyers, email templates, social media
                  graphics, and presentation decks. Everything you need to
                  promote to your members.
                </p>
              </div>
            </div>

            {/* Earn Rewards */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group md:-mt-4">
              <div className="h-2 bg-gradient-to-r from-[#D4AF37] to-[#E5C969]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Trophy className="h-8 w-8 text-[#003D5C]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                  Earn Rewards
                </h3>
                <p className="text-[#003D5C]/70 leading-relaxed">
                  Passport Points for every referral. Redeem for cash payouts,
                  free trips, or premium marketing support. The more you refer,
                  the more you earn.
                </p>
              </div>
            </div>

            {/* Free Trips */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7A52]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#2D5A3D] to-[#3D7A52] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plane className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                  Free Trips
                </h3>
                <p className="text-[#003D5C]/70 leading-relaxed">
                  Qualify for complimentary transformation experiences yourself.
                  Experience the program firsthand and bring a guest to our
                  annual partner retreats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passport Points System Section */}
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
              Passport Points: Earn &amp; Redeem
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Our points-based rewards system makes it easy to track your earnings
              and redeem for valuable rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* How to Earn */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#003D5C]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  How to Earn Points
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { points: '500', desc: 'per guest booking' },
                  { points: '1,000 bonus', desc: 'at your 5th booking' },
                  { points: '2,500 bonus', desc: 'at your 10th booking' },
                  { points: '1,000', desc: 'for each partner you recruit' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2D5A3D] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-white">
                      <span className="font-bold text-[#D4AF37]">{item.points} points</span>{' '}
                      {item.desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Redeem */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#003D5C]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  How to Redeem Points
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { points: '5,000', desc: 'Free 7-day trip ($3,500 value)' },
                  { points: '10,000', desc: '$500 cash payout' },
                  { points: '2,000', desc: 'Premium marketing kit' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Gift className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div className="text-white">
                      <span className="font-bold text-[#D4AF37]">{item.points} points</span> ={' '}
                      {item.desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Earning Potential Callout */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-[#D4AF37]/20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-[#003D5C]" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-[#003D5C] mb-3">
              Your Earning Potential
            </h4>
            <p className="text-lg text-[#003D5C]/70 mb-2">
              Refer just 10 members per year and earn a <span className="font-bold text-[#D4AF37]">free trip worth $3,500</span>
            </p>
            <p className="text-sm text-[#003D5C]/50">
              Plus ongoing commission based on your partner tier
            </p>
          </div>
        </div>
      </section>

      {/* Tier Structure Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Partner Tiers &amp; Benefits
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-3xl mx-auto">
              Grow your partnership and unlock better rewards. All tiers are based
              on annual booking volume.
            </p>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bronze */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
              <div className="h-2 bg-gradient-to-r from-[#CD7F32] to-[#A0642A]" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#A0642A] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  B
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-1">Bronze</h3>
                <p className="text-sm text-[#003D5C]/60 mb-4">Starting tier</p>
                <div className="space-y-2 text-sm">
                  <p className="text-[#003D5C]"><span className="font-bold">5%</span> Commission</p>
                  <p className="text-[#003D5C]/60">Basic materials</p>
                  <p className="text-[#003D5C]/60">Email support</p>
                </div>
              </div>
            </div>

            {/* Silver */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
              <div className="h-2 bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8]" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  S
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-1">Silver</h3>
                <p className="text-sm text-[#003D5C]/60 mb-4">10+ bookings/year</p>
                <div className="space-y-2 text-sm">
                  <p className="text-[#003D5C]"><span className="font-bold">7%</span> Commission</p>
                  <p className="text-[#003D5C]"><span className="font-bold">1</span> Free trip/year</p>
                  <p className="text-[#003D5C]/60">Priority support</p>
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border-2 border-[#D4AF37] ring-4 ring-[#D4AF37]/10">
              <div className="h-2 bg-gradient-to-r from-[#D4AF37] to-[#E5C969]" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center text-[#003D5C] font-bold text-xl shadow-lg">
                  G
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-1">Gold</h3>
                <p className="text-sm text-[#003D5C]/60 mb-4">25+ bookings/year</p>
                <div className="space-y-2 text-sm">
                  <p className="text-[#003D5C]"><span className="font-bold">10%</span> Commission</p>
                  <p className="text-[#003D5C]"><span className="font-bold">2</span> Free trips/year</p>
                  <p className="text-[#003D5C]/60">Co-marketing opportunities</p>
                </div>
              </div>
            </div>

            {/* Platinum */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
              <div className="h-2 bg-gradient-to-r from-[#E5E4E2] to-[#B8B8B8]" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E5E4E2] to-[#B8B8B8] flex items-center justify-center text-[#003D5C] font-bold text-xl shadow-lg">
                  P
                </div>
                <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-1">Platinum</h3>
                <p className="text-sm text-[#003D5C]/60 mb-4">50+ bookings/year</p>
                <div className="space-y-2 text-sm">
                  <p className="text-[#003D5C]"><span className="font-bold">12%</span> Commission</p>
                  <p className="text-[#003D5C]"><span className="font-bold">4</span> Free trips/year</p>
                  <p className="text-[#003D5C]/60">VIP access & events</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#003D5C]/50 text-center mt-8">
            All partners start at Bronze. Tiers are evaluated annually based on
            the previous 12 months of bookings.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              How It Works: 3 Simple Steps
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-3xl mx-auto">
              Getting started as a partner is quick and easy.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#003D5C] via-[#D4AF37] to-[#2D5A3D] -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 text-center border border-[#D4AF37]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                    Sign Up
                  </h3>
                  <p className="text-[#003D5C]/70">
                    Create your partner account in just 2 minutes. No approval
                    wait time—instant access to your dashboard and marketing
                    materials.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 text-center border border-[#D4AF37]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center text-3xl font-bold text-[#003D5C] shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                    Promote
                  </h3>
                  <p className="text-[#003D5C]/70">
                    Share your unique referral link or code with your members via
                    email, social media, or in-person events. Use our ready-made
                    marketing materials.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 text-center border border-[#D4AF37]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7A52] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                    Earn
                  </h3>
                  <p className="text-[#003D5C]/70">
                    Get rewarded when your members book transformations. Points are
                    credited instantly, and you can track earnings in real-time via
                    your partner dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Testimonials Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Palmtree className="w-24 h-24 text-white" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              What Our Partners Say
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#D4AF37]/10">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-[#003D5C]/80 italic mb-6 leading-relaxed">
                &ldquo;We&apos;ve sent 12 members on transformations this year. The
                marketing materials make it easy, and the free trips are
                amazing! Our members absolutely love the experiences, and we&apos;re
                earning rewards every month.&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10">
                <div>
                  <p className="font-semibold text-[#003D5C]">Jennifer K.</p>
                  <p className="text-sm text-[#003D5C]/60">
                    The Villages Pickleball Club
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center text-[#003D5C] font-bold shadow-lg">
                  G
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#D4AF37]/10">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-[#003D5C]/80 italic mb-6 leading-relaxed">
                &ldquo;Easiest partnership we&apos;ve ever joined. Our members love it,
                and we&apos;re earning rewards every month. The support team is
                fantastic, and the program basically runs itself.&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10">
                <div>
                  <p className="font-semibold text-[#003D5C]">Mike R.</p>
                  <p className="text-sm text-[#003D5C]/60">
                    Scottsdale Pickleball Center
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] flex items-center justify-center text-white font-bold shadow-lg">
                  S
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#003D5C]/10 p-10 md:p-14 border border-[#D4AF37]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#003D5C]/5 rounded-full blur-2xl" />

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center shadow-lg">
                <Handshake className="w-8 h-8 text-[#003D5C]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
                Ready to Transform Your Members&apos; Lives?
              </h2>
              <p className="text-lg text-[#003D5C]/70 mb-8 max-w-2xl mx-auto">
                Join 150+ partner clubs earning rewards while offering their members
                life-changing wellness experiences. No cost to join, instant access,
                and unlimited earning potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/partner/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Become a Partner Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href="/downloads/partner-kit.pdf"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
                  >
                    Download Partner Kit
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: 'How much do I earn per booking?',
                  a: 'You earn Passport Points for every booking (500 points per guest), plus tier-based commission ranging from 5% (Bronze) to 12% (Platinum). Points can be redeemed for cash payouts, free trips, or premium marketing support. For example, 10 bookings = 5,000 points = a free 7-day trip worth $3,500.',
                },
                {
                  q: 'When do I get paid?',
                  a: 'Points are credited to your account immediately after each booking is confirmed. Cash payouts (if redeeming points for cash) are processed monthly on the 15th of each month. Commission payments are paid on a monthly basis as well.',
                },
                {
                  q: 'How do I share my referral link?',
                  a: "Upon signup, you'll receive a unique referral code and link in your partner dashboard. You can share this via email, social media, or in-person events. We also provide QR codes and shortened URLs for easy sharing.",
                },
                {
                  q: 'What marketing materials are provided?',
                  a: 'All partners receive co-branded flyers, email templates, social media graphics, and presentation decks. Gold and Platinum partners get access to premium marketing kits, co-marketing opportunities, and custom materials designed by our team.',
                },
                {
                  q: 'Can I recruit other partners?',
                  a: 'Yes! You earn 1,000 Passport Points for every partner you recruit who completes their first booking. This is a great way to grow your network and earn additional rewards.',
                },
                {
                  q: 'What are the tier requirements?',
                  a: 'Partner tiers are based on annual booking volume: Bronze (starting), Silver (10+ bookings/year), Gold (25+ bookings/year), and Platinum (50+ bookings/year). Tiers are evaluated annually based on the previous 12 months of bookings.',
                },
                {
                  q: 'Is there a cost to join?',
                  a: 'No! The partner program is 100% free to join. There are no membership fees, signup costs, or hidden charges. You start earning from your very first referral.',
                },
                {
                  q: 'How long does approval take?',
                  a: "Approval is instant! This is a self-service signup process. As soon as you complete your partner account registration, you'll have immediate access to your dashboard, referral links, and marketing materials.",
                },
              ].map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border-b border-[#D4AF37]/10 last:border-b-0"
                >
                  <AccordionTrigger className="px-6 py-5 text-left hover:bg-[#FDF8F3] [&[data-state=open]]:bg-[#FDF8F3] transition-colors">
                    <span className="text-base font-medium text-[#003D5C] pr-4">
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-[#003D5C]/70 leading-relaxed">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
