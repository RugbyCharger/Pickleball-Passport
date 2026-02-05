'use client';

import Link from 'next/link';
import { DollarSign } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
            Refund Policy
          </h1>
          <p className="text-xl text-blue-100">
            Our commitment to fair and transparent refunds
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <DollarSign className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-800">
                We understand that plans change. Our refund policy is designed to be fair to
                all parties while protecting our ability to deliver exceptional experiences.
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> January 2025
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Deposit and Payment Structure
            </h2>
            <p className="text-gray-600 mb-4">
              Our standard payment structure is as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Initial Deposit:</strong> 25% due at booking confirmation</li>
              <li><strong>Second Payment:</strong> 50% due 60 days before travel</li>
              <li><strong>Final Payment:</strong> 25% due 30 days before travel</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Cancellation by Guest
            </h2>
            <p className="text-gray-600 mb-4">
              If you need to cancel your booking, the following refund schedule applies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>90+ days before travel:</strong> Full refund minus a $500 administrative fee</li>
              <li><strong>60-89 days before travel:</strong> 75% refund of total amount paid</li>
              <li><strong>30-59 days before travel:</strong> 50% refund of total amount paid</li>
              <li><strong>15-29 days before travel:</strong> 25% refund of total amount paid</li>
              <li><strong>Less than 15 days before travel:</strong> No refund</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Rescheduling
            </h2>
            <p className="text-gray-600 mb-4">
              We understand that flexibility is important. You may reschedule your trip under
              the following conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>60+ days before travel:</strong> One free reschedule to a date within 12 months</li>
              <li><strong>30-59 days before travel:</strong> Reschedule fee of $250</li>
              <li><strong>Less than 30 days before travel:</strong> Reschedule fee of $500</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Note: Rescheduling is subject to availability and may result in price adjustments
              if package costs have changed.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Cancellation by Pickleball Passport
            </h2>
            <p className="text-gray-600 mb-4">
              In rare circumstances, we may need to cancel or modify your booking due to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Medical facility unavailability</li>
              <li>Government travel advisories or restrictions</li>
              <li>Natural disasters or force majeure events</li>
              <li>Minimum guest count not met for group experiences</li>
            </ul>
            <p className="text-gray-600 mb-4">
              If we cancel your booking, you will receive either:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>A full refund of all amounts paid, OR</li>
              <li>A credit for the full amount toward a future booking</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Medical Procedure Refunds
            </h2>
            <p className="text-gray-600 mb-4">
              Medical procedures have specific refund terms:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Procedure deposits paid directly to medical facilities may have separate refund policies</li>
              <li>If a procedure is deemed medically inadvisable after consultation, medical fees will be refunded</li>
              <li>No refunds for procedures already performed</li>
              <li>Additional procedures requested during your stay are non-refundable once performed</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Non-Refundable Items
            </h2>
            <p className="text-gray-600 mb-4">
              The following are generally non-refundable:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Airfare purchased through third parties</li>
              <li>Travel insurance premiums</li>
              <li>Visa application fees</li>
              <li>Services already rendered</li>
              <li>Custom or personalized items</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Travel Insurance
            </h2>
            <p className="text-gray-600 mb-4">
              We strongly recommend purchasing comprehensive travel insurance that includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Trip cancellation and interruption coverage</li>
              <li>Medical coverage abroad</li>
              <li>Emergency evacuation coverage</li>
              <li>&ldquo;Cancel for any reason&rdquo; coverage (if available)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              How to Request a Refund
            </h2>
            <p className="text-gray-600 mb-4">
              To request a refund or discuss your options:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 mb-4 space-y-2">
              <li>Email us at <a href="mailto:support@pickleballpassport.com" className="text-[#1D2D44] hover:underline">support@pickleballpassport.com</a></li>
              <li>Include your booking confirmation number</li>
              <li>Explain your reason for cancellation</li>
              <li>Our team will respond within 2 business days</li>
            </ol>
            <p className="text-gray-600 mb-4">
              Approved refunds are processed within 10-14 business days to your original payment method.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              Questions about our refund policy? Contact our support team at{' '}
              <a href="mailto:support@pickleballpassport.com" className="text-[#1D2D44] hover:underline">
                support@pickleballpassport.com
              </a>{' '}
              or call +1 (234) 567-890.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-[#1D2D44] hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
