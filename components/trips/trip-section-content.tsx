'use client';

import { type TripSection } from './trip-sidebar-nav';
import { TripDetailsSection } from './trip-details-section';
import { ItinerarySection } from './itinerary-section';
import { AccommodationsSection } from './accommodations-section';
import { PickleballSection } from './pickleball-section';
import { DiningSection } from './dining-section';
import { TripFAQ } from './trip-faq';
import { CancellationSection } from './cancellation-section';
import { TravelInsuranceSection } from './travel-insurance-section';

interface TripSectionContentProps {
  activeSection: TripSection;
}

export function TripSectionContent({ activeSection }: TripSectionContentProps) {
  switch (activeSection) {
    case 'details':
      return <TripDetailsSection />;
    case 'itinerary':
      return <ItinerarySection />;
    case 'accommodations':
      return <AccommodationsSection />;
    case 'pickleball':
      return <PickleballSection />;
    case 'dining':
      return <DiningSection />;
    case 'faq':
      return <TripFAQ />;
    case 'cancellation':
      return <CancellationSection />;
    case 'insurance':
      return <TravelInsuranceSection />;
    default:
      return <TripDetailsSection />;
  }
}
