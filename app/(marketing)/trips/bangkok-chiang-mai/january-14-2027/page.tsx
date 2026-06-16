import { Metadata } from 'next';
import { January14Page } from './january-14-page';

export const metadata: Metadata = {
  title: 'Bangkok + Chiang Mai — January 14–22, 2027 | Phuket Extension Available | The Pickleball Passport',
  description:
    'The January 14–22, 2027 departure is the only Bangkok + Chiang Mai trip with an optional Phuket extension. 9 days. Our 5-Star Bangkok riverside hotel · Anantara Chiang Mai Resort. From $4,860/person (High Season). Extend into Phuket at Banyan Tree or Angsana Laguna.',
  keywords: [
    'pickleball trip Thailand January 2027',
    'Bangkok Chiang Mai pickleball',
    'Phuket extension pickleball trip',
    'The Pickleball Passport January',
    'Thailand pickleball travel',
    'Banyan Tree Phuket pickleball',
  ],
  openGraph: {
    title: 'Bangkok + Chiang Mai — January 14–22, 2027 | Phuket Extension Available',
    description:
      'The only Bangkok + Chiang Mai departure with an optional Phuket extension. Add 3 or 5 nights at Banyan Tree Phuket or Angsana Laguna Phuket. From $4,860/person.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-chiang-mai/january-14-2027',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-chiang-mai/january-14-2027',
  },
};

export default function Page() {
  return <January14Page />;
}
