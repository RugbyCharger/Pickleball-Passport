'use client';

import { useEffect } from 'react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Silently appends ?ref=PARTNER to every FastPayDirect payment link on the page
// when a tpp_ref affiliate cookie is present. Runs once on mount.
export function AffiliateTracker() {
  useEffect(() => {
    const ref = getCookie('tpp_ref');
    if (!ref) return;

    const links = document.querySelectorAll<HTMLAnchorElement>(
      'a[href*="fastpaydirect.com"]'
    );

    links.forEach((link) => {
      const href = link.getAttribute('href') ?? '';
      if (!href.includes('ref=')) {
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', `${href}${separator}ref=${encodeURIComponent(ref)}`);
      }
    });
  }, []);

  return null;
}
