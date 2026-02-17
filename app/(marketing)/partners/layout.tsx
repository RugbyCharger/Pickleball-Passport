import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Program - Earn Rewards | The Pickleball Passport',
  description: 'Join our partner network and earn rewards by offering your pickleball community access to transformational wellness experiences in Thailand. Free trips, marketing support, and unlimited earning potential.',
  keywords: ['partner program', 'pickleball partners', 'earn rewards', 'affiliate program', 'referral program', 'pickleball club partnership'],
  openGraph: {
    title: 'Partner Program - Earn Rewards | The Pickleball Passport',
    description: 'Join our partner network and earn rewards, free trips, and exclusive benefits while helping your members live their best lives.',
    url: 'https://pickleballpassport.com/partners',
    siteName: 'The Pickleball Passport',
    images: [
      {
        url: '/og-images/partners.jpg',
        width: 1200,
        height: 630,
        alt: 'The Pickleball Passport Partner Program - Earn Rewards',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner Program - Earn Rewards | The Pickleball Passport',
    description: 'Join our partner network and earn rewards, free trips, and exclusive benefits while helping your members live their best lives.',
    images: ['/og-images/partners.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://pickleballpassport.com/partners',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
