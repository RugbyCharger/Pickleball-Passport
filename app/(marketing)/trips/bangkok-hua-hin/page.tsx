import { Metadata } from 'next';
import { BangkokHuaHinPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Bangkok + Hua Hin: 9-Day Pickleball Trip | The Pickleball Passport',
  description:
    '9-day pickleball experience through Bangkok and Hua Hin. The Peninsula Bangkok, Anantara Hua Hin Resort, 4 pickleball sessions, cultural adventures, and luxury accommodations. From $3,888/person.',
  keywords: [
    'pickleball trip Thailand',
    'pickleball travel',
    'Bangkok pickleball',
    'Hua Hin pickleball',
    'Peninsula Bangkok',
    'Anantara Hua Hin Resort',
    'pickleball vacation',
    '9 day Thailand trip',
  ],
  openGraph: {
    title: 'Bangkok + Hua Hin: 9-Day Pickleball Trip | The Pickleball Passport',
    description:
      '9 days across Bangkok and Hua Hin. The Peninsula Bangkok, Anantara Hua Hin Resort, pickleball sessions, and cultural immersion. From $3,888/person.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin',
  },
};

export default function Page() {
  return <BangkokHuaHinPage />;
}
