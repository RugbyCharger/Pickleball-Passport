import { PrismaClient, AddOnCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.bookingAddOn.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.partnerReferral.deleteMany();
    await prisma.application.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.addOn.deleteMany();
    await prisma.package.deleteMany();
  }

  // ============================================================================
  // PACKAGES
  // ============================================================================
  console.log('📦 Creating packages...');

  const purePlay = await prisma.package.create({
    data: {
      slug: 'pure-play',
      name: 'Pure Play',
      tagline: 'All Pickleball, All Paradise',
      description: `# The Ultimate Pickleball Paradise Experience

Experience the perfect blend of competitive play and tropical relaxation in Phuket, Thailand. Pure Play is designed for pickleball enthusiasts who want to focus on the game while enjoying world-class amenities.

## What's Included

- **Daily Pickleball Sessions**: Morning and afternoon play with skill-matched partners
- **Professional Coaching**: Optional clinics with certified instructors
- **Luxury Accommodations**: Choose from 3-star to 5-star resorts
- **Thai Wellness**: Daily yoga and meditation sessions
- **Cultural Experiences**: Explore local markets, temples, and beaches
- **All Meals Included**: Authentic Thai cuisine with dietary accommodations

## Perfect For

Players who want to immerse themselves in pickleball while experiencing the beauty and culture of Thailand. No medical or cosmetic procedures. Just pure play, pure paradise.`,
      basePrice: 799900, // $7,999
      durationOptions: [7, 10, 14],
      heroImageUrl: '/images/packages/pure-play-hero.jpg',
      imageUrls: [
        '/images/packages/pure-play-courts.jpg',
        '/images/packages/pure-play-beach.jpg',
        '/images/packages/pure-play-yoga.jpg',
      ],
      metaTitle: 'Pure Play - Pickleball Paradise in Phuket, Thailand',
      metaDescription: 'Join us for the ultimate pickleball vacation in Phuket. Daily play, luxury accommodations, and authentic Thai experiences.',
      isActive: true,
    },
  });

  const smileMakeover = await prisma.package.create({
    data: {
      slug: 'smile-makeover',
      name: 'Smile Makeover',
      tagline: 'Perfect Your Smile, Perfect Your Game',
      description: `# Transform Your Smile in Paradise

Combine world-class dental care with pickleball and tropical relaxation. Our Smile Makeover package includes comprehensive dental treatments at 60-70% less than US prices.

## Dental Services Included

- **Comprehensive Dental Exam**: Full assessment with digital X-rays
- **Professional Cleaning**: Deep cleaning and scaling
- **Custom Treatment Plan**: Tailored to your needs
- **Veneers Package**: Up to 8-16 porcelain veneers
- **Teeth Whitening**: Professional grade whitening

## Plus All Pure Play Amenities

- Daily pickleball sessions
- Luxury accommodations
- Wellness activities
- Cultural experiences
- All meals included

## Medical Tourism Excellence

Our partnered dental clinics are internationally accredited with US/UK trained dentists. Same technology, higher quality, lower prices.`,
      basePrice: 1299900, // $12,999
      durationOptions: [10, 14, 21],
      heroImageUrl: '/images/packages/smile-makeover-hero.jpg',
      imageUrls: [
        '/images/packages/smile-makeover-dental.jpg',
        '/images/packages/smile-makeover-clinic.jpg',
        '/images/packages/smile-makeover-results.jpg',
      ],
      metaTitle: 'Smile Makeover - Dental Tourism & Pickleball in Thailand',
      metaDescription: 'Get a perfect smile at 60% savings while enjoying pickleball in Phuket. World-class dental care meets paradise.',
      isActive: true,
    },
  });

  const totalTransformation = await prisma.package.create({
    data: {
      slug: 'total-transformation',
      name: 'Total Transformation',
      tagline: 'Reinvent Yourself Inside & Out',
      description: `# The Ultimate Wellness & Aesthetic Journey

Our most comprehensive package combines cosmetic procedures, dental work, wellness therapies, and pickleball for a complete transformation experience.

## Cosmetic Procedures Available

- **Facial Procedures**: Botox, fillers, laser treatments, face lifts
- **Body Contouring**: Liposuction, tummy tuck, Brazilian butt lift
- **Skin Treatments**: Laser resurfacing, chemical peels, microneedling
- **Hair Restoration**: FUE hair transplants

## Dental Makeover

- Full smile makeover with veneers
- Dental implants if needed
- Comprehensive oral care

## Wellness & Recovery

- **Post-Procedure Care**: Private nursing support
- **Spa Treatments**: Daily massage and healing therapies
- **Nutrition Coaching**: Personalized meal plans
- **Light Pickleball**: Gentle play as you recover

## Medical Excellence

Board-certified surgeons with international training. JCI-accredited facilities with luxury recovery suites.`,
      basePrice: 1999900, // $19,999
      durationOptions: [14, 21],
      heroImageUrl: '/images/packages/total-transformation-hero.jpg',
      imageUrls: [
        '/images/packages/total-transformation-medical.jpg',
        '/images/packages/total-transformation-recovery.jpg',
        '/images/packages/total-transformation-spa.jpg',
      ],
      metaTitle: 'Total Transformation - Medical Tourism & Wellness in Phuket',
      metaDescription: 'Complete aesthetic transformation with world-class medical care, wellness therapies, and pickleball in paradise.',
      isActive: true,
    },
  });

  const spiritualJourney = await prisma.package.create({
    data: {
      slug: 'spiritual-journey',
      name: 'Spiritual Journey',
      tagline: 'Find Your Inner Peace, Elevate Your Game',
      description: `# Wellness, Mindfulness & Pickleball

A transformative experience focused on spiritual growth, mental wellness, and physical rejuvenation through pickleball, meditation, and Thai healing traditions.

## Spiritual Practices

- **Daily Meditation**: Guided sessions with Buddhist monks
- **Yoga & Pranayama**: Morning and evening practices
- **Temple Visits**: Sacred sites and spiritual ceremonies
- **Sound Healing**: Tibetan bowls and gong therapy
- **Mindfulness Workshops**: Learn techniques for daily life

## Wellness Treatments

- **Thai Massage**: Traditional healing massage
- **Herbal Therapies**: Ancient remedies and treatments
- **Detox Programs**: Cleansing juices and therapies
- **Reiki & Energy Work**: Chakra balancing

## Pickleball Mindfully

Play with intention, focus on the mental game, and connect deeply with fellow players. This isn't about competition. It's about joy.`,
      basePrice: 899900, // $8,999
      durationOptions: [7, 10, 14],
      heroImageUrl: '/images/packages/spiritual-journey-hero.jpg',
      imageUrls: [
        '/images/packages/spiritual-journey-meditation.jpg',
        '/images/packages/spiritual-journey-temple.jpg',
        '/images/packages/spiritual-journey-yoga.jpg',
      ],
      metaTitle: 'Spiritual Journey - Wellness & Pickleball Retreat in Thailand',
      metaDescription: 'Transform mind, body, and spirit with meditation, Thai healing, and pickleball in sacred Phuket.',
      isActive: true,
    },
  });

  console.log(`✅ Created ${4} packages`);

  // ============================================================================
  // ITINERARIES
  // ============================================================================
  console.log('📅 Creating itineraries...');

  await prisma.itinerary.create({
    data: {
      packageId: purePlay.id,
      duration: 7,
      content: JSON.stringify([
        {
          day: 1,
          title: 'Arrival & Welcome',
          activities: [
            'Airport pickup and transfer to resort',
            'Welcome dinner with fellow players',
            'Orientation and court tour',
          ],
        },
        {
          day: 2,
          title: 'Get in the Game',
          activities: [
            'Morning pickleball session (skill assessment)',
            'Lunch at beachfront restaurant',
            'Afternoon beach time or optional spa',
            'Evening round-robin tournament',
          ],
        },
        {
          day: 3,
          title: 'Island Adventure',
          activities: [
            'Morning pickleball clinic',
            'Lunch',
            'Afternoon Phi Phi Island boat tour',
            'Sunset dinner cruise',
          ],
        },
        {
          day: 4,
          title: 'Pure Play',
          activities: [
            'Morning yoga and meditation',
            'Championship-style pickleball matches',
            'Thai cooking class',
            'Evening cultural show',
          ],
        },
        {
          day: 5,
          title: 'Wellness Day',
          activities: [
            'Optional morning play',
            'Traditional Thai massage',
            'Spa treatments',
            'Healthy Thai dinner',
          ],
        },
        {
          day: 6,
          title: 'Final Tournament',
          activities: [
            'Morning skills competition',
            'Lunch',
            'Afternoon doubles tournament',
            'Farewell gala dinner and awards',
          ],
        },
        {
          day: 7,
          title: 'Departure',
          activities: [
            'Breakfast',
            'Transfer to airport',
            'Safe travels home!',
          ],
        },
      ]),
    },
  });

  await prisma.itinerary.create({
    data: {
      packageId: smileMakeover.id,
      duration: 14,
      content: JSON.stringify([
        {
          day: 1,
          title: 'Arrival & Dental Consultation',
          activities: [
            'Airport pickup',
            'Check-in to resort',
            'Initial dental consultation and X-rays',
            'Welcome dinner',
          ],
        },
        {
          day: 2,
          title: 'Treatment Planning',
          activities: [
            'Morning: Comprehensive dental exam',
            'Lunch',
            'Afternoon: Treatment plan review',
            'Light pickleball session',
          ],
        },
        {
          day: 3,
          title: 'Begin Dental Work',
          activities: [
            'Morning: First dental session (prep work)',
            'Recovery at resort',
            'Gentle yoga',
            'Soft foods dinner',
          ],
        },
        // ... Additional days would be here
        {
          day: 14,
          title: 'Departure',
          activities: [
            'Final dental check-up',
            'Before/after photos',
            'Transfer to airport',
          ],
        },
      ]),
    },
  });

  console.log(`✅ Created itineraries`);

  // ============================================================================
  // TRIPS (Scheduled Departures)
  // ============================================================================
  console.log('✈️ Creating scheduled trips...');

  const trips = await prisma.trip.createMany({
    data: [
      {
        name: 'Phuket January 2026',
        destination: 'Phuket, Thailand',
        startDate: new Date('2026-01-15T00:00:00Z'),
        endDate: new Date('2026-01-29T00:00:00Z'),
        capacity: 12,
        currentBookings: 3,
        isActive: true,
      },
      {
        name: 'Phuket February 2026',
        destination: 'Phuket, Thailand',
        startDate: new Date('2026-02-12T00:00:00Z'),
        endDate: new Date('2026-02-26T00:00:00Z'),
        capacity: 12,
        currentBookings: 8,
        isActive: true,
      },
      {
        name: 'Chiang Mai March 2026',
        destination: 'Chiang Mai, Thailand',
        startDate: new Date('2026-03-10T00:00:00Z'),
        endDate: new Date('2026-03-24T00:00:00Z'),
        capacity: 12,
        currentBookings: 12, // Fully booked - for testing waitlist
        isActive: true,
      },
      {
        name: 'Bangkok April 2026',
        destination: 'Bangkok, Thailand',
        startDate: new Date('2026-04-05T00:00:00Z'),
        endDate: new Date('2026-04-19T00:00:00Z'),
        capacity: 12,
        currentBookings: 1,
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${trips.count} scheduled trips`);

  // ============================================================================
  // ADD-ONS
  // ============================================================================
  console.log('➕ Creating add-ons...');

  const addOns = await prisma.addOn.createMany({
    data: [
      // Dental
      {
        name: 'Porcelain Veneers (per tooth)',
        description: 'High-quality porcelain veneers for a perfect smile',
        category: AddOnCategory.DENTAL,
        thPrice: 45000, // $450
        usPrice: 150000, // $1,500
        isActive: true,
      },
      {
        name: 'Dental Implant (single)',
        description: 'Titanium dental implant with crown',
        category: AddOnCategory.DENTAL,
        thPrice: 120000, // $1,200
        usPrice: 400000, // $4,000
        isActive: true,
      },
      {
        name: 'Teeth Whitening (professional)',
        description: 'Professional grade teeth whitening treatment',
        category: AddOnCategory.DENTAL,
        thPrice: 25000, // $250
        usPrice: 80000, // $800
        isActive: true,
      },
      // Facial Cosmetic
      {
        name: 'Botox (per area)',
        description: 'Botulinum toxin injection for wrinkle reduction',
        category: AddOnCategory.FACIAL_COSMETIC,
        thPrice: 30000, // $300
        usPrice: 80000, // $800
        isActive: true,
      },
      {
        name: 'Dermal Fillers (1ml)',
        description: 'Hyaluronic acid fillers for volume enhancement',
        category: AddOnCategory.FACIAL_COSMETIC,
        thPrice: 40000, // $400
        usPrice: 100000, // $1,000
        isActive: true,
      },
      {
        name: 'Laser Skin Resurfacing (full face)',
        description: 'CO2 laser treatment for skin rejuvenation',
        category: AddOnCategory.FACIAL_COSMETIC,
        thPrice: 150000, // $1,500
        usPrice: 400000, // $4,000
        isActive: true,
      },
      // Body
      {
        name: 'Liposuction (per area)',
        description: 'Body contouring through fat removal',
        category: AddOnCategory.BODY,
        thPrice: 200000, // $2,000
        usPrice: 600000, // $6,000
        isActive: true,
      },
      {
        name: 'Tummy Tuck (abdominoplasty)',
        description: 'Surgical removal of excess abdominal skin',
        category: AddOnCategory.BODY,
        thPrice: 400000, // $4,000
        usPrice: 1200000, // $12,000
        isActive: true,
      },
      // Health Screening
      {
        name: 'Comprehensive Health Check-Up',
        description: 'Full body health screening with blood work',
        category: AddOnCategory.HEALTH_SCREENING,
        thPrice: 50000, // $500
        usPrice: 200000, // $2,000
        isActive: true,
      },
      {
        name: 'Cardiac Health Assessment',
        description: 'EKG, echocardiogram, and cardiac consultation',
        category: AddOnCategory.HEALTH_SCREENING,
        thPrice: 80000, // $800
        usPrice: 300000, // $3,000
        isActive: true,
      },
      // Spa & Wellness
      {
        name: 'Thai Massage (90 min)',
        description: 'Traditional Thai massage therapy',
        category: AddOnCategory.SPA,
        thPrice: 3000, // $30
        usPrice: 15000, // $150
        isActive: true,
      },
      {
        name: 'Aromatherapy Spa Package',
        description: '3-hour luxury spa experience',
        category: AddOnCategory.SPA,
        thPrice: 8000, // $80
        usPrice: 30000, // $300
        isActive: true,
      },
      // Yoga & Meditation
      {
        name: 'Private Yoga Session',
        description: 'One-on-one yoga instruction',
        category: AddOnCategory.YOGA_MEDITATION,
        thPrice: 5000, // $50
        usPrice: 15000, // $150
        isActive: true,
      },
      {
        name: 'Meditation Retreat (full day)',
        description: 'Intensive meditation practice with monk',
        category: AddOnCategory.YOGA_MEDITATION,
        thPrice: 12000, // $120
        usPrice: 35000, // $350
        isActive: true,
      },
      // Cultural
      {
        name: 'Private Island Tour',
        description: 'Exclusive boat tour of Phi Phi Islands',
        category: AddOnCategory.CULTURAL,
        thPrice: 25000, // $250
        usPrice: 60000, // $600
        isActive: true,
      },
      {
        name: 'Thai Cooking Class',
        description: 'Learn to cook authentic Thai cuisine',
        category: AddOnCategory.CULTURAL,
        thPrice: 8000, // $80
        usPrice: 20000, // $200
        isActive: true,
      },
      // Pickleball
      {
        name: 'Private Pickleball Coaching (1 hour)',
        description: 'One-on-one instruction with certified coach',
        category: AddOnCategory.PICKLEBALL,
        thPrice: 7500, // $75
        usPrice: 15000, // $150
        isActive: true,
      },
      {
        name: 'Pickleball Gear Package',
        description: 'Premium paddle, bag, balls, and apparel',
        category: AddOnCategory.PICKLEBALL,
        thPrice: 30000, // $300
        usPrice: 50000, // $500
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${addOns.count} add-ons`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
