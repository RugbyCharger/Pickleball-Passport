import { Metadata } from 'next';
import { BangkokChiangMaiPage } from './trip-detail-page';

export const metadata: Metadata = {
  title: 'Bangkok + Chiang Mai: 9-Day Pickleball Trip | The Pickleball Passport',
  description:
    '9-day pickleball experience through Bangkok and Chiang Mai. Our 5-Star Bangkok riverside hotel, Our 5-Star Chiang Mai Riverside Resort, 4 pickleball sessions, Elephant Nature Park, Thai cooking class. From $3,888/person. Available May through January.',
  keywords: [
    'pickleball trip Thailand',
    'Chiang Mai pickleball',
    'Bangkok pickleball',
    'Our 5-Star Chiang Mai Riverside Resort',
    'Bangkok riverside hotel',
    'BokBok Pickleball',
    '9 day Thailand trip',
  ],
  openGraph: {
    title: 'Bangkok + Chiang Mai: 9-Day Pickleball Trip | The Pickleball Passport',
    description:
      '9 days across Bangkok and Chiang Mai. Our 5-Star Bangkok riverside hotel, Our 5-Star Chiang Mai Riverside Resort, pickleball sessions, and cultural immersion. From $3,888/person.',
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
