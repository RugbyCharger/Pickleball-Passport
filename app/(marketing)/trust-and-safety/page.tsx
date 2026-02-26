import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Plane,
  Hotel,
  MapPin,
  Users,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust & Safety | The Pickleball Passport',
  description:
    'Learn about our safety standards, vetted accommodations, private transport, and travel insurance recommendations for your pickleball trip to Thailand.',
  keywords: [
    'travel safety',
    'Thailand travel',
    'pickleball travel safety',
    'group travel safety',
    'Thailand tourism',
  ],
  openGraph: {
    title: 'Trust & Safety | The Pickleball Passport',
    description:
      'Vetted hotels, private transport, on-the-ground trip hosts, and curated itineraries. How we keep you covered on every trip.',
    url: 'https://www.thepickleballpassport.org/trust-and-safety',
    siteName: 'The Pickleball Passport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust & Safety | The Pickleball Passport',
    description:
      'Vetted hotels, private transport, on-the-ground trip hosts, and curated itineraries. How we keep you covered on every trip.',
    site: '@PickleballPass',
    creator: '@PickleballPass',
  },
  alternates: {
    canonical: 'https://www.thepickleballpassport.org/trust-and-safety',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TrustAndSafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              Your Safety Is Our Priority
            </h1>
            <p className="text-xl text-blue-100">
              Every trip is planned with your comfort and safety in mind.
              From vetted accommodations and private transport to on-the-ground
              trip hosts who know the destination inside and out.
            </p>
          </div>
        </div>
      </section>

      {/* Intro Banner */}
      <section className="bg-[#B08D55]/10 border-y border-[#B08D55]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <Shield className="h-6 w-6 text-[#B08D55] flex-shrink-0" />
            <p className="text-base font-medium text-[#1D2D44]">
              Your safety is our priority. All The Pickleball Passport trips include comprehensive travel protection and liability coverage.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Country Safety */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Country Safety
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Thailand is one of the world&apos;s most visited countries, and for
              good reason. It&apos;s safe, welcoming, and built for tourism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Plane className="h-10 w-10 text-[#1D2D44] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                World-Class Tourism Infrastructure
              </h3>
              <p className="text-sm text-gray-600">
                Thailand welcomed 28+ million visitors in 2024. International
                airports, modern highways, and a well-developed hospitality
                industry make it one of the easiest countries to travel in
                Southeast Asia.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Users className="h-10 w-10 text-[#1D2D44] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                English Is Widely Spoken
              </h3>
              <p className="text-sm text-gray-600">
                In tourist areas, hotels, restaurants, and sports facilities,
                English is commonly spoken. You won&apos;t have trouble
                communicating in the places we take you.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-10 w-10 text-[#1D2D44] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Safe for Tourists
              </h3>
              <p className="text-sm text-gray-600">
                Thailand ranks as one of the safest destinations in Asia for
                international visitors. Petty crime is low in tourist areas,
                and the culture is famously hospitable.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Keep You Covered */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Trip Logistics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every detail is handled so you can focus on playing pickleball
              and enjoying Thailand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <Car className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Private Transport
                </h3>
                <p className="text-sm text-gray-600">
                  Air-conditioned vans and private vehicles for all group
                  transfers. No haggling with taxis or navigating public
                  transit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <Hotel className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vetted Hotels
                </h3>
                <p className="text-sm text-gray-600">
                  We stay at hand-picked, quality hotels in safe, central
                  locations. Every property is personally vetted by our team.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <Users className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  On-the-Ground Trip Host
                </h3>
                <p className="text-sm text-gray-600">
                  A dedicated trip host travels with the group from start to
                  finish. Your point person for anything you need.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <Plane className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Airport Transfers
                </h3>
                <p className="text-sm text-gray-600">
                  Arrival and departure airport transfers are included. We meet
                  you at the airport so you never have to figure out ground
                  transportation on your own.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <MapPin className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Curated Itinerary
                </h3>
                <p className="text-sm text-gray-600">
                  Every day is planned. Courts booked, excursions arranged,
                  restaurants scouted. You show up, we handle the rest.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
              <Clock className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Pre-Trip Support
                </h3>
                <p className="text-sm text-gray-600">
                  From visa guidance to packing tips, we provide everything you
                  need to feel prepared before you leave home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Insurance & Protection */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
                Insurance &amp; Protection
              </h2>
            </div>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-[#1D2D44] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We Strongly Recommend Travel Insurance
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Travel insurance is not included in our trip packages. We
                    strongly recommend purchasing your own travel insurance policy
                    before departure. A good policy should cover:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Trip cancellation and interruption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Emergency medical coverage abroad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Emergency medical evacuation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Lost or delayed baggage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Sports and adventure activity coverage</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500">
                    We&apos;re working on a preferred insurance partner recommendation.
                    In the meantime, popular options include World Nomads,
                    Allianz Travel, and Safety Wing.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Pickleball */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Pickleball
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We play at the best pickleball facilities in each city. Purpose-built courts with quality surfaces, proper lighting,
              and a great atmosphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#B08D55] mb-1">
                  Bangkok
                </div>
                <h3 className="text-xl font-bold">SukSpace</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">
                  Bangkok&apos;s premier indoor pickleball facility. Climate-controlled
                  courts, pro-shop, and a social lounge — the home base for
                  Bangkok&apos;s growing pickleball community.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#B08D55] mb-1">
                  Chiang Mai
                </div>
                <h3 className="text-xl font-bold">BokBok Pickleball</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">
                  Chiang Mai&apos;s dedicated outdoor pickleball venue set against a
                  mountain backdrop. Multiple courts, evening lighting, and a
                  friendly local community.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-[#1D2D44] to-[#495F87] p-6 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#B08D55] mb-1">
                  Phuket
                </div>
                <h3 className="text-xl font-bold">The Peak Pickleball</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">
                  Phuket&apos;s top pickleball destination with well-maintained
                  outdoor courts, ocean breezes, and a vibrant mix of local
                  and international players.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Wellness */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
                Wellness
              </h2>
            </div>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-[#B08D55] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-700 mb-4">
                    Thailand is a globally recognized destination for wellness
                    and relaxation. Our trips include access to world-class
                    spas, Thai massage, yoga sessions, and wellness retreats
                    to help you recover and recharge between games.
                  </p>
                  <p className="text-sm text-gray-700">
                    All wellness activities included in our trips are vetted
                    by our team. If you choose to book additional services
                    independently, those arrangements are between you and the
                    provider.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Policies */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Policies
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We understand plans change. Here&apos;s our clear, fair cancellation
              and rescheduling policy.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Cancellation Timeline */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Cancellation Refund Schedule
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex-shrink-0 w-24 text-center">
                    <div className="text-2xl font-bold text-emerald-700">
                      30+ days
                    </div>
                    <div className="text-xs text-emerald-600">
                      before departure
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      80% Refund
                    </div>
                    <p className="text-sm text-gray-600">
                      Cancel 30 or more days before your departure date and
                      receive an 80% refund of your package price.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex-shrink-0 w-24 text-center">
                    <div className="text-2xl font-bold text-yellow-700">
                      14–30 days
                    </div>
                    <div className="text-xs text-yellow-600">
                      before departure
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      50% Refund
                    </div>
                    <p className="text-sm text-gray-600">
                      Cancel 14–30 days before your departure date and receive
                      a 50% refund of your package price.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex-shrink-0 w-24 text-center">
                    <div className="text-2xl font-bold text-red-700">
                      Under 14 days
                    </div>
                    <div className="text-xs text-red-600">before departure</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      Non-Refundable
                    </div>
                    <p className="text-sm text-gray-600">
                      Cancellations made less than 14 days before departure are
                      non-refundable due to pre-booked services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Initial deposits are always
                  non-refundable to cover administrative and booking costs.
                  Refunds are processed within 14 business days.
                </p>
              </div>
            </Card>

            {/* Rescheduling Policy */}
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Rescheduling Your Trip
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      First Reschedule: Free
                    </strong>
                    <p className="text-sm text-gray-600">
                      Change your dates once for free, up to 30 days before your
                      original departure date.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      Additional Changes: $250 Fee
                    </strong>
                    <p className="text-sm text-gray-600">
                      Subsequent date changes incur a $250 administrative fee to
                      cover rebooking costs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      New Dates Within 12 Months
                    </strong>
                    <p className="text-sm text-gray-600">
                      Rescheduled trips must be completed within 12 months of the
                      original booking date.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Force Majeure */}
            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Medical Emergency &amp; Force Majeure Exceptions
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                We understand that unexpected events happen. The following
                situations may qualify for full refunds or free rescheduling:
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">&bull;</span>
                  <span>
                    Documented medical emergency (yourself or immediate family)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">&bull;</span>
                  <span>Natural disasters affecting travel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">&bull;</span>
                  <span>
                    Government-issued travel bans or restrictions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">&bull;</span>
                  <span>Death in immediate family</span>
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-4">
                Documentation required for all force majeure claims. Contact{' '}
                <a
                  href="mailto:jaron@thepickleballpassport.org"
                  className="text-[#1D2D44] hover:text-[#B08D55] underline"
                >
                  jaron@thepickleballpassport.org
                </a>{' '}
                for assistance.
              </p>
            </Card>

            <div className="mt-6 text-center">
              <Link
                href="/refund-policy"
                className="text-[#1D2D44] hover:text-[#B08D55] inline-flex items-center gap-2 font-medium"
              >
                <FileText className="h-5 w-5" />
                View Full Refund Policy
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1D2D44] to-[#495F87] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Play?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse our upcoming trips and reserve your spot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips">
              <Button
                size="lg"
                className="bg-[#B08D55] hover:bg-[#C19B2B] text-gray-900 px-8 py-6 text-lg w-full sm:w-auto font-semibold"
              >
                View Upcoming Trips
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#1D2D44] px-8 py-6 text-lg w-full sm:w-auto font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
