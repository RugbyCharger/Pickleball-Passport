'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { MessageSquare, Loader2 } from 'lucide-react'

interface SendItineraryChangeSMSDialogProps {
  bookingId: string
  bookingReference: string
}

export function SendItineraryChangeSMSDialog({
  bookingId,
  bookingReference,
}: SendItineraryChangeSMSDialogProps) {
  const [open, setOpen] = useState(false)
  const [changeDetails, setChangeDetails] = useState('')

  const sendSMSMutation = trpc.admin.sendItineraryChangeSMS.useMutation({
    onSuccess: () => {
      toast.success('Itinerary change SMS sent successfully')
      setOpen(false)
      setChangeDetails('')
    },
    onError: (error) => {
      toast.error(`Failed to send SMS: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeDetails.trim()) {
      toast.error('Please provide change details')
      return
    }

    sendSMSMutation.mutate({
      bookingId,
      changeDetails: changeDetails.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Send Itinerary Change SMS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Itinerary Change SMS</DialogTitle>
          <DialogDescription>
            Send an SMS notification to the guest about an itinerary change for booking{' '}
            {bookingReference}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="changeDetails">Change Details</Label>
            <Textarea
              id="changeDetails"
              placeholder="Describe the itinerary change (e.g., 'Activity cancelled: Snorkeling tour on Day 3')"
              value={changeDetails}
              onChange={(e) => setChangeDetails(e.target.value)}
              required
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep it brief - this will be sent as an SMS (160 character limit per segment)
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sendSMSMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sendSMSMutation.isPending}>
              {sendSMSMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send SMS'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
