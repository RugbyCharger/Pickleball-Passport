import { HeroSection } from '@/components/marketing/hero-section';
import { PackageSection } from '@/components/marketing/package-grid';
import { TestimonialSection } from '@/components/marketing/testimonial-section';
import MedicalCostCalculator from '@/components/marketing/medical-cost-calculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Wellness & Pickleball Experiences in Thailand | Pickleball Passport',
  description: 'Transform your life with luxury wellness packages combining pickleball, medical tourism, and spiritual experiences in Thailand. Join our exclusive community of wellness seekers.',
  keywords: ['pickleball', 'wellness', 'medical tourism', 'Thailand', 'transformation', 'luxury wellness', 'dental tourism', 'pickleball retreat'],
  openGraph: {
    title: 'Pickleball Passport - Luxury Wellness Experiences in Thailand',
    description: 'Life-changing wellness packages combining pickleball, medical procedures, and spiritual transformation in Thailand.',
    url: 'https://pickleballpassport.com',
    siteName: 'Pickleball Passport',
    images: [
      {
        url: '/og-images/homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Pickleball Passport - Luxury Wellness in Thailand',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pickleball Passport - Luxury Wellness Experiences in Thailand',
    description: 'Life-changing wellness packages combining pickleball, medical procedures, and spiritual transformation in Thailand.',
    images: ['/og-images/homepage.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://pickleballpassport.com',
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
      <PackageSection />

      {/* Medical Tourism Cost Calculator */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#FDF8F3] to-white">
        <div className="max-w-4xl mx-auto">
          <MedicalCostCalculator />
        </div>
      </section>

      <TestimonialSection />

      {/* Future sections will be added here:
        - How it works
        - FAQ preview
      */}
    </>
  );
}
