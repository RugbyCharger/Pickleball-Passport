'use client';

import { useState, Suspense } from 'react';
import { TripSidebarNav, type TripSection } from './trip-sidebar-nav';
import { BookingModule } from './booking-module';
import { BookingModuleMobile } from './booking-module-mobile';

interface TripDetailLayoutProps {
  tripName?: string;
  cities?: string;
  dates?: string;
  price?: number;
  depositAmount?: number;
  depositLink?: string;
  fullLink?: string;
  spotsLeft?: number;
  totalSpots?: number;
  hidePaymentPlan?: boolean;
  ContentComponent?: React.ComponentType<{ activeSection: TripSection }>;
}

export function TripDetailLayout({
  tripName,
  cities,
  dates,
  price,
  depositAmount,
  depositLink,
  fullLink,
  spotsLeft,
  totalSpots,
  hidePaymentPlan,
  ContentComponent,
}: TripDetailLayoutProps) {
  if (!ContentComponent) {
    throw new Error('TripDetailLayout requires a ContentComponent prop');
  }
  const Content = ContentComponent;
  const [activeSection, setActiveSection] = useState<TripSection>('details');

  const handleSectionChange = (section: TripSection) => {
    setActiveSection(section);
    // On mobile, scroll to top of content area when switching sections
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 280, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile tabs (shown above content on small screens) */}
        <div className="lg:hidden mb-6 sticky top-[73px] z-30 bg-[#FDF8F3] pt-3 -mx-4 px-4">
          <TripSidebarNav
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Desktop three-column layout */}
        <div className="grid lg:grid-cols-[220px_1fr_340px] gap-8 lg:gap-10">
          {/* Left column: sidebar nav (desktop only) */}
          <div className="hidden lg:block">
            <TripSidebarNav
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Center column: active section content */}
          <div className="min-w-0">
            <Content activeSection={activeSection} />
          </div>

          {/* Right column: booking module (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Suspense>
                <BookingModule
                  tripName={tripName}
                  cities={cities}
                  dates={dates}
                  price={price}
                  depositAmount={depositAmount}
                  depositLink={depositLink}
                  fullLink={fullLink}
                  spotsLeft={spotsLeft}
                  totalSpots={totalSpots}
                  hidePaymentPlan={hidePaymentPlan}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile booking bar + expandable sheet (padding for bottom bar) */}
      <div className="h-16 lg:hidden" />
      <Suspense>
        <BookingModuleMobile
          tripName={tripName}
          price={price}
          depositAmount={depositAmount}
          depositLink={depositLink}
          fullLink={fullLink}
          spotsLeft={spotsLeft}
          hidePaymentPlan={hidePaymentPlan}
        />
      </Suspense>
    </>
  );
}
