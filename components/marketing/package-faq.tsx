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
        'The package price includes premier accommodations, all meals, daily pickleball sessions, airport transfers, cultural excursions, and 24/7 concierge support. Select wellness add-ons and upgrades are available at additional cost.',
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
    'Play & Explore': [
      {
        question: 'What excursions are included?',
        answer:
          'Each trip includes curated cultural excursions such as temple visits, local market tours, Thai cooking classes, and island day trips. The exact activities vary by destination and trip duration.',
      },
      {
        question: 'What wellness activities are available?',
        answer:
          'Our trips include spa treatments, Thai massage, yoga sessions, and other wellness activities. You can also add private coaching, extra excursions, and other upgrades during booking.',
      },
    ],
    'Total Wellness': [
      {
        question: 'What wellness treatments are included?',
        answer:
          'Each trip includes daily wellness offerings such as yoga, meditation, Thai massage, and spa treatments. We partner with top-rated wellness venues at each destination.',
      },
      {
        question: 'Can I customize my wellness activities?',
        answer:
          'Yes! You can choose from a menu of wellness add-ons during booking, or work with our team to build a custom itinerary that matches your goals.',
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
            href="mailto:hello@thepickleballpassport.org"
            className="font-medium underline"
          >
            hello@thepickleballpassport.org
          </a>{' '}
          or schedule a free consultation call
        </p>
      </div>
    </div>
  );
}
