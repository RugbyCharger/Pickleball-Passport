/**
 * Blog Layout
 * Story 12-3: Blog Posts System
 *
 * Provides base SEO metadata for the blog section.
 * Individual post pages will override with dynamic metadata.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | The Pickleball Passport',
  description: 'Stories, tips, and insights from the world of pickleball wellness travel. Discover travel guides, health tips, and inspiring stories from our community.',
  openGraph: {
    title: 'Blog | The Pickleball Passport',
    description: 'Stories, tips, and insights from the world of pickleball wellness travel.',
    type: 'website',
    siteName: 'The Pickleball Passport',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | The Pickleball Passport',
    description: 'Stories, tips, and insights from the world of pickleball wellness travel.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
