'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MedicalCostCalculator from '@/components/marketing/medical-cost-calculator';
import {
  ArrowRight,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Building2,
  DollarSign,
  GraduationCap,
  TreePalm,
} from 'lucide-react';

const infoCards = [
  {
    icon: Building2,
    title: 'JCI-Accredited Hospitals',
    description:
      'Thailand has 60+ JCI-accredited hospitals, more than any country in Southeast Asia. JCI is the gold standard for international healthcare quality and patient safety.',
  },
  {
    icon: DollarSign,
    title: 'Significant Cost Savings',
    description:
      'Most dental and cosmetic procedures cost 60–70% less than in the United States, even at top-tier international facilities. Many travelers find the savings cover their entire trip.',
  },
  {
    icon: GraduationCap,
    title: 'Globally Trained Specialists',
    description:
      'Many Thai surgeons and dentists trained in the US, UK, or Australia. Thailand\u2019s major hospitals attract internationally credentialed physicians across specialties.',
  },
  {
    icon: TreePalm,
    title: 'Recovery in Paradise',
    description:
      'Recover at a beachfront hotel in Phuket or a riverside boutique in Chiang Mai instead of your couch at home. Thailand\u2019s warm climate, wellness culture, and affordable luxury make it an ideal recovery environment.',
  },
];

export default function MedicalTourismPage() {
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
              <Sparkles className="w-4 h-4 text-[#B08D55]" />
              Medical Tourism in Thailand
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              World-Class Care at a Fraction of the Cost
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Thailand is Asia&apos;s #1 medical tourism destination, with JCI-accredited
              hospitals offering dental, cosmetic, and elective procedures at 60–70% less
              than US prices. Many of our travelers extend their trip to take advantage of
              these savings on their own terms.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Building2 className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">World-Renowned Hospitals</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <DollarSign className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">60–70% Typical Savings</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sun className="h-5 w-5 text-[#B08D55]" />
                <span className="text-sm">Your Choice, Your Research</span>
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

      {/* Why Thousands Choose Thailand Section */}
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
              Why Thousands Choose Thailand
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Thailand&apos;s medical infrastructure is world-class. Here&apos;s what makes it a top
              destination for international patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {infoCards.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20 group-hover:bg-[#B08D55]/20 transition-colors">
                    <item.icon className="h-10 w-10 text-[#B08D55]" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator Section */}
      <section className="py-20 px-4 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Estimate Your Potential Savings
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              See how much common procedures typically cost in Thailand compared to the
              United States. Prices are approximate averages based on publicly available
              data and may vary by provider.
            </p>
          </div>
          <MedicalCostCalculator />
          {/* Calculator Disclaimer */}
          <p className="text-xs sm:text-sm text-[#1D2D44]/50 mt-8 max-w-2xl mx-auto text-center leading-relaxed">
            Disclaimer: All prices shown are approximate averages compiled from publicly
            available data and third-party sources. Actual costs vary by provider, procedure
            complexity, and individual patient needs. The Pickleball Passport does not arrange,
            book, recommend, or endorse any specific medical or dental providers. All medical
            decisions and provider selection are the sole responsibility of the traveler. We
            strongly encourage consulting with your personal physician before pursuing any
            procedure abroad.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1D2D44]/10 p-10 md:p-14 border border-[#B08D55]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#B08D55]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#B08D55] to-[#CFB78D] flex items-center justify-center shadow-lg">
                <Sun className="w-8 h-8 text-[#1D2D44]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
                Interested in Combining Your Trip with Medical or Dental Work?
              </h2>
              <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
                Many of our travelers extend their stay in Thailand to take advantage of
                world-class dental and cosmetic care at a fraction of US costs. While
                The Pickleball Passport does not arrange or manage medical procedures, we&apos;re
                happy to help with travel logistics, like extending your hotel stay,
                arranging airport transfers, or adjusting your itinerary to build in
                recovery time.
              </p>
              <Link href="/apply">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Contact Us About Extended Travel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pickleball Cross-sell */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Explore Our Pickleball Trips
          </h2>
          <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
            Interested in the full experience? Check out our curated pickleball travel
            packages: competitive play, boutique hotels, and cultural adventures across Thailand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pickleball">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                View Pickleball Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Page Footer Disclaimer */}
      <section className="py-8 bg-[#FDF8F3] border-t border-[#B08D55]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] sm:text-xs text-[#1D2D44]/40 leading-relaxed text-center">
            The Pickleball Passport is a travel and lifestyle company. We are not a medical
            provider, medical tourism agency, or healthcare facilitator. We do not recommend,
            endorse, vet, arrange, or guarantee any medical or dental providers, hospitals,
            clinics, or procedures. All information on this page is for general informational
            purposes only and should not be considered medical advice. Travelers considering
            medical or dental procedures in Thailand should conduct their own research, verify
            provider credentials independently, and consult with their personal physicians
            before making any medical decisions. The Pickleball Passport assumes no responsibility
            or liability for any medical outcomes, complications, or experiences resulting from
            procedures obtained during or in connection with our trips.
          </p>
        </div>
      </section>
    </main>
  );
}
