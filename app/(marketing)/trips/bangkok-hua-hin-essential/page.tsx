import { Metadata } from 'next';
import { BangkokHuaHinEssentialPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: '9-Day Bangkok + Hua Hin Essential | The Pickleball Passport',
  description:
    'The essential 9-day pickleball experience. 3 nights at The Peninsula Bangkok, 4 nights at Dusit Thani Hua Hin, plus a farewell night back at The Peninsula. 3-4 pickleball sessions, cultural adventures, and luxury accommodations. From $3,488.',
  keywords: [
    'pickleball trip Thailand',
    'pickleball travel',
    'Bangkok pickleball',
    'Hua Hin pickleball',
    'Peninsula Bangkok',
    'Dusit Thani Hua Hin',
    'pickleball vacation',
    '9 day Thailand trip',
  ],
  openGraph: {
    title: '9-Day Bangkok + Hua Hin Essential | The Pickleball Passport',
    description:
      '9 days across Bangkok and Hua Hin. The Peninsula Bangkok, Dusit Thani Hua Hin, pickleball sessions, and Michelin dining. From $3,488.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin-essential',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin-essential',
  },
};

export default function Page() {
  return <BangkokHuaHinEssentialPage />;
}
