'use client';

/**
 * Document Upload Center
 * E5-S6: Document Upload Center (5 pts)
 *
 * Features:
 * - Drag & drop file upload
 * - Document type categorization
 * - File validation (type, size, format)
 * - Supabase Storage integration
 * - Document status tracking
 * - Document list view with filters
 */

import { useState } from 'react';
import type { ComponentType } from 'react';
import { useUser } from '@clerk/nextjs';
import { trpc } from '@/lib/trpc/client';
import { uploadFile, validateFile, FILE_VALIDATION } from '@/lib/storage/supabase';
import {
  FileText,
  Upload,
  Check,
  X,
  Clock,
  AlertCircle,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';

type DocumentType = 'PASSPORT' | 'MEDICAL_FORM' | 'INSURANCE' | 'VISA' | 'OTHER';
type DocumentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PASSPORT: 'Passport',
  MEDICAL_FORM: 'Medical Form',
  INSURANCE: 'Insurance',
  VISA: 'Visa',
  OTHER: 'Other',
};

type StatusIcon = ComponentType<{ className?: string }>;

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; icon: StatusIcon; color: string }
> = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50',
  },
  APPROVED: {
    label: 'Approved',
    icon: Check,
    color: 'text-green-600 bg-green-50',
  },
  REJECTED: {
    label: 'Rejected',
    icon: X,
    color: 'text-red-600 bg-red-50',
  },
  EXPIRED: {
    label: 'Expired',
    icon: AlertCircle,
    color: 'text-gray-600 bg-gray-50',
  },
};

export default function DocumentsPage() {
  const { user, isLoaded } = useUser();
  const [selectedType, setSelectedType] = useState<DocumentType>('PASSPORT');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'ALL'>('ALL');

  // tRPC queries
  const { data: documents = [], refetch } = trpc.document.list.useQuery({
    ...(filterStatus !== 'ALL' && { status: filterStatus }),
  });
  const { data: counts } = trpc.document.getCounts.useQuery();

  // tRPC mutations
  const createDocument = trpc.document.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteDocument = trpc.document.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // SECURITY: Ensure user is authenticated before uploading
    if (!isLoaded || !user?.id) {
      alert('Please sign in to upload documents');
      return;
    }

    setUploading(true);

    try {
      // Get authenticated user ID from Clerk
      const userId = user.id;

      // Upload to Supabase Storage
      const { url } = await uploadFile(file, userId, selectedType);

      // Create document record in database
      await createDocument.mutateAsync({
        type: selectedType,
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      });

      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument.mutateAsync({ id });
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
        <p className="mt-2 text-gray-600">
          Upload and manage your travel documents
        </p>
      </div>

      {/* Document Stats */}
      {counts && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Documents</div>
            <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <div className="text-sm text-yellow-800">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-900">
              {counts.pending}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-800">Approved</div>
            <div className="text-2xl font-bold text-green-900">
              {counts.approved}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-sm text-red-800">Rejected</div>
            <div className="text-2xl font-bold text-red-900">
              {counts.rejected}
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload New Document
        </h2>

        {/* Document Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {DOCUMENT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            onChange={handleFileSelect}
            accept={FILE_VALIDATION.ALLOWED_EXTENSIONS.join(',')}
            disabled={uploading}
          />

          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to upload
          </label>
          <span className="text-gray-600"> or drag and drop</span>

          <p className="mt-2 text-sm text-gray-500">
            PDF, JPG, PNG, HEIC up to 5MB
          </p>

          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-900 font-medium">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Documents ({documents.length})
          </h2>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as DocumentStatus | 'ALL'
                )
              }
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No documents uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload your first document to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const StatusIcon = STATUS_CONFIG[doc.status].icon;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-10 w-10 text-gray-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.fileName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                      </div>
                      {doc.booking && (
                        <p className="text-sm text-gray-500 mt-1">
                          Booking: {doc.booking.bookingReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[doc.status].color}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {STATUS_CONFIG[doc.status].label}
                    </div>

                    {/* Actions */}
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Required Documents for Travel
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Passport:</strong> Valid for at least 6 months from travel
              date
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Medical Form:</strong> Completed health questionnaire and
              medical history
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Insurance:</strong> Travel and medical insurance coverage
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
