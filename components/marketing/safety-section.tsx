import Link from 'next/link';
import { Shield, MapPin, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const points = [
  {
    icon: MapPin,
    text: "Every court personally inspected before it's on your schedule.",
  },
  {
    icon: Calendar,
    text: 'Injury-aware scheduling with built-in recovery time between sessions.',
  },
  {
    icon: Phone,
    text: 'On-call support throughout your trip, not just pre-departure.',
  },
  {
    icon: Shield,
    text: 'Health intake before you arrive so we know what you need before you land.',
  },
];

export function SafetySection() {
  return (
    <section className="bg-[#1D2D44] py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest text-[#B08D55] uppercase mb-3">Trust & Safety</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Play safe, 8,000 miles from home.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              We don't send you somewhere and hope for the best. Here's what we actually do.
            </p>
          </div>

          {/* Real story */}
          <div className="bg-white/5 rounded-2xl p-7 border border-[#CFB78D]/20 mb-10">
            <p className="text-white/90 text-base leading-relaxed">
              It rained on day two of our last Bangkok trip. The outdoor courts flooded before the morning session. We'd already moved the group to Sterling — five-star indoor courts, fully air-conditioned — before anyone had finished their coffee. Nobody waited in the rain. Nobody missed a session.
            </p>
            <p className="text-[#B08D55] text-sm font-medium mt-4">
              That's what a backup plan looks like when it's real.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {points.map((point, i) => (
              <div key={i} className="flex gap-4 bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#B08D55]/20 flex items-center justify-center">
                  <point.icon className="w-5 h-5 text-[#B08D55]" />
                </div>
                <p className="text-white/80 text-sm leading-relaxed self-center">{point.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              asChild
              className="border-[#B08D55]/60 text-[#CFB78D] hover:bg-[#B08D55]/10 hover:border-[#B08D55] font-semibold"
            >
              <Link href="/trust-and-safety">See how we keep you safe →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
