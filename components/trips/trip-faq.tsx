'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Do I need a visa for Thailand?',
    answer:
      'US citizens can enter Thailand visa-free for stays up to 30 days. Our trip is 9 days, so no visa is needed. We provide a pre-trip checklist with all entry requirements, including passport validity (must be valid for 6+ months after arrival).',
  },
  {
    question: 'What should I pack?',
    answer:
      'Light, breathable clothing for tropical weather (80\u201395\u00b0F / 27\u201335\u00b0C). Pickleball gear: court shoes, moisture-wicking clothes, hat, sunglasses. We provide paddles and balls. Bring a light jacket for air-conditioned restaurants and temples (shoulders and knees must be covered). Comfortable walking shoes for temples and markets. Swimwear for pools, beaches, and boat trips.',
  },
  {
    question: 'What fitness level is required?',
    answer:
      'Moderate. This is a 6/10 on our activity scale. Pickleball sessions are the most physically active part. All skill levels welcome, and we group by ability. Cultural activities include walking tours, boat rides, and cooking classes. Wellness days at the hotels offer pool time, spa access, and relaxation. The pace is designed to be enjoyable, not exhausting.',
  },
  {
    question: 'Can you accommodate dietary restrictions?',
    answer:
      'Yes. Thailand is excellent for dietary accommodations. Please note any allergies or restrictions on your booking form. We communicate directly with every restaurant and hotel kitchen. Vegetarian, vegan, gluten-free, and halal options are widely available.',
  },
  {
    question: 'What are tipping customs in Thailand?',
    answer:
      'Tipping is appreciated but not expected. We suggest 20\u201350 THB ($0.60\u2013$1.50) for small services and 100\u2013200 THB ($3\u2013$6) for exceptional service. Gratuities for guides and drivers are not included in the trip price.',
  },
  {
    question: 'When is the best time to visit Thailand?',
    answer:
      'Our trips run during Thailand\u2019s cool season (November\u2013February), when temperatures are comfortable (75\u201390\u00b0F) and rainfall is minimal. This is peak season for tourism but our itinerary avoids the worst crowds.',
  },
  {
    question: 'Can I join as a solo traveler?',
    answer:
      'Absolutely. Many of our guests travel solo. It\u2019s one of the best ways to meet like-minded people. We offer single occupancy rooms (private room, premium rate) and double occupancy (shared room, matched with another solo traveler). You\u2019ll be part of a group of up to 16 for all activities, meals, and pickleball sessions.',
  },
  {
    question: 'Can my non-playing partner/companion join?',
    answer:
      'Yes! We offer a Travel Companion rate that includes all hotels, meals, cultural activities, adventures, and transportation, just without the pickleball sessions. Your companion experiences everything except court time.',
  },
];

export function TripFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-[#1D2D44] mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-[#1D2D44]/60 text-sm">
          Everything you need to know before booking your trip.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border transition-all ${
                isExpanded
                  ? 'border-[#B08D55]/40 bg-[#FDF8F3] shadow-md'
                  : 'border-[#1D2D44]/10 bg-white hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#FDF8F3]/50"
              >
                <h3 className="font-serif font-semibold text-[#1D2D44] pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-[#1D2D44]/40 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#B08D55]/20 px-4 pb-4 pt-3">
                      <p className="text-sm text-[#1D2D44]/80 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
