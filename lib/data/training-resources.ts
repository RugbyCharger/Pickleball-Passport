/**
 * Partner Training Resources Data
 * E9-S7: Partner Training Resources
 *
 * Defines all available training resources for partners
 */

export type ResourceCategory = 'getting-started' | 'sales' | 'tutorials' | 'faq';
export type ResourceType = 'pdf' | 'video' | 'article' | 'checklist';

export interface TrainingResource {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  videoId?: string;
  videoProvider?: 'youtube' | 'vimeo' | 'mux';
  content?: string; // For FAQs and articles
  duration?: string; // For videos
  fileSize?: string; // For PDFs
}

export const TRAINING_RESOURCES: TrainingResource[] = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'getting-started',
    title: 'Welcome to The Pickleball Passport',
    description: 'Complete onboarding guide covering the partner program, how it works, and what to expect.',
    type: 'pdf',
    url: '/partner-training/guides/welcome-to-pickleball-passport.pdf',
    fileSize: '2.1 MB',
  },
  {
    id: 'gs-2',
    category: 'getting-started',
    title: 'How to Share Your Referral Code',
    description: 'Step-by-step guide on sharing your referral code via email, social media, and in-person.',
    type: 'article',
    content: `
# How to Share Your Referral Code

## Email Sharing
1. Copy your referral code from the dashboard
2. Include it in your club newsletter
3. Send personalized emails to members

## Social Media
- Post on your club's Facebook page
- Share on Instagram stories
- Include in LinkedIn posts

## In-Person
- Mention during club announcements
- Add to bulletin board flyers
- Include in welcome packets
    `,
  },
  {
    id: 'gs-3',
    category: 'getting-started',
    title: 'First 30 Days Action Plan',
    description: 'Checklist of actions to take in your first month as a partner.',
    type: 'checklist',
    content: `
- [ ] Complete partner profile
- [ ] Download marketing materials
- [ ] Share referral code with 10+ members
- [ ] Post on social media at least 3 times
- [ ] Attend Directors Circle call (if available)
- [ ] Track your first referral
    `,
  },
  {
    id: 'gs-4',
    category: 'getting-started',
    title: 'Portal Navigation Overview',
    description: 'Video walkthrough of the partner dashboard and key features.',
    type: 'video',
    videoId: 'placeholder', // Replace with actual video ID
    videoProvider: 'youtube',
    duration: '5:30',
  },

  // Sales & Communication
  {
    id: 'sales-1',
    category: 'sales',
    title: 'How to Talk About The Pickleball Passport',
    description: 'Complete guide on positioning and explaining The Pickleball Passport to your members.',
    type: 'pdf',
    url: '/partner-training/guides/how-to-talk-about-pbp.pdf',
    fileSize: '1.8 MB',
  },
  {
    id: 'sales-2',
    category: 'sales',
    title: 'Objection Handling Scripts',
    description: 'Common objections from members and how to address them effectively.',
    type: 'pdf',
    url: '/partner-training/guides/objection-handling-scripts.pdf',
    fileSize: '950 KB',
  },
  {
    id: 'sales-3',
    category: 'sales',
    title: 'Email Templates for Member Outreach',
    description: 'Ready-to-use email templates for introducing The Pickleball Passport to your members.',
    type: 'pdf',
    url: '/partner-training/guides/email-templates.pdf',
    fileSize: '650 KB',
  },
  {
    id: 'sales-4',
    category: 'sales',
    title: 'Elevator Pitch Examples',
    description: 'Quick 30-second pitches for different scenarios and audiences.',
    type: 'article',
    content: `
# Elevator Pitch Examples

## For Club Announcements (30 seconds)
"The Pickleball Passport combines your love of pickleball with exceptional wellness and medical care in Thailand. It's a 7-21 day transformation journey where you play pickleball daily while receiving dental work, cosmetic procedures, or wellness treatments at a fraction of US costs. Plus, you get to experience the culture and beauty of Thailand. I'm a partner and can help you get started!"

## For One-on-One Conversations
"Have you ever thought about combining a vacation with medical or wellness treatments? The Pickleball Passport does exactly that - you play pickleball every day while getting dental work, cosmetic procedures, or wellness treatments in Thailand. It's like a medical tourism trip, but specifically designed for pickleball players. I can share more details if you're interested."
    `,
  },

  // Portal Tutorials
  {
    id: 'tutorial-1',
    category: 'tutorials',
    title: 'Dashboard Overview',
    description: 'Learn how to navigate your partner dashboard and understand key metrics.',
    type: 'video',
    videoId: 'placeholder',
    videoProvider: 'youtube',
    duration: '4:15',
  },
  {
    id: 'tutorial-2',
    category: 'tutorials',
    title: 'How to View Your Referrals',
    description: 'Step-by-step guide on accessing and filtering your referral data.',
    type: 'video',
    videoId: 'placeholder',
    videoProvider: 'youtube',
    duration: '3:45',
  },
  {
    id: 'tutorial-3',
    category: 'tutorials',
    title: 'Checking Your Points Balance',
    description: 'Learn how to view your points balance and transaction history.',
    type: 'video',
    videoId: 'placeholder',
    videoProvider: 'youtube',
    duration: '2:30',
  },
  {
    id: 'tutorial-4',
    category: 'tutorials',
    title: 'Downloading Marketing Materials',
    description: 'How to access and download flyers, email templates, and social media content.',
    type: 'video',
    videoId: 'placeholder',
    videoProvider: 'youtube',
    duration: '3:00',
  },

  // FAQs
  {
    id: 'faq-1',
    category: 'faq',
    title: 'How do I earn points?',
    description: 'Understanding the points earning structure and commission rates.',
    type: 'article',
    content: `
You earn Passport Points for every referral that results in a booking:

- **Referral clicks link:** 10 points (initial engagement)
- **Referral submits application:** 100 points (qualified lead)
- **Referral books trip:** 1,000 points for $10K package, 1,500 points for $20K+ package
- **Referral completes trip:** 500 bonus points
- **Recruit another partner:** 2,000 points (when they generate ≥1 booking)

Points are awarded automatically when bookings are confirmed. Your commission rate depends on your tier:
- Bronze: 5% (500 points per $10K)
- Silver: 7.5% (750 points per $10K)
- Gold: 10% (1,000 points per $10K)
- Platinum: 12.5% (1,250 points per $10K)
    `,
  },
  {
    id: 'faq-2',
    category: 'faq',
    title: 'When do I get paid?',
    description: 'Understanding the points redemption and payout process.',
    type: 'article',
    content: `
**Points Redemption:**
- Points are credited to your account immediately when a booking is confirmed
- You can redeem points for rewards at any time (see Rewards Catalog)
- Most popular: Free trip (15,000 points solo, 25,000 points with spouse)

**Cash Payouts (Limited):**
- Available for Platinum tier partners only
- Minimum 5,000 points required
- Rate: $0.80 per point (20% discount vs trip value)
- Payouts processed quarterly
    `,
  },
  {
    id: 'faq-3',
    category: 'faq',
    title: "What if a member doesn't use my referral code?",
    description: 'How to handle manual referral entries and attribution.',
    type: 'article',
    content: `
If a member books but didn't use your referral link, you can:

1. **Contact Support:** Reach out to your partner success manager
2. **Provide Details:** Share the member's name, email, and booking reference
3. **Verification:** We'll verify the relationship and may contact the member
4. **Manual Attribution:** If approved, we'll manually attribute the booking to you

**Note:** Manual entries require admin approval to prevent gaming the system. We recommend always sharing your referral code to ensure automatic attribution.
    `,
  },
  {
    id: 'faq-4',
    category: 'faq',
    title: 'How do I advance to the next tier?',
    description: 'Understanding tier progression and requirements.',
    type: 'article',
    content: `
Tiers are based on total Passport Points earned:

- **Bronze:** 0 points (starting tier)
- **Silver:** 1,000 points
- **Gold:** 5,000 points
- **Platinum:** 15,000 points

**Tier Benefits:**
- Higher commission rates (5% → 12.5%)
- Priority support
- Exclusive perks (dedicated account manager, co-marketing opportunities)
- Early access to new packages

Your tier is automatically updated when you reach the threshold. Check your dashboard to see your progress!
    `,
  },
  {
    id: 'faq-5',
    category: 'faq',
    title: 'Can I customize marketing materials?',
    description: 'Options for personalizing flyers and templates.',
    type: 'article',
    content: `
**Current Options:**
- All materials include your referral code (pre-populated)
- Email templates have personalization tokens for your name and club

**Future Enhancements:**
- Add your club logo to flyers
- Customize contact information
- Create custom landing pages

For now, you can manually add your contact info to downloaded materials. If you need custom materials, contact your partner success manager.
    `,
  },
  {
    id: 'faq-6',
    category: 'faq',
    title: 'What support is available?',
    description: 'Getting help and accessing partner support resources.',
    type: 'article',
    content: `
**Partner Success Manager:**
- Dedicated support for active partners
- Response time: <24 hours
- Available via email and in-app messaging

**Resources:**
- Training materials (this page)
- Marketing materials library
- FAQ section
- Video tutorials

**Monthly Directors Circle Call:**
- Hosted by Jaron (founder)
- Best practices sharing
- Q&A session
- Community building

**Emergency Support:**
- For urgent issues, contact: partners@pickleballpassport.com
- Phone: +1 (512) 564-8522
    `,
  },
];

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  'getting-started': 'Getting Started',
  sales: 'Sales & Communication',
  tutorials: 'Portal Tutorials',
  faq: 'FAQs & Support',
};

export const CATEGORY_DESCRIPTIONS: Record<ResourceCategory, string> = {
  'getting-started': 'Onboarding guides and first steps',
  sales: 'Talking points, scripts, and communication tools',
  tutorials: 'Video walkthroughs of the partner portal',
  faq: 'Answers to common questions',
};
