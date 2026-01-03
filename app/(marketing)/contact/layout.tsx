import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Pickleball Passport',
  description:
    'Get in touch with Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
  openGraph: {
    title: 'Contact Us - Pickleball Passport',
    description:
      'Get in touch with Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
    url: 'https://pickleballpassport.com/contact',
    siteName: 'Pickleball Passport',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Pickleball Passport',
    description:
      'Get in touch with Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
  },
  alternates: {
    canonical: 'https://pickleballpassport.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Schema.org ContactPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Pickleball Passport',
            description:
              'Contact page for Pickleball Passport - transformation tourism packages in Thailand',
            url: 'https://pickleballpassport.com/contact',
            mainEntity: {
              '@type': 'Organization',
              name: 'Pickleball Passport',
              url: 'https://pickleballpassport.com',
              email: 'hello@pickleballpassport.com',
              telephone: '+1-555-123-4567',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Chiang Mai',
                addressCountry: 'Thailand',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-123-4567',
                contactType: 'Customer Service',
                email: 'hello@pickleballpassport.com',
                availableLanguage: ['English'],
                hoursAvailable: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                  ],
                  opens: '09:00',
                  closes: '18:00',
                },
              },
            },
          }),
        }}
      />
      {children}
    </>
  )
}
