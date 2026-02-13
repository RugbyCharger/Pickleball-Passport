import { Metadata } from 'next';
import { TripsListingPage } from './trips-listing-page';

export const metadata: Metadata = {
  title: 'Upcoming Pickleball Trips | Pickleball Passport',
  description:
    'Explore our curated lineup of international pickleball travel experiences. Competitive play, boutique hotels, cultural immersion, and wellness — designed for players who want more than just a vacation.',
  openGraph: {
    title: 'Upcoming Pickleball Trips | Pickleball Passport',
    description:
      'Curated pickleball travel experiences across Thailand, Bali, Portugal, and Japan.',
    url: 'https://www.thepickleballpassport.org/trips',
    siteName: 'Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trips',
  },
};

export default function TripsPage() {
  return <TripsListingPage />;
}
