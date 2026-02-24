import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Your Transformation Journey | The Pickleball Passport',
  description: 'Start your pickleball adventure in Thailand. Apply now for exclusive access to premier pickleball trips, wellness, and cultural experiences.',
  keywords: ['apply', 'pickleball trip', 'wellness application', 'pickleball retreat', 'Thailand travel'],
  openGraph: {
    title: 'Apply for Your Transformation Journey | The Pickleball Passport',
    description: 'Start your wellness transformation in Thailand. Apply now for exclusive access to premier experiences.',
    url: 'https://thepickleballpassport.org/apply',
    siteName: 'The Pickleball Passport',
    images: [
      {
        url: '/og-images/apply.jpg',
        width: 1200,
        height: 630,
        alt: 'Apply for The Pickleball Passport - Begin Your Journey',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply for Your Transformation Journey | The Pickleball Passport',
    description: 'Start your wellness transformation in Thailand. Apply now for exclusive access to premier experiences.',
    images: ['/og-images/apply.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://thepickleballpassport.org/apply',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
