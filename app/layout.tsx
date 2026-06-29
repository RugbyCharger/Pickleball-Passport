import type { Metadata } from "next";
import { Montserrat, Nunito_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

// ClerkProvider works with static pages when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
// is available as a build env var. No force-dynamic needed.
import { Providers } from "./providers";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { AffiliateTracker } from "@/components/affiliate-tracker";

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
  metadataBase: new URL('https://thepickleballpassport.org'),
  title: "The Pickleball Passport | Premier Pickleball Travel in Thailand",
  description: "Where Pickleball Meets Exceptional Wellness and Adventure in Thailand",
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
    name: 'The Pickleball Passport',
    url: 'https://thepickleballpassport.org',
    logo: 'https://thepickleballpassport.org/logo.png',
    description: 'Premier wellness and pickleball travel experiences in Thailand.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-512-564-8522',
      contactType: 'Customer Service',
      email: 'hello@thepickleballpassport.org',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://www.instagram.com/pickleball.passport',
      'https://www.linkedin.com/in/jaron-shoptaugh-ab675574/',
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
          <script
            dangerouslySetInnerHTML={{
              __html: `function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'th,zh-CN,zh-TW,id,ms,ja,ko,es,fr,de',
    autoDisplay: false
  }, 'google_translate_element');
}`,
            }}
          />
        </head>
        <body
          className={`${montserrat.variable} ${nunitoSans.variable} font-sans antialiased`}
        >
          <Providers>
            <AffiliateTracker />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
          <div id="google_translate_element" className="hidden" />
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
