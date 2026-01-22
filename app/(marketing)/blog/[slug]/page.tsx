/**
 * Individual Blog Post Page
 * Story 12-3: Blog Posts System
 *
 * Server component that provides SEO metadata for blog posts.
 * Renders the client BlogPostContent component for interactivity.
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { BlogPostContent } from './blog-post-content';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: resolvedParams.slug,
        status: 'PUBLISHED',
        deletedAt: null,
        publishedAt: { lte: new Date() },
      },
      select: {
        title: true,
        excerpt: true,
        featuredImage: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true,
        publishedAt: true,
        category: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      return {
        title: 'Post Not Found | Pickleball Passport Blog',
        description: 'The blog post you are looking for could not be found.',
      };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt || `Read ${post.title} on Pickleball Passport Blog`;
    const image = post.ogImage || post.featuredImage;

    return {
      title: `${title} | Pickleball Passport Blog`,
      description,
      keywords: post.metaKeywords.length > 0 ? post.metaKeywords.join(', ') : undefined,
      authors: [{ name: 'Pickleball Passport' }],
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        siteName: 'Pickleball Passport',
        ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
        ...(post.category && { section: post.category.name }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image && { images: [image] }),
      },
      alternates: {
        canonical: `/blog/${resolvedParams.slug}`,
      },
    };
  } catch {
    return {
      title: 'Blog Post | Pickleball Passport',
      description: 'Read articles on Pickleball Passport Blog',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  return <BlogPostContent slug={resolvedParams.slug} />;
}
