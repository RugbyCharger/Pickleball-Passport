import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Partners | The Pickleball Passport',
  description: 'Meet the creators, pros, and personalities who partner with The Pickleball Passport to bring world-class pickleball travel to the community.',
  keywords: ['pickleball partners', 'pickleball creators', 'pickleball influencers', 'pickleball travel partners'],
  openGraph: {
    title: 'Our Partners | The Pickleball Passport',
    description: 'Meet the creators, pros, and personalities who partner with The Pickleball Passport.',
    url: 'https://thepickleballpassport.org/partners',
    siteName: 'The Pickleball Passport',
    images: [
      {
        url: '/og-images/partners.jpg',
        width: 1200,
        height: 630,
        alt: 'The Pickleball Passport Partners',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Partners | The Pickleball Passport',
    description: 'Meet the creators, pros, and personalities who partner with The Pickleball Passport.',
    images: ['/og-images/partners.jpg'],
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://thepickleballpassport.org/partners',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
