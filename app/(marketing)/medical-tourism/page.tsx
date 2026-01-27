'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MedicalCostCalculator from '@/components/marketing/medical-cost-calculator';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Heart,
  Stethoscope,
  Activity,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  Phone,
} from 'lucide-react';

const includedItems = [
  {
    icon: Shield,
    title: 'JCI Accredited Care',
    description: 'Partnered with top-tier international hospitals meeting the highest safety standards.',
  },
  {
    icon: Stethoscope,
    title: 'Top Specialists',
    description: 'Access to board-certified surgeons and specialists with international training.',
  },
  {
    icon: Activity,
    title: 'Recovery Support',
    description: 'Dedicated recovery plans including physical therapy and post-op care.',
  },
  {
    icon: Phone,
    title: '24/7 Concierge',
    description: 'Personal assistance for appointments, transport, and translation services.',
  },
];

export default function MedicalTourismPage() {
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
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Premier Medical Tourism
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              World-Class Care, Significant Savings
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Access JCI-accredited medical and dental procedures in Thailand at a fraction of US costs.
              Combine your treatment with a luxury recovery vacation.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">JCI Accredited</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">60-70% Savings</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Sun className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">Luxury Recovery</span>
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

      {/* Cost Calculator Section */}
      <section className="py-20 px-4 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Estimate Your Savings
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-2xl mx-auto">
              See how much you can save on common procedures compared to US prices.
            </p>
          </div>
          <MedicalCostCalculator />
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Palmtree className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-10 right-10">
            <Sun className="w-20 h-20 text-[#D4AF37]" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Comprehensive Medical Support
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              We ensure your medical journey is safe, comfortable, and seamless from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {includedItems.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <item.icon className="h-10 w-10 text-[#D4AF37]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#003D5C]" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom/Quote CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl shadow-[#003D5C]/10 p-10 md:p-14 border border-[#D4AF37]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E5C969] flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-[#003D5C]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
                Get a Personalized Quote
              </h2>
              <p className="text-lg text-[#003D5C]/70 mb-8 max-w-2xl mx-auto">
                Every procedure is unique. Contact us to discuss your specific medical needs and get a custom quote and travel plan.
              </p>
              <Link href="/apply">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Request Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pickleball Upsell CTA */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
            Recovery in Motion
          </h2>
          <p className="text-lg text-[#003D5C]/70 mb-8 max-w-2xl mx-auto">
            Light activity can aid recovery. Explore our pickleball packages for a fun, active way to heal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pickleball">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
              >
                View Pickleball Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
