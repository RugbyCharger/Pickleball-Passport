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
              <Handshake className="w-4 h-4 text-[#B08D55]" />
              Pickleball Club Partner Program
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Bring Exceptional Travel to Your Pickleball Community
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join our partner network of pickleball clubs, leagues, and communities.
              Offer your members exclusive access to curated international pickleball
              travel experiences. Earn rewards and free trips while giving your players
              something they can&apos;t get anywhere else.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">Growing Partner Network</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">Trusted by Players Nationwide</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Apply to Partner
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

      {/* Why Partner Section - 3 Cards */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Why Partner With The Pickleball Passport?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Turnkey Promotion */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="h-2 bg-gradient-to-r from-[#1D2D44] to-[#7587A5]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                  Turnkey Promotion
                </h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  We provide co-branded flyers, email templates, social media assets,
                  and presentation decks. Everything you need to share upcoming trips
                  with your members.
                </p>
              </div>
            </div>

            {/* Earn Passport Points */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group md:-mt-4">
              <div className="h-2 bg-gradient-to-r from-[#B08D55] to-[#CFB78D]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Trophy className="h-8 w-8 text-[#1D2D44]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                  Earn Passport Points
                </h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  Earn Passport Points for every member who books through your club.
                  Redeem for cash payouts, free trips, or premium marketing support.
                  The more your members travel, the more you earn.
                </p>
              </div>
            </div>

            {/* Experience It Yourself */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7A52]" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#2D5A3D] to-[#3D7A52] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plane className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                  Experience It Yourself
                </h3>
                <p className="text-[#1D2D44]/70 leading-relaxed">
                  Qualifying partners earn complimentary trips to experience the
                  program firsthand. Play in the same tournaments, stay at the same
                  hotels, and see what your members will love before you promote it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10">
            <Sun className="w-24 h-24 text-[#B08D55]" />
          </div>
          <div className="absolute bottom-10 left-10">
            <Palmtree className="w-20 h-20 text-white" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Who This Is For
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              'Pickleball clubs and leagues looking to offer unique member benefits',
              'Tournament directors and event organizers who want to expand into travel experiences',
              'Pickleball content creators and ambassadors with engaged communities',
              'Rec centers and sports facilities that want to offer international trip packages',
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-[#B08D55] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-[#1D2D44]" />
                </div>
                <p className="text-white/90 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Passport Points System Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Passport Points: Earn &amp; Redeem
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-3xl mx-auto">
              Our points-based rewards system makes it easy to track your earnings
              and redeem for valuable rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* How to Earn */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#B08D55]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#1D2D44] flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-[#B08D55]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1D2D44]">
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
                    <div className="text-[#1D2D44]">
                      <span className="font-bold text-[#B08D55]">{item.points} points</span>{' '}
                      {item.desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Redeem */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#B08D55]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#B08D55] flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#1D2D44]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1D2D44]">
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
                    <div className="w-6 h-6 rounded-full bg-[#B08D55]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Gift className="h-4 w-4 text-[#B08D55]" />
                    </div>
                    <div className="text-[#1D2D44]">
                      <span className="font-bold text-[#B08D55]">{item.points} points</span> ={' '}
                      {item.desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Earning Potential Callout */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-[#B08D55]/20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-[#1D2D44]" />
            </div>
            <h4 className="text-2xl font-serif font-bold text-[#1D2D44] mb-3">
              Your Earning Potential
            </h4>
            <p className="text-lg text-[#1D2D44]/70 mb-2">
              Refer just 10 members per year and earn a <span className="font-bold text-[#B08D55]">free trip worth $3,500</span>
            </p>
            <p className="text-sm text-[#1D2D44]/50">
              Plus ongoing commission based on your partner tier
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              How It Works: 3 Simple Steps
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-3xl mx-auto">
              Getting started as a partner is quick and easy.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#1D2D44] via-[#B08D55] to-[#2D5A3D] -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center border border-[#B08D55]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1D2D44] to-[#7587A5] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                    Sign Up
                  </h3>
                  <p className="text-[#1D2D44]/70">
                    Create your partner account in just 2 minutes. No approval
                    wait time. Instant access to your dashboard and marketing
                    materials.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center border border-[#B08D55]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center text-3xl font-bold text-[#1D2D44] shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                    Promote
                  </h3>
                  <p className="text-[#1D2D44]/70">
                    Share your unique referral link or code with your members via
                    email, social media, or in-person events. Use our ready-made
                    marketing materials.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center border border-[#B08D55]/10 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7A52] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                    Earn
                  </h3>
                  <p className="text-[#1D2D44]/70">
                    Get rewarded when your members book trips. Points are
                    credited instantly, and you can track earnings in real-time via
                    your partner dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 md:p-14 border border-[#B08D55]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#B08D55]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1D2D44]/5 rounded-full blur-2xl" />

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center shadow-lg">
                <Handshake className="w-8 h-8 text-[#1D2D44]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
                Ready to Offer Your Members the Trip of a Lifetime?
              </h2>
              <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
                Apply to join our partner program. We&apos;ll set you up with everything
                you need to start promoting trips to your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/partner/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Apply to Partner
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  onClick={() => scrollToSection('how-it-works')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
                >
                  Learn More
                </Button>
              </div>
              <p className="mt-6 text-[#1D2D44]/60 text-sm">
                Want to get started faster?{' '}
                <a
                  href="https://calendly.com/jaron-thepickleballpassport/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B08D55] hover:text-[#8D7144] font-medium underline underline-offset-2 transition-colors"
                >
                  Book a 15-minute intro call with Jaron
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
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
                  className="border-b border-[#B08D55]/10 last:border-b-0"
                >
                  <AccordionTrigger className="px-6 py-5 text-left hover:bg-[#FDF8F3] [&[data-state=open]]:bg-[#FDF8F3] transition-colors">
                    <span className="text-base font-medium text-[#1D2D44] pr-4">
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-[#1D2D44]/70 leading-relaxed">{item.a}</p>
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
