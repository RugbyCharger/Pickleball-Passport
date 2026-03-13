import { Metadata } from 'next';
import { BangkokPhuketPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Bangkok + Phuket: 15-Day Pickleball Trip | The Pickleball Passport',
  description:
    'A seasonal 15-day pickleball experience through Bangkok and Phuket. The Peninsula Bangkok, Sole Mio Boutique Hotel and Wellness. Available December through April.',
  keywords: [
    'pickleball trip Thailand',
    'Phuket pickleball',
    'Bangkok pickleball',
    'Sole Mio Phuket',
    'Peninsula Bangkok',
    'Thailand beach pickleball',
  ],
  openGraph: {
    title: 'Bangkok + Phuket: 15-Day Pickleball Trip | The Pickleball Passport',
    description:
      'Seasonal 15-day route through Bangkok and Phuket. Available December through April.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-phuket',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-phuket',
  },
};

export default function Page() {
  return <BangkokPhuketPage />;
}
