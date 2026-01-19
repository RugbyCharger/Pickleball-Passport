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
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface SendEmergencyAlertSMSDialogProps {
  tripId: string
  tripName: string
}

export function SendEmergencyAlertSMSDialog({
  tripId,
  tripName,
}: SendEmergencyAlertSMSDialogProps) {
  const [open, setOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const sendSMSMutation = trpc.admin.sendEmergencyAlertSMS.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Emergency alert sent to ${data.sentCount} guest(s)${data.skippedCount > 0 ? ` (${data.skippedCount} skipped)` : ''}`
      )
      setOpen(false)
      setAlertMessage('')
      setContactInfo('')
    },
    onError: (error) => {
      toast.error(`Failed to send emergency alert: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!alertMessage.trim() || !contactInfo.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!confirm('Are you sure you want to send an emergency alert to all guests on this trip? This action cannot be undone.')) {
      return
    }

    sendSMSMutation.mutate({
      tripId,
      message: alertMessage.trim(),
      contactInfo: contactInfo.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Send Emergency Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Send Emergency Alert SMS
          </DialogTitle>
          <DialogDescription>
            Send an emergency SMS alert to all confirmed guests on trip: <strong>{tripName}</strong>
            <br />
            <span className="text-red-600 font-medium">This will be sent even if guests have opted out of SMS notifications.</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="alertMessage">Emergency Message</Label>
            <Textarea
              id="alertMessage"
              placeholder="Enter the emergency alert message (e.g., 'Severe weather warning: All outdoor activities cancelled today')"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              required
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep it brief - this will be sent as an SMS (160 character limit per segment)
            </p>
          </div>
          <div>
            <Label htmlFor="contactInfo">Emergency Contact Phone</Label>
            <Input
              id="contactInfo"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact number for guests to reach out in case of emergency
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
            <Button type="submit" variant="destructive" disabled={sendSMSMutation.isPending}>
              {sendSMSMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Send Emergency Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
