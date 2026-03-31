'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';

const GHL_FORM_BASE_URL = 'https://api.leadconnectorhq.com/widget/form/PkzQfxB3VtWVxh0cLkNO';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function ReserveForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || getCookieValue('referral_code') || '';

  const iframeSrc = ref
    ? `${GHL_FORM_BASE_URL}?ref=${encodeURIComponent(ref)}`
    : GHL_FORM_BASE_URL;

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
            Reserve Your Spot
          </h1>
          <p className="text-white/70 text-base">
            Fill out the form below and our team will be in touch to finalize your booking.
          </p>
        </div>
      </section>

      {/* GHL Form */}
      <section className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <iframe
            src={iframeSrc}
            style={{ width: '100%', height: '971px', border: 'none', borderRadius: '3px' }}
            id="inline-PkzQfxB3VtWVxh0cLkNO"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Reserve Your Spot"
            data-height="971"
            data-layout-iframe-id="inline-PkzQfxB3VtWVxh0cLkNO"
            data-form-id="PkzQfxB3VtWVxh0cLkNO"
            title="Reserve Your Spot"
          />
          <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
        </div>
      </section>

      {/* Back link */}
      <section className="pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/trips" className="text-[#1D2D44]/60 hover:text-[#1D2D44] text-sm">
            &larr; Back to Trips
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ReservePage() {
  return (
    <Suspense>
      <ReserveForm />
    </Suspense>
  );
}
