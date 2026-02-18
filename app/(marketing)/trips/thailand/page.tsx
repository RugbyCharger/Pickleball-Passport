import { Metadata } from 'next';
import { TripDetailPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Thailand: Bangkok, Chiang Mai & Phuket | 13-Day Pickleball Trip | The Pickleball Passport',
  description:
    'Experience the ultimate 13-day pickleball trip through Bangkok, Chiang Mai, and Phuket. 7 pickleball sessions, 3 boutique hotels, cultural adventures, and outstanding dining. Book your spot today.',
  keywords: [
    'pickleball trip Thailand',
    'pickleball travel',
    'Bangkok pickleball',
    'Chiang Mai pickleball',
    'Phuket pickleball',
    'pickleball vacation',
    'pickleball tour',
  ],
  openGraph: {
    title: 'Thailand: 13-Day Pickleball Trip | The Pickleball Passport',
    description:
      '13 days across Bangkok, Chiang Mai & Phuket. 7 pickleball sessions, boutique hotels, cultural adventures, and Michelin dining.',
    url: 'https://www.thepickleballpassport.org/trips/thailand',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/thailand',
  },
};

export default function ThailandTripPage() {
  return <TripDetailPage />;
}
