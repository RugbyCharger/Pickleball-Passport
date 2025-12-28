/**
 * Partner Setup Page
 *
 * After selecting "Partner" role, users are brought here to complete
 * their partner profile (club name, location, etc.).
 * This will create a PartnerProfile record in the database.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PartnerSetupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clubName: '',
    clubLocation: '',
    jobTitle: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement partner profile creation via tRPC
    // This will be implemented in a future sprint when we build the partner portal

    setTimeout(() => {
      alert('Partner profile setup will be implemented in a future sprint')
      router.push('/partner/dashboard')
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-playfair text-3xl">Set Up Your Partner Profile</CardTitle>
          <CardDescription>
            Tell us about your pickleball club to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="clubName">Club Name *</Label>
              <Input
                id="clubName"
                value={formData.clubName}
                onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                placeholder="e.g., The Villages Pickleball"
                required
              />
            </div>

            <div>
              <Label htmlFor="clubLocation">Club Location *</Label>
              <Input
                id="clubLocation"
                value={formData.clubLocation}
                onChange={(e) => setFormData({ ...formData, clubLocation: e.target.value })}
                placeholder="e.g., The Villages, FL"
                required
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Your Role</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g., Club Director, Manager"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating profile...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
