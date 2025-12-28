import { HeroSection } from '@/components/marketing/hero-section';
import { PackageSection } from '@/components/marketing/package-grid';

export default function Home() {
  return (
    <>
      <HeroSection />
      <PackageSection />

      {/* Future sections will be added here:
        - Testimonials preview
        - How it works
        - FAQ preview
      */}
    </>
  );
}
