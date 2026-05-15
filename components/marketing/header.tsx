'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles } from 'lucide-react';
import { LogoIcon } from '@/components/ui/logo';
import { useLeadModal } from '@/components/providers/lead-modal-provider';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Trips', href: '/trips' },
  { name: 'Partners', href: '/partners' },
  { name: 'About Us', href: '/about' },
  { name: 'Newsletter', href: '/newsletter' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { openLeadModal } = useLeadModal();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-[#1D2D44]/5 border-b border-[#B08D55]/20'
          : 'bg-transparent'
      }`}
    >
      {/* Decorative top accent line */}
      <div className="h-1 bg-gradient-to-r from-[#1D2D44] via-[#B08D55] to-[#1D2D44]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-18 items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              {/* Logo mark */}
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-[#1D2D44]/20 transition-transform group-hover:scale-105">
                  <LogoIcon size="lg" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-serif text-xl font-bold text-[#1D2D44] tracking-tight">
                  The Pickleball Passport
                </span>
                <span className="text-xs text-[#B08D55] font-medium tracking-widest uppercase">
                  Play the World
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive(item.href)
                    ? 'text-[#1D2D44] bg-[#F5E6D3]/50'
                    : 'text-[#1D2D44]/70 hover:text-[#1D2D44] hover:bg-[#F5E6D3]/30'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#B08D55] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3">
            <Button
              onClick={() => openLeadModal()}
              className="bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-semibold shadow-lg shadow-[#B08D55]/30 transition-all hover:shadow-xl hover:shadow-[#B08D55]/40"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Your Journey
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-[#1D2D44] hover:bg-[#F5E6D3]/50 focus:outline-none focus:ring-2 focus:ring-[#B08D55] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-[#B08D55]/20 py-4">
            {/* Navigation Links */}
            <div className="space-y-1 pb-4">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-[#F5E6D3] to-[#FDF8F3] text-[#1D2D44] border-l-4 border-[#B08D55]'
                      : 'text-[#1D2D44]/70 hover:bg-[#F5E6D3]/30 hover:text-[#1D2D44]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile CTA Buttons */}
            <div className="border-t border-[#B08D55]/20 pt-4 pb-2 space-y-3">
              <Button
                onClick={() => { openLeadModal(); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-semibold py-6"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
