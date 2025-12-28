/**
 * Medical Add-Ons Selector Component
 *
 * Step 4 of booking configurator - allows guests to select medical/cosmetic procedures.
 * Features category filtering, multi-select, and real-time pricing.
 *
 * Used in: /booking/configure/add-ons (E3-S4)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useBookingStore } from '@/lib/stores/booking-store'
import AddOnCard, { type AddOnData } from './add-on-card'
import { AddOnCategory } from '@prisma/client'
import { AlertCircle, Loader2 } from 'lucide-react'

// Medical add-on categories
const MEDICAL_CATEGORIES = [
  {
    key: AddOnCategory.DENTAL,
    label: 'Dental',
    icon: '🦷',
    color: 'blue',
  },
  {
    key: AddOnCategory.FACIAL_COSMETIC,
    label: 'Facial Cosmetic',
    icon: '✨',
    color: 'purple',
  },
  {
    key: AddOnCategory.BODY,
    label: 'Body',
    icon: '💪',
    color: 'pink',
  },
  {
    key: AddOnCategory.HEALTH_SCREENING,
    label: 'Health Screening',
    icon: '🏥',
    color: 'emerald',
  },
] as const

type CategoryColor = 'blue' | 'purple' | 'pink' | 'emerald'

const CATEGORY_STYLES: Record<
  CategoryColor,
  { active: string; inactive: string }
> = {
  blue: {
    active: 'bg-blue-600 text-white border-blue-600',
    inactive:
      'bg-white text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50',
  },
  purple: {
    active: 'bg-purple-600 text-white border-purple-600',
    inactive:
      'bg-white text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  },
  pink: {
    active: 'bg-pink-600 text-white border-pink-600',
    inactive:
      'bg-white text-pink-700 border-pink-200 hover:border-pink-400 hover:bg-pink-50',
  },
  emerald: {
    active: 'bg-emerald-600 text-white border-emerald-600',
    inactive:
      'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
  },
}

export default function MedicalAddOnsSelector() {
  const router = useRouter()

  // Category filter state (all selected by default)
  const [selectedCategories, setSelectedCategories] = useState<AddOnCategory[]>(
    MEDICAL_CATEGORIES.map((c) => c.key)
  )

  // Zustand booking store
  const { selectedAddOns, addAddOn, removeAddOn, clearAddOns } =
    useBookingStore()

  // Fetch add-ons from tRPC
  const { data: addOns, isLoading } = trpc.addOn.getByCategories.useQuery({
    categories:
      selectedCategories.length > 0 ? selectedCategories : undefined,
  })

  // Toggle category filter
  const toggleCategory = (category: AddOnCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  // Check if add-on is selected
  const isSelected = (addOnId: string) => {
    return selectedAddOns.some((a) => a.id === addOnId)
  }

  // Toggle add-on selection
  const toggleAddOn = (addOn: AddOnData) => {
    if (isSelected(addOn.id)) {
      removeAddOn(addOn.id)
    } else {
      addAddOn({
        id: addOn.id,
        name: addOn.name,
        description: addOn.description,
        category: addOn.category,
        thPrice: addOn.thPrice,
        usPrice: addOn.usPrice,
      })
    }
  }

  // Skip add-ons handler
  const handleSkip = () => {
    if (selectedAddOns.length > 0) {
      // Show confirmation if user has selections
      const confirmed = window.confirm(
        `Remove ${selectedAddOns.length} selected add-on(s)?`
      )
      if (!confirmed) return
    }

    clearAddOns()
    // Navigate to next step (wellness add-ons or review)
    // For now, go to review since E3-S5 isn't implemented yet
    router.push('/booking/review')
  }

  // Navigation handlers
  const handleBack = () => {
    router.push('/booking/configure/accommodation')
  }

  const handleNext = () => {
    // Navigate to wellness add-ons (E3-S5) or review if not yet implemented
    router.push('/booking/review')
  }

  // Get add-ons count per category
  const getCategoryCount = (category: AddOnCategory) => {
    if (!addOns) return 0
    return addOns.filter((a: AddOnData) => a.category === category).length
  }

  return (
    <div className="space-y-8">
      {/* Skip Add-Ons Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          <span>Skip Medical Add-Ons</span>
          <span className="text-xs text-slate-500">(Optional)</span>
        </button>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Filter by Category
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MEDICAL_CATEGORIES.map((category) => {
            const isActive = selectedCategories.includes(category.key)
            const count = getCategoryCount(category.key)
            const styles = CATEGORY_STYLES[category.color]

            return (
              <button
                key={category.key}
                onClick={() => toggleCategory(category.key)}
                disabled={count === 0}
                className={`
                  flex items-center justify-between rounded-lg border-2 px-4 py-3 font-medium transition-all
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${isActive ? styles.active : styles.inactive}
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.label}</span>
                </span>
                <span
                  className={`
                    flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                    ${isActive ? 'bg-white/20' : 'bg-slate-100'}
                  `}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add-Ons Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Available Medical Procedures
          </h3>
          {selectedAddOns.length > 0 && (
            <button
              onClick={clearAddOns}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Clear all ({selectedAddOns.length})
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Empty State - No Categories Selected */}
        {!isLoading &&
          addOns &&
          selectedCategories.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-slate-600">
                Select at least one category to view add-ons
              </p>
            </div>
          )}

        {/* Empty State - No Add-Ons Found */}
        {!isLoading &&
          addOns &&
          selectedCategories.length > 0 &&
          addOns.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                No add-ons available
              </h3>
              <p className="text-slate-600">
                Medical add-ons for the selected categories will appear here
                once they're added to the system.
              </p>
            </div>
          )}

        {/* Add-Ons Grid */}
        {!isLoading && addOns && addOns.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {addOns.map((addOn: AddOnData) => (
              <AddOnCard
                key={addOn.id}
                addOn={addOn}
                isSelected={isSelected(addOn.id)}
                onToggle={toggleAddOn}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust Indicator */}
      <div className="rounded-lg bg-emerald-50 p-6 text-center">
        <p className="text-sm font-medium text-emerald-900">
          🏥 All procedures performed at JCI-accredited hospitals by
          board-certified specialists
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          ← Back to Accommodation
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  )
}
