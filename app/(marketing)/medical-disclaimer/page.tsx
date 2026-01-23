'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
            Medical Disclaimer
          </h1>
          <p className="text-xl text-blue-100">
            Important information about medical services
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">
                Please read this medical disclaimer carefully before using our services or
                making any healthcare decisions.
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> January 2025
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              General Information
            </h2>
            <p className="text-gray-600 mb-4">
              Pickleball Passport provides facilitation services for medical tourism. We are not
              a medical provider, hospital, or healthcare facility. The information provided on
              our website and through our services is for general informational purposes only
              and should not be considered medical advice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Not Medical Advice
            </h2>
            <p className="text-gray-600 mb-4">
              The content on this website, including text, graphics, images, and other material,
              is not intended to be a substitute for professional medical advice, diagnosis, or
              treatment. Always seek the advice of your physician or other qualified health
              provider with any questions you may have regarding a medical condition.
            </p>
            <p className="text-gray-600 mb-4">
              Never disregard professional medical advice or delay in seeking it because of
              something you have read on this website. If you think you may have a medical
              emergency, call your doctor or emergency services immediately.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Medical Tourism Risks
            </h2>
            <p className="text-gray-600 mb-4">
              Medical tourism, including procedures performed outside your home country,
              carries inherent risks including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Complications during or after procedures</li>
              <li>Difficulties with follow-up care upon returning home</li>
              <li>Differences in medical standards and regulations</li>
              <li>Language barriers affecting communication with healthcare providers</li>
              <li>Limited legal recourse in case of malpractice</li>
              <li>Risks associated with air travel after medical procedures</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Partner Facilities
            </h2>
            <p className="text-gray-600 mb-4">
              While we partner with JCI-accredited facilities and carefully vet our medical
              partners, Pickleball Passport does not guarantee or warrant the quality, safety,
              or outcomes of any medical procedures. Each medical facility operates independently
              and is solely responsible for the care they provide.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Individual Results
            </h2>
            <p className="text-gray-600 mb-4">
              Medical and cosmetic procedure results vary by individual. Testimonials and
              before/after images represent individual experiences and are not guarantees of
              similar results. Your results may differ based on your health condition, adherence
              to post-procedure care, and other factors.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Physical Activity Disclaimer
            </h2>
            <p className="text-gray-600 mb-4">
              Pickleball and other physical activities included in our programs carry inherent
              risks of injury. Participation is voluntary. You should consult with your physician
              before beginning any exercise program, especially following medical procedures.
              Pickleball Passport is not responsible for injuries sustained during physical
              activities.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Your Responsibility
            </h2>
            <p className="text-gray-600 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Consulting with your local healthcare providers before travel</li>
              <li>Providing accurate and complete medical history to all providers</li>
              <li>Understanding the risks and benefits of any procedures</li>
              <li>Following all pre-operative and post-operative instructions</li>
              <li>Obtaining appropriate travel and medical insurance</li>
              <li>Making your own informed healthcare decisions</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this medical disclaimer, please contact us at{' '}
              <a href="mailto:info@pickleballpassport.com" className="text-[#003D5C] hover:underline">
                info@pickleballpassport.com
              </a>.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link href="/" className="text-[#003D5C] hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
