import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - The Pickleball Passport',
  description:
    'Get in touch with The Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
  openGraph: {
    title: 'Contact Us - The Pickleball Passport',
    description:
      'Get in touch with The Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
    url: 'https://thepickleballpassport.org/contact',
    siteName: 'The Pickleball Passport',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - The Pickleball Passport',
    description:
      'Get in touch with The Pickleball Passport. Have questions about our transformation tourism packages in Thailand? We\'re here to help.',
  },
  alternates: {
    canonical: 'https://thepickleballpassport.org/contact',
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
            name: 'Contact The Pickleball Passport',
            description:
              'Contact page for The Pickleball Passport - transformation tourism packages in Thailand',
            url: 'https://thepickleballpassport.org/contact',
            mainEntity: {
              '@type': 'Organization',
              name: 'The Pickleball Passport',
              url: 'https://thepickleballpassport.org',
              email: 'jaron@thepickleballpassport.org',
              telephone: '+1-555-123-4567',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Bangkok',
                addressCountry: 'Thailand',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-123-4567',
                contactType: 'Customer Service',
                email: 'jaron@thepickleballpassport.org',
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
