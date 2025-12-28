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
 */
export async function generateStaticParams() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return packages.map((pkg) => ({
    slug: pkg.slug,
  }));
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

  return {
    title: packageData.metaTitle || `${packageData.name} | Pickleball Passport`,
    description: packageData.metaDescription || `Explore our ${packageData.name} package`,
    openGraph: {
      title: packageData.metaTitle || packageData.name,
      description: packageData.metaDescription || '',
      images: packageData.heroImageUrl ? [packageData.heroImageUrl] : [],
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

  // Pass data to client component for interactive features
  return <PackageDetailClient packageData={packageData} />;
}
