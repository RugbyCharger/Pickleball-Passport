import { Sun, DollarSign, Utensils, Heart, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    icon: DollarSign,
    title: 'World-class value',
    description:
      "Five-star resorts, private coaching, and curated experiences at a fraction of what you'd pay in the US or Europe.",
  },
  {
    icon: Heart,
    title: 'The people mean it',
    description:
      "Staff at our partner hotels have remembered guests' names after one introduction and had their coffee order ready the next morning without being asked. That isn't exceptional service in Thailand. It's just how people operate here.",
  },
  {
    icon: Sun,
    title: 'A genuine racket sport culture',
    description:
      "Thailand takes racket sports seriously — badminton, tennis, padel, and now pickleball. The courts are built for it. The coaches understand the game. You'll end up playing alongside Thais who can beat you, which is exactly the kind of match you came here for.",
  },
  {
    icon: Utensils,
    title: 'The food alone is worth it',
    description:
      "Fresh, flavorful, and everywhere. Eating well on this trip is not an afterthought — it's part of the experience.",
  },
  {
    icon: ShieldCheck,
    title: 'Health and wellness infrastructure',
    description:
      'World-class hospitals, spa culture, and a health-tourism ecosystem that makes recovery and care genuinely accessible.',
  },
];

export function WhyThailand() {
  return (
    <section id="why-thailand" className="bg-white py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-[#B08D55] uppercase mb-3">Why Thailand</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              There's a reason serious players come back.
            </h2>
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              Thailand isn't just a backdrop. It's the reason the trip works.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {reasons.map((reason, i) => (
              <div
                key={i}
                className={`flex gap-4 ${i === 4 ? 'sm:col-span-2 sm:max-w-md sm:mx-auto' : ''}`}
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#B08D55]/10 flex items-center justify-center mt-0.5">
                  <reason.icon className="w-5 h-5 text-[#B08D55]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1D2D44] mb-1">{reason.title}</h3>
                  <p className="text-sm text-[#1D2D44]/70 leading-relaxed">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
