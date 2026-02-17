import { Metadata } from 'next';
import { Thailand8DayTripPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: '8-Day Pickleball Paradise: Bangkok & Chiang Mai | The Pickleball Passport',
  description:
    'Experience the essential 8-day pickleball trip through Bangkok and Chiang Mai. 4 pickleball sessions, 2 boutique hotels, cultural adventures, and world-class dining. From $2,888.',
  keywords: [
    'pickleball trip Thailand',
    'pickleball travel',
    'Bangkok pickleball',
    'Chiang Mai pickleball',
    'pickleball vacation',
    'pickleball tour',
    '8 day Thailand trip',
  ],
  openGraph: {
    title: '8-Day Pickleball Paradise: Bangkok & Chiang Mai | The Pickleball Passport',
    description:
      '8 days across Bangkok & Chiang Mai. 4 pickleball sessions, boutique hotels, cultural adventures, and Michelin dining. From $2,888.',
    url: 'https://www.thepickleballpassport.org/trips/thailand-8-day',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/thailand-8-day',
  },
};

export default function Thailand8DayPage() {
  return <Thailand8DayTripPage />;
}
