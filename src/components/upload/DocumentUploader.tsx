'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle } from 'lucide-react'

interface DocumentUploaderProps {
  documentType: 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'VEHICLE_DOCUMENT' | 'PROFILE_PICTURE'
  onUploadComplete?: (document: any) => void
  label?: string
  description?: string
  accept?: string
  maxSizeMB?: number
}

export default function DocumentUploader({
  documentType,
  onUploadComplete,
  label,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 15,
}: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please use PDF, JPEG, or PNG.'
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large (max ${maxSizeMB}MB).`
    }
    
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
    setError('')
    setUploaded(false)
  }

  const uploadDocument = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Please sign in to upload documents')
        return
      }

      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('documentType', documentType)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        setUploaded(true)
        
        if (onUploadComplete) {
          onUploadComplete(data.document)
        }

        // Reset after success
        setTimeout(() => {
          setSelectedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }, 2000)
      } else {
        setError(data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setError('')
    setUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getDocumentLabel = () => {
    if (label) return label

    switch (documentType) {
      case 'DRIVING_LICENSE':
        return 'Driving License'
      case 'NATIONAL_ID':
        return 'National ID'
      case 'VEHICLE_DOCUMENT':
        return 'Vehicle Document'
      case 'PROFILE_PICTURE':
        return 'Profile Picture'
      default:
        return 'Document'
    }
  }

  const getDocumentDescription = () => {
    if (description) return description

    switch (documentType) {
      case 'DRIVING_LICENSE':
        return 'Upload a clear photo or scan of your driving license (front and back)'
      case 'NATIONAL_ID':
        return 'Upload a clear photo or scan of your national ID or passport'
      case 'VEHICLE_DOCUMENT':
        return 'Upload vehicle registration, insurance, or inspection certificate'
      default:
        return 'Upload a PDF, JPEG, or PNG file'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          {getDocumentLabel()}
        </label>
        <p className="text-sm text-gray-600">{getDocumentDescription()}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <X className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-all hover:border-yellow-400 hover:bg-gray-50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            
            <p className="text-sm font-medium text-gray-900 mb-1">
              Click to upload
            </p>
            
            <p className="text-xs text-gray-500">
              PDF, JPEG, PNG (max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {uploaded ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              {uploading && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {uploaded && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Uploaded successfully
                </p>
              )}
            </div>
            
            {!uploading && !uploaded && (
              <button
                onClick={clearSelection}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {!uploading && !uploaded && (
            <button
              onClick={uploadDocument}
              className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Your document will be reviewed by our team for verification.
      </p>
    </div>
  )
}
