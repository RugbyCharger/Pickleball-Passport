import { Metadata } from 'next';
import { July16Page } from './july-16-page';

export const metadata: Metadata = {
  title: 'Train with BK Karunakaran — July 16–24, 2026 | Bangkok + Hua Hin | The Pickleball Passport',
  description:
    'The July 16–24 Bangkok + Hua Hin departure is the only summer trip joined by BK Karunakaran — PPR Certified Pro Coach, Professional Pickleball Player, and Content Creator. 9 days. Our 5-Star Bangkok riverside hotel. Our 5-Star Hua Hin Beachfront Resort. From $3,888/person.',
  keywords: [
    'BK Karunakaran pickleball',
    'pickleball pro coach Thailand',
    'Bangkok pickleball trip July 2026',
    'PPR certified coach pickleball travel',
    'Bharat Karunakaran BK Pickleball',
    'pickleball trip Thailand July',
  ],
  openGraph: {
    title: 'Train with BK Karunakaran — July 16–24, 2026 | Bangkok + Hua Hin',
    description:
      'The only summer departure joined by BK Karunakaran, PPR Certified Pro Coach. 9 days across Bangkok and Hua Hin. Our 5-Star Bangkok riverside hotel · Our 5-Star Hua Hin Beachfront Resort. From $3,888/person.',
    url: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin/july-16-2026',
    siteName: 'The Pickleball Passport',
    images: [{ url: '/bk-karunakaran.jpeg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips/bangkok-hua-hin/july-16-2026',
  },
};

export default function Page() {
  return <July16Page />;
}
