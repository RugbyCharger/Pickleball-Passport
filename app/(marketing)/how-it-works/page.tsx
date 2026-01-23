'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Apply & Consult',
    description: 'Complete our simple application form. Our team will review your goals and schedule a free consultation to understand your needs.',
    icon: FileText,
    color: 'bg-[#003D5C]',
  },
  {
    number: 2,
    title: 'Personalized Planning',
    description: 'Work with our medical coordinators to create a customized treatment and activity plan tailored to your specific goals.',
    icon: Calendar,
    color: 'bg-[#D4AF37]',
  },
  {
    number: 3,
    title: 'Travel & Transform',
    description: 'Arrive in Thailand where our concierge team handles everything. Enjoy world-class care and daily pickleball in paradise.',
    icon: Plane,
    color: 'bg-emerald-500',
  },
  {
    number: 4,
    title: 'Return Renewed',
    description: 'Head home with your transformation complete. Our follow-up care ensures lasting results and continued support.',
    icon: Heart,
    color: 'bg-[#003D5C]',
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

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your transformation journey is simple, seamless, and fully supported every step of the way.
              Here&apos;s how we make it happen.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Your Journey in 4 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 mb-16 text-center max-w-3xl mx-auto">
            From initial consultation to your return home, we handle every detail so you can focus on your transformation.
          </p>

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-xl`}>
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 max-w-lg">{step.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`h-32 w-32 rounded-full ${step.color} bg-opacity-10 flex items-center justify-center`}>
                    <step.icon className={`h-16 w-16 ${step.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 text-center">
            Why Choose Pickleball Passport?
          </h2>
          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            We combine world-class medical tourism with the joy of pickleball for a truly unique experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <benefit.icon className="h-12 w-12 text-[#003D5C] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            What to Expect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Before Your Trip</h3>
              <ul className="space-y-3">
                {[
                  'Free consultation call',
                  'Medical records review',
                  'Customized treatment plan',
                  'Travel & accommodation booking',
                  'Pre-trip preparation guide',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">During Your Stay</h3>
              <ul className="space-y-3">
                {[
                  'Airport pickup & transfers',
                  '24/7 concierge support',
                  'Medical procedures & follow-ups',
                  'Daily pickleball sessions',
                  'Cultural experiences & dining',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">After You Return</h3>
              <ul className="space-y-3">
                {[
                  'Follow-up care coordination',
                  'Medical records transfer',
                  'Recovery support team',
                  'Long-term wellness guidance',
                  'Pickleball community access',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Take the first step toward a healthier, happier you. Our team is ready to help you plan your perfect journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#C19A2E] text-gray-900 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
              >
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-8 py-6 text-lg font-semibold w-full sm:w-auto"
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
