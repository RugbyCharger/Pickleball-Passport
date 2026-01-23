'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Packages', href: '/packages' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Testimonials', href: '/testimonials' },
  { name: 'Partners', href: '/partners' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

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

  const getDashboardLink = () => {
    const role = user?.publicMetadata?.role as string | undefined;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'partner') return '/partner/dashboard';
    return '/guest/dashboard';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-[#003D5C]/5 border-b border-[#D4AF37]/20'
          : 'bg-transparent'
      }`}
    >
      {/* Decorative top accent line */}
      <div className="h-1 bg-gradient-to-r from-[#003D5C] via-[#D4AF37] to-[#003D5C]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-18 items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              {/* Logo mark with tropical gradient */}
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#003D5C] to-[#4AA4B5] shadow-lg shadow-[#003D5C]/20 transition-transform group-hover:scale-105">
                  <span className="text-2xl" role="img" aria-label="Pickleball">🏓</span>
                </div>
                {/* Golden shimmer accent */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full opacity-80 animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-serif text-xl font-bold text-[#003D5C] tracking-tight">
                  Pickleball Passport
                </span>
                <span className="text-xs text-[#D4AF37] font-medium tracking-widest uppercase">
                  Thailand Wellness
                </span>
              </div>
              <span className="font-serif text-xl font-bold text-[#003D5C] sm:hidden">
                PP
              </span>
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
                    ? 'text-[#003D5C] bg-[#F5E6D3]/50'
                    : 'text-[#003D5C]/70 hover:text-[#003D5C] hover:bg-[#F5E6D3]/30'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D4AF37] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:items-center lg:space-x-3">
            {isSignedIn ? (
              <Button
                asChild
                className="bg-[#003D5C] hover:bg-[#002B42] text-white shadow-lg shadow-[#003D5C]/20"
              >
                <Link href={getDashboardLink()}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-[#003D5C] hover:bg-[#F5E6D3]/50">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-semibold shadow-lg shadow-[#D4AF37]/30 transition-all hover:shadow-xl hover:shadow-[#D4AF37]/40"
                >
                  <Link href="/apply">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Your Journey
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-[#003D5C] hover:bg-[#F5E6D3]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors"
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
          <div className="border-t border-[#D4AF37]/20 py-4">
            {/* Navigation Links */}
            <div className="space-y-1 pb-4">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-[#F5E6D3] to-[#FDF8F3] text-[#003D5C] border-l-4 border-[#D4AF37]'
                      : 'text-[#003D5C]/70 hover:bg-[#F5E6D3]/30 hover:text-[#003D5C]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile CTA Buttons */}
            <div className="border-t border-[#D4AF37]/20 pt-4 pb-2 space-y-3">
              {isSignedIn ? (
                <Button
                  asChild
                  className="w-full bg-[#003D5C] hover:bg-[#002B42] text-white py-6"
                >
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <User className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#003D5C]/30 text-[#003D5C] hover:bg-[#F5E6D3]/50 py-6"
                  >
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-semibold py-6"
                  >
                    <Link href="/apply" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start Your Journey
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
