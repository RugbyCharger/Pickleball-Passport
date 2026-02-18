import type { Metadata } from 'next';

// Prevent static generation - wrapped by ClerkProvider
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Apply for Your Transformation Journey | The Pickleball Passport',
  description: 'Start your wellness transformation in Thailand. Apply now for exclusive access to premier pickleball, medical tourism, and spiritual experiences.',
  keywords: ['apply', 'transformation journey', 'wellness application', 'pickleball retreat', 'medical tourism application'],
  openGraph: {
    title: 'Apply for Your Transformation Journey | The Pickleball Passport',
    description: 'Start your wellness transformation in Thailand. Apply now for exclusive access to premier experiences.',
    url: 'https://pickleballpassport.com/apply',
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
    canonical: 'https://pickleballpassport.com/apply',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
