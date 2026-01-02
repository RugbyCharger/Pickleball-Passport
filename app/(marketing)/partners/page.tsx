'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

// Note: Metadata export removed due to 'use client' directive
// Page metadata should be handled via parent layout or separate metadata file

export default function PartnersPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Offer Your Members Life-Changing Experiences
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our partner network and give your pickleball community access
              to transformational wellness experiences in Thailand. Earn rewards,
              free trips, and exclusive benefits while helping your members live
              their best lives.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D4AF37]" />
                <span>150+ Partner Clubs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#D4AF37]" />
                <span>98% Member Satisfaction</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/signup">
                <Button
                  size="lg"
                  className="bg-[#D4AF37] hover:bg-[#C19A2E] text-gray-900 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                >
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                onClick={() => scrollToSection('how-it-works')}
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-8 py-6 text-lg font-semibold w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Why Partner with Pickleball Passport?
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            We make it simple and rewarding to offer your members world-class
            wellness transformations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Turnkey Marketing */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-[#003D5C]">
              <CardHeader>
                <FileText className="h-12 w-12 text-[#003D5C] mx-auto mb-4" />
                <CardTitle className="text-center text-xl">
                  Turnkey Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Ready-made co-branded flyers, email templates, social media
                  graphics, and presentation decks. Everything you need to
                  promote to your members.
                </p>
              </CardContent>
            </Card>

            {/* Earn Rewards */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-[#D4AF37]">
              <CardHeader>
                <Trophy className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
                <CardTitle className="text-center text-xl">
                  Earn Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Passport Points for every referral. Redeem for cash payouts,
                  free trips, or premium marketing support. The more you refer,
                  the more you earn.
                </p>
              </CardContent>
            </Card>

            {/* Free Trips */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-emerald-500">
              <CardHeader>
                <Plane className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <CardTitle className="text-center text-xl">Free Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Qualify for complimentary transformation experiences yourself.
                  Experience the program firsthand and bring a guest to our
                  annual partner retreats.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Passport Points System Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Passport Points: Earn &amp; Redeem
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our points-based rewards system makes it easy to track your earnings
            and redeem for valuable rewards.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* How to Earn */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign className="h-7 w-7 text-[#D4AF37] mr-2" />
                How to Earn Points
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">500 points</span> per guest
                    booking
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">1,000 bonus points</span> at
                    your 5th booking
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">2,500 bonus points</span> at
                    your 10th booking
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">1,000 points</span> for each
                    partner you recruit
                  </div>
                </li>
              </ul>
            </div>

            {/* How to Redeem */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="h-7 w-7 text-[#003D5C] mr-2" />
                How to Redeem Points
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#003D5C] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">5,000 points</span> = Free
                    7-day trip ($3,500 value)
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#003D5C] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">10,000 points</span> = $500
                    cash payout
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#003D5C] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">2,000 points</span> =
                    Premium marketing kit
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Earning Potential Callout */}
          <div className="bg-gradient-to-r from-[#003D5C] to-[#005580] text-white rounded-lg p-8 text-center">
            <h4 className="text-2xl font-semibold mb-3">
              Your Earning Potential
            </h4>
            <p className="text-lg text-blue-100 mb-4">
              Refer just 10 members per year and earn a free trip worth $3,500
            </p>
            <p className="text-sm text-blue-200">
              Plus ongoing commission based on your partner tier
            </p>
          </div>
        </div>
      </section>

      {/* Tier Structure Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Partner Tiers &amp; Benefits
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Grow your partnership and unlock better rewards. All tiers are based
            on annual booking volume.
          </p>

          {/* Tier Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-[#003D5C] text-white">
                  <th className="px-6 py-4 text-left font-semibold">Tier</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Requirements
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Free Trips/Year
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Marketing Support
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Support Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Bronze Tier */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#A0642A] flex items-center justify-center text-white font-bold mr-3">
                        B
                      </div>
                      <span className="font-semibold text-gray-900">
                        Bronze
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">Starting tier</td>
                  <td className="px-6 py-4 text-gray-700">5%</td>
                  <td className="px-6 py-4 text-gray-700">—</td>
                  <td className="px-6 py-4 text-gray-700">
                    Basic marketing materials
                  </td>
                  <td className="px-6 py-4 text-gray-700">Email support</td>
                </tr>

                {/* Silver Tier */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] flex items-center justify-center text-white font-bold mr-3">
                        S
                      </div>
                      <span className="font-semibold text-gray-900">Silver</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">10+ bookings/year</td>
                  <td className="px-6 py-4 text-gray-700">7%</td>
                  <td className="px-6 py-4 text-gray-700">1</td>
                  <td className="px-6 py-4 text-gray-700">
                    Enhanced materials
                  </td>
                  <td className="px-6 py-4 text-gray-700">Priority support</td>
                </tr>

                {/* Gold Tier */}
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C19A2E] flex items-center justify-center text-white font-bold mr-3">
                        G
                      </div>
                      <span className="font-semibold text-gray-900">Gold</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">25+ bookings/year</td>
                  <td className="px-6 py-4 text-gray-700">10%</td>
                  <td className="px-6 py-4 text-gray-700">2</td>
                  <td className="px-6 py-4 text-gray-700">
                    Co-marketing opportunities
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Dedicated account manager
                  </td>
                </tr>

                {/* Platinum Tier */}
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E5E4E2] to-[#B8B8B8] flex items-center justify-center text-gray-900 font-bold mr-3 shadow-md">
                        P
                      </div>
                      <span className="font-semibold text-gray-900">
                        Platinum
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">50+ bookings/year</td>
                  <td className="px-6 py-4 text-gray-700">12%</td>
                  <td className="px-6 py-4 text-gray-700">4</td>
                  <td className="px-6 py-4 text-gray-700">
                    Premium marketing + VIP events
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    Dedicated manager + VIP access
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            All partners start at Bronze. Tiers are evaluated annually based on
            the previous 12 months of bookings.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            How It Works: 3 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Getting started as a partner is quick and easy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-[#003D5C] text-white flex items-center justify-center text-3xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Sign Up
                </h3>
                <p className="text-gray-600">
                  Create your partner account in just 2 minutes. No approval
                  wait time—instant access to your dashboard and marketing
                  materials.
                </p>
              </div>
              {/* Arrow connector (desktop only) */}
              <div className="hidden md:block absolute top-10 -right-6 text-[#003D5C]">
                <ArrowRight className="h-8 w-8" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-3xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Promote
                </h3>
                <p className="text-gray-600">
                  Share your unique referral link or code with your members via
                  email, social media, or in-person events. Use our ready-made
                  marketing materials.
                </p>
              </div>
              {/* Arrow connector (desktop only) */}
              <div className="hidden md:block absolute top-10 -right-6 text-[#D4AF37]">
                <ArrowRight className="h-8 w-8" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn</h3>
              <p className="text-gray-600">
                Get rewarded when your members book transformations. Points are
                credited instantly, and you can track earnings in real-time via
                your partner dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Testimonials Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            What Our Partners Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">
                  "We've sent 12 members on transformations this year. The
                  marketing materials make it easy, and the free trips are
                  amazing! Our members absolutely love the experiences, and we're
                  earning rewards every month."
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Jennifer K.</p>
                    <p className="text-sm text-gray-600">
                      The Villages Pickleball Club
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C19A2E] flex items-center justify-center text-white font-bold">
                    G
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">
                  "Easiest partnership we've ever joined. Our members love it,
                  and we're earning rewards every month. The support team is
                  fantastic, and the program basically runs itself."
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Mike R.</p>
                    <p className="text-sm text-gray-600">
                      Scottsdale Pickleball Center
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] flex items-center justify-center text-white font-bold">
                    S
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Transform Your Members' Lives?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join 150+ partner clubs earning rewards while offering their members
            life-changing wellness experiences. No cost to join, instant access,
            and unlimited earning potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/partner/signup">
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#C19A2E] text-gray-900 px-10 py-6 text-lg font-semibold w-full sm:w-auto"
              >
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
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-10 py-6 text-lg font-semibold w-full sm:w-auto"
              >
                Download Partner Kit
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How much do I earn per booking?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                You earn Passport Points for every booking (500 points per
                guest), plus tier-based commission ranging from 5% (Bronze) to
                12% (Platinum). Points can be redeemed for cash payouts, free
                trips, or premium marketing support. For example, 10 bookings =
                5,000 points = a free 7-day trip worth $3,500.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold">
                When do I get paid?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Points are credited to your account immediately after each
                booking is confirmed. Cash payouts (if redeeming points for cash)
                are processed monthly on the 15th of each month. Commission
                payments are paid on a monthly basis as well.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How do I share my referral link?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Upon signup, you'll receive a unique referral code and link in
                your partner dashboard. You can share this via email, social
                media, or in-person events. We also provide QR codes and
                shortened URLs for easy sharing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What marketing materials are provided?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                All partners receive co-branded flyers, email templates, social
                media graphics, and presentation decks. Gold and Platinum
                partners get access to premium marketing kits, co-marketing
                opportunities, and custom materials designed by our team.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Can I recruit other partners?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Yes! You earn 1,000 Passport Points for every partner you recruit
                who completes their first booking. This is a great way to grow
                your network and earn additional rewards.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What are the tier requirements?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Partner tiers are based on annual booking volume: Bronze
                (starting), Silver (10+ bookings/year), Gold (25+
                bookings/year), and Platinum (50+ bookings/year). Tiers are
                evaluated annually based on the previous 12 months of bookings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Is there a cost to join?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                No! The partner program is 100% free to join. There are no
                membership fees, signup costs, or hidden charges. You start
                earning from your very first referral.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How long does approval take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Approval is instant! This is a self-service signup process. As
                soon as you complete your partner account registration, you'll
                have immediate access to your dashboard, referral links, and
                marketing materials.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </main>
  );
}
