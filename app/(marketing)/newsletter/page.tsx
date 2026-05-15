import { Metadata } from 'next';
import { NewsletterPage } from './newsletter-page';

export const metadata: Metadata = {
  title: 'Newsletter | The Pickleball Passport',
  description:
    'Stay in the loop with trip announcements, new destinations, exclusive offers, and stories from the Pickleball Passport community.',
  openGraph: {
    title: 'Newsletter | The Pickleball Passport',
    description:
      'Stay in the loop with trip announcements, new destinations, exclusive offers, and stories from the Pickleball Passport community.',
    url: 'https://www.thepickleballpassport.org/newsletter',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/newsletter',
  },
};

export default function Page() {
  return <NewsletterPage />;
}
