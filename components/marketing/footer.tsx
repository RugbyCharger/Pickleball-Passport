'use client';

/**
 * Footer Component
 *
 * Tropical resort-inspired footer with newsletter signup
 */

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Palmtree, Sun, Waves, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { LogoIcon } from '@/components/ui/logo';
import { useLeadModal } from '@/components/providers/lead-modal-provider';

const navigation = {
  explore: [
    { name: 'Trips', href: '/trips' },
    { name: 'About Us', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Apply Now', href: '/apply' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Trust & Safety', href: '/trust-and-safety' },
    { name: 'Refund Policy', href: '/refund-policy' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1CS1Rar7iR/?mibextid=wwXIfr',
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/pickleball.passport',
      icon: Instagram,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jaron-shoptaugh-ab675574/',
      icon: Linkedin,
    },
  ],
};

const emailSchema = z.string().email('Please enter a valid email address');

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { openLeadModal } = useLeadModal();

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

      {/* Newsletter Section - Hidden until email service is configured */}
      <div className="bg-gradient-to-b from-[#FDF8F3] to-[#F5E6D3] pt-16 pb-12 relative hidden">
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
              By subscribing, you agree to receive marketing emails from The Pickleball Passport. Unsubscribe anytime.
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
                    The Pickleball Passport
                  </span>
                  <span className="text-sm text-[#B08D55] font-medium tracking-wider">
                    Play the World
                  </span>
                </div>
              </Link>
              <p className="text-[#7587A5] mb-8 max-w-sm text-base leading-relaxed">
                The ultimate pickleball getaway. Curated multi-city trips with outstanding courts, boutique hotels, cultural immersion, and wellness recovery.
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
                  href="tel:+15125648522"
                  className="flex items-center space-x-4 text-white/80 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <Phone className="h-5 w-5 text-[#B08D55]" />
                  </div>
                  <span>+1 512-564-8522</span>
                </a>
                <a
                  href="https://wa.me/66991433298"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 text-white/80 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center group-hover:bg-[#B08D55]/30 transition-colors">
                    <svg className="h-5 w-5 text-[#B08D55]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span>WhatsApp: +66 99-143-3298</span>
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
                    {item.name === 'Apply Now' ? (
                      <button
                        onClick={() => openLeadModal()}
                        className="text-white/70 hover:text-[#B08D55] transition-colors flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55]/50 group-hover:bg-[#B08D55] transition-colors" />
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-white/70 hover:text-[#B08D55] transition-colors flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B08D55]/50 group-hover:bg-[#B08D55] transition-colors" />
                        {item.name}
                      </Link>
                    )}
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
                © {currentYear} The Pickleball Passport. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
