import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Frontmatter {
  title: string;
  lastUpdated: string | Date;
  description: string;
}

// Format date to string
function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}

interface Heading {
  text: string;
  slug: string;
}

// Read markdown file at build time
function getPrivacyContent(): { frontmatter: Frontmatter; content: string } {
  const filePath = path.join(process.cwd(), 'content/legal/privacy-policy.md');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    frontmatter: data as Frontmatter,
    content,
  };
}

// Extract headings from markdown for TOC
function extractHeadings(content: string): Heading[] {
  const headingRegex = /^#{2}\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1];
    const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    headings.push({ text, slug });
  }

  return headings;
}

export const metadata: Metadata = {
  title: 'Privacy Policy | The Pickleball Passport',
  description:
    'Learn how The Pickleball Passport protects your privacy. Our policy covers GDPR, CCPA compliance, data collection, cookies, and third-party services.',
  keywords: [
    'privacy policy',
    'GDPR',
    'CCPA',
    'data protection',
    'cookies',
    'personal data',
    'The Pickleball Passport privacy',
  ],
  openGraph: {
    title: 'Privacy Policy | The Pickleball Passport',
    description:
      'Learn how The Pickleball Passport protects your privacy. Our policy covers GDPR, CCPA compliance, data collection, cookies, and third-party services.',
    url: 'https://pickleballpassport.com/privacy',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | The Pickleball Passport',
    description:
      'Learn how The Pickleball Passport protects your privacy. Our policy covers GDPR, CCPA compliance, data collection, cookies, and third-party services.',
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://pickleballpassport.com/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const { frontmatter, content } = getPrivacyContent();
  const headings = extractHeadings(content);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{frontmatter.title}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-blue-100 text-lg">
            Last Updated: {formatDate(frontmatter.lastUpdated)}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:gap-12">
          {/* Table of Contents - Sidebar on larger screens */}
          <aside className="lg:w-64 lg:flex-shrink-0 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {headings.map((heading) => (
                  <a
                    key={heading.slug}
                    href={`#${heading.slug}`}
                    className="block text-sm text-gray-600 hover:text-[#1D2D44] hover:underline transition-colors"
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none prose-headings:text-[#1D2D44] prose-headings:scroll-mt-8 prose-a:text-[#1D2D44] hover:prose-a:text-[#B08D55] prose-a:transition-colors prose-table:text-sm prose-th:bg-gray-100 prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return (
                      <h2 id={slug} className="scroll-mt-8" {...props}>
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const slug = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    return (
                      <h3 id={slug} className="scroll-mt-8" {...props}>
                        {children}
                      </h3>
                    );
                  },
                  a: ({ href, children, ...props }) => {
                    const isExternal = href?.startsWith('http');
                    return (
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="min-w-full" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Questions About Your Privacy?
          </h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy or how we handle your data,
            please don&apos;t hesitate to contact us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1D2D44] text-white font-medium rounded-md hover:bg-[#495F87] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
