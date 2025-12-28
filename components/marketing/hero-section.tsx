'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      {/* Hero Content */}
      <div className="container px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="mr-2">🏝️</span>
            Medical Tourism + Pickleball Paradise
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Your{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Smile & Game
            </span>
            <br />
            in Paradise
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-600 sm:text-xl md:text-2xl max-w-3xl leading-relaxed">
            Experience world-class dental care, cosmetic procedures, and pickleball training
            in Thailand—at{' '}
            <span className="font-semibold text-emerald-600">60-70% savings</span> compared to
            the US.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl"
            >
              <Link href="/packages">
                Explore Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-slate-300 hover:border-emerald-600 hover:text-emerald-600 transition-all"
            >
              <Link href="/apply">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Video
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-12 border-t border-slate-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">60-70%</div>
              <div className="text-sm text-slate-600">Cost Savings</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Happy Guests</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">4.9★</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">JCI</div>
              <div className="text-sm text-slate-600">Accredited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
    </section>
  );
}
