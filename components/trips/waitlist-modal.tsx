'use client';

import { useState } from 'react';
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

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripName: string;
  isNotifyMe?: boolean;
}

export function WaitlistModal({ open, onOpenChange, tripName, isNotifyMe = false }: WaitlistModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [clubRef, setClubRef] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.waitlist.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      fullName,
      email,
      phone: phone || undefined,
      trip: tripName,
      hearAbout: hearAbout || undefined,
      clubRef: clubRef || undefined,
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      setTimeout(() => {
        setFullName('');
        setEmail('');
        setPhone('');
        setHearAbout('');
        setClubRef('');
        setSubmitted(false);
      }, 300);
    }
    onOpenChange(isOpen);
  };

  const inputClasses =
    'w-full h-11 rounded-xl border border-[#1D2D44]/15 bg-white px-3 text-sm text-[#1D2D44] focus:border-[#B08D55] focus:ring-1 focus:ring-[#B08D55] outline-none';
  const labelClasses =
    'text-xs font-semibold uppercase tracking-wider text-[#1D2D44]/50';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border border-[#B08D55]/20">
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
            <Button
              onClick={() => handleClose(false)}
              className="mt-4 bg-[#1D2D44] hover:bg-[#002B42] text-white rounded-xl"
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
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={inputClasses}
                    />
                  </div>
                </>
              )}

              {/* Preferred Trip (readonly) */}
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  {isNotifyMe ? 'Destination' : 'Preferred Trip'}
                </label>
                <input
                  type="text"
                  value={tripName}
                  readOnly
                  className={`${inputClasses} bg-[#FDF8F3] cursor-not-allowed`}
                />
              </div>

              {!isNotifyMe && (
                <>
                  {/* How did you hear about us? */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>How did you hear about us?</label>
                    <input
                      type="text"
                      value={hearAbout}
                      onChange={(e) => setHearAbout(e.target.value)}
                      placeholder="Social media, friend, podcast, etc."
                      className={inputClasses}
                    />
                  </div>

                  {/* Referred by a club or partner? */}
                  <div className="space-y-1.5">
                    <label className={labelClasses}>Referred by a club or partner?</label>
                    <input
                      type="text"
                      value={clubRef}
                      onChange={(e) => setClubRef(e.target.value)}
                      placeholder="Club or partner name"
                      className={inputClasses}
                    />
                  </div>
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
