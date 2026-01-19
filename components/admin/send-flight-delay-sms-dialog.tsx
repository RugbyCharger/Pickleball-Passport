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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { MessageSquare, Loader2 } from 'lucide-react'

interface SendFlightDelaySMSDialogProps {
  bookingId: string
  bookingReference: string
  tripDate?: Date
}

export function SendFlightDelaySMSDialog({
  bookingId,
  bookingReference,
  tripDate,
}: SendFlightDelaySMSDialogProps) {
  const [open, setOpen] = useState(false)
  const [tripDateStr, setTripDateStr] = useState(
    tripDate ? tripDate.toISOString().split('T')[0] : ''
  )
  const [newTime, setNewTime] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const sendSMSMutation = trpc.admin.sendFlightDelaySMS.useMutation({
    onSuccess: () => {
      toast.success('Flight delay SMS sent successfully')
      setOpen(false)
      setTripDateStr('')
      setNewTime('')
      setContactInfo('')
    },
    onError: (error) => {
      toast.error(`Failed to send SMS: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tripDateStr || !newTime || !contactInfo) {
      toast.error('Please fill in all fields')
      return
    }

    sendSMSMutation.mutate({
      bookingId,
      delayInfo: {
        tripDate: tripDateStr,
        newTime,
        contactInfo,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Send Flight Delay SMS
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Flight Delay SMS</DialogTitle>
          <DialogDescription>
            Send an SMS notification to the guest about a flight delay for booking{' '}
            {bookingReference}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tripDate">Trip Date</Label>
            <Input
              id="tripDate"
              type="date"
              value={tripDateStr}
              onChange={(e) => setTripDateStr(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="newTime">New Departure Time</Label>
            <Input
              id="newTime"
              type="text"
              placeholder="e.g., 2:00 PM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactInfo">Contact Phone Number</Label>
            <Input
              id="contactInfo"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
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
