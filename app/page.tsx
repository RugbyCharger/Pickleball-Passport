import { HeroSection } from '@/components/marketing/hero-section';
import { PackageSection } from '@/components/marketing/package-grid';
import { TestimonialSection } from '@/components/marketing/testimonial-section';
import MedicalCostCalculator from '@/components/marketing/medical-cost-calculator';

export default function Home() {
  return (
    <>
      <HeroSection />
      <PackageSection />

      {/* Medical Tourism Cost Calculator */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <MedicalCostCalculator />
        </div>
      </section>

      <TestimonialSection />

      {/* Future sections will be added here:
        - How it works
        - FAQ preview
      */}
    </>
  );
}
