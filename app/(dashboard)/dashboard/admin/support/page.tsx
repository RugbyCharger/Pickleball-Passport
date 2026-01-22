/**
 * Admin Support Dashboard
 * US-003: Support Ticket Admin Dashboard
 *
 * Features:
 * - View all support tickets with filters
 * - Ticket detail view with replies
 * - Reply to tickets
 * - Update ticket status
 * - Assign tickets to admins
 * - Search functionality
 */

'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketSource,
} from '@prisma/client';
import {
  Search,
  Filter,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Send,
  ChevronDown,
  Copy,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterStatus = TicketStatus | 'ALL';
type FilterPriority = TicketPriority | 'ALL';
type FilterSource = TicketSource | 'ALL';
type FilterCategory = TicketCategory | 'ALL';

// Type for ticket detail with relations (workaround for tRPC type inference)
type TicketDetailWithRelations = {
  id: string;
  referenceNumber: string;
  subject: string;
  message: string;
  category: TicketCategory;
  source: TicketSource;
  status: TicketStatus;
  priority: TicketPriority;
  email: string;
  name: string | null;
  phone: string | null;
  userId: string | null;
  bookingId: string | null;
  assignedToId: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  replies: Array<{
    id: string;
    message: string;
    isAdminReply: boolean;
    createdAt: Date;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
    } | null;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  booking: {
    id: string;
    bookingReference: string;
    status: string;
    createdAt: Date;
    package: { name: string } | null;
  } | null;
};

export default function AdminSupportPage() {
  // Filter states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('ALL');
  const [sourceFilter, setSourceFilter] = useState<FilterSource>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail view state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Build query filters
  const queryFilters = useMemo(() => {
    const filters: Record<string, string | undefined> = {};
    if (statusFilter !== 'ALL') filters.status = statusFilter;
    if (priorityFilter !== 'ALL') filters.priority = priorityFilter;
    if (sourceFilter !== 'ALL') filters.source = sourceFilter;
    if (categoryFilter !== 'ALL') filters.category = categoryFilter;
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    return filters;
  }, [statusFilter, priorityFilter, sourceFilter, categoryFilter, searchQuery, dateFrom, dateTo]);

  // Fetch tickets
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = trpc.support.adminGetTickets.useQuery(queryFilters);

  // Fetch counts
  const { data: counts } = trpc.support.adminGetCounts.useQuery();

  // Fetch ticket detail
  const {
    data: ticketDetailRaw,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = trpc.support.adminGetTicketDetail.useQuery(
    { id: selectedTicketId! },
    { enabled: !!selectedTicketId }
  );
  // Cast to proper type (workaround for tRPC type inference with Prisma includes)
  const ticketDetail = ticketDetailRaw as TicketDetailWithRelations | undefined;

  // Fetch admin users for assignment
  const { data: adminUsers } = trpc.support.adminGetAdminUsers.useQuery();

  // Mutations
  const replyMutation = trpc.support.adminReplyToTicket.useMutation({
    onSuccess: () => {
      toast.success('Reply sent successfully');
      setReplyMessage('');
      refetchDetail();
      refetchTickets();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reply');
    },
  });

  const updateStatusMutation = trpc.support.adminUpdateTicketStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated');
      refetchDetail();
      refetchTickets();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const assignMutation = trpc.support.adminAssignTicket.useMutation({
    onSuccess: () => {
      toast.success('Ticket assigned');
      refetchDetail();
      refetchTickets();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign ticket');
    },
  });

  // Handlers
  const handleReply = () => {
    if (!selectedTicketId || !replyMessage.trim()) return;
    replyMutation.mutate({
      ticketId: selectedTicketId,
      message: replyMessage.trim(),
    });
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!selectedTicketId) return;
    updateStatusMutation.mutate({
      ticketId: selectedTicketId,
      status,
    });
  };

  const handleAssign = (assignedToId: string | null) => {
    if (!selectedTicketId) return;
    assignMutation.mutate({
      ticketId: selectedTicketId,
      assignedToId,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Helper functions
  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: TicketPriority) => {
    switch (priority) {
      case 'LOW':
        return <ChevronDown className="h-4 w-4 text-gray-500" />;
      case 'NORMAL':
        return null;
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'NORMAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getSourceLabel = (source: TicketSource) => {
    switch (source) {
      case 'WEBSITE_CONTACT':
        return 'Website';
      case 'GUEST_DASHBOARD':
        return 'Guest Portal';
      case 'ADMIN_CREATED':
        return 'Admin';
      case 'EMAIL':
        return 'Email';
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Detail View
  if (selectedTicketId) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedTicketId(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Button>

        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : ticketDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Header */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => copyToClipboard(ticketDetail.referenceNumber)}
                        className="text-sm font-mono text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        title="Copy reference number"
                      >
                        {ticketDetail.referenceNumber}
                        <Copy className="h-3 w-3" />
                      </button>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getStatusColor(ticketDetail.status)
                        )}
                      >
                        {getStatusIcon(ticketDetail.status)}
                        {ticketDetail.status.replace('_', ' ')}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getPriorityColor(ticketDetail.priority)
                        )}
                      >
                        {getPriorityIcon(ticketDetail.priority)}
                        {ticketDetail.priority}
                      </span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {ticketDetail.subject}
                    </h1>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticketDetail.message}</p>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(ticketDetail.createdAt)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                    {getCategoryLabel(ticketDetail.category)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                    {getSourceLabel(ticketDetail.source)}
                  </span>
                </div>
              </div>

              {/* Replies */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversation ({ticketDetail.replies.length} replies)
                </h2>

                {ticketDetail.replies.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No replies yet</p>
                ) : (
                  <div className="space-y-4">
                    {ticketDetail.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={cn(
                          'p-4 rounded-lg',
                          reply.isAdminReply
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-gray-200'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {reply.user
                              ? `${reply.user.firstName || ''} ${reply.user.lastName || ''}`.trim() ||
                                'Unknown'
                              : 'Unknown'}
                            {reply.isAdminReply && (
                              <span className="ml-2 text-xs text-blue-600 font-normal">
                                (Staff)
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Reply</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleReply}
                      disabled={!replyMessage.trim() || replyMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {replyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{ticketDetail.name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${ticketDetail.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {ticketDetail.email}
                    </a>
                  </div>
                  {ticketDetail.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{ticketDetail.phone}</span>
                    </div>
                  )}
                  {ticketDetail.user && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-xs text-gray-500">Registered User</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Booking */}
              {ticketDetail.booking && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Booking</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-gray-900">
                        {ticketDetail.booking.bookingReference}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="text-gray-900">{ticketDetail.booking.package?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-gray-900">{ticketDetail.booking.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-3">
                  {/* Status Buttons */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Update Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ticketDetail.status !== 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange('IN_PROGRESS')}
                          disabled={updateStatusMutation.isPending}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Button>
                      )}
                      {ticketDetail.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange('RESOLVED')}
                          disabled={updateStatusMutation.isPending}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      {ticketDetail.status !== 'CLOSED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange('CLOSED')}
                          disabled={updateStatusMutation.isPending}
                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Assignment */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={ticketDetail.assignedToId || ''}
                      onChange={(e) => handleAssign(e.target.value || null)}
                      disabled={assignMutation.isPending}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {adminUsers?.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {ticketDetail.resolvedAt && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{formatDate(ticketDetail.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Resolved:</span>
                      <span className="text-gray-900">{formatDate(ticketDetail.resolvedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Ticket not found</div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="mt-2 text-gray-600">Manage and respond to support requests</p>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{counts.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{counts.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{counts.closed}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-red-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{counts.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              type="text"
              placeholder="Name, email, reference..."
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as FilterSource)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Sources</option>
              <option value="WEBSITE_CONTACT">Website</option>
              <option value="GUEST_DASHBOARD">Guest Portal</option>
              <option value="ADMIN_CREATED">Admin</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL_INQUIRY">General Inquiry</option>
              <option value="BOOKING_QUESTION">Booking Question</option>
              <option value="MEDICAL_WELLNESS_QUESTION">Medical/Wellness</option>
              <option value="PAYMENT_ISSUE">Payment Issue</option>
              <option value="PARTNERSHIP_INQUIRY">Partnership</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              From Date
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setSourceFilter('ALL');
                setCategoryFilter('ALL');
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {ticketsLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        ) : !ticketsData?.tickets || ticketsData.tickets.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
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
                {ticketsData.tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-blue-600 font-mono">
                          {ticket.referenceNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{ticket.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{ticket.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getStatusColor(ticket.status)
                        )}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getPriorityColor(ticket.priority)
                        )}
                      >
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {ticket.assignedTo
                          ? ticket.assignedTo.email
                          : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ticket._count.replies > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket._count.replies}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(ticket.id);
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
      {ticketsData && ticketsData.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {ticketsData.tickets.length} of {ticketsData.total} tickets
        </div>
      )}
    </div>
  );
}
