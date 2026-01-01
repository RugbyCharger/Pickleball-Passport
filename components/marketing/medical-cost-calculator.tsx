'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { TrendingDown, MapPin, Plane } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  medicalProcedures,
  getProcedureById,
  formatCurrency,
  type MedicalProcedure
} from '@/lib/data/medical-procedure-pricing'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function MedicalCostCalculator() {
  const router = useRouter()
  const [procedureId, setProcedureId] = useState<string>(medicalProcedures[0].id)
  const [quantity, setQuantity] = useState<number>(
    medicalProcedures[0].defaultQuantity || 1
  )

  // Get selected procedure
  const procedure = getProcedureById(procedureId)

  // Debounced quantity update
  const debouncedSetQuantity = useDebouncedCallback((value: number) => {
    setQuantity(value)
  }, 300)

  // Handle procedure change
  const handleProcedureChange = (newProcedureId: string) => {
    setProcedureId(newProcedureId)
    const newProcedure = getProcedureById(newProcedureId)
    if (newProcedure) {
      setQuantity(newProcedure.defaultQuantity || 1)
    }
  }

  // Handle quantity input change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    const maxQty = procedure?.maxQuantity || 100

    // Clamp value between 1 and max
    const clampedValue = Math.max(1, Math.min(value, maxQty))
    debouncedSetQuantity(clampedValue)
  }

  // Calculate costs
  const { usCost, thailandCost, savings, savingsPercentage, chartData } = useMemo(() => {
    if (!procedure) {
      return {
        usCost: 0,
        thailandCost: 0,
        savings: 0,
        savingsPercentage: 0,
        chartData: []
      }
    }

    const qty = procedure.hasQuantity ? quantity : 1
    const us = procedure.usPrice * qty
    const thailand = procedure.thailandPrice * qty
    const save = us - thailand
    const savePercent = us > 0 ? Math.round((save / us) * 100) : 0

    const data = [
      {
        country: 'United States',
        cost: us / 100, // Convert to dollars for chart
        displayCost: formatCurrency(us)
      },
      {
        country: 'Thailand',
        cost: thailand / 100,
        displayCost: formatCurrency(thailand)
      }
    ]

    return {
      usCost: us,
      thailandCost: thailand,
      savings: save,
      savingsPercentage: savePercent,
      chartData: data
    }
  }, [procedure, quantity])

  // Handle CTA click
  const handleCTAClick = () => {
    // Track analytics event if GA is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'cta_click', {
        event_category: 'Medical Calculator',
        event_label: procedure?.name,
        value: savings / 100 // in dollars
      })
    }
    router.push('/apply')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif text-gray-900">
          Medical Tourism Cost Calculator
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Discover how much you could save by combining world-class medical care with your Thailand vacation
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Procedure Selector */}
        <div className="space-y-2">
          <Label htmlFor="procedure" className="text-sm font-medium text-gray-700">
            Select Procedure Type
          </Label>
          <Select value={procedureId} onValueChange={handleProcedureChange}>
            <SelectTrigger id="procedure" className="w-full">
              <SelectValue placeholder="Choose a procedure" />
            </SelectTrigger>
            <SelectContent>
              {medicalProcedures.map((proc) => (
                <SelectItem key={proc.id} value={proc.id}>
                  {proc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {procedure && (
            <p className="text-sm text-gray-600">{procedure.description}</p>
          )}
        </div>

        {/* Conditional Quantity Input */}
        {procedure?.hasQuantity && (
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Number of {procedure.unit}s
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={procedure.maxQuantity}
              step="1"
              defaultValue={quantity}
              onChange={handleQuantityChange}
              className="h-12"
            />
          </div>
        )}

        {/* Cost Comparison Section */}
        <div className="pt-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Comparison
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* US Cost */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  United States Price
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-700">
                {formatCurrency(usCost)}
              </p>
            </div>

            {/* Thailand Cost */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-5 w-5 text-[#003D5C]" />
                <span className="text-sm font-medium text-[#003D5C]">
                  Thailand Price
                </span>
              </div>
              <p className="text-3xl font-bold text-[#003D5C]">
                {formatCurrency(thailandCost)}
              </p>
            </div>
          </div>

          {/* Savings Highlight */}
          <div
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-6"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-6 w-6 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Your Savings
              </span>
            </div>
            <p className="text-4xl font-bold text-emerald-600 mb-2">
              {formatCurrency(savings)}
            </p>
            <p className="text-lg text-emerald-700 mb-3">
              Save {savingsPercentage}% compared to US prices
            </p>
            <p className="text-sm text-gray-700">
              {procedure?.name} costs {formatCurrency(thailandCost)} in Thailand.
              Net savings: <strong>{formatCurrency(savings)}</strong>!
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Visual Comparison
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#4b5563', fontSize: 14 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  tick={{ fill: '#4b5563', fontSize: 14 }}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? `$${value.toLocaleString()}` : '$0'
                  }
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Bar
                  dataKey="cost"
                  fill="#003D5C"
                  radius={[8, 8, 0, 0]}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4 flex justify-center">
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg bg-[#003D5C] hover:bg-[#D4AF37] hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Apply to Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
