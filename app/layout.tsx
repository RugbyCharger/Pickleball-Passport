import type { Metadata } from "next";
import { Montserrat, Nunito_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Prevent static generation - ClerkProvider requires valid keys during build
// Remove this once proper build-time environment variables are configured
export const dynamic = 'force-dynamic'
import { Providers } from "./providers";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

/**
 * Pickleball Passport - Official Brand Fonts
 *
 * Primary Heading Font: Nunito Sans (Google Fonts alternative to Proxima Nova)
 * Body Font: Montserrat
 *
 * Brand Kit by: inahsempire.social
 */

// Nunito Sans - Similar to Proxima Nova, used for headings
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Montserrat - Body text font as per brand guidelines
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pickleballpassport.com'),
  title: "Pickleball Passport | Luxury Transformation Tourism in Thailand",
  description: "Where Pickleball Meets World-Class Wellness and Medical Care in Thailand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization JSON-LD Schema for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pickleball Passport',
    url: 'https://pickleballpassport.com',
    logo: 'https://pickleballpassport.com/logo.png',
    description: 'Luxury wellness and pickleball experiences combining medical tourism, spiritual transformation, and pickleball in Thailand.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-PICKLE',
      contactType: 'Customer Service',
      email: 'hello@pickleballpassport.com',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://facebook.com/pickleballpassport',
      'https://instagram.com/pickleballpassport',
      'https://twitter.com/PickleballPass',
      'https://linkedin.com/company/pickleballpassport',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH',
      addressLocality: 'Bangkok',
    },
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        </head>
        <body
          className={`${montserrat.variable} ${nunitoSans.variable} font-sans antialiased`}
        >
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
