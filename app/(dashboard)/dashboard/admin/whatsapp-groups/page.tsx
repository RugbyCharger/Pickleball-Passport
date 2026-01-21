/**
 * Admin WhatsApp Groups Management
 * US-006: Admin WhatsApp Groups Management
 *
 * Features:
 * - List all trips with their WhatsApp group status
 * - Filter by status (Pending, Active, Archived)
 * - View group details with member list
 * - Manually set invite link for a trip
 * - Archive/activate groups
 * - Refresh invite links
 */

'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { WhatsAppGroupStatus } from '@prisma/client';
import {
  Search,
  Filter,
  Loader2,
  Users,
  Clock,
  CheckCircle,
  Archive,
  ArrowLeft,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  RefreshCw,
  Play,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterStatus = WhatsAppGroupStatus | 'ALL';

export default function AdminWhatsAppGroupsPage() {
  // Filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail view state
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Modal states
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [inviteLinkInput, setInviteLinkInput] = useState('');
  const [inviteLinkTripId, setInviteLinkTripId] = useState<string | null>(null);

  // Build query filters
  const queryFilters = useMemo(() => {
    const filters: { status?: WhatsAppGroupStatus; search?: string } = {};
    if (statusFilter !== 'ALL') filters.status = statusFilter;
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [statusFilter, searchQuery]);

  // Fetch trips with WhatsApp group info
  const {
    data: tripsData,
    isLoading: tripsLoading,
    refetch: refetchTrips,
  } = trpc.whatsapp.adminGetWhatsAppGroups.useQuery(queryFilters);

  // Fetch counts
  const { data: counts } = trpc.whatsapp.adminGetWhatsAppGroupCounts.useQuery();

  // Fetch trip detail
  const {
    data: tripDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = trpc.whatsapp.adminGetWhatsAppGroupDetails.useQuery(
    { tripId: selectedTripId! },
    { enabled: !!selectedTripId }
  );

  // Mutations
  const setInviteLinkMutation = trpc.whatsapp.adminSetGroupInviteLink.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setShowInviteLinkModal(false);
      setInviteLinkInput('');
      setInviteLinkTripId(null);
      refetchTrips();
      if (selectedTripId) refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to set invite link');
    },
  });

  const archiveGroupMutation = trpc.whatsapp.adminArchiveGroup.useMutation({
    onSuccess: () => {
      toast.success('WhatsApp group archived');
      refetchTrips();
      if (selectedTripId) refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to archive group');
    },
  });

  const activateGroupMutation = trpc.whatsapp.adminActivateGroup.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      refetchTrips();
      if (selectedTripId) refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate group');
    },
  });

  const refreshLinkMutation = trpc.whatsapp.adminRefreshInviteLink.useMutation({
    onSuccess: () => {
      toast.success('Invite link updated');
      setShowInviteLinkModal(false);
      setInviteLinkInput('');
      setInviteLinkTripId(null);
      refetchTrips();
      if (selectedTripId) refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update invite link');
    },
  });

  // Handlers
  const handleSetInviteLink = () => {
    if (!inviteLinkTripId || !inviteLinkInput.trim()) return;

    // Check if this is updating an existing link
    const trip = tripsData?.trips.find((t) => t.id === inviteLinkTripId);
    if (trip?.whatsappGroupInviteLink) {
      refreshLinkMutation.mutate({
        tripId: inviteLinkTripId,
        newInviteLink: inviteLinkInput.trim(),
      });
    } else {
      setInviteLinkMutation.mutate({
        tripId: inviteLinkTripId,
        inviteLink: inviteLinkInput.trim(),
      });
    }
  };

  const handleArchive = (tripId: string) => {
    if (confirm('Are you sure you want to archive this WhatsApp group? This action can be undone.')) {
      archiveGroupMutation.mutate({ tripId });
    }
  };

  const handleActivate = (tripId: string) => {
    activateGroupMutation.mutate({ tripId });
  };

  const openInviteLinkModal = (tripId: string, existingLink?: string | null) => {
    setInviteLinkTripId(tripId);
    setInviteLinkInput(existingLink || '');
    setShowInviteLinkModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Helper functions
  const getStatusIcon = (status: WhatsAppGroupStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ARCHIVED':
        return <Archive className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: WhatsAppGroupStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInvitationStatusColor = (status: string | null) => {
    switch (status) {
      case 'joined':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Detail View
  if (selectedTripId) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedTripId(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </Button>

        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : tripDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Header */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getStatusColor(tripDetail.whatsappGroupStatus)
                        )}
                      >
                        {getStatusIcon(tripDetail.whatsappGroupStatus)}
                        {tripDetail.whatsappGroupStatus}
                      </span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">{tripDetail.name}</h1>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {tripDetail.destination}
                    </p>
                  </div>
                  <MessageCircle className="h-10 w-10 text-green-500" />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Trip Dates</span>
                    <p className="font-medium">
                      {formatDate(tripDetail.startDate)} - {formatDate(tripDetail.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Confirmed Bookings</span>
                    <p className="font-medium">{tripDetail.confirmedBookings}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Group Members</span>
                    <p className="font-medium">{tripDetail.whatsappGroupMemberCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Group Created</span>
                    <p className="font-medium">{formatDateTime(tripDetail.whatsappGroupCreatedAt)}</p>
                  </div>
                </div>

                {/* Invite Link Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Invite Link
                  </label>
                  {tripDetail.whatsappGroupInviteLink ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono truncate">
                        {tripDetail.whatsappGroupInviteLink}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(tripDetail.whatsappGroupInviteLink!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(tripDetail.whatsappGroupInviteLink!, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openInviteLinkModal(tripDetail.id, tripDetail.whatsappGroupInviteLink)
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">No invite link set</span>
                      <Button
                        size="sm"
                        onClick={() => openInviteLinkModal(tripDetail.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Set Invite Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Members ({tripDetail.members.length})
                </h2>

                {tripDetail.members.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No confirmed bookings yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Guest
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Contact
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Invitation Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tripDetail.members.map((member) => (
                          <tr key={member.bookingId}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {member.firstName || member.lastName
                                  ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                                  : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Booked: {formatDate(member.bookingCreatedAt)}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm space-y-1">
                                <p className="flex items-center gap-1 text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </p>
                                {member.phone && (
                                  <p className="flex items-center gap-1 text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    {member.phone}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-flex px-2 py-1 rounded text-xs font-medium',
                                  getInvitationStatusColor(member.invitationStatus)
                                )}
                              >
                                {member.invitationStatus || 'pending'}
                              </span>
                              {member.invitationSentAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Sent: {formatDateTime(member.invitationSentAt)}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {member.joinedAt ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    Joined
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {formatDateTime(member.joinedAt)}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">Not yet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-3">
                  {tripDetail.whatsappGroupStatus === 'PENDING' && tripDetail.whatsappGroupInviteLink && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleActivate(tripDetail.id)}
                      disabled={activateGroupMutation.isPending}
                    >
                      {activateGroupMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Activate Group
                    </Button>
                  )}

                  {tripDetail.whatsappGroupStatus === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      className="w-full text-gray-600 border-gray-300"
                      onClick={() => handleArchive(tripDetail.id)}
                      disabled={archiveGroupMutation.isPending}
                    >
                      {archiveGroupMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Archive className="h-4 w-4 mr-2" />
                      )}
                      Archive Group
                    </Button>
                  )}

                  {tripDetail.whatsappGroupStatus === 'ARCHIVED' && tripDetail.whatsappGroupInviteLink && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleActivate(tripDetail.id)}
                      disabled={activateGroupMutation.isPending}
                    >
                      {activateGroupMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Reactivate Group
                    </Button>
                  )}

                  {!tripDetail.whatsappGroupInviteLink && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => openInviteLinkModal(tripDetail.id)}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Set Invite Link
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invitations Sent</span>
                    <span className="font-medium">
                      {tripDetail.members.filter((m) => m.invitationStatus === 'sent' || m.invitationStatus === 'joined').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members Joined</span>
                    <span className="font-medium text-green-600">
                      {tripDetail.members.filter((m) => m.joinedAt).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Invites</span>
                    <span className="font-medium text-yellow-600">
                      {tripDetail.members.filter((m) => !m.invitationStatus || m.invitationStatus === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Trip not found</div>
        )}

        {/* Invite Link Modal */}
        {showInviteLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tripDetail?.whatsappGroupInviteLink ? 'Update Invite Link' : 'Set Invite Link'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the WhatsApp group invite link. Create a group in WhatsApp first, then copy the
                invite link here.
              </p>
              <Input
                type="url"
                placeholder="https://chat.whatsapp.com/..."
                value={inviteLinkInput}
                onChange={(e) => setInviteLinkInput(e.target.value)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteLinkModal(false);
                    setInviteLinkInput('');
                    setInviteLinkTripId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetInviteLink}
                  disabled={
                    !inviteLinkInput.trim() ||
                    !inviteLinkInput.startsWith('https://chat.whatsapp.com/') ||
                    setInviteLinkMutation.isPending ||
                    refreshLinkMutation.isPending
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {setInviteLinkMutation.isPending || refreshLinkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
        <p className="mt-2 text-gray-600">Manage WhatsApp group chats for trips</p>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{counts.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-600">{counts.archived}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              type="text"
              placeholder="Trip name, destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {tripsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading trips...</p>
          </div>
        ) : !tripsData?.trips || tripsData.trips.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripsData.trips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{trip.name}</p>
                        <p className="text-xs text-gray-500">{trip.destination}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getStatusColor(trip.whatsappGroupStatus)
                        )}
                      >
                        {getStatusIcon(trip.whatsappGroupStatus)}
                        {trip.whatsappGroupStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-green-600">
                          {trip.whatsappGroupMemberCount}
                        </span>
                        <span className="text-gray-500"> / {trip.confirmedBookings} bookings</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {trip.whatsappGroupCreatedAt ? formatDate(trip.whatsappGroupCreatedAt) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!trip.whatsappGroupInviteLink && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              openInviteLinkModal(trip.id);
                            }}
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Add Link
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTripId(trip.id);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {tripsData && tripsData.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {tripsData.trips.length} of {tripsData.total} trips
        </div>
      )}

      {/* Invite Link Modal (for list view) */}
      {showInviteLinkModal && !selectedTripId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Invite Link</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the WhatsApp group invite link. Create a group in WhatsApp first, then copy the
              invite link here.
            </p>
            <Input
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={inviteLinkInput}
              onChange={(e) => setInviteLinkInput(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteLinkModal(false);
                  setInviteLinkInput('');
                  setInviteLinkTripId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetInviteLink}
                disabled={
                  !inviteLinkInput.trim() ||
                  !inviteLinkInput.startsWith('https://chat.whatsapp.com/') ||
                  setInviteLinkMutation.isPending
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {setInviteLinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
