/**
 * Wellness Add-Ons Selector Component
 *
 * Step 5 of booking configurator - allows guests to select wellness/cultural experiences.
 * Features category filtering, multi-select, and real-time pricing.
 *
 * Used in: /booking/configure/wellness (E3-S5)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useBookingStore } from '@/lib/stores/booking-store'
import AddOnCard, { type AddOnData } from './add-on-card'
import { AddOnCategory } from '@prisma/client'
import { AlertCircle, Loader2 } from 'lucide-react'

// Wellness add-on categories
const WELLNESS_CATEGORIES = [
  {
    key: AddOnCategory.SPA,
    label: 'Spa & Wellness',
    icon: '🧖',
    color: 'rose',
  },
  {
    key: AddOnCategory.YOGA_MEDITATION,
    label: 'Yoga & Meditation',
    icon: '🧘',
    color: 'indigo',
  },
  {
    key: AddOnCategory.CULTURAL,
    label: 'Cultural Experiences',
    icon: '🏛️',
    color: 'amber',
  },
  {
    key: AddOnCategory.PICKLEBALL,
    label: 'Pickleball Training',
    icon: '🏓',
    color: 'green',
  },
] as const

type CategoryColor = 'rose' | 'indigo' | 'amber' | 'green'

const CATEGORY_STYLES: Record<
  CategoryColor,
  { active: string; inactive: string }
> = {
  rose: {
    active: 'bg-rose-600 text-white border-rose-600',
    inactive:
      'bg-white text-rose-700 border-rose-200 hover:border-rose-400 hover:bg-rose-50',
  },
  indigo: {
    active: 'bg-indigo-600 text-white border-indigo-600',
    inactive:
      'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
  },
  amber: {
    active: 'bg-amber-600 text-white border-amber-600',
    inactive:
      'bg-white text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50',
  },
  green: {
    active: 'bg-green-600 text-white border-green-600',
    inactive:
      'bg-white text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50',
  },
}

export default function WellnessAddOnsSelector() {
  const router = useRouter()

  // Category filter state (all selected by default)
  const [selectedCategories, setSelectedCategories] = useState<AddOnCategory[]>(
    WELLNESS_CATEGORIES.map((c) => c.key)
  )

  // Zustand booking store
  const { selectedAddOns, addAddOn, removeAddOn } = useBookingStore()

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

  // Skip wellness add-ons handler
  const handleSkip = () => {
    // Clear only wellness add-ons (keep medical add-ons)
    const wellnessCategories = WELLNESS_CATEGORIES.map((c) => c.key as string)
    const wellnessAddOnIds = selectedAddOns
      .filter((a) => wellnessCategories.includes(a.category))
      .map((a) => a.id)

    wellnessAddOnIds.forEach((id) => removeAddOn(id))

    // Navigate to trip selection page
    router.push('/booking/configure/trip')
  }

  // Navigation handlers
  const handleBack = () => {
    router.push('/booking/configure/add-ons')
  }

  const handleNext = () => {
    // Navigate to trip selection page
    router.push('/booking/configure/trip')
  }

  // Get add-ons count per category
  const getCategoryCount = (category: AddOnCategory) => {
    if (!addOns) return 0
    return addOns.filter((a: AddOnData) => a.category === category).length
  }

  // Get count of selected wellness add-ons
  const getSelectedWellnessCount = () => {
    const wellnessCategories = WELLNESS_CATEGORIES.map((c) => c.key as string)
    return selectedAddOns.filter((a) =>
      wellnessCategories.includes(a.category)
    ).length
  }

  // Clear only wellness add-ons
  const clearWellnessAddOns = () => {
    const wellnessCategories = WELLNESS_CATEGORIES.map((c) => c.key as string)
    const wellnessAddOnIds = selectedAddOns
      .filter((a) => wellnessCategories.includes(a.category))
      .map((a) => a.id)

    wellnessAddOnIds.forEach((id) => removeAddOn(id))
  }

  return (
    <div className="space-y-8">
      {/* Skip Wellness Add-Ons Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          <span>Skip Wellness Add-Ons</span>
          <span className="text-xs text-slate-500">(Optional)</span>
        </button>
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Filter by Category
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WELLNESS_CATEGORIES.map((category) => {
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
            Available Wellness Experiences
          </h3>
          {getSelectedWellnessCount() > 0 && (
            <button
              onClick={clearWellnessAddOns}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Clear all ({getSelectedWellnessCount()})
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
        {!isLoading && addOns && selectedCategories.length === 0 && (
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
                Wellness add-ons coming soon!
              </h3>
              <p className="text-slate-600">
                Wellness and cultural experiences for the selected categories
                will appear here once they're added to the system.
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
          🧘 Certified instructors • Authentic cultural experiences • Local
          partnerships
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          ← Back to Medical Add-Ons
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
        >
          Next: Choose Departure Date →
        </button>
      </div>
    </div>
  )
}
