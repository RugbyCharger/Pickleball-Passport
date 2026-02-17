/**
 * Partner Agreement Page
 * E9-S15: Partner Agreement E-Signature System
 *
 * Features:
 * - Display partner agreement document
 * - Canvas-based signature capture
 * - Terms acceptance checkbox
 * - Record signature with IP address and timestamp
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  FileText,
  PenTool,
  Check,
  AlertTriangle,
  Eraser,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Partner agreement markdown content
const AGREEMENT_CONTENT = `# The Pickleball Passport Partner Agreement

Version 1.0 | Effective Date: January 2026

---

## 1. Introduction

This Partner Agreement ("Agreement") is entered into between The Pickleball Passport LLC ("Company") and the Partner ("Partner" or "You") identified in the Partner Portal registration.

By signing this Agreement electronically, you agree to be bound by the terms and conditions set forth herein.

---

## 2. Partner Program Overview

### 2.1 Purpose
The Pickleball Passport Partner Program enables qualified pickleball clubs, facilities, and organizations to refer their members to The Pickleball Passport retreats and earn commission-based rewards.

### 2.2 Eligibility
Partners must:
- Operate a legitimate pickleball club, facility, or related organization
- Maintain accurate and current registration information
- Comply with all applicable laws and regulations

---

## 3. Partner Responsibilities

### 3.1 Marketing and Promotion
Partners agree to:
- Promote The Pickleball Passport services honestly and accurately
- Use only Company-approved marketing materials
- Not make false or misleading claims about services or pricing
- Clearly disclose the referral relationship to potential guests

### 3.2 Code of Conduct
Partners shall:
- Conduct themselves professionally in all interactions
- Not engage in spam, unsolicited communications, or deceptive practices
- Protect the privacy and data of referred guests
- Promptly report any issues or concerns to the Company

---

## 4. Commission Structure

### 4.1 Referral Rewards
Partners earn Passport Points for qualified referrals according to the current tier structure:
- **Bronze Tier**: 5% commission on confirmed bookings
- **Silver Tier**: 7.5% commission on confirmed bookings
- **Gold Tier**: 10% commission on confirmed bookings
- **Platinum Tier**: 12.5% commission on confirmed bookings

### 4.2 Qualification
A referral is qualified when:
- The guest uses the Partner's unique referral code
- The booking is confirmed with full payment
- The guest is a new customer (not previously booked)

### 4.3 Point Redemption
Partners may redeem accumulated points for:
- Direct bank transfer (minimum 5,000 points)
- Travel credits toward The Pickleball Passport retreats
- Partner perks and exclusive experiences

---

## 5. Intellectual Property

### 5.1 License Grant
Company grants Partner a limited, non-exclusive, revocable license to use approved trademarks and marketing materials of The Pickleball Passport solely for promoting the Partner Program.

### 5.2 Restrictions
Partners shall not:
- Modify or alter Company trademarks
- Create derivative works from Company materials
- Use trademarks in a manner that disparages or diminishes brand value

---

## 6. Confidentiality

Partners agree to maintain the confidentiality of:
- Commission rates and tier structures
- Business strategies and proprietary information
- Guest personal information and booking details

---

## 7. Term and Termination

### 7.1 Term
This Agreement is effective upon electronic signature and continues until terminated by either party.

### 7.2 Termination
Either party may terminate this Agreement:
- With 30 days written notice for any reason
- Immediately upon material breach by the other party

### 7.3 Effect of Termination
Upon termination:
- Partner access to the Partner Portal will be revoked
- Accumulated points must be redeemed within 90 days
- Partner must cease use of all Company trademarks

---

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT.

---

## 9. Indemnification

Partner agrees to indemnify, defend, and hold harmless the Company from any claims, damages, or expenses arising from Partner's breach of this Agreement or Partner's marketing activities.

---

## 10. General Provisions

### 10.1 Governing Law
This Agreement shall be governed by the laws of the State of Florida.

### 10.2 Entire Agreement
This Agreement constitutes the entire agreement between the parties regarding the subject matter herein.

### 10.3 Amendments
Company reserves the right to modify this Agreement with 30 days notice to Partners.

### 10.4 Severability
If any provision is found unenforceable, the remaining provisions shall continue in full force and effect.

---

## 11. Electronic Signature Acknowledgment

By signing below, you acknowledge that:
- You have read and understand this Agreement
- Your electronic signature has the same legal effect as a handwritten signature
- You are authorized to enter into this Agreement on behalf of your organization
- You agree to be bound by all terms and conditions herein
`;

export default function PartnerAgreementPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch agreement status
  const { data: agreementData, isLoading } = trpc.partner.getAgreement.useQuery();
  const utils = trpc.useUtils();

  // Sign agreement mutation
  const signAgreement = trpc.partner.signAgreement.useMutation({
    onSuccess: () => {
      toast.success('Agreement signed successfully!');
      utils.partner.getAgreement.invalidate();
      router.push('/dashboard/partner');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign agreement');
    },
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  // Get drawing position from event
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
  };

  // Get signature as base64
  const getSignatureData = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  };

  // Handle sign agreement
  const handleSign = () => {
    if (!hasSignature) {
      toast.error('Please sign in the signature box');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms');
      return;
    }

    const signatureData = getSignatureData();
    signAgreement.mutate({
      signature: signatureData,
      agreedToTerms: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Already signed - show confirmation
  if (agreementData?.hasSigned && agreementData?.signedAgreement) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-emerald-900">
                    Agreement Signed
                  </CardTitle>
                  <CardDescription className="text-emerald-700">
                    You have already signed the Partner Agreement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 border border-emerald-200">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Agreement Version</dt>
                      <dd className="font-medium text-slate-900">
                        {agreementData.signedAgreement.version}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Signed On</dt>
                      <dd className="font-medium text-slate-900">
                        {new Date(agreementData.signedAgreement.signedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/partner')}
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Agreement
                    {isExpanded ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isExpanded && (
            <Card className="mt-6">
              <CardContent className="prose prose-slate max-w-none p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {AGREEMENT_CONTENT}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show agreement for signing
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Partner Agreement
              </h1>
              <p className="text-slate-600">
                Please review and sign the Partner Agreement to continue
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Action Required</p>
              <p>
                You must sign the Partner Agreement to access all partner features
                and start earning commissions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Document */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Agreement Document</CardTitle>
              <CardDescription>Version {agreementData?.currentVersion || '1.0'}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Expand
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div
              className={`prose prose-slate max-w-none overflow-hidden transition-all duration-300 ${
                isExpanded ? 'max-h-[600px] overflow-y-auto' : 'max-h-48'
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {AGREEMENT_CONTENT}
              </ReactMarkdown>
            </div>
            {!isExpanded && (
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setIsExpanded(true)}>
                  Read Full Agreement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <PenTool className="h-5 w-5 text-slate-600" />
              <div>
                <CardTitle>Electronic Signature</CardTitle>
                <CardDescription>
                  Sign in the box below using your mouse or finger
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signature Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-crosshair bg-white touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-slate-400 text-sm">Sign here</p>
                </div>
              )}
            </div>

            {/* Clear Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <Eraser className="mr-2 h-4 w-4" />
                Clear Signature
              </Button>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm font-medium text-slate-900">
                  I have read and agree to the Partner Agreement
                </Label>
                <p className="text-xs text-slate-500">
                  By checking this box and signing above, you acknowledge that your
                  electronic signature has the same legal effect as a handwritten
                  signature.
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Your signature, IP address, and timestamp will be securely recorded
                for compliance purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/dashboard/partner')}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!hasSignature || !agreedToTerms || signAgreement.isPending}
            className="gap-2"
          >
            {signAgreement.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Sign Agreement
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
