/**
 * Partner Referral Link Generator Page
 * E9-S9: Referral Link Generator
 *
 * Features:
 * - Display default referral link
 * - Generate QR codes
 * - Create custom links with campaign names
 * - Share links via email/SMS
 * - Track link performance
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import {
  Copy,
  Check,
  Download,
  Mail,
  MessageSquare,
  Plus,
  Loader2,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import QRCode to avoid SSR issues
const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-48 w-48 animate-pulse rounded-lg bg-slate-200" />,
});

interface CustomLink {
  id: string;
  campaignName: string;
  url: string;
  clicks: number;
  conversions: number;
}

export default function PartnerReferralLinksPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showCustomLinkForm, setShowCustomLinkForm] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading } = trpc.partner.getMyProfile.useQuery();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultLink = profile?.referralCode
    ? `${baseUrl}/r/${profile.referralCode}`
    : '';

  const qrSizes = {
    small: 128,
    medium: 256,
    large: 384,
  };

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCopyCode = async () => {
    if (profile?.referralCode) {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateCustomLink = () => {
    if (!campaignName.trim() || !profile?.referralCode) return;

    const customLink: CustomLink = {
      id: Date.now().toString(),
      campaignName: campaignName.trim(),
      url: `${baseUrl}/r/${profile.referralCode}?campaign=${encodeURIComponent(campaignName.trim())}`,
      clicks: 0,
      conversions: 0,
    };

    setCustomLinks([...customLinks, customLink]);
    setCampaignName('');
    setShowCustomLinkForm(false);
  };

  const handleShareEmail = (link: string) => {
    const subject = encodeURIComponent('Join Pickleball Passport');
    const body = encodeURIComponent(
      `Hi! I wanted to share this amazing opportunity with you.\n\n` +
        `Pickleball Passport combines your love of pickleball with world-class wellness and medical care in Thailand.\n\n` +
        `Check it out: ${link}\n\n` +
        `Use my referral code: ${profile?.referralCode || ''}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareSMS = (link: string) => {
    const message = encodeURIComponent(
      `Check out Pickleball Passport! ${link} Use code: ${profile?.referralCode || ''}`
    );
    window.location.href = `sms:?body=${message}`;
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !defaultLink) return;

    // Create canvas from SVG (simplified approach)
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `pickleball-passport-qr-${profile?.referralCode || 'code'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Partner profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard/partner" className="text-slate-600 hover:text-slate-900">
                Partner Dashboard
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-900">Referral Links</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Referral Link Generator</h1>
          <p className="mt-1 text-slate-600">
            Share your referral link and QR code with your members
          </p>
        </div>

        {/* Default Referral Link */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Default Referral Link</h2>

          {/* Link Display */}
          <div className="mb-4 rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <code className="flex-1 break-all text-sm text-slate-900">{defaultLink}</code>
              <Button
                onClick={() => handleCopyLink(defaultLink)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copiedLink === defaultLink ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Referral Code */}
          <div className="mb-4 rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Referral Code</p>
                <code className="mt-1 text-xl font-bold text-emerald-600">
                  {profile.referralCode}
                </code>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
              onClick={() => handleShareEmail(defaultLink)}
              variant="outline"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Share via Email
            </Button>
            <Button
              onClick={() => handleShareSMS(defaultLink)}
              variant="outline"
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Share via SMS
            </Button>
          </div>

          {/* QR Code */}
          <div className="border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">QR Code</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Size:</label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="small">Small (128px)</option>
                  <option value="medium">Medium (256px)</option>
                  <option value="large">Large (384px)</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div ref={qrRef} className="rounded-lg border border-slate-200 bg-white p-4">
                {defaultLink && (
                  <QRCodeSVG
                    value={defaultLink}
                    size={qrSizes[qrSize]}
                    level="M"
                    includeMargin={true}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="mb-4 text-sm text-slate-600">
                  Use this QR code on flyers, business cards, or any printed materials. Members can
                  scan it to visit your referral link.
                </p>
                <Button onClick={handleDownloadQR} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Custom Campaign Links</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create custom links for specific campaigns or events
              </p>
            </div>
            <Button
              onClick={() => setShowCustomLinkForm(!showCustomLinkForm)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Custom Link
            </Button>
          </div>

          {/* Custom Link Form */}
          {showCustomLinkForm && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4">
                <label htmlFor="campaignName" className="block text-sm font-medium text-slate-700">
                  Campaign Name
                </label>
                <input
                  id="campaignName"
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Spring 2024 Event, Email Campaign"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCustomLink();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreateCustomLink} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Link
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomLinkForm(false);
                    setCampaignName('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Custom Links List */}
          {customLinks.length > 0 ? (
            <div className="space-y-3">
              {customLinks.map((link) => (
                <div
                  key={link.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{link.campaignName}</h3>
                      <code className="mt-1 block break-all text-sm text-slate-600">
                        {link.url}
                      </code>
                    </div>
                    <Button
                      onClick={() => handleCopyLink(link.url)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {copiedLink === link.url ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{link.clicks} clicks</span>
                    <span>{link.conversions} conversions</span>
                    <Button
                      onClick={() => handleShareEmail(link.url)}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </Button>
                    <Button
                      onClick={() => handleShareSMS(link.url)}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      SMS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <QrCode className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">
                No custom links yet. Create one to track campaign performance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
