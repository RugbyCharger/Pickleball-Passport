/**
 * Medical Procedure Pricing Data
 *
 * Hardcoded pricing for medical tourism cost calculator.
 * All prices in USD cents (multiply by 100 for Stripe convention).
 *
 * Research-based estimates as of 2025.
 */

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
    name: 'Dental Veneers',
    description: 'Porcelain veneers to improve tooth appearance',
    usPrice: 200000, // $2,000 per tooth
    thailandPrice: 70000, // $700 per tooth
    hasQuantity: true,
    defaultQuantity: 8,
    maxQuantity: 32,
    unit: 'tooth'
  },
  {
    id: 'cosmetic-dentistry-package',
    name: 'Cosmetic Dentistry Package',
    description: 'Comprehensive teeth whitening, cleaning, and minor corrections',
    usPrice: 500000, // $5,000
    thailandPrice: 180000, // $1,800
    hasQuantity: false
  },
  {
    id: 'facial-rejuvenation',
    name: 'Facial Rejuvenation (Botox + Fillers)',
    description: 'Non-surgical facial rejuvenation with Botox and dermal fillers',
    usPrice: 300000, // $3,000
    thailandPrice: 120000, // $1,200
    hasQuantity: false
  },
  {
    id: 'facelift',
    name: 'Facelift',
    description: 'Surgical facelift to reduce signs of aging',
    usPrice: 1500000, // $15,000
    thailandPrice: 550000, // $5,500
    hasQuantity: false
  },
  {
    id: 'rhinoplasty',
    name: 'Rhinoplasty (Nose Job)',
    description: 'Surgical nose reshaping for aesthetic or functional improvement',
    usPrice: 1200000, // $12,000
    thailandPrice: 420000, // $4,200
    hasQuantity: false
  },
  {
    id: 'breast-augmentation',
    name: 'Breast Augmentation',
    description: 'Breast implant surgery for size enhancement',
    usPrice: 1000000, // $10,000
    thailandPrice: 380000, // $3,800
    hasQuantity: false
  },
  {
    id: 'liposuction',
    name: 'Liposuction',
    description: 'Surgical fat removal from targeted body areas',
    usPrice: 800000, // $8,000
    thailandPrice: 280000, // $2,800
    hasQuantity: false
  },
  {
    id: 'hair-transplant',
    name: 'Hair Transplant',
    description: 'Follicular unit extraction (FUE) hair restoration',
    usPrice: 800000, // $8,000
    thailandPrice: 280000, // $2,800
    hasQuantity: false
  },
  {
    id: 'lasik',
    name: 'LASIK Eye Surgery',
    description: 'Laser vision correction for both eyes',
    usPrice: 400000, // $4,000
    thailandPrice: 150000, // $1,500
    hasQuantity: false
  },
  {
    id: 'dental-implants',
    name: 'Dental Implants',
    description: 'Permanent tooth replacement with titanium implants',
    usPrice: 400000, // $4,000 per implant
    thailandPrice: 140000, // $1,400 per implant
    hasQuantity: true,
    defaultQuantity: 1,
    maxQuantity: 32,
    unit: 'implant'
  }
]

/**
 * Get procedure by ID
 */
export function getProcedureById(id: string): MedicalProcedure | undefined {
  return medicalProcedures.find(p => p.id === id)
}

/**
 * Format currency from cents to USD string
 * Matches pattern from components/booking/pricing-summary.tsx:37
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amountInCents / 100)
}
