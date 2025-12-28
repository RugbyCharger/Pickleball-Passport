'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PackageFAQProps {
  packageName: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Get package-specific FAQs
 */
function getPackageFAQs(packageName: string): FAQItem[] {
  const commonFAQs: FAQItem[] = [
    {
      question: 'What is included in the package price?',
      answer:
        'The package price includes luxury accommodations, all meals, daily pickleball sessions, airport transfers, cultural excursions, and 24/7 concierge support. Medical procedures and select add-ons are additional.',
    },
    {
      question: 'How do I book this package?',
      answer:
        'Start by submitting an application on our website. Our team will review your application and schedule a video consultation to discuss your goals and preferences. After that, we will create a custom package and help you secure your spot.',
    },
    {
      question: 'What is your cancellation policy?',
      answer:
        'We offer flexible cancellation up to 60 days before departure with a full refund minus a $500 processing fee. Cancellations 30-60 days prior receive 50% refund. Within 30 days, deposits are non-refundable. We strongly recommend travel insurance.',
    },
    {
      question: 'Do I need a visa for Thailand?',
      answer:
        'US citizens can enter Thailand visa-free for stays up to 30 days. For longer trips, you may need a tourist visa. We provide guidance and support for all visa requirements as part of your pre-trip preparation.',
    },
    {
      question: 'What level of pickleball experience do I need?',
      answer:
        'All skill levels are welcome! We group players by ability for drills and matches. Whether you are a beginner or advanced player, you will find competitive and fun games with skill-matched partners.',
    },
    {
      question: 'Are solo travelers welcome?',
      answer:
        'Absolutely! Many of our guests travel solo and find it is a great way to meet like-minded people. We can arrange single accommodations and you will be part of a group for activities and meals.',
    },
  ];

  // Add package-specific FAQs
  const packageSpecificFAQs: Record<string, FAQItem[]> = {
    'Smile Makeover': [
      {
        question: 'How much do dental procedures cost?',
        answer:
          'Dental work in Thailand costs 60-70% less than in the US. For example, porcelain veneers are $450/tooth (vs $1,500 in US), and dental implants are $1,200 (vs $4,000 in US). We provide detailed pricing during your consultation.',
      },
      {
        question: 'How do I choose my dentist?',
        answer:
          'We partner with JCI-accredited dental clinics in Phuket with US/UK-trained dentists. During your video consultation, we will show you clinic credentials, dentist profiles, and before/after photos to help you choose.',
      },
    ],
    'Total Transformation': [
      {
        question: 'What cosmetic procedures are available?',
        answer:
          'We offer a full range including Botox, fillers, laser treatments, facelifts, liposuction, tummy tucks, Brazilian butt lifts, and hair transplants. All procedures are performed by board-certified surgeons in JCI-accredited hospitals.',
      },
      {
        question: 'How long is the recovery time?',
        answer:
          'Recovery varies by procedure. Minor treatments like Botox require minimal downtime. Surgical procedures typically need 7-14 days before you can resume light pickleball. We provide personalized post-op care and adjust activities accordingly.',
      },
    ],
    'Spiritual Journey': [
      {
        question: 'What spiritual practices are included?',
        answer:
          'Daily meditation with Buddhist monks, yoga and pranayama sessions, temple visits, sound healing with Tibetan bowls, mindfulness workshops, and Reiki energy work. All practices are optional and inclusive of all beliefs.',
      },
    ],
  };

  const specificFAQs = packageSpecificFAQs[packageName] || [];
  return [...specificFAQs, ...commonFAQs];
}

/**
 * PackageFAQ Component
 * Displays package-specific frequently asked questions in an accordion
 */
export function PackageFAQ({ packageName }: PackageFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const faqs = getPackageFAQs(packageName);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
        >
          {/* Question */}
          <button
            onClick={() => toggleFAQ(index)}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
          >
            <h3 className="pr-4 font-semibold text-gray-900">{faq.question}</h3>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                expandedIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Answer */}
          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Additional Questions CTA */}
      <div className="mt-6 rounded-lg border-2 border-emerald-100 bg-emerald-50 p-4 text-center">
        <p className="mb-2 font-medium text-emerald-900">
          Have more questions?
        </p>
        <p className="text-sm text-emerald-700">
          Email us at{' '}
          <a
            href="mailto:info@pickleballpassport.com"
            className="font-medium underline"
          >
            info@pickleballpassport.com
          </a>{' '}
          or schedule a free consultation call
        </p>
      </div>
    </div>
  );
}
