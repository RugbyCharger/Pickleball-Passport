import { HeroSection } from '@/components/marketing/hero-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premier Pickleball Travel Experiences | Pickleball Passport',
  description: 'Elite pickleball travel experiences in Thailand. Boutique hotels, world-class courts, cultural immersion, and unforgettable destinations. Launching May 2026.',
  keywords: ['pickleball', 'pickleball travel', 'Thailand', 'pickleball retreat', 'pickleball vacation', 'boutique hotels', 'cultural immersion'],
  openGraph: {
    title: 'Pickleball Passport - Play the World',
    description: 'Elite pickleball travel experiences. Boutique hotels, world-class courts, and cultural immersion in Thailand.',
    url: 'https://www.thepickleballpassport.org',
    siteName: 'Pickleball Passport',
    images: [
      {
        url: '/og-images/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Pickleball Passport - Play the World',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pickleball Passport - Play the World',
    description: 'Elite pickleball travel experiences. Boutique hotels, world-class courts, and cultural immersion in Thailand.',
    images: ['/og-images/homepage.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
    </>
  );
}
