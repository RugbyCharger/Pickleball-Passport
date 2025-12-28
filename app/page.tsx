import { HeroSection } from '@/components/marketing/hero-section';
import { PackageSection } from '@/components/marketing/package-grid';
import { TestimonialSection } from '@/components/marketing/testimonial-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <PackageSection />
      <TestimonialSection />

      {/* Future sections will be added here:
        - How it works
        - FAQ preview
      */}
    </>
  );
}
