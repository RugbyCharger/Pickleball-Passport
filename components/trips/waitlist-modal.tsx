'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '1',  label: 'US / CA  (+1)' },
  { code: '44', label: 'UK       (+44)' },
  { code: '61', label: 'AU       (+61)' },
  { code: '64', label: 'NZ       (+64)' },
  { code: '49', label: 'DE       (+49)' },
  { code: '33', label: 'FR       (+33)' },
  { code: '31', label: 'NL       (+31)' },
  { code: '65', label: 'SG       (+65)' },
  { code: '66', label: 'TH       (+66)' },
  { code: '81', label: 'JP       (+81)' },
  { code: '82', label: 'KR       (+82)' },
  { code: '55', label: 'BR       (+55)' },
  { code: '52', label: 'MX       (+52)' },
  { code: '91', label: 'IN       (+91)' },
];

const TRIP_OPTIONS = [
  { value: '', label: 'Select a trip…' },
  { value: 'Thailand 8-Day Essential (May 6-13, 2026)',    label: 'Thailand 8-Day Essential (May 6–13, 2026)' },
  { value: 'Thailand 13-Day Ultimate (May 15-27, 2026)',  label: 'Thailand 13-Day Ultimate (May 15–27, 2026)' },
  { value: 'Not sure yet / Tell me more',                 label: 'Not sure yet / Tell me more' },
];

const REFERRAL_OPTIONS = [
  { value: '', label: 'Select one…' },
  { value: 'Instagram',                     label: 'Instagram' },
  { value: 'Facebook',                      label: 'Facebook' },
  { value: 'TikTok',                        label: 'TikTok' },
  { value: 'YouTube',                       label: 'YouTube' },
  { value: 'LinkedIn',                      label: 'LinkedIn' },
  { value: 'Google Search',                 label: 'Google Search' },
  { value: 'Pickleball Club / Community',   label: 'Pickleball Club / Community' },
  { value: 'Referred by a Partner',         label: 'Referred by a Partner' },
  { value: 'Referred by a Friend',          label: 'Referred by a Friend' },
  { value: 'Other',                         label: 'Other' },
];

const REFERRAL_NAME_SOURCES = new Set([
  'Pickleball Club / Community',
  'Referred by a Partner',
  'Referred by a Friend',
]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripName: string;
  isNotifyMe?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WaitlistModal({ open, onOpenChange, tripName, isNotifyMe = false }: WaitlistModalProps) {
  // Existing fields
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [submitted, setSubmitted]     = useState(false);

  // Change 1 — structured phone
  const [phoneCountry, setPhoneCountry] = useState('1');
  const [phoneLocal, setPhoneLocal]     = useState('');

  // Change 2 — trip interest dropdown
  const [tripInterest, setTripInterest] = useState('');

  // Change 3 — referral source + conditional name
  const [referralSource, setReferralSource] = useState('');
  const [referralName, setReferralName]     = useState('');

  // Changes 4 & 5 — UTM + lead source (captured from URL when modal opens)
  const [utmSource,   setUtmSource]   = useState('');
  const [utmMedium,   setUtmMedium]   = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmContent,  setUtmContent]  = useState('');
  const [leadSource,  setLeadSource]  = useState('');
  const [tripType,    setTripType]    = useState('');
  const [departureDate, setDepartureDate] = useState('');

  // Capture URL params each time the modal opens
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    const src      = params.get('utm_source')   ?? '';
    const medium   = params.get('utm_medium')   ?? '';
    const campaign = params.get('utm_campaign') ?? '';
    const content  = params.get('utm_content')  ?? '';

    setUtmSource(src);
    setUtmMedium(medium);
    setUtmCampaign(campaign);
    setUtmContent(content);

    // Auto-fill referral from UTM (Change 4)
    if (src === 'partner') {
      setReferralSource('Referred by a Partner');
      if (content) setReferralName(content);
    } else if (src === 'club') {
      setReferralSource('Pickleball Club / Community');
      if (content) setReferralName(content);
    }

    // Lead source + trip params (Change 5)
    const tripTypeParam     = params.get('trip_type')      ?? '';
    const departureDateParam = params.get('departure_date') ?? '';
    setTripType(tripTypeParam);
    setDepartureDate(departureDateParam);
    setLeadSource(tripTypeParam || departureDateParam ? 'Reserve Button' : 'Start Your Journey');
  }, [open]);

  const submitMutation = trpc.waitlist.submit.useMutation({
    onSuccess: () => { setSubmitted(true); },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build E.164 phone (Change 1)
    const e164Phone = phoneLocal.trim()
      ? `+${phoneCountry}${phoneLocal.replace(/\D/g, '')}`
      : '';

    submitMutation.mutate({
      fullName,
      email,
      // Existing fields — kept for backward compat
      phone:     e164Phone || undefined,
      trip:      tripInterest || tripName,
      hearAbout: referralSource || undefined,
      clubRef:   referralName  || undefined,
      // Extended CRM fields
      tripInterest:   tripInterest   || undefined,
      referralSource: referralSource || undefined,
      referralName:   referralName   || undefined,
      utmSource:      utmSource      || undefined,
      utmMedium:      utmMedium      || undefined,
      utmCampaign:    utmCampaign    || undefined,
      utmContent:     utmContent     || undefined,
      leadSource:     leadSource     || undefined,
      tripType:       tripType       || undefined,
      departureDate:  departureDate  || undefined,
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setFullName('');
        setEmail('');
        setPhoneCountry('1');
        setPhoneLocal('');
        setTripInterest('');
        setReferralSource('');
        setReferralName('');
        setUtmSource('');
        setUtmMedium('');
        setUtmCampaign('');
        setUtmContent('');
        setLeadSource('');
        setTripType('');
        setDepartureDate('');
        setSubmitted(false);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const inputClasses =
    'w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none';
  const selectClasses =
    'w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none';
  const labelClasses =
    'text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border border-[#B08D55]/20 max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#2D5A3D]/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#2D5A3D]" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-serif text-[#1D2D44]">
                {isNotifyMe ? 'You\u2019re on the notify list!' : 'You\u2019re on the list!'}
              </DialogTitle>
              <DialogDescription className="text-[#1D2D44]/70 text-sm leading-relaxed">
                {isNotifyMe
                  ? 'We\u2019ll notify you when this destination opens!'
                  : 'We\u2019ll reach out with final pricing and booking details soon.'}
              </DialogDescription>
            </DialogHeader>
            <a
              href="https://calendly.com/jaron-thepickleballpassport/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B08D55] to-[#CFB78D] text-[#1D2D44] font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-[#B08D55]/25"
            >
              Book a Call with Jaron
            </a>
            <Button
              onClick={() => handleClose(false)}
              variant="ghost"
              className="mt-1 text-[#1D2D44]/50 hover:text-[#1D2D44]"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-serif text-[#1D2D44]">
                {isNotifyMe ? 'Get Notified' : 'Reserve Your Spot'}
              </DialogTitle>
              <DialogDescription className="text-[#1D2D44]/70 text-sm">
                {isNotifyMe
                  ? 'Be the first to know when this destination launches.'
                  : 'Join the waitlist and be the first to know when booking opens.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClasses}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>

              {!isNotifyMe && (
                <>
                  {/* Change 1 — Phone with country selector */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                        className="h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-2 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none w-[145px] shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.label} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneLocal}
                        onChange={(e) => setPhoneLocal(e.target.value)}
                        placeholder="(555) 123-4567"
                        className={`${inputClasses} flex-1`}
                      />
                    </div>
                  </div>

                  {/* Change 2 — Trip interest dropdown */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>
                      Which trip are you interested in? <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={tripInterest}
                      onChange={(e) => setTripInterest(e.target.value)}
                      className={selectClasses}
                    >
                      {TRIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Preferred Trip (readonly — kept for isNotifyMe context) */}
              {isNotifyMe && (
                <div className="space-y-1.5">
                  <label className={labelClasses}>Destination</label>
                  <input
                    type="text"
                    value={tripName}
                    readOnly
                    className={`${inputClasses} bg-[#FDF8F3] cursor-not-allowed`}
                  />
                </div>
              )}

              {!isNotifyMe && (
                <>
                  {/* Change 3 — Referral source dropdown */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>How did you hear about us?</label>
                    <select
                      value={referralSource}
                      onChange={(e) => {
                        setReferralSource(e.target.value);
                        if (!REFERRAL_NAME_SOURCES.has(e.target.value)) {
                          setReferralName('');
                        }
                      }}
                      className={selectClasses}
                    >
                      {REFERRAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Conditional name field */}
                  {REFERRAL_NAME_SOURCES.has(referralSource) && (
                    <div className="space-y-1.5">
                      <label className={labelClasses}>Club, partner, or person name (optional)</label>
                      <input
                        type="text"
                        value={referralName}
                        onChange={(e) => setReferralName(e.target.value)}
                        placeholder="Name"
                        className={inputClasses}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#B08D55] to-[#CFB78D] hover:from-[#8D7144] hover:to-[#B08D55] text-[#1D2D44] font-semibold text-sm uppercase tracking-wider shadow-lg shadow-[#B08D55]/25 hover:shadow-xl transition-all"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isNotifyMe ? (
                  'Notify Me'
                ) : (
                  'Reserve Your Spot'
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
