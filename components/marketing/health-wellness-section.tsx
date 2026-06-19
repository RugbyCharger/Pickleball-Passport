import { Activity, Apple, Brain, Wind } from 'lucide-react';

const dimensions = [
  {
    icon: Activity,
    title: 'Physical',
    description:
      'Movement, recovery, and play schedules designed around how your body actually feels, not a one-size-fits-all plan.',
  },
  {
    icon: Apple,
    title: 'Nutritional',
    description:
      "Guidance on eating well in Thailand, adapted to your dietary habits, so you're fueled to play your best.",
  },
  {
    icon: Brain,
    title: 'Mental',
    description:
      'Strategies for staying sharp and present on the court, especially when travel fatigue and time zones work against you.',
  },
  {
    icon: Wind,
    title: 'Stress & Recovery',
    description:
      'Evening wind-down sessions after play that address what a hard game of pickleball actually does to your body at 55+.',
  },
];

export function HealthWellnessSection() {
  return (
    <section className="bg-[#FDF8F3] py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-[#B08D55] uppercase mb-3">Health & Wellness</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1D2D44] mb-4">
              A real wellness program. Not a gimmick.
            </h2>
            <p className="text-lg text-[#1D2D44]/70 max-w-2xl mx-auto">
              Our certified health coach runs a structured program across four dimensions, starting with a welcome wellness session on arrival, followed by evening workshops throughout the trip.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {dimensions.map((dim, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#B08D55]/15 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[#B08D55]/10 flex items-center justify-center mb-4">
                  <dim.icon className="w-5 h-5 text-[#B08D55]" />
                </div>
                <h3 className="font-serif font-bold text-[#1D2D44] text-lg mb-2">{dim.title}</h3>
                <p className="text-sm text-[#1D2D44]/70 leading-relaxed">{dim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
