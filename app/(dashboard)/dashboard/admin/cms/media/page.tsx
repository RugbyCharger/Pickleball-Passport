/**
 * Admin Media Library
 * Story 12-6: Media Library
 *
 * Features:
 * - View all media assets with filtering by type, folder, tags
 * - Upload images and videos with drag-and-drop
 * - Folder organization with create, rename, delete
 * - Image preview with metadata editing
 * - Copy URL to clipboard
 * - Bulk actions for move/delete
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Upload,
  Copy,
  Check,
  X,
  ChevronRight,
  MoreVertical,
  FolderOpen,
  Download,
  Move,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type MediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

const TYPE_ICONS: Record<MediaAssetType, React.ReactNode> = {
  IMAGE: <ImageIcon className="h-5 w-5" />,
  VIDEO: <Video className="h-5 w-5" />,
  DOCUMENT: <FileText className="h-5 w-5" />,
};

const TYPE_COLORS: Record<MediaAssetType, string> = {
  IMAGE: 'bg-emerald-100 text-emerald-700',
  VIDEO: 'bg-purple-100 text-purple-700',
  DOCUMENT: 'bg-blue-100 text-blue-700',
};

const TYPE_LABELS: Record<MediaAssetType, string> = {
  IMAGE: 'Images',
  VIDEO: 'Videos',
  DOCUMENT: 'Documents',
};

// File size formatter
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function MediaLibraryPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaAssetType | 'ALL'>('ALL');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: assetsData, isLoading: assetsLoading, refetch: refetchAssets } = trpc.media.getAssets.useQuery({
    folderId: currentFolderId,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    search: searchQuery || undefined,
  });

  const { data: folders, refetch: refetchFolders } = trpc.media.getFolders.useQuery({
    parentId: currentFolderId,
    includeAssetCount: true,
  });

  const { data: stats } = trpc.media.getStats.useQuery();

  const { data: allTags } = trpc.media.getAllTags.useQuery();

  // Mutations
  const getUploadUrlMutation = trpc.media.getUploadUrl.useMutation();
  const createAssetMutation = trpc.media.createAsset.useMutation();
  const updateAssetMutation = trpc.media.updateAsset.useMutation();
  const deleteAssetMutation = trpc.media.deleteAsset.useMutation();
  const deleteAssetsMutation = trpc.media.deleteAssets.useMutation();
  const moveAssetsMutation = trpc.media.moveAssets.useMutation();
  const createFolderMutation = trpc.media.createFolder.useMutation();
  const deleteFolderMutation = trpc.media.deleteFolder.useMutation();

  const assets = assetsData?.assets || [];
  const totalAssets = assetsData?.total || 0;

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Get presigned URL
        const uploadData = await getUploadUrlMutation.mutateAsync({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          folderId: currentFolderId || undefined,
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 30 }));

        // Upload to S3 (or mock in dev)
        if (!uploadData.mockUpload) {
          await fetch(uploadData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });
        }

        setUploadProgress((prev) => ({ ...prev, [file.name]: 70 }));

        // Get image dimensions if applicable
        let width: number | undefined;
        let height: number | undefined;

        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        }

        // Create asset record
        await createAssetMutation.mutateAsync({
          filename: file.name,
          url: uploadData.publicUrl,
          mimeType: file.type,
          size: file.size,
          width,
          height,
          folderId: currentFolderId || undefined,
          s3Key: uploadData.s3Key,
          s3Bucket: uploadData.s3Bucket,
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress({});
    setShowUploadModal(false);
    refetchAssets();
  }, [currentFolderId, getUploadUrlMutation, createAssetMutation, refetchAssets]);

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      alert('Failed to copy URL');
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const slug = newFolderName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await createFolderMutation.mutateAsync({
        name: newFolderName,
        slug,
        parentId: currentFolderId || undefined,
      });

      setNewFolderName('');
      setShowFolderModal(false);
      refetchFolders();
    } catch (error: any) {
      alert(error.message || 'Failed to create folder');
    }
  };

  // Delete asset
  const handleDeleteAsset = async (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;

    try {
      await deleteAssetMutation.mutateAsync({ id });
      refetchAssets();
    } catch (error: any) {
      alert(error.message || 'Failed to delete asset');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return;
    if (!confirm(`Delete ${selectedAssets.length} selected items? This cannot be undone.`)) return;

    try {
      await deleteAssetsMutation.mutateAsync({ ids: selectedAssets });
      setSelectedAssets([]);
      refetchAssets();
    } catch (error: any) {
      alert(error.message || 'Failed to delete assets');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (id: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? Assets will be moved to root.`)) return;

    try {
      await deleteFolderMutation.mutateAsync({ id });
      refetchFolders();
    } catch (error: any) {
      alert(error.message || 'Failed to delete folder');
    }
  };

  // Toggle asset selection
  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  // Update asset
  const handleUpdateAsset = async () => {
    if (!editingAsset) return;

    try {
      await updateAssetMutation.mutateAsync({
        id: editingAsset.id,
        alt: editingAsset.alt || null,
        title: editingAsset.title || null,
        caption: editingAsset.caption || null,
        tags: editingAsset.tags || [],
      });
      setShowEditAssetModal(false);
      setEditingAsset(null);
      refetchAssets();
    } catch (error: any) {
      alert(error.message || 'Failed to update asset');
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50 py-8 transition-all',
        isDragOver && 'bg-blue-50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Link href="/dashboard/admin/cms" className="hover:text-slate-700">CMS</Link>
                <ChevronRight className="h-4 w-4" />
                <span>Media Library</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
              <p className="mt-2 text-slate-600">
                Upload and manage images, videos, and documents
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFolderModal(true)} className="gap-2">
                <FolderPlus className="h-4 w-4" />
                New Folder
              </Button>
              <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-100 p-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalAssets}</p>
                  <p className="text-xs text-slate-500">Total Assets</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2">
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalImages}</p>
                  <p className="text-xs text-slate-500">Images</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalVideos}</p>
                  <p className="text-xs text-slate-500">Videos</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <Folder className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalFolders}</p>
                  <p className="text-xs text-slate-500">Folders</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-xs text-slate-500">Total Size</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb / Current folder */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant={currentFolderId === null ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCurrentFolderId(null)}
            className="gap-1"
          >
            <FolderOpen className="h-4 w-4" />
            Root
          </Button>
          {currentFolderId && (
            <>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                {folders?.find((f) => f.id === currentFolderId)?.name || 'Folder'}
              </span>
            </>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaAssetType | 'ALL')}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {selectedAssets.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{selectedAssets.length} selected</span>
              <Button variant="outline" size="sm" onClick={handleBulkDelete} className="gap-1 text-red-600">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Folders</h3>
              <div className="space-y-1">
                {folders && folders.length > 0 ? (
                  folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors',
                        currentFolderId === folder.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-slate-50'
                      )}
                      onClick={() => setCurrentFolderId(folder.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span className="text-sm">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {(folder as any)._count?.assets || 0}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id, folder.name);
                          }}
                          className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No folders</p>
                )}
              </div>
            </div>
          </div>

          {/* Assets grid */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAssets.length === assets.length && assets.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">Select all</span>
                  </label>
                </div>
                <span className="text-sm text-slate-500">{totalAssets} assets</span>
              </div>

              {assetsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : assets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className={cn(
                        'group relative rounded-lg border transition-all overflow-hidden',
                        selectedAssets.includes(asset.id)
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleAssetSelection(asset.id)}
                          className="rounded border-slate-300 bg-white/80"
                        />
                      </div>

                      {/* Preview */}
                      <div
                        className="aspect-square bg-slate-100 cursor-pointer"
                        onClick={() => {
                          setEditingAsset(asset);
                          setShowEditAssetModal(true);
                        }}
                      >
                        {asset.type === 'IMAGE' ? (
                          <img
                            src={asset.url}
                            alt={asset.alt || asset.filename}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className={cn('p-4 rounded-full', TYPE_COLORS[asset.type as MediaAssetType])}>
                              {TYPE_ICONS[asset.type as MediaAssetType]}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-sm font-medium text-slate-900 truncate" title={asset.filename}>
                          {asset.filename}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(asset.size)}
                          {asset.width && asset.height && ` - ${asset.width}x${asset.height}`}
                        </p>
                      </div>

                      {/* Actions overlay */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyUrl(asset.url)}
                          className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50"
                          title="Copy URL"
                        >
                          {copiedUrl === asset.url ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setShowEditAssetModal(true);
                          }}
                          className="p-1.5 bg-white rounded-md shadow-sm hover:bg-slate-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id, asset.filename)}
                          className="p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">No media found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {searchQuery || typeFilter !== 'ALL'
                      ? 'Try adjusting your filters'
                      : 'Upload files or drag and drop to get started'}
                  </p>
                  <Button onClick={() => setShowUploadModal(true)} className="mt-4 gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drop zone overlay */}
        {isDragOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
            <div className="rounded-lg bg-white p-8 shadow-xl text-center">
              <Upload className="mx-auto h-16 w-16 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Drop files to upload</h3>
              <p className="mt-2 text-slate-600">Release to upload your files</p>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Upload Files</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  Click to select files or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM), PDFs
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                  }
                }}
              />

              {/* Upload progress */}
              {isUploading && Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress).map(([filename, progress]) => (
                    <div key={filename} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 truncate">{filename}</p>
                        <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{progress}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Create Folder</h3>
                <button onClick={() => setShowFolderModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Asset Modal */}
        {showEditAssetModal && editingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Edit Media</h3>
                <button
                  onClick={() => {
                    setShowEditAssetModal(false);
                    setEditingAsset(null);
                  }}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4 rounded-lg overflow-hidden bg-slate-100">
                {editingAsset.type === 'IMAGE' ? (
                  <img
                    src={editingAsset.url}
                    alt={editingAsset.alt || editingAsset.filename}
                    className="max-h-64 w-full object-contain"
                  />
                ) : editingAsset.type === 'VIDEO' ? (
                  <video
                    src={editingAsset.url}
                    controls
                    className="max-h-64 w-full"
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div className="text-sm text-slate-500">
                  <p><strong>Filename:</strong> {editingAsset.filename}</p>
                  <p><strong>Size:</strong> {formatFileSize(editingAsset.size)}</p>
                  {editingAsset.width && editingAsset.height && (
                    <p><strong>Dimensions:</strong> {editingAsset.width} x {editingAsset.height}</p>
                  )}
                  <p><strong>Type:</strong> {editingAsset.mimeType}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alt Text
                  </label>
                  <Input
                    placeholder="Describe the image for accessibility"
                    value={editingAsset.alt || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, alt: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <Input
                    placeholder="Title attribute"
                    value={editingAsset.title || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    placeholder="Caption or description"
                    value={editingAsset.caption || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, caption: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tags
                  </label>
                  <Input
                    placeholder="Comma-separated tags"
                    value={(editingAsset.tags || []).join(', ')}
                    onChange={(e) =>
                      setEditingAsset({
                        ...editingAsset,
                        tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Input
                    value={editingAsset.url}
                    readOnly
                    className="flex-1 text-xs font-mono bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(editingAsset.url)}
                  >
                    {copiedUrl === editingAsset.url ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditAssetModal(false);
                    setEditingAsset(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateAsset} disabled={updateAssetMutation.isPending}>
                  {updateAssetMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
