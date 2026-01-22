/**
 * Blog Post Content Component (Client)
 * Story 12-3: Blog Posts System
 *
 * Client-side rendering for the blog post with interactive features.
 */

'use client';

import { trpc } from '@/lib/trpc/client';
import { RichTextContent } from '@/components/cms/rich-text-editor';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Calendar,
  ArrowLeft,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BlogPostContentProps {
  slug: string;
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
  const router = useRouter();

  // Fetch post
  const { data: post, isLoading, error } = trpc.blog.getPublishedPostBySlug.useQuery(
    { slug },
    { retry: false }
  );

  // Fetch related posts (same category)
  const { data: relatedData } = trpc.blog.getPublishedPosts.useQuery(
    {
      categorySlug: post?.category?.slug || undefined,
      limit: 3,
    },
    { enabled: !!post?.category?.slug }
  );

  // Filter out current post from related
  const relatedPosts = relatedData?.posts.filter(p => p.id !== post?.id).slice(0, 2) || [];

  // Redirect to blog list if post not found
  useEffect(() => {
    if (!isLoading && error) {
      router.push('/blog');
    }
  }, [isLoading, error, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003D5C]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post not found</h1>
          <p className="text-slate-600 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Featured Image */}
      <section className="relative">
        {post.featuredImage ? (
          <div className="relative h-[50vh] min-h-[400px]">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
              <Link href="/blog">
                <Button variant="secondary" size="sm" className="gap-2 bg-white/90 hover:bg-white">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl mx-auto">
                {post.category && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                    style={{ backgroundColor: post.category.color || '#003D5C' }}
                  >
                    {post.category.name}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.publishedAt && formatDate(post.publishedAt.toString())}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#003D5C] to-[#005A82] py-16 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <Link href="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              {post.category && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: post.category.color || 'rgba(255,255,255,0.2)' }}
                >
                  {post.category.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.publishedAt && formatDate(post.publishedAt.toString())}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg:flex lg:gap-12">
            {/* Article Content */}
            <article className="flex-1">
              {/* Excerpt/Lead */}
              {post.excerpt && (
                <p className="text-xl text-slate-600 mb-8 leading-relaxed font-medium">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-[#003D5C] prose-img:rounded-lg">
                <RichTextContent content={post.content} />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-5 w-5 text-slate-400" />
                    {post.tags.map((t) => (
                      <Link
                        key={t.tag.id}
                        href={`/blog?tag=${t.tag.slug}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        {t.tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Share this article</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-500 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    aria-label="Copy link"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 px-4 bg-slate-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="relative aspect-[16/10] bg-slate-100">
                      {relatedPost.featuredImage ? (
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.featuredImageAlt || relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#003D5C] transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-slate-600 line-clamp-2 text-sm">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/blog">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Articles
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
