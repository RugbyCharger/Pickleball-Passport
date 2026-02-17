'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { CheckCircle, Award, Users, Loader2 } from 'lucide-react';

// Validation schema
const partnerSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  clubName: z.string().min(1, 'Club name is required').max(100),
  clubLocation: z.string().min(1, 'Club location is required').max(100),
  jobTitle: z.string().max(100).optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Partner Terms and Conditions',
  }),
});

type PartnerSignupInput = z.infer<typeof partnerSignupSchema>;

export default function PartnerSetupPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PartnerSignupInput>({
    resolver: zodResolver(partnerSignupSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch('agreeToTerms');
  const signupMutation = trpc.partner.signup.useMutation();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1D2D44] mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to create a partner account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Partner accounts are linked to your user profile for secure access to your dashboard and
              referral tracking.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/sign-in">
                <Button className="w-full bg-[#1D2D44] hover:bg-[#002B42]">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Link href="/partners" className="text-sm text-[#1D2D44] hover:underline">
                ← Back to Partner Program
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: PartnerSignupInput) => {
    if (!user) {
      toast.error('Authentication required. Please sign in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // SECURITY: userId is now automatically taken from the authenticated session
      // instead of being passed from the client (prevents spoofing)
      const result = await signupMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        clubName: data.clubName,
        clubLocation: data.clubLocation,
        jobTitle: data.jobTitle,
      });

      if (result.success) {
        toast.success(
          `Welcome to the partner program! Your referral code is ${result.referralCode}`,
          { duration: 5000 }
        );

        // Redirect to partner dashboard
        setTimeout(() => {
          router.push('/partner/dashboard');
        }, 1500);
      }
    } catch (error) {
      const err = error as { message?: string }
      console.error('Partner signup error:', error);

      if (err.message?.includes('already exists')) {
        toast.error(
          'A partner account already exists. Please sign in to access your dashboard.',
          { duration: 5000 }
        );
        setTimeout(() => {
          router.push('/partner/dashboard');
        }, 2000);
      } else {
        toast.error(err.message || 'Failed to create partner account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-3">
            Become a Partner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our growing network of pickleball clubs earning rewards for referring members. Create
            your account in 2 minutes and start earning Passport Points today.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Instant Access</p>
            <p className="text-xs text-gray-600">Dashboard & referral code immediately</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <Award className="h-8 w-8 text-[#B08D55] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Earn Rewards</p>
            <p className="text-xs text-gray-600">500 Passport Points per booking</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <Users className="h-8 w-8 text-[#1D2D44] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">Free Marketing</p>
            <p className="text-xs text-gray-600">Co-branded materials included</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Partner Information</CardTitle>
            <CardDescription>
              Tell us about your club and we&apos;ll set up your partner account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                      placeholder="Jennifer"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                      placeholder="Smith"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder="jennifer@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Club Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Club Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">
                      Club Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="clubName"
                      {...register('clubName')}
                      className={errors.clubName ? 'border-red-500' : ''}
                      placeholder="The Villages Pickleball Club"
                    />
                    {errors.clubName && (
                      <p className="text-sm text-red-600">{errors.clubName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clubLocation">
                      Club Location <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="clubLocation"
                      {...register('clubLocation')}
                      className={errors.clubLocation ? 'border-red-500' : ''}
                      placeholder="Phoenix, AZ"
                    />
                    {errors.clubLocation && (
                      <p className="text-sm text-red-600">{errors.clubLocation.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                  <Input
                    id="jobTitle"
                    {...register('jobTitle')}
                    placeholder="Club Director, Manager, etc."
                  />
                  <p className="text-sm text-gray-500">
                    Your role at the club (e.g., Director, Manager, Organizer)
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked: boolean) => setValue('agreeToTerms', checked)}
                    className={errors.agreeToTerms ? 'border-red-500' : ''}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link
                        href="/partner-terms"
                        target="_blank"
                        className="text-[#1D2D44] hover:underline"
                      >
                        Partner Terms and Conditions
                      </Link>{' '}
                      <span className="text-red-600">*</span>
                    </Label>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                <Link href="/partners" className="text-sm text-gray-600 hover:text-gray-900">
                  ← Back to Partner Program
                </Link>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="bg-[#1D2D44] hover:bg-[#002B42] text-white px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Partner Account'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Calendly CTA */}
        <div className="mt-8 text-center p-6 bg-[#F5E6D3]/50 rounded-xl border border-[#B08D55]/20">
          <p className="text-[#1D2D44] font-medium mb-2">
            Want to get started faster?
          </p>
          <a
            href="https://calendly.com/jaron-thepickleballpassport/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B08D55] hover:text-[#8D7144] font-semibold underline underline-offset-2 transition-colors"
          >
            Book a 15-minute intro call with Jaron
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 text-center mt-6">
          100% free to join. No membership fees or hidden costs. Start earning rewards from your first
          referral.
        </p>
      </div>
    </div>
  );
}
