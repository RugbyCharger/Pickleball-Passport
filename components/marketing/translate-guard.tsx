'use client';

import { useEffect } from 'react';

export function TranslateGuard() {
  useEffect(() => {
    if (!window.location.hostname.endsWith('.translate.goog')) return;

    const params = new URLSearchParams(window.location.search);
    const tlParam = params.get('_x_tr_tl');
    if (!tlParam) return;
    const tl: string = tlParam;

    const sl = params.get('_x_tr_sl') || 'en';
    const hl = params.get('_x_tr_hl') || 'en';
    const host = window.location.hostname;

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      let url: URL;
      try { url = new URL(anchor.href); } catch { return; }

      // Skip external links (payment, WhatsApp, etc.) and hash-only anchors
      const isInternal = url.hostname === host || url.hostname.endsWith('.translate.goog');
      if (!isInternal) return;
      if (anchor.href.startsWith('mailto:') || anchor.href.startsWith('tel:')) return;

      // Already has translate params — Google already rewrote it, let it through
      if (url.searchParams.has('_x_tr_tl')) return;

      // Internal link missing translate params — Next.js would strip them via
      // client-side routing. Force a full page load with params preserved.
      e.preventDefault();
      e.stopPropagation();

      url.searchParams.set('_x_tr_sl', sl);
      url.searchParams.set('_x_tr_tl', tl);
      url.searchParams.set('_x_tr_hl', hl);
      window.location.href = url.toString();
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
