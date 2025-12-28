'use client';

import { useState } from 'react';
import { Itinerary } from '@prisma/client';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ItineraryAccordionProps {
  itineraries: Itinerary[];
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

/**
 * ItineraryAccordion Component
 * Displays collapsible day-by-day itinerary schedules
 */
export function ItineraryAccordion({ itineraries }: ItineraryAccordionProps) {
  const [selectedDuration, setSelectedDuration] = useState(
    itineraries[0]?.duration || 7
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Find the itinerary for the selected duration
  const currentItinerary = itineraries.find(
    (itin) => itin.duration === selectedDuration
  );

  // Parse the JSON content
  const days: ItineraryDay[] = currentItinerary
    ? JSON.parse(currentItinerary.content)
    : [];

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  return (
    <div>
      {/* Duration Selector */}
      {itineraries.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {itineraries.map((itin) => (
            <button
              key={itin.id}
              onClick={() => setSelectedDuration(itin.duration)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                selectedDuration === itin.duration
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200'
              }`}
            >
              {itin.duration}-Day Itinerary
            </button>
          ))}
        </div>
      )}

      {/* Accordion */}
      <div className="space-y-3">
        {days.map((day) => (
          <div
            key={day.day}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(day.day)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {day.day}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{day.title}</h3>
                  <p className="text-sm text-gray-500">
                    {day.activities.length} activities
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedDay === day.day ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Day Content */}
            <AnimatePresence>
              {expandedDay === day.day && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <ul className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-700"
                        >
                          <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                            {index + 1}
                          </span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This is a sample itinerary. Your actual schedule
          may vary based on weather, group preferences, and medical appointments.
          We'll work with you to create the perfect experience.
        </p>
      </div>
    </div>
  );
}
