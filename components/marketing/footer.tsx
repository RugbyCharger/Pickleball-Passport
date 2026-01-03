'use client';

/**
 * Footer Component
 *
 * Global footer with navigation and newsletter signup (E1-S14, E1-S11)
 */

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { z } from 'zod';

const navigation = {
  explore: [
    { name: 'Packages', href: '/packages' },
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

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      const error = result.error.issues[0]?.message || 'Invalid email';
      setEmailError(error);
      toast.error(error);
      return;
    }

    // Submit
    subscribeMutation.mutate({ email });
  };

  return (
    <footer className="bg-slate-900 text-slate-300" id="newsletter">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Newsletter Section */}
        <div className="mb-12 pb-12 border-b border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Stay in the Loop 📬
            </h3>
            <p className="text-slate-400 mb-6">
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
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500'
                  } text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                  disabled={subscribeMutation.isPending}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'newsletter-error' : undefined}
                />
                {emailError && (
                  <p id="newsletter-error" className="mt-2 text-sm text-red-400 text-left">
                    {emailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-500">
              By subscribing, you agree to receive marketing emails from Pickleball Passport. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-blue-600">
                <span className="text-white text-xl font-bold">🏓</span>
              </div>
              <span className="font-playfair text-xl font-bold text-white">
                Pickleball Passport
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              Transform your smile and game in paradise. Experience world-class medical care
              and pickleball training in Thailand at 60-70% savings.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <a href="mailto:info@pickleballpassport.com" className="hover:text-white transition-colors">
                  info@pickleballpassport.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Chiang Mai, Thailand</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-3">
              {navigation.explore.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-400">
              © {currentYear} Pickleball Passport. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>JCI Accredited Medical Facilities</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Licensed Medical Tourism</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
