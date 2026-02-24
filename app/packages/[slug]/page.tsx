import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PackageDetailClient } from '@/components/marketing/package-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all active packages
 * This enables Static Site Generation (SSG) for package detail pages
 * Returns empty array if database is unavailable (pages render dynamically)
 */
export async function generateStaticParams() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    return packages.map((pkg) => ({
      slug: pkg.slug,
    }));
  } catch {
    // Database not available during build - pages will be generated on-demand
    return [];
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const packageData = await prisma.package.findUnique({
    where: { slug },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      heroImageUrl: true,
    },
  });

  if (!packageData) {
    return {
      title: 'Package Not Found',
    };
  }

  const title = packageData.metaTitle || `${packageData.name} - Wellness Package | The Pickleball Passport`;
  const description = packageData.metaDescription || `Explore our ${packageData.name} package combining premier wellness, pickleball, and adventure in Thailand.`;
  const imageUrl = packageData.heroImageUrl || '/og-images/package-default.jpg';

  return {
    title,
    description,
    keywords: ['pickleball package', 'wellness retreat', 'Thailand travel', packageData.name, 'pickleball trip'],
    openGraph: {
      title,
      description,
      url: `https://thepickleballpassport.org/packages/${slug}`,
      siteName: 'The Pickleball Passport',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${packageData.name} - The Pickleball Passport`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@PickleballPass',
      creator: '@PickleballPass',
    },
    alternates: {
      canonical: `https://thepickleballpassport.org/packages/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Package Detail Page
 * Server component that fetches package data and passes to client components
 */
export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch package with all related data
  const packageData = await prisma.package.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      itineraries: {
        orderBy: {
          duration: 'asc',
        },
      },
    },
  });

  // Handle 404 for invalid slugs
  if (!packageData) {
    notFound();
  }

  // Generate Product JSON-LD Schema for SEO
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: packageData.name,
    description: packageData.description,
    image: packageData.heroImageUrl || 'https://thepickleballpassport.org/og-images/package-default.jpg',
    brand: {
      '@type': 'Brand',
      name: 'The Pickleball Passport',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '5000',
      availability: 'https://schema.org/InStock',
      url: `https://thepickleballpassport.org/packages/${slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    category: 'Travel Package',
  };

  // Pass data to client component for interactive features
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PackageDetailClient packageData={packageData} />
    </>
  );
}
