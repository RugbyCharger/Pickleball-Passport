import { TestimonialGallery } from '@/components/testimonials/testimonial-gallery';

export function TestimonialSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Stories, Real Transformations
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from guests who combined pickleball paradise with life-changing medical tourism experiences in Thailand.
          </p>
        </div>

        <TestimonialGallery limit={6} showFilters={true} />

        <div className="text-center mt-12">
          <a
            href="/apply"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
}
