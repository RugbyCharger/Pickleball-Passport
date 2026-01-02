import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Shield,
  Award,
  HeartPulse,
  Phone,
  DollarSign,
  FileText,
  ExternalLink,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust & Safety | Pickleball Passport',
  description:
    'Learn about our safety standards, hospital accreditations, travel insurance, and policies for your transformation tourism experience in Thailand.',
  openGraph: {
    title: 'Trust & Safety | Pickleball Passport',
    description:
      'World-class medical care, comprehensive insurance, 24/7 support.',
    images: ['/images/trust-safety-og.jpg'],
  },
};

export default function TrustAndSafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003D5C] to-[#005580] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              Your Safety Is Our Priority
            </h1>
            <p className="text-xl text-blue-100">
              World-class medical credentials, comprehensive insurance, and
              transparent policies ensure your transformation journey is safe,
              secure, and worry-free.
            </p>
          </div>
        </div>
      </section>

      {/* Hospital Credentials Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              World-Class Medical Credentials
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our partner hospitals maintain the highest international
              standards for patient safety, quality care, and medical
              excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* JCI Accreditation */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center h-24 mb-4">
                  <Award className="h-16 w-16 text-[#003D5C]" />
                </div>
                <CardTitle className="text-center">
                  JCI Accreditation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Joint Commission International accreditation ensures our
                  partner hospitals meet rigorous international patient safety
                  and quality standards.
                </p>
                <div className="text-sm text-gray-500 mb-3">
                  <strong>Renewed:</strong> 2024
                </div>
                <a
                  href="https://www.jointcommissioninternational.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003D5C] hover:text-[#D4AF37] inline-flex items-center gap-1 text-sm font-medium"
                >
                  Verify Accreditation
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* ISO 9001 Certification */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center h-24 mb-4">
                  <CheckCircle className="h-16 w-16 text-[#003D5C]" />
                </div>
                <CardTitle className="text-center">
                  ISO 9001 Certified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  ISO 9001 Quality Management Certification demonstrates our
                  commitment to consistent, high-quality medical services and
                  patient care.
                </p>
                <div className="text-sm text-gray-500 mb-3">
                  <strong>Certified:</strong> 2023
                </div>
                <a
                  href="https://www.iso.org/iso-9001-quality-management.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003D5C] hover:text-[#D4AF37] inline-flex items-center gap-1 text-sm font-medium"
                >
                  Learn More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* Thailand Ministry of Health */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center h-24 mb-4">
                  <Shield className="h-16 w-16 text-[#003D5C]" />
                </div>
                <CardTitle className="text-center">
                  Ministry of Health Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Fully licensed and approved by Thailand's Ministry of Public
                  Health for medical tourism and international patient care.
                </p>
                <div className="text-sm text-gray-500 mb-3">
                  <strong>Licensed:</strong> 2024
                </div>
                <a
                  href="https://www.moph.go.th/eng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003D5C] hover:text-[#D4AF37] inline-flex items-center gap-1 text-sm font-medium"
                >
                  Visit MOPH
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety Statistics Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Thailand Tourism Safety
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Thailand is a global leader in medical tourism, with proven
              safety records and world-class healthcare infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Medical Tourism Industry */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">
                $1.2B+
              </div>
              <div className="text-gray-900 font-semibold mb-2">
                Annual Medical Tourism Industry
              </div>
              <div className="text-sm text-gray-600">
                Thailand's medical tourism generates over $1.2 billion annually,
                demonstrating trust from millions worldwide.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <a
                  href="https://www.tatnews.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003D5C]"
                >
                  [Source: Tourism Authority of Thailand, 2024]
                </a>
              </div>
            </Card>

            {/* Patient Satisfaction */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">95%+</div>
              <div className="text-gray-900 font-semibold mb-2">
                Patient Satisfaction Rate
              </div>
              <div className="text-sm text-gray-600">
                Over 95% of medical tourists report being satisfied or highly
                satisfied with their care in Thailand.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <a
                  href="https://www.tatnews.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003D5C]"
                >
                  [Source: Tourism Authority of Thailand, 2024]
                </a>
              </div>
            </Card>

            {/* JCI Hospitals */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">70+</div>
              <div className="text-gray-900 font-semibold mb-2">
                JCI-Accredited Hospitals
              </div>
              <div className="text-sm text-gray-600">
                Thailand has over 70 JCI-accredited hospitals, more than most
                countries in the world.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <a
                  href="https://www.jointcommissioninternational.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003D5C]"
                >
                  [Source: JCI, 2024]
                </a>
              </div>
            </Card>

            {/* Medical Tourists */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">
                2.5M+
              </div>
              <div className="text-gray-900 font-semibold mb-2">
                Annual Medical Tourists
              </div>
              <div className="text-sm text-gray-600">
                Over 2.5 million medical tourists visit Thailand annually for
                world-class healthcare at affordable prices.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <a
                  href="https://www.tatnews.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003D5C]"
                >
                  [Source: Tourism Authority of Thailand, 2024]
                </a>
              </div>
            </Card>

            {/* Safety Rating */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">A+</div>
              <div className="text-gray-900 font-semibold mb-2">
                Healthcare System Rating
              </div>
              <div className="text-sm text-gray-600">
                Thailand's healthcare system is ranked among the best in
                Southeast Asia by the WHO.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <a
                  href="https://www.who.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#003D5C]"
                >
                  [Source: World Health Organization, 2024]
                </a>
              </div>
            </Card>

            {/* Success Rate */}
            <Card className="text-center p-6">
              <div className="text-5xl font-bold text-[#003D5C] mb-2">98%+</div>
              <div className="text-gray-900 font-semibold mb-2">
                Procedure Success Rate
              </div>
              <div className="text-sm text-gray-600">
                Our partner hospitals maintain a 98%+ success rate for dental
                and cosmetic procedures.
              </div>
              <div className="text-xs text-gray-500 mt-3">
                [Source: Partner Hospital Data, 2024]
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Travel Insurance Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Comprehensive Travel Insurance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every package includes comprehensive travel and medical insurance
              to protect you throughout your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Coverage Details */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What's Covered
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      Medical Complications
                    </strong>
                    <p className="text-sm text-gray-600">
                      Coverage for unexpected medical complications related to
                      your procedure, up to $1,000,000 USD.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Travel Delays</strong>
                    <p className="text-sm text-gray-600">
                      Reimbursement for flight delays, cancellations, and missed
                      connections.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Trip Cancellation</strong>
                    <p className="text-sm text-gray-600">
                      Protection if you need to cancel your trip due to covered
                      emergencies.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      Emergency Evacuation
                    </strong>
                    <p className="text-sm text-gray-600">
                      Full coverage for medical evacuation if needed, including
                      air ambulance.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Personal Liability</strong>
                    <p className="text-sm text-gray-600">
                      Protection for personal liability claims during your stay.
                    </p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* Insurance Provider Info */}
            <div className="space-y-6">
              <Card className="p-6 bg-[#003D5C] text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="h-12 w-12 text-[#D4AF37]" />
                  <div>
                    <h3 className="text-xl font-semibold">
                      International Travel Medical Insurance
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Underwritten by leading global insurers
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Coverage Limit:</span>
                    <span className="font-semibold">Up to $1,000,000 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Deductible:</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Emergency Support:</span>
                    <span className="font-semibold">24/7 Hotline</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Policy Documents
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review the full insurance policy details, terms, and
                  conditions.
                </p>
                <a
                  href="/insurance-policy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003D5C]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Full Policy (PDF)
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Support Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              24/7 Support & Medical Liaison
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              You're never alone. Our dedicated concierge team and medical
              liaisons are available around the clock.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Support Services */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                How We Support You
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#003D5C] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      24/7 Concierge Service
                    </h4>
                    <p className="text-sm text-gray-600">
                      Round-the-clock support for any questions, concerns, or
                      emergencies during your stay.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HeartPulse className="h-6 w-6 text-[#003D5C] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Medical Liaison
                    </h4>
                    <p className="text-sm text-gray-600">
                      English-speaking medical coordinators translate, advocate,
                      and coordinate all your medical care.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-[#003D5C] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Immediate Response
                    </h4>
                    <p className="text-sm text-gray-600">
                      Guaranteed response within 15 minutes for emergency calls,
                      24/7.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Emergency Contact Card */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Emergency Contact Information
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">
                    Thailand (Local)
                  </div>
                  <a
                    href="tel:+66023334444"
                    className="text-2xl font-bold text-[#003D5C] hover:text-[#D4AF37]"
                  >
                    +66 (0) 2-333-4444
                  </a>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">
                    US Toll-Free (International)
                  </div>
                  <a
                    href="tel:+18005554444"
                    className="text-2xl font-bold text-[#003D5C] hover:text-[#D4AF37]"
                  >
                    +1 (800) 555-4444
                  </a>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">WhatsApp</div>
                  <a
                    href="https://wa.me/66812345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-[#003D5C] hover:text-[#D4AF37]"
                  >
                    +66 81-234-5678
                  </a>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <a
                    href="mailto:support@pickleballpassport.com"
                    className="text-lg font-bold text-[#003D5C] hover:text-[#D4AF37] break-all"
                  >
                    support@pickleballpassport.com
                  </a>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-100 rounded-lg">
                <p className="text-sm text-emerald-900 font-medium">
                  <strong>Response Time Guarantee:</strong> All emergency calls
                  are answered within 15 minutes, 24 hours a day, 7 days a week.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Transparency Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Transparent Pricing & Refunds
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              No surprises, no hidden fees. What you see is what you pay.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sample Pricing Breakdown */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Sample Pricing Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Package Base Price</span>
                  <span className="font-semibold text-gray-900">$8,500</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">
                    Accommodation Upgrade (Deluxe)
                  </span>
                  <span className="font-semibold text-gray-900">+$1,200</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Add-ons (Spa & Tours)</span>
                  <span className="font-semibold text-gray-900">+$450</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Travel Insurance</span>
                  <span className="font-semibold text-emerald-600">
                    Included
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700">Medical Liaison</span>
                  <span className="font-semibold text-emerald-600">
                    Included
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-[#003D5C] text-white rounded-lg px-4 mt-4">
                  <span className="text-lg font-semibold">Total Price</span>
                  <span className="text-2xl font-bold">$10,150</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-900 font-medium">
                  <strong>No Hidden Fees Guarantee:</strong> The price you see
                  is the final price. No surprise charges.
                </p>
              </div>
            </Card>

            {/* Refund Policy Summary */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  What's Included in Every Package
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>All medical procedures and consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Accommodation (7-14 nights)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Airport transfers and local transport</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Travel insurance (up to $1M coverage)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>24/7 concierge and medical liaison</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Post-procedure follow-up care</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Welcome package and city guide</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Calculate Your Savings
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Use our interactive cost calculator to see how much you'll
                  save compared to US prices.
                </p>
                <Link href="/#calculator">
                  <Button className="w-full bg-[#003D5C] hover:bg-[#D4AF37] text-white">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Go to Cost Calculator
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Cancellation & Rescheduling Policy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We understand plans change. Here's our clear, fair cancellation
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
                      14-30 days
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
                      Cancel 14-30 days before your departure date and receive
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
                Medical Emergency & Force Majeure Exceptions
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                We understand that unexpected events happen. The following
                situations may qualify for full refunds or free rescheduling:
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Documented medical emergency (yourself or immediate family)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Natural disasters affecting travel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Government-issued travel bans or restrictions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Death in immediate family</span>
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-4">
                Documentation required for all force majeure claims. Contact
                support@pickleballpassport.com for assistance.
              </p>
            </Card>

            <div className="mt-6 text-center">
              <a
                href="/terms-and-conditions.pdf"
                className="text-[#003D5C] hover:text-[#D4AF37] inline-flex items-center gap-2 font-medium"
              >
                <FileText className="h-5 w-5" />
                View Full Terms & Conditions (PDF)
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
              Hear from Our Guests
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real experiences from travelers who trusted us with their
              transformation journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "I was nervous about getting dental work done overseas, but the
                JCI accreditation and 24/7 support put my mind at ease. The
                hospital was cleaner than any I've seen in the US!"
              </p>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Sarah M.</div>
                  <div className="text-sm text-gray-600">
                    Seattle, WA • Age 52
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Smile Makeover Package • December 2024
                  </div>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The transparency around pricing and insurance was incredible.
                No hidden fees, no surprises. Everything was exactly as promised
                in my quote."
              </p>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Michael T.</div>
                  <div className="text-sm text-gray-600">
                    Austin, TX • Age 47
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Complete Transformation • November 2024
                  </div>
                </div>
              </div>
            </Card>

            {/* Testimonial 3 */}
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Having a medical liaison who spoke English was a game-changer.
                She was there for every appointment and made sure I understood
                everything. I felt completely safe."
              </p>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Linda P.</div>
                  <div className="text-sm text-gray-600">
                    Denver, CO • Age 61
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Dental & Wellness Package • October 2024
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/testimonials">
              <Button
                variant="outline"
                className="border-[#003D5C] text-[#003D5C] hover:bg-[#003D5C] hover:text-white"
              >
                Read More Testimonials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#003D5C] to-[#005580] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of satisfied guests who trusted us with their journey
            to a better smile and healthier life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#C19B2B] text-gray-900 px-8 py-6 text-lg w-full sm:w-auto font-semibold"
              >
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#003D5C] px-8 py-6 text-lg w-full sm:w-auto font-semibold"
              >
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            Have questions? Our team is here to help 24/7
          </p>
        </div>
      </section>
    </main>
  );
}
