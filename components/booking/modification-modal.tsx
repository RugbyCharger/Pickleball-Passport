'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModificationModalProps {
  bookingId: string
  bookingReference: string
  packageName: string
  duration: number
  accommodationTier: string
  currentAddOns: Array<{
    id: string
    name: string
    price: number
  }>
  currentTotal: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModificationModal({
  bookingId,
  bookingReference,
  packageName,
  duration,
  accommodationTier,
  currentAddOns,
  currentTotal,
  open,
  onOpenChange
}: ModificationModalProps) {
  const router = useRouter()

  const handleContinue = () => {
    // Navigate to modification configurator
    router.push(`/booking/modify/${bookingId}`)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto z-50 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title id="modal-title" className="text-2xl font-serif font-bold text-gray-900 mb-2 pr-8">
            Modify Booking
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description id="modal-description" className="text-gray-600 mb-6">
            Review your current booking details for <strong className="font-semibold text-gray-900">{bookingReference}</strong>
          </Dialog.Description>

          {/* Current Booking Summary */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Booking</h3>

            {/* Locked Items */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium text-gray-900">{packageName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{duration} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accommodation:</span>
                <span className="font-medium text-gray-900">{accommodationTier}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-3"></div>

            {/* Modifiable Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Add-Ons (Modifiable):</span>
              </div>
              {currentAddOns.length > 0 ? (
                <ul className="space-y-1">
                  {currentAddOns.map((addOn) => (
                    <li key={addOn.id} className="flex justify-between text-sm text-gray-600">
                      <span>• {addOn.name}</span>
                      <span className="font-medium">
                        ${(addOn.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No add-ons selected</p>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-900">Current Total:</span>
                <span className="text-gray-900">
                  ${(currentTotal / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Modification Rules */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-900">Modification Rules</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You can add or remove add-ons</li>
                  <li>• Base package, duration, and accommodation cannot be changed</li>
                  <li>• Price adjustments will be processed immediately</li>
                  <li>• Price increases require payment</li>
                  <li>• Price decreases will be refunded (5-10 business days)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="sm:flex-1"
            >
              Continue to Configurator
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
