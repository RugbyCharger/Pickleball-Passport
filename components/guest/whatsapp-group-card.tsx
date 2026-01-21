'use client';

/**
 * WhatsApp Group Card Component
 * E11-S10: WhatsApp Group Chat Integration
 *
 * Displays WhatsApp group information for a guest's trip booking.
 * Features:
 * - Join button that opens WhatsApp group invite link
 * - QR code for mobile scanning
 * - Member count and group status
 * - Click tracking to update whatsappGroupJoinedAt
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle, Users, QrCode, ExternalLink, Check, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface WhatsAppGroupCardProps {
  bookingId: string;
}

export function WhatsAppGroupCard({ bookingId }: WhatsAppGroupCardProps) {
  const [showQR, setShowQR] = useState(false);

  // Fetch WhatsApp group info
  const { data: groupInfo, isLoading, error, refetch } = trpc.whatsapp.getGuestWhatsAppGroup.useQuery(
    { bookingId },
    {
      retry: false, // Don't retry on failure
    }
  );

  // Mutation to mark as joined
  const markJoinedMutation = trpc.whatsapp.markGroupJoined.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handle join button click
  const handleJoinClick = () => {
    if (!groupInfo?.inviteLink) return;

    // Track the click (mark as joined)
    if (!groupInfo.hasJoined) {
      markJoinedMutation.mutate({ bookingId });
    }

    // Open WhatsApp link in new tab
    window.open(groupInfo.inviteLink, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Error state or no group available - don't show the card
  if (error || !groupInfo) {
    return null;
  }

  // Format dates
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Group</CardTitle>
              <CardDescription>{groupInfo.tripName}</CardDescription>
            </div>
          </div>
          {groupInfo.hasJoined && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800">
              <Check className="h-3 w-3 mr-1" />
              Joined
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trip Info */}
        <div className="text-sm text-muted-foreground">
          <p>
            {groupInfo.destination} &bull; {formatDate(groupInfo.startDate)} -{' '}
            {formatDate(groupInfo.endDate)}
          </p>
        </div>

        {/* Member Count */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {groupInfo.memberCount}{' '}
            {groupInfo.memberCount === 1 ? 'member' : 'members'} in group
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleJoinClick}
            disabled={markJoinedMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {markJoinedMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            {groupInfo.hasJoined ? 'Open WhatsApp Group' : 'Join WhatsApp Group'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowQR(!showQR)}
            className="sm:w-auto"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="flex flex-col items-center gap-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code with your phone to join the group
            </p>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG
                value={groupInfo.inviteLink}
                size={160}
                level="M"
                includeMargin
              />
            </div>
          </div>
        )}

        {/* Instructions for non-joined users */}
        {!groupInfo.hasJoined && (
          <p className="text-xs text-muted-foreground">
            Connect with fellow travelers before your trip. Click the button
            above to join the WhatsApp group.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
