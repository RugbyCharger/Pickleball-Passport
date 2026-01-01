# Story 1.5: Medical Tourism Cost Calculator

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a potential guest considering medical procedures,
I want to calculate potential cost savings,
So that I understand the financial value of combining medical tourism with vacation.

## Acceptance Criteria

### AC-1: Interactive Calculator UI Component

- [ ] Create reusable calculator component in `components/marketing/medical-cost-calculator.tsx`
- [ ] Component can be embedded in homepage OR standalone page `/cost-calculator`
- [ ] Card-based layout using shadcn/ui Card component (see `components/ui/card.tsx`)
- [ ] Heading: "Medical Tourism Cost Calculator" with subtitle explaining purpose
- [ ] Clean, professional design matching marketing site aesthetic
- [ ] Ocean blue accent colors (#003D5C) for headers, gold (#D4AF37) for highlights
- [ ] Mobile-first responsive design (full-width on mobile, max-w-2xl on desktop)
- [ ] Component exported as default for easy import

### AC-2: Procedure Type Dropdown Selector

- [ ] Label: "Select Procedure Type"
- [ ] Dropdown UI using Radix UI Select (see `components/ui/select.tsx` if exists, or `components/ui/dropdown-menu.tsx` pattern)
- [ ] Procedure options (from JSON config - see AC-10):
  - Dental Veneers (per tooth)
  - Full Smile Makeover (8-10 veneers)
  - Cosmetic Dentistry Package
  - Facial Rejuvenation (Botox + Fillers)
  - Facelift
  - Rhinoplasty (Nose Job)
  - Breast Augmentation
  - Liposuction
  - Hair Transplant
  - LASIK Eye Surgery
  - Dental Implants (per tooth)
- [ ] Default selection: "Full Smile Makeover" (most compelling example)
- [ ] Dropdown accessible via keyboard (arrow keys, Enter to select)
- [ ] Mobile-friendly dropdown (large touch targets, minimum 48px height)
- [ ] Display selected procedure name in dropdown trigger

### AC-3: Quantity Input (Conditional)

- [ ] Label: "Number of [procedure units]" (e.g., "Number of veneers" or "Number of implants")
- [ ] Numeric input field using shadcn/ui Input component (see `components/ui/input.tsx`)
- [ ] Only visible for procedures with variable quantity (dental veneers, implants, etc.)
- [ ] Default value: Procedure-specific default (e.g., 8 veneers for smile makeover)
- [ ] Input validation: Min 1, max procedure-specific limit (e.g., max 32 teeth)
- [ ] Debounce input changes by 300ms to prevent calculation spam
- [ ] Input type="number" with proper mobile keyboard support
- [ ] Step size: 1 (whole numbers only)
- [ ] Large touch target on mobile (48px height minimum)

### AC-4: US Cost Estimate Display

- [ ] Section heading: "Cost Comparison"
- [ ] Display US cost with label: "United States Price"
- [ ] Currency format: `$XX,XXX` (e.g., "$20,000")
- [ ] Use `Intl.NumberFormat` for proper currency formatting (see `components/booking/pricing-summary.tsx:37`)
- [ ] Font size: Large and readable (text-2xl or text-3xl on desktop)
- [ ] Color: Neutral gray for US price (text-gray-700)
- [ ] Icon: US flag emoji or Lucide MapPin icon next to label
- [ ] Calculate from JSON config: `basePrice * quantity` (if applicable)

### AC-5: Thailand Cost Estimate Display

- [ ] Display Thailand cost with label: "Thailand Price"
- [ ] Currency format: `$XX,XXX` (same formatting as US cost)
- [ ] Font size: Same as US price for fair comparison
- [ ] Color: Ocean blue (#003D5C) to emphasize value
- [ ] Icon: Thailand flag emoji or Lucide Plane icon next to label
- [ ] Calculate from JSON config: Thailand pricing (percentage or fixed amount per procedure)
- [ ] Position: Side-by-side with US price on desktop, stacked on mobile

### AC-6: Net Savings Calculation & Highlight

- [ ] Calculate: `savings = usCost - thailandCost`
- [ ] Display with label: "Your Savings"
- [ ] Currency format: `$XX,XXX` (same formatting)
- [ ] Font size: Largest text on screen (text-4xl font-bold)
- [ ] Color: Emerald green (#10B981) to emphasize positive savings
- [ ] Background: Light green highlight box (`bg-emerald-50 border border-emerald-200`)
- [ ] Icon: Lucide TrendingDown or DollarSign icon
- [ ] Percentage savings also displayed: "Save XX% compared to US prices"
- [ ] Example text below: "Your $20K smile makeover costs $7K in Thailand. Net savings: $13K!"
- [ ] Dynamic text that updates based on selected procedure

### AC-7: Visual Cost Comparison Bar Chart

- [ ] Install Recharts library: `npm install recharts`
- [ ] Bar chart comparing US vs Thailand costs side-by-side
- [ ] Chart library: Recharts `<BarChart>` component
- [ ] X-axis: Two bars - "United States" and "Thailand"
- [ ] Y-axis: Dollar amounts with proper formatting ($0, $5K, $10K, etc.)
- [ ] Bar colors:
  - US bar: Gray (#6B7280)
  - Thailand bar: Ocean blue (#003D5C)
- [ ] Responsive chart sizing: Full width on mobile, max-w-xl on desktop
- [ ] Hover tooltip showing exact dollar amounts
- [ ] Chart height: 300px minimum for readability
- [ ] Grid lines for easier comparison
- [ ] Animated bar transitions when values change (300ms ease-in-out)

### AC-8: Call-to-Action Below Calculator

- [ ] CTA button: "Apply to Learn More"
- [ ] Button styling: Primary brand colors (ocean blue background, gold hover effect)
- [ ] Button size: Large (px-8 py-4 text-lg)
- [ ] Button position: Centered below chart with margin-top
- [ ] On click: Navigate to `/apply` page (or open application modal)
- [ ] Accessible button with proper ARIA label
- [ ] Hover effect: Scale slightly (hover:scale-105) and shadow increase
- [ ] Loading state: Disabled with spinner if application form loading
- [ ] Track conversion: Analytics event when clicked (Google Analytics or Mixpanel)

### AC-9: Mobile-Friendly Inputs & Layout

- [ ] All touch targets minimum 48px height (WCAG guideline)
- [ ] Dropdown trigger: Large text, plenty of padding
- [ ] Number input: Large font size (text-lg), easy to tap
- [ ] Buttons: Full-width on mobile (<640px), auto-width on desktop
- [ ] Spacing: Generous padding between sections (space-y-6)
- [ ] Text sizing: Responsive (text-base on mobile, text-lg on desktop)
- [ ] Chart: Full-width on mobile, centered with max-width on desktop
- [ ] Test on actual mobile devices (iOS Safari, Android Chrome)
- [ ] Prevent horizontal scroll on mobile viewports

### AC-10: Hardcoded Pricing Data (JSON Config)

- [ ] Create JSON config file: `lib/data/medical-procedure-pricing.ts`
- [ ] TypeScript interface for procedure data:
  ```typescript
  interface MedicalProcedure {
    id: string
    name: string
    description: string
    usPrice: number // Base price in USD cents
    thailandPrice: number // Base price in USD cents
    hasQuantity: boolean // True for per-tooth procedures
    defaultQuantity?: number
    maxQuantity?: number
    unit?: string // 'tooth', 'treatment', 'session'
  }
  ```
- [ ] Export procedures array: `export const medicalProcedures: MedicalProcedure[]`
- [ ] Include at least 11 procedures (from AC-2 list)
- [ ] Example pricing (research-based estimates):
  - Full Smile Makeover (8 veneers): US $20,000 → Thailand $7,000
  - Dental Veneers (per tooth): US $2,000 → Thailand $700
  - Facelift: US $15,000 → Thailand $5,500
  - Rhinoplasty: US $12,000 → Thailand $4,200
  - Breast Augmentation: US $10,000 → Thailand $3,800
  - LASIK: US $4,000 → Thailand $1,500
  - Hair Transplant: US $8,000 → Thailand $2,800
- [ ] Pricing in cents to match Stripe convention (multiply by 100)

### AC-11: Form State Management

- [ ] Use React Hook Form for form state (see `components/booking/guest-profile-form.tsx` pattern)
- [ ] Form schema with Zod validation:
  ```typescript
  const calculatorSchema = z.object({
    procedureId: z.string().min(1, 'Please select a procedure'),
    quantity: z.number().min(1).max(100).optional()
  })
  ```
- [ ] Default values: First procedure in list, default quantity from config
- [ ] Real-time calculation on form value changes (watch form state)
- [ ] Debounce quantity input changes (300ms) to prevent calculation spam
- [ ] Form does NOT submit - purely interactive calculator
- [ ] Handle errors gracefully (invalid quantity, missing procedure)

### AC-12: Accessibility Requirements

- [ ] Semantic HTML: `<form>`, `<label>`, `<select>`, `<input>`, `<button>`
- [ ] All form inputs have associated labels (visible or aria-label)
- [ ] Dropdown accessible via keyboard (Tab, Arrow keys, Enter)
- [ ] Number input supports keyboard increment/decrement (arrow keys)
- [ ] Focus indicators clearly visible (ring-2 ring-offset-2)
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Screen reader announces calculation results (aria-live region for savings)
- [ ] Chart has descriptive aria-label: "Cost comparison chart showing US vs Thailand prices"
- [ ] Button has clear text ("Apply to Learn More" not just "Apply")
- [ ] Skip link to calculator from navigation (if on homepage)

### AC-13: TypeScript & Code Quality

- [ ] Strict TypeScript mode enabled (no `any` types)
- [ ] All props typed with proper interfaces
- [ ] Zod schema for runtime validation
- [ ] Currency formatting helper function (reusable):
  ```typescript
  function formatCurrency(amountInCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amountInCents / 100)
  }
  ```
- [ ] Calculation logic in separate helper functions (testable)
- [ ] No console.log statements (use proper logging if needed)
- [ ] Component file size under 400 lines (split if larger)
- [ ] Proper exports: Default export for component, named exports for helpers

## Tasks / Subtasks

- [ ] Task 1: Install Recharts dependency (AC: 7)
  - [ ] Subtask 1.1: Run `npm install recharts`
  - [ ] Subtask 1.2: Verify Recharts types installed (`@types/recharts` auto-installed)
  - [ ] Subtask 1.3: Test import in component: `import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'`

- [ ] Task 2: Create medical procedure pricing data (AC: 10)
  - [ ] Subtask 2.1: Create file `lib/data/medical-procedure-pricing.ts`
  - [ ] Subtask 2.2: Define `MedicalProcedure` TypeScript interface
  - [ ] Subtask 2.3: Create array of 11+ procedures with research-based pricing
  - [ ] Subtask 2.4: Add procedure descriptions (used in calculator UI)
  - [ ] Subtask 2.5: Include quantity settings (hasQuantity, defaultQuantity, maxQuantity, unit)
  - [ ] Subtask 2.6: Export procedures array and interface
  - [ ] Subtask 2.7: Add helper function to get procedure by ID

- [ ] Task 3: Create calculator component (AC: 1, 2, 3, 4, 5, 6, 11, 13)
  - [ ] Subtask 3.1: Create `components/marketing/medical-cost-calculator.tsx`
  - [ ] Subtask 3.2: Import required shadcn/ui components (Card, Select/DropdownMenu, Input, Button)
  - [ ] Subtask 3.3: Import React Hook Form and Zod
  - [ ] Subtask 3.4: Define form schema with Zod validation
  - [ ] Subtask 3.5: Set up form with default values (first procedure, default quantity)
  - [ ] Subtask 3.6: Create procedure dropdown using Radix UI Select
  - [ ] Subtask 3.7: Create conditional quantity input (only show if hasQuantity = true)
  - [ ] Subtask 3.8: Implement debounced quantity input (300ms delay)
  - [ ] Subtask 3.9: Create currency formatting helper function
  - [ ] Subtask 3.10: Calculate US cost, Thailand cost, and savings (real-time)
  - [ ] Subtask 3.11: Display US cost with proper formatting and styling
  - [ ] Subtask 3.12: Display Thailand cost with ocean blue emphasis
  - [ ] Subtask 3.13: Display savings in highlighted green box with percentage

- [ ] Task 4: Add bar chart visualization (AC: 7)
  - [ ] Subtask 4.1: Import Recharts components (BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer)
  - [ ] Subtask 4.2: Prepare chart data array: `[{ country: 'United States', cost: usCost }, { country: 'Thailand', cost: thailandCost }]`
  - [ ] Subtask 4.3: Create ResponsiveContainer wrapper (width="100%", height={300})
  - [ ] Subtask 4.4: Configure BarChart with data and margins
  - [ ] Subtask 4.5: Add XAxis with dataKey="country"
  - [ ] Subtask 4.6: Add YAxis with currency formatter
  - [ ] Subtask 4.7: Add Tooltip with custom currency formatter
  - [ ] Subtask 4.8: Add Bar with dataKey="cost" and brand colors
  - [ ] Subtask 4.9: Add animation config (animationDuration={300})
  - [ ] Subtask 4.10: Test chart responsiveness on mobile and desktop

- [ ] Task 5: Add CTA button and analytics (AC: 8)
  - [ ] Subtask 5.1: Add "Apply to Learn More" button below chart
  - [ ] Subtask 5.2: Style button with brand colors (ocean blue, gold hover)
  - [ ] Subtask 5.3: Implement navigation to `/apply` page on click
  - [ ] Subtask 5.4: Add hover effects (scale, shadow)
  - [ ] Subtask 5.5: Add analytics tracking event (Google Analytics or Mixpanel)
  - [ ] Subtask 5.6: Make button full-width on mobile, auto-width on desktop

- [ ] Task 6: Mobile responsiveness & accessibility (AC: 9, 12)
  - [ ] Subtask 6.1: Test all touch targets (minimum 48px height)
  - [ ] Subtask 6.2: Test dropdown on mobile (large enough to tap)
  - [ ] Subtask 6.3: Test number input on mobile (proper keyboard, large font)
  - [ ] Subtask 6.4: Add responsive spacing (space-y-4 on mobile, space-y-6 on desktop)
  - [ ] Subtask 6.5: Test chart full-width on mobile, max-width on desktop
  - [ ] Subtask 6.6: Test button full-width on mobile
  - [ ] Subtask 6.7: Add semantic HTML (form, labels, proper heading hierarchy)
  - [ ] Subtask 6.8: Add ARIA attributes (aria-label, aria-live for savings)
  - [ ] Subtask 6.9: Test keyboard navigation (Tab, Arrow keys, Enter)
  - [ ] Subtask 6.10: Test focus indicators (visible ring on all interactive elements)
  - [ ] Subtask 6.11: Verify color contrast (WCAG AA compliance)
  - [ ] Subtask 6.12: Test with screen reader (VoiceOver on macOS or NVDA on Windows)

- [ ] Task 7: Integration & placement (AC: 1)
  - [ ] Subtask 7.1: Decide placement: Homepage section OR standalone `/cost-calculator` page
  - [ ] Subtask 7.2: If homepage: Add calculator section to `app/(marketing)/page.tsx`
  - [ ] Subtask 7.3: If standalone: Create `app/(marketing)/cost-calculator/page.tsx`
  - [ ] Subtask 7.4: Add section heading and description above calculator
  - [ ] Subtask 7.5: Add proper spacing and container max-width (max-w-4xl mx-auto)
  - [ ] Subtask 7.6: Test SEO (meta tags for standalone page, if applicable)

- [ ] Task 8: Testing & validation (AC: All)
  - [ ] Subtask 8.1: Test all 11+ procedures calculate correctly
  - [ ] Subtask 8.2: Test quantity input validation (min, max, decimals not allowed)
  - [ ] Subtask 8.3: Test procedures without quantity (quantity input hidden)
  - [ ] Subtask 8.4: Test currency formatting edge cases (0, very large numbers)
  - [ ] Subtask 8.5: Test chart updates smoothly when procedure/quantity changes
  - [ ] Subtask 8.6: Test debouncing works (rapid quantity changes)
  - [ ] Subtask 8.7: Test CTA button navigation
  - [ ] Subtask 8.8: Test mobile layout on real devices (iOS, Android)
  - [ ] Subtask 8.9: Test accessibility with keyboard only (no mouse)
  - [ ] Subtask 8.10: Run TypeScript validation: `npx tsc --noEmit` (must pass with 0 errors)
  - [ ] Subtask 8.11: Test production build: `npm run build` (must succeed)

## Dev Notes

### ⚠️ CRITICAL: Missing Dependency

**Recharts NOT installed** - You MUST run this first:
```bash
npm install recharts
```

Without this, the bar chart (AC-7) will fail to compile. Install before starting implementation.

### Architecture Requirements (MUST FOLLOW)

**Component Location:**
- Marketing components go in: `components/marketing/`
- Create file: `components/marketing/medical-cost-calculator.tsx`
- Data config file: `lib/data/medical-procedure-pricing.ts`

**Page Location (Choose One):**
1. **Homepage Section** (Recommended for conversion):
   - File: `app/(marketing)/page.tsx`
   - Add calculator as a section between hero and testimonials
   - Better for SEO and immediate engagement
2. **Standalone Page**:
   - File: `app/(marketing)/cost-calculator/page.tsx`
   - Good for focused landing pages or ads
   - Can be linked from homepage

**Tech Stack Requirements:**
- Next.js 14 App Router (SSG for marketing pages)
- TypeScript strict mode (no `any` types)
- Tailwind CSS v4 for styling
- React Hook Form + Zod for form state/validation
- Recharts for data visualization (install first!)
- shadcn/ui components (Card, Select, Input, Button)
- Radix UI primitives (via shadcn/ui)
- Lucide React for icons

### Reference Files & Patterns

**1. Currency Formatting Pattern** (EXACT PATTERN TO FOLLOW):
```typescript
// From: components/booking/pricing-summary.tsx:37
const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amountInCents / 100)
}
```
Use this EXACT formatting for all dollar amounts in the calculator.

**2. Form Handling Pattern** (React Hook Form + Zod):
Reference: `components/booking/guest-profile-form.tsx`
- Import: `import { useForm } from 'react-hook-form'`
- Import: `import { zodResolver } from '@hookform/resolvers/zod'`
- Define schema with Zod
- Use `watch()` to monitor form changes in real-time
- Use `setValue()` to update quantity programmatically

**3. Dropdown/Select Pattern**:
Reference: `components/ui/dropdown-menu.tsx` or create `components/ui/select.tsx` if needed
- Use Radix UI Select for accessible dropdown
- Large touch targets (min-h-12 on mobile)
- Keyboard navigation support (arrow keys, Enter)

**4. Card Layout Pattern**:
Reference: `components/booking/package-selector.tsx`, `components/booking/accommodation-selector.tsx`
- Use shadcn/ui Card component: `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'`
- Ocean blue accents for headers
- Clean white background
- Proper spacing with padding

**5. Mobile-Responsive Design Pattern**:
Reference: Throughout codebase (see `components/booking/pricing-summary.tsx`)
- Mobile-first approach: Default styles for mobile, then `sm:` and `lg:` breakpoints
- Example: `text-base sm:text-lg lg:text-xl` (progressive enhancement)
- Full-width on mobile, max-width on desktop: `w-full max-w-2xl mx-auto`
- Touch targets: `min-h-12` (48px) on all buttons and inputs

**6. Real-time Calculation Pattern**:
Reference: `components/booking/pricing-summary.tsx`
- Use React Hook Form `watch()` to monitor form changes
- Calculate values in component body (re-runs on every change)
- Debounce numeric inputs to prevent spam:
  ```typescript
  import { useDebouncedCallback } from 'use-debounce'

  const debouncedSetQuantity = useDebouncedCallback((value: number) => {
    setValue('quantity', value)
  }, 300)
  ```

**7. Icon Usage Pattern**:
Reference: Throughout codebase
- Import from Lucide React: `import { TrendingDown, DollarSign, MapPin, Plane } from 'lucide-react'`
- Consistent sizing: `className="h-5 w-5"` or `h-6 w-6` for larger icons
- Match text color: `text-emerald-600` for savings icon

### Design System Specifications

**Colors (from `_bmad-output/solutioning/architecture-Pickleball-Passport-2025-12-28.md`):**
- Primary (Ocean Blue): `#003D5C` → Tailwind: `bg-[#003D5C]` or custom color in config
- Accent (Gold): `#D4AF37` → Tailwind: `bg-[#D4AF37]`
- Success (Emerald): `#10B981` → Tailwind: `bg-emerald-500`
- Background: Slate-50 to White gradient
- Text: Gray-900 for headings, Gray-700 for body

**Typography:**
- Headings: Serif font (Playfair Display) → Tailwind: `font-serif`
- Body: Sans-serif (Inter) → Tailwind: `font-sans`
- Calculator heading: `text-3xl font-serif font-bold text-gray-900`
- Labels: `text-sm font-medium text-gray-700`
- Values: `text-2xl font-semibold`

**Spacing:**
- Section padding: `p-6 sm:p-8`
- Vertical spacing: `space-y-6` (24px between sections)
- Card padding: `p-6`
- Button padding: `px-6 py-3` or `px-8 py-4` for large buttons

**Border Radius:**
- Cards: `rounded-lg` (8px)
- Buttons: `rounded-lg`
- Inputs: `rounded-md` (6px)

### Recharts Implementation Guide

**Installation:**
```bash
npm install recharts
```

**Basic Bar Chart Example:**
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { country: 'United States', cost: 20000 },
  { country: 'Thailand', cost: 7000 }
]

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="country" />
    <YAxis
      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
    />
    <Tooltip
      formatter={(value: number) => `$${value.toLocaleString()}`}
      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
    />
    <Bar dataKey="cost" fill="#003D5C" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Chart Customization:**
- Bar colors: US = `#6B7280` (gray), Thailand = `#003D5C` (ocean blue)
- Rounded bar tops: `radius={[8, 8, 0, 0]}`
- Animation: Default 400ms, can customize with `animationDuration={300}`
- Responsive: Always wrap in `<ResponsiveContainer>` for mobile support

### Data Structure Example

**`lib/data/medical-procedure-pricing.ts`:**
```typescript
export interface MedicalProcedure {
  id: string
  name: string
  description: string
  usPrice: number // in cents
  thailandPrice: number // in cents
  hasQuantity: boolean
  defaultQuantity?: number
  maxQuantity?: number
  unit?: string
}

export const medicalProcedures: MedicalProcedure[] = [
  {
    id: 'smile-makeover',
    name: 'Full Smile Makeover (8-10 veneers)',
    description: 'Complete dental transformation with porcelain veneers',
    usPrice: 2000000, // $20,000 in cents
    thailandPrice: 700000, // $7,000 in cents
    hasQuantity: false
  },
  {
    id: 'dental-veneers',
    name: 'Dental Veneers (per tooth)',
    description: 'Porcelain veneers to improve tooth appearance',
    usPrice: 200000, // $2,000 per tooth
    thailandPrice: 70000, // $700 per tooth
    hasQuantity: true,
    defaultQuantity: 8,
    maxQuantity: 32,
    unit: 'tooth'
  },
  // ... more procedures
]

export function getProcedureById(id: string): MedicalProcedure | undefined {
  return medicalProcedures.find(p => p.id === id)
}
```

### Component Structure Recommendation

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// ... other imports

const calculatorSchema = z.object({
  procedureId: z.string().min(1),
  quantity: z.number().min(1).max(100).optional()
})

type CalculatorForm = z.infer<typeof calculatorSchema>

export default function MedicalCostCalculator() {
  const form = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      procedureId: medicalProcedures[0].id,
      quantity: medicalProcedures[0].defaultQuantity
    }
  })

  // Watch form values for real-time calculation
  const procedureId = form.watch('procedureId')
  const quantity = form.watch('quantity')

  // Get selected procedure
  const procedure = getProcedureById(procedureId)

  // Calculate costs
  const usCost = procedure ? procedure.usPrice * (quantity || 1) : 0
  const thailandCost = procedure ? procedure.thailandPrice * (quantity || 1) : 0
  const savings = usCost - thailandCost
  const savingsPercentage = usCost > 0 ? Math.round((savings / usCost) * 100) : 0

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">
          Medical Tourism Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form, calculations, chart, CTA */}
      </CardContent>
    </Card>
  )
}
```

### Testing Requirements

**Manual Testing Checklist:**
1. **Procedure Selection:**
   - [ ] Dropdown opens on click
   - [ ] All 11+ procedures listed
   - [ ] Keyboard navigation works (arrow keys, Enter)
   - [ ] Selected procedure displays in trigger
   - [ ] Calculation updates immediately on selection

2. **Quantity Input (Conditional Display):**
   - [ ] Input only shows for procedures with `hasQuantity: true`
   - [ ] Input hidden for procedures like "Full Smile Makeover"
   - [ ] Default quantity pre-filled
   - [ ] Input validates min/max limits
   - [ ] Debouncing works (rapid typing doesn't cause lag)
   - [ ] Calculation updates after 300ms delay

3. **Cost Calculations:**
   - [ ] US cost calculates correctly: `basePrice * quantity`
   - [ ] Thailand cost calculates correctly
   - [ ] Savings = US cost - Thailand cost
   - [ ] Percentage savings displays correctly
   - [ ] Currency formatting matches pattern ($XX,XXX)
   - [ ] All values update in real-time

4. **Bar Chart:**
   - [ ] Chart displays two bars (US, Thailand)
   - [ ] Bars correctly sized relative to costs
   - [ ] Y-axis shows dollar amounts ($0, $5K, $10K)
   - [ ] Tooltip shows exact amounts on hover
   - [ ] Chart animates smoothly when values change
   - [ ] Chart responsive on mobile (full-width)

5. **CTA Button:**
   - [ ] Button displays below chart
   - [ ] Button navigates to `/apply` page
   - [ ] Hover effects work (scale, shadow)
   - [ ] Full-width on mobile, auto-width on desktop

6. **Mobile Responsiveness:**
   - [ ] All touch targets minimum 48px height
   - [ ] Dropdown easy to tap on mobile
   - [ ] Number input shows numeric keyboard on mobile
   - [ ] Chart full-width and readable on mobile
   - [ ] Button full-width on mobile
   - [ ] No horizontal scrolling on any viewport size
   - [ ] Test on real iOS and Android devices

7. **Accessibility:**
   - [ ] All inputs have labels (visible or aria-label)
   - [ ] Keyboard navigation works (Tab, Arrow keys, Enter)
   - [ ] Focus indicators visible on all interactive elements
   - [ ] Screen reader announces savings (aria-live region)
   - [ ] Color contrast meets WCAG AA (use browser tools)
   - [ ] Chart has descriptive aria-label

8. **TypeScript & Build:**
   - [ ] Run `npx tsc --noEmit` → 0 errors
   - [ ] Run `npm run build` → Success
   - [ ] No `any` types in code
   - [ ] All imports resolve correctly

### Common Pitfalls to Avoid

1. **❌ DON'T trust client-side calculations for payment processing**
   - This is a MARKETING TOOL only - calculations are for display
   - If this ever processes real payments, calculations must be server-side

2. **❌ DON'T forget to install Recharts**
   - Component will fail to compile without it
   - Run `npm install recharts` BEFORE starting

3. **❌ DON'T use generic currency formatting**
   - Use the EXACT pattern from `pricing-summary.tsx:37`
   - Intl.NumberFormat with specific options

4. **❌ DON'T make mobile touch targets too small**
   - Minimum 48px height (WCAG guideline)
   - Users will struggle to tap small elements on phone

5. **❌ DON'T skip debouncing on quantity input**
   - Without debouncing, chart will flicker on rapid typing
   - Use 300ms delay for smooth UX

6. **❌ DON'T hardcode pricing in component**
   - Keep all pricing in `lib/data/medical-procedure-pricing.ts`
   - Easy to update prices without touching component code

7. **❌ DON'T use any types**
   - TypeScript strict mode enforced
   - Properly type all props, state, and function returns

8. **❌ DON'T forget conditional quantity input**
   - Some procedures (smile makeover, facelift) don't need quantity
   - Only show input when `hasQuantity: true`

### Performance Considerations

**Optimization Tips:**
1. **Debounce quantity input** (300ms) to prevent excessive re-renders
2. **Memoize calculations** if performance becomes an issue:
   ```typescript
   const savings = useMemo(() => usCost - thailandCost, [usCost, thailandCost])
   ```
3. **Lazy load Recharts** if bundle size is concern:
   ```typescript
   const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
   ```
4. **Use Next.js Image component** if adding procedure images in future
5. **Keep component under 400 lines** - split into smaller components if needed

**SEO Considerations (if standalone page):**
- Add proper meta tags (title, description)
- Use semantic HTML (h1, h2, p, form)
- Include schema.org markup for medical procedures (optional)
- Target keywords: "medical tourism cost calculator", "Thailand plastic surgery prices"

### Analytics & Conversion Tracking

**Track These Events:**
1. **Calculator interaction**: When user changes procedure or quantity
2. **CTA click**: "Apply to Learn More" button clicked
3. **High-value calculation**: When savings > $10,000 (indicates serious interest)

**Google Analytics 4 Example:**
```typescript
// Track CTA click
const handleCTAClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'Medical Calculator',
      event_label: procedure?.name,
      value: savings / 100 // in dollars
    })
  }
  router.push('/apply')
}
```

### Future Enhancements (NOT THIS STORY)

**Potential Future Features:**
- [ ] Add procedure images/icons for visual appeal
- [ ] Compare multiple destinations (Philippines, Mexico, not just Thailand)
- [ ] Add travel cost estimates (flights, accommodation)
- [ ] Email results to user (capture email for lead gen)
- [ ] Embed calculator on Facebook/Instagram via iframe
- [ ] A/B test different CTAs ("Book Consultation" vs "Apply Now")
- [ ] Add "Why Thailand?" section below calculator (trust-building)
- [ ] Display real patient testimonials for selected procedure

**DO NOT implement these in this story** - focus on core calculator functionality only.

### Related Stories & Dependencies

**Dependencies:**
- ✅ Recharts library (must install before starting)
- ✅ shadcn/ui components (already installed)
- ✅ React Hook Form + Zod (already installed)
- ✅ Tailwind CSS (already configured)

**Related Stories:**
- E1-S1: Marketing homepage (calculator may be embedded here)
- E1-S6: Guest Application Form (CTA links to this)
- E5-S2: Google Analytics Integration (tracking calculator conversions)

**No Blockers** - This story can be implemented immediately.

## Dev Agent Record

### Agent Model Used

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes

(To be filled by dev agent upon story completion)

### File List

**Files to Create:**
1. `components/marketing/medical-cost-calculator.tsx` - Main calculator component
2. `lib/data/medical-procedure-pricing.ts` - Pricing data config

**Files to Modify:**
- `app/(marketing)/page.tsx` - Add calculator section (if embedding in homepage)
- OR `app/(marketing)/cost-calculator/page.tsx` - Create standalone page (if separate page)

**Dependencies to Install:**
- `recharts` - Bar chart visualization library

**No Database Changes Required** - This is a purely client-side marketing tool.
