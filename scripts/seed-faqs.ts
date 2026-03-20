/**
 * Seed FAQ data into production database
 * Run: npx tsx scripts/seed-faqs.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to create TipTap JSON from plain text paragraphs
function richText(...paragraphs: string[]) {
  return {
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  }
}

const SYSTEM_USER = 'system-seed'

const categories = [
  { name: 'General', slug: 'general', description: 'About The Pickleball Passport', sortOrder: 1 },
  { name: 'Trips & Packages', slug: 'trips-packages', description: 'Booking, accommodation, and itineraries', sortOrder: 2 },
  { name: 'Pickleball', slug: 'pickleball', description: 'Courts, sessions, and skill levels', sortOrder: 3 },
  { name: 'Wellness & Culture', slug: 'wellness-culture', description: 'Wellness amenities, excursions, and dining', sortOrder: 4 },
  { name: 'Travel & Logistics', slug: 'travel-logistics', description: 'Visas, flights, and getting around', sortOrder: 5 },
  { name: 'Payments & Pricing', slug: 'payments-pricing', description: 'Costs, payment plans, and refunds', sortOrder: 6 },
]

const faqs: Record<string, { question: string; answer: string[]; sortOrder: number }[]> = {
  general: [
    {
      question: 'What is The Pickleball Passport?',
      answer: [
        'The Pickleball Passport is a curated travel experience that combines exceptional pickleball with boutique hotels, cultural immersion, and wellness in Thailand.',
        'We coordinate everything, from structured court sessions and private transportation to handpicked accommodations, group dinners, and cultural excursions across Thailand.',
      ],
      sortOrder: 1,
    },
    {
      question: 'Who is The Pickleball Passport for?',
      answer: [
        'The Pickleball Passport is for pickleball enthusiasts of all skill levels who want to combine their love of the sport with an unforgettable travel experience. Whether you\'re a competitive player, a social player, or someone who just wants an incredible trip with great people, this is for you.',
        'Travel companions who don\'t play pickleball are also welcome. They enjoy the full trip experience (hotels, dinners, excursions, wellness) at a companion rate without the court sessions.',
      ],
      sortOrder: 2,
    },
    {
      question: 'Where do you go?',
      answer: [
        'Our flagship trip is a 9-day journey through Bangkok and Hua Hin (or Bangkok and Chiang Mai). Two very different Thai destinations that together give you the complete Thailand experience.',
        'Bangkok for energy and street food. Hua Hin for beaches and relaxation. Chiang Mai for temples and nature.',
      ],
      sortOrder: 3,
    },
    {
      question: 'How big are the groups?',
      answer: [
        'Groups are capped at 16 people. Small enough that everyone knows each other by name, large enough for great pickleball matchups and a social atmosphere.',
      ],
      sortOrder: 4,
    },
  ],
  'trips-packages': [
    {
      question: 'What\'s included in the trip?',
      answer: [
        '8 nights at handpicked boutique hotels across 2 cities, daily breakfast, 4 group dinners (including a welcome dinner in each city), private ground transportation, 5 structured pickleball sessions with court fees and equipment, and a dedicated trip host throughout.',
        'Cultural experiences are also included: a Thai cooking class, private long-tail boat sunset cruise, Wat Pho temple tour, and Chinatown street food walk.',
      ],
      sortOrder: 1,
    },
    {
      question: 'What\'s NOT included?',
      answer: [
        'International airfare to/from Bangkok, travel insurance, Michelin dining upgrades (optional), spa treatments beyond hotel amenities, alcoholic beverages beyond group dinner inclusions, meals on designated free nights, and personal shopping.',
        'Gratuities for guides, drivers, and hotel staff are also at your discretion.',
      ],
      sortOrder: 2,
    },
    {
      question: 'How long is the trip?',
      answer: [
        'The Thailand trip is 9 days and 8 nights. You\'ll spend 4 nights in Bangkok and 4 nights in your second destination (Hua Hin or Chiang Mai).',
        'The pace is designed to balance activity with downtime. Every day has structured experiences but also free time for personal exploration.',
      ],
      sortOrder: 3,
    },
    {
      question: 'Can I bring a non-playing companion?',
      answer: [
        'Yes. Companions are welcome and enjoy everything except the pickleball sessions: all the hotels, dinners, excursions, wellness amenities, and cultural experiences.',
        'During booking, select the "Travel Companion" option for companion-specific pricing.',
      ],
      sortOrder: 4,
    },
    {
      question: 'What are the hotel options?',
      answer: [
        'Bangkok: Boutique hotel in Thonglor (4 nights). Bangkok\'s trendiest neighborhood with a full Japanese onsen, sunset pool, and free BTS shuttle.',
        'Second destination varies by route. Hua Hin or Chiang Mai (4 nights). Handpicked boutique properties with wellness amenities and local character.',
      ],
      sortOrder: 5,
    },
  ],
  pickleball: [
    {
      question: 'What skill level do I need?',
      answer: [
        'All skill levels are welcome, from beginners who\'ve only played a few times to tournament-level competitors. Sessions blend structured instruction with social play so everyone improves while having fun.',
        'The overall activity level is a 6 out of 10. Pickleball is the most physically active part of the trip, but the pace is accessible to all fitness levels.',
      ],
      sortOrder: 1,
    },
    {
      question: 'How many pickleball sessions are there?',
      answer: [
        '5 sessions across 2 cities: 3 sessions in Bangkok and 2 at your second destination.',
        'Total court time is approximately 18 hours, split between 10\u201312 hours of instruction and 10\u201314 hours of social play.',
      ],
      sortOrder: 2,
    },
    {
      question: 'What does a typical session look like?',
      answer: [
        'Sessions include warm-ups, structured drills, round-robin play, and competitive brackets. The Bangkok sessions focus on assessment and skill mixing. Your second destination brings skill clinics and the final championship tournament with awards ceremony.',
        'Equipment (paddles and balls) is provided at every venue, though you\'re welcome to bring your own.',
      ],
      sortOrder: 3,
    },
    {
      question: 'Where are the courts?',
      answer: [
        'Courts in Bangkok (Thonglor, walking distance from the hotel) and courts at your second destination (short drive from the hotel).',
        'All venues have regulation courts with professional lighting and quality surfaces.',
      ],
      sortOrder: 4,
    },
  ],
  'wellness-culture': [
    {
      question: 'What wellness amenities are included?',
      answer: [
        'Each hotel was chosen partly for its wellness offerings. Our Bangkok hotel has a full Japanese onsen with 5 mineral baths, steam room, and cold room. Properties at each destination include pools, fitness centers, and wellness amenities.',
        'Hotel pools, fitness centers, and shuttle services to beaches are included at every property.',
      ],
      sortOrder: 1,
    },
    {
      question: 'What cultural experiences are on the itinerary?',
      answer: [
        'The trip includes a private long-tail boat sunset cruise on the Chao Phraya River, a guided Wat Pho temple tour, a Chinatown street food walk, and a Thai cooking class with a morning market tour. Additional excursions vary by route.',
      ],
      sortOrder: 2,
    },
    {
      question: 'What about the dining?',
      answer: [
        '4 group dinners are included: a welcome dinner in each city, a Bangkok farewell dinner, and a closing dinner at your second destination. Daily breakfast is also included at all hotels.',
        'Optional Michelin dining upgrades are available at restaurants like S\u00fchring and Gaa. These are priced separately.',
      ],
      sortOrder: 3,
    },
    {
      question: 'Can I extend my stay for dental or medical work?',
      answer: [
        'Yes. Thailand is a global leader in medical tourism, and some guests choose to add days before or after the trip for dental work, health screenings, or other procedures at JCI-accredited facilities.',
        'This is entirely independent of The Pickleball Passport trip. We can provide general guidance, but medical arrangements are your responsibility.',
      ],
      sortOrder: 4,
    },
  ],
  'travel-logistics': [
    {
      question: 'Do I need a visa for Thailand?',
      answer: [
        'Most Western passport holders (US, UK, EU, Canada, Australia) can enter Thailand visa-free for stays up to 60 days, well beyond the 9-day trip duration.',
        'We recommend checking the latest entry requirements for your specific nationality before booking.',
      ],
      sortOrder: 1,
    },
    {
      question: 'Are airport transfers included?',
      answer: [
        'Yes. All airport transfers and ground transportation are included. Private air-conditioned vans throughout the trip. A driver meets you at Bangkok arrivals on Day 1 and handles all transfers through departure on Day 9.',
      ],
      sortOrder: 2,
    },
    {
      question: 'What\'s the best time of year to visit Thailand?',
      answer: [
        'The peak season runs from November to February when the weather is cooler and drier. Ideal for outdoor pickleball and exploring Thailand.',
        'Thailand is a year-round destination, though. The "green season" (June\u2013October) has occasional rain but lower prices and fewer crowds.',
      ],
      sortOrder: 3,
    },
    {
      question: 'Do I need travel insurance?',
      answer: [
        'We strongly recommend all guests purchase comprehensive travel insurance covering medical expenses, trip cancellation, and personal liability. We can provide recommendations during onboarding.',
        'Prior to departure, all guests will complete a standard liability waiver as part of the onboarding process.',
        'Recommended providers include World Nomads, Allianz Travel, and SafetyWing, all of which offer plans that cover adventure sports and international travel.',
      ],
      sortOrder: 4,
    },
    {
      question: 'What should I pack?',
      answer: [
        'Athletic wear for pickleball (moisture-wicking clothes, court shoes with non-marking soles), comfortable walking shoes for excursions, swimwear, sunscreen, and a light rain jacket.',
        'Thailand is hot year-round (28\u201335\u00b0C / 82\u201395\u00b0F), so pack light, breathable fabrics. Temples require covered shoulders and knees. Bring a sarong or light long pants.',
      ],
      sortOrder: 5,
    },
  ],
  'payments-pricing': [
    {
      question: 'What payment methods do you accept?',
      answer: [
        'We accept all major credit and debit cards (Visa, Mastercard, American Express) processed securely through Stripe.',
        'All prices are displayed in USD.',
      ],
      sortOrder: 1,
    },
    {
      question: 'Is there a deposit option?',
      answer: [
        'Yes. You can secure your spot with a 25% deposit. The remaining 75% is due 30 days before departure.',
        'Alternatively, you can pay in full at the time of booking and receive a 2% early booking discount.',
      ],
      sortOrder: 2,
    },
    {
      question: 'What is the cancellation and refund policy?',
      answer: [
        'Cancellations 60+ days before departure receive a full refund minus a $500 processing fee. Cancellations 30\u201360 days before departure receive a 50% refund. Cancellations less than 30 days before departure are non-refundable.',
        'You can also transfer your booking to another person at no charge up to 30 days before departure, or opt for a full trip credit (no processing fee) valid for 12 months if you cancel 60+ days out.',
      ],
      sortOrder: 3,
    },
    {
      question: 'Are there any hidden fees?',
      answer: [
        'No. The trip price covers everything listed in the "What\'s Included" section. There are no surprise charges for transportation, court fees, equipment, or included activities.',
        'Optional extras like Michelin dining upgrades, spa treatments, and beach club access are priced separately and transparently.',
      ],
      sortOrder: 4,
    },
  ],
}

async function main() {
  console.log('Seeding FAQ categories...')

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const created = await prisma.fAQCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    })
    categoryMap[cat.slug] = created.id
    console.log(`  \u2713 ${cat.name} (${created.id})`)
  }

  console.log('\nSeeding FAQs...')

  for (const [slug, items] of Object.entries(faqs)) {
    const categoryId = categoryMap[slug]
    if (!categoryId) {
      console.error(`  \u2717 No category found for slug: ${slug}`)
      continue
    }

    for (const item of items) {
      // Check if FAQ already exists by question + category
      const existing = await prisma.fAQ.findFirst({
        where: { question: item.question, categoryId },
      })

      if (existing) {
        console.log(`  \u2192 Skipping (exists): ${item.question}`)
        continue
      }

      await prisma.fAQ.create({
        data: {
          question: item.question,
          answer: richText(...item.answer),
          answerPlain: item.answer.join(' '),
          sortOrder: item.sortOrder,
          isPublished: true,
          categoryId,
          createdBy: SYSTEM_USER,
          updatedBy: SYSTEM_USER,
        },
      })
      console.log(`  \u2713 ${item.question}`)
    }
  }

  const count = await prisma.fAQ.count({ where: { isPublished: true } })
  console.log(`\nDone. ${count} published FAQs in database.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
