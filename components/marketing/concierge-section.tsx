import { CheckCircle2 } from 'lucide-react';

const beforeItems = [
  'Your health background and any physical limitations',
  'Dietary habits and food preferences',
  'How you like to start your mornings',
  'What you want most from the trip',
  'Your skill level and play style',
];

const afterItems = [
  'Courts booked at the right times for your energy',
  'Transport arranged from the moment you land',
  'Hotel preferences matched and confirmed',
  'Your health intake reviewed and actioned',
  'A welcome experience ready when you walk in',
];

export function ConciergeSection() {
  return (
    <section className="bg-white py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-[#B08D55] uppercase mb-3">Concierge Experience</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              Before you arrive, we've already thought of everything.
            </h2>
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              Concierge isn't a word we use lightly. Here's what it actually looks like.
            </p>
          </div>

          {/* Real story */}
          <div className="bg-[#F5E6D3] rounded-2xl p-7 border border-[#B08D55]/20 mb-14">
            <p className="text-[#1D2D44] text-base leading-relaxed">
              One Bangkok trip, half the group's partners didn't play. Their wives were on court for three hours. We had Chinatown organized for the morning: river boat to get there, tuk-tuk back, cold beer at a spot that's been there for decades. They didn't want to come back for lunch.
            </p>
            <p className="text-[#B08D55] text-sm font-medium mt-4">
              That's the job: not just the players, everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <div>
              <h3 className="font-serif font-bold text-[#1D2D44] text-xl mb-5 border-b border-[#B08D55]/20 pb-3">
                Before you arrive, we ask about...
              </h3>
              <ul className="space-y-3">
                {beforeItems.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#1D2D44]/80 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#1D2D44] text-xl mb-5 border-b border-[#B08D55]/20 pb-3">
                When you land, we've already...
              </h3>
              <ul className="space-y-3">
                {afterItems.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-[#B08D55] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#1D2D44]/80 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#F5E6D3] rounded-2xl p-8 text-center border border-[#B08D55]/20">
            <p className="text-[#1D2D44] text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              "Compare it to the cost of planning this yourself: the bad courts, the wasted days, the what-ifs. This is your money and your time, handled."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
