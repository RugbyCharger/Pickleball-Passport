/**
 * Admin WhatsApp Broadcast Interface
 * US-007: Admin Broadcast Interface
 *
 * Features:
 * - Select destination: specific trip, all active trips, upcoming trips only
 * - Compose message with character count
 * - Preview message before sending
 * - Confirmation modal warning this cannot be undone
 * - Send via WhatsApp Business API
 * - Show success/error feedback after send
 */

'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Users,
  Calendar,
  MapPin,
  Eye,
  ArrowLeft,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type BroadcastDestination = 'specific' | 'all-active' | 'upcoming';

const MAX_MESSAGE_LENGTH = 4096;

export default function AdminWhatsAppBroadcastPage() {
  // Destination selection
  const [destination, setDestination] = useState<BroadcastDestination>('specific');
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  // Message composition
  const [message, setMessage] = useState('');

  // Preview and confirmation
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Result state
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    totalGuests: number;
    successfulSends: number;
    failedSends: number;
    tripName?: string;
    totalTrips?: number;
    errors?: string[];
  } | null>(null);

  // Fetch trips for broadcast selection
  const { data: trips, isLoading: tripsLoading } = trpc.whatsapp.adminGetTripsForBroadcast.useQuery({
    upcomingOnly: destination === 'upcoming',
  });

  // Single trip broadcast mutation
  const sendBroadcastMutation = trpc.whatsapp.adminSendBroadcast.useMutation({
    onSuccess: (result) => {
      setBroadcastResult({
        success: result.success,
        totalGuests: result.totalGuests,
        successfulSends: result.successfulSends,
        failedSends: result.failedSends,
        tripName: result.tripName,
        errors: result.errors,
      });
      setShowConfirmModal(false);
      if (result.success) {
        toast.success(`Broadcast sent to ${result.successfulSends} members`);
      } else {
        toast.error(`Broadcast completed with ${result.failedSends} failures`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send broadcast');
      setShowConfirmModal(false);
    },
  });

  // Multi-trip broadcast mutation
  const sendMultiBroadcastMutation = trpc.whatsapp.adminSendMultiBroadcast.useMutation({
    onSuccess: (result) => {
      setBroadcastResult({
        success: result.success,
        totalGuests: result.totalGuests,
        successfulSends: result.totalSuccessfulSends,
        failedSends: result.totalFailedSends,
        totalTrips: result.totalTrips,
      });
      setShowConfirmModal(false);
      if (result.success) {
        toast.success(
          `Broadcast sent to ${result.totalSuccessfulSends} members across ${result.totalTrips} trips`
        );
      } else {
        toast.error(`Broadcast completed with ${result.totalFailedSends} failures`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send broadcast');
      setShowConfirmModal(false);
    },
  });

  // Computed values
  const characterCount = message.length;
  const characterCountColor = useMemo(() => {
    if (characterCount > MAX_MESSAGE_LENGTH) return 'text-red-600';
    if (characterCount > MAX_MESSAGE_LENGTH * 0.9) return 'text-yellow-600';
    return 'text-gray-500';
  }, [characterCount]);

  const selectedTrip = useMemo(() => {
    if (!selectedTripId || !trips) return null;
    return trips.find((t) => t.id === selectedTripId);
  }, [selectedTripId, trips]);

  const estimatedRecipients = useMemo(() => {
    if (destination === 'specific') {
      return selectedTrip?.joinedCount || 0;
    }
    if (!trips) return 0;
    return trips.reduce((sum, t) => sum + t.joinedCount, 0);
  }, [destination, selectedTrip, trips]);

  const canSend = useMemo(() => {
    if (!message.trim() || characterCount > MAX_MESSAGE_LENGTH) return false;
    if (destination === 'specific' && !selectedTripId) return false;
    if (estimatedRecipients === 0) return false;
    return true;
  }, [message, characterCount, destination, selectedTripId, estimatedRecipients]);

  // Handlers
  const handleSend = () => {
    if (!canSend) return;

    if (destination === 'specific') {
      sendBroadcastMutation.mutate({
        tripId: selectedTripId,
        message: message.trim(),
      });
    } else {
      sendMultiBroadcastMutation.mutate({
        upcomingOnly: destination === 'upcoming',
        message: message.trim(),
      });
    }
  };

  const handleReset = () => {
    setBroadcastResult(null);
    setMessage('');
    setSelectedTripId('');
    setShowPreview(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isSending = sendBroadcastMutation.isPending || sendMultiBroadcastMutation.isPending;

  // Result View
  if (broadcastResult) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          New Broadcast
        </Button>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          {broadcastResult.success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Sent Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your message was delivered to {broadcastResult.successfulSends} of{' '}
                {broadcastResult.totalGuests} recipients
                {broadcastResult.tripName && ` in ${broadcastResult.tripName}`}
                {broadcastResult.totalTrips && ` across ${broadcastResult.totalTrips} trips`}
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Completed with Issues</h2>
              <p className="text-gray-600 mb-4">
                Sent to {broadcastResult.successfulSends} of {broadcastResult.totalGuests} recipients.
                {broadcastResult.failedSends > 0 && ` ${broadcastResult.failedSends} failed.`}
              </p>
              {broadcastResult.errors && broadcastResult.errors.length > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {broadcastResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {broadcastResult.errors.length > 5 && (
                      <li>...and {broadcastResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="mt-6 grid grid-cols-3 gap-4 text-center max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-900">{broadcastResult.totalGuests}</p>
              <p className="text-xs text-gray-500">Total Recipients</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{broadcastResult.successfulSends}</p>
              <p className="text-xs text-gray-500">Delivered</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600">{broadcastResult.failedSends}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>

          <Button onClick={handleReset} className="mt-6 bg-green-600 hover:bg-green-700">
            Send Another Broadcast
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Broadcast</h1>
        <p className="mt-2 text-gray-600">
          Send messages to guests in WhatsApp groups. Messages are sent individually to each member.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-800">Important</p>
          <p className="text-sm text-yellow-700">
            Broadcasts are sent as individual WhatsApp messages to each group member. This cannot be
            undone. Please review your message carefully before sending.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Destination Selection */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-600" />
              Select Destination
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="destination"
                  value="specific"
                  checked={destination === 'specific'}
                  onChange={() => setDestination('specific')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Specific Trip</p>
                  <p className="text-sm text-gray-500">Send to members of a single trip group</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="destination"
                  value="all-active"
                  checked={destination === 'all-active'}
                  onChange={() => setDestination('all-active')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">All Active Trips</p>
                  <p className="text-sm text-gray-500">Send to all trips with active WhatsApp groups</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="destination"
                  value="upcoming"
                  checked={destination === 'upcoming'}
                  onChange={() => setDestination('upcoming')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Upcoming Trips Only</p>
                  <p className="text-sm text-gray-500">Send to active groups for trips that have not started yet</p>
                </div>
              </label>
            </div>

            {/* Trip Selector (for specific trip option) */}
            {destination === 'specific' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Trip</label>
                {tripsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  </div>
                ) : !trips || trips.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No trips with active WhatsApp groups</p>
                ) : (
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select a trip...</option>
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.name} - {trip.destination} ({trip.joinedCount} members)
                      </option>
                    ))}
                  </select>
                )}

                {selectedTrip && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      {selectedTrip.destination}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 mt-1">
                      <Users className="h-4 w-4" />
                      {selectedTrip.joinedCount} members in WhatsApp group
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Compose Message
            </h2>

            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
              />

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  Use emojis to make your message more engaging!
                </div>
                <div className={cn('font-medium', characterCountColor)}>
                  {characterCount} / {MAX_MESSAGE_LENGTH}
                </div>
              </div>

              {characterCount > MAX_MESSAGE_LENGTH && (
                <p className="text-sm text-red-600">
                  Message is too long. Please shorten it by {characterCount - MAX_MESSAGE_LENGTH} characters.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!message.trim()}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>

            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={!canSend || isSending}
              className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Broadcast
            </Button>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Broadcast Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Destination</span>
                <span className="font-medium">
                  {destination === 'specific' && 'Single Trip'}
                  {destination === 'all-active' && 'All Active'}
                  {destination === 'upcoming' && 'Upcoming Only'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Recipients</span>
                <span className="font-medium text-green-600">{estimatedRecipients}</span>
              </div>
              {destination !== 'specific' && trips && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trips</span>
                  <span className="font-medium">{trips.length}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Message Length</span>
                <span className={cn('font-medium', characterCountColor)}>{characterCount} chars</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">Tips</h3>
            <ul className="text-xs text-green-800 space-y-1">
              <li>Keep messages concise and mobile-friendly</li>
              <li>Use emojis sparingly for engagement</li>
              <li>Include relevant trip info when applicable</li>
              <li>Avoid sending too frequently (respect your guests)</li>
            </ul>
          </div>

          {/* Active Trips List (for all/upcoming options) */}
          {destination !== 'specific' && trips && trips.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Will Send To ({trips.length} trips)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {trips.map((trip) => (
                  <div key={trip.id} className="text-xs p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900">{trip.name}</p>
                    <p className="text-gray-500">
                      {trip.destination} - {trip.joinedCount} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Preview</h3>

            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-1">The Pickleball Passport</p>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              This is how your message will appear in WhatsApp. It will be sent to{' '}
              <strong>{estimatedRecipients}</strong> recipient(s).
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  setShowConfirmModal(true);
                }}
                disabled={!canSend}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 rounded-full p-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Broadcast</h3>
            </div>

            <p className="text-gray-600 mb-4">
              You are about to send a WhatsApp message to <strong>{estimatedRecipients}</strong>{' '}
              recipient(s)
              {destination === 'specific' && selectedTrip && (
                <> in the <strong>{selectedTrip.name}</strong> trip</>
              )}
              {destination !== 'specific' && trips && (
                <> across <strong>{trips.length}</strong> trips</>
              )}
              .
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. Messages will be sent
                immediately to all recipients.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Confirm & Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
