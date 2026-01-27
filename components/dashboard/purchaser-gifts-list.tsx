'use client'

/**
 * Purchaser Gifts List Component
 *
 * Displays gifts purchased by the current user.
 * Shows recipient info, status, delivery date, and state history.
 * Provides action buttons: Cancel (PENDING), Edit Message (PENDING), Resend (SENT).
 * Follows the pattern from bookings-list.tsx.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gift, Calendar, User, Mail, MapPin, DollarSign, Package, XCircle, Edit2, Send, Loader2, X } from 'lucide-react'
import { GiftStatusBadge } from './gift-state-timeline'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GiftStatus } from '@prisma/client'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { Textarea } from '@/components/ui/textarea'

interface PurchasedGift {
  id: string
  bookingReference: string
  packageName: string
  packageSlug: string
  recipientName: string | null
  recipientEmail: string | null
  giftMessage: string | null
  giftStatus: GiftStatus
  giftDeliveryDate: string | null
  giftExpiresAt: string | null
  totalPrice: number
  createdAt: string
  trip: {
    startDate: string | null
    endDate: string | null
    destination: string | null
  } | null
  stateHistory: Array<{
    fromState: string
    toState: string
    reason: string
    createdAt: string
  }>
}

interface PurchaserGiftsListProps {
  gifts: PurchasedGift[]
}

export function PurchaserGiftsList({ gifts }: PurchaserGiftsListProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editMessageDialogOpen, setEditMessageDialogOpen] = useState(false)
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState<PurchasedGift | null>(null)
  const [editedMessage, setEditedMessage] = useState('')

  const utils = trpc.useUtils()

  // Cancel Gift Mutation
  const cancelMutation = trpc.gift.cancelGift.useMutation({
    onSuccess: () => {
      toast.success('Gift cancelled successfully. A full refund has been processed.')
      utils.gift.myPurchasedGifts.invalidate()
      setCancelDialogOpen(false)
      setSelectedGift(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel gift. Please try again.')
    },
  })

  // Update Gift Message Mutation
  const updateMessageMutation = trpc.gift.updateGiftMessage.useMutation({
    onSuccess: () => {
      toast.success('Gift message updated successfully.')
      utils.gift.myPurchasedGifts.invalidate()
      setEditMessageDialogOpen(false)
      setSelectedGift(null)
      setEditedMessage('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update message. Please try again.')
    },
  })

  // Resend Notification Mutation
  const resendMutation = trpc.gift.resendGiftNotification.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      setResendDialogOpen(false)
      setSelectedGift(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend notification. Please try again.')
    },
  })

  // Action handlers
  const handleOpenCancelDialog = (gift: PurchasedGift) => {
    setSelectedGift(gift)
    setCancelDialogOpen(true)
  }

  const handleOpenEditMessageDialog = (gift: PurchasedGift) => {
    setSelectedGift(gift)
    setEditedMessage(gift.giftMessage || '')
    setEditMessageDialogOpen(true)
  }

  const handleOpenResendDialog = (gift: PurchasedGift) => {
    setSelectedGift(gift)
    setResendDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (selectedGift) {
      cancelMutation.mutate({ giftId: selectedGift.id })
    }
  }

  const handleConfirmUpdateMessage = () => {
    if (selectedGift) {
      updateMessageMutation.mutate({
        giftId: selectedGift.id,
        message: editedMessage || undefined,
      })
    }
  }

  const handleConfirmResend = () => {
    if (selectedGift) {
      resendMutation.mutate({ giftId: selectedGift.id })
    }
  }

  // Check if gift is in a terminal state
  const isTerminalState = (status: GiftStatus) => {
    return ['ACCEPTED', 'DECLINED'].includes(status)
  }

  // Empty state
  if (gifts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-semibold mb-2">No Gifts Purchased Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t purchased any gifts yet. Gift a transformation trip to someone special!
          </p>
          <Link href="/packages">
            <Button>Browse Packages</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Gifts Count */}
        <p className="text-sm text-muted-foreground">
          Showing {gifts.length} gift{gifts.length !== 1 ? 's' : ''}
        </p>

        {/* Gifts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {gifts.map((gift) => (
            <Card
              key={gift.id}
              className="hover:shadow-md transition-shadow border-purple-200 bg-purple-50/20"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{gift.packageName}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {gift.bookingReference}
                    </p>
                  </div>
                  <GiftStatusBadge
                    currentState={gift.giftStatus}
                    expiresAt={gift.giftExpiresAt}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Recipient Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    Recipient
                  </h4>
                  <div className="bg-white rounded-lg p-3 space-y-2 border">
                    {gift.recipientName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{gift.recipientName}</span>
                      </div>
                    )}
                    {gift.recipientEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{gift.recipientEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gift Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Price */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>${(gift.totalPrice / 100).toLocaleString()}</span>
                  </div>

                  {/* Delivery Date */}
                  {gift.giftDeliveryDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(gift.giftDeliveryDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Trip Info */}
                  {gift.trip && gift.trip.destination && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {gift.trip.destination}
                        {gift.trip.startDate && (
                          <> - {format(new Date(gift.trip.startDate), 'MMM d, yyyy')}</>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gift Message Preview */}
                {gift.giftMessage && (
                  <div className="bg-purple-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-600 italic line-clamp-2">
                      &ldquo;{gift.giftMessage}&rdquo;
                    </p>
                  </div>
                )}

                {/* Purchase Date */}
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Purchased on {format(new Date(gift.createdAt), 'MMMM d, yyyy')}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* PENDING state: Cancel + Edit Message */}
                  {gift.giftStatus === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleOpenCancelDialog(gift)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEditMessageDialog(gift)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Message
                      </Button>
                    </div>
                  )}

                  {/* SENT state: Resend Notification */}
                  {gift.giftStatus === 'SENT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenResendDialog(gift)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Resend Notification
                    </Button>
                  )}

                  {/* View Details Link (always visible) */}
                  <Link href={`/dashboard/bookings/${gift.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cancel Gift Dialog */}
      <Dialog.Root open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-[calc(100%-2rem)] z-50 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2 pr-8">
              Cancel Gift
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 mb-4">
              Are you sure you want to cancel this gift to <strong>{selectedGift?.recipientName}</strong>?
            </Dialog.Description>

            {selectedGift && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <p className="text-sm"><strong>Package:</strong> {selectedGift.packageName}</p>
                <p className="text-sm"><strong>Recipient:</strong> {selectedGift.recipientEmail}</p>
                <p className="text-sm"><strong>Amount:</strong> ${(selectedGift.totalPrice / 100).toLocaleString()}</p>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Full refund:</strong> You will receive a full refund to your original payment method within 5-10 business days.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={cancelMutation.isPending}>
                  Keep Gift
                </Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Message Dialog */}
      <Dialog.Root open={editMessageDialogOpen} onOpenChange={setEditMessageDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-[calc(100%-2rem)] z-50 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2 pr-8">
              Edit Gift Message
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 mb-4">
              Update the personal message for your gift to <strong>{selectedGift?.recipientName}</strong>.
            </Dialog.Description>

            <div className="mb-4">
              <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Gift Message (optional)
              </label>
              <Textarea
                id="giftMessage"
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                placeholder="Write a personal message for the recipient..."
                rows={4}
                maxLength={1000}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedMessage.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={updateMessageMutation.isPending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleConfirmUpdateMessage}
                disabled={updateMessageMutation.isPending}
              >
                {updateMessageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {updateMessageMutation.isPending ? 'Saving...' : 'Save Message'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Resend Notification Dialog */}
      <Dialog.Root open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-[calc(100%-2rem)] z-50 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2 pr-8">
              Resend Gift Notification
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 mb-4">
              Send another notification email to <strong>{selectedGift?.recipientName}</strong> about their gift.
            </Dialog.Description>

            {selectedGift && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
                <p className="text-sm"><strong>Recipient:</strong> {selectedGift.recipientEmail}</p>
                <p className="text-sm"><strong>Package:</strong> {selectedGift.packageName}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> You can resend the notification up to 3 times per 24 hours to prevent spam.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={resendMutation.isPending}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleConfirmResend}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {resendMutation.isPending ? 'Sending...' : 'Resend Email'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
