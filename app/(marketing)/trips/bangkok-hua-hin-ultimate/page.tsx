import { Metadata } from 'next';
import { BangkokHuaHinUltimatePage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Bangkok + Hua Hin Ultimate: 15-Day Pickleball Trip | The Pickleball Passport',
  description:
    'The ultimate 15-day pickleball experience. 5 nights at The Peninsula Bangkok, 8 nights at Dusit Thani Hua Hin, plus a farewell night back at The Peninsula. 8+ pickleball sessions, cultural immersion, and luxury accommodations. From $5,497.',
  keywords: [
    'pickleball trip Thailand',
    'pickleball travel',
    'Bangkok pickleball',
    'Hua Hin pickleball',
    'Peninsula Bangkok',
    'Dusit Thani Hua Hin',
    'luxury pickleball vacation',
    '15 day Thailand trip',
  ],
  openGraph: {
    title: 'Bangkok + Hua Hin Ultimate: 15-Day Pickleball Trip | The Pickleball Passport',
    description:
      '15 days across Bangkok and Hua Hin. The Peninsula Bangkok, Dusit Thani Hua Hin, 8+ pickleball sessions, and world-class dining. From $5,497.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin-ultimate',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin-ultimate',
  },
};

export default function Page() {
  return <BangkokHuaHinUltimatePage />;
}
