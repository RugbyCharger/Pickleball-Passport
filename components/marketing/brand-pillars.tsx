import { ShieldCheck, CheckCircle2, Heart } from 'lucide-react';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'You can trust us',
    description: 'Vetted courts, vetted partners, nothing left to chance.',
  },
  {
    icon: CheckCircle2,
    title: 'Hassle-free',
    description: 'We take care of it all. You just show up and play.',
  },
  {
    icon: Heart,
    title: 'Hospitality',
    description: 'Welcome. You belong here. Treated like a guest, not a tourist.',
  },
];

export function BrandPillars() {
  return (
    <section className="bg-[#FDF8F3] py-14 border-b border-[#B08D55]/20">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-[#B08D55]/10 flex items-center justify-center mb-4">
                <pillar.icon className="w-7 h-7 text-[#B08D55]" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1D2D44] mb-2">{pillar.title}</h3>
              <p className="text-sm text-[#1D2D44]/70 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
