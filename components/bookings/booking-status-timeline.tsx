'use client';

/**
 * Booking Status Timeline Component
 * E6-S3: Booking Status Timeline (5 pts)
 *
 * Visual timeline showing booking progress through stages:
 * 1. Booking Created (DRAFT/PENDING_PAYMENT)
 * 2. Payment Received (CONFIRMED)
 * 3. Documents Submitted
 * 4. Trip Confirmed
 * 5. Completed
 */

import { Check, Clock, FileText, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { BookingStatus } from '@prisma/client';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: any;
  status: 'completed' | 'current' | 'upcoming';
  date?: Date;
}

interface BookingStatusTimelineProps {
  bookingStatus: BookingStatus;
  createdAt: Date;
  paymentDate?: Date;
  documentsSubmittedDate?: Date;
  tripConfirmedDate?: Date;
  completedDate?: Date;
  hasRequiredDocuments?: boolean;
  tripAssigned?: boolean;
}

export function BookingStatusTimeline({
  bookingStatus,
  createdAt,
  paymentDate,
  documentsSubmittedDate,
  tripConfirmedDate,
  completedDate,
  hasRequiredDocuments = false,
  tripAssigned = false,
}: BookingStatusTimelineProps) {
  // Determine timeline steps based on booking status
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [];

    // Step 1: Booking Created
    steps.push({
      id: 'created',
      label: 'Booking Created',
      description: 'Your booking request has been submitted',
      icon: FileText,
      status: 'completed',
      date: createdAt,
    });

    // Step 2: Payment Received
    const isPaid = bookingStatus === 'CONFIRMED' || bookingStatus === 'COMPLETED';
    steps.push({
      id: 'payment',
      label: 'Payment Received',
      description: isPaid
        ? 'Payment successfully processed'
        : 'Awaiting payment confirmation',
      icon: CreditCard,
      status: isPaid ? 'completed' : bookingStatus === 'PENDING_PAYMENT' ? 'current' : 'upcoming',
      date: paymentDate,
    });

    // Step 3: Documents Submitted
    const docsSubmitted = hasRequiredDocuments || documentsSubmittedDate !== undefined;
    steps.push({
      id: 'documents',
      label: 'Documents Submitted',
      description: docsSubmitted
        ? 'Required travel documents uploaded'
        : 'Please upload required documents',
      icon: FileText,
      status: docsSubmitted
        ? 'completed'
        : isPaid
        ? 'current'
        : 'upcoming',
      date: documentsSubmittedDate,
    });

    // Step 4: Trip Confirmed
    const tripConfirmed = tripAssigned || tripConfirmedDate !== undefined;
    steps.push({
      id: 'trip',
      label: 'Trip Confirmed',
      description: tripConfirmed
        ? 'Your trip dates have been confirmed'
        : 'Awaiting trip date selection',
      icon: Calendar,
      status: tripConfirmed
        ? 'completed'
        : docsSubmitted
        ? 'current'
        : 'upcoming',
      date: tripConfirmedDate,
    });

    // Step 5: Completed
    const isCompleted = bookingStatus === 'COMPLETED';
    steps.push({
      id: 'completed',
      label: 'Trip Completed',
      description: isCompleted
        ? 'Your Pickleball Passport journey is complete!'
        : 'Enjoy your transformational experience',
      icon: CheckCircle,
      status: isCompleted ? 'completed' : tripConfirmed ? 'current' : 'upcoming',
      date: completedDate,
    });

    return steps;
  };

  const steps = getTimelineSteps();

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border-green-600';
      case 'current':
        return 'bg-blue-600 text-white border-blue-600 animate-pulse';
      case 'upcoming':
        return 'bg-gray-200 text-gray-400 border-gray-300';
    }
  };

  const getLineColor = (index: number) => {
    const currentStep = steps[index];
    const nextStep = steps[index + 1];

    if (!nextStep) return '';

    if (currentStep.status === 'completed' && nextStep.status === 'completed') {
      return 'bg-green-600';
    } else if (currentStep.status === 'completed') {
      return 'bg-gradient-to-b from-green-600 to-gray-300';
    }
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Booking Progress</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-600">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative pb-8">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 -ml-px">
                  <div className={`h-full w-full ${getLineColor(index)}`}></div>
                </div>
              )}

              {/* Step Content */}
              <div className="relative flex items-start gap-4">
                {/* Icon Circle */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStatusColor(
                    step.status
                  )}`}
                >
                  {step.status === 'completed' ? (
                    <Check className="h-6 w-6" />
                  ) : step.status === 'current' ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${
                          step.status === 'upcoming'
                            ? 'text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          step.status === 'upcoming'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Action Hints */}
                      {step.status === 'current' && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          <span>Action Required</span>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    {step.date && (
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(step.date)}
                      </div>
                    )}
                  </div>

                  {/* Helpful Links for Current Step */}
                  {step.status === 'current' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {step.id === 'payment' && (
                        <a
                          href="#payment"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Complete Payment →
                        </a>
                      )}
                      {step.id === 'documents' && (
                        <a
                          href="/dashboard/documents"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Upload Documents →
                        </a>
                      )}
                      {step.id === 'trip' && (
                        <a
                          href="#select-trip"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Select Trip Dates →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(
              (steps.filter((s) => s.status === 'completed').length /
                steps.length) *
                100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${
                (steps.filter((s) => s.status === 'completed').length /
                  steps.length) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
