/**
 * Admin Document Review Interface
 * A1-S1: Document Review Interface (5 pts)
 *
 * Features:
 * - View all uploaded documents
 * - Filter by status, type, user
 * - Approve/reject documents with notes
 * - Bulk actions
 * - Document inline preview
 * - Email notifications on approval/rejection
 */

'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { DocumentStatus, DocumentType } from '@prisma/client';
import {
  FileCheck,
  FileX,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FilterStatus = DocumentStatus | 'ALL';
type FilterType = DocumentType | 'ALL';

export default function AdminDocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('PENDING_REVIEW');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);

  // Fetch documents with filters
  const { data, isLoading, refetch } = trpc.admin.documents.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
  });

  // Fetch counts
  const { data: counts } = trpc.admin.documents.getCounts.useQuery();

  // Mutations
  const approveMutation = trpc.admin.documents.approve.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDocuments(new Set());
    },
  });

  const rejectMutation = trpc.admin.documents.reject.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDocuments(new Set());
    },
  });

  const bulkApproveMutation = trpc.admin.documents.bulkApprove.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDocuments(new Set());
    },
  });

  const handleApprove = async (documentId: string, notes?: string) => {
    await approveMutation.mutateAsync({ documentId, notes });
  };

  const handleReject = async (documentId: string) => {
    const notes = prompt('Please provide a reason for rejection:');
    if (!notes) return;

    await rejectMutation.mutateAsync({ documentId, notes });
  };

  const handleBulkApprove = async () => {
    if (selectedDocuments.size === 0) return;

    const notes = prompt('Optional notes for all documents (leave blank for none):');
    await bulkApproveMutation.mutateAsync({
      documentIds: Array.from(selectedDocuments),
      notes: notes || undefined,
    });
  };

  const toggleSelectDocument = (id: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedDocuments(newSelection);
  };

  const toggleSelectAll = () => {
    if (!data?.documents) return;

    if (selectedDocuments.size === data.documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(data.documents.map((doc) => doc.id)));
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDocumentType = (type: DocumentType) => {
    return type.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
        <p className="mt-2 text-gray-600">
          Review and approve guest documents for trip preparation
        </p>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="PASSPORT">Passport</option>
              <option value="MEDICAL_FORM">Medical Form</option>
              <option value="INSURANCE">Insurance</option>
              <option value="VISA">Visa</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by filename, booking reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {selectedDocuments.size} document(s) selected
              </span>
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {bulkApproveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected
                  </>
                )}
              </Button>
              <Button
                onClick={() => setSelectedDocuments(new Set())}
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : !data?.documents || data.documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No documents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.size === data.documents.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleSelectDocument(doc.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.booking?.user.guestProfile
                            ? `${doc.booking.user.guestProfile.firstName} ${doc.booking.user.guestProfile.lastName}`
                            : 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{doc.booking?.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {formatDocumentType(doc.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                          getStatusColor(doc.status)
                        )}
                      >
                        {getStatusIcon(doc.status)}
                        {doc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      {doc.status === 'PENDING_REVIEW' && (
                        <>
                          <Button
                            onClick={() => handleApprove(doc.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>

                          <Button
                            onClick={() => handleReject(doc.id)}
                            disabled={rejectMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {data && data.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {data.documents.length} of {data.total} documents
        </div>
      )}
    </div>
  );
}
