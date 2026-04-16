'use client';

import Link from 'next/link';
import Script from 'next/script';

export default function NotifyPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
            Get Notified
          </h1>
          <p className="text-white/70 text-base">
            Be the first to know when new destinations launch.
          </p>
        </div>
      </section>

      {/* GHL Notify Me Form */}
      <section className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#B08D55]/10 shadow-lg overflow-hidden">
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/LBIrAn6DfhY8MKFOzuU4"
              style={{ width: '100%', height: '901px', border: 'none', borderRadius: '3px' }}
              id="inline-LBIrAn6DfhY8MKFOzuU4"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Website: Notify Me - General"
              data-height="901"
              data-layout-iframe-id="inline-LBIrAn6DfhY8MKFOzuU4"
              data-form-id="LBIrAn6DfhY8MKFOzuU4"
              title="Website: Notify Me - General"
            />
            <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
          </div>
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
