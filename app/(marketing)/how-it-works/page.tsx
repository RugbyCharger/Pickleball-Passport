'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Calendar,
  Plane,
  Heart,
  Star,
  MessageCircle,
  Shield,
  Clock,
  Sparkles,
  Sun,
  Palmtree,
  Waves,
  MapPin,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Apply & Consult',
    description: 'Complete our simple application form. Our team will review your goals and schedule a free consultation to understand your needs.',
    icon: FileText,
    gradient: 'from-[#003D5C] to-[#4AA4B5]',
  },
  {
    number: 2,
    title: 'Personalized Planning',
    description: 'Work with our medical coordinators to create a customized treatment and activity plan tailored to your specific goals.',
    icon: Calendar,
    gradient: 'from-[#D4AF37] to-[#E5C969]',
  },
  {
    number: 3,
    title: 'Travel & Transform',
    description: 'Arrive in Thailand where our concierge team handles everything. Enjoy world-class care and daily pickleball in paradise.',
    icon: Plane,
    gradient: 'from-[#2D5A3D] to-[#3D7A52]',
  },
  {
    number: 4,
    title: 'Return Renewed',
    description: 'Head home with your transformation complete. Our follow-up care ensures lasting results and continued support.',
    icon: Heart,
    gradient: 'from-[#E07A5F] to-[#F09B8A]',
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'JCI Accredited Facilities',
    description: 'All our partner hospitals meet rigorous international standards for quality and safety.',
  },
  {
    icon: Star,
    title: '60-70% Cost Savings',
    description: 'Same quality care as US facilities at a fraction of the cost, with no compromise on outcomes.',
  },
  {
    icon: MessageCircle,
    title: 'Dedicated Support',
    description: '24/7 concierge service throughout your journey, from planning to post-care follow-up.',
  },
  {
    icon: Clock,
    title: 'Minimal Wait Times',
    description: 'No months-long wait lists. Get scheduled within weeks, not months.',
  },
];

const beforeTrip = [
  'Free consultation call',
  'Medical records review',
  'Customized treatment plan',
  'Travel & accommodation booking',
  'Pre-trip preparation guide',
];

const duringStay = [
  'Airport pickup & transfers',
  '24/7 concierge support',
  'Medical procedures & follow-ups',
  'Daily pickleball sessions',
  'Cultural experiences & dining',
];

const afterReturn = [
  'Follow-up care coordination',
  'Medical records transfer',
  'Recovery support team',
  'Long-term wellness guidance',
  'Pickleball community access',
];

export default function HowItWorksPage() {
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
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              Your Journey to Thailand
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Your transformation journey is simple, seamless, and fully supported every step of the way.
              Here&apos;s how we make it happen.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">Fully Guided</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">100% Safe</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-sm">Personalized Care</span>
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

      {/* Steps Section */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              Your Journey in 4 Simple Steps
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#003D5C]/70 max-w-3xl mx-auto">
              From initial consultation to your return home, we handle every detail so you can focus on your transformation.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#003D5C] via-[#D4AF37] to-[#2D5A3D] -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative z-10 group">
                  <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 p-8 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#D4AF37]/10 h-full">
                    {/* Step number badge */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#F5E6D3] flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-[#003D5C]" />
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#003D5C] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#003D5C]/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Choose Pickleball Passport?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              We combine world-class medical tourism with the joy of pickleball for a truly unique experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <benefit.icon className="h-10 w-10 text-[#D4AF37]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#003D5C]" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-white/70 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F5E6D3] to-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
              What to Expect
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#E5C969] mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Before Your Trip */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
              <div className="bg-gradient-to-r from-[#003D5C] to-[#005580] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">Before Your Trip</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {beforeTrip.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-[#2D5A3D]" />
                      </div>
                      <span className="text-[#003D5C]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* During Your Stay */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10 md:-mt-4">
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-[#003D5C]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#003D5C]">During Your Stay</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {duringStay.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-[#D4AF37]" />
                      </div>
                      <span className="text-[#003D5C]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* After You Return */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#003D5C]/10 overflow-hidden border border-[#D4AF37]/10">
              <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7A52] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">After You Return</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {afterReturn.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-[#2D5A3D]" />
                      </div>
                      <span className="text-[#003D5C]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[#FDF8F3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sun className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#003D5C] mb-4">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-lg text-[#003D5C]/70 mb-8 max-w-2xl mx-auto">
            Take the first step toward a healthier, happier you. Our team is ready to help you plan your perfect journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
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
