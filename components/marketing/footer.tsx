'use client';

/**
 * Footer Component
 *
 * Tropical resort-inspired footer with newsletter signup
 */

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Palmtree, Sun, Waves, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { LogoIcon } from '@/components/ui/logo';

const navigation = {
  explore: [
    { name: 'Pickleball', href: '/pickleball' },
    { name: 'Medical Tourism', href: '/medical-tourism' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Apply Now', href: '/apply' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Partner Program', href: '/partners' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Trust & Safety', href: '/trust-and-safety' },
    { name: 'Medical Disclaimer', href: '/medical-disclaimer' },
    { name: 'Refund Policy', href: '/refund-policy' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'YouTube',
      href: '#',
      icon: Youtube,
    },
  ],
};

const emailSchema = z.string().email('Please enter a valid email address');

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail('');
      setEmailError('');
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
      const error = result.error.issues[0]?.message || 'Invalid email';
      setEmailError(error);
      toast.error(error);
      return;
    }

    subscribeMutation.mutate({ email });
  };

  return (
    <footer className="relative overflow-hidden" id="newsletter">
      {/* Decorative wave top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B08D55] via-[#CFB78D] to-[#B08D55]" />

      {/* Newsletter Section - Sand colored */}
      <div className="bg-gradient-to-b from-[#FDF8F3] to-[#F5E6D3] pt-16 pb-12 relative">
        {/* Decorative elements */}
        <div className="absolute top-8 left-8 opacity-10">
          <Palmtree className="w-24 h-24 text-[#1D2D44]" />
        </div>
        <div className="absolute top-12 right-12 opacity-10">
          <Sun className="w-20 h-20 text-[#B08D55]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D55]/20 text-[#1D2D44] text-sm font-medium mb-4">
              <Sun className="w-4 h-4 text-[#B08D55]" />
              Join the Adventure
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#1D2D44] mb-3">
              Stay in the Loop
            </h3>
            <p className="text-[#1D2D44]/70 mb-8 text-lg">
              Get exclusive offers, wellness tips, and pickleball adventures delivered to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  className={`w-full px-5 py-4 rounded-xl bg-white border-2 ${
                    emailError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-[#B08D55]/30 focus:border-[#B08D55] focus:ring-[#B08D55]/20'
                  } text-[#1D2D44] placeholder-[#1D2D44]/40 focus:outline-none focus:ring-4 transition-all shadow-lg shadow-[#1D2D44]/5`}
                  disabled={subscribeMutation.isPending}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'newsletter-error' : undefined}
                />
                {emailError && (
                  <p id="newsletter-error" className="mt-2 text-sm text-red-500 text-left" aria-live="polite">
                    {emailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-8 py-4 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-bold rounded-xl transition-all shadow-lg shadow-[#B08D55]/30 hover:shadow-xl hover:shadow-[#B08D55]/40 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
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

            <p className="mt-4 text-xs text-[#1D2D44]/50">
              By subscribing, you agree to receive marketing emails from Pickleball Passport. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Deep ocean */}
      <div className="bg-gradient-to-b from-[#1D2D44] to-[#002B42] text-white relative">
        {/* Decorative wave pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10 V20 H0 Z' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '100px 20px',
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl overflow-hidden shadow-xl transition-transform group-hover:scale-105">
                    <LogoIcon size="xl" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold text-white">
                    Pickleball Passport
                  </span>
                  <span className="text-sm text-[#B08D55] font-medium tracking-wider">
                    Thailand Wellness
                  </span>
                </div>
              </Link>
              <p className="text-[#7587A5] mb-8 max-w-sm text-base leading-relaxed">
                The ultimate pickleball getaway. Experience curated court time, luxury accommodations, and optional world-class medical care in Thailand.
              </p>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <a
                  href="mailto:jaron@thepickleballpassport.org"
                  className="flex items-center space-x-4 text-white/80 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <Mail className="h-5 w-5 text-[#B08D55]" />
                  </div>
                  <span>jaron@thepickleballpassport.org</span>
                </a>
                <a
                  href="tel:+15551234567"
                  className="flex items-center space-x-4 text-white/80 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <Phone className="h-5 w-5 text-[#B08D55]" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </a>
                <div className="flex items-center space-x-4 text-white/80">
                  <div className="w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#B08D55]" />
                  </div>
                  <span>Bangkok, Thailand</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {navigation.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="w-12 h-12 rounded-xl bg-white/10 hover:bg-[#B08D55] flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label={item.name}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Explore Links */}
            <div>
              <h3 className="text-[#B08D55] font-serif font-bold text-lg mb-6 flex items-center gap-2">
                <Waves className="w-5 h-5" />
                Explore
              </h3>
              <ul className="space-y-4">
                {navigation.explore.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/70 hover:text-[#B08D55] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55]/50 group-hover:bg-[#B08D55] transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-[#B08D55] font-serif font-bold text-lg mb-6 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Company
              </h3>
              <ul className="space-y-4">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/70 hover:text-[#B08D55] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55]/50 group-hover:bg-[#B08D55] transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-[#B08D55] font-serif font-bold text-lg mb-6">
                Legal
              </h3>
              <ul className="space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-white/70 hover:text-[#B08D55] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55]/50 group-hover:bg-[#B08D55] transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-white/50">
                © {currentYear} Pickleball Passport. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
