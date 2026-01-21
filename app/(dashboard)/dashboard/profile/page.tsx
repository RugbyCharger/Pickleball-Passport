/**
 * Profile Management Page
 *
 * Story 2-6: Profile Management
 *
 * Features:
 * - Display user's name, email, phone, profile photo
 * - Edit name and phone
 * - Update emergency contact information
 * - Change password via Clerk UserProfile component
 * - Delete account button (links to Story 2-7)
 * - Success toast on save
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Lock,
  Trash2,
  Save,
  Loader2,
  Camera,
  Shield,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoaded: clerkLoaded } = useUser()
  const { openUserProfile, signOut } = useClerk()
  const router = useRouter()
  const utils = trpc.useUtils()

  // Fetch user profile from database
  const { data: dbProfile, isLoading: profileLoading } = trpc.user.getProfile.useQuery()

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (clerkLoaded && user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
    if (dbProfile?.guestProfile) {
      setPhone(dbProfile.guestProfile.phone || '')
      setLocation(dbProfile.guestProfile.location || '')
      setEmergencyContactName(dbProfile.guestProfile.emergencyContactName || '')
      setEmergencyContactPhone(dbProfile.guestProfile.emergencyContactPhone || '')
      setEmergencyContactRelationship(dbProfile.guestProfile.emergencyContactRelationship || '')
    }
  }, [clerkLoaded, user, dbProfile])

  // Update profile mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully')
      setIsEditing(false)
      utils.user.getProfile.invalidate()
      // Reload clerk user data
      user?.reload()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  // Delete account mutation
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success('Account deleted successfully')
      // Sign out and redirect to homepage
      await signOut()
      router.push('/')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account')
      setDeleteConfirmation('')
    },
  })

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || null,
      location: location || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      emergencyContactRelationship: emergencyContactRelationship || null,
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }
    deleteAccountMutation.mutate({ confirmation: 'DELETE' })
  }

  const handleCancelEdit = () => {
    // Reset form to original values
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
    if (dbProfile?.guestProfile) {
      setPhone(dbProfile.guestProfile.phone || '')
      setLocation(dbProfile.guestProfile.location || '')
      setEmergencyContactName(dbProfile.guestProfile.emergencyContactName || '')
      setEmergencyContactPhone(dbProfile.guestProfile.emergencyContactPhone || '')
      setEmergencyContactRelationship(dbProfile.guestProfile.emergencyContactRelationship || '')
    }
    setIsEditing(false)
  }

  if (!clerkLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Photo & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold overflow-hidden">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    {firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || 'G'}
                  </>
                )}
              </div>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => openUserProfile()}
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="font-medium text-lg">
                {firstName && lastName ? `${firstName} ${lastName}` : 'Guest'}
              </p>
              <p className="text-sm text-muted-foreground">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                }) : 'Unknown'}
              </p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => openUserProfile()}
              >
                Change profile photo via Clerk
              </Button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              ) : (
                <p className="font-medium py-2">{firstName || 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              ) : (
                <p className="font-medium py-2">{lastName || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Email (Read-only, managed by Clerk) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <div className="flex items-center gap-2">
              <p className="font-medium">{primaryEmail?.emailAddress || 'Not set'}</p>
              {primaryEmail?.verification?.status === 'verified' && (
                <Badge variant="default" className="text-xs">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Email changes are managed through Clerk.{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => openUserProfile()}
              >
                Update email
              </Button>
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <p className="font-medium py-2">{phone || 'Not set'}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            {isEditing ? (
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State/Country"
              />
            ) : (
              <p className="font-medium py-2">{location || 'Not set'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            This information will only be used in case of emergency during your trip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name</Label>
              {isEditing ? (
                <Input
                  id="emergencyName"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Enter contact name"
                />
              ) : (
                <p className="font-medium py-2">{emergencyContactName || 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              {isEditing ? (
                <Input
                  id="emergencyRelationship"
                  value={emergencyContactRelationship}
                  onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              ) : (
                <p className="font-medium py-2">{emergencyContactRelationship || 'Not set'}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Contact Phone</Label>
            {isEditing ? (
              <Input
                id="emergencyPhone"
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Enter contact phone number"
              />
            ) : (
              <p className="font-medium py-2">{emergencyContactPhone || 'Not set'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Change your password or enable two-factor authentication
              </p>
            </div>
            <Button variant="outline" onClick={() => openUserProfile()}>
              <Shield className="h-4 w-4 mr-2" />
              Manage Security
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Last sign-in: {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Never'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Account Deletion */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers, including:
                  </DialogDescription>
                </DialogHeader>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 my-4">
                  <li>Your profile information</li>
                  <li>All booking history</li>
                  <li>Payment records</li>
                  <li>Referral data</li>
                  <li>Support tickets</li>
                </ul>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="font-mono"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setDeleteConfirmation('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
