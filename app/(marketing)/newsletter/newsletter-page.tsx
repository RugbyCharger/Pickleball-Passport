'use client';

import { useState } from 'react';
import { Sun, Palmtree, ArrowRight, Mail, Globe, Calendar, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const benefits = [
  {
    icon: Calendar,
    title: 'New Trip Announcements',
    description: 'Be the first to know when new departures and destinations open.',
  },
  {
    icon: Sparkles,
    title: 'Exclusive Offers',
    description: 'Early-access pricing and subscriber-only discounts on upcoming trips.',
  },
  {
    icon: Globe,
    title: 'Travel Insights',
    description: 'Tips on playing pickleball abroad, packing lists, and destination guides.',
  },
  {
    icon: Mail,
    title: 'Community Updates',
    description: 'Stories from the road, partner news, and what the Pickleball Passport crew is up to.',
  },
];

export function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail('');
      setEmailError('');
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message);
      setEmailError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      const error = result.error.issues[0]?.message ?? 'Invalid email';
      setEmailError(error);
      return;
    }

    subscribeMutation.mutate({ email });
  };

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2D44] via-[#495F87] to-[#7587A5] text-white py-20 sm:py-28">
        <div className="absolute top-8 left-8 opacity-10">
          <Palmtree className="w-32 h-32" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-10">
          <Sun className="w-24 h-24 text-[#B08D55]" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#B08D55]/10 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <Sun className="w-4 h-4 text-[#B08D55]" />
            The Pickleball Passport Newsletter
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4">
            Stay in the Loop
          </h1>
          <p className="text-xl sm:text-2xl text-white/80">
            Trip updates, new destinations, and stories from the road — delivered to your inbox.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#FDF8F3"
            />
          </svg>
        </div>
      </section>

      {/* Signup form */}
      <section className="py-16 sm:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          {submitted ? (
            <div className="text-center bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 p-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-2">Check your inbox</h2>
              <p className="text-[#1D2D44]/70">
                We sent a confirmation link to <strong>{email || 'your email'}</strong>. Click it to complete your subscription.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl shadow-[#1D2D44]/10 border border-[#B08D55]/10 p-8 sm:p-10">
              <h2 className="text-2xl font-serif font-bold text-[#1D2D44] mb-2 text-center">Sign Up</h2>
              <p className="text-[#1D2D44]/60 text-center mb-8">No spam. Unsubscribe anytime.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newsletter-email" className="block text-sm font-medium text-[#1D2D44] mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3.5 rounded-xl bg-white border-2 ${
                      emailError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#B08D55]/30 focus:border-[#B08D55]'
                    } text-[#1D2D44] placeholder-[#1D2D44]/40 focus:outline-none focus:ring-4 focus:ring-[#B08D55]/20 transition-all`}
                    disabled={subscribeMutation.isPending}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'email-error' : undefined}
                  />
                  {emailError && (
                    <p id="email-error" className="mt-1.5 text-sm text-red-500" aria-live="polite">
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold rounded-xl transition-all shadow-lg shadow-[#B08D55]/30 hover:shadow-xl hover:shadow-[#B08D55]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {subscribeMutation.isPending ? (
                    'Subscribing...'
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* What you'll get */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#B08D55]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1D2D44] text-center mb-10">
            What You&apos;ll Receive
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-6 rounded-2xl bg-[#FDF8F3] border border-[#B08D55]/10"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#1D2D44] flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-[#B08D55]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1D2D44] mb-1">{benefit.title}</h3>
                  <p className="text-sm text-[#1D2D44]/70 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
