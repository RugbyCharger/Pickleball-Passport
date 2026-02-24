import Script from 'next/script';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-white">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1D2D44] mb-4">
            Start Your Journey
          </h1>
          <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
            Tell us about yourself and your travel interests. We&apos;ll be in touch within 24 hours.
          </p>
        </div>

        {/* Typeform Embed */}
        <div
          data-tf-live="UIsuRRuY"
          style={{ width: '100%', minHeight: '600px' }}
        />
        <Script src="//embed.typeform.com/next/embed.js" strategy="afterInteractive" />
      </div>
    </div>
  );
}
