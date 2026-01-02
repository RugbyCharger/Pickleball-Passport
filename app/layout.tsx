import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
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
          className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        >
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
