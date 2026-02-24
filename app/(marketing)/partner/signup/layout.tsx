import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Partner | The Pickleball Passport',
  description: 'Sign up to become a partner with The Pickleball Passport. Earn rewards, free trips, and exclusive benefits while offering your members transformational wellness experiences in Thailand.',
  keywords: ['become a partner', 'partner signup', 'pickleball partner registration', 'earn rewards', 'referral program signup'],
  openGraph: {
    title: 'Become a Partner | The Pickleball Passport',
    description: 'Sign up to become a partner and start earning rewards for referring members to transformational wellness experiences.',
    url: 'https://thepickleballpassport.org/partner/signup',
    siteName: 'The Pickleball Passport',
    images: [
      {
        url: '/og-images/partner-signup.jpg',
        width: 1200,
        height: 630,
        alt: 'Become a Partner with The Pickleball Passport - Sign Up Today',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Partner | The Pickleball Passport',
    description: 'Sign up to become a partner and start earning rewards for referring members to transformational wellness experiences.',
    images: ['/og-images/partner-signup.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://thepickleballpassport.org/partner/signup',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PartnerSignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
