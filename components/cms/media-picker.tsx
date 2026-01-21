'use client'

/**
 * Media Picker Component
 * Story 12-6: Media Library
 *
 * Modal component for selecting media from the library.
 * Used by TipTap editor and other components that need to insert media.
 */

import { useState, useCallback, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Upload,
  Folder,
  FolderOpen,
  ChevronRight,
  Loader2,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type MediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (asset: SelectedAsset) => void
  allowedTypes?: MediaAssetType[]
  multiple?: boolean
}

interface SelectedAsset {
  id: string
  url: string
  filename: string
  alt?: string | null
  title?: string | null
  type: MediaAssetType
  width?: number | null
  height?: number | null
}

const TYPE_ICONS: Record<MediaAssetType, React.ReactNode> = {
  IMAGE: <ImageIcon className="h-5 w-5" />,
  VIDEO: <Video className="h-5 w-5" />,
  DOCUMENT: <FileText className="h-5 w-5" />,
}

const TYPE_COLORS: Record<MediaAssetType, string> = {
  IMAGE: 'bg-emerald-100 text-emerald-700',
  VIDEO: 'bg-purple-100 text-purple-700',
  DOCUMENT: 'bg-blue-100 text-blue-700',
}

const TYPE_LABELS: Record<MediaAssetType, string> = {
  IMAGE: 'Images',
  VIDEO: 'Videos',
  DOCUMENT: 'Documents',
}

// File size formatter
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'],
  multiple = false,
}: MediaPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<MediaAssetType | 'ALL'>('ALL')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Queries
  const { data: assetsData, isLoading: assetsLoading, refetch: refetchAssets } = trpc.media.getAssets.useQuery(
    {
      folderId: currentFolderId,
      type: typeFilter === 'ALL' ? undefined : typeFilter,
      search: searchQuery || undefined,
    },
    { enabled: isOpen }
  )

  const { data: folders } = trpc.media.getFolders.useQuery(
    { parentId: currentFolderId, includeAssetCount: true },
    { enabled: isOpen }
  )

  // Mutations
  const getUploadUrlMutation = trpc.media.getUploadUrl.useMutation()
  const createAssetMutation = trpc.media.createAsset.useMutation()

  const assets = (assetsData?.assets || []).filter(
    (asset) => allowedTypes.includes(asset.type as MediaAssetType)
  )

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        // Get presigned URL
        const uploadData = await getUploadUrlMutation.mutateAsync({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          folderId: currentFolderId || undefined,
        })

        setUploadProgress((prev) => ({ ...prev, [file.name]: 30 }))

        // Upload to S3 (or mock in dev)
        if (!uploadData.mockUpload) {
          await fetch(uploadData.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          })
        }

        setUploadProgress((prev) => ({ ...prev, [file.name]: 70 }))

        // Get image dimensions if applicable
        let width: number | undefined
        let height: number | undefined

        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file)
          width = dimensions.width
          height = dimensions.height
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
        })

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)
    setUploadProgress({})
    refetchAssets()
  }, [currentFolderId, getUploadUrlMutation, createAssetMutation, refetchAssets])

  // Get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => resolve({ width: 0, height: 0 })
      img.src = URL.createObjectURL(file)
    })
  }

  // Toggle asset selection
  const toggleAssetSelection = (asset: any) => {
    const selectedAsset: SelectedAsset = {
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      alt: asset.alt,
      title: asset.title,
      type: asset.type,
      width: asset.width,
      height: asset.height,
    }

    if (multiple) {
      setSelectedAssets((prev) => {
        const isSelected = prev.some((a) => a.id === asset.id)
        if (isSelected) {
          return prev.filter((a) => a.id !== asset.id)
        }
        return [...prev, selectedAsset]
      })
    } else {
      setSelectedAssets([selectedAsset])
    }
  }

  // Handle insert
  const handleInsert = () => {
    if (selectedAssets.length === 0) return

    if (multiple) {
      selectedAssets.forEach((asset) => onSelect(asset))
    } else {
      onSelect(selectedAssets[0])
    }

    setSelectedAssets([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-slate-900">Select Media</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[150px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaAssetType | 'ALL')}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            {allowedTypes.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.includes('IMAGE') ? 'image/*' : ''}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files)
              }
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Folders sidebar */}
          <div className="w-48 border-r overflow-y-auto p-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors text-sm',
                currentFolderId === null
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-slate-50'
              )}
              onClick={() => setCurrentFolderId(null)}
            >
              <FolderOpen className="h-4 w-4" />
              Root
            </div>
            {folders?.map((folder) => (
              <div
                key={folder.id}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors text-sm',
                  currentFolderId === folder.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50'
                )}
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <Folder className="h-4 w-4" />
                <span className="truncate flex-1">{folder.name}</span>
                <span className="text-xs text-slate-400">
                  {(folder as any)._count?.assets || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Assets grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isUploading && Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
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
                  </div>
                ))}
              </div>
            )}

            {assetsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {assets.map((asset) => {
                  const isSelected = selectedAssets.some((a) => a.id === asset.id)
                  return (
                    <div
                      key={asset.id}
                      className={cn(
                        'relative rounded-lg border cursor-pointer transition-all overflow-hidden',
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                      onClick={() => toggleAssetSelection(asset)}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10 bg-blue-500 rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {/* Preview */}
                      <div className="aspect-square bg-slate-100">
                        {asset.type === 'IMAGE' ? (
                          <img
                            src={asset.url}
                            alt={asset.alt || asset.filename}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className={cn('p-3 rounded-full', TYPE_COLORS[asset.type as MediaAssetType])}>
                              {TYPE_ICONS[asset.type as MediaAssetType]}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-slate-900 truncate" title={asset.filename}>
                          {asset.filename}
                        </p>
                        <p className="text-xs text-slate-500">{formatFileSize(asset.size)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <ImageIcon className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">No media found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {selectedAssets.length > 0
              ? `${selectedAssets.length} selected`
              : 'Select media to insert'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleInsert} disabled={selectedAssets.length === 0}>
              Insert {selectedAssets.length > 0 && `(${selectedAssets.length})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
