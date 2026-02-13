'use client';

import {
  Info,
  Calendar,
  Building2,
  Trophy,
  Utensils,
  HelpCircle,
  XCircle,
  Shield,
} from 'lucide-react';

export type TripSection =
  | 'details'
  | 'itinerary'
  | 'accommodations'
  | 'pickleball'
  | 'dining'
  | 'faq'
  | 'cancellation'
  | 'insurance';

interface NavItem {
  id: TripSection;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'details', label: 'Trip Details', icon: Info },
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'accommodations', label: 'Accommodations', icon: Building2 },
  { id: 'pickleball', label: 'Pickleball', icon: Trophy },
  { id: 'dining', label: 'Dining', icon: Utensils },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'cancellation', label: 'Cancellation', icon: XCircle },
  { id: 'insurance', label: 'Travel Insurance', icon: Shield },
];

interface TripSidebarNavProps {
  activeSection: TripSection;
  onSectionChange: (section: TripSection) => void;
}

export function TripSidebarNav({
  activeSection,
  onSectionChange,
}: TripSidebarNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-1.5 sticky top-24" aria-label="Trip sections">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#1D2D44] text-white shadow-lg shadow-[#1D2D44]/20'
                  : 'text-[#1D2D44]/70 hover:bg-[#F5E6D3]/50 hover:text-[#1D2D44]'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#B08D55]' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile: horizontal scrollable tabs */}
      <nav
        className="lg:hidden flex gap-2 overflow-x-auto pb-3 px-1 -mx-1 scrollbar-hide"
        aria-label="Trip sections"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-[#1D2D44] text-white shadow-md'
                  : 'bg-white text-[#1D2D44]/70 border border-[#B08D55]/20 hover:border-[#B08D55]/40'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B08D55]' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
