/**
 * Onboarding Page - Role Selection
 *
 * After signing up, new users are directed here to select their role:
 * - Guest: Book transformation packages
 * - Partner: Refer members and earn rewards
 *
 * This page updates the user's role in the database via tRPC.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'GUEST' | 'PARTNER' | null>(null)

  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: (data) => {
      // Redirect based on role
      if (data.role === 'GUEST') {
        router.push('/dashboard')
      } else if (data.role === 'PARTNER') {
        router.push('/partner/setup')
      }
    },
    onError: (error) => {
      console.error('Error updating role:', error)
      alert('Failed to update role. Please try again.')
    },
  })

  const handleSelectRole = (role: 'GUEST' | 'PARTNER') => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (selectedRole) {
      updateRoleMutation.mutate({ role: selectedRole })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-4xl font-bold text-primary mb-2">
            Welcome to The Pickleball Passport
          </h1>
          <p className="text-muted-foreground text-lg">
            First, let us know how you&apos;ll be using our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Guest Card */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedRole === 'GUEST'
                ? 'border-primary ring-2 ring-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleSelectRole('GUEST')}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>I&apos;m a Guest</CardTitle>
                  <CardDescription>
                    Book transformation packages
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Browse and book packages</li>
                <li>• Configure your transformation journey</li>
                <li>• Access your member dashboard</li>
                <li>• Manage bookings and payments</li>
              </ul>
            </CardContent>
          </Card>

          {/* Partner Card */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedRole === 'PARTNER'
                ? 'border-primary ring-2 ring-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleSelectRole('PARTNER')}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>I&apos;m a Partner</CardTitle>
                  <CardDescription>
                    Refer members and earn rewards
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Earn Passport Points on referrals</li>
                <li>• Access partner portal</li>
                <li>• Redeem points for free trips</li>
                <li>• Track your club&apos;s bookings</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || updateRoleMutation.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {updateRoleMutation.isPending ? 'Setting up...' : 'Continue'}
          </Button>

          {selectedRole && (
            <p className="mt-4 text-sm text-muted-foreground">
              You can always change this later in your settings
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
