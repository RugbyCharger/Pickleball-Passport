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
import { TrendingDown, MapPin, Plane, Palmtree, Waves, Sun, Sparkles, ArrowRight } from 'lucide-react'
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
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-[#F5E6D3]/30 border-[#D4AF37]/20 shadow-xl shadow-[#003D5C]/10 rounded-3xl overflow-hidden">
      <CardHeader className="relative bg-gradient-to-br from-[#003D5C] via-[#005580] to-[#4AA4B5] text-white pb-8">
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <Palmtree className="w-20 h-20" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Waves className="w-16 h-16" />
        </div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium mb-4">
            <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
            Medical Tourism Savings
          </div>
          <CardTitle className="text-3xl font-serif text-white">
            Cost Calculator
          </CardTitle>
          <p className="text-white/80 mt-2 leading-relaxed">
            Discover how much you could save by combining world-class medical care with your Thailand vacation
          </p>
        </div>

        {/* Bottom wave */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 400 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30L20 26.7C40 23.3 80 16.7 120 13.3C160 10 200 10 240 11.7C280 13.3 320 16.7 360 18.3C400 20 400 20 400 20V30H360C320 30 280 30 240 30C200 30 160 30 120 30C80 30 40 30 20 30H0Z" fill="white"/>
          </svg>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Procedure Selector */}
        <div className="space-y-2">
          <Label htmlFor="procedure" className="text-sm font-medium text-[#003D5C]">
            Select Procedure Type
          </Label>
          <Select value={procedureId} onValueChange={handleProcedureChange}>
            <SelectTrigger id="procedure" className="w-full h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20">
              <SelectValue placeholder="Choose a procedure" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#D4AF37]/20">
              {medicalProcedures.map((proc) => (
                <SelectItem key={proc.id} value={proc.id} className="rounded-lg">
                  {proc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {procedure && (
            <p className="text-sm text-[#003D5C]/60">{procedure.description}</p>
          )}
        </div>

        {/* Conditional Quantity Input */}
        {procedure?.hasQuantity && (
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-[#003D5C]">
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
              className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
            />
          </div>
        )}

        {/* Cost Comparison Section */}
        <div className="pt-4">
          <h3 className="text-xl font-serif font-semibold text-[#003D5C] mb-4">
            Cost Comparison
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* US Cost */}
            <div className="bg-gradient-to-br from-[#F5E6D3]/50 to-white p-5 rounded-2xl border border-[#D4AF37]/10 shadow-lg shadow-[#003D5C]/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#003D5C]/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-[#003D5C]" />
                </div>
                <span className="text-sm font-medium text-[#003D5C]/70">
                  United States
                </span>
              </div>
              <p className="text-3xl font-bold text-[#003D5C]">
                {formatCurrency(usCost)}
              </p>
            </div>

            {/* Thailand Cost */}
            <div className="bg-gradient-to-br from-[#003D5C] to-[#005580] p-5 rounded-2xl shadow-lg shadow-[#003D5C]/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Plane className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <span className="text-sm font-medium text-white/80">
                  Thailand
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(thailandCost)}
              </p>
            </div>
          </div>

          {/* Savings Highlight */}
          <div
            className="bg-gradient-to-br from-[#2D5A3D] to-[#3D7A52] rounded-2xl p-6 shadow-lg shadow-[#2D5A3D]/20"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <span className="text-sm font-medium text-white/80">
                Your Savings
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">
              {formatCurrency(savings)}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37] text-[#003D5C] text-sm font-bold mb-3">
              <Sparkles className="w-4 h-4" />
              Save {savingsPercentage}%
            </div>
            <p className="text-sm text-white/80">
              {procedure?.name} costs {formatCurrency(thailandCost)} in Thailand.
              Net savings: <strong className="text-[#D4AF37]">{formatCurrency(savings)}</strong>!
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="pt-4">
          <h3 className="text-lg font-serif font-semibold text-[#003D5C] mb-4">
            Visual Comparison
          </h3>
          <div className="bg-gradient-to-br from-[#FDF8F3] to-white rounded-2xl border border-[#D4AF37]/10 p-4 shadow-lg shadow-[#003D5C]/5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.2} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#003D5C', fontSize: 14 }}
                  axisLine={{ stroke: '#D4AF37', opacity: 0.3 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  tick={{ fill: '#003D5C', fontSize: 14 }}
                  axisLine={{ stroke: '#D4AF37', opacity: 0.3 }}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? `$${value.toLocaleString()}` : '$0'
                  }
                  contentStyle={{
                    backgroundColor: '#FDF8F3',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 61, 92, 0.1)'
                  }}
                  labelStyle={{ color: '#003D5C', fontWeight: 600 }}
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
            className="w-full sm:w-auto px-10 py-7 text-lg rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C969] hover:from-[#C19A2E] hover:to-[#D4AF37] text-[#003D5C] font-bold shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Apply to Learn More
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
