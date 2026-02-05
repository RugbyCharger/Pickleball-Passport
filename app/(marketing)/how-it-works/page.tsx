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
  Trophy,
  Stethoscope,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Choose Your Experience',
    description: 'Decide if you want a dedicated pickleball tour, a medical tourism trip, or the full package combining both.',
    icon: Sparkles,
    gradient: 'from-[#1D2D44] to-[#7587A5]',
  },
  {
    number: 2,
    title: 'Consult & Plan',
    description: 'Speak with our team to customize your itinerary, book courts, and coordinate any medical appointments.',
    icon: Calendar,
    gradient: 'from-[#B08D55] to-[#CFB78D]',
  },
  {
    number: 3,
    title: 'Travel & Play',
    description: 'Arrive in Thailand where our concierge team handles everything. Enjoy luxury stays and daily pickleball.',
    icon: Plane,
    gradient: 'from-[#2D5A3D] to-[#3D7A52]',
  },
  {
    number: 4,
    title: 'Return Renewed',
    description: 'Head home with improved skills, a rejuvenated body, and unforgettable memories.',
    icon: Heart,
    gradient: 'from-[#E07A5F] to-[#F09B8A]',
  },
];

const benefits = [
  {
    icon: Trophy,
    title: 'World-Class Pickleball',
    description: 'Access to premium courts, local tournaments, and certified coaching in stunning locations.',
  },
  {
    icon: Star,
    title: 'Luxury for Less',
    description: 'Enjoy 5-star accommodations and service for a fraction of what you would pay in the West.',
  },
  {
    icon: Shield,
    title: 'Seamless Logistics',
    description: 'We handle every transfer, booking, and detail. You just show up and play.',
  },
  {
    icon: MessageCircle,
    title: 'Community Focused',
    description: 'Travel with like-minded enthusiasts and make friends from around the world.',
  },
];

const beforeTrip = [
  'Free consultation call',
  'Itinerary customization',
  'Skill level assessment',
  'Travel & accommodation booking',
  'Pre-trip preparation guide',
];

const duringStay = [
  'Airport VIP pickup & transfers',
  '24/7 concierge support',
  'Daily organized open play',
  'Medical appointments (if applicable)',
  'Cultural experiences & dining',
];

const afterReturn = [
  'Photo & video gallery access',
  'Medical records transfer (if applicable)',
  'Recovery support team',
  'Alumni community access',
  'Future trip priority booking',
];

export default function HowItWorksPage() {
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
              <MapPin className="w-4 h-4 text-[#B08D55]" />
              Your Journey to Thailand
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              We&apos;ve made it easy to combine your love for pickleball with a luxury vacation 
              and optional world-class medical care.
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

      {/* Choose Your Path Section (Flexibility) */}
      <section className="py-16 sm:py-24 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Choose Your Path
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              We offer three ways to experience Thailand. Choose what fits your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pickleball Only */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
              <div className="bg-[#1D2D44] p-6 text-center">
                <Trophy className="w-12 h-12 text-[#B08D55] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Pickleball Only</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-[#1D2D44]/70 mb-6 text-center">
                  Focus purely on the game. Enjoy daily play, tournaments, and luxury travel without any medical appointments.
                </p>
                <div className="mt-auto">
                  <Link href="/pickleball" className="block text-center text-[#1D2D44] font-semibold hover:text-[#B08D55]">
                    Learn More &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* The Full Passport (Both) */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-[#1D2D44]/20 overflow-hidden border-2 border-[#B08D55] transform md:-translate-y-4 flex flex-col relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D]" />
              <div className="absolute top-3 right-3">
                 <span className="bg-[#B08D55] text-[#1D2D44] text-xs font-bold px-2 py-1 rounded-full">MOST POPULAR</span>
              </div>
              <div className="bg-gradient-to-b from-[#1D2D44] to-[#495F87] p-8 text-center">
                <div className="flex justify-center gap-2 mb-3">
                  <Trophy className="w-10 h-10 text-[#B08D55]" />
                  <Stethoscope className="w-10 h-10 text-[#7587A5]" />
                </div>
                <h3 className="text-2xl font-bold text-white">The Full Passport</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-[#1D2D44]/70 mb-6 text-center text-lg">
                  The ultimate experience. Combine a pickleball vacation with dental or medical care for maximum value and transformation.
                </p>
                <div className="mt-auto">
                  <Link href="/apply" className="block text-center">
                    <Button className="w-full bg-[#B08D55] hover:bg-[#8D7144] text-[#1D2D44] font-bold">
                      Start Your Journey
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Medical Only */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 flex flex-col">
              <div className="bg-[#1D2D44] p-6 text-center">
                <Stethoscope className="w-12 h-12 text-[#7587A5] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Medical Only</h3>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-[#1D2D44]/70 mb-6 text-center">
                  Focused on your procedure and recovery. World-class care in a relaxing environment with full concierge support.
                </p>
                <div className="mt-auto">
                  <Link href="/medical-tourism" className="block text-center text-[#1D2D44] font-semibold hover:text-[#B08D55]">
                    Learn More &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Your Journey in 4 Simple Steps
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-[#1D2D44]/70 max-w-3xl mx-auto">
              From initial consultation to your return home, we handle every detail so you can focus on playing and relaxing.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#1D2D44] via-[#B08D55] to-[#2D5A3D] -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative z-10 group">
                  <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 p-8 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 border border-[#B08D55]/10 h-full">
                    {/* Step number badge */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#F5E6D3] flex items-center justify-center">
                      <step.icon className="h-7 w-7 text-[#1D2D44]" />
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#1D2D44] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#1D2D44]/70 leading-relaxed">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10">
            <Sun className="w-24 h-24 text-[#B08D55]" />
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
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              We combine the thrill of international pickleball with the luxury of a curated vacation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20 group-hover:bg-[#B08D55]/20 transition-colors">
                    <benefit.icon className="h-10 w-10 text-[#B08D55]" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#B08D55] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#1D2D44]" />
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
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              What to Expect
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] mx-auto mb-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Before Your Trip */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
              <div className="bg-gradient-to-r from-[#1D2D44] to-[#495F87] p-6">
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
                      <span className="text-[#1D2D44]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* During Your Stay */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10 md:-mt-4">
              <div className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-[#1D2D44]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1D2D44]">During Your Stay</h3>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {duringStay.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#B08D55]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-[#B08D55]" />
                      </div>
                      <span className="text-[#1D2D44]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* After You Return */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 overflow-hidden border border-[#B08D55]/10">
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
                      <span className="text-[#1D2D44]/80">{item}</span>
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
          <Sun className="w-12 h-12 text-[#B08D55] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-lg text-[#1D2D44]/70 mb-8 max-w-2xl mx-auto">
            Take the first step toward a trip you&apos;ll never forget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold px-10 py-7 text-lg rounded-xl shadow-lg shadow-[#B08D55]/30 hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pickleball">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1D2D44] text-[#1D2D44] hover:bg-[#1D2D44] hover:text-white px-10 py-7 text-lg rounded-xl font-semibold"
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
