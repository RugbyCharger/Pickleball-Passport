import { Metadata } from 'next';
import { BangkokChiangMaiPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Bangkok + Chiang Mai: 15-Day Pickleball Trip | The Pickleball Passport',
  description:
    'A seasonal 15-day pickleball experience through Bangkok and Chiang Mai. The Peninsula Bangkok, Anantara Chiang Mai Resort. Available November through January during cool season.',
  keywords: [
    'pickleball trip Thailand',
    'Chiang Mai pickleball',
    'Bangkok pickleball',
    'Anantara Chiang Mai',
    'Peninsula Bangkok',
    'Thailand cool season',
  ],
  openGraph: {
    title: 'Bangkok + Chiang Mai: 15-Day Pickleball Trip | The Pickleball Passport',
    description:
      'Seasonal 15-day route through Bangkok and Chiang Mai. Available November through January.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-chiang-mai',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-chiang-mai',
  },
};

export default function Page() {
  return <BangkokChiangMaiPage />;
}
