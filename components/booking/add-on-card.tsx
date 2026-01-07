/**
 * Add-On Card Component
 *
 * Reusable card for displaying add-ons in the booking configurator.
 * Used in E3-S4 (Medical Add-Ons) and E3-S5 (Wellness Add-Ons).
 *
 * Features:
 * - Checkbox selection
 * - Thailand vs US price comparison
 * - Savings calculator
 * - Category badge
 * - Responsive design
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { AddOnCategory } from '@prisma/client'

// Type for add-on data from tRPC
export interface AddOnData {
  id: string
  name: string
  description: string | null
  category: AddOnCategory
  thPrice: number // in cents
  usPrice: number // in cents
  imageUrl: string | null
}

interface AddOnCardProps {
  addOn: AddOnData
  isSelected: boolean
  onToggle: (addOn: AddOnData) => void
  wasOriginallySelected?: boolean // For modification mode visual indicator
}

// Category display configuration
const CATEGORY_CONFIG: Record<
  AddOnCategory,
  { label: string; color: string; bgColor: string }
> = {
  DENTAL: {
    label: 'Dental',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  FACIAL_COSMETIC: {
    label: 'Facial',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  BODY: {
    label: 'Body',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
  HEALTH_SCREENING: {
    label: 'Health',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  SPA: {
    label: 'Spa',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100',
  },
  YOGA_MEDITATION: {
    label: 'Yoga',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  CULTURAL: {
    label: 'Cultural',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  PICKLEBALL: {
    label: 'Pickleball',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
}

// Format currency (USD)
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

// Calculate savings percentage
function calculateSavingsPercentage(thPrice: number, usPrice: number): number {
  if (usPrice === 0) return 0
  return Math.round(((usPrice - thPrice) / usPrice) * 100)
}

export default function AddOnCard({
  addOn,
  isSelected,
  onToggle,
  wasOriginallySelected = false,
}: AddOnCardProps) {
  const categoryConfig = CATEGORY_CONFIG[addOn.category]
  const savings = addOn.usPrice - addOn.thPrice
  const savingsPercentage = calculateSavingsPercentage(
    addOn.thPrice,
    addOn.usPrice
  )

  return (
    <div
      onClick={() => onToggle(addOn)}
      className={`
        group relative cursor-pointer rounded-lg border-2 bg-white p-6 shadow-sm transition-all
        hover:shadow-md
        ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-emerald-300'
        }
      `}
    >
      {/* Selection Checkbox */}
      <div className="absolute right-4 top-4">
        <Checkbox.Root
          checked={isSelected}
          onCheckedChange={() => onToggle(addOn)}
          className={`
            flex h-6 w-6 items-center justify-center rounded border-2 transition-colors
            ${
              isSelected
                ? 'border-emerald-600 bg-emerald-600'
                : 'border-slate-300 bg-white group-hover:border-emerald-400'
            }
          `}
        >
          <Checkbox.Indicator>
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>

      {/* Image (if available) */}
      {addOn.imageUrl && (
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-slate-100">
          <Image
            src={addOn.imageUrl}
            alt={addOn.name}
            width={400}
            height={225}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Category Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}
        >
          {categoryConfig.label}
        </span>
        {wasOriginallySelected && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            Currently Selected
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        {addOn.name}
      </h3>

      {/* Description */}
      {addOn.description && (
        <p className="mb-4 text-sm text-slate-600 line-clamp-2">
          {addOn.description}
        </p>
      )}

      {/* Pricing */}
      <div className="space-y-2">
        {/* Thailand Price */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-700">
            Thailand Price:
          </span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(addOn.thPrice)}
          </span>
        </div>

        {/* US Price Comparison */}
        {addOn.usPrice > 0 && savings > 0 && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">US Price:</span>
              <span className="text-sm text-slate-500 line-through">
                {formatCurrency(addOn.usPrice)}
              </span>
            </div>

            {/* Savings Highlight */}
            <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-700">
                  Save {formatCurrency(savings)}
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  {savingsPercentage}% off
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="mt-4 border-t border-emerald-200 pt-3">
          <p className="text-center text-sm font-medium text-emerald-700">
            ✓ Added to your package
          </p>
        </div>
      )}
    </div>
  )
}
