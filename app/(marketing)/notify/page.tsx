'use client';

import Link from 'next/link';

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

      {/* Placeholder — swap in GHL form when ready */}
      <section className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl border border-[#B08D55]/10 shadow-lg p-10">
            <p className="text-[#1D2D44]/70 text-lg mb-6">
              Interested in a future destination? Drop us a line and we will
              notify you the moment booking opens.
            </p>
            <a
              href="mailto:hello@thepickleballpassport.org"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold rounded-xl shadow-lg shadow-[#B08D55]/25 hover:shadow-xl transition-all"
            >
              Email Us
            </a>
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
